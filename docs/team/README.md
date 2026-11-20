# Zespół — jak pracujemy (start tutaj)

Trzy osoby, trzy tory (lanes), każdy pracuje niezależnie na swojej gałęzi. Szczegóły zadań: `docs/specification/BUILD-PLAN.md`.

**Faza 1, bez assetów** (pt i sob rano): cała gra działa na placeholderach, czyli prostokątach zamiast grafik, tekstach startowych i samych napisach zamiast głosu (`BUILD-PLAN.md` §3.2).
**Faza 2, z assetami** (sob): grafiki, głos i dźwięki generowane równolegle (`GENERATION-BRIEFS.md`) podmieniamy w tych samych komponentach, bez zmiany logiki.

| Osoba | Narzędzie | Lane | Gałąź | Onboarding |
|---|---|---|---|---|
| A — koordynator | Claude Code | engine: silnik i dane | `lane/engine` | [ONBOARDING-A-engine.md](ONBOARDING-A-engine.md) |
| B | Antigravity | ui: ekrany i grafika | `lane/ui` | [ONBOARDING-B-ui.md](ONBOARDING-B-ui.md) |
| C | Antigravity | narrative: narracja, głos, AI, testy e2e, pitch | `lane/narrative` | [ONBOARDING-C-narrative.md](ONBOARDING-C-narrative.md) |

## Pierwsze uruchomienie (każdy, raz)

```bash
git clone https://github.com/pawelkossak/hackathon_first_commit.git
cd hackathon_first_commit
git switch develop
git switch lane/<twój-lane>          # lane/engine, lane/ui albo lane/narrative
pnpm install                          # włącza też strażnika lanes (git hook)
pnpm check
```

Wymagania: Node 24, pnpm 10, Git, Chrome.

## Rytm pracy (każde zadanie)

1. `git pull origin develop` — pobierz to, co już scalone.
2. Weź następne zadanie swojego lane'u z `BUILD-PLAN.md` §5 (Antigravity: workflow `/next-task`).
3. Agent buduje, pisze test z kolumny „Acceptance”, odpala `pnpm check`.
4. Handoff w `docs/team/handoffs/<id>.md` i commit z jednym tematem (Antigravity: `/handoff`).
5. `git push -u origin lane/<twój-lane>` i pull request do **`develop`** (nigdy do `main`).
6. Koordynator sprawdza (lane-check + agent QA) i scala. Wróć do kroku 1.

Nie czekaj na scalenie, żeby brać kolejne zadanie — pracuj dalej na swojej gałęzi.

## Zasady, które pilnują się same

- **Strażnik lanes:** commit na `lane/ui`, który zmienia np. `engine/`, zostanie odrzucony. Potrzebujesz czegoś z cudzego lane'u → napisz w handoffie i powiedz właścicielowi.
- **Pliki wspólne** (`package.json`, konfiguracje, `AGENTS.md`, specyfikacja) zmienia tylko koordynator. Nowa paczka npm → poproś koordynatora.
- **Sekrety:** nigdy nie commituj `.env*`. Klucze trzymasz lokalnie w `.env.local` (wzór: `.env.example`). Z `PILOT_AI_OFFLINE=1` gra działa bez żadnego klucza.
- **Liczby tylko z silnika.** Żadnych kwot wpisanych na sztywno w komponentach.

## Godziny

| Kiedy | Co |
|---|---|
| pt 23:00 | checkpoint 1: silnik E-01…E-05 scalony; ekrany G09, G10, G13 na placeholderach; teksty startowe, strażnik liczb, reakcje, napisy |
| **sob 12:00** | **checkpoint 2: cała ścieżka demo klikalna na placeholderach (lokalny build produkcyjny), test e2e zielony; przegląd mediów** — inaczej wariant awaryjny U-11 i cięcia |
| sob 23:00 | feature freeze — od teraz tylko poprawki |
| ndz 08:00 | code freeze, buildy lokalne na dwóch laptopach |
| ndz przed 10:00 | zgłoszenie |

Kolejność cięć, gdy brakuje czasu: `BUILD-PLAN.md` §7. Nigdy nie tniemy: liczb silnika, Cash Flow, porażki z cofnięciem, planu z walidacją, napisów.

## Gdy coś blokuje

- Brakuje funkcji silnika → używaj tego, co zwraca teraz (dane testowe), wpisz potrzebę w handoff, napisz do osoby A.
- Specyfikacja nie rozstrzyga → nie zgaduj, zapisz pytanie w handoffie, pytaj na czacie zespołu.
- Utknąłeś na zadaniu ponad 90 minut → powiedz koordynatorowi; zadanie dzielimy albo robimy prostszą wersję.

## Ściąga git

```bash
git status -sb                         # gdzie jestem, co zmienione
git pull origin develop                # dociągnij scalone zmiany
git add -A && git commit -m "feat: U-05 world route G10"
git push -u origin lane/ui             # wypchnij swoją gałąź
git stash / git stash pop              # odłóż / przywróć niezacommitowane zmiany
```

W Claude Code przez `!` zawsze zaczynaj od `cd /c/Users/.../hackathon_first_commit && …` (ukośniki `/`, nie `\`).
