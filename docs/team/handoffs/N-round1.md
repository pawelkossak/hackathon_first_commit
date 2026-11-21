# N-round1: QA P0 fixes of the narrative lane (review of a217df6, on top of engine E-01…E-10)

Branch `lane/narrative`, base 30b7684. Only narrative paths were edited.

## Fixed, per QA item

### 1. Typecheck after the merge (`fraudRevealed`)
- `narrative/reactions.ts`: `EVENT_PRIORITY` and `REACTION_CONFIG` are now `as const satisfies Record<EngineEvent["type"], …>`. A new engine event fails `pnpm typecheck` until it is mapped. `fraudRevealed` maps to `exasperated` with `rx.fraud` (priority 80, below crash, lapWon and planValidated).
- `reactionFor` binds the event payload through `eventBindings` (`fraud.amount` = |amount|, `fraud.date`). These are D-18 payload numbers, not literals.
- Proof: `narrative/reactions.test.ts`.
  - The samples are a mapped type over `EngineEvent["type"]`, which gives a compile error if a type is missing.
  - Every one of the 12 types maps to a line.
  - The table equals `gameData.reactions` (data/reactions.json) step by step.
  - `rx.fraud` shows "35 700 zł" and "23 grudnia" in 4 distinct variants.

### 2. Seed copy for every engine line id (N-01)
- `narrative/copy/seed.pl.ts` and `seed.en.ts`, all 4 variants:
  - `rx.fraud` (player and narrator gender differ);
  - `a.advance.accept`, `a.advance.counter`, `a.advance.closed`, `a.discount.accept`, `a.rude`, `a.fallback`;
  - `bank.od.offer`, `bank.od.late`, `bank.od.notneeded`, `bank.fallback`;
  - `card.disabled.<code>` for all 11 `DisabledReasonCode`s.
- The texts follow the recorded character lines (`design/voice/characters/manifest.json`) and the spec texts. No template contains a digit: numbers arrive as bindings (`deal.*`, `fraud.*`).
- `disabledReasonText` (narrative/agent-lines.ts) shows the engine text when there is one, otherwise `card.disabled.<code>`. In EN it always uses the key.
- Proof: `narrative/agent-lines.test.ts`.
  - Every line id of data/agents.json, every `rx.*` prefix of data/reactions.json and every reason code (a `satisfies Record<DisabledReasonCode, true>` list) exist in PL and EN, in 4 variants, with no typed-in digit.

### 3. CfoAdvisor shows only `getCfoHint(state).options`
- New `components/narrative/advisor-views.ts` with `cfoView`. It maps the hint options to the card titles from `getAvailableCards` and keeps the engine cost and order. `CfoAdvisor.tsx` renders only that.
- The delegated competence level comes from `gameData.agents.cfo`.
- Proof: `components/narrative/advisors.test.ts`.
  - T1 gives `[C1 0, C2 406]` with no product and no C3.
  - T5 gives `[C6 304, C5 2400]` (D-17 last resort).
  - The test no longer imports `engine/data`. Everything comes from `engine/index.ts`.

### 4. No hard-coded numbers
- `BankAdvisorAndLoanReveal.tsx` uses `bankAdvisorView`. The C4 limit comes from the preview's `overdraftLimit` and its cost from the `CardView`. Availability and the reason come from the engine (`bank_too_late`), no longer from `week <= 3`. The C5 payout and repayment come from the `previewCard` comparison and its cost from the `CardView`. Card titles come from the engine. The copy keys are `card.overdraft.cost`, `g16.repay`, `g16.cost` and `g16.explanation`.
- `NegotiationDialogue.tsx` no longer has a numeric label, invoice line or percent. The quick replies are copy keys without numbers. The message counter shows `messagesThisWeek` / `maxMessagesPerWeek` from the engine data.
- In `lib/ai`, the copied rules and the allow list are deleted. The classifier has no button labels.
- Proof:
  - `advisors.test.ts` (bank and loan views give 15 000 / 194 / `bank_too_late` / 15 000 → 17 400 on 20 I / 2 400, all from the engine);
  - `agent-lines.test.ts` (bindings).

### 5. Negotiation goes through the engine
- The flow is: `classifyIntent(text, agent)` (E-08 table) → `negotiate(state, agent, intent, percent)` from `engine/index.ts` → `result.lineId` → `agentLineText`. The text is the copy line with bindings from the engine: `previewCard` comparison for the deal inflow, the `CardView` cost, the overdraft limit and `counterPercent`.
- The classifier follows E-08:
  - a missing percent sends no percent, and the engine counters with 30 %;
  - „kredyt” or „pożyczka” to the bank is `unknown`;
  - „OK”, „Zgoda na 30%” is `accept_counter`;
  - a threat is `rude`.
