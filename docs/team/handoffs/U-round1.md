# U-round1: QA P0 fixes of the ui lane (on top of 870c3d4 = Person B 1ec8e82 + develop 374ea9d)

Branch `lane/ui`, worktree `hackaton_ui`. I edited only ui paths: `app/` (not `app/api/`), `components/` (not `components/narrative/`), `lib/ui/` and this handoff. Round 1 is committed as 8389c28; round 1b (below) sits on top of the merge 92b0de5 (develop 0ff1c75 with narrative round 2).

## Per QA item

### 1. `/gra/1` crash, React #185
- **Cause.** Inline selectors such as `useGameStore((s) => s.getForecast())`, `s.getAvailableCards()` and `s.getCurrentEvent()` returned a new object on every snapshot. React kept re-rendering until it hit the maximum update depth.
- **Fix.** New `lib/ui/game-views.ts`:
  - `forecastOf`, `cardsOf` and `currentEventOf` cache the engine result per `GameState` object in a WeakMap.
  - `selectForecast`, `selectCards` and `selectCurrentEvent` are the store selectors built on those caches.
  - Every component now selects either a plain field or one of these selectors. The store getters `getForecast`, `getAvailableCards` and `getCurrentEvent` use the same caches, so they are stable too.
- **Hydration.** The store now always starts from `createGame("demo")`, so the server render and the first client render match. `ClientBoot`, mounted in the layout, then loads the saved state and settings. Pages show `InitialLoader` until `hydrated` is true. A saved state with a different `schemaVersion` is ignored.
- **Tests** in `lib/ui/screens.test.tsx`. No DOM test package is installed, so these use `react-dom/server`:
  - **Selector stability.** The selectors and getters return the same object while the state is unchanged, and a new one after a change. This is the condition React #185 breaks.
  - **Source guard.** Every `useGameStore(...)` call in the ui lane must be `(s) => s.field…` or a `select*` function. The old `s.getForecast()` pattern fails this test.
  - **Render tests.** The real pages are rendered at every demo step (details under item 6). Zustand is mocked so that the server snapshot reads the live state. A render error inside `Suspense` is turned into a test failure.
- **Real browser.** I ran `pnpm build && next start -p 3101` and a temporary Playwright script, which is not committed, at 1440×900. `/gra/1` and `/gra/1?fallback=1` render, C1 is playable and every week resolves. There were no page errors. The one console 404 is `/media/voice/production/ania/intro.owner.mp3`; the voice file is missing and the captions are shown instead (narrative lane).

### 2. Narrative components mounted, copy through `getCopy`
- **`/start`** mounts `IntroFlow`, which contains `CharacterSelect`, plus `VoicePlayer`. On completion the genders go to `narrative/settings-store` and the page goes to `/mapa`. The old reimplementation is deleted.
- **`/gra/1`**:
  - **Advisors.** `AdvisorDock` opens three dialogs:
    - `NegotiationDialogue` for `klient_a`. It is mounted per opening with `key` `negotiation-klient_a-week-N`, it goes through `/api/agent`, and `onStateChange` passes `result.state` to the new `applyEngineState`.
    - `CfoAdvisor`. Its card choice opens the card preview; delegating calls `delegateBestCard`.
    - `BankAdvisorAndLoanReveal`. Its card choice also opens the card preview.
  - **Narrator.** `BoardNarrator` shows `NarratorDialogue` for the store's `reaction`, and `VoicePlayer` shows the captions. The store picks the reaction with `narrative`'s `ReactionTracker` (one per week) on every engine transition. After a week resolution with no new reaction, the old one is cleared. A rewind or reset resets the tracker.
  - **Return banner.** `ReturnBanner` replaces the page's own banner with the hard-coded „Tydzień 3”. It is shown for `?resume=…`, and its `initialWeek` is the engine week, not the number in the URL.
- **`/ustawienia`** mounts `GameSettings`. The ui-owned fallback toggle and the reset (with the `reset.confirm` copy) stay.
- **Copy.** Every sentence goes through `getCopy`, via `lib/ui/copy.ts` `useCopy()` with the genders from the settings store. Short labels with no copy key go through `label(key)`: it asks `getCopy` for the wanted key first and otherwise shows an interim label from `MISSING_LABELS`, the one list there is. A key the narrative lane adds takes over with no UI change. The list is below.

### 3. Numbers only from the engine
- **WorldRoute / WeekCardList:**
  - week dates and markers come from `gameData.level1`;
  - the finish date is `forecast.to`;
  - the storm is the minimum of `forecast.baseline`, shown with `g10.storm`. Once a card is committed, the value it has today is `vsBaseline.days[date].after`;
  - nothing is tied to „week 6”, „28 XII” or „10 I” any more.
