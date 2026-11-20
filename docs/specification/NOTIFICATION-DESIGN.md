---
answers: >-
  How in-game notifications, consent, return reminders, settings and a reminder email look and behave, and which files implement the design handoff.
excludes: >-
  Application code, live delivery, real user subscriptions, email-client compatibility guarantees and backend rules already defined in BACKEND-SERVICES.md.
status: current
updated: 2026-11-16
---

# Notification design — Pilot Płynności

 extends the G01–G32 suite following the product owner's request. D-12 roles, D-13 channels and D-14 demo scope apply. The Boss owns the studio; the player helps steer finances. Default: Ania + player woman. Voice is friendly and practical. Polish UI; no product promotion or artificial urgency.

## 1. Authoritative artefacts

| View | Purpose | Files under design/ |
|---|---|---|
| G33 | in-game inbox over map | notifications/G33-inbox-1440x900.svg + .png; G33-inbox-844x390.svg + .png |
| G34 | optional reminder opt-in after first completed lap | notifications/G34-opt-in-1440x900.svg + .png; G34-opt-in-844x390.svg + .png |
| G35 | reminder email, desktop and phone portrait | notifications/G35-reminder-email-600.svg + .png; G35-reminder-email-375.svg + .png |
| G36 | categories, channels, quiet hours | notifications/G36-preferences-1440x900.svg + .png; G36-preferences-844x390.svg + .png |
| G10-return | return banner, persistent resume CTA | notifications/return-banner-1440x900.svg + .png; return-banner-844x390.svg + .png |
| State sheet | empty, blocked, completed, unsubscribe, unverified email, save failure | notifications/notification-states.svg + .png |
| Illustrated concept | game-world treatment of G33–G36 | concept/board-09-G33-G36-notifications-email.png |
| Exact positions and copy | developer design data | notifications/layout-specs.json; notification-copy.pl.json; notification-qa.json |

The illustrated concept communicates art direction. Exact spelling, behaviour and accessibility come from these SVG layouts, copy decks and this specification. In particular: the chosen narrator is labelled **Ania · Szefowa**, rather than the earlier concept image's English nameplate (now corrected); in-game inbox is always available rather than a consent checkbox; the return string includes “Wróciłaś/Wróciłeś” and “Tydzień {week.current} z {week.total}”. Live numbers are never read from a concept PNG.

## 2. In-game behaviour

Paper-plane/envelope button on G09/G10: 44×44 CSS px minimum, accessible label “Poczta, 2 nieprzeczytane wiadomości”; count derived from unread relevant items, hidden at zero, visually capped at 9+. New state uses both dot and readable text. Non-flashing badge; no looping urgency animation.

Opening G33 does not advance a week or consume an action. Desktop: side panel over the map. Mobile landscape: right panel, its own vertical scroll area; no scene behind it accepts input. Opening one overlay closes/replaces the previous overlay. Escape/close restores focus to mailbox. Rows have complete hit areas ≥44 px. No hover-only actions. Opening an item marks that item read; merely opening the inbox does not mark all read. “Mark all read” is explicit. Expired items are removed from actionable count.

Each item: narrator/avatar, headline, short body, received time in player timezone, read marker, exactly one contextual CTA. A save-plan item links to plan, not always to a generic home screen. Recheck server or local saved state before opening the target. If the week has moved on, show current progress with the completed-state explanation; never execute an outdated action or rewind without an explicit player action. Inactive level is not announced as available.

G10-return appears after the saved run is restored; it never auto-plays a card. Banner is dismissible, stays until dismissed/resumed, and does not cover the card tray. Screen reader: polite status once, no focus theft. It remains usable without external delivery permission, per D-14.

## 3. Consent and settings

G34 is offered after the first completed lap in the demo, not on first load or during a consequential decision. Both external channels initially unchecked. “Może później” dismisses without browser permission request. “Ustaw przypomnienia” with no selected channel must not silently opt in: show “Wybierz kanał albo wróć do gry.” Only a deliberate browser-channel action may invoke native permission. Browser denied/unsupported: explain calmly and keep inbox available. No repeated prompt after denial; player can revisit settings.

Email channel requires account + confirmed address; guests see the account prerequisite. Category switches and external channels are independent, initially off. Inbox is always available. “Zapisz ustawienia” is explicit; saving failure preserves prior state. Success: “Ustawienia zapisane.” Quiet hours default 21:00–08:00 Europe/Warsaw; show the timezone. Sunday suppression and cap/pause rules remain BACKEND-SERVICES §4. External reminders use the same logical job and relevance checks; email is a fallback, not a second duplicate campaign.

The diagramless static settings view shows default-off switches. Build-time controls must expose selected/disabled/permission status in text and aria state, not colour alone. Native permissions cannot be changed by an in-game toggle without browser support.

## 4. Reminder email

600 px desktop message width; responsive single column at 375 px phone width (email portrait is intentional even though game play uses landscape). Cream background, purple ink, mint paper-plane identity, golden CTA, optional decorative island hero. Live HTML text and real links at implementation time; never send a flattened image as the email.

