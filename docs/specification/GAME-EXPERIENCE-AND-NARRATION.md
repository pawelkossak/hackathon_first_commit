---
answers: >-
  The complete D-05/D-08 illustrated game journey, all user-agreed narrative and humour requirements, player/narrator selection, emotional reactions, loaders, accessibility and the ElevenLabs voice integration design.
excludes: >-
  Application code before the hackathon, live authentication, provisioned ElevenLabs credentials or selected voice IDs, bank integration and new financial mechanics.
status: current
updated: 2026-11-16
---

# Game experience — the Boss, the adventure and the voice

## 1. Binding direction and sources

The product owner rejected the original financial-app-looking mockups. The approved reference is the colourful illustrated flight adventure over studio islands, with expressive characters, tactile choices, clouds, a paper-plane route and warm humour (D-05). The complete-screen request extends this into the whole journey (D-08). This document takes precedence over the earlier dashboard-oriented composition in GAME-UI-DESIGN.md. That document's financial arithmetic, accessibility principles and semantic tokens remain usable; its flat dashboard layout is no longer the visual target.

The product remains Pilot Płynności. It is an interactive game about running a company, not a dashboard, quiz, course or bank-product catalogue. Financial education emerges from decisions, conversations and consequences. The world and characters dominate; figures appear where they explain stakes or outcomes.

## 2. Visual and narrative identity

Style: joyful, polished 2.5D illustrated strategy adventure for adult entrepreneurs. Floating studio islands and calendar checkpoints give a readable journey. Mint paper plane = player location. Purple turbulence = forthcoming financial pressure. Sunny studio = recovery/progress. Teal, coral, lilac and golden yellow make scenes appealing; cream dialogue panels keep text readable.

The Boss is a recurrent character, not a disembodied notification. Reference identity: wavy dark hair, aviator goggles, brown jacket, coral scarf, expressive face. Female narrator has equally strong character design, equivalent role and matching world cues. Player is a distinct character; do not confuse the narrator with the player's avatar. The boss narrator introduces missions, frames choices, reacts to consequences and closes the learning loop. AI-CFO is a separate helper/capability, even when the narrator presents its advice.

Keep adult humour: awkward payment conversations, invoices, coffee, the office cat, dramatic calculator ribbons and delayed transfers. Never ridicule gender, age, financial literacy or the player. Avoid an unrelated parade of mascots; the Boss, team, client and small copilot belong to one world.

## 3. Player and narrator selection

Before first mission, offer two independent choices:

| Choice | Options | Affects | Does not affect |
|---|---|---|---|
| Your character | Woman / man | Avatar, pronouns and grammatical inflections addressing player | Financial rules, abilities, score, difficulty |
| Your guide | Szefowa / Szef | Narrator portrait, nameplate, spoken voice, inflections and animation poses | Advice quality, authority, mechanics, rewards |

Both may be changed later in Settings without resetting progress. The screen can be skipped with a clearly shown default; do not infer gender from name, account or voice. No real name/photo is necessary. Store avatar and narrator as separate settings; the voice ID follows narrator choice, not player gender.

Visible copy: “Kto prowadzi tę firmę?”, “Twoja postać”, “Twój przewodnik”, “Możesz zmienić później”, “Gramy!”. All four player/narrator combinations must work in text and audio. Keep gender-neutral UI labels wherever natural; author explicit Polish variants when needed.

## 4. Short introductory story

Intro is four concise beats; skip and replay are always available. Narration starts only after an explicit sound/start interaction. Captions remain available independently of sound.

1. **Meet the Boss.** “Witaj na pokładzie! Mamy klientów, świetny zespół i kawę na trzy dni. Z pieniędzmi bywa różnie.”
2. **Choose player and narrator.** The selection screen above; an optional short voice preview helps choose the guide.
3. **Understand the goal.** “Twoje zadanie? Przeprowadzić firmę przez grudzień, zanim faktury zaczną gryźć. Pilnuj płatności, dogaduj się z ludźmi i zostaw firmie trochę oddechu.”
4. **Learn through a first choice.** “W każdym tygodniu spotka Cię nowe zdarzenie. Wybierz manewr, sprawdź skutki i leć dalej. A jeśli coś pójdzie źle? Tu możesz cofnąć czas. Księgowa jeszcze o niczym nie wie.”

