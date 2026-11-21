# U-polish: demo polish of the ui lane (on top of 1fabbb3)

Branch `lane/ui`, worktree `hackaton_ui`. I edited only ui paths: `app/podsumowanie/`, `components/play/`, `lib/ui/`, `lib/generated/`, `scripts/build-assets.ts`, `public/media/` (not `public/sw.js`) and this handoff. Nothing is committed.

## 1. D-14 reminder on stage (G34)
- **New `components/play/LapReminder.tsx`.** It is mounted on `/podsumowanie` only when `core.status === "completed"`. It shows the `reminder.optin` line and a „Przypomnij mi” button (`ui.banner.remind_me`).
- **The button opens the narrative `PushOptIn`** with `targetWeek={state.core.week}`. Nothing is reimplemented: the 30 s delay comes from `lib/reminders/push-config` inside PushOptIn. The dialog opens only on the button, so no modal covers „Zapisz zwycięski plan” (demo step 7).
- **Fallback.** `onDemoTriggered` starts a page timer of the returned delay. When it fires and `Notification.permission` is not `granted`, the summary mounts the narrative `ReturnBanner` („Tydzień 7 z 7 czeka…”). Its „Wróć do gry” button goes to `resumeLink(week)` → `/gra/1?resume=T7`.
- **Tests** in `lib/ui/screens.test.tsx`:
  - the won summary has `lap-reminder` and „Przypomnij mi”, and no open opt-in dialog;
  - a lap that is not completed has no reminder;
  - a source check that PushOptIn gets the engine week and that ReturnBanner and `resumeLink` are used.
- **Real browser** (headless Chromium, so permission is `denied`): „Wyślij próbę (30 s)” → „Próbne przypomnienie przyjdzie za 30 s.” After „Może później” and 31 s, the fallback ReturnBanner appeared on the summary. „Wróć do gry” → `/gra/1?resume=T7`. No page errors.

## 2. No `design/` at runtime
- **`scripts/build-assets.ts` now writes two files into `lib/generated/`:**
  - `asset-manifest.json`: sprites, illustrations, voice files and the budget report;
  - `tokens.json` (`runtime-tokens/v1`): `font` and `game` from `design/tokens.json`.

  Both are deterministic. `buildAssets()` now returns `{ manifest, tokens }`.
- **The modules read the generated files.** `lib/ui/assets.tsx` builds its registry from `lib/generated/asset-manifest.json` `sprites`, which lists only files that were really published. `lib/ui/tokens.ts` reads `lib/generated/tokens.json`.
- **Unknown id → sized Placeholder.** `getAsset(unknown)` now returns `mediaPath: null` (256×256) instead of inventing `/media/<id>.webp`. `GameAsset` draws the `Placeholder` when the id is unknown or when `fallbackToPlaceholder` is set.
- **Tests:**
  - `lib/ui/assets.test.ts` renders with `react-dom/server`: an unknown id gives the Placeholder at 64×64 (or 256 with no size) and no `<img>`; a known id gives the WebP `<img>`; the forced fallback works. A source scan checks that no non-test file in `lib/ui`, `app` or `components` imports `design/`.
  - `lib/ui/asset-pipeline.test.ts` builds into `os.tmpdir()` and checks that both committed generated files equal a fresh build. It writes nothing in the repository.

## 3. Voice files
- **Scope (from the coordinator's instruction).** Every `design/voice/production/ania/*.mp3` and `szef/*.mp3` is copied unchanged to `public/media/voice/production/**`: 79 + 79 files, 14 164 252 bytes. This covers every `VOICE_SCRIPTS` path. Master takes, `preview/`, `trailer*/`, the json/csv/txt files and `design/voice/characters/` are not published. `design/voice/` itself is not edited.
- **The manifest reports** `totalVoiceFiles`, `voiceBytes`, `voiceLoadPolicy: "on-demand"` and one `voice[]` entry per file (path, line ids, bytes).
- **Kept out of the first-load budget.** Audio loads only when a line plays. The budget sets stay unchanged (all ≤ 1.5 MB), and the test asserts that no voice id is in a first-load set.
- **Missing files.** A file that does not exist is skipped. A missing file still ends in the narrative player's captions-only path (`hasAudioFailed`), which is unchanged.
- **Real browser.** `/media/voice/production/ania/intro.owner.mp3` returns 200 (116 653 bytes), and `/start` requests it. The earlier 404 is gone.

## 4. Negotiation in later weeks
- **AdvisorDock is unchanged and is correct.** It mounts `NegotiationDialogue` only while the dialog is open, with the store state at the moment it opened. So every opening is a fresh thread, and the resync covers changes while it is open.
- **Real browser:**
  - week 1: 0/3, then 1/3 after „50% zaliczki?”;
  - after the week is resolved: „Tydzień 2”, the dialog opens at „Wiadomości: 0/3” with only the greeting;
  - „Dam 2% rabatu za szybszą płatność faktury” → `/api/agent` 200 → the skonto line (19 889 zł on 4 grudnia, cost 406 zł) and 1/3. The HUD cost is 406 zł.
- **Test** (`screens.test.tsx`): after the week-1 negotiation the dialog renders 2/3. After `advanceWeek` it is 0/3. An `offer_discount` in week 2 through `engine.negotiate` gives 1/3.

## 5. P2 polish
- **Star labels.** They were already labels through `STAR_STATUS_LABEL` → `label()`. Real-browser text and accessible-name scan of `/`, `/start`, `/mapa`, `/gra/1` (also with the fallback flag), `/podsumowanie`, `/plan`, `/ustawienia`, `/gra/2` and `/konto`, plus the full demo path: no raw `earned`, `pending`, `missed`, `open` or status enum, and no `G..`, `U-..`, `US-..` ids in visible text. The ids left are only in code comments.
- **PNG masters.** Nothing references `public/media/illustrations` (code, `sw.js`, e2e or config). The pipeline now copies WebP only, and the 15 PNG copies (about 37 MB) are deleted. The WebP versions stay. A test asserts that there is no PNG in `public/media/illustrations`.
- **`MISSING_LABELS` is kept**, as the coordinator asked.

## Checks
- `PILOT_AI_OFFLINE=1 pnpm check` is green: typecheck, lint, 418 tests in 44 files, and the build.
- After `pnpm check`, and after running `node scripts/build-assets.ts` again, `git status` shows only the intended changes. The rebuild is byte-identical.
- `PILOT_AI_OFFLINE=1 pnpm e2e`: 5/5 green.
- **Real browser** (`next start -p 3101`, 1440×900):
  - `demo-click.cjs`: demo steps 1–7 pass with the same engine values as round 1, plus the reload, map, resume banner and settings. `ERRORS: none`;
  - the opt-in and week-2 run above: `ERRORS: none`.

  The server is stopped.

## Open / for other lanes
- **Narrative.** `NarratorDialogue` shows the raw emotion enum („Nastrój: Welcoming / Confident”). It is a narrative component, so I left it.
- **Narrative.** Only the intro lines have `audioLineId`. The `rx.*` reactions have no voice script, so the board narrator stays captions-only.
- **Repository size.** The voice files add about 14 MB of mp3 to `public/media/voice` (as the coordinator scoped it). The PNG removal frees about 37 MB.

COMMIT: fix: U-10 U-13 U-14 D-14 reminder opt-in on lap summary with return-banner fallback, runtime tokens and sprite registry from lib/generated, unknown asset ids render Placeholder, voice lines published, WebP-only illustrations