- The number guardrail runs with `result.numbers` as the allowed set, on the cached line and on any provider phrasing.
- The engine applies an accepted deal itself. The dialogue hands `result.state` to `onStateChange`. There is no `onCardUnlocked`, no second `playCard` and no double booking.
- Proof: `lib/ai/agent.test.ts`.
  - 50 % gives counter 30 and the text "Mogę dać 30% — 15 000 zł do 3 grudnia.". Accept plays C1 once: `committedCards` is `[C1]` and the 28 XII low is +2 605.
  - No percent gives the counter. 20 % is accepted directly.
  - Every cached reply's digits are in `result.numbers`.
  - Bank 15 000 / 194. A loan request is `unknown`.
  - A provider phrasing with a foreign number falls back to the cached line.
  - The 4th message is blocked.
  - `not_playing` gives a fallback without quick replies.

### 6. The browser calls only `/api/agent`
- `components/narrative/agent-client.ts` `postAgentTurn` uses fetch to `/api/agent` with an `AbortController` and a 3 s budget. It returns `null` on an error, a timeout or a malformed reply. The dialogue then shows the cached fallback line (`a.fallback` / `bank.fallback`) and the deterministic quick replies.
- `app/api/agent/route.ts`:
  - **Body:** `{ state, agent, message | intent, percent?, playerGender?, narratorGender?, locale? }`. The state is shape-checked (`lib/ai/state.ts`, `isGameState`).
  - **Reply:** `{ ok: true, result (NegotiationResult incl. state), intent, lineId, text, source, quickReplies }`.
  - **Fallback:** `{ ok: false, reason, lineId, text, quickReplies }`. The status is 400 for an invalid body and 409 after the lap.
  - The whole turn runs in `withTimeout` (`lib/ai/provider.ts`), which clears its timer in `finally` and aborts the signal.
- Provider seam: `AgentAiProvider` (`classify`, `phrase`) and `getAgentProvider()`.
  - Round 1 configures no provider.
  - With `PILOT_AI_OFFLINE=1`, `getAgentProvider` returns `undefined` and the service skips the provider.
  - There is no `fetch` and no network call in `lib/ai`.
- Proof:
  - `app/api/agent/route.test.ts` (in-process `POST`: counter then accept with C1 in the returned state; invalid body or state gives a 400 fallback with buttons; a finished lap gives 409; the client returns null on a network error and on the 3 s abort; the client posts only to `/api/agent`);
  - `lib/ai/agent.test.ts` (the offline provider is never called; a slow provider times out and the deterministic classifier decides).
- `e2e/demo-path.e2e.ts` has an updated API case: it posts `createGame("demo")`, gets counter 30, then accept plays C1.

## Checks
- `PILOT_AI_OFFLINE=1 pnpm check` is green: typecheck, lint, 212 tests in 23 files, and the build.
- `pnpm e2e`: 5/5 green.

## Interpretations (please review)
1. **Bank `inform_allow`.** The quick reply "Zapytaj o limit w koncie" sends `ask_overdraft`. When the gap is already closed, the engine still applies C4 (E-08 interpretation 3). The dialogue has no extra confirm step yet.
2. **Quick replies send their intent directly**, with no percent, so there is no classifier pass. This makes them deterministic, and the 30 % counter comes from the engine.
3. **`a.advance.accept`** names the amount and the date but no percent. `counterPercent` is null on accept, and the engine exposes no other source for it.

## Open for round 2 (QA P1)
- **N-06 provider:** a real provider behind `AgentAiProvider`, a response cache, and a real client-bundle key test (scan `.next/static` for key names and values instead of the JSON payload test).
- **Every sentence through `getCopy`:**
  - BankAdvisorAndLoanReveal: headings, the rule note and the button labels are still literals;
  - CfoAdvisor: all sentences;
  - GameSettings, LoaderStates, PushOptIn, VoicePlayer;
  - ReturnBanner: it still has the literal „Burza 28 grudnia”, a date that must come from the forecast;
  - `app/api/push/demo/route.ts`;
  - NegotiationDialogue is done.
- **Older seed lines** (`advance.confirmed`, `event.account`, `loan.repayment`, `loan.cost`…) spell numbers out in words. They should move to bindings.
- **Body text ≥ 16 px** everywhere. NegotiationDialogue now uses `text-base` for body text. The others still have `text-xs` and `text-sm` body text.
- **N-07 e2e** without the `if (isVisible())` escapes, once the ui lane mounts `/gra/1`.
- **Guardrail:** `collectEngineNumbers` still always allows 1–31, 11, 12, 2026 and 2027. The negotiation path no longer uses it (it uses `result.numbers`), but other callers must not.