End with an actionable first event, not another tutorial slide. One decision at a time. Labels “Pomiń intro”, “Wstecz”, “Dalej”, “Moja pierwsza decyzja”, “Posłuchaj ponownie”. Never require hearing the instructions to progress. Duration target is a short optional introduction, approximately 30–45 seconds; confirm against actual recordings rather than presenting a fabricated playback time.

## 5. Emotional Boss reactions

Emotion is driven by an engine event, not an LLM's impression of the player. Reactions are short, contextual and rate-limited. Story dialogue can follow; do not interrupt a decision with multiple overlapping comments.

| Trigger | Expression / pose | Example Polish line | Follow-up |
|---|---|---|---|
| New lucrative project | Excited, waving brief | “Duży klient! Duży projekt! Pieniądze… kiedyś.” | Explain payment timing |
| Discuss advance | Confident, inviting gesture | “Podobno o pieniądzach się nie rozmawia. Na szczęście prowadzimy firmę.” | Open negotiation |
| Late payment | Raised eyebrow, looking at calendar | “Klient zapewnia, że przelew już wyszedł. Chyba pieszo.” | Show actual revised date |
| Risky costly loan | Suspicious, calculator in hand | “Szybko to ja robię kawę. Sprawdźmy koszt.” | Show complete repayment/cost |
| Correct self-directed move | Proud smile, approving nod | “Dobry manewr. Firma ma oddech, a ja odzyskuję sen.” | State confirmed consequence |
| Several missed warnings / rejected payment | Brief visibly angry/exasperated expression, comic paper ribbon | “Mieliśmy negocjować termin, nie własną upadłość!” | Immediately: “To próba. Cofnijmy się i spróbujmy inaczej.” |
| Successful lap | Delighted, high-five / team toast | “Grudzień dowieziony. Kawa smakuje jakoś lepiej.” | Stars with honest conditions |
| Quiet week | Relaxed, cat on desk | “Nic nie wybuchło. W biznesie to też jest wiadomość.” | Allow continue |
| Player returns | Welcoming, coffee gesture | “Firma czeka. Kawa też.” | Resume saved position |

Anger is a theatrical reaction to the situation, not sustained abuse: no shouting, threats, blame, insults, loss of access or punishment for asking for help. Use the same emotional range for Szef and Szefowa, without stereotypes. Reduced-motion removes animated gestures but retains portraits/captions. An optional setting may reduce narrator remarks; critical financial explanations persist as text.

An engine event can trigger a 2–4-second portrait/bubble in a corner; it must not cover cards, chart annotations or the primary action. Full dialogue scenes pause progression explicitly. Close/skip/replay always visible when meaningful. Cancel an old speech line when a new scene starts, rather than letting jokes queue across contexts.

## 6. The 32-view concept inventory

Eight image sheets, four numbered scenes per sheet. They are high-level illustrated visual concepts, not a substitute for engine-tested pixel-accurate UI or a working application.

