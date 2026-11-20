# N-round2: QA P1/P2 fixes of the narrative lane

Branch `lane/narrative`, base e3ed869. I edited only narrative paths:
- `narrative/`, `components/narrative/`, `lib/ai/`, `lib/reminders/`;
- `app/api/push/demo/`, `e2e/`;
- `docs/team/handoffs/`.

## 1. Every player-facing sentence goes through `getCopy`
**What changed**
- **New interface copy.** `narrative/copy/seed.ui.ts` holds about 110 keys. Each key is a `[PL, EN]` pair that expands to the 4 variants, and the pairs differ by player or narrator gender where the grammar needs it. The keys are merged into `SEED_COPY` / `SEED_COPY_EN`, so the existing seed tests check them in PL and EN.
- **Converted components.** These no longer contain a literal sentence, label, `aria-label` or `title`:
  - BankAdvisorAndLoanReveal, CfoAdvisor (it now takes gender props), GameSettings;
  - LoaderStates (`messageKey` props replace the free `message` strings);
  - PushOptIn, ReturnBanner, VoicePlayer;
  - NarratorDialogue, CharacterSelect, IntroFlow.
- **Push route and client.** `app/api/push/demo/route.ts` and `lib/reminders/push-client.ts` build the title, body, message and errors from `push.*` keys, in either locale (the body may carry `locale`).
- **Where the numbers come from:**
  - **Reminder settings.** The 30 s delay, the default week 3 and the deep link come from the new `lib/reminders/push-config.ts`. `PushOptIn` takes `targetWeek`, which should be `state.core.week`, and falls back to the config.
  - **Week numbers.** The week total is `gameData.level1.weeks.length`. The route also uses it as its `targetWeek` bound.
  - **AI wait.** The loader shows `AGENT_CLIENT_TIMEOUT_MS`.
  - **ReturnBanner.** It now needs `state` and uses `returnBannerView`, which reads `forecast(state).minimum` for the date and balance. When the minimum is below zero it shows the storm line, otherwise the "lowest balance" line. The literal „Burza 28 grudnia” and „z 7” are gone.
- **Older seed lines.** I converted the lines that spelled numbers out in words or had digits to bindings, in PL and EN:
  - `event.account`, `advance.confirmed`;
  - `event.order`, `event.order.body`, `event.tool`, `event.tool.body`, `event.late.body`;
  - `loan.repayment`, `loan.cost`, `factoring.fee`, `factoring.receipt`, `card.overdraft.body`.
- **New `storyBindings(state, locale)`** in `narrative/story-bindings.ts` fills those bindings from the engine:
  - event and card definitions from `gameData`, through `engine/index.ts`;
  - costs from `getAvailableCards`.

**Tests that prove it**
- `components/narrative/copy-and-a11y.test.ts` scans every `components/narrative/*.tsx`, the push route and push-client. It looks for:
  - JSX text;
  - `aria-label`, `title`, `placeholder` and `alt` literals;
  - any string literal with Polish diacritics.

  A negative control checks that the scanner catches each of these kinds.
- `narrative/story-bindings.test.ts` checks that 18 story keys have no digit and no number word in any variant or locale, and that they resolve with `storyBindings` in PL and EN in all 4 variants. It also checks the values against the engine: 35 700 / 15 000 to 3 XII / 17 400 to 20 I / 304 / 19 991 / C4 and C5 cost.
- `components/narrative/return-banner.test.ts` checks:
  - the week total comes from level1;
  - the storm date and amount equal `forecast().minimum` in 4 variants and in EN;
  - after C1 the line follows the new minimum and no longer says "Burza".
- `lib/reminders/push.test.ts` is unchanged and still passes. The copy text stays "Tydzień 3 czeka".

**Interpretations (please review)**
- **Lines without a data source.** For three numbers there is no data field, so the line now says it without a number instead of making one up:
  - `card.overdraft.body`: "five business days" became "a few business days";
  - `event.tool`: "about eight hours";
  - `event.order`: "6 000 zł netto".
- **New order amount.** `event.order` and `event.order.body` now name the gross client payment (E2-C, 7 380 zł) and its date. The binding `{newOrder.net}` is removed.
- **Settings label.** The GameSettings narrator button now uses the existing `ui.narrator.szefowa` key. In PL it reads „Szefowa” instead of „Szefowa (Ania)”.

## 2. Body text is at least 16 px
**What changed:** `components/narrative/*.tsx` no longer uses `text-xs`, `text-sm` or `text-[11px]`. Body text is `text-base` or larger, and every button keeps `min-h-[44px]`.

**Test:** `copy-and-a11y.test.ts` checks that no file has `text-xs`, `text-sm` or `text-[Npx]` below 16, and that every `<button>` class has `min-h-[44px]`.