- **The page's storm warning** is `forecast.crash` with `g15.risk`.
- **EventCard:**
  - the title and labels come from `getCurrentEvent`. Where the engine label is null, the label comes from the copy keys below;
  - the E1 body is `g11.body`, where `supplier.amount` is the L08 amount from `forecast.tasks`. L08 is the ledger row of the E1 `reveal` effect;
  - what each choice books comes from the `gameData` event effects;
  - the competence after a choice comes from `core.competences`, for example „Bezpieczne płatności: poziom 2”;
  - all the invented amounts (12 000 / 20 000 / 15 000 / −3 600) and the Polish body texts are deleted.
- **Fraud banner:**
  - it is shown only from the `fraudRevealed` event of `resolveWeek`, kept in the store as `fraudNotice` until it is closed, rewound or reset;
  - its text is `reactionFor(event)`, which is `rx.fraud` with the payload amount and date;
  - the rewind target is the week the engine recorded for the `pay_as_is` decision (`eventsResolved`), offered only when a snapshot exists.
- **CashFlowPanel.** The day in focus (by default the baseline storm day) shows the `vsBaseline` comparison, or the `previewCard` comparison when a card is previewed: before, after and delta. It also shows the day's transactions, the `added`/`removed` transactions, and the „Zadania” statuses as labels.
- **WeekResolutionModal.** The lessons are copy keys `g17.lesson`, `week.report.2…6` and `success.pending`. The invented „40%” is deleted.
- **FailureAndRewindModal:**
  - the Szefowa line is `reactionFor(crash)`, which gives `rx.crash` and `rx.rewind`;
  - the cause is `g19.cause`, with the rejected transaction from `forecast.tasks`;
  - the rewind weeks are the engine's `snapshots` keys.
- **`/plan`:**
  - the card is taken from the won lap: the played cards that `createPlan` accepts;
  - the text is `g22.plan`, filled from `createPlan(state, cardId)`;
  - the clock target is `gameData.futureScript.accountClock.defaultTarget`;
  - after the clock moves, the page shows the engine's plan status (met → `g23.received`, missed → `g23.missed`, ask → `plan.ask`, open → `plan.open`), `account.matchedTx`, `account.balance` and the card's competence level. There is no fixed success message;
  - a lap that is not won gets „no plan” and no success message;
  - the confirmation says „Gwiazdka Pilot zdobyta” only when `stars.pilot === "earned"`.
- **`/podsumowanie`** uses only `core`: `balance`, `lowestBalance`, `costOfMoney`, `avoidedCost` (the `2400 − cost` fallback is deleted) and the stars from `gameData.level1.stars`. If the lap is not completed, the page says so.

### 4. U-18 reverted
- `lib/ui/level2-store.ts` and `components/play/level2.test.ts` are deleted.
- `/gra/2` is a static placeholder with no game logic.
- The map shows the engine's `level2Unlocked` state on island 2 but has no link to `/gra/2` until E-11.

### 5. One dialog on a crash
- `WeekResolutionModal` does not render when `lastResolution.crash` is set or the status is `crashed`.
- `BoardNarrator` is hidden while the lap is crashed.
- Test: the crashed `/gra/1` has exactly one `role="dialog"`, which is G19 with 22 grudnia and 8 095 zł.

### 6. Summary and plan flow
- After the week 7 resolution, the modal button „Podsumowanie okrążenia” goes to `/podsumowanie`. The board also shows a link to it.
- `/podsumowanie` links to `/plan`.
- The state is the same store, persisted in `localStorage`, so it survives client navigation and a reload.
- Render tests in `screens.test.tsx` cover:
  - start;
  - fallback;
  - after the negotiation;
  - Cash Flow 28 XII;
  - the crash;
  - the fraud path (C1 + `pay_as_is`: banner after T5, 35 700 zł, rewind to week 1);
  - the summary;
  - the plan (save → clock → met);
  - a lap that is not won;
  - the intro, map, settings and level-2 screens.

## Checks
- `PILOT_AI_OFFLINE=1 pnpm check` is green: typecheck, lint, 267 tests in 40 files, and the build.
- `PILOT_AI_OFFLINE=1 pnpm e2e`: 5/5 green in the last three runs. One earlier run failed the N-07 layout case because „Dane syntetyczne” matched both the header and the footer; the notice now appears once, in the header. Narrative round 2 (7f0416b) removed the `isVisible` escapes from the e2e cases, so nothing is open there.