| ID | Screen/state | Sheet | Main action |
|---|---|---|---|
| G01 | Login, with guest entry | 01 | Enter / play without account |
| G02 | Create account concept | 01 | Create account |
| G03 | Password recovery concept | 01 | Request reset link |
| G04 | Logout confirmation | 01 | Logout after save / keep playing |
| G05 | Welcome story / meet Boss | 02 | Continue or skip intro |
| G06 | Independent player and narrator selection | 02 | Confirm both choices |
| G07 | Story goal / mission invitation | 02 | Accept challenge |
| G08 | How to play / safe practice | 02 | First decision |
| G09 | Campaign map / locked future levels | 03 | Begin or resume mission |
| G10 | Active game-world route | 03 | Choose manoeuvre |
| G11 | Changed-account event | 03 | Check/call or risky choice |
| G12 | Playful cash-flow forecast | 03 | Compare baseline and preview |
| G13 | Five action cards / selected preview | 04 | Confirm one action |
| G14 | Negotiate with Client A | 04 | Accept counter-offer or ask |
| G15 | Hint / delegated decision | 04 | Self-directed or delegate |
| G16 | Non-bank SMS / full loan-cost reveal | 04 | Inspect cost / choose alternatives |
| G17 | Week resolution | 05 | Next week |
| G18 | Successful lap with pending Pilot star | 05 | Save winning plan |
| G19 | Failed payment / supportive defeat | 05 | See cause / rewind |
| G20 | Rewind week selector | 05 | Restore a previous week |
| G21 | Achievements and competence shelf | 06 | Inspect reason / return to map |
| G22 | Saved plan and earned Pilot star | 06 | Replay synthetic account clock |
| G23 | Validated plan / competence upgrade | 06 | Next level / inspect plan |
| G24 | Pause / character, sound and accessibility settings | 06 | Resume / logout |
| G25 | Initial load | 07 | Wait / access sound control |
| G26 | Between-week transition | 07 | Progress after confirmed result |
| G27 | Waiting for AI reply / audio | 07 | Read onward without voice |
| G28 | Offline / unconfirmed save | 07 | Retry save / stay in game |
| G29 | Factoring card proposed by Alan | 08 | Inspect fee / effect |
| G30 | Cash Flow opened from route node | 08 | Inspect dated balances and transactions |
| G31 | Compare advance, discount and factoring | 08 | Compare cost, timing and availability |
| G32 | Factoring preview plus Cash Flow shortcut | 08 | Confirm card only after rule validation |

Desktop and mobile landscape are the approved targets (the product owner, 2026-11-16). Use the responsive landscape contract in §17. Earlier 375 px portrait recommendations are superseded for the primary phone experience. The eight boards describe the whole journey in landscape; dedicated viewport-specific high-fidelity exports remain a refinement, not silently claimed as delivered by these concept sheets.

### Account states and hackathon scope

The user requested login/logout views, so these are part of the **design**. They do not revoke D-01 or automatically add a production authentication backend. The hackathon remains guest-playable, without login as a prerequisite. Product authentication can be implemented later or explicitly prioritised during the build.

G01 includes invalid credentials and busy state. G02 includes validation and existing-email handling. G03 uses a neutral response independent of whether an address exists. G04 confirms last successful save; if save is unconfirmed, offer retry/stay rather than promising persistence. No deletion on logout by default; demo reset is a separately labelled operation. Future cloud sync and current local-only save must be labelled honestly.

## 7. Humorous charts that still tell the truth

G12 uses a chart as a game-world prop: a weather radar / route forecast with a storm below zero, not a row of banking KPI panels. Title “Prognoza: będzie bujać”; Boss comment “To nie rollercoaster. To nasze przelewy.”

The x-axis is dates, y-axis is zł, zero is explicit, grey solid baseline differs from dashed mint preview, and legend names both. Labels show exact minimum “28 XII: −12 395 zł” and post-advance “+2 605 zł”. Decorative clouds never distort the line, axes or scale. Tap/focus opens source transactions; a text summary/table gives equivalent access. No invented percentages, fake volatility or random line motion for excitement. Counterfactual baseline is labelled even if the live game already failed.

## 8. Success, failure and achievements

**Success:** team celebration, satisfied narrator, warm world lighting. No casino-style money rain. An advance path earns Przetrwanie and Tanio at lap end, with Pilot outlined/pending until saving the plan. Avoided cost 2 400 zł is a synthetic comparison, not money deposited into the account. After save the third star lights up. Level 2 unlocks at successful lap completion; validation later upgrades competence, not a second unlock.

