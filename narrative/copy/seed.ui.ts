// Interface copy of the narrative screens (G14–G16, G24–G28, G34, return banner, voice player), PL and EN,
// in the 4 player/narrator variants. No template contains a typed-in digit: every number arrives as a
// binding (engine values, the settings store or the push config). Merged into SEED_COPY / SEED_COPY_EN.
import type { CopyRecord } from "../types";

/** One text for all four variants, or a pair that differs by player or by narrator gender. */
type Spec = string | { player: readonly [female: string, male: string] } | { narrator: readonly [female: string, male: string] };

function toRecord(spec: Spec): CopyRecord {
  if (typeof spec === "string") {
    return {
      "player-female_narrator-female": spec,
      "player-male_narrator-female": spec,
      "player-female_narrator-male": spec,
      "player-male_narrator-male": spec,
    };
  }
  if ("player" in spec) {
    const [f, m] = spec.player;
    return {
      "player-female_narrator-female": f,
      "player-male_narrator-female": m,
      "player-female_narrator-male": f,
      "player-male_narrator-male": m,
    };
  }
  const [f, m] = spec.narrator;
  return {
    "player-female_narrator-female": f,
    "player-male_narrator-female": f,
    "player-female_narrator-male": m,
    "player-male_narrator-male": m,
  };
}