## Demo-path click-through (real browser, `next start`, 1440×900, `PILOT_AI_OFFLINE=1`)
| Step | What I saw (engine values) |
|---|---|
| 1 | `/start`: Szefowa intro (`intro.owner` + `intro.role`). „Pomiń intro” → `/mapa`: „Przetrwaj grudzień” active, stars „W grze”, levels 2–4 in fog. „Lecimy” → `/gra/1`. |
| 2 | HUD: Tydzień 1, 38 000 zł, Runway 42 dni, Relacje 5/5, cost 0 zł. Storm marker „Turbulencje 28 grudnia: -12 395 zł”. Fallback list: same value. |
| 3 | E1 „Nowy numer konta podwykonawcy”, „Faktura na 35 700 zł …”, buttons „Sprawdź na białej liście i zadzwoń” / „Zapłać jak jest”. After check: „Bezpieczne płatności: poziom 2”. |
| 4 | Negotiation: „50% zaliczki?” → „Mogę dać 30% — 15 000 zł do 3 grudnia.” → „Przyjmij kontrofertę” → „Ustalone. Zaliczka 15 000 zł wpłynie do 3 grudnia.” Card C1 then shows „Już zagrana w tym okrążeniu”. Narrator: `rx.negotiate`. |
| 5 | Storm marker → Cash Flow, day 28 XII: Bez działania -12 395 zł, Po zatwierdzeniu 2605 zł, Różnica +15 000 zł. Day: opening 6905, VAT za listopad -4300. Added: 3 XII Zaliczka 30% projekt rebranding +15 000 zł. |
| 6 | Week ends 33 700 · 56 080 · 40 380 · 46 705 · 6905 · 9985 · 9985 (E2 decline, E3 january, E6 acknowledge). After T7 → `/podsumowanie`: 9985 zł, low 2605 zł on 28 grudnia, cost 0 zł, „Unikasz 2400 zł…”, ★ Przetrwanie, ★ Tanio, ☆ Pilot „czeka na zapis planu”. |
| 7 | `/plan`: „Zaliczka 15 000 zł ±10% od Klienta A do 4 grudnia.” → save → „Plan zapisany. Gwiazdka Pilot zdobyta.” Clock 21 XI → 5 XII → „Zaliczka dotarła! Luka 28 grudnia zamknięta.” Account 56 080 zł. Matched: 25 XI VAT -4300, 30 XI Klient C +7380, 3 XII +15 000. „Luka płynnościowa: poziom 3”, then `reaction.close`. After a reload the summary shows ★★★. The map shows level 2 „Odblokowany” with „Wkrótce” and no link. |

These numbers match the E-10 demo table.

## For the narrative lane: missing copy keys
- **Labels.** The UI currently shows the interim text from `lib/ui/copy.ts` `MISSING_LABELS`. Please add these keys in 4 variants:
  - **HUD and navigation:** `ui.hud.relations`, `ui.hud.cost_of_money`, `ui.hud.resilience`, `ui.common.synthetic`, `ui.nav.summary`, `ui.nav.plan`, `ui.nav.settings`, `ui.nav.reset`, `ui.nav.reset_confirm`;
  - **Route:** `ui.route.view_list`, `ui.route.view_map`, `ui.route.plane`, `ui.route.finish`;
  - **Cards and preview:** `ui.card.cost_free`, `ui.card.product`, `ui.card.window`, `ui.preview.title`;
  - **Cash Flow:** `ui.cashflow.before`, `.after`, `.preview`, `.delta`, `.day`, `.opening`, `.inflow`, `.outflow`, `.balance`, `.added`, `.removed`, `.tasks`, `.chart`, `.counterfactual`;
  - **„Zadania” statuses:** `ui.task.booked`, `.upcoming`, `.rejected`, `.stopped`;
  - **Week resolution:** `ui.week.transactions`, `ui.week.end_balance`, `ui.week.to_summary`;
  - **Event choices:** `ui.event.choice.accept`, `.decline`, `.now`, `.january`, `.show_cost`, `.ignore`, `.acknowledge`. The engine label is null for every one except accept;
  - **Fraud, failure, rewind:** `ui.fraud.title`, `ui.fraud.rewind` {week}, `ui.failure.shortfall`, `ui.failure.date`, `ui.rewind.week` {week}, `ui.rewind.start_balance` {balance};
  - **Summary and stars:** `ui.summary.end_balance`, `.low`, `.stars`, `.not_completed`, `.back_to_game`, `ui.star.earned`, `.pending`, `.missed`, `.open`;
  - **Plan:** `ui.plan.choose_card`, `.advance_clock` {from,to}, `.clock`, `.account_balance`, `.matched`, `.competence` {name,level}, `.status`, `.not_allowed`;
  - **Map, home, settings, rotate:** `ui.map.level` {level}, `.locked`, `.unlocked`, `.coming`, `.fly`, `ui.level2.title`, `ui.home.start`, `ui.settings.reset_game`, `ui.settings.fallback`, `ui.rotate.title`.