**Failure:** the plane lands safely in a cloud; it is a failed payment, not a destroyed company. Show exact cause/date/shortfall: 22 XII shortage 8 095 zł on the supplier payment. Funny Boss reaction is immediately followed by a practical next move. “Cofnij czas” is prominent; no paywall, lost lives or penalty for retrying.

**Achievements:** playful nicknames decorate actual competence milestones. “Łowca zaliczek”, “Spokojny grudzień”, “Detektyw faktur” must each disclose its real engine condition, not become an invented fourth scoring system. Competence: 0 unpractised, 1 observed/delegated, 2 independent decision, 3 verified on account data. Decorative titles never imply validated skills without evidence.

**Plan:** 15 000 zł ±10% from Client A by 4 XII; synthetic account replay starts 21 XI and +2 weeks reaches 5 XII. Game clock stays at the completed lap. “Dane syntetyczne” visible wherever monetary values appear.

## 9. Loader and recovery behaviour

| Situation | Illustrated micro-scene / copy | Behaviour |
|---|---|---|
| Initial assets | Cat sleeps on calculator; Boss searches desk. “Szef szuka kalkulatora. Kot wie, gdzie jest.” | Real byte-based progress if available; otherwise indeterminate trail. Never fake percentages. |
| Next week | Plane travels to next calendar island. “Proszę zapiąć terminy płatności.” | Resolve engine state first; prevent duplicate next actions; movement within turn budget. |
| Forecast recompute | Plane compass briefly aligns. “Sprawdzamy trasę…” | Keep last confirmed numbers identified; no zero flash, no artificial delay. |
| AI response | Boss/client listening, subtle dots. “Rozmówca układa odpowiedź…” | After >3 s show cached choices / try without AI. No indefinite blocking. |
| Voice synthesis | Speech-bubble sound ripple, captions already visible. “Głos przygotowuje się. Napisy są już dostępne.” | Player can continue without audio; voice never gates a choice. |
| Saving | Envelope travels to a filing tray. “Odkładamy plan tam, gdzie kot nie sięga.” | Success only after storage confirmation; disable duplicate save; failure offers retry. |
| Missing network | Unplugged cloud/router. “Internet poszedł po kawę.” | Cached text/engine stay usable if available; no false cloud-save message. |
| Longer failure | Boss presents plan B | Persistent plain explanation and retry/stay controls; never cover actionable error with a joke. |

Do not insert delays to show a loader. Fast operations complete immediately. Provide reduced-motion stills, visible text status and polite screen-reader announcements. Give errors concrete details outside humour. The G28 image illustrates offline plus unconfirmed save; the implementation must distinguish AI connectivity failure from persistent-storage failure because they can occur independently.

## 10. ElevenLabs: interactive spoken narration

**User decision:** the game will integrate ElevenLabs. The implementation route proposed here is voiced scripted narration and approved dynamic text first; optional two-way voice conversation uses the same deterministic game rules. No integration has been deployed and no credentials/voice IDs have been provisioned in this design task.

### Voice identities

Two narrator voice profiles correspond to Szef/Szefowa, selected for clear Polish, warm adult energy, comedic timing and believable emotional range. Client and adviser may have distinct voices if time permits; keep narrator priority. Player gender never selects the narrator voice automatically. Do not clone a real person without appropriate consent; selecting supported library voices is sufficient.

### Interaction flow

1. The deterministic engine emits the event, outcome, amounts, permissible intents and narration key.
2. Narrative layer selects an approved script or validates a short generated utterance against that event.
3. Caption text appears immediately.
4. Server-side voice adapter requests ElevenLabs speech using selected narrator voice and the approved text.
5. The client plays streamed or cached audio after user interaction enables sound.
6. Player may interrupt, skip or choose an action at any time; the old playback is cancelled and cannot trigger another game action.

ElevenLabs supplies a voice, not financial authority. Neither TTS nor a conversational voice agent may invent dates, amounts, costs or rewards. For optional microphone conversation: explicit press-to-talk with visible recording state, transcript for review, intent classification, deterministic rule check, then explicit confirmation before a costly/turn-consuming action. Microphone permission denied → text/quick replies. Recognising speech alone never transfers money or commits a card.

