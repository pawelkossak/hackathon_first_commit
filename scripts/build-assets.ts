import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

interface RuntimeSprite {
  id: string;
  path: string;
  source: string;
  width: number;
  height: number;
  bytes: number;
  category: string;
  loadPolicy: string;
  firstLoad: boolean;
}

interface FirstLoadSet {
  scene: string;
  narratorGender: string;
  playerGender: string;
  assetIds: string[];
  bytes: number;
  limit: number;
  passed: boolean;
  scope?: string;
}

interface FirstLoadManifest {
  format: string;
  sets: FirstLoadSet[];
}

interface AudioManifestLine {
  lineId: string;
  scene: string;
  path: string;
}

interface AudioManifest {
  format: string;
  lines: AudioManifestLine[];
}

/**
 * Narrator folders whose segmented line recordings are published unchanged. Master takes, preview/,
 * trailer*\/ and the json/csv/txt production files are never published.
 */
export const VOICE_NARRATORS: readonly string[] = ["ania", "szef"];

/** A published voice path: `voice/production/<ania|szef>/<line>.mp3`, nothing else. */
const VOICE_PATH = new RegExp(`^voice/production/(${VOICE_NARRATORS.join("|")})/[a-z0-9.-]+\\.mp3$`);

function byMediaPath(a: { mediaPath: string }, b: { mediaPath: string }): number {
  return a.mediaPath < b.mediaPath ? -1 : a.mediaPath > b.mediaPath ? 1 : 0;
}

/**
 * Copies the runtime media from `design/` into `<outDir>/public/media` and writes into `<outDir>/lib/generated/`:
 * - `asset-manifest.json`: the sprite registry, the illustrations, the voice line files and the
 *   first-load budget report;
 * - `tokens.json`: the design tokens the runtime reads.
 * No runtime module imports `design/`. Both files are deterministic (no timestamp, sorted lists), so a
 * rebuild of unchanged sources leaves the committed files byte-identical. Tests pass a temporary
 * `outDir`, so `pnpm test` never rewrites the repository.
 */
