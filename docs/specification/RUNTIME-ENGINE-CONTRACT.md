---
answers: >-
  Which engine APIs the application must use for gameplay, narration, forecasts, plans and rewind, and their commit boundaries.
excludes: >-
  Application shell and hosting implementation details and external bank integration.
status: current
updated: 2026-11-17
---

# Runtime engine contract

The level 1 engine is framework-independent TypeScript exported through `engine/index.ts`. Level 2 lives separately in `engine/employee.ts`, as specified in `FIRST-EMPLOYEE-SCENARIO.md`. Canonical scenario JSON is in `data/`. Presentation helpers are exported by `narrative/index.ts`. The financial rules remain those of GAME-DESIGN.md and ENGINE-DATA-AND-TESTS.md.

## Application actions

| User action | API | Commit boundary |
| --- | --- | --- |
| Start or reset | `createGame(seed)` / `resetGame(seed)` | New serializable state; caller clears persisted application state on reset. |
| View forecast | `forecast(state)` | Read only; daily transaction decomposition; post-crash points are counterfactual. Includes the scripted future E6 delay. |
| Inspect known ledger only | `forecast(state, {includeFutureEvents:false})` | Read only; E6 applies only if already resolved. |
| Inspect cards | `getAvailableCards(state)` | Disabled reasons are engine owned. |
| Preview card | `previewCard(state, cardId)` | Simulated state only; no live mutation. |
| Play card | `playCard(state, cardId, delegated)` | One action per week, once per lap, invoice exclusivity; does not resolve transactions. |
| Show event | `getCurrentEvent(state)` | E5 condition checks known ledger; no event consumes the optional card action. |
| Choose event response | `resolveEvent(state, choiceId, delegated)` | Returns new state; E6 response is `acknowledge`. |
| Finish week | `resolveWeek(state)` | Rejects unresolved event; settles the week exactly once. Scene G17 displays this result without calling it again. |
| Rewind | `rewind(state, week)` | Restores game snapshot, hand, seed, costs and choices; preserves the separate account clock and saved plans. |
| Save plan | `createPlan(state, cardId)` then `savePlan(state, cardId)` | Persist prospective state successfully before publishing success or awarding Pilot. The pure engine cannot acknowledge browser storage. |
| Replay synthetic account | `advanceAccountClock(state, date)` | Account only; default 5 December. Does not change game week, stars or unlock. |
| Negotiate | `negotiate(state, agent, intent, percent)` | Rules own effects; maximum three messages per agent per week. |
| Request hint | `getCfoHint(state)` | Forecast risk and two cheapest currently valid safe actions. |
| Delegate | `delegateBestCard(state)` | Plays one safe card, delegated competence milestone one. |

State uses week 1–7, status `playing`, `crashed` or `completed`, integer PLN, ISO dates and UTC calendar calculations. Functions return new state and never mutate their inputs. `RuleError` exposes a stable code. Snapshots contain `GameCore`, without recursively nested snapshots. Game saves must retain schemaVersion 1 and both clocks.

## Narration and visual integration

`getCopy(id,state,playerGender,narratorGender,extra)` resolves the live template. Scheduler fields such as deadline, digest counts and demo delay must be supplied by their owning subsystem; missing bindings fail explicitly. Design examples are never used as live values. Four gender combinations are independent.

`getVoiceScript` supplies captions and text. Audio playback resolves exact IDs using the generated media manifests:170 approved narrator clips/312 bindings plus22 additional role clips. Script metadata alone is not the recording-delivery authority; use `design/voice/production/audio-manifest.json` and `design/voice/characters/manifest.json`. `reactionFor` uses exact script ids and portrait ids from the design contracts. `chooseReaction` prioritises crash and success and retains one reaction per resolved week; a scene change cancels the previous active line.

Art integration uses `design/runtime-import-manifest.json`, `design/contracts/scene-asset-bindings.json` and `placement-contract.json`. G13 card art is positioned in horizontal scroll content; G31 comparison uses three separate columns. Guards are declarative predicates against scene state; never run them through eval. A binding marked authoring-reference with guard false is not rendered. APNG is authoring only; prefer animated WebP and choose the static WebP when reduced motion is enabled.