### Playback and emotion

Always provide subtitles, mute, volume, replay, skip and optional speed control if supported by chosen player. Highlight active speaker, not karaoke for every word unless tested. Start sound only after explicit user gesture. One active speaker at a time; stop on scene change, mute, narrator switch or logout. A playful irritated line must not unexpectedly blast at high volume.

Emotion is represented as an internal intent (welcoming, curious, suspicious, exasperated, proud, reassuring); convert it into supported voice/model settings only after testing. Do not promise a provider-specific “angry” switch exists. Default volume and intelligibility remain consistent across emotional lines. Same script semantics for both narrator profiles.

### Spoken financial numbers

Maintain a display form and an approved spoken form for every critical amount/date. Example: display “15 000 zł do 3 XII”; speech “piętnaście tysięcy złotych do trzeciego grudnia”. Expand “ZUS”, “VAT”, “PIT” for tested Polish pronunciation. Do not read emoji, markdown, “±” or raw date identifiers literally. Preserve values; grammar normalisation cannot recalculate money.

### Cache, latency and failure

Pre-render/cached intro, standard jokes, common events, success/failure lines for both voices during the authorised build. Cache key includes script version, voice, language and output settings. Dynamic negotiation uses approved current text; audio misses fall back to captions without delaying the game. A late audio response for a dismissed scene is discarded. Provide a short no-voice alternative after a timeout; exact target depends on venue/network testing.

API credentials stay on the server or in platform secret storage, never in browser bundles, screenshots, documentation or chat. Narrator voice identifiers are configuration, not pasted secrets. If a real-time agent route is adopted, use server-created authentication mechanisms supported by the provider; do not place a long-lived key in the client. No microphone capture or account data is sent merely by loading a page.

### Official references checked 2026-11-16

- Streaming TTS: https://elevenlabs.io/docs/eleven-api/guides/how-to/text-to-speech/streaming
- Streaming speech endpoint: https://elevenlabs.io/docs/api-reference/text-to-speech/stream
- Optional interactive voice WebSocket: https://elevenlabs.io/docs/eleven-agents/libraries/web-sockets
- Agent authentication: https://elevenlabs.io/docs/eleven-agents/customization/authentication

These support speech streaming and an optional interactive route. Model/voice choice and measured latency remain build-time decisions, not assumed provider promises.

## 11. Accessibility and honest concepts

Game art must not make text illegible. Cream/dark dialogue surfaces, focus outlines, at least 44 px targets, captions, keyboard choices and reduced-motion variants are required. Do not encode correct answers solely in green. Keep route order understandable without animation. No countdown pressure by default.

The illustrated concept sheets may have generative spelling or incidental decorative details; implementation copies canonical Polish strings and exact numbers from this document and GAME-DESIGN.md, not raster text. Static scenes do not prove voice integration, save persistence, authentication or screen-reader behaviour. All remain explicitly designed rather than falsely represented as already working.

## 12. Implementation handoff / acceptance

- All 32 named views/states represented in eight illustrated boards.
- The world and expressive Boss dominate, not flat financial dashboard panels.
- Independent player and narrator selection; all combinations use equivalent mechanics.
- Intro has goal, loop, safe retry, captions, skip and first decision.
- Event-driven expressions include delighted, suspicious, frustrated and supportive.
- Success and failure retain exact conditions/numbers and an obvious next action.
- Meaningful loaders include initial load, transition, AI, voice, save and offline recovery.
- ElevenLabs narration is decoupled from engine authority, with textual fallback and explicit sound/microphone controls.
- Authentication concepts are distinguished from the guest-first hackathon build.
- No application code before the official start.

## 13. Scope of the delivered boards