/** [PL, EN] per key, so both locales always carry the same keys. */
const UI_COPY: Record<string, readonly [pl: Spec, en: Spec]> = {
  // G16 bank advisor and the SMS loan reveal
  "ui.bank_advisor.aria": ["Doradca bankowy i pożyczka pozabankowa", "Bank advisor and non-bank loan"],
  "ui.bank_advisor.subtitle": [
    "Limit w koncie z banku i oferta pożyczki pozabankowej z SMS-a",
    "The bank's overdraft and a non-bank loan offer from an SMS",
  ],
  "ui.bank_advisor.limit": ["Limit do wykorzystania: {overdraft.limit}", "Available limit: {overdraft.limit}"],
  "ui.bank_advisor.choose_overdraft": ["Wybierz limit w koncie", "Choose the overdraft"],
  "ui.bank_advisor.sms": ["SMS", "SMS"],
  "ui.bank_advisor.rule": [
    "Wygrana nigdy nie wymaga pożyczki. Zawsze jest tańszy manewr: zaliczka, skonto albo przesunięcie płatności.",
    "Winning never needs a loan. There is always a cheaper move: an advance, a discount or a moved payment.",
  ],
  "ui.bank_advisor.consider_loan": ["Rozważ pożyczkę pozabankową", "Consider the non-bank loan"],

  // G15 AI-CFO
  "ui.ai_cfo.badge": ["AI", "AI"],
  "ui.ai_cfo.subtitle": ["Analiza ryzyka płynnościowego", "Liquidity risk analysis"],
  "ui.ai_cfo.risk.title": ["Zagrożenie zatoru płatniczego", "Risk of a payment gridlock"],
  "ui.ai_cfo.risk.body": [
    "W prognozie brakuje {risk.shortfall} w dniu {risk.date}.",
    "The forecast is short by {risk.shortfall} on {risk.date}.",
  ],
  "ui.ai_cfo.ok.title": ["Płynność w normie", "Liquidity is fine"],
  "ui.ai_cfo.ok.body": ["Prognoza nie pokazuje luki.", "The forecast shows no gap."],
  "ui.ai_cfo.options": ["Najtańsze bezpieczne manewry", "Cheapest safe moves"],
  "ui.ai_cfo.none": ["Brak manewru do zaproponowania w tym tygodniu.", "No move to suggest this week."],
  "ui.ai_cfo.cost": ["Koszt: {option.cost}", "Cost: {option.cost}"],
  "ui.ai_cfo.cost_estimate": ["Koszt: {option.cost} (szacunek)", "Cost: {option.cost} (estimate)"],
  "ui.ai_cfo.choose": ["Wybierz", "Choose"],
  "ui.ai_cfo.delegation": [
    "Delegowanie: kompetencja na poziomie {competence.level}",
    "Delegating: competence at level {competence.level}",
  ],
  "ui.ai_cfo.delegate": ["Deleguj najtańszy bezpieczny manewr", "Delegate the cheapest safe move"],

  // G24 settings
  "ui.settings.aria": ["Ustawienia gry i dostępność", "Game and accessibility settings"],
  "ui.settings.title": ["Ustawienia gry i dostępności", "Game and accessibility settings"],
  "ui.settings.resume": ["Wznów grę", "Resume game"],
  "ui.settings.save_failed.title": ["Błąd zapisu w przeglądarce:", "Browser save error:"],
  "ui.settings.save_failed.body": [
    "Ustawienia mogą nie zostać zachowane po odświeżeniu strony (brak miejsca w pamięci lub tryb prywatny).",
    "Settings may not survive a page reload (storage is full or the browser is in private mode).",
  ],
  "ui.settings.characters": ["Postacie (zmiana bez utraty postępu)", "Characters (change without losing progress)"],
  "ui.settings.player": ["Twoja postać:", "Your character:"],
  "ui.settings.narrator": ["Przewodnik (głos):", "Guide (voice):"],
  "ui.settings.audio": ["Dźwięk i narracja", "Sound and narration"],
  "ui.settings.volume": ["Głośność głosu: {volume}", "Voice volume: {volume}"],
  "ui.settings.muted": ["Dźwięk wyciszony", "Sound muted"],
  "ui.settings.unmuted": ["Dźwięk włączony", "Sound on"],
  "ui.settings.captions_only": ["Tylko napisy (bez głosu)", "Captions only (no voice)"],
  "ui.settings.voice_and_captions": ["Głos + napisy", "Voice + captions"],
  "ui.settings.a11y": ["Dostępność i styl narracji", "Accessibility and narration style"],
  "ui.settings.reduced_motion": ["Ograniczenie ruchu", "Reduced motion"],
  "ui.settings.reduced_motion.hint": [
    "Wyłącza intensywne animacje chmur, samolotu i przewracania kart",
    "Turns off strong cloud, plane and card-flip animations",
  ],
  "ui.settings.on": ["Włączone", "On"],
  "ui.settings.off": ["Wyłączone", "Off"],
  "ui.settings.chattiness": [
    { narrator: ["Częstość komentarzy Szefowej", "Częstość komentarzy Szefa"] },
    "How often the Boss comments",
  ],
  "ui.settings.chattiness.hint": [
    "Standardowa (żarty i reakcje) lub zredukowana (tylko kluczowe finanse)",
    "Standard (jokes and reactions) or reduced (key finance only)",
  ],
  "ui.settings.chattiness.normal": ["Normalna", "Normal"],
  "ui.settings.chattiness.reduced": ["Zredukowana", "Reduced"],

  // G25–G28 loaders and the save failure notice
  "ui.loader.initial": ["Przygotowywanie studia graficznego…", "Preparing the design studio…"],
  "ui.loader.engine": ["Uruchamianie silnika finansowego", "Starting the finance engine"],
  "ui.loader.week_summary": ["Podsumowywanie transakcji tygodnia…", "Summing up the week's transactions…"],
  "ui.loader.ai_wait": [
    "Oczekiwanie na odpowiedź (maks. {seconds} s)…",
    "Waiting for the reply (max {seconds} s)…",
  ],
  "ui.loader.skip_voice": ["Czytaj dalej bez głosu", "Read on without voice"],
  "ui.save_failure.title": ["Błąd zapisu stanu gry", "Game save error"],
  "ui.save_failure.body": [
    "Nie udało się potwierdzić zapisu stanu gry w pamięci przeglądarki. Twój postęp działa w tej sesji, ale może nie wrócić po zamknięciu karty.",
    "The game save could not be confirmed in browser storage. Your progress works in this session but may not come back after the tab is closed.",
  ],
  "ui.save_failure.continue": ["Kontynuuj bez zapisu", "Continue without saving"],
  "ui.save_failure.retry": ["Spróbuj zapisać ponownie", "Try saving again"],

  // G34 reminder opt-in and the demo push
  "ui.push.narrator": [{ narrator: ["Ania · Szefowa studia", "Szef studia"] }, { narrator: ["Ania · Studio boss", "Studio boss"] }],
  "ui.push.title": ["Kiedy wracamy za stery?", "When do we take the controls again?"],
  "ui.push.body": [
    "Możemy przypomnieć Ci o kolejnym ruchu, gdy gra będzie wymagała Twojej decyzji. Bez spamu, bez reklam produktów finansowych.",
    "We can remind you of the next move when the game needs your decision. No spam, no ads for financial products.",
  ],
  "ui.push.channels": ["Dostępne kanały powiadomień", "Available reminder channels"],
  "ui.push.browser": ["Przeglądarka (Web Push)", "Browser (Web Push)"],
  "ui.push.permission.denied": ["blokowane w ustawieniach przeglądarki", "blocked in the browser settings"],
  "ui.push.permission.granted": ["zgoda udzielona", "permission granted"],
  "ui.push.permission.default": ["wymaga akceptacji", "needs your consent"],
  "ui.push.email": ["E-mail", "E-mail"],
  "ui.push.email.guest": ["Dostępne po zalogowaniu na konto (tryb gościa)", "Available after signing in (guest mode)"],
  "ui.push.demo.title": ["Test na żywo (próba za {seconds} s)", "Live test (trial in {seconds} s)"],
  "ui.push.demo.body": [
    "Wyślij próbne powiadomienie z odliczaniem {seconds} s na prezentację.",
    "Send a trial reminder with a {seconds} s countdown for the presentation.",
  ],
  "ui.push.demo.scheduling": ["Planowanie…", "Scheduling…"],
  "ui.push.demo.countdown": ["Przypomnienie za {seconds} s", "Reminder in {seconds} s"],
  "ui.push.demo.send": ["Wyślij próbę ({seconds} s)", "Send a trial ({seconds} s)"],
  "ui.push.status.arrived": ["Przypomnienie dotarło!", "The reminder arrived!"],
  "ui.push.status.choose_channel": ["Wybierz kanał albo wróć do gry.", "Choose a channel or go back to the game."],
  "ui.push.status.denied": [
    "Przeglądarka blokuje powiadomienia. Baner powrotu nadal działa w grze.",
    "The browser blocks notifications. The return banner still works in the game.",
  ],
  "ui.push.status.planning": ["Planujemy próbne przypomnienie…", "Scheduling a trial reminder…"],
  "ui.push.status.fallback": [
    "Tydzień {week} czeka. Baner powrotu został aktywowany w grze!",
    "Week {week} is waiting. The return banner is now active in the game!",
  ],
  "ui.push.status.failed": [
    "Nie udało się zaplanować próby. Baner powrotu nadal działa w grze.",
    "The trial could not be scheduled. The return banner still works in the game.",
  ],
  "ui.push.later": ["Może później", "Maybe later"],
  "ui.push.save": ["Ustaw przypomnienia", "Set reminders"],
  "push.title": ["Pilot Płynności", "Liquidity Pilot"],
  "push.body": ["Tydzień {week} czeka. Wrócisz za stery?", "Week {week} is waiting. Back at the controls?"],
  "push.scheduled": ["Próbne przypomnienie przyjdzie za {seconds} s.", "The trial reminder arrives in {seconds} s."],
  "push.fallback_notice": ["Baner powrotu nadal działa w grze.", "The return banner still works in the game."],
  "push.invalid": ["Nieprawidłowe zapytanie o próbne przypomnienie.", "Invalid trial reminder request."],
  "push.failed": ["Nie udało się zaplanować próbnego przypomnienia.", "The trial reminder could not be scheduled."],

  // Return banner (N-08)
  "ui.return.aria": ["Baner powrotu do gry", "Return to game banner"],
  "ui.return.title": [
    {
      player: [
        "Wróciłaś! Tydzień {week} z {weeks.total} czeka na Twoją decyzję.",
        "Wróciłeś! Tydzień {week} z {weeks.total} czeka na Twoją decyzję.",
      ],
    },
    "You're back! Week {week} of {weeks.total} is waiting for your decision.",
  ],
  "ui.return.storm": [
    {
      narrator: [
        "Szefowa Ania: „Burza {storm.date} ({storm.balance}) jest coraz bliżej. Wracasz za stery?”",
        "Szef: „Burza {storm.date} ({storm.balance}) jest coraz bliżej. Wracasz za stery?”",
      ],
    },
    {
      narrator: [
        "Ania, the boss: “The storm on {storm.date} ({storm.balance}) is getting closer. Back at the controls?”",
        "The boss: “The storm on {storm.date} ({storm.balance}) is getting closer. Back at the controls?”",
      ],
    },
  ],
  "ui.return.calm": [
    {
      narrator: [
        "Szefowa Ania: „Najniższe saldo to {storm.balance} ({storm.date}). Wracasz za stery?”",
        "Szef: „Najniższe saldo to {storm.balance} ({storm.date}). Wracasz za stery?”",
      ],
    },
    {
      narrator: [
        "Ania, the boss: “The lowest balance is {storm.balance} ({storm.date}). Back at the controls?”",
        "The boss: “The lowest balance is {storm.balance} ({storm.date}). Back at the controls?”",
      ],
    },
  ],
  "ui.return.resume": ["Wróć do gry", "Return to game"],
  "ui.return.dismiss": ["Ukryj baner powrotu", "Hide the return banner"],
  "ui.return.dismiss_icon": ["✕", "✕"],

  // Voice player
  "ui.voice.aria": ["Kwestia narratora i napisy", "Narrator line and captions"],
  "ui.voice.speaker_fallback": ["Narrator", "Narrator"],
  "ui.voice.playing": ["Głos jest odtwarzany", "Voice is playing"],
  "ui.voice.badge.captions_only": ["Tylko napisy", "Captions only"],
  "ui.voice.badge.muted": ["Wyciszony", "Muted"],
  "ui.voice.badge.no_audio": ["Napisy (brak audio)", "Captions (no audio)"],
  "ui.voice.voice": ["Głos", "Voice"],
  "ui.voice.cc": ["CC", "CC"],
  "ui.voice.voice_mode": ["Włącz tryb głosu", "Turn on voice mode"],
  "ui.voice.captions_mode": ["Włącz tryb tylko napisów", "Turn on captions-only mode"],
  "ui.voice.mute": ["Wycisz", "Mute"],
  "ui.voice.unmute": ["Włącz dźwięk", "Unmute"],
  "ui.voice.mute.aria": ["Wycisz dźwięk", "Mute the sound"],
  "ui.voice.replay": ["Powtórz", "Replay"],
  "ui.voice.replay.aria": ["Posłuchaj ponownie", "Listen again"],
  "ui.voice.skip": ["Pomiń", "Skip"],
  "ui.voice.skip.aria": ["Pomiń kwestię", "Skip the line"],

  // Narrator dialogue and character select
  "ui.narrator_dialogue.aria": ["Dialog z narratorem", "Dialogue with the narrator"],
  "ui.narrator_dialogue.mood": ["Nastrój: {emotion}", "Mood: {emotion}"],
  "ui.narrator.speaker": [{ narrator: ["Szefowa", "Szef"] }, { narrator: ["Boss", "Boss"] }],
  "ui.character_select.aria": ["Wybór postaci i przewodnika", "Choose your character and guide"],
  "ui.character_select.player_hint": [
    "Wpływa na formy gramatyczne zwrotów do Ciebie.",
    "Changes the grammatical forms used for you.",
  ],
  "ui.character_select.guide_hint": [
    "Wpływa na postać właściciela studia i nagrany głos.",
    "Changes the studio owner's character and the recorded voice.",
  ],
  "ui.character_select.preview": ["Podgląd zwrotu ({narrator.choice}):", "Preview ({narrator.choice}):"],
  "ui.character_select.quote": ["„{text}”", "“{text}”"],
};

function locale(index: 0 | 1): Record<string, CopyRecord> {
  return Object.fromEntries(Object.entries(UI_COPY).map(([key, pair]) => [key, toRecord(pair[index])]));
}

export const UI_COPY_PL: Record<string, CopyRecord> = locale(0);
export const UI_COPY_EN: Record<string, CopyRecord> = locale(1);
