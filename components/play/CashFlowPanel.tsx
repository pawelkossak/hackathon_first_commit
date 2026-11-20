"use client";

import React, { useState, useId, useEffect, useRef } from "react";
import { useGameStore } from "@/lib/ui/game-store";
import type { ForecastPoint, CashFlowTask } from "../../engine";

export interface CashFlowPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialWeek?: number | null;
}

export function CashFlowPanel({ isOpen, onClose, initialWeek }: CashFlowPanelProps) {
  const forecast = useGameStore((s) => s.getForecast());
  const activePreview = useGameStore((s) => s.activePreview);
  const [activeTab, setActiveTab] = useState<"chart" | "tasks">("chart");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const titleId = useId();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus trap and Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Initial focus on dialog container or close button
    const closeBtn = modalRef.current?.querySelector<HTMLElement>('[data-testid="close-cashflow-button"]');
    closeBtn?.focus();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previousActiveElement.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const points = forecast.points;
  const tasks = forecast.tasks;
  const baseline = forecast.baseline;

  // Selected point details
  const activePoint: ForecastPoint | undefined = selectedDate
    ? points.find((p) => p.date === selectedDate)
    : initialWeek
    ? points.find((p) => p.week === initialWeek)
    : points[0];

  // Chart coordinate calculations
  const allBalances = [
    ...points.map((p) => p.balance),
    ...baseline.points.map((p) => p.balance),
    ...(activePreview ? activePreview.after.points.map((p) => p.balance) : []),
    0,
  ];

  const minVal = Math.min(...allBalances) - 2000;
  const maxVal = Math.max(...allBalances) + 5000;
  const range = maxVal - minVal || 1;

  const chartWidth = 900;
  const chartHeight = 280;
  const paddingX = 40;
  const paddingY = 30;
  const plotWidth = chartWidth - paddingX * 2;
  const plotHeight = chartHeight - paddingY * 2;

  const getX = (index: number) => paddingX + (index / (points.length - 1)) * plotWidth;
  const getY = (val: number) => paddingY + plotHeight - ((val - minVal) / range) * plotHeight;
  const zeroY = getY(0);

  // SVG paths
  const currentPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(p.balance).toFixed(1)}`)
    .join(" ");

  const baselinePath = baseline.points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(p.balance).toFixed(1)}`)
    .join(" ");

  const previewPath = activePreview
    ? activePreview.after.points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(p.balance).toFixed(1)}`)
        .join(" ")
    : null;

  function formatShortDate(iso: string) {
    const [, m, d] = iso.split("-").map(Number);
    const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    return `${d} ${roman[m - 1]}`;
  }

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid="cashflow-drilldown-g12"
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-slate-900 border-2 border-indigo-500/80 rounded-3xl p-5 sm:p-8 max-w-5xl w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Drilldown Cash Flow (Alan, D-09 / G12 / G30)
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Dane syntetyczne
              </span>
            </div>
            <h2 id={titleId} className="text-2xl font-black text-white mt-1">
              Prognoza Przepływów Pieniężnych
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div role="tablist" aria-label="Widoki Cash Flow" className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex">
              <button
                type="button"
                role="tab"
                id="tab-chart"
                aria-selected={activeTab === "chart"}
                aria-controls="panel-chart"
                onClick={() => setActiveTab("chart")}
                className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center ${
                  activeTab === "chart"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Wykres (G12/G30)
              </button>
              <button
                type="button"
                role="tab"
                id="tab-tasks"
                aria-selected={activeTab === "tasks"}
                aria-controls="panel-tasks"
                onClick={() => setActiveTab("tasks")}
                className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center ${
                  activeTab === "tasks"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Zadania ({tasks.length})
              </button>
            </div>

            <button
              onClick={onClose}
              data-testid="close-cashflow-button"
              aria-label="Zamknij podgląd Cash Flow (Escape)"
              className="min-h-[44px] min-w-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer border border-slate-700 flex items-center justify-center focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            >
              Zamknij (Esc)
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex-1 overflow-y-auto space-y-6">
          {activeTab === "chart" ? (
            <div id="panel-chart" role="tabpanel" aria-labelledby="tab-chart" className="space-y-4">
              {/* Chart Legend & 28 XII headline */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-slate-300 font-semibold">Prognoza bieżąca</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-0.5 border-t-2 border-dashed border-purple-400" />
                    <span className="text-purple-300">Bez działania (Baseline)</span>
                  </div>
                  {activePreview && (
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-0.5 border-t-2 border-dotted border-amber-400" />
                      <span className="text-amber-300">Po decyzji ({activePreview.cardId})</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-0.5 bg-red-400" />
                    <span className="text-red-300">0 zł (Próg płynności)</span>
                  </div>
                </div>

                {/* 28 XII Node Inspection (GM-19 acceptance) */}
                <div
                  data-testid="storm-28-xii-drilldown"
                  className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono"
                >
                  <span className="text-slate-400">28 XII saldo: </span>
                  <span className="text-purple-400 font-bold">
                    {forecast.minimum.balance.toLocaleString("pl-PL")} zł
                  </span>
                  {activePreview && (
                    <span className="text-emerald-400 font-bold ml-1.5">
                      → {activePreview.after.minimum.balance.toLocaleString("pl-PL")} zł
                    </span>
                  )}
                </div>
              </div>

              {/* Responsive SVG Chart */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-auto min-w-[700px] select-none"
                  aria-label="Wykres salda gotówki w czasie"
                >
                  {/* Grid lines */}
                  <line
                    x1={paddingX}
                    y1={paddingY}
                    x2={chartWidth - paddingX}
                    y2={paddingY}
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                  <line
                    x1={paddingX}
                    y1={chartHeight - paddingY}
                    x2={chartWidth - paddingX}
                    y2={chartHeight - paddingY}
                    stroke="#1e293b"
                    strokeWidth="1"
                  />

                  {/* ZERO LINE */}
                  <line
                    x1={paddingX}
                    y1={zeroY}
                    x2={chartWidth - paddingX}
                    y2={zeroY}
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX + 5}
                    y={zeroY - 6}
                    fill="#ef4444"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    0 zł (Próg krytyczny)
                  </text>

                  {/* Baseline path (dashed purple) */}
                  <path
                    d={baselinePath}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                    opacity="0.8"
                  />

                  {/* Preview path (dotted amber) */}
                  {previewPath && (
                    <path
                      d={previewPath}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Current committed path (solid emerald) */}
                  <path
                    d={currentPath}
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="3"
                  />

                  {/* Data Points */}
                  {points.map((p, i) => {
                    const cx = getX(i);
                    const cy = getY(p.balance);
                    const isSelected = activePoint?.date === p.date;
                    const isStorm = p.date === "2026-12-28";

                    return (
                      <g
                        key={p.date}
                        role="button"
                        tabIndex={0}
                        aria-label={`Dzień ${formatShortDate(p.date)}, saldo ${p.balance.toLocaleString("pl-PL")} zł${isStorm ? ', punkt sztormu 28 XII' : ''}`}
                        aria-pressed={isSelected}
                        className="cursor-pointer focus:outline-none"
                        onClick={() => setSelectedDate(p.date)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedDate(p.date);
                          }
                        }}
                      >
                        {isStorm && (
                          <circle
                            cx={cx}
                            cy={cy}
                            r="8"
                            fill="#581c87"
                            opacity="0.6"
                            className="animate-ping"
                          />
                        )}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isSelected ? 6 : isStorm ? 5 : 3.5}
                          fill={p.balance < 0 ? "#ef4444" : "#10b981"}
                          stroke={isSelected ? "#ffffff" : isStorm ? "#a855f7" : "#020617"}
                          strokeWidth="2"
                        />
                        {/* X-axis date labels for key dates */}
                        {(i % 4 === 0 || isStorm) && (
                          <text
                            x={cx}
                            y={chartHeight - 8}
                            textAnchor="middle"
                            fill={isStorm ? "#f59e0b" : "#94a3b8"}
                            fontSize="9"
                            fontFamily="monospace"
                            fontWeight={isStorm ? "bold" : "normal"}
                          >
                            {formatShortDate(p.date)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Selected Day Transaction Breakdown Drawer */}
              {activePoint && (
                <div
                  data-testid="selected-day-details"
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        Szczegóły dnia: {activePoint.date} ({formatShortDate(activePoint.date)})
                      </span>
                      {activePoint.counterfactual && (
                        <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-700 px-2 py-0.5 rounded-full font-semibold">
                          Prognoza bez działania
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs">
                      Saldo końcowe:{" "}
                      <strong
                        className={activePoint.balance < 0 ? "text-red-400" : "text-emerald-400"}
                      >
                        {activePoint.balance.toLocaleString("pl-PL")} zł
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <span className="text-slate-400">Otwarcie:</span>{" "}
                      <strong className="text-slate-200 font-mono">
                        {activePoint.openingBalance.toLocaleString("pl-PL")} zł
                      </strong>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <span className="text-slate-400">Wpływy:</span>{" "}
                      <strong className="text-emerald-400 font-mono">
                        +{activePoint.inflow.toLocaleString("pl-PL")} zł
                      </strong>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <span className="text-slate-400">Wypływy:</span>{" "}
                      <strong className="text-rose-400 font-mono">
                        {activePoint.outflow.toLocaleString("pl-PL")} zł
                      </strong>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <span className="text-slate-400">Zmiana netto:</span>{" "}
                      <strong
                        className={`font-mono ${
                          activePoint.change >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {activePoint.change >= 0 ? "+" : ""}
                        {activePoint.change.toLocaleString("pl-PL")} zł
                      </strong>
                    </div>
                  </div>

                  {activePoint.transactions.length > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-bold uppercase text-slate-400">
                        Transakcje w tym dniu:
                      </div>
                      {activePoint.transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 text-xs"
                        >
                          <div>
                            <span className="font-medium text-white">{tx.title}</span>
                            <span className="text-slate-400 ml-2 font-mono">({tx.counterpartyId})</span>
                          </div>
                          <span
                            className={`font-mono font-bold ${
                              tx.amount > 0 ? "text-emerald-400" : "text-rose-300"
                            }`}
                          >
                            {tx.amount > 0 ? "+" : ""}
                            {tx.amount.toLocaleString("pl-PL")} zł
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic">
                      Brak zaksięgowanych operacji w tym dniu (saldo bez zmian).
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: Zadania View (GM-19 / E-07) */
            <div
              id="panel-tasks"
              role="tabpanel"
              aria-labelledby="tab-tasks"
              data-testid="tasks-view"
              className="space-y-3"
            >
              <div className="text-xs text-slate-400">
                Pełna lista operacji w kolejności księgowania z bieżącym saldem po każdej transakcji.
              </div>

              <div className="space-y-2">
                {tasks.map((task: CashFlowTask) => {
                  const isInflow = task.amount > 0;
                  return (
                    <div
                      key={task.id}
                      data-testid={`task-row-${task.id}`}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-400 text-[11px]">{task.date}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              task.status === "booked"
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                : task.status === "upcoming"
                                ? "bg-slate-800 text-slate-300"
                                : task.status === "rejected"
                                ? "bg-red-950 text-red-300 border border-red-800"
                                : "bg-purple-950 text-purple-300"
                            }`}
                          >
                            {task.status}
                          </span>
                          <span className="font-bold text-white text-sm">{task.title}</span>
                        </div>
                        <div className="text-slate-400">
                          Kontrahent: <strong className="text-slate-300">{task.counterpartyName}</strong> ({task.counterpartyId})
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-center font-mono">
                        <div>
                          <span className="text-[10px] text-slate-500 mr-1">Kwota:</span>
                          <span
                            className={`font-bold text-sm ${
                              isInflow ? "text-emerald-400" : "text-rose-300"
                            }`}
                          >
                            {isInflow ? "+" : ""}
                            {task.amount.toLocaleString("pl-PL")} zł
                          </span>
                        </div>
                        <div className="border-l border-slate-800 pl-3">
                          <span className="text-[10px] text-slate-500 mr-1">Saldo po:</span>
                          <span
                            className={`font-bold text-sm ${
                              task.balanceAfter < 0 ? "text-red-400" : "text-slate-200"
                            }`}
                          >
                            {task.balanceAfter.toLocaleString("pl-PL")} zł
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