The boards are a coherent whole-game **visual concept set**. They do not claim pixel-perfect responsive exports for every state, working authentication, playable interactions or recorded voice files. Refinement during the build will translate selected art into layered assets, responsive components and real transitions. The old 68 flat UI PNGs are retained for traceability but are not the current art direction.
## 14. Coordination with the latest game rules (D-07)

GAME-DESIGN.md §6.5 is authoritative for engine edge cases. The game now explicitly starts Relacje at 5/5; show five filled hearts. The demo-seed overdraft comparison is approximately 194 zł, labelled “szacunek”, not the earlier approximately 189 zł. Postponing suppliers is not an unconditional win: the late-client event can make the 8 I payment fail; the card must warn about that scenario. Multiple distinct cards may be used over the lap (one per week, each once); combine their effects and costs deterministically. Offer-to-payment timing and exact route dates must be rendered from engine data. The seven calendar nodes begin 23 XI, 30 XI, 7 XII, 14 XII, 21 XII, 28 XII and 4 I; finish is 10 I. If incidental illustration text differs, these rules and the live text overlay win.

The Boss is not necessarily the player flying the plane. Default synthetic persona Ania and selected player avatars retain the company role; the Boss narrates and reacts. Both narrator options may appear on the character-selection screen. A continuous story sequence must show only the selected narrator; the corrected G05–G08 walkthrough uses Szefowa throughout. Other standalone character samples are not permission to switch the narrator during a play session.
## 15. Alan's additions: factoring and Cash Flow drilldown

### Additional action card

Exact proposed title: **“Faktoring ekspresowy mBank”**. Visible price: **“Koszt: 1,5%”**, accompanied by **“Założenie scenariusza”** and **“Dane syntetyczne”**. The title and percentage are Alan's supplied design concept, not a verified official product name, tariff, financing guarantee or endorsement. This is a narrow exception to the earlier rule against naming a bank in-app: plain text in this requested card is permitted, while bank logos and bank-brand styling remain excluded.

There are five base actions plus this additional designed action. When enabled, the hand contains six distinct cards, not a second version of the late discount. Use keyboard shortcut 6 only when that card is available, without changing text-input keyboard behaviour. Existing one-action-per-turn and confirmation rules still apply.

Boss line: “Faktura ma termin. My mamy poniedziałek.” Follow with a factual explanation of invoice financing and a preview, not a product endorsement. Comparison always includes the zero-cost advance where still valid; purchasing factoring never grants a competence level just for buying it.

Factoring mechanics are now defined by D-11 and GAME-DESIGN.md §6.6: gross invoice20 295 zł, synthetic fee304 zł rounded to the złoty, payout19 991 zł on the business day after the Monday request in T1–T5; reassign the original8 I receipt to the factor, mutually exclusive with discount. The computed minimum is +7 596 zł. Treat these as deterministic game assumptions, not actual mBank pricing or an approval guarantee. The existing schematic board remains a layout concept; implement its data from those rules.

Official mBank material describes conditions and fees separately; a 1.5% figure can relate to extending repayment rather than a universal initial factoring cost. Do not promote this scenario assumption into actual pricing. Validate product terminology and final terms with the challenge/business representative before presenting it as a bank offer.

### Cash Flow from any route node or a dedicated control

- Every weekly route node has a labelled 44 px hit area. Click/tap/Enter opens the cash-flow detail with that node's week/date selected.
- A persistent “Pokaż przepływy” button opens the same view with the current week selected; it is also accessible outside the illustration.
- Desktop: side panel or wide notebook-style overlay, preserving selected-node context. Phone: full-height bottom sheet with sticky close/back and confirmation only if a card is actively selected.
- Show date-based x-axis, zł y-axis, zero baseline, clearly labelled grey baseline, dashed card preview and committed scenario where present. Preserve the same scale for comparisons.
- Below the plot show the dated income/outgoing transactions, counterparty, amount and reason. Point selection updates the transaction list; chart and table are keyboard accessible.
- If a card is selected, “Przed decyzją / Po decyzji” compares that card against the actual current baseline. Do not always show the advance's +2 605 zł for a factoring preview.
- Closing the detail returns focus to the node/button. Opening, hovering, selecting a point or closing the chart never spends the turn or commits a card.
- A computation loader retains last confirmed figures labelled as such; failure offers retry and does not display fabricated zeros.
- The illustrative title may be “Cash Flow • 28 XII”; humour stays in narrator comments, not the axis labels.

