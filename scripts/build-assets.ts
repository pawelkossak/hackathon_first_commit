import fs from "node:fs";
import path from "node:path";

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

export function buildAssets(rootDir = process.cwd()) {
  const designDir = path.join(rootDir, "design");
  const publicMediaDir = path.join(rootDir, "public", "media");
  const publicSpritesDir = path.join(publicMediaDir, "sprites");
  const publicIllustrationsDir = path.join(publicMediaDir, "illustrations");
  const libGeneratedDir = path.join(rootDir, "lib", "generated");

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

  // 2. Process Illustrations
  const illustrationsDir = path.join(designDir, "assets", "illustrations");
  const copiedIllustrations: Array<{
    id: string;
    mediaPath: string;
    bytes: number;
  }> = [];

  if (fs.existsSync(illustrationsDir)) {
    const files = fs.readdirSync(illustrationsDir);
    for (const file of files) {
      if (file.endsWith(".webp") || file.endsWith(".png")) {
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

  // 3. Evaluate First Load Budget (Limit: 1.5 MB = 1,500,000 bytes)
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

  // 4. Output Manifest to lib/generated/asset-manifest.json
  const manifest = {
    format: "asset-manifest/v1",
    buildTime: new Date().toISOString(),
    budgetLimit: 1500000,
    budgetPassed,
    totalSprites: copiedSprites.length,
    totalIllustrations: copiedIllustrations.length,
    firstLoadReport,
    sprites: copiedSprites,
    illustrations: copiedIllustrations,
  };

  const manifestPath = path.join(libGeneratedDir, "asset-manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

  console.log(
    `[build-assets] Copied ${copiedSprites.length} sprites and ${copiedIllustrations.length} illustrations to public/media.`
  );
  console.log(`[build-assets] Generated ${manifestPath}.`);
  console.log(
    `[build-assets] First-load budget: ${budgetPassed ? "PASSED (all sets <= 1.5 MB)" : "FAILED"}`
  );

  return manifest;
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildAssets();
}
