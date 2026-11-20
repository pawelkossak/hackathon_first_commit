# Onboarding B — ekrany i grafika (Antigravity)

## Twoja rola
Budujesz to, co widać: shell aplikacji, mapę kampanii, trasę wysp, karty, wydarzenia, wykres Cash Flow, porażkę i cofanie, podsumowanie i plan. Grafiki, layouty i teksty są gotowe w `design/`. Twoje zadanie to złożyć je w działającą grę na żywych danych z silnika.

**Twoje katalogi:** `app/` (bez `app/api/`), `components/` (bez `components/narrative/`), `public/`, `lib/ui/`, `lib/generated/`, `scripts/build-assets.ts`, `design/`.

## Start
1. Sklonuj repo i przejdź na swoją gałąź (patrz `docs/team/README.md`): `git switch lane/ui && pnpm install`.
2. Otwórz folder repo w Antigravity. Agent sam czyta `AGENTS.md` i `GEMINI.md`.
3. Napisz do agenta: **`/next-task`**. Weźmie U-01 i pójdzie dalej po kolei.

## Kolejność zadań (BUILD-PLAN.md §5, lane U)
U-01 pipeline assetów → U-02 motyw (tokeny, fonty) → U-03 shell, trasy, store, reset → U-04 mapa G09 → U-05 trasa wysp G10 → U-06 karty G13 → U-07 wydarzenia G11 → U-08 tydzień G17 → U-09 Cash Flow → U-10 porażka i cofanie → U-11 podsumowanie, plan, walidacja → U-12 wariant awaryjny → potem mobile, dostępność, poziom 2.

## Ważne
- **Nie czekasz na silnik.** `engine/index.ts` od pierwszych godzin zwraca dane testowe. Wywołuj tylko funkcje z niego, a kwoty bierz zawsze z wyniku silnika, nigdy nie wpisuj ich na sztywno.
- **Ekrany narracji robi osoba C** w `components/narrative/` (intro, dialog, negocjacja, odtwarzacz głosu, ustawienia). Ty je tylko wstawiasz na swoje strony.
- Ekran jest gotowy, gdy w przeglądarce przy 1440×900 wygląda jak obrazek w `design/layouts/`. Sprawdzi to workflow **`/browser-check`**.
- Na koniec zadania: **`/handoff`**, potem `git push -u origin lane/ui` i PR do `develop`.
- Potrzebujesz nowej paczki npm albo zmiany konfiguracji? Poproś koordynatora (A).

## Twoje checkpointy
- pt 22:00: G10 (trasa wysp) i G13 (karty) widoczne na danych testowych.
- sob 12:00: cała ścieżka demo klikalna (z prawdziwym silnikiem po scaleniu).
