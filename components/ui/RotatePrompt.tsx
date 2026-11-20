"use client";

import React, { useState, useEffect } from "react";

export function RotatePrompt() {
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function checkOrientation() {
      // Check if mobile device in portrait mode (width <= 768px and height > width)
      if (typeof window === "undefined") return;
      const isPortrait =
        window.matchMedia("(orientation: portrait)").matches &&
        window.innerWidth <= 768;
      setIsPortraitMobile(isPortrait);
    }

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  if (!isPortraitMobile || dismissed) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="rotate-title"
      data-testid="rotate-prompt"
      className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white"
    >
      <div className="max-w-xs space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl animate-pulse">
          🔄
        </div>
        <div>
          <h2 id="rotate-title" className="text-xl font-black">
            Obróć telefon, lecimy w poziomie.
          </h2>
          <p className="text-xs text-slate-300 mt-2">
            Pilot Płynności został zaprojektowany do wygodnego lotu w orientacji poziomej (landscape 844×390).
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setDismissed(true)}
            data-testid="dismiss-rotate-prompt"
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 cursor-pointer"
          >
            Kontynuuj w widoku tekstowym
          </button>
        </div>
      </div>
    </div>
  );
}
