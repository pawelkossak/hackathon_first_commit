# Onboarding B — ekrany i grafika (Antigravity)

## Twoja rola
Budujesz to, co widać: shell aplikacji, mapę kampanii, trasę wysp, karty, wydarzenia, wykres Cash Flow, porażkę i cofanie, podsumowanie i plan. **Najpierw na placeholderach** (faza 1, bez żadnych assetów), potem generujesz grafiki według `GENERATION-BRIEFS.md` i podmieniasz je w tych samych komponentach (faza 2).

**Twoje katalogi:** `app/` (bez `app/api/`), `components/` (bez `components/narrative/`), `public/`, `lib/ui/`, `lib/generated/`, `scripts/build-assets.ts`, `design/`.

## Start
1. Sklonuj repo i przejdź na swoją gałąź (patrz `docs/team/README.md`): `git switch lane/ui && pnpm install`.
2. Otwórz folder repo w Antigravity. Agent sam czyta `AGENTS.md` i `GEMINI.md`.
3. Napisz do agenta: **`/next-task`**. Weźmie U-01 i pójdzie dalej po kolei.

## Kolejność zadań (BUILD-PLAN.md §5, lane U)
**Faza 1:** U-01 shell, trasy, store, reset → U-02 motyw zastępczy i rejestr assetów z `Placeholder` → U-03 mapa G09 → U-04 trasa wysp G10 → U-05 karty G13 → U-06 wydarzenia G11 → U-07 tydzień G17 → U-08 Cash Flow → U-09 porażka i cofanie → U-10 podsumowanie, plan, walidacja → U-11 wariant awaryjny → U-12 dostępność.
**Generowanie (równolegle, gdy masz chwilę):** G-01 niebo i wyspy → G-02 postaci → G-03 karty i burza.
**Faza 2:** U-13 pipeline → U-14 podmiana placeholderów → U-15 mobile → U-16 tokeny i fonty → U-17 animacje → U-18 poziom 2.

## Ważne
- **Nie czekasz na silnik.** `engine/index.ts` od pierwszych godzin zwraca dane testowe. Wywołuj tylko funkcje z niego, a kwoty bierz zawsze z wyniku silnika, nigdy nie wpisuj ich na sztywno.
- **Ekrany narracji robi osoba C** w `components/narrative/` (intro, dialog, negocjacja, odtwarzacz głosu, ustawienia). Ty je tylko wstawiasz na swoje strony.
- Każdy obrazek idzie przez rejestr `lib/ui/assets.ts`. Gdy pliku nie ma, rejestr zwraca placeholder o właściwym rozmiarze, więc podmiana grafik niczego nie psuje.
- Układ ekranów bierzesz z opisu w `GAME-EXPERIENCE-AND-NARRATION.md` §6 i §17 (1440×900). Sprawdza to workflow **`/browser-check`**.
- Na koniec zadania: **`/handoff`**, potem `git push -u origin lane/ui` i PR do `develop`.
- Potrzebujesz nowej paczki npm albo zmiany konfiguracji? Poproś koordynatora (A).

## Twoje checkpointy
- pt 23:00: G09, G10 i G13 działają na placeholderach i API silnika.
- sob 12:00: cała ścieżka demo klikalna na placeholderach; pierwsze grafiki gotowe do przeglądu.
