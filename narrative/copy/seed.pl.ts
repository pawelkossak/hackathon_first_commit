// Seed copy for the demo path in 4 player/narrator gender variants.
// BUILD-PLAN.md §3.2, §5 N-01.
import type { CopyRecord } from "../types";

export const SEED_COPY: Record<string, CopyRecord> = {
  "intro.owner": {
    "player-female_narrator-female": "Jestem Ania i prowadzę to studio. Mam klientów, dobre pomysły i kawę na trzy dni. Z pieniędzmi bywa różnie.",
    "player-male_narrator-female": "Jestem Ania i prowadzę to studio. Mam klientów, dobre pomysły i kawę na trzy dni. Z pieniędzmi bywa różnie.",
    "player-female_narrator-male": "Jestem właścicielem tego studia. Mam klientów, dobre pomysły i kawę na trzy dni. Z pieniędzmi bywa różnie.",
    "player-male_narrator-male": "Jestem właścicielem tego studia. Mam klientów, dobre pomysły i kawę na trzy dni. Z pieniędzmi bywa różnie."
  },
  "intro.role": {
    "player-female_narrator-female": "Zaprosiłam Cię, żeby pomóc przeprowadzić moje studio przez grudzień. Nie szukam pracownika. Szukam dobrego kursu.",
    "player-male_narrator-female": "Zaprosiłam Cię, żeby pomóc przeprowadzić moje studio przez grudzień. Nie szukam pracownika. Szukam dobrego kursu.",
    "player-female_narrator-male": "Zaprosiłem Cię, żeby pomóc przeprowadzić moje studio przez grudzień. Nie szukam pracownika. Szukam dobrego kursu.",
    "player-male_narrator-male": "Zaprosiłem Cię, żeby pomóc przeprowadzić moje studio przez grudzień. Nie szukam pracownika. Szukam dobrego kursu."
  },
  "intro.goal": {
    "player-female_narrator-female": "Przeprowadź firmę przez grudzień, zanim faktury zaczną gryźć.",
    "player-male_narrator-female": "Przeprowadź firmę przez grudzień, zanim faktury zaczną gryźć.",
    "player-female_narrator-male": "Przeprowadź firmę przez grudzień, zanim faktury zaczną gryźć.",
    "player-male_narrator-male": "Przeprowadź firmę przez grudzień, zanim faktury zaczną gryźć."
  },
  "intro.practice": {
    "player-female_narrator-female": "Negocjuj, sprawdzaj skutki i cofaj czas. Tutaj błędy można przećwiczyć.",
    "player-male_narrator-female": "Negocjuj, sprawdzaj skutki i cofaj czas. Tutaj błędy można przećwiczyć.",
    "player-female_narrator-male": "Negocjuj, sprawdzaj skutki i cofaj czas. Tutaj błędy można przećwiczyć.",
    "player-male_narrator-male": "Negocjuj, sprawdzaj skutki i cofaj czas. Tutaj błędy można przećwiczyć."
  },
  "map.start": {
    "player-female_narrator-female": "Pilnuj płatności, negocjuj terminy i dbaj o relacje. Firma jest moja, ale kurs wybieramy razem.",
    "player-male_narrator-female": "Pilnuj płatności, negocjuj terminy i dbaj o relacje. Firma jest moja, ale kurs wybieramy razem.",
    "player-female_narrator-male": "Pilnuj płatności, negocjuj terminy i dbaj o relacje. Firma jest moja, ale kurs wybieramy razem.",
    "player-male_narrator-male": "Pilnuj płatności, negocjuj terminy i dbaj o relacje. Firma jest moja, ale kurs wybieramy razem."
  },
  "mission.storm": {
    "player-female_narrator-female": "Grudzień ma dla nas kilka niespodzianek. Sprawdź na trasie, kiedy przelew może nie wystartować. Ja w tym czasie... zaparzę mocniejszą kawę.",
    "player-male_narrator-female": "Grudzień ma dla nas kilka niespodzianek. Sprawdź na trasie, kiedy przelew może nie wystartować. Ja w tym czasie... zaparzę mocniejszą kawę.",
    "player-female_narrator-male": "Grudzień ma dla nas kilka niespodzianek. Sprawdź na trasie, kiedy przelew może nie wystartować. Ja w tym czasie... zaparzę mocniejszą kawę.",
    "player-male_narrator-male": "Grudzień ma dla nas kilka niespodzianek. Sprawdź na trasie, kiedy przelew może nie wystartować. Ja w tym czasie... zaparzę mocniejszą kawę."
  },
  "event.account": {
    "player-female_narrator-female": "Faktura na trzydzieści pięć tysięcy siedemset złotych ma inny numer konta niż zwykle.",
    "player-male_narrator-female": "Faktura na trzydzieści pięć tysięcy siedemset złotych ma inny numer konta niż zwykle.",
    "player-female_narrator-male": "Faktura na trzydzieści pięć tysięcy siedemset złotych ma inny numer konta niż zwykle.",
    "player-male_narrator-male": "Faktura na trzydzieści pięć tysięcy siedemset złotych ma inny numer konta niż zwykle."
  },
  "event.account.joke": {
    "player-female_narrator-female": "Faktura ta sama. Konto jakby po liftingu.",
    "player-male_narrator-female": "Faktura ta sama. Konto jakby po liftingu.",
    "player-female_narrator-male": "Faktura ta sama. Konto jakby po liftingu.",
    "player-male_narrator-male": "Faktura ta sama. Konto jakby po liftingu."
  },
  "event.account.safe": {
    "player-female_narrator-female": "Sprawdzone! Tak się robi bezpieczne przelewy. Podejrzliwość czasem świetnie się opłaca.",
    "player-male_narrator-female": "Sprawdzone! Tak się robi bezpieczne przelewy. Podejrzliwość czasem świetnie się opłaca.",
    "player-female_narrator-male": "Sprawdzone! Tak się robi bezpieczne przelewy. Podejrzliwość czasem świetnie się opłaca.",
    "player-male_narrator-male": "Sprawdzone! Tak się robi bezpieczne przelewy. Podejrzliwość czasem świetnie się opłaca."
  },
  "advance.joke": {
    "player-female_narrator-female": "Podobno o pieniądzach się nie rozmawia. Na szczęście prowadzimy firmę.",
    "player-male_narrator-female": "Podobno o pieniądzach się nie rozmawia. Na szczęście prowadzimy firmę.",
    "player-female_narrator-male": "Podobno o pieniądzach się nie rozmawia. Na szczęście prowadzimy firmę.",
    "player-male_narrator-male": "Podobno o pieniądzach się nie rozmawia. Na szczęście prowadzimy firmę."
  },
  "advance.confirmed": {
    "player-female_narrator-female": "Mamy zaliczkę! Piętnaście tysięcy złotych do trzeciego grudnia. Teraz to jest kurs!",
    "player-male_narrator-female": "Mamy zaliczkę! Piętnaście tysięcy złotych do trzeciego grudnia. Teraz to jest kurs!",
    "player-female_narrator-male": "Mamy zaliczkę! Piętnaście tysięcy złotych do trzeciego grudnia. Teraz to jest kurs!",
    "player-male_narrator-male": "Mamy zaliczkę! Piętnaście tysięcy złotych do trzeciego grudnia. Teraz to jest kurs!"
  },
  "move.praise": {
    "player-female_narrator-female": "Świetny manewr. Poradziłaś sobie z tym jak trzeba.",
    "player-male_narrator-female": "Świetny manewr. Poradziłeś sobie z tym jak trzeba.",
    "player-female_narrator-male": "Świetny manewr. Poradziłaś sobie z tym jak trzeba.",
    "player-male_narrator-male": "Świetny manewr. Poradziłeś sobie z tym jak trzeba."
  },
  "cashflow.explain": {
    "player-female_narrator-female": "Tu widać, co zrobią nasze pieniądze. Porównaj prognozę bez działania z wybraną decyzją. Same faktury nie utrzymają nas w powietrzu.",
    "player-male_narrator-female": "Tu widać, co zrobią nasze pieniądze. Porównaj prognozę bez działania z wybraną decyzją. Same faktury nie utrzymają nas w powietrzu.",
    "player-female_narrator-male": "Tu widać, co zrobią nasze pieniądze. Porównaj prognozę bez działania z wybraną decyzją. Same faktury nie utrzymają nas w powietrzu.",
    "player-male_narrator-male": "Tu widać, co zrobią nasze pieniądze. Porównaj prognozę bez działania z wybraną decyzją. Same faktury nie utrzymają nas w powietrzu."
  },
  "cashflow.joke": {
    "player-female_narrator-female": "To nie rollercoaster. To nasze przelewy.",
    "player-male_narrator-female": "To nie rollercoaster. To nasze przelewy.",
    "player-female_narrator-male": "To nie rollercoaster. To nasze przelewy.",
    "player-male_narrator-male": "To nie rollercoaster. To nasze przelewy."
  },
  "event.order": {
    "player-female_narrator-female": "Nowe zlecenie: sześć tysięcy złotych netto. Podwykonawca potrzebuje trzech tysięcy już czternastego grudnia. Klient zapłaci pod koniec stycznia. Ładny zysk. Tylko za co wystartujemy?",
    "player-male_narrator-female": "Nowe zlecenie: sześć tysięcy złotych netto. Podwykonawca potrzebuje trzech tysięcy już czternastego grudnia. Klient zapłaci pod koniec stycznia. Ładny zysk. Tylko za co wystartujemy?",
    "player-female_narrator-male": "Nowe zlecenie: sześć tysięcy złotych netto. Podwykonawca potrzebuje trzech tysięcy już czternastego grudnia. Klient zapłaci pod koniec stycznia. Ładny zysk. Tylko za co wystartujemy?",
    "player-male_narrator-male": "Nowe zlecenie: sześć tysięcy złotych netto. Podwykonawca potrzebuje trzech tysięcy już czternastego grudnia. Klient zapłaci pod koniec stycznia. Ładny zysk. Tylko za co wystartujemy?"
  },
  "event.tool": {
    "player-female_narrator-female": "Czterysta złotych miesięcznie. Około ośmiu godzin pracy mniej. Brzmi świetnie. Tylko czy właśnie teraz mamy na to paliwo?",
    "player-male_narrator-female": "Czterysta złotych miesięcznie. Około ośmiu godzin pracy mniej. Brzmi świetnie. Tylko czy właśnie teraz mamy na to paliwo?",
    "player-female_narrator-male": "Czterysta złotych miesięcznie. Około ośmiu godzin pracy mniej. Brzmi świetnie. Tylko czy właśnie teraz mamy na to paliwo?",
    "player-male_narrator-male": "Czterysta złotych miesięcznie. Około ośmiu godzin pracy mniej. Brzmi świetnie. Tylko czy właśnie teraz mamy na to paliwo?"
  },
  "event.late": {
    "player-female_narrator-female": "Klient znowu gra na czas. Sprawdź, czy nasza wcześniejsza decyzja już zabezpieczyła tę fakturę. Ja w tym czasie policzę do dziesięciu.",
    "player-male_narrator-female": "Klient znowu gra na czas. Sprawdź, czy nasza wcześniejsza decyzja już zabezpieczyła tę fakturę. Ja w tym czasie policzę do dziesięciu.",
    "player-female_narrator-male": "Klient znowu gra na czas. Sprawdź, czy nasza wcześniejsza decyzja już zabezpieczyła tę fakturę. Ja w tym czasie policzę do dziesięciu.",
    "player-male_narrator-male": "Klient znowu gra na czas. Sprawdź, czy nasza wcześniejsza decyzja już zabezpieczyła tę fakturę. Ja w tym czasie policzę do dziesięciu."
  },
  "client.late.joke": {
    "player-female_narrator-female": "Klient zapewnia, że przelew już wyszedł. Chyba pieszo.",
    "player-male_narrator-female": "Klient zapewnia, że przelew już wyszedł. Chyba pieszo.",
    "player-female_narrator-male": "Klient zapewnia, że przelew już wyszedł. Chyba pieszo.",
    "player-male_narrator-male": "Klient zapewnia, że przelew już wyszedł. Chyba pieszo."
  },
  "loan.source": {
    "player-female_narrator-female": "To oferta pozabankowa z SMS-a. Doradca banku proponuje wyłącznie limit w koncie.",
    "player-male_narrator-female": "To oferta pozabankowa z SMS-a. Doradca banku proponuje wyłącznie limit w koncie.",
    "player-female_narrator-male": "To oferta pozabankowa z SMS-a. Doradca banku proponuje wyłącznie limit w koncie.",
    "player-male_narrator-male": "To oferta pozabankowa z SMS-a. Doradca banku proponuje wyłącznie limit w koncie."
  },
  "loan.repayment": {
    "player-female_narrator-female": "piętnaście tysięcy złotych teraz. siedemnaście tysięcy czterysta złotych do oddania do dwudziestego stycznia.",
    "player-male_narrator-female": "piętnaście tysięcy złotych teraz. siedemnaście tysięcy czterysta złotych do oddania do dwudziestego stycznia.",
    "player-female_narrator-male": "piętnaście tysięcy złotych teraz. siedemnaście tysięcy czterysta złotych do oddania do dwudziestego stycznia.",
    "player-male_narrator-male": "piętnaście tysięcy złotych teraz. siedemnaście tysięcy czterysta złotych do oddania do dwudziestego stycznia."
  },
  "loan.joke": {
    "player-female_narrator-female": "Szybko to ja robię kawę. Sprawdźmy koszt.",
    "player-male_narrator-female": "Szybko to ja robię kawę. Sprawdźmy koszt.",
    "player-female_narrator-male": "Szybko to ja robię kawę. Sprawdźmy koszt.",
    "player-male_narrator-male": "Szybko to ja robię kawę. Sprawdźmy koszt."
  },
  "loan.cost": {
    "player-female_narrator-female": "Koszt wynosi dwa tysiące czterysta złotych. To szacunek w scenariuszu demonstracyjnym.",
    "player-male_narrator-female": "Koszt wynosi dwa tysiące czterysta złotych. To szacunek w scenariuszu demonstracyjnym.",
    "player-female_narrator-male": "Koszt wynosi dwa tysiące czterysta złotych. To szacunek w scenariuszu demonstracyjnym.",
    "player-male_narrator-male": "Koszt wynosi dwa tysiące czterysta złotych. To szacunek w scenariuszu demonstracyjnym."
  },
  "hint.options": {
    "player-female_narrator-female": "Sprawdźmy, co zdąży zadziałać przed płatnością. Porównanie pokazuje najtańsze dostępne rozwiązania. Ten kalendarz da się jeszcze przechytrzyć.",
    "player-male_narrator-female": "Sprawdźmy, co zdąży zadziałać przed płatnością. Porównanie pokazuje najtańsze dostępne rozwiązania. Ten kalendarz da się jeszcze przechytrzyć.",
    "player-female_narrator-male": "Sprawdźmy, co zdąży zadziałać przed płatnością. Porównanie pokazuje najtańsze dostępne rozwiązania. Ten kalendarz da się jeszcze przechytrzyć.",
    "player-male_narrator-male": "Sprawdźmy, co zdąży zadziałać przed płatnością. Porównanie pokazuje najtańsze dostępne rozwiązania. Ten kalendarz da się jeszcze przechytrzyć."
  },
  "week.report": {
    "player-female_narrator-female": "Podatek od towarów i usług został zapłacony na czas. Rachunek oddycha, ale patrzmy dalej niż dzisiejsze saldo.",
    "player-male_narrator-female": "Podatek od towarów i usług został zapłacony na czas. Rachunek oddycha, ale patrzmy dalej niż dzisiejsze saldo.",
    "player-female_narrator-male": "Podatek od towarów i usług został zapłacony na czas. Rachunek oddycha, ale patrzmy dalej niż dzisiejsze saldo.",
    "player-male_narrator-male": "Podatek od towarów i usług został zapłacony na czas. Rachunek oddycha, ale patrzmy dalej niż dzisiejsze saldo."
  },
  "week.quiet": {
    "player-female_narrator-female": "Nic nie wybuchło. W biznesie to też jest wiadomość.",
    "player-male_narrator-female": "Nic nie wybuchło. W biznesie to też jest wiadomość.",
    "player-female_narrator-male": "Nic nie wybuchło. W biznesie to też jest wiadomość.",
    "player-male_narrator-male": "Nic nie wybuchło. W biznesie to też jest wiadomość."
  },
  "turn.travel": {
    "player-female_narrator-female": "Proszę zapiąć terminy płatności.",
    "player-male_narrator-female": "Proszę zapiąć terminy płatności.",
    "player-female_narrator-male": "Proszę zapiąć terminy płatności.",
    "player-male_narrator-male": "Proszę zapiąć terminy płatności."
  },
  "success.joke": {
    "player-female_narrator-female": "Można spać. Najpierw zapiszmy, co zadziałało.",
    "player-male_narrator-female": "Można spać. Najpierw zapiszmy, co zadziałało.",
    "player-female_narrator-male": "Można spać. Najpierw zapiszmy, co zadziałało.",
    "player-male_narrator-male": "Można spać. Najpierw zapiszmy, co zadziałało."
  },
  "success.avoided": {
    "player-female_narrator-female": "Grudzień za nami! Teraz porównaj koszt naszego manewru z pożyczką. Liczby też zasługują na szczęśliwe zakończenie.",
    "player-male_narrator-female": "Grudzień za nami! Teraz porównaj koszt naszego manewru z pożyczką. Liczby też zasługują na szczęśliwe zakończenie.",
    "player-female_narrator-male": "Grudzień za nami! Teraz porównaj koszt naszego manewru z pożyczką. Liczby też zasługują na szczęśliwe zakończenie.",
    "player-male_narrator-male": "Grudzień za nami! Teraz porównaj koszt naszego manewru z pożyczką. Liczby też zasługują na szczęśliwe zakończenie."
  },
  "success.pending": {
    "player-female_narrator-female": "Sprawdź wynik. Każda gwiazdka ma tu konkretny powód. A dobry manewr warto zapisać.",
    "player-male_narrator-female": "Sprawdź wynik. Każda gwiazdka ma tu konkretny powód. A dobry manewr warto zapisać.",
    "player-female_narrator-male": "Sprawdź wynik. Każda gwiazdka ma tu konkretny powód. A dobry manewr warto zapisać.",
    "player-male_narrator-male": "Sprawdź wynik. Każda gwiazdka ma tu konkretny powód. A dobry manewr warto zapisać."
  },
  "failure.cause": {
    "player-female_narrator-female": "Przelew odrzucony. Tego właśnie chciałam uniknąć. Sprawdź, kiedy zabrakło pieniędzy i ile. Spokojnie... mamy pokrętło czasu.",
    "player-male_narrator-female": "Przelew odrzucony. Tego właśnie chciałam uniknąć. Sprawdź, kiedy zabrakło pieniędzy i ile. Spokojnie... mamy pokrętło czasu.",
    "player-female_narrator-male": "Przelew odrzucony. Tego właśnie chciałem uniknąć. Sprawdź, kiedy zabrakło pieniędzy i ile. Spokojnie... mamy pokrętło czasu.",
    "player-male_narrator-male": "Przelew odrzucony. Tego właśnie chciałem uniknąć. Sprawdź, kiedy zabrakło pieniędzy i ile. Spokojnie... mamy pokrętło czasu."
  },
  "failure.joke": {
    "player-female_narrator-female": "Mieliśmy negocjować termin, nie własną upadłość!",
    "player-male_narrator-female": "Mieliśmy negocjować termin, nie własną upadłość!",
    "player-female_narrator-male": "Mieliśmy negocjować termin, nie własną upadłość!",
    "player-male_narrator-male": "Mieliśmy negocjować termin, nie własną upadłość!"
  },
  "failure.support": {
    "player-female_narrator-female": "To próba. Cofnijmy się i spróbujmy inaczej.",
    "player-male_narrator-female": "To próba. Cofnijmy się i spróbujmy inaczej.",
    "player-female_narrator-male": "To próba. Cofnijmy się i spróbujmy inaczej.",
    "player-male_narrator-male": "To próba. Cofnijmy się i spróbujmy inaczej."
  },
  "rewind.help": {
    "player-female_narrator-female": "Wybierz tydzień, do którego chcesz wrócić. Tym razem kalendarz niech pilnuje się nas.",
    "player-male_narrator-female": "Wybierz tydzień, do którego chcesz wrócić. Tym razem kalendarz niech pilnuje się nas.",
    "player-female_narrator-male": "Wybierz tydzień, do którego chcesz wrócić. Tym razem kalendarz niech pilnuje się nas.",
    "player-male_narrator-male": "Wybierz tydzień, do którego chcesz wrócić. Tym razem kalendarz niech pilnuje się nas."
  },
  "plan.saved": {
    "player-female_narrator-female": "Plan zapisany. Teraz nasz manewr ma ciąg dalszy!",
    "player-male_narrator-female": "Plan zapisany. Teraz nasz manewr ma ciąg dalszy!",
    "player-female_narrator-male": "Plan zapisany. Teraz nasz manewr ma ciąg dalszy!",
    "player-male_narrator-male": "Plan zapisany. Teraz nasz manewr ma ciąg dalszy!"
  },
  "plan.goal": {
    "player-female_narrator-female": "Wybierz decyzję, którą chcesz zapisać jako plan. Kwota i termin są na ekranie. Zobaczymy, jak nasz manewr sprawdzi się na koncie.",
    "player-male_narrator-female": "Wybierz decyzję, którą chcesz zapisać jako plan. Kwota i termin są na ekranie. Zobaczymy, jak nasz manewr sprawdzi się na koncie.",
    "player-female_narrator-male": "Wybierz decyzję, którą chcesz zapisać jako plan. Kwota i termin są na ekranie. Zobaczymy, jak nasz manewr sprawdzi się na koncie.",
    "player-male_narrator-male": "Wybierz decyzję, którą chcesz zapisać jako plan. Kwota i termin są na ekranie. Zobaczymy, jak nasz manewr sprawdzi się na koncie."
  },
  "plan.met": {
    "player-female_narrator-female": "Plan potwierdzony! Nasza decyzja właśnie spotkała się z kontem. I proszę... jednak można wyprzedzić kalendarz.",
    "player-male_narrator-female": "Plan potwierdzony! Nasza decyzja właśnie spotkała się z kontem. I proszę... jednak można wyprzedzić kalendarz.",
    "player-female_narrator-male": "Plan potwierdzony! Nasza decyzja właśnie spotkała się z kontem. I proszę... jednak można wyprzedzić kalendarz.",
    "player-male_narrator-male": "Plan potwierdzony! Nasza decyzja właśnie spotkała się z kontem. I proszę... jednak można wyprzedzić kalendarz."
  },
  "plan.missed": {
    "player-female_narrator-female": "Plan potrzebuje poprawki. Zobacz szczegóły na koncie. Dobra wiadomość? Nadal uczymy się tutaj, zanim będzie naprawdę gorąco.",
    "player-male_narrator-female": "Plan potrzebuje poprawki. Zobacz szczegóły na koncie. Dobra wiadomość? Nadal uczymy się tutaj, zanim będzie naprawdę gorąco.",
    "player-female_narrator-male": "Plan potrzebuje poprawki. Zobacz szczegóły na koncie. Dobra wiadomość? Nadal uczymy się tutaj, zanim będzie naprawdę gorąco.",
    "player-male_narrator-male": "Plan potrzebuje poprawki. Zobacz szczegóły na koncie. Dobra wiadomość? Nadal uczymy się tutaj, zanim będzie naprawdę gorąco."
  },
  "close.pitch": {
    "player-female_narrator-female": "Przeszliśmy grudzień w grze, zanim przeszliśmy go na koncie.",
    "player-male_narrator-female": "Przeszliśmy grudzień w grze, zanim przeszliśmy go na koncie.",
    "player-female_narrator-male": "Przeszliśmy grudzień w grze, zanim przeszliśmy go na koncie.",
    "player-male_narrator-male": "Przeszliśmy grudzień w grze, zanim przeszliśmy go na koncie."
  },
  "factoring.joke": {
    "player-female_narrator-female": "Faktura ma termin. My mamy poniedziałek.",
    "player-male_narrator-female": "Faktura ma termin. My mamy poniedziałek.",
    "player-female_narrator-male": "Faktura ma termin. My mamy poniedziałek.",
    "player-male_narrator-male": "Faktura ma termin. My mamy poniedziałek."
  },
  "factoring.fee": {
    "player-female_narrator-female": "Koszt scenariusza: trzysta cztery złote",
    "player-male_narrator-female": "Koszt scenariusza: trzysta cztery złote",
    "player-female_narrator-male": "Koszt scenariusza: trzysta cztery złote",
    "player-male_narrator-male": "Koszt scenariusza: trzysta cztery złote"
  },
  "factoring.receipt": {
    "player-female_narrator-female": "Wpływ: dziewiętnaście tysięcy dziewięćset dziewięćdziesiąt jeden złotych",
    "player-male_narrator-female": "Wpływ: dziewiętnaście tysięcy dziewięćset dziewięćdziesiąt jeden złotych",
    "player-female_narrator-male": "Wpływ: dziewiętnaście tysięcy dziewięćset dziewięćdziesiąt jeden złotych",
    "player-male_narrator-male": "Wpływ: dziewiętnaście tysięcy dziewięćset dziewięćdziesiąt jeden złotych"
  },
  "factoring.low": {
    "player-female_narrator-female": "Zobacz, jak finansowanie faktury zmienia najniższe saldo. I koniecznie porównaj koszt z pozostałymi manewrami.",
    "player-male_narrator-female": "Zobacz, jak finansowanie faktury zmienia najniższe saldo. I koniecznie porównaj koszt z pozostałymi manewrami.",
    "player-female_narrator-male": "Zobacz, jak finansowanie faktury zmienia najniższe saldo. I koniecznie porównaj koszt z pozostałymi manewrami.",
    "player-male_narrator-male": "Zobacz, jak finansowanie faktury zmienia najniższe saldo. I koniecznie porównaj koszt z pozostałymi manewrami."
  },
  "compare.ethics": {
    "player-female_narrator-female": "Szybciej nie zawsze znaczy taniej. Policzmy.",
    "player-male_narrator-female": "Szybciej nie zawsze znaczy taniej. Policzmy.",
    "player-female_narrator-male": "Szybciej nie zawsze znaczy taniej. Policzmy.",
    "player-male_narrator-male": "Szybciej nie zawsze znaczy taniej. Policzmy."
  },
  "loader.start": {
    "player-female_narrator-female": "Szefowa szuka kalkulatora. Kot wie, gdzie jest.",
    "player-male_narrator-female": "Szefowa szuka kalkulatora. Kot wie, gdzie jest.",
    "player-female_narrator-male": "Szef szuka kalkulatora. Kot wie, gdzie jest.",
    "player-male_narrator-male": "Szef szuka kalkulatora. Kot wie, gdzie jest."
  },
  "offline.joke": {
    "player-female_narrator-female": "Internet poszedł po kawę.",
    "player-male_narrator-female": "Internet poszedł po kawę.",
    "player-female_narrator-male": "Internet poszedł po kawę.",
    "player-male_narrator-male": "Internet poszedł po kawę."
  },
  "logout.goodbye": {
    "player-female_narrator-female": "Do zobaczenia na kolejnej turze!",
    "player-male_narrator-female": "Do zobaczenia na kolejnej turze!",
    "player-female_narrator-male": "Do zobaczenia na kolejnej turze!",
    "player-male_narrator-male": "Do zobaczenia na kolejnej turze!"
  },
  "return.welcome": {
    "player-female_narrator-female": "Witaj z powrotem na pokładzie! Firma cierpliwie czekała. Kawa trochę mniej. Zobaczmy, gdzie skończyliśmy.",
    "player-male_narrator-female": "Witaj z powrotem na pokładzie! Firma cierpliwie czekała. Kawa trochę mniej. Zobaczmy, gdzie skończyliśmy.",
    "player-female_narrator-male": "Witaj z powrotem na pokładzie! Firma cierpliwie czekała. Kawa trochę mniej. Zobaczmy, gdzie skończyliśmy.",
    "player-male_narrator-male": "Witaj z powrotem na pokładzie! Firma cierpliwie czekała. Kawa trochę mniej. Zobaczmy, gdzie skończyliśmy."
  },
  "map.next": {
    "player-female_narrator-female": "Pierwsze okrążenie za nami. Zobacz, co czeka dalej. W tym kalendarzu przygód nam nie zabraknie.",
    "player-male_narrator-female": "Pierwsze okrążenie za nami. Zobacz, co czeka dalej. W tym kalendarzu przygód nam nie zabraknie.",
    "player-female_narrator-male": "Pierwsze okrążenie za nami. Zobacz, co czeka dalej. W tym kalendarzu przygód nam nie zabraknie.",
    "player-male_narrator-male": "Pierwsze okrążenie za nami. Zobacz, co czeka dalej. W tym kalendarzu przygód nam nie zabraknie."
  },
  "event.account.risky": {
    "player-female_narrator-female": "Zmienione konto bez sprawdzenia? Oby to nie był najdroższy skrót tego grudnia.",
    "player-male_narrator-female": "Zmienione konto bez sprawdzenia? Oby to nie był najdroższy skrót tego grudnia.",
    "player-female_narrator-male": "Zmienione konto bez sprawdzenia? Oby to nie był najdroższy skrót tego grudnia.",
    "player-male_narrator-male": "Zmienione konto bez sprawdzenia? Oby to nie był najdroższy skrót tego grudnia."
  },
  "event.order.accept": {
    "player-female_narrator-female": "Zlecenie przyjęte. Zysk wygląda apetycznie, ale podwykonawca też musi coś jeść. Sprawdź, kiedy trzeba mu zapłacić.",
    "player-male_narrator-female": "Zlecenie przyjęte. Zysk wygląda apetycznie, ale podwykonawca też musi coś jeść. Sprawdź, kiedy trzeba mu zapłacić.",
    "player-female_narrator-male": "Zlecenie przyjęte. Zysk wygląda apetycznie, ale podwykonawca też musi coś jeść. Sprawdź, kiedy trzeba mu zapłacić.",
    "player-male_narrator-male": "Zlecenie przyjęte. Zysk wygląda apetycznie, ale podwykonawca też musi coś jeść. Sprawdź, kiedy trzeba mu zapłacić."
  },
  "event.order.decline": {
    "player-female_narrator-female": "Nie każde zlecenie musi teraz wskakiwać na pokład. Czasem najlepszy manewr to poczekać.",
    "player-male_narrator-female": "Nie każde zlecenie musi teraz wskakiwać na pokład. Czasem najlepszy manewr to poczekać.",
    "player-female_narrator-male": "Nie każde zlecenie musi teraz wskakiwać na pokład. Czasem najlepszy manewr to poczekać.",
    "player-male_narrator-male": "Nie każde zlecenie musi teraz wskakiwać na pokład. Czasem najlepszy manewr to poczekać."
  },
  "event.tool.now": {
    "player-female_narrator-female": "Kupujemy narzędzie. Niech oszczędza godziny, a my sprawdźmy, czy nie zjada zapasu na płatności.",
    "player-male_narrator-female": "Kupujemy narzędzie. Niech oszczędza godziny, a my sprawdźmy, czy nie zjada zapasu na płatności.",
    "player-female_narrator-male": "Kupujemy narzędzie. Niech oszczędza godziny, a my sprawdźmy, czy nie zjada zapasu na płatności.",
    "player-male_narrator-male": "Kupujemy narzędzie. Niech oszczędza godziny, a my sprawdźmy, czy nie zjada zapasu na płatności."
  },
  "event.tool.later": {
    "player-female_narrator-female": "Narzędzie poczeka. Kalendarz urzędu skarbowego raczej nie.",
    "player-male_narrator-female": "Narzędzie poczeka. Kalendarz urzędu skarbowego raczej nie.",
    "player-female_narrator-male": "Narzędzie poczeka. Kalendarz urzędu skarbowego raczej nie.",
    "player-male_narrator-male": "Narzędzie poczeka. Kalendarz urzędu skarbowego raczej nie."
  },
  "event.late.secured": {
    "player-female_narrator-female": "Klient się spóźni? Tym razem ta faktura ma już zabezpieczony lot. Sprawdź, jak zadziałała wcześniejsza decyzja.",
    "player-male_narrator-female": "Klient się spóźni? Tym razem ta faktura ma już zabezpieczony lot. Sprawdź, jak zadziałała wcześniejsza decyzja.",
    "player-female_narrator-male": "Klient się spóźni? Tym razem ta faktura ma już zabezpieczony lot. Sprawdź, jak zadziałała wcześniejsza decyzja.",
    "player-male_narrator-male": "Klient się spóźni? Tym razem ta faktura ma już zabezpieczony lot. Sprawdź, jak zadziałała wcześniejsza decyzja."
  },
  "move.delegated": {
    "player-female_narrator-female": "Drugi pilot pomógł. Ale następnym razem spróbuj przejąć stery. Właśnie tak rosną umiejętności.",
    "player-male_narrator-female": "Drugi pilot pomógł. Ale następnym razem spróbuj przejąć stery. Właśnie tak rosną umiejętności.",
    "player-female_narrator-male": "Drugi pilot pomógł. Ale następnym razem spróbuj przejąć stery. Właśnie tak rosną umiejętności.",
    "player-male_narrator-male": "Drugi pilot pomógł. Ale następnym razem spróbuj przejąć stery. Właśnie tak rosną umiejętności."
  },
  "advance.closed": {
    "player-female_narrator-female": "Za późno na zaliczkę. Budżet klienta już zamknięty. Cóż... następnym razem pukamy, zanim zgaszą światło.",
    "player-male_narrator-female": "Za późno na zaliczkę. Budżet klienta już zamknięty. Cóż... następnym razem pukamy, zanim zgaszą światło.",
    "player-female_narrator-male": "Za późno na zaliczkę. Budżet klienta już zamknięty. Cóż... następnym razem pukamy, zanim zgaszą światło.",
    "player-male_narrator-male": "Za późno na zaliczkę. Budżet klienta już zamknięty. Cóż... następnym razem pukamy, zanim zgaszą światło."
  },
  "discount.confirmed": {
    "player-female_narrator-female": "Rabat przyjęty. Teraz patrzymy na termin wpływu. Zniżka bez czasu to naprawdę kiepska promocja.",
    "player-male_narrator-female": "Rabat przyjęty. Teraz patrzymy na termin wpływu. Zniżka bez czasu to naprawdę kiepska promocja.",
    "player-female_narrator-male": "Rabat przyjęty. Teraz patrzymy na termin wpływu. Zniżka bez czasu to naprawdę kiepska promocja.",
    "player-male_narrator-male": "Rabat przyjęty. Teraz patrzymy na termin wpływu. Zniżka bez czasu to naprawdę kiepska promocja."
  },
  "discount.too-late": {
    "player-female_narrator-female": "Spójrz na datę. Pieniądze ze skonta przyjdą po tej płatności. Dobry pomysł też potrafi spóźnić się na samolot.",
    "player-male_narrator-female": "Spójrz na datę. Pieniądze ze skonta przyjdą po tej płatności. Dobry pomysł też potrafi spóźnić się na samolot.",
    "player-female_narrator-male": "Spójrz na datę. Pieniądze ze skonta przyjdą po tej płatności. Dobry pomysł też potrafi spóźnić się na samolot.",
    "player-male_narrator-male": "Spójrz na datę. Pieniądze ze skonta przyjdą po tej płatności. Dobry pomysł też potrafi spóźnić się na samolot."
  },
  "postpone.warning": {
    "player-female_narrator-female": "Przesunięcie płatności przesuwa problem. Nie znika ani zobowiązanie, ani podwykonawca z dobrą pamięcią.",
    "player-male_narrator-female": "Przesunięcie płatności przesuwa problem. Nie znika ani zobowiązanie, ani podwykonawca z dobrą pamięcią.",
    "player-female_narrator-male": "Przesunięcie płatności przesuwa problem. Nie znika ani zobowiązanie, ani podwykonawca z dobrą pamięcią.",
    "player-male_narrator-male": "Przesunięcie płatności przesuwa problem. Nie znika ani zobowiązanie, ani podwykonawca z dobrą pamięcią."
  },
  "overdraft.confirmed": {
    "player-female_narrator-female": "Limit daje zapas w koncie. Korzystamy, gdy potrzeba, i pilnujemy kosztu. Cudze paliwo też ma licznik.",
    "player-male_narrator-female": "Limit daje zapas w koncie. Korzystamy, gdy potrzeba, i pilnujemy kosztu. Cudze paliwo też ma licznik.",
    "player-female_narrator-male": "Limit daje zapas w koncie. Korzystamy, gdy potrzeba, i pilnujemy kosztu. Cudze paliwo też ma licznik.",
    "player-male_narrator-male": "Limit daje zapas w koncie. Korzystamy, gdy potrzeba, i pilnujemy kosztu. Cudze paliwo też ma licznik."
  },
  "loan.confirmed": {
    "player-female_narrator-female": "Pożyczka wybrana. Sprawdź wpływ i termin spłaty. Piętnaście minut na decyzję, dużo dłużej na jej skutki.",
    "player-male_narrator-female": "Pożyczka wybrana. Sprawdź wpływ i termin spłaty. Piętnaście minut na decyzję, dużo dłużej na jej skutki.",
    "player-female_narrator-male": "Pożyczka wybrana. Sprawdź wpływ i termin spłaty. Piętnaście minut na decyzję, dużo dłużej na jej skutki.",
    "player-male_narrator-male": "Pożyczka wybrana. Sprawdź wpływ i termin spłaty. Piętnaście minut na decyzję, dużo dłużej na jej skutki."
  },
  "factoring.confirmed": {
    "player-female_narrator-female": "Faktoring wybrany. Sprawdź datę wypłaty i koszt. Faktura ma teraz inny plan lotu.",
    "player-male_narrator-female": "Faktoring wybrany. Sprawdź datę wypłaty i koszt. Faktura ma teraz inny plan lotu.",
    "player-female_narrator-male": "Faktoring wybrany. Sprawdź datę wypłaty i koszt. Faktura ma teraz inny plan lotu.",
    "player-male_narrator-male": "Faktoring wybrany. Sprawdź datę wypłaty i koszt. Faktura ma teraz inny plan lotu."
  },
  "compare.free-option": {
    "player-female_narrator-female": "Jeśli zaliczka jest jeszcze dostępna, porównaj ją z płatnym finansowaniem. Bezpłatny manewr też zasługuje na uwagę.",
    "player-male_narrator-female": "Jeśli zaliczka jest jeszcze dostępna, porównaj ją z płatnym finansowaniem. Bezpłatny manewr też zasługuje na uwagę.",
    "player-female_narrator-male": "Jeśli zaliczka jest jeszcze dostępna, porównaj ją z płatnym finansowaniem. Bezpłatny manewr też zasługuje na uwagę.",
    "player-male_narrator-male": "Jeśli zaliczka jest jeszcze dostępna, porównaj ją z płatnym finansowaniem. Bezpłatny manewr też zasługuje na uwagę."
  },
  "week.report.2": {
    "player-female_narrator-female": "Ten tydzień za nami. Zwróć uwagę, kiedy pieniądze przychodzą, a kiedy robią sobie wycieczkę.",
    "player-male_narrator-female": "Ten tydzień za nami. Zwróć uwagę, kiedy pieniądze przychodzą, a kiedy robią sobie wycieczkę.",
    "player-female_narrator-male": "Ten tydzień za nami. Zwróć uwagę, kiedy pieniądze przychodzą, a kiedy robią sobie wycieczkę.",
    "player-male_narrator-male": "Ten tydzień za nami. Zwróć uwagę, kiedy pieniądze przychodzą, a kiedy robią sobie wycieczkę."
  },
  "week.report.3": {
    "player-female_narrator-female": "Kolejny tydzień zaliczony. Same dobre chęci rachunków nie opłacą. Dlatego patrzymy dalej.",
    "player-male_narrator-female": "Kolejny tydzień zaliczony. Same dobre chęci rachunków nie opłacą. Dlatego patrzymy dalej.",
    "player-female_narrator-male": "Kolejny tydzień zaliczony. Same dobre chęci rachunków nie opłacą. Dlatego patrzymy dalej.",
    "player-male_narrator-male": "Kolejny tydzień zaliczony. Same dobre chęci rachunków nie opłacą. Dlatego patrzymy dalej."
  },
  "week.report.4": {
    "player-female_narrator-female": "Święta blisko. Terminy płatności najwyraźniej nie biorą urlopu. Sprawdźmy następny tydzień.",
    "player-male_narrator-female": "Święta blisko. Terminy płatności najwyraźniej nie biorą urlopu. Sprawdźmy następny tydzień.",
    "player-female_narrator-male": "Święta blisko. Terminy płatności najwyraźniej nie biorą urlopu. Sprawdźmy następny tydzień.",
    "player-male_narrator-male": "Święta blisko. Terminy płatności najwyraźniej nie biorą urlopu. Sprawdźmy następny tydzień."
  },
  "week.report.5": {
    "player-female_narrator-female": "Najgęstszy fragment trasy za nami. Ale nie zasypiaj przy sterach. W styczniu też mamy kalendarz.",
    "player-male_narrator-female": "Najgęstszy fragment trasy za nami. Ale nie zasypiaj przy sterach. W styczniu też mamy kalendarz.",
    "player-female_narrator-male": "Najgęstszy fragment trasy za nami. Ale nie zasypiaj przy sterach. W styczniu też mamy kalendarz.",
    "player-male_narrator-male": "Najgęstszy fragment trasy za nami. Ale nie zasypiaj przy sterach. W styczniu też mamy kalendarz."
  },
  "week.report.6": {
    "player-female_narrator-female": "Ostatnia prosta. To moment, w którym nawet optymizm powinien zerknąć w prognozę.",
    "player-male_narrator-female": "Ostatnia prosta. To moment, w którym nawet optymizm powinien zerknąć w prognozę.",
    "player-female_narrator-male": "Ostatnia prosta. To moment, w którym nawet optymizm powinien zerknąć w prognozę.",
    "player-male_narrator-male": "Ostatnia prosta. To moment, w którym nawet optymizm powinien zerknąć w prognozę."
  },
  "plan.open": {
    "player-female_narrator-female": "Jeszcze czekamy na termin planu. Brak potwierdzenia dziś to nie dowód, że manewr się nie udał.",
    "player-male_narrator-female": "Jeszcze czekamy na termin planu. Brak potwierdzenia dziś to nie dowód, że manewr się nie udał.",
    "player-female_narrator-male": "Jeszcze czekamy na termin planu. Brak potwierdzenia dziś to nie dowód, że manewr się nie udał.",
    "player-male_narrator-male": "Jeszcze czekamy na termin planu. Brak potwierdzenia dziś to nie dowód, że manewr się nie udał."
  },
  "plan.ask": {
    "player-female_narrator-female": "To wymaga sprawdzenia. Część danych pasuje, ale nie wszystko. Wolę jedno pytanie więcej niż pewność zrobioną na skróty.",
    "player-male_narrator-female": "To wymaga sprawdzenia. Część danych pasuje, ale nie wszystko. Wolę jedno pytanie więcej niż pewność zrobioną na skróty.",
    "player-female_narrator-male": "To wymaga sprawdzenia. Część danych pasuje, ale nie wszystko. Wolę jedno pytanie więcej niż pewność zrobioną na skróty.",
    "player-male_narrator-male": "To wymaga sprawdzenia. Część danych pasuje, ale nie wszystko. Wolę jedno pytanie więcej niż pewność zrobioną na skróty."
  },
  "save.failed": {
    "player-female_narrator-female": "Zapis się nie udał. Zostań jeszcze chwilę i spróbuj ponownie. Nie chcę, żeby dobry manewr zniknął razem z zamkniętą kartą.",
    "player-male_narrator-female": "Zapis się nie udał. Zostań jeszcze chwilę i spróbuj ponownie. Nie chcę, żeby dobry manewr zniknął razem z zamkniętą kartą.",
    "player-female_narrator-male": "Zapis się nie udał. Zostań jeszcze chwilę i spróbuj ponownie. Nie chcę, żeby dobry manewr zniknął razem z zamkniętą kartą.",
    "player-male_narrator-male": "Zapis się nie udał. Zostań jeszcze chwilę i spróbuj ponownie. Nie chcę, żeby dobry manewr zniknął razem z zamkniętą kartą."
  },
  "notification.intro": {
    "player-female_narrator-female": "Tu zbieramy sprawy, które warto mieć na radarze. Przeczytajmy, zanim któraś zrobi się burzą.",
    "player-male_narrator-female": "Tu zbieramy sprawy, które warto mieć na radarze. Przeczytajmy, zanim któraś zrobi się burzą.",
    "player-female_narrator-male": "Tu zbieramy sprawy, które warto mieć na radarze. Przeczytajmy, zanim któraś zrobi się burzą.",
    "player-male_narrator-male": "Tu zbieramy sprawy, które warto mieć na radarze. Przeczytajmy, zanim któraś zrobi się burzą."
  },
  "reminder.optin": {
    "player-female_narrator-female": "Mogę przypomnieć o kolejnej turze albo terminie planu. Jeśli chcesz. Nawet ja czasem odkładam wszystko do ostatniej kawy.",
    "player-male_narrator-female": "Mogę przypomnieć o kolejnej turze albo terminie planu. Jeśli chcesz. Nawet ja czasem odkładam wszystko do ostatniej kawy.",
    "player-female_narrator-male": "Mogę przypomnieć o kolejnej turze albo terminie planu. Jeśli chcesz. Nawet ja czasem odkładam wszystko do ostatniej kawy.",
    "player-male_narrator-male": "Mogę przypomnieć o kolejnej turze albo terminie planu. Jeśli chcesz. Nawet ja czasem odkładam wszystko do ostatniej kawy."
  },
  "reminder.saved": {
    "player-female_narrator-female": "Ustawienia przypomnień zapisane. Trzymamy się wybranych zasad. Nawet przygoda potrzebuje odrobiny porządku.",
    "player-male_narrator-female": "Ustawienia przypomnień zapisane. Trzymamy się wybranych zasad. Nawet przygoda potrzebuje odrobiny porządku.",
    "player-female_narrator-male": "Ustawienia przypomnień zapisane. Trzymamy się wybranych zasad. Nawet przygoda potrzebuje odrobiny porządku.",
    "player-male_narrator-male": "Ustawienia przypomnień zapisane. Trzymamy się wybranych zasad. Nawet przygoda potrzebuje odrobiny porządku."
  },
  "reminder.declined": {
    "player-female_narrator-female": "Jasne, lecimy bez przypomnień. Ster jest po twojej stronie.",
    "player-male_narrator-female": "Jasne, lecimy bez przypomnień. Ster jest po twojej stronie.",
    "player-female_narrator-male": "Jasne, lecimy bez przypomnień. Ster jest po twojej stronie.",
    "player-male_narrator-male": "Jasne, lecimy bez przypomnień. Ster jest po twojej stronie."
  },
  "voice.preview": {
    "player-female_narrator-female": "Tu Ania. Będę twoją przewodniczką po moim studiu. Załóż gogle. Czeka nas trochę liczb i sporo przygody.",
    "player-male_narrator-female": "Tu Ania. Będę twoją przewodniczką po moim studiu. Załóż gogle. Czeka nas trochę liczb i sporo przygody.",
    "player-female_narrator-male": "Tu Szef. Będę twoim przewodnikiem po moim studiu. Załóż gogle. Czeka nas trochę liczb i sporo przygody.",
    "player-male_narrator-male": "Tu Szef. Będę twoim przewodnikiem po moim studiu. Załóż gogle. Czeka nas trochę liczb i sporo przygody."
  },
  "reset.confirm": {
    "player-female_narrator-female": "Zaczynamy od nowa? Cały lot wróci na początek. Tym razem wiesz już, gdzie lubią zbierać się chmury.",
    "player-male_narrator-female": "Zaczynamy od nowa? Cały lot wróci na początek. Tym razem wiesz już, gdzie lubią zbierać się chmury.",
    "player-female_narrator-male": "Zaczynamy od nowa? Cały lot wróci na początek. Tym razem wiesz już, gdzie lubią zbierać się chmury.",
    "player-male_narrator-male": "Zaczynamy od nowa? Cały lot wróci na początek. Tym razem wiesz już, gdzie lubią zbierać się chmury."
  },
  "pause.return": {
    "player-female_narrator-female": "Przerwa zaliczona. Kalendarz jeszcze tu jest. Wracamy do sterów?",
    "player-male_narrator-female": "Przerwa zaliczona. Kalendarz jeszcze tu jest. Wracamy do sterów?",
    "player-female_narrator-male": "Przerwa zaliczona. Kalendarz jeszcze tu jest. Wracamy do sterów?",
    "player-male_narrator-male": "Przerwa zaliczona. Kalendarz jeszcze tu jest. Wracamy do sterów?"
  },
  "g05.intro": {
    "player-female_narrator-female": "Jestem Ania i prowadzę to studio. Mam klientów, dobre pomysły i kawę na trzy dni. Z pieniędzmi bywa różnie.",
    "player-male_narrator-female": "Jestem Ania i prowadzę to studio. Mam klientów, dobre pomysły i kawę na trzy dni. Z pieniędzmi bywa różnie.",
    "player-female_narrator-male": "Jestem właścicielem tego studia. Mam klientów, dobre pomysły i kawę na trzy dni. Z pieniędzmi bywa różnie.",
    "player-male_narrator-male": "Jestem właścicielem tego studia. Mam klientów, dobre pomysły i kawę na trzy dni. Z pieniędzmi bywa różnie."
  },
  "g05.role": {
    "player-female_narrator-female": "Zaprosiłam Cię, żeby pomóc przeprowadzić moje studio przez grudzień. Nie szukam pracownika. Szukam dobrego kursu.",
    "player-male_narrator-female": "Zaprosiłam Cię, żeby pomóc przeprowadzić moje studio przez grudzień. Nie szukam pracownika. Szukam dobrego kursu.",
    "player-female_narrator-male": "Zaprosiłem Cię, żeby pomóc przeprowadzić moje studio przez grudzień. Nie szukam pracownika. Szukam dobrego kursu.",
    "player-male_narrator-male": "Zaprosiłem Cię, żeby pomóc przeprowadzić moje studio przez grudzień. Nie szukam pracownika. Szukam dobrego kursu."
  },
  "g07.goal": {
    "player-female_narrator-female": "Przeprowadź firmę przez grudzień, zanim faktury zaczną gryźć.",
    "player-male_narrator-female": "Przeprowadź firmę przez grudzień, zanim faktury zaczną gryźć.",
    "player-female_narrator-male": "Przeprowadź firmę przez grudzień, zanim faktury zaczną gryźć.",
    "player-male_narrator-male": "Przeprowadź firmę przez grudzień, zanim faktury zaczną gryźć."
  },
  "g08.safe": {
    "player-female_narrator-female": "Negocjuj, sprawdzaj skutki i cofaj czas. Tutaj błędy można przećwiczyć.",
    "player-male_narrator-female": "Negocjuj, sprawdzaj skutki i cofaj czas. Tutaj błędy można przećwiczyć.",
    "player-female_narrator-male": "Negocjuj, sprawdzaj skutki i cofaj czas. Tutaj błędy można przećwiczyć.",
    "player-male_narrator-male": "Negocjuj, sprawdzaj skutki i cofaj czas. Tutaj błędy można przećwiczyć."
  },
  "g07.detail": {
    "player-female_narrator-female": "Pilnuj płatności, negocjuj terminy i dbaj o relacje. Firma jest moja, ale kurs wybieramy razem.",
    "player-male_narrator-female": "Pilnuj płatności, negocjuj terminy i dbaj o relacje. Firma jest moja, ale kurs wybieramy razem.",
    "player-female_narrator-male": "Pilnuj płatności, negocjuj terminy i dbaj o relacje. Firma jest moja, ale kurs wybieramy razem.",
    "player-male_narrator-male": "Pilnuj płatności, negocjuj terminy i dbaj o relacje. Firma jest moja, ale kurs wybieramy razem."
  },
  "g10.storm": {
    "player-female_narrator-female": "Turbulencje {forecast.lowDate}: {forecast.baselineLow}",
    "player-male_narrator-female": "Turbulencje {forecast.lowDate}: {forecast.baselineLow}",
    "player-female_narrator-male": "Turbulencje {forecast.lowDate}: {forecast.baselineLow}",
    "player-male_narrator-male": "Turbulencje {forecast.lowDate}: {forecast.baselineLow}"
  },
  "g11.body": {
    "player-female_narrator-female": "Faktura na {supplier.amount} ma inny numer konta niż zwykle.",
    "player-male_narrator-female": "Faktura na {supplier.amount} ma inny numer konta niż zwykle.",
    "player-female_narrator-male": "Faktura na {supplier.amount} ma inny numer konta niż zwykle.",
    "player-male_narrator-male": "Faktura na {supplier.amount} ma inny numer konta niż zwykle."
  },
  "g11.joke": {
    "player-female_narrator-female": "Faktura ta sama. Konto jakby po liftingu.",
    "player-male_narrator-female": "Faktura ta sama. Konto jakby po liftingu.",
    "player-female_narrator-male": "Faktura ta sama. Konto jakby po liftingu.",
    "player-male_narrator-male": "Faktura ta sama. Konto jakby po liftingu."
  },
  "g11.safeResult": {
    "player-female_narrator-female": "Weryfikacja zakończona. Bezpieczne płatności — poziom 2.",
    "player-male_narrator-female": "Weryfikacja zakończona. Bezpieczne płatności — poziom 2.",
    "player-female_narrator-male": "Weryfikacja zakończona. Bezpieczne płatności — poziom 2.",
    "player-male_narrator-male": "Weryfikacja zakończona. Bezpieczne płatności — poziom 2."
  },
  "reaction.advance": {
    "player-female_narrator-female": "Podobno o pieniądzach się nie rozmawia. Na szczęście prowadzimy firmę.",
    "player-male_narrator-female": "Podobno o pieniądzach się nie rozmawia. Na szczęście prowadzimy firmę.",
    "player-female_narrator-male": "Podobno o pieniądzach się nie rozmawia. Na szczęście prowadzimy firmę.",
    "player-male_narrator-male": "Podobno o pieniądzach się nie rozmawia. Na szczęście prowadzimy firmę."
  },
  "g14.clientCounter": {
    "player-female_narrator-female": "Mogę dać {advance.percent} — {advance.amount} do {advance.date}.",
    "player-male_narrator-female": "Mogę dać {advance.percent} — {advance.amount} do {advance.date}.",
    "player-female_narrator-male": "Mogę dać {advance.percent} — {advance.amount} do {advance.date}.",
    "player-male_narrator-male": "Mogę dać {advance.percent} — {advance.amount} do {advance.date}."
  },
  "g14.confirmed": {
    "player-female_narrator-female": "Silnik potwierdza: zaliczka {advance.amount} do {advance.date}.",
    "player-male_narrator-female": "Silnik potwierdza: zaliczka {advance.amount} do {advance.date}.",
    "player-female_narrator-male": "Silnik potwierdza: zaliczka {advance.amount} do {advance.date}.",
    "player-male_narrator-male": "Silnik potwierdza: zaliczka {advance.amount} do {advance.date}."
  },
  "reaction.goodMove": {
    "player-female_narrator-female": "Świetny manewr. Poradziłaś sobie z tym jak trzeba.",
    "player-male_narrator-female": "Świetny manewr. Poradziłeś sobie z tym jak trzeba.",
    "player-female_narrator-male": "Świetny manewr. Poradziłaś sobie z tym jak trzeba.",
    "player-male_narrator-male": "Świetny manewr. Poradziłeś sobie z tym jak trzeba."
  },
  "g30.summary": {
    "player-female_narrator-female": "Bez działania minimum {forecast.baselineLow}. Podgląd: {forecast.scenarioName}, minimum {forecast.currentLow}.",
    "player-male_narrator-female": "Bez działania minimum {forecast.baselineLow}. Podgląd: {forecast.scenarioName}, minimum {forecast.currentLow}.",
    "player-female_narrator-male": "Bez działania minimum {forecast.baselineLow}. Podgląd: {forecast.scenarioName}, minimum {forecast.currentLow}.",
    "player-male_narrator-male": "Bez działania minimum {forecast.baselineLow}. Podgląd: {forecast.scenarioName}, minimum {forecast.currentLow}."
  },
  "g12.joke": {
    "player-female_narrator-female": "To nie rollercoaster. To nasze przelewy.",
    "player-male_narrator-female": "To nie rollercoaster. To nasze przelewy.",
    "player-female_narrator-male": "To nie rollercoaster. To nasze przelewy.",
    "player-male_narrator-male": "To nie rollercoaster. To nasze przelewy."
  },
  "event.order.body": {
    "player-female_narrator-female": "{newOrder.net}. Podwykonawca potrzebuje {newOrder.supplier} już 14 grudnia, klient zapłaci pod koniec stycznia.",
    "player-male_narrator-female": "{newOrder.net}. Podwykonawca potrzebuje {newOrder.supplier} już 14 grudnia, klient zapłaci pod koniec stycznia.",
    "player-female_narrator-male": "{newOrder.net}. Podwykonawca potrzebuje {newOrder.supplier} już 14 grudnia, klient zapłaci pod koniec stycznia.",
    "player-male_narrator-male": "{newOrder.net}. Podwykonawca potrzebuje {newOrder.supplier} już 14 grudnia, klient zapłaci pod koniec stycznia."
  },
  "event.tool.body": {
    "player-female_narrator-female": "{aiTool.cost} miesięcznie, około {aiTool.hours} oszczędności w miesiącu.",
    "player-male_narrator-female": "{aiTool.cost} miesięcznie, około {aiTool.hours} oszczędności w miesiącu.",
    "player-female_narrator-male": "{aiTool.cost} miesięcznie, około {aiTool.hours} oszczędności w miesiącu.",
    "player-male_narrator-male": "{aiTool.cost} miesięcznie, około {aiTool.hours} oszczędności w miesiącu."
  },
  "event.late.body": {
    "player-female_narrator-female": "Płatność przesuwa się z 8 na 22 stycznia. Po skontowaniu lub sfinansowaniu faktury ten skutek jej nie dotyczy.",
    "player-male_narrator-female": "Płatność przesuwa się z 8 na 22 stycznia. Po skontowaniu lub sfinansowaniu faktury ten skutek jej nie dotyczy.",
    "player-female_narrator-male": "Płatność przesuwa się z 8 na 22 stycznia. Po skontowaniu lub sfinansowaniu faktury ten skutek jej nie dotyczy.",
    "player-male_narrator-male": "Płatność przesuwa się z 8 na 22 stycznia. Po skontowaniu lub sfinansowaniu faktury ten skutek jej nie dotyczy."
  },
  "reaction.late": {
    "player-female_narrator-female": "Klient zapewnia, że przelew już wyszedł. Chyba pieszo.",
    "player-male_narrator-female": "Klient zapewnia, że przelew już wyszedł. Chyba pieszo.",
    "player-female_narrator-male": "Klient zapewnia, że przelew już wyszedł. Chyba pieszo.",
    "player-male_narrator-male": "Klient zapewnia, że przelew już wyszedł. Chyba pieszo."
  },
  "g16.explanation": {
    "player-female_narrator-female": "To oferta pozabankowa z SMS-a. Doradca banku proponuje wyłącznie limit w koncie.",
    "player-male_narrator-female": "To oferta pozabankowa z SMS-a. Doradca banku proponuje wyłącznie limit w koncie.",
    "player-female_narrator-male": "To oferta pozabankowa z SMS-a. Doradca banku proponuje wyłącznie limit w koncie.",
    "player-male_narrator-male": "To oferta pozabankowa z SMS-a. Doradca banku proponuje wyłącznie limit w koncie."
  },
  "g16.repay": {
    "player-female_narrator-female": "{loan.amount} teraz. {loan.repayment} do oddania do {loan.dueDate}.",
    "player-male_narrator-female": "{loan.amount} teraz. {loan.repayment} do oddania do {loan.dueDate}.",
    "player-female_narrator-male": "{loan.amount} teraz. {loan.repayment} do oddania do {loan.dueDate}.",
    "player-male_narrator-male": "{loan.amount} teraz. {loan.repayment} do oddania do {loan.dueDate}."
  },
  "g16.joke": {
    "player-female_narrator-female": "Szybko to ja robię kawę. Sprawdźmy koszt.",
    "player-male_narrator-female": "Szybko to ja robię kawę. Sprawdźmy koszt.",
    "player-female_narrator-male": "Szybko to ja robię kawę. Sprawdźmy koszt.",
    "player-male_narrator-male": "Szybko to ja robię kawę. Sprawdźmy koszt."
  },
  "g16.cost": {
    "player-female_narrator-female": "Koszt: {loan.cost} • szacunek",
    "player-male_narrator-female": "Koszt: {loan.cost} • szacunek",
    "player-female_narrator-male": "Koszt: {loan.cost} • szacunek",
    "player-male_narrator-male": "Koszt: {loan.cost} • szacunek"
  },
  "card.overdraft.body": {
    "player-female_narrator-female": "Doradca banku: pięć dni roboczych na decyzję.",
    "player-male_narrator-female": "Doradca banku: pięć dni roboczych na decyzję.",
    "player-female_narrator-male": "Doradca banku: pięć dni roboczych na decyzję.",
    "player-male_narrator-male": "Doradca banku: pięć dni roboczych na decyzję."
  },
  "card.overdraft.cost": {
    "player-female_narrator-female": "Koszt: {overdraft.costEstimate} • szacunek",
    "player-male_narrator-female": "Koszt: {overdraft.costEstimate} • szacunek",
    "player-female_narrator-male": "Koszt: {overdraft.costEstimate} • szacunek",
    "player-male_narrator-male": "Koszt: {overdraft.costEstimate} • szacunek"
  },
  "g15.risk": {
    "player-female_narrator-female": "{forecast.lowDate} zabraknie środków. Sprawdź zaliczkę i skonto.",
    "player-male_narrator-female": "{forecast.lowDate} zabraknie środków. Sprawdź zaliczkę i skonto.",
    "player-female_narrator-male": "{forecast.lowDate} zabraknie środków. Sprawdź zaliczkę i skonto.",
    "player-male_narrator-male": "{forecast.lowDate} zabraknie środków. Sprawdź zaliczkę i skonto."
  },
  "g17.lesson": {
    "player-female_narrator-female": "VAT został zapłacony na czas. Rachunek oddycha, ale patrzmy dalej niż dzisiejsze saldo.",
    "player-male_narrator-female": "VAT został zapłacony na czas. Rachunek oddycha, ale patrzmy dalej niż dzisiejsze saldo.",
    "player-female_narrator-male": "VAT został zapłacony na czas. Rachunek oddycha, ale patrzmy dalej niż dzisiejsze saldo.",
    "player-male_narrator-male": "VAT został zapłacony na czas. Rachunek oddycha, ale patrzmy dalej niż dzisiejsze saldo."
  },
  "g17.joke": {
    "player-female_narrator-female": "Nic nie wybuchło. W biznesie to też jest wiadomość.",
    "player-male_narrator-female": "Nic nie wybuchło. W biznesie to też jest wiadomość.",
    "player-female_narrator-male": "Nic nie wybuchło. W biznesie to też jest wiadomość.",
    "player-male_narrator-male": "Nic nie wybuchło. W biznesie to też jest wiadomość."
  },
  "g26.joke": {
    "player-female_narrator-female": "Proszę zapiąć terminy płatności.",
    "player-male_narrator-female": "Proszę zapiąć terminy płatności.",
    "player-female_narrator-male": "Proszę zapiąć terminy płatności.",
    "player-male_narrator-male": "Proszę zapiąć terminy płatności."
  },
  "g18.joke": {
    "player-female_narrator-female": "Można spać. Najpierw zapiszmy, co zadziałało.",
    "player-male_narrator-female": "Można spać. Najpierw zapiszmy, co zadziałało.",
    "player-female_narrator-male": "Można spać. Najpierw zapiszmy, co zadziałało.",
    "player-male_narrator-male": "Można spać. Najpierw zapiszmy, co zadziałało."
  },
  "g18.avoided": {
    "player-female_narrator-female": "Unikasz {advance.avoided} kosztu w porównaniu z pożyczką.",
    "player-male_narrator-female": "Unikasz {advance.avoided} kosztu w porównaniu z pożyczką.",
    "player-female_narrator-male": "Unikasz {advance.avoided} kosztu w porównaniu z pożyczką.",
    "player-male_narrator-male": "Unikasz {advance.avoided} kosztu w porównaniu z pożyczką."
  },
  "g18.pilotPending": {
    "player-female_narrator-female": "Pilot — czeka na zapis planu",
    "player-male_narrator-female": "Pilot — czeka na zapis planu",
    "player-female_narrator-male": "Pilot — czeka na zapis planu",
    "player-male_narrator-male": "Pilot — czeka na zapis planu"
  },
  "g19.cause": {
    "player-female_narrator-female": "{failure.date} brakuje {failure.shortfall} na płatność {supplier.amount}.",
    "player-male_narrator-female": "{failure.date} brakuje {failure.shortfall} na płatność {supplier.amount}.",
    "player-female_narrator-male": "{failure.date} brakuje {failure.shortfall} na płatność {supplier.amount}.",
    "player-male_narrator-male": "{failure.date} brakuje {failure.shortfall} na płatność {supplier.amount}."
  },
  "g19.joke": {
    "player-female_narrator-female": "Mieliśmy negocjować termin, nie własną upadłość!",
    "player-male_narrator-female": "Mieliśmy negocjować termin, nie własną upadłość!",
    "player-female_narrator-male": "Mieliśmy negocjować termin, nie własną upadłość!",
    "player-male_narrator-male": "Mieliśmy negocjować termin, nie własną upadłość!"
  },
  "g19.support": {
    "player-female_narrator-female": "To próba. Cofnijmy się i spróbujmy inaczej.",
    "player-male_narrator-female": "To próba. Cofnijmy się i spróbujmy inaczej.",
    "player-female_narrator-male": "To próba. Cofnijmy się i spróbujmy inaczej.",
    "player-male_narrator-male": "To próba. Cofnijmy się i spróbujmy inaczej."
  },
  "g20.body": {
    "player-female_narrator-female": "Wróć przed negocjacje zaliczki.",
    "player-male_narrator-female": "Wróć przed negocjacje zaliczki.",
    "player-female_narrator-male": "Wróć przed negocjacje zaliczki.",
    "player-male_narrator-male": "Wróć przed negocjacje zaliczki."
  },
  "g22.saved": {
    "player-female_narrator-female": "Plan zapisany. Gwiazdka Pilot zdobyta.",
    "player-male_narrator-female": "Plan zapisany. Gwiazdka Pilot zdobyta.",
    "player-female_narrator-male": "Plan zapisany. Gwiazdka Pilot zdobyta.",
    "player-male_narrator-male": "Plan zapisany. Gwiazdka Pilot zdobyta."
  },
  "g22.plan": {
    "player-female_narrator-female": "Zaliczka {advance.amount} {advance.tolerance} od Klienta A do {advance.deadline}.",
    "player-male_narrator-female": "Zaliczka {advance.amount} {advance.tolerance} od Klienta A do {advance.deadline}.",
    "player-female_narrator-male": "Zaliczka {advance.amount} {advance.tolerance} od Klienta A do {advance.deadline}.",
    "player-male_narrator-male": "Zaliczka {advance.amount} {advance.tolerance} od Klienta A do {advance.deadline}."
  },
  "g23.received": {
    "player-female_narrator-female": "Zaliczka dotarła! Luka {forecast.lowDate} zamknięta.",
    "player-male_narrator-female": "Zaliczka dotarła! Luka {forecast.lowDate} zamknięta.",
    "player-female_narrator-male": "Zaliczka dotarła! Luka {forecast.lowDate} zamknięta.",
    "player-male_narrator-male": "Zaliczka dotarła! Luka {forecast.lowDate} zamknięta."
  },
  "g23.missed": {
    "player-female_narrator-female": "Plan nie został potwierdzony. Sprawdź wariant B.",
    "player-male_narrator-female": "Plan nie został potwierdzony. Sprawdź wariant B.",
    "player-female_narrator-male": "Plan nie został potwierdzony. Sprawdź wariant B.",
    "player-male_narrator-male": "Plan nie został potwierdzony. Sprawdź wariant B."
  },
  "reaction.close": {
    "player-female_narrator-female": "Przeszliśmy grudzień w grze, zanim przeszliśmy go na koncie.",
    "player-male_narrator-female": "Przeszliśmy grudzień w grze, zanim przeszliśmy go na koncie.",
    "player-female_narrator-male": "Przeszliśmy grudzień w grze, zanim przeszliśmy go na koncie.",
    "player-male_narrator-male": "Przeszliśmy grudzień w grze, zanim przeszliśmy go na koncie."
  },
  "g29.joke": {
    "player-female_narrator-female": "Faktura ma termin. My mamy poniedziałek.",
    "player-male_narrator-female": "Faktura ma termin. My mamy poniedziałek.",
    "player-female_narrator-male": "Faktura ma termin. My mamy poniedziałek.",
    "player-male_narrator-male": "Faktura ma termin. My mamy poniedziałek."
  },
  "g29.fee": {
    "player-female_narrator-female": "Koszt scenariusza: {factoring.fee}",
    "player-male_narrator-female": "Koszt scenariusza: {factoring.fee}",
    "player-female_narrator-male": "Koszt scenariusza: {factoring.fee}",
    "player-male_narrator-male": "Koszt scenariusza: {factoring.fee}"
  },
  "g29.receipt": {
    "player-female_narrator-female": "Wpływ: {factoring.receipt}",
    "player-male_narrator-female": "Wpływ: {factoring.receipt}",
    "player-female_narrator-male": "Wpływ: {factoring.receipt}",
    "player-male_narrator-male": "Wpływ: {factoring.receipt}"
  },
  "g32.factoring": {
    "player-female_narrator-female": "Minimum po faktoringu: {factoring.low}",
    "player-male_narrator-female": "Minimum po faktoringu: {factoring.low}",
    "player-female_narrator-male": "Minimum po faktoringu: {factoring.low}",
    "player-male_narrator-male": "Minimum po faktoringu: {factoring.low}"
  },
  "g31.joke": {
    "player-female_narrator-female": "Szybciej nie zawsze znaczy taniej. Policzmy.",
    "player-male_narrator-female": "Szybciej nie zawsze znaczy taniej. Policzmy.",
    "player-female_narrator-male": "Szybciej nie zawsze znaczy taniej. Policzmy.",
    "player-male_narrator-male": "Szybciej nie zawsze znaczy taniej. Policzmy."
  },
  "g25.joke": {
    "player-female_narrator-female": "Szefowa szuka kalkulatora. Kot wie, gdzie jest.",
    "player-male_narrator-female": "Szefowa szuka kalkulatora. Kot wie, gdzie jest.",
    "player-female_narrator-male": "Szef szuka kalkulatora. Kot wie, gdzie jest.",
    "player-male_narrator-male": "Szef szuka kalkulatora. Kot wie, gdzie jest."
  },
  "g28.title": {
    "player-female_narrator-female": "Internet poszedł po kawę.",
    "player-male_narrator-female": "Internet poszedł po kawę.",
    "player-female_narrator-male": "Internet poszedł po kawę.",
    "player-male_narrator-male": "Internet poszedł po kawę."
  },
  "g04.goodbye": {
    "player-female_narrator-female": "Do zobaczenia na kolejnej turze!",
    "player-male_narrator-female": "Do zobaczenia na kolejnej turze!",
    "player-female_narrator-male": "Do zobaczenia na kolejnej turze!",
    "player-male_narrator-male": "Do zobaczenia na kolejnej turze!"
  },
  "ui.character_select.title": {
    "player-female_narrator-female": "Kto prowadzi tę firmę?",
    "player-male_narrator-female": "Kto prowadzi tę firmę?",
    "player-female_narrator-male": "Kto prowadzi tę firmę?",
    "player-male_narrator-male": "Kto prowadzi tę firmę?"
  },
  "ui.character_select.player": {
    "player-female_narrator-female": "Twoja postać",
    "player-male_narrator-female": "Twoja postać",
    "player-female_narrator-male": "Twoja postać",
    "player-male_narrator-male": "Twoja postać"
  },
  "ui.character_select.guide": {
    "player-female_narrator-female": "Twój przewodnik",
    "player-male_narrator-female": "Twój przewodnik",
    "player-female_narrator-male": "Twój przewodnik",
    "player-male_narrator-male": "Twój przewodnik"
  },
  "ui.character_select.later": {
    "player-female_narrator-female": "Możesz zmienić później",
    "player-male_narrator-female": "Możesz zmienić później",
    "player-female_narrator-male": "Możesz zmienić później",
    "player-male_narrator-male": "Możesz zmienić później"
  },
  "ui.character_select.play": {
    "player-female_narrator-female": "Gramy!",
    "player-male_narrator-female": "Gramy!",
    "player-female_narrator-male": "Gramy!",
    "player-male_narrator-male": "Gramy!"
  },
  "ui.player.woman": {
    "player-female_narrator-female": "Kobieta",
    "player-male_narrator-female": "Kobieta",
    "player-female_narrator-male": "Kobieta",
    "player-male_narrator-male": "Kobieta"
  },
  "ui.player.man": {
    "player-female_narrator-female": "Mężczyzna",
    "player-male_narrator-female": "Mężczyzna",
    "player-female_narrator-male": "Mężczyzna",
    "player-male_narrator-male": "Mężczyzna"
  },
  "ui.narrator.szefowa": {
    "player-female_narrator-female": "Szefowa",
    "player-male_narrator-female": "Szefowa",
    "player-female_narrator-male": "Szefowa",
    "player-male_narrator-male": "Szefowa"
  },
  "ui.narrator.szef": {
    "player-female_narrator-female": "Szef",
    "player-male_narrator-female": "Szef",
    "player-female_narrator-male": "Szef",
    "player-male_narrator-male": "Szef"
  },
  "ui.intro.skip": {
    "player-female_narrator-female": "Pomiń intro",
    "player-male_narrator-female": "Pomiń intro",
    "player-female_narrator-male": "Pomiń intro",
    "player-male_narrator-male": "Pomiń intro"
  },
  "ui.intro.back": {
    "player-female_narrator-female": "Wstecz",
    "player-male_narrator-female": "Wstecz",
    "player-female_narrator-male": "Wstecz",
    "player-male_narrator-male": "Wstecz"
  },
  "ui.intro.next": {
    "player-female_narrator-female": "Dalej",
    "player-male_narrator-female": "Dalej",
    "player-female_narrator-male": "Dalej",
    "player-male_narrator-male": "Dalej"
  },
  "ui.intro.first_decision": {
    "player-female_narrator-female": "Moja pierwsza decyzja",
    "player-male_narrator-female": "Moja pierwsza decyzja",
    "player-female_narrator-male": "Moja pierwsza decyzja",
    "player-male_narrator-male": "Moja pierwsza decyzja"
  },
  "ui.intro.replay": {
    "player-female_narrator-female": "Posłuchaj ponownie",
    "player-male_narrator-female": "Posłuchaj ponownie",
    "player-female_narrator-male": "Posłuchaj ponownie",
    "player-male_narrator-male": "Posłuchaj ponownie"
  },
  "ui.map.title": {
    "player-female_narrator-female": "Mapa kampanii",
    "player-male_narrator-female": "Mapa kampanii",
    "player-female_narrator-male": "Mapa kampanii",
    "player-male_narrator-male": "Mapa kampanii"
  },
  "ui.route.title": {
    "player-female_narrator-female": "Trasa gry",
    "player-male_narrator-female": "Trasa gry",
    "player-female_narrator-male": "Trasa gry",
    "player-male_narrator-male": "Trasa gry"
  },
  "ui.route.choose_action": {
    "player-female_narrator-female": "Wybierz manewr",
    "player-male_narrator-female": "Wybierz manewr",
    "player-female_narrator-male": "Wybierz manewr",
    "player-male_narrator-male": "Wybierz manewr"
  },
  "ui.route.view_forecast": {
    "player-female_narrator-female": "Zobacz prognozę",
    "player-male_narrator-female": "Zobacz prognozę",
    "player-female_narrator-male": "Zobacz prognozę",
    "player-male_narrator-male": "Zobacz prognozę"
  },
  "ui.route.cashflow": {
    "player-female_narrator-female": "Cash Flow",
    "player-male_narrator-female": "Cash Flow",
    "player-female_narrator-male": "Cash Flow",
    "player-male_narrator-male": "Cash Flow"
  },
  "ui.forecast.title": {
    "player-female_narrator-female": "Prognoza: będzie bujać",
    "player-male_narrator-female": "Prognoza: będzie bujać",
    "player-female_narrator-male": "Prognoza: będzie bujać",
    "player-male_narrator-male": "Prognoza: będzie bujać"
  },
  "ui.forecast.comment": {
    "player-female_narrator-female": "To nie rollercoaster. To nasze przelewy.",
    "player-male_narrator-female": "To nie rollercoaster. To nasze przelewy.",
    "player-female_narrator-male": "To nie rollercoaster. To nasze przelewy.",
    "player-male_narrator-male": "To nie rollercoaster. To nasze przelewy."
  },
  "ui.event.check": {
    "player-female_narrator-female": "Sprawdź numer konta",
    "player-male_narrator-female": "Sprawdź numer konta",
    "player-female_narrator-male": "Sprawdź numer konta",
    "player-male_narrator-male": "Sprawdź numer konta"
  },
  "ui.event.risky": {
    "player-female_narrator-female": "Ryzykowny przelew",
    "player-male_narrator-female": "Ryzykowny przelew",
    "player-female_narrator-male": "Ryzykowny przelew",
    "player-male_narrator-male": "Ryzykowny przelew"
  },
  "ui.card.advance": {
    "player-female_narrator-female": "Zaliczka od Klienta A",
    "player-male_narrator-female": "Zaliczka od Klienta A",
    "player-female_narrator-male": "Zaliczka od Klienta A",
    "player-male_narrator-male": "Zaliczka od Klienta A"
  },
  "ui.card.discount": {
    "player-female_narrator-female": "Skonto dla Klienta C",
    "player-male_narrator-female": "Skonto dla Klienta C",
    "player-female_narrator-male": "Skonto dla Klienta C",
    "player-male_narrator-male": "Skonto dla Klienta C"
  },
  "ui.card.postpone": {
    "player-female_narrator-female": "Odroczenie płatności podwykonawcom",
    "player-male_narrator-female": "Odroczenie płatności podwykonawcom",
    "player-female_narrator-male": "Odroczenie płatności podwykonawcom",
    "player-male_narrator-male": "Odroczenie płatności podwykonawcom"
  },
  "ui.card.overdraft": {
    "player-female_narrator-female": "Kredyt w rachunku bieżącym",
    "player-male_narrator-female": "Kredyt w rachunku bieżącym",
    "player-female_narrator-male": "Kredyt w rachunku bieżącym",
    "player-male_narrator-male": "Kredyt w rachunku bieżącym"
  },
  "ui.card.loan": {
    "player-female_narrator-female": "Pożyczka pozabankowa SMS",
    "player-male_narrator-female": "Pożyczka pozabankowa SMS",
    "player-female_narrator-male": "Pożyczka pozabankowa SMS",
    "player-male_narrator-male": "Pożyczka pozabankowa SMS"
  },
  "ui.card.factoring": {
    "player-female_narrator-female": "Faktoring faktury Klienta A (scenariusz)",
    "player-male_narrator-female": "Faktoring faktury Klienta A (scenariusz)",
    "player-female_narrator-male": "Faktoring faktury Klienta A (scenariusz)",
    "player-male_narrator-male": "Faktoring faktury Klienta A (scenariusz)"
  },
  "ui.negotiate.title": {
    "player-female_narrator-female": "Negocjacje z Klientem A",
    "player-male_narrator-female": "Negocjacje z Klientem A",
    "player-female_narrator-male": "Negocjacje z Klientem A",
    "player-male_narrator-male": "Negocjacje z Klientem A"
  },
  "ui.negotiate.accept_counter": {
    "player-female_narrator-female": "Przyjmij kontrofertę",
    "player-male_narrator-female": "Przyjmij kontrofertę",
    "player-female_narrator-male": "Przyjmij kontrofertę",
    "player-male_narrator-male": "Przyjmij kontrofertę"
  },
  "ui.negotiate.ask": {
    "player-female_narrator-female": "Zaproponuj warunki",
    "player-male_narrator-female": "Zaproponuj warunki",
    "player-female_narrator-male": "Zaproponuj warunki",
    "player-male_narrator-male": "Zaproponuj warunki"
  },
  "ui.ai_cfo.title": {
    "player-female_narrator-female": "Doradca AI-CFO",
    "player-male_narrator-female": "Doradca AI-CFO",
    "player-female_narrator-male": "Doradca AI-CFO",
    "player-male_narrator-male": "Doradca AI-CFO"
  },
  "ui.bank_advisor.title": {
    "player-female_narrator-female": "Doradca bankowy",
    "player-male_narrator-female": "Doradca bankowy",
    "player-female_narrator-male": "Doradca bankowy",
    "player-male_narrator-male": "Doradca bankowy"
  },
  "ui.week.title": {
    "player-female_narrator-female": "Podsumowanie tygodnia",
    "player-male_narrator-female": "Podsumowanie tygodnia",
    "player-female_narrator-male": "Podsumowanie tygodnia",
    "player-male_narrator-male": "Podsumowanie tygodnia"
  },
  "ui.week.next": {
    "player-female_narrator-female": "Następny tydzień",
    "player-male_narrator-female": "Następny tydzień",
    "player-female_narrator-male": "Następny tydzień",
    "player-male_narrator-male": "Następny tydzień"
  },
  "ui.success.title": {
    "player-female_narrator-female": "Grudzień dowieziony!",
    "player-male_narrator-female": "Grudzień dowieziony!",
    "player-female_narrator-male": "Grudzień dowieziony!",
    "player-male_narrator-male": "Grudzień dowieziony!"
  },
  "ui.success.save_plan": {
    "player-female_narrator-female": "Zapisz zwycięski plan",
    "player-male_narrator-female": "Zapisz zwycięski plan",
    "player-female_narrator-male": "Zapisz zwycięski plan",
    "player-male_narrator-male": "Zapisz zwycięski plan"
  },
  "ui.failure.title": {
    "player-female_narrator-female": "Płatność odrzucona",
    "player-male_narrator-female": "Płatność odrzucona",
    "player-female_narrator-male": "Płatność odrzucona",
    "player-male_narrator-male": "Płatność odrzucona"
  },
  "ui.failure.cause": {
    "player-female_narrator-female": "Przyczyna: brak środków na koncie",
    "player-male_narrator-female": "Przyczyna: brak środków na koncie",
    "player-female_narrator-male": "Przyczyna: brak środków na koncie",
    "player-male_narrator-male": "Przyczyna: brak środków na koncie"
  },
  "ui.failure.rewind": {
    "player-female_narrator-female": "Cofnij czas i spróbuj inaczej",
    "player-male_narrator-female": "Cofnij czas i spróbuj inaczej",
    "player-female_narrator-male": "Cofnij czas i spróbuj inaczej",
    "player-male_narrator-male": "Cofnij czas i spróbuj inaczej"
  },
  "ui.rewind.select_week": {
    "player-female_narrator-female": "Wybierz tydzień do powrotu",
    "player-male_narrator-female": "Wybierz tydzień do powrotu",
    "player-female_narrator-male": "Wybierz tydzień do powrotu",
    "player-male_narrator-male": "Wybierz tydzień do powrotu"
  },
  "ui.hud.balance": {
    "player-female_narrator-female": "Stan konta",
    "player-male_narrator-female": "Stan konta",
    "player-female_narrator-male": "Stan konta",
    "player-male_narrator-male": "Stan konta"
  },
  "ui.hud.days_left": {
    "player-female_narrator-female": "Dni do końca",
    "player-male_narrator-female": "Dni do końca",
    "player-female_narrator-male": "Dni do końca",
    "player-male_narrator-male": "Dni do końca"
  },
  "ui.hud.week": {
    "player-female_narrator-female": "Tydzień {week}",
    "player-male_narrator-female": "Tydzień {week}",
    "player-female_narrator-male": "Tydzień {week}",
    "player-male_narrator-male": "Tydzień {week}"
  },
  "ui.hud.runway": {
    "player-female_narrator-female": "Runway: {days} dni",
    "player-male_narrator-female": "Runway: {days} dni",
    "player-female_narrator-male": "Runway: {days} dni",
    "player-male_narrator-male": "Runway: {days} dni"
  },
  "ui.btn.finish_week": {
    "player-female_narrator-female": "Zakończ tydzień",
    "player-male_narrator-female": "Zakończ tydzień",
    "player-female_narrator-male": "Zakończ tydzień",
    "player-male_narrator-male": "Zakończ tydzień"
  },
  "ui.btn.rewind_week": {
    "player-female_narrator-female": "Cofnij tydzień",
    "player-male_narrator-female": "Cofnij tydzień",
    "player-female_narrator-male": "Cofnij tydzień",
    "player-male_narrator-male": "Cofnij tydzień"
  },
  "ui.btn.confirm_action": {
    "player-female_narrator-female": "Zatwierdź manewr",
    "player-male_narrator-female": "Zatwierdź manewr",
    "player-female_narrator-male": "Zatwierdź manewr",
    "player-male_narrator-male": "Zatwierdź manewr"
  },
  "ui.btn.save_plan": {
    "player-female_narrator-female": "Zapisz plan",
    "player-male_narrator-female": "Zapisz plan",
    "player-female_narrator-male": "Zapisz plan",
    "player-male_narrator-male": "Zapisz plan"
  },
  "ui.btn.preview_plan": {
    "player-female_narrator-female": "Podgląd planu",
    "player-male_narrator-female": "Podgląd planu",
    "player-female_narrator-male": "Podgląd planu",
    "player-male_narrator-male": "Podgląd planu"
  },
  "ui.btn.negotiate": {
    "player-female_narrator-female": "Negocjuj",
    "player-male_narrator-female": "Negocjuj",
    "player-female_narrator-male": "Negocjuj",
    "player-male_narrator-male": "Negocjuj"
  },
  "ui.btn.ai_cfo": {
    "player-female_narrator-female": "Doradca AI",
    "player-male_narrator-female": "Doradca AI",
    "player-female_narrator-male": "Doradca AI",
    "player-male_narrator-male": "Doradca AI"
  },
  "ui.btn.details": {
    "player-female_narrator-female": "Szczegóły",
    "player-male_narrator-female": "Szczegóły",
    "player-female_narrator-male": "Szczegóły",
    "player-male_narrator-male": "Szczegóły"
  },
  "ui.banner.week_waiting": {
    "player-female_narrator-female": "Tydzień {week} czeka",
    "player-male_narrator-female": "Tydzień {week} czeka",
    "player-female_narrator-male": "Tydzień {week} czeka",
    "player-male_narrator-male": "Tydzień {week} czeka"
  },
  "ui.banner.return_to_game": {
    "player-female_narrator-female": "Wróć do gry",
    "player-male_narrator-female": "Wróć do gry",
    "player-female_narrator-male": "Wróć do gry",
    "player-male_narrator-male": "Wróć do gry"
  },
  "ui.banner.remind_me": {
    "player-female_narrator-female": "Przypomnij mi",
    "player-male_narrator-female": "Przypomnij mi",
    "player-female_narrator-male": "Przypomnij mi",
    "player-male_narrator-male": "Przypomnij mi"
  },
  "rx.welcome": {
    "player-female_narrator-female": "Firma czeka. Kawa też.",
    "player-male_narrator-female": "Firma czeka. Kawa też.",
    "player-female_narrator-male": "Firma czeka. Kawa też.",
    "player-male_narrator-male": "Firma czeka. Kawa też."
  },
  "rx.project": {
    "player-female_narrator-female": "Duży klient! Duży projekt! Pieniądze… kiedyś.",
    "player-male_narrator-female": "Duży klient! Duży projekt! Pieniądze… kiedyś.",
    "player-female_narrator-male": "Duży klient! Duży projekt! Pieniądze… kiedyś.",
    "player-male_narrator-male": "Duży klient! Duży projekt! Pieniądze… kiedyś."
  },
  "rx.negotiate": {
    "player-female_narrator-female": "Podobno o pieniądzach się nie rozmawia. Na szczęście prowadzimy firmę.",
    "player-male_narrator-female": "Podobno o pieniądzach się nie rozmawia. Na szczęście prowadzimy firmę.",
    "player-female_narrator-male": "Podobno o pieniądzach się nie rozmawia. Na szczęście prowadzimy firmę.",
    "player-male_narrator-male": "Podobno o pieniądzach się nie rozmawia. Na szczęście prowadzimy firmę."
  },
  "rx.late": {
    "player-female_narrator-female": "Klient zapewnia, że przelew już wyszedł. Chyba pieszo.",
    "player-male_narrator-female": "Klient zapewnia, że przelew już wyszedł. Chyba pieszo.",
    "player-female_narrator-male": "Klient zapewnia, że przelew już wyszedł. Chyba pieszo.",
    "player-male_narrator-male": "Klient zapewnia, że przelew już wyszedł. Chyba pieszo."
  },
  "rx.loan": {
    "player-female_narrator-female": "Szybko to ja robię kawę. Sprawdźmy koszt.",
    "player-male_narrator-female": "Szybko to ja robię kawę. Sprawdźmy koszt.",
    "player-female_narrator-male": "Szybko to ja robię kawę. Sprawdźmy koszt.",
    "player-male_narrator-male": "Szybko to ja robię kawę. Sprawdźmy koszt."
  },
  "rx.goodmove": {
    "player-female_narrator-female": "Dobry manewr. Poradziłaś sobie świetnie, a firma ma oddech.",
    "player-male_narrator-female": "Dobry manewr. Poradziłeś sobie świetnie, a firma ma oddech.",
    "player-female_narrator-male": "Dobry manewr. Poradziłaś sobie świetnie, a firma ma oddech.",
    "player-male_narrator-male": "Dobry manewr. Poradziłeś sobie świetnie, a firma ma oddech."
  },
  "rx.crash": {
    "player-female_narrator-female": "Mieliśmy negocjować termin, nie własną upadłość!",
    "player-male_narrator-female": "Mieliśmy negocjować termin, nie własną upadłość!",
    "player-female_narrator-male": "Mieliśmy negocjować termin, nie własną upadłość!",
    "player-male_narrator-male": "Mieliśmy negocjować termin, nie własną upadłość!"
  },
  "rx.rewind": {
    "player-female_narrator-female": "To próba. Cofnijmy się i spróbujmy inaczej.",
    "player-male_narrator-female": "To próba. Cofnijmy się i spróbujmy inaczej.",
    "player-female_narrator-male": "To próba. Cofnijmy się i spróbujmy inaczej.",
    "player-male_narrator-male": "To próba. Cofnijmy się i spróbujmy inaczej."
  },
  "rx.quiet": {
    "player-female_narrator-female": "Nic nie wybuchło. W biznesie to też jest wiadomość.",
    "player-male_narrator-female": "Nic nie wybuchło. W biznesie to też jest wiadomość.",
    "player-female_narrator-male": "Nic nie wybuchło. W biznesie to też jest wiadomość.",
    "player-male_narrator-male": "Nic nie wybuchło. W biznesie to też jest wiadomość."
  },
  "rx.win": {
    "player-female_narrator-female": "Grudzień dowieziony. Kawa smakuje jakoś lepiej.",
    "player-male_narrator-female": "Grudzień dowieziony. Kawa smakuje jakoś lepiej.",
    "player-female_narrator-male": "Grudzień dowieziony. Kawa smakuje jakoś lepiej.",
    "player-male_narrator-male": "Grudzień dowieziony. Kawa smakuje jakoś lepiej."
  },
  "rx.validated": {
    "player-female_narrator-female": "Plan sprawdzony na prawdziwym koncie. To działa!",
    "player-male_narrator-female": "Plan sprawdzony na prawdziwym koncie. To działa!",
    "player-female_narrator-male": "Plan sprawdzony na prawdziwym koncie. To działa!",
    "player-male_narrator-male": "Plan sprawdzony na prawdziwym koncie. To działa!"
  }
};
