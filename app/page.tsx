import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
      <div className="space-y-4">
        <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium">
          Wyzwanie Commerzbank · Collabothon 2026
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Witaj w <span className="text-amber-400">Pilocie Płynności</span>
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          Przejmij stery studia graficznego jako pilot finansów. Przeprowadź firmę przez grudniowy sztorm płynnościowy,
          podejmuj strategiczne decyzje kartami i uratuj cash flow przed zatorami płatniczymi.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <Link
          href="/gra/1"
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base shadow-lg shadow-amber-500/20 transition transform hover:-translate-y-0.5"
        >
          Rozpocznij misję (Poziom 1)
        </Link>
        <Link
          href="/mapa"
          className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-base border border-slate-700 transition"
        >
          Zobacz mapę kampanii (G09)
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left w-full">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-amber-400 font-semibold mb-1">1. Prognoza Cash Flow</div>
          <div className="text-sm text-slate-400">
            Śledź saldo dzienne na wykresie i zobacz sztorm finansowy 28 grudnia zanim uderzy.
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-amber-400 font-semibold mb-1">2. Karty manewrów</div>
          <div className="text-sm text-slate-400">
            Zaliczka, skonto, odroczenie, limit w koncie czy faktoring — wybierz najtańszy ruch.
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-amber-400 font-semibold mb-1">3. Nauka bez ryzyka</div>
          <div className="text-sm text-slate-400">
            Popełnij błąd, cofnij czas pokrętłem rewind i sprawdź alternatywną ścieżkę.
          </div>
        </div>
      </div>
    </div>
  );
}