### Bank business value — pitch material, not a sales gate

The additional card demonstrates contextual discovery of invoice financing at the moment a company faces delayed payment. Potential business benefits to explain in the pitch: better product understanding, more informed financing conversations, relevant discovery and possible financing revenue when the product suits the user. These are qualitative hypotheses, not measured commercial results. Do not equate the demo's 1.5% with mBank revenue or claim a conversion uplift.

The game must also show when factoring is unnecessary, unavailable or more expensive than a valid alternative. “Win the mission” and learning competence must never require buying a named bank product.

### Eighth board

G29 shows the proposed card and labelled 1.5% scenario. G30 demonstrates node-to-Cash-Flow drilldown. G31 compares advance, discount and factoring with timing/eligibility visible. G32 shows non-committing card preview and the dedicated chart button. These four scenes extend the original 28-view suite to 32 views.
## 16. Delivered art index and design QA

Active boards are stored in `design/concept/`. The file names below are canonical; §18 records the earlier consolidation. The latest corrected board is authoritative when an earlier draft of the same four scenes appears in the conversation. Generated art is automatically retained with the conversation; no additional application code is included.

| Board | Screens | Content | Active PNG |
|---|---|---|---|
| 01 | G01–G04 | Entry, account and logout | `design/concept/board-01-G01-G04-account.png` |
| 02 | G05–G08 | Introduction and character choices | `design/concept/board-02-G05-G08-intro-characters.png` |
| 03 | G09–G12 | World and mission (corrected) | `design/concept/board-03-G09-G12-world-mission.png` |
| 04 | G13–G16 | Cards and negotiation (corrected) | `design/concept/board-04-G13-G16-cards-negotiation.png` |
| 05 | G17–G20 | Week, success, failure and rewind | `design/concept/board-05-G17-G20-week-success-failure.png` |
| 06 | G21–G24 | Achievements, plan and settings | `design/concept/board-06-G21-G24-achievements-plan-settings.png` |
| 07 | G25–G28 | Loaders and offline/save failure | `design/concept/board-07-G25-G28-loaders-offline.png` |
| 08 | G29–G32 | Factoring and Cash Flow (corrected) | `design/concept/board-08-G29-G32-factoring-cashflow.png` |

QA completed: all 32 screen IDs are present in this document; eight active PNG boards exist and open; all use the same illustrated world, recurring narrator identities, warm humour and game-style decisions. Corrected board03's dates/cards and made its plot explicitly schematic; corrected board04's overdraft amount to approximately194 zł and made unaccepted negotiation terms a preview; corrected board08 to remove fabricated transaction amounts and distinguish schematic Cash Flow from live numerical output.

A8 corrections are now applied to the active boards: G19 is T5, G26 is T1→T2, and G10 uses a generic invoice illustration instead of the logo-like letter. Build-time refinement remains: replace baked-in concept text/counters with canonical live UI. Charts in these boards illustrate layout only, while actual plots and transaction tables come from the deterministic engine. These are tracked handoff items, not a claim of production-ready numerical chart exports or fully audited responsive components.