- **Event bodies without spelled-out numbers.** E2 and E3 bodies with bindings from the event effects (`event.order.body` needs a net amount the engine does not expose; `event.tool.body` needs hours that are not in the data). For now E2 shows `rx.project` plus the booked effects, and E3 shows only the title and its effect. `event.late.body` has a typed-in „8 na 22 stycznia”; the UI uses `event.late` instead.
- **ReturnBanner** still has „Burza 28 grudnia” and literal sentences (N-round1 already lists this).
- **Voice file** `/media/voice/production/ania/intro.owner.mp3` returns 404, so captions-only is used.
- **Reaction choice.** The counter message emits `negotiationOpen` and uses up the week-1 reaction, so the `goodMove` of the accept is never shown. Please check whether that is the intended ReactionTracker behaviour.

## Interpretations (please review)
1. The route storm marker uses `forecast.baseline.minimum` (the storm „Bez działania”), the value that `g10.storm`'s `forecast.baselineLow` names. It shows the committed value at that day next to it. `forecast.minimum` is −12 395 at the start, the same as the baseline minimum; after C1 the marker still lets the presenter open 28 XII (step 5).
2. Choosing a card in CFO or Bank opens the card preview, and the player then confirms it. The advisors never play a card directly; only delegation does (`delegateBestCard`).
3. The ReturnBanner's `initialWeek` is the engine week, not the week in the `?resume=` URL.

## Round 2
- `design/` at runtime: `lib/ui/assets.tsx:3` (`design/contracts/runtime-sprites.json`) and `lib/ui/tokens.ts:1` → read from `lib/generated/` instead.
- An unknown asset id → `Placeholder`. Today `getAsset` invents a `/media/<id>.webp` path; `sprite.boss.male.*` may not exist.
- ~~The asset test must not write files~~ — done in round 1b.
- ~~Body text ≥ 16 px and 44 px targets~~ — done in round 1b for the ui lane; narrative round 2 did its own components.
- P2:
  - star statuses on the map now show labels; check that no enum value is shown raw anywhere else;
  - task ids are removed from screen text („(G10)”, „(U-11)”, „US-08”…); check the remaining pages;
  - PNG masters in `public/media` → WebP only within the first-load budget.
- A browser e2e of demo steps 1–7, owned by the narrative lane, `e2e/`. My temporary script (not committed) can serve as a template: it clicks `data-testid` `campaign-start-level-1`, `event-choice-*`, `open-negotiation`, `route-storm-badge`, `advance-week-button`, `close-resolution-modal-button`, `goto-plan-button`, `save-plan-button` and `advance-account-clock-button`.

## Round 1b: merge fixes after narrative round 2
- **Typecheck after the merge.** `InitialLoader` takes `messageKey="loader.start"` (plus the genders) in `/gra/1`, `/plan` and `/podsumowanie`. `ReturnBanner` gets `state` from the store. `AdvisorDock` drops the `key` on `NegotiationDialogue` (it resyncs itself) and passes `playerGender`/`narratorGender` to `CfoAdvisor`.
- **Body text ≥ 16 px.** Every `text-xs`, `text-sm` and `text-[10px]` in `app/` (without `app/api/`), `components/play`, `components/scenes` and `components/ui` is now `text-base` (Card, Hud, WeekResolutionModal, EventCard, CardHand, CashFlowPanel, WorldRoute, WeekCardList, AppHeader, Placeholder, the skip link). The Cash Flow chart axis labels are `fontSize="20"` in a 900-wide viewBox with `min-w-[720px]`, so they never render below 16 px.
- **44 px targets.** Every `<button>`, `<Link>` and `<a>` in those folders has `min-h-[44px]`; the skip link gets it on focus.
- **Test** `components/ui/text-and-targets.test.ts` scans those folders for small text (classes and SVG `fontSize`) and for buttons/links without a 44 px minimum height, with negative controls.
- **Asset pipeline without side effects.** `buildAssets(rootDir, outDir = rootDir)` writes into `outDir`; the manifest has no `buildTime` and a sorted illustration list, so it is deterministic. `lib/ui/asset-pipeline.test.ts` builds into `os.tmpdir()` and checks that the committed manifest equals a fresh build. The committed manifest was regenerated once with `node scripts/build-assets.ts` (only the `buildTime` line went away). `pnpm check` leaves `lib/generated/` and `public/media/` unchanged.
- **Open.** The Cash Flow chart points (`<g role="button">`) have an 18 px hit circle; the points are about 17 px apart, so a larger circle would overlap. The day list under the chart is the full-size alternative.

COMMIT: fix: U-01 U-04 U-05 U-06 U-07 U-08 U-09 U-10 U-18 stable store selectors, narrative screens mounted, copy and numbers from engine, one crash dialog, demo path to summary and plan
