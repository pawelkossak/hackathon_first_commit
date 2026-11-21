# N-polish: narrative demo polish (N-03 N-04 N-13)

Branch `lane/narrative`. Only narrative paths edited: `narrative/`, `components/narrative/`, this handoff. Not committed.

## 1. Narrator mood shows a word, not the enum
- **Copy.** There are now 9 copy keys `ui.emotion.<emotion>`, one for each emotion: welcoming, excited, confident, suspicious, proud, exasperated, supportive, delighted and relaxed. Each is in PL and EN, in 4 variants. The Polish adjective agrees with the narrator: „przyjazna/przyjazny”, „podekscytowana/podekscytowany”, „pewna/pewny siebie”, „podejrzliwa/podejrzliwy”, „zirytowana/zirytowany”, „dumna/dumny”, „spokojna/spokojny”, „zachwycona/zachwycony”, „wspierająca/wspierający”.
- **New `narrative/emotions.ts`.** It provides `EMOTIONS` and `isEmotion`, typed `satisfies Record<Emotion, true>`.
- **`NarratorDialogue`.** It renders `ui.narrator_dialogue.mood` with `{emotion}` = `getCopy(ui.emotion.*)`, for example „Nastrój: przyjazna”. An unknown emotion string hides the mood line instead of showing it raw, and the `capitalize` class is gone.
- **Test** `narrative/copy/ui-labels.test.ts`:
  - the emotion list equals the engine `EmotionSchema` and covers `data/reactions.json`;
  - every emotion key is in PL and EN, in 4 variants;
  - the narrator forms differ by gender;
  - the enum never shows raw.

## 2. goodMove after an accepted deal is shown
- **What changed.** `ReactionTracker` now sorts each signal into one of three kinds (`signalKind`):
  - **`resolution`**: week resolution, rewind and lap start. It uses the week's one slot, so the old rule is unchanged.
  - **`inWeek`**: `negotiationOpen`, `goodMove`, and `loanOffered` with `via: "C5_preview"`.
    - It never uses the slot.
    - It replaces the line on screen only if it outranks the week's last line ("a new scene cancels the previous line").
    - Each type speaks at most once per week.
  - **`scene`**: `planValidated`, from the account clock after the lap. It speaks once, even after `lapWon` has used the week-7 slot. Before this change it was silently blocked.
- **Demo result.** The sequence is now lapStart → negotiationOpen (rx.negotiate) → goodMove (rx.goodmove, proud). The week-2 resolution still gets its own reaction.
- **Tests** in `narrative/reactions.test.ts`:
  - the old test "at most one reaction per week" is unchanged and green;
  - a synthetic run of the demo sequence;
  - the same sequence on the real engine (`createGame` → `negotiate` ask 50 → counter → `accept_counter` → `resolveEvent check` → `resolveWeek`);
  - an immediate deal (goodMove beats negotiationOpen);
  - a repeated or weaker in-week signal is blocked;
  - planValidated after lapWon;
  - the signal kinds;
  - reset.
- **UI lane.** Nothing to change. `game-store.ts` already calls `chooseReaction` on every transition.

## 3. Copy keys for the ui lane's interim labels
- **What changed.** All 78 keys of `lib/ui/copy.ts` `MISSING_LABELS` are now in `narrative/copy/seed.ui.ts`, in PL and EN.
  - The PL text is exactly the ui lane's wording.
  - No template has a digit. Numbers arrive only as the existing bindings `{week}`, `{balance}`, `{from}`, `{to}`, `{name}` and `{level}`.
  - None of the labels depends on gender, so each one is the same in all 4 variants.
- **Test** `narrative/copy/ui-labels.test.ts` imports `MISSING_LABELS` and checks that every key:
  - exists in PL and EN, in 4 variants, with no digit;
  - has PL text equal to the interim label;
  - has the same bindings in EN.
- **UI lane.** `label()` now resolves every key from the deck. `MISSING_LABELS` and `fillInterim` can be deleted after the merge. When they are deleted, this test's import must move to a plain key list, or the test can be dropped. `lib/ui/` was not edited.