export function buildAssets(rootDir = process.cwd(), outDir = rootDir) {
  const designDir = path.join(rootDir, "design");
  const publicMediaDir = path.join(outDir, "public", "media");
  const publicSpritesDir = path.join(publicMediaDir, "sprites");
  const publicIllustrationsDir = path.join(publicMediaDir, "illustrations");
  const libGeneratedDir = path.join(outDir, "lib", "generated");

  // Ensure directories exist
  fs.mkdirSync(publicSpritesDir, { recursive: true });
  fs.mkdirSync(publicIllustrationsDir, { recursive: true });
  fs.mkdirSync(libGeneratedDir, { recursive: true });

  // 1. Process Runtime Sprites
  const spritesContractPath = path.join(designDir, "contracts", "runtime-sprites.json");
  const spritesData: RuntimeSprite[] = JSON.parse(fs.readFileSync(spritesContractPath, "utf8"));

  const copiedSprites: Array<{
    id: string;
    mediaPath: string;
    width: number;
    height: number;
    bytes: number;
    category: string;
  }> = [];

  for (const sprite of spritesData) {
    const srcPath = path.join(designDir, sprite.source);
    const targetRelative = sprite.path.replace(/^runtime-media\//, "");
    const destPath = path.join(publicMediaDir, targetRelative);

    if (fs.existsSync(srcPath)) {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
      const stat = fs.statSync(destPath);
      copiedSprites.push({
        id: sprite.id,
        mediaPath: `/media/${targetRelative}`,
        width: sprite.width,
        height: sprite.height,
        bytes: stat.size,
        category: sprite.category,
      });
    }
  }

  // 2. Process Illustrations (WebP only: the PNG masters stay in design/ and never reach public/media)
  const illustrationsDir = path.join(designDir, "assets", "illustrations");
  const copiedIllustrations: Array<{
    id: string;
    mediaPath: string;
    bytes: number;
  }> = [];

  if (fs.existsSync(illustrationsDir)) {
    const files = fs.readdirSync(illustrationsDir).sort();
    for (const file of files) {
      if (file.endsWith(".webp")) {
        const srcPath = path.join(illustrationsDir, file);
        const destPath = path.join(publicIllustrationsDir, file);
        fs.copyFileSync(srcPath, destPath);
        const stat = fs.statSync(destPath);
        copiedIllustrations.push({
          id: file.replace(/\.[^.]+$/, ""),
          mediaPath: `/media/illustrations/${file}`,
          bytes: stat.size,
        });
      }
    }
  }

  // 3. Voice line recordings: every design/voice/production/<narrator>/*.mp3, copied unchanged. The
  //    audio-manifest names the line ids of each file (it is the source of VOICE_SCRIPTS).
  const voiceDir = path.join(designDir, "voice", "production");
  const audioManifestPath = path.join(voiceDir, "audio-manifest.json");
  const lineIdsByPath = new Map<string, string[]>();
  if (fs.existsSync(audioManifestPath)) {
    const audio: AudioManifest = JSON.parse(fs.readFileSync(audioManifestPath, "utf8"));
    for (const line of audio.lines) {
      const ids = lineIdsByPath.get(line.path) ?? [];
      if (!ids.includes(line.lineId)) ids.push(line.lineId);
      lineIdsByPath.set(line.path, ids);
    }
  }
  const voiceByPath = new Map<string, { mediaPath: string; lineIds: string[]; bytes: number }>();
  for (const narrator of VOICE_NARRATORS) {
    const dir = path.join(voiceDir, narrator);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).sort()) {
      const relative = `voice/production/${narrator}/${file}`;
      if (!VOICE_PATH.test(relative)) continue;
      const destPath = path.join(publicMediaDir, relative);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(path.join(dir, file), destPath);
      voiceByPath.set(relative, {
        mediaPath: `/media/${relative}`,
        lineIds: lineIdsByPath.get(relative) ?? [],
        bytes: fs.statSync(destPath).size,
      });
    }
  }
  const voice = [...voiceByPath.values()]
    .map((v) => ({ mediaPath: v.mediaPath, lineIds: [...v.lineIds].sort(), bytes: v.bytes }))
    .sort(byMediaPath);
  const voiceBytes = voice.reduce((sum, v) => sum + v.bytes, 0);

  // 4. Evaluate First Load Budget (Limit: 1.5 MB = 1,500,000 bytes)
  const firstLoadPath = path.join(designDir, "first-load-manifest.json");
  let firstLoadReport: FirstLoadSet[] = [];
  let budgetPassed = true;

  if (fs.existsSync(firstLoadPath)) {
    const firstLoadData: FirstLoadManifest = JSON.parse(fs.readFileSync(firstLoadPath, "utf8"));
    firstLoadReport = firstLoadData.sets.map((set) => {
      const passed = set.bytes <= set.limit;
      if (!passed) budgetPassed = false;
      return {
        scene: set.scene,
        narratorGender: set.narratorGender,
        playerGender: set.playerGender,
        assetIds: set.assetIds,
        bytes: set.bytes,
        limit: set.limit,
        passed,
      };
    });
  }

  // 5. Output Manifest to lib/generated/asset-manifest.json.
  // Voice files load on demand when a line plays, never on first load: they are reported here next to
  // the first-load sets and are not part of any set's bytes.
  const manifest = {
    format: "asset-manifest/v1",
    budgetLimit: 1500000,
    budgetPassed,
    totalSprites: copiedSprites.length,
    totalIllustrations: copiedIllustrations.length,
    totalVoiceFiles: voice.length,
    voiceBytes,
    voiceLoadPolicy: "on-demand",
    voiceNarrators: [...VOICE_NARRATORS],
    firstLoadReport,
    sprites: copiedSprites,
    illustrations: copiedIllustrations,
    voice,
  };

  const manifestPath = path.join(libGeneratedDir, "asset-manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

  // 6. Design tokens the runtime reads (lib/ui/tokens.ts)
  const tokensSource = JSON.parse(fs.readFileSync(path.join(designDir, "tokens.json"), "utf8"));
  const runtimeTokens = { format: "runtime-tokens/v1", font: tokensSource.font, game: tokensSource.game };
  const tokensPath = path.join(libGeneratedDir, "tokens.json");
  fs.writeFileSync(tokensPath, JSON.stringify(runtimeTokens, null, 2), "utf8");

  console.log(
    `[build-assets] Copied ${copiedSprites.length} sprites, ${copiedIllustrations.length} illustrations and ${voice.length} voice files (${voiceBytes} bytes, on demand) to public/media.`
  );
  console.log(`[build-assets] Generated ${manifestPath} and ${tokensPath}.`);
  console.log(
    `[build-assets] First-load budget: ${budgetPassed ? "PASSED (all sets <= 1.5 MB)" : "FAILED"}`
  );

  return { manifest, tokens: runtimeTokens };
}

// Execute if run directly
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildAssets();
}
