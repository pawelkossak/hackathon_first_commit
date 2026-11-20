# Onboarding C — narracja, głos, AI, testy e2e i pitch (Antigravity)

## Twoja rola
Odpowiadasz za to, co gra mówi i jak reaguje: teksty w 4 wariantach (gracz/gracza × Szef/Szefowa), reakcje narratora, odtwarzacz nagranego głosu z napisami, intro i wybór postaci, negocjację z klientem przez AI z bezpiecznym fallbackiem, baner powrotu i przypomnienia. Piszesz też test Playwright całej ścieżki demo i prowadzisz pitch.

**Twoje katalogi:** `narrative/`, `components/narrative/`, `lib/ai/`, `lib/reminders/`, `app/api/`, `public/sw.js`, `e2e/`, `playwright.config.ts`, `design/voice/`, `design/audio/` (generowane nagrania i dźwięki).

## Start
1. Sklonuj repo i przejdź na swoją gałąź (patrz `docs/team/README.md`): `git switch lane/narrative && pnpm install`.
2. Skopiuj `.env.example` do `.env.local` i zostaw `PILOT_AI_OFFLINE=1`. Klucze (Anthropic, ElevenLabs) wpisujesz tylko lokalnie i tylko wtedy, gdy testujesz AI na żywo. Nigdy ich nie commituj ani nie wklejaj do czatu.
3. Otwórz folder repo w Antigravity i napisz do agenta: **`/next-task`**.

## Kolejność zadań (BUILD-PLAN.md §5, lane N)
**Faza 1 (bez assetów):** N-01 moduł tekstów i teksty startowe ścieżki demo → N-02 strażnik liczb → N-03 reakcje → N-04 odtwarzacz z trybem samych napisów → N-05 intro i wybór postaci → N-06 negocjacja + `/api/agent` → N-07 test e2e ścieżki demo → N-08 baner powrotu → N-09 AI-CFO i doradca → N-10 loadery i ustawienia → N-11 push.
**Generowanie (równolegle):** G-04 głos Szefowej dla ścieżki demo (ElevenLabs) → G-05 dźwięki.
**Faza 2:** N-12 podpięcie nagrań → N-13 pełne teksty we wszystkich wariantach → N-14 e2e w 4 wariantach.

**Teksty startowe** (`narrative/copy/seed.pl.ts`): tylko ścieżka demo, w 4 wariantach, pisane z polskich zdań cytowanych w specyfikacji (`GAME-DESIGN.md`, `DEMO-REQUIREMENTS.md`, `GAME-EXPERIENCE-AND-NARRATION.md`). Pełne teksty dochodzą później przez te same klucze.

## Ważne
- **AI nigdy nie wymyśla liczb.** Model tylko rozpoznaje intencję i formułuje zdanie, a wynik i kwoty liczy silnik. Każde wywołanie ma timeout 3 s i fallback w postaci przycisków. Testy nigdy nie wołają prawdziwego API.
- Ekrany narracji budujesz w `components/narrative/`. Osoba B wstawia je na strony. Ustalcie nazwy komponentów na czacie.
- Silnik wywołujesz tylko przez `engine/index.ts`. Typy zdarzeń dla reakcji opisuje `ENGINE-DATA-AND-TESTS.md` §6.
- Na koniec zadania: **`/handoff`**, potem `git push -u origin lane/narrative` i PR do `develop`.

## Pitch (P-01…P-04)
Skrypt na 3 minuty jest w `docs/specification/PITCH.md`. Deck i nagranie zapasowe robisz w sobotę z **działającej** aplikacji, czyli z prawdziwych zrzutów ekranu. Próby: sob 22:00, ndz 07:00, ndz 09:00.

## Twoje checkpointy
- pt 23:00: teksty startowe w 4 wariantach, strażnik liczb, reakcje i napisy działają.
- sob 12:00: test e2e ścieżki demo (N-07) zielony na lokalnym buildzie; głos Szefowej gotowy do przeglądu.