## 4. Voice 404
- **Cause.**
  - The bindings were already right. All 312 `VOICE_SCRIPTS` entries (78 ids × their variants) point to 158 files, and every one exists: 79 in `design/voice/production/ania/` and 79 in `design/voice/production/szef/`.
  - The 404 happens because nothing publishes them to `public/media/`.
  - A test now checks that every path exists on disk.
- **Fixed on the narrative side:**
  - **`narrative/voice-lines.ts`.** It holds `voiceAudioUrl`, `voiceLineFor` and `voiceSequenceFor`, and is the single source of the `/media/<path>` URL.
    - Audio plays only when the recorded text equals the caption shown. Otherwise the line is captions only.
  - **G05 intro.** The intro showed `intro.owner` + `intro.role` as one caption but bound only `intro.owner`. It now plays both recordings in order: the voice player has a new `audioQueue` (`VoiceLine.audioQueue`).
  - **Board reactions.** `BoardNarrator` passes `rx.*` ids, which had no recordings. `VOICE_ALIASES` now maps six reactions whose text is identical to an existing recording in all 4 variants:

    | Reaction | Recording |
    |---|---|
    | `rx.negotiate` | `advance.joke` |
    | `rx.late` | `client.late.joke` |
    | `rx.loan` | `loan.joke` |
    | `rx.crash` | `failure.joke` |
    | `rx.rewind` | `failure.support` |
    | `rx.quiet` | `week.quiet` |

    The other reactions stay captions only. That includes `rx.goodmove`: its text differs from `move.praise`.
  - **Missing recordings.** Captions always show first. A missing, failed or blocked file sets `hasAudioFailed` and never blocks, including in the middle of a queue.
- **Tests:**
  - `narrative/voice-lines.test.ts`:
    - every path exists, with `/media/` + path and ania/szef per narrator;
    - the G05 sequence in 4 variants;
    - the alias captions equal the recorded text;
    - reactions without a recording get no audio;
    - a caption that differs from the recording gets no audio.
  - `narrative/voice-player.test.ts`: queued playback and a missing queue file, with a stubbed `Audio`.

### What the ui asset pipeline must publish (`scripts/build-assets.ts`, ui lane)
Copy the files unchanged. The public path is `public/media/` + the same path as under `design/`:

| Source | Target | Files |
|---|---|---|
| `design/voice/production/ania/*.mp3` | `public/media/voice/production/ania/*.mp3` | 79, about 6.9 MB |
| `design/voice/production/szef/*.mp3` | `public/media/voice/production/szef/*.mp3` | 79, about 7.1 MB |

- **Examples:**
  - `design/voice/production/ania/intro.owner.mp3` → `/media/voice/production/ania/intro.owner.mp3`;
  - `design/voice/production/szef/intro.role.mp3` → `/media/voice/production/szef/intro.role.mp3`.
- **Minimum for the demo path:** `intro.owner`, `intro.role`, `intro.goal`, `intro.practice`, `advance.joke`, `failure.joke`, `failure.support`, `week.quiet`, `client.late.joke` and `loan.joke`, in both folders.
- **Do not publish:** the `*-master.mp3` takes, `preview/`, `trailer*/`, or the json/csv/txt production files.
- **Not bound yet:** `design/voice/characters/` (client-a, bank-advisor, ai-cfo, player-*) is not bound by the narrative lane, so it does not need publishing for now.
- **Budget.** The audio loads on demand (`new Audio(url)` when a line plays), not on first load.

## Checks
- `PILOT_AI_OFFLINE=1 pnpm check`: green (typecheck, lint, 428 tests in 46 files, build).
- `PILOT_AI_OFFLINE=1 pnpm e2e`: 5/5 green.
- `git status` after both runs shows only narrative-lane files. `lib/generated/asset-manifest.json` was not modified.

## Open
- **No recording for `rx.goodmove`, `rx.welcome`, `rx.project`, `rx.win`, `rx.validated` and `rx.fraud`.** Either record them, or change their copy to the text of an existing line (for example `move.praise`) and add an alias.
- **Voice files for the ui lane.** It must publish them (table above). Until then the demo is captions only, with a 404 in the console.
