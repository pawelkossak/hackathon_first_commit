import Link from "next/link";

export default function KontoPage() {
  return (
    <div className="flex-1 p-6 max-w-2xl mx-auto w-full flex flex-col justify-center">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Ekrany konta i autoryzacji (G01–G04)
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Dostęp do gry bez logowania</h1>
          <p className="text-sm text-slate-300 mt-2">
            Gra jest w 100% dostępna w trybie gościa. Twój stan gry zapisuje się w pamięci przeglądarki.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div>• <strong>G01 Logowanie:</strong> wejście w trybie gościa aktywne domyślnie.</div>
          <div>• <strong>G02 Tworzenie konta:</strong> opcjonalne utrwalenie postępów.</div>
          <div>• <strong>G03 Reset hasła:</strong> neutralny monit o linku.</div>
          <div>• <strong>G04 Wylogowanie:</strong> powrót ze statusem „Do zobaczenia na kolejnej turze!”.</div>
        </div>

        <div className="pt-4 flex justify-end">
          <Link
            href="/gra/1"
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition"
          >
            Przejdź do rozgrywki →
          </Link>
        </div>
      </div>
    </div>
  );
}