## 3. Number guardrail
**What changed**
- `collectEngineNumbers` no longer allows anything by default. The 1–31 range and the constants 11, 12, 1, 2026 and 2027 are gone.
- It now collects only numbers the engine states:
  - the week, balance and overdraft;
  - runway, interest and end balance;
  - every forecast balance and transaction amount;
  - the minimum, low and crash shortfall;
  - every card cost;
  - the day, month and year of each engine date (transactions, crash, minimum, low).
- New `eventNumbers(event)` gives the numbers of one event payload. The negotiation path still uses `NegotiationResult.numbers`.

**Test:** `lib/ai/guardrail.test.ts` checks that:
- 2, 4, 5, 13, 16, 31 and 2025 are not allowed for the demo start;
- "Zapłać 5% do 13 grudnia" is rejected;
- the minimum date's day is allowed;
- **"28" not from the engine is rejected:** "… do 28 grudnia" against the Klient A counter numbers gives unauthorized `[28]`;
- **"30%" not from the engine is rejected:** against the bank offer numbers it gives unauthorized `[30]`;
- the fraud payload allows 35 700 and 23 but rejects 28.

**Remaining limit:** `collectEngineNumbers(createGame)` does allow 30 and 28, because 30 XI and 28 XII are engine transaction dates. A percent is not told apart from a day number. Callers that check percents should use the narrower `result.numbers`.

## 4. NegotiationDialogue resyncs with its `state` prop
**What changed**
- New `components/narrative/negotiation-sync.ts` with `dialogueSync(prop, synced, current)`. It returns one of three values:
  - `none`: the prop did not change;
  - `echo`: the parent passed back the dialogue's own answer, so the thread is kept;
  - `reset`: any other new state (rewind, new week, reset). The local state, greeting, quick replies, played card and input restart from the prop.
- The dialogue applies it during render (React's "adjust state when a prop changes" pattern). A `key` is no longer needed.

**Test:** `return-banner.test.ts` › "NegotiationDialogue resyncs…" covers:
- the echo after `negotiate`;
- a reset after `resolveWeek`;
- a reset after `rewind`.

**Remaining limit:** this is a pure-function test, because the repo has no DOM test library. A reply still in flight when a reset arrives is applied to the new thread.

## 5. N-06 bundle key test
**What changed**
- `e2e/bundle-scan.ts` is a pure scanner. It finds:
  - the variable names of `.env.example`, without `NEXT_PUBLIC_*`, and only the names: no `.env*` file with values is opened, and findings print names only, never values;
  - provider SDK and API host markers (Anthropic, OpenAI, Google GenAI, ElevenLabs, Google TTS);
  - Anthropic, OpenAI and Google key shapes.
- `e2e/bundle-secrets.e2e.ts` is a Playwright test that runs in `pnpm e2e`. Its web server is `next start`, so a build always exists there. It checks that the build exists and that `.next/static` has no findings.
- `e2e/bundle-scan.test.ts` (vitest) has a negative control. It flags an env name, a marker and a fake key, and checks that the output does not echo the key.
- `package.json` is unchanged.

**Remaining limit:** there are no pages yet, so `.next/static` holds only framework chunks. The test gets its real value once the ui lane mounts the narrative components.

## 6. N-07 e2e
- Every `if (isVisible())` escape and the two UI tests that could not assert anything are removed. There is no skipped test or `fixme`.
- I added the step 5 engine assertion: minimum −12 395 → +2 605 on the same date.
- `docs/team/handoffs/N-07.md` is corrected (`.e2e.ts`, port 3001, build first). It lists which demo-path steps are not covered and why: there is no `/gra/1` route on this branch.

## Checks
- `PILOT_AI_OFFLINE=1 pnpm check` is green: typecheck, lint with 0 warnings, 295 tests in 26 files, and the build.
- `PILOT_AI_OFFLINE=1 pnpm e2e`: 5/5 green.

## Still open
- **N-06 AI provider:** a real provider behind `AgentAiProvider`, a response cache and its guardrail on the provider phrasing (the seam is ready, and none is configured).
- **Server-side state trust:** `/api/agent` trusts the state the client posts (it is only shape-checked). A signed or server-held state is still open.
- **UI click path of N-07:** waits for the ui lane's `/gra/1`.
- **Shared data (engine lane):** the C6 title in `data/level1.json` names a real bank („Faktoring ekspresowy mBank”). Under hard rules 2 and 3 it should be checked; it is the engine lane's data.
- **Mounting:** the ui lane must pass `state` to `ReturnBanner` and `targetWeek` to `PushOptIn`, and bind `storyBindings(state)` when it shows story lines.
