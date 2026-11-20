import React from "react";

export function AppFooter() {
  return (
    <footer className="w-full bg-slate-950 text-slate-400 border-t border-slate-800 text-xs py-4 px-6 text-center flex flex-col sm:flex-row items-center justify-between gap-2">
      <div>
        <span className="font-semibold text-slate-300">Pilot Płynności</span> — gra edukacyjna o płynności finansowej
        dla przedsiębiorców.
      </div>
      <div className="flex items-center gap-3">
        <span>Collabothon 2026 · Commerzbank</span>
        <span className="text-slate-600">|</span>
        <span className="text-emerald-400 font-medium">100% syntetyczne dane</span>
      </div>
    </footer>
  );
}