Bank-source check for the scenario-label decision: [mBank factoring overview](https://www.mbank.pl/firmy/kredyty/faktoring/) distinguishes financing from extension conditions; [current tariff index](https://www.mbank.pl/pomoc/oplaty/interaktywna/fir/) identifies the applicable tariff. The displayed1.5% remains Alan's synthetic scenario assumption.
## 17. Approved desktop and mobile landscape, including system screens

The product owner confirmed the illustrated direction for desktop and **mobile in landscape**. This is a viewport decision for the existing browser-based web game (D-03), not a decision to create Electron/native apps.

| Target | Reference viewport | Layout intent |
|---|---|---|
| Desktop | 1440×900; verify projector1280×800 | World route prominent, narrator alongside current event, card hand along bottom, detail panel beside play area |
| Mobile landscape | 844×390; also verify812×375 and932×430 | World cropped around current action; compact HUD, 44–48 px controls, safe areas left/right, expanded dialogue or card overlay when needed |
| Phone held vertically | Portrait recovery screen | Friendly “Obróć telefon, lecimy w poziomie”; keep essential account/help controls reachable and offer a usable text fallback if rotation is impossible |

Mobile is a responsive composition, not a uniformly shrunken desktop image. Cards use a selectable carousel/tray; the selected card opens a readable detail. Keep the seven-week route discoverable, but prioritise current waypoint, upcoming obligation and the active decision. Charts expand into a wide sheet with accessible transaction list. Retain exact data and labels; do not squeeze them into decorative scenery.

When the software keyboard opens in landscape, suspend background movement, focus the active input, keep its submit action reachable and allow the form to scroll. Respect display cutouts and browser chrome. Touch targets remain at least44px. A rotate prompt must not trap a user who needs accessibility settings, password recovery or system navigation.

### System screens are mandatory design views

G01 **logowanie**, G02 **zakładanie konta**, G03 **odzyskiwanie hasła**, G04 **wylogowanie** are included in board01 and must be retained in desktop and landscape-phone refinement. Include inline field errors, form submission loader, neutral reset-link result, session-expired return to login, and save-aware logout confirmation. These states reuse the world, narrator and humour, with straightforward form labels and explicit error explanations.

G24 contains account/logout access from pause/settings. G25–G28 cover loading, transition, AI/voice wait and save/network recovery. A logout request during an unconfirmed save offers retry/stay; it must not erase progress. A future logged-out state returns to G01 with “Do zobaczenia na kolejnej turze!”.

This confirms the **design inventory**; it does not provision accounts or override the guest-first hackathon build without an implementation scope decision.

## 20. Story roles decided (D-12) and file cleanup (2026-11-16)

- The Boss (Szefowa by default — she is Ania, the owner in SYNTHETIC-DATA.md — or Szef) owns the graphic studio and narrates; the player is the new „pilot finansów” she brought in to help steer the money. Intro beat 1 can say so: „Witaj na pokładzie, pilocie finansów! …”. Copy deck A6 and voice script A7 use this framing in all four player/narrator combinations.

## 21. Notifications and reminder email

Added G33 inbox, G34 optional reminder opt-in, G35 reminder email, G36 preferences and the G10 return banner. Illustrated overview: `design/concept/board-09-G33-G36-notifications-email.png`. Exact layouts at desktop 1440×900 and landscape 844×390 (email widths 600/375), four grammar variants, N-01…N-08 push/email templates and state sheet are in `design/notifications/`. Behaviour, files and email handoff: `docs/specification/NOTIFICATION-DESIGN.md`. The precise SVG/copy layer overrides decorative concept text. Inbox always available; external channels off until chosen. D-14 demo: return banner and stage push; email is a pilot design. No live messages or subscriptions created.

## 22. Ready motion and notification review closure

actual motion artwork is in `design/motion/` (20APNGclips,20stills,5animatedSVG,18declarativetransitions). Catalogue,exacttriggers,APNGreduced-motion handling and integration limitations: `docs/specification/MOTION-AND-ARTEFACT-AUDIT.md`. Eight original WAV effects are in `design/audio/sfx/`;narration remains script-only pending ElevenLabs access and voice choices.

Revised board09 and exactnotificationlayouts now use Ania·Szefowa,Ania·Szefowa studia,and current/totalweekprogress. G36 has actual designed channel/quiet-hour/timezone fields anddemo-send;demo acknowledgement states andN07publicobligationcopy are separate. Narrator art slots bind to chosen gender in G33/G34/G36/return. These supersede earlier decorative-board overrides.
