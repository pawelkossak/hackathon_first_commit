"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GameSettings } from "../../components/narrative";
import { useGameStore } from "../../lib/ui/game-store";
import { useCopy } from "../../lib/ui/copy";

/** G24 settings: the narrative GameSettings, plus the UI-owned fallback flag (U-11) and the reset (US-08). */
export default function UstawieniaPage() {
  const router = useRouter();
  const reset = useGameStore((s) => s.reset);
  const fallbackMode = useGameStore((s) => s.fallbackMode);
  const setFallbackMode = useGameStore((s) => s.setFallbackMode);
  const { copy, label } = useCopy();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-3xl mx-auto w-full flex flex-col gap-6" data-testid="settings-page">
      <GameSettings onResume={() => router.push("/gra/1")} />

      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <label className="flex min-h-[44px] items-center justify-between gap-4 text-base text-white">
          <span>{label("ui.settings.fallback")}</span>
          <input
            type="checkbox"
            checked={fallbackMode}
            onChange={(e) => setFallbackMode(e.target.checked)}
            data-testid="settings-fallback-toggle"
            className="w-6 h-6 accent-amber-500 cursor-pointer"
          />
        </label>

        <div className="border-t border-slate-800 pt-4 space-y-3">
          {confirmReset && <p className="text-base text-slate-100">{copy("reset.confirm")}</p>}
          <div className="flex flex-wrap gap-3">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                data-testid="settings-reset-button"
                className="min-h-[44px] px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-base cursor-pointer"
              >
                {label("ui.settings.reset_game")}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setConfirmReset(false);
                    router.push("/gra/1");
                  }}
                  data-testid="settings-reset-confirm"
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-base cursor-pointer"
                >
                  {label("ui.nav.reset_confirm")}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base cursor-pointer"
                >
                  {copy("ui.btn.close")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
