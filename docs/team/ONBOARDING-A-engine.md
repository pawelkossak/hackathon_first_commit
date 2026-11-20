# Onboarding A — silnik i dane + koordynacja (Claude Code)

## Twoja rola
1. **Lane engine:** cała logika gry jako czysty TypeScript w `engine/` i dane w `data/`. Każda liczba w grze pochodzi z Twojego silnika.
2. **Koordynator:** scalasz PR-y lane'ów do `develop`, zmieniasz pliki wspólne, decydujesz o cięciach na checkpointach.

## Najpierw (pt, zaraz po starcie)
1. `git switch lane/engine && pnpm install && pnpm check`.
2. **E-01 jako pierwsze, w ciągu 1–2 h:** `engine/types.ts` i `engine/index.ts` ze wszystkimi funkcjami z `RUNTIME-ENGINE-CONTRACT.md` i ostatecznymi sygnaturami. Każda funkcja na razie zwraca stan z danych testowych. Scal to do `develop` od razu, bo B i C budują na tym API.
   - Obecny `engine/types.ts` i `data/level1.json` z `main` to model quizu Pawła. Zastępujesz je modelem ze specyfikacji (powiedz o tym Pawłowi).
3. Potem E-02…E-10 po kolei, każde z testami ET-xx z `ENGINE-DATA-AND-TESTS.md` §7.

## Jak budujesz zadanie
W Claude Code, na gałęzi `lane/engine`:

```
Użyj subagenta engine-dev do zadania E-02 z docs/specification/BUILD-PLAN.md.
```

Agent buduje, pisze testy, odpala `pnpm test`, pisze handoff i kończy linią `COMMIT: …`. Commit robisz Ty:

```
! cd /c/Users/albar/Projekty/hackaton_first_commit && git add -A && git commit -m "<linia COMMIT>"
```

Hook Claude Code zablokuje edycję poza `engine/` i `data/`, a hook gita commit spoza lane'u.

## Jak scalasz PR innej osoby
1. `git fetch origin`
2. `node scripts/lane-check.mjs --range develop...origin/lane/ui`
3. W Claude Code: `Użyj subagenta qa dla zakresu develop...origin/lane/ui, zadania U-03, U-04.`
4. Przy `VERDICT: PASS`: scal PR na GitHubie (base `develop`) albo lokalnie `git switch develop && git merge --no-ff origin/lane/ui && git push origin develop`.
5. Przy `VERDICT: FAIL` wyślij autorowi listę P0/P1.
6. Pliki wspólne (np. nowa paczka w `package.json`) zmieniasz na `develop` albo na gałęzi `chore/*`, nie na `lane/engine`.

## Twoje checkpointy
- pt 22:00: ET dla prognozy, kart i tur zielone (E-02…E-05).
- sob 10:00: ET-D01 (cała ścieżka demo w silniku) zielony, wszystkie 58 ET zielone.
- sob 12:00: decyzja go / fallback dla całego zespołu.

## Czego pilnujesz u wszystkich
Liczby tylko z silnika · dane syntetyczne · brak faworyzowania produktów banku · AI z fallbackiem i bez kluczy w kliencie · nic na `main` przed finałem.