| Element | Default example |
|---|---|
| Sender name | Ania · Pilot Płynności (male narrator: Szef · Pilot Płynności) |
| Subject | Tydzień {week.current} czeka na Twój ruch |
| Preheader | Twoja trasa jest zapisana. Wróć do gry w swoim tempie. |
| Greeting | Cześć, tu Ania! / Cześć, tu Szef! |
| Body | Twoja trasa jest zapisana. Wróć, gdy masz chwilę, i wybierz kolejny krok. |
| Primary CTA | Wróć do gry |
| Signature | Ania · Szefowa studia / Szef studia |
| Footer | Otrzymujesz tę wiadomość, bo włączono przypomnienia e-mail. |
| Secondary links | Ustawienia przypomnień; Wyłącz przypomnienia e-mail |

The specimen “3” is a labelled design example, not a fixed week; total “7” also binds to the level's week count. Final sender address/domain and privacy/company footer come from the pilot configuration; none is invented in this design. No tracking pixel by default. Subject/preheader/push contain no balances, account data or real obligation names. HTML plus plain-text equivalent required. Use table layout and inline styles when implementing email; do not require JavaScript, webfonts, SVG rendering, CSS backgrounds or images for meaning. Decorative image empty alt; real text heading and CTA retain meaning with images blocked. CTA ≥44 px high, font ≥16 px body (footer ≥13 px), underlined footer links in final HTML. Preserve AA contrast. Email-client and dark-mode validation are build-time work.

Resume link resolves current saved run after any required authentication; it contains no credentials. Use an application-relative deep link bound to the configured origin, not a fabricated production domain. Preserve the intended target across login.

Unsubscribe is a separate signed, scoped, expiring preference token, never an auth token. Mail GET requests must not mutate preferences because of link prefetchers: GET displays the unsubscribe page; deliberate one-action POST disables email and shows the supplied success state, with no login requirement. Provider one-click unsubscribe uses its supported POST mechanism. A stale unsubscribe link provides a safe replacement flow. This clarifies BACKEND-SERVICES's GET endpoint: GET is the landing page, not the mutation. Other channels and game progress remain intact.

## 5. Copy and timing contract

N-01…N-08 are delivered in notifications/notification-copy.pl.json and merged into copy/copy-templates.pl.json and all four resolved player/narrator decks. Nine trigger variants include separate N-06 met/missed. Each has push title/body, email subject/preheader/heading/body, CTA, phase and relative target. Push title always “Pilot Płynności”; examples ≤120 characters. N-01 deliberately avoids “storm getting closer” while the game is paused: game time does not advance while absent.

Only N-01/N-02 are demo-capable; full inbox/settings/email and remaining triggers are pilot designs unless separately promoted. Demo 30-second reminder is clearly a stage test, initiated by a player gesture; it does not replace the production 20-hour rule. Email delivery is P1, not a newly implemented hackathon service.

N-05 uses an actual saved account-clock deadline. N-06 uses an observed matched/missed event. N-07 remains P2 and off by default; public-obligation dates are supplied by an authoritative future adapter and never guessed from a fixed day-of-month. Trigger may be three business days ahead, but body “za {deadline.days} dni” uses actual calendar difference at send time; never substitute a fixed three. Weekly digest uses actual engine/progress counts; counts do not change with gender.

Visual prompts and UI strings stay silent by default. Optional narrator voice may speak the return line only after game audio has been explicitly enabled and the player returns; never auto-play voice in email or push.

## 6. Validation and delivery limits

12 exact SVG layouts with PNG previews: G33/G34/G36 and return banner at both landscape widths, G35 at two email widths, two state sheets (general errors and demo/permissions). Four grammar decks updated; maximum rendered push body 63 characters in current fixtures, no financial product promotion. Token palette inherits the AA-checked game kit. Static exports do not prove keyboard handling, screen reader announcements, delivery scheduling or email-client compatibility. These are design artefacts; no application code, subscriptions or messages were created.

## 7. Review fixes

Revised board09 and exact SVG/PNG layouts: all nameplates are Polish; email signature uses ownership-correct “Szefowa studia”; return banner and copy include current/total week progress. G36 now has browser/email toggles, quiet-from/to and timezone fields plus visible demo-send action; layout-specs.json contains actual control/portrait boxes with44pxminimum hit areas. Chosen narrator portraits appear in G33/G34/G36/return.

Added notif.demo.send, notif.demo.scheduled and pending/permission/failure strings. Show scheduled30-second feedback only after the scheduler accepts the job, never merely after pressing the button. Dedicated permission/demo state sheet exported. N-07 copy explicitly says “płatność publiczna w firmie”, distinct from N-05 plan deadline; delay comes from the future scheduler. Main copy has480entries pervariant,98notificationentries. Motion files and reduced-motion behaviour: MOTION-AND-ARTEFACT-AUDIT.md.
