"use client";

import React, { useState, useId, useEffect, useRef } from "react";
import { useGameStore } from "../../lib/ui/game-store";
import { selectForecast } from "../../lib/ui/game-views";
import { pln, shortDate, useCopy, type MissingLabelKey } from "../../lib/ui/copy";
import type { CashFlowTaskStatus, IsoDate, Transaction } from "../../engine";

export interface CashFlowPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** Day to inspect first; defaults to the storm day (lowest „Bez działania” balance). */
  initialDate?: IsoDate | null;
}

const TASK_STATUS_LABEL: Record<CashFlowTaskStatus, MissingLabelKey> = {
  booked: "ui.task.booked",
  upcoming: "ui.task.upcoming",
  rejected: "ui.task.rejected",
  stopped: "ui.task.stopped",
};

function signed(amount: number, text: string): string {
  return amount > 0 ? `+${text}` : text;
}

function TxRow({ tx }: { tx: Transaction }) {
  return (
    <li className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 text-base">
      <span className="text-white">
        {shortDate(tx.date)} · {tx.title}
      </span>
      <span className={`font-mono font-bold ${tx.amount > 0 ? "text-emerald-300" : "text-rose-200"}`}>
        {signed(tx.amount, pln(tx.amount))}
      </span>
    </li>
  );
}

/** G12/G30/G32 Cash Flow drilldown. Every number is a field of the engine forecast or preview. */
export function CashFlowPanel({ isOpen, onClose, initialDate }: CashFlowPanelProps) {
  const forecast = useGameStore(selectForecast);
  const activePreview = useGameStore((s) => s.activePreview);
  const [activeTab, setActiveTab] = useState<"chart" | "tasks">("chart");
  const [selectedDate, setSelectedDate] = useState<IsoDate | null>(null);
  const { copy, label } = useCopy();

  const titleId = useId();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;

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
    modalRef.current?.querySelector<HTMLElement>('[data-testid="close-cashflow-button"]')?.focus();
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previous?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const points = forecast.points;
  const tasks = forecast.tasks;
  const baseline = forecast.baseline;
  const stormDate = baseline.minimum.date;
  const focusDate = selectedDate ?? initialDate ?? stormDate;

  // With a preview: „Przed decyzją” (live) → „Po decyzji”; without: „Bez działania” → „Po zatwierdzeniu”.
  const comparison = activePreview ? activePreview.comparison : forecast.vsBaseline;
  const day = comparison.days.find((d) => d.date === focusDate) ?? null;
  const activePoint = points.find((p) => p.date === focusDate) ?? null;
  const beforeLabel = activePreview ? label("ui.cashflow.after") : label("ui.cashflow.before");
  const afterLabel = activePreview ? label("ui.cashflow.preview") : label("ui.cashflow.after");

  // Chart geometry (layout only; the plotted values are engine balances).
  const series = [
    ...points.map((p) => p.balance),
    ...baseline.points.map((p) => p.balance),
    ...(activePreview ? activePreview.after.points.map((p) => p.balance) : []),
    0,
  ];
  const minVal = Math.min(...series);
  const maxVal = Math.max(...series);
  const range = maxVal - minVal || 1;
  const chartWidth = 900;
  const chartHeight = 300;
  const padX = 40;
  const padY = 30;
  const plotW = chartWidth - padX * 2;
  const plotH = chartHeight - padY * 2;
  const getX = (i: number) => padX + (i / Math.max(1, points.length - 1)) * plotW;
  const getY = (v: number) => padY + plotH - ((v - minVal) / range) * plotH;
  const path = (values: number[]) =>
    values.map((v, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(v).toFixed(1)}`).join(" ");

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid="cashflow-drilldown-g12"
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-slate-900 border-2 border-indigo-500/80 rounded-3xl p-5 sm:p-8 max-w-5xl w-full shadow-2xl space-y-6 max-h-[92vh] flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 id={titleId} className="text-2xl font-black text-white">
              {copy("ui.forecast.title")}
            </h2>
            <p className="text-base text-slate-300">{copy("cashflow.explain")}</p>
          </div>

          <div className="flex items-center gap-2">
            <div role="tablist" className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "chart"}
                onClick={() => setActiveTab("chart")}
                className={`min-h-[44px] px-4 py-2 rounded-lg text-base font-bold transition ${
                  activeTab === "chart" ? "bg-indigo-600 text-white" : "text-slate-300 hover:text-white"
                }`}
              >
                {label("ui.cashflow.chart")}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "tasks"}
                onClick={() => setActiveTab("tasks")}
                data-testid="cashflow-tab-tasks"
                className={`min-h-[44px] px-4 py-2 rounded-lg text-base font-bold transition ${
                  activeTab === "tasks" ? "bg-indigo-600 text-white" : "text-slate-300 hover:text-white"
                }`}
              >
                {label("ui.cashflow.tasks")} ({tasks.length})
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              data-testid="close-cashflow-button"
              className="min-h-[44px] min-w-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-base font-bold transition cursor-pointer border border-slate-700"
            >
              {copy("ui.btn.close")}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6">
          {activeTab === "chart" ? (
            <div role="tabpanel" className="space-y-4">
              {day && (
                <div
                  data-testid="storm-28-xii-drilldown"
                  className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-base"
                >
                  <div>
                    <div className="text-slate-300">{label("ui.cashflow.day")}</div>
                    <div className="font-bold text-white font-mono">{shortDate(day.date)}</div>
                  </div>
                  <div>
                    <div className="text-slate-300">{beforeLabel}</div>
                    <div data-testid="drilldown-before" className="font-bold font-mono text-purple-300">
                      {pln(day.before)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-300">{afterLabel}</div>
                    <div data-testid="drilldown-after" className="font-bold font-mono text-emerald-300">
                      {pln(day.after)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-300">{label("ui.cashflow.delta")}</div>
                    <div data-testid="drilldown-delta" className="font-bold font-mono text-amber-300">
                      {signed(day.delta, pln(day.delta))}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-auto min-w-[700px] select-none"
                  role="img"
                  aria-label={copy("ui.forecast.title")}
                >
                  <line x1={padX} y1={getY(0)} x2={chartWidth - padX} y2={getY(0)} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" />
                  <path d={path(baseline.points.map((p) => p.balance))} fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="6 5" />
                  {activePreview && (
                    <path d={path(activePreview.after.points.map((p) => p.balance))} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="2 3" />
                  )}
                  <path d={path(points.map((p) => p.balance))} fill="none" stroke="#34d399" strokeWidth="3" />
                  {points.map((p, i) => {
                    const isFocus = p.date === focusDate;
                    const isStorm = p.date === stormDate;
                    return (
                      <g
                        key={p.date}
                        role="button"
                        tabIndex={0}
                        aria-label={`${shortDate(p.date)}: ${pln(p.balance)}`}
                        aria-pressed={isFocus}
                        data-testid={`chart-point-${p.date}`}
                        className="cursor-pointer focus:outline-none"
                        onClick={() => setSelectedDate(p.date)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedDate(p.date);
                          }
                        }}
                      >
                        <circle cx={getX(i)} cy={getY(p.balance)} r="9" fill="transparent" />
                        <circle
                          cx={getX(i)}
                          cy={getY(p.balance)}
                          r={isFocus ? 6 : isStorm ? 5 : 3.5}
                          fill={p.balance < 0 ? "#ef4444" : "#10b981"}
                          stroke={isFocus ? "#ffffff" : isStorm ? "#a855f7" : "#020617"}
                          strokeWidth="2"
                        />
                        {(i % 7 === 0 || isStorm) && (
                          <text x={getX(i)} y={chartHeight - 6} textAnchor="middle" fill={isStorm ? "#fbbf24" : "#cbd5e1"} fontSize="14" fontFamily="monospace">
                            {shortDate(p.date)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
                <ul className="flex flex-wrap gap-4 mt-2 text-base">
                  <li className="text-emerald-300">— {label("ui.cashflow.after")}</li>
                  <li className="text-purple-300">- - {label("ui.cashflow.before")}</li>
                  {activePreview && <li className="text-amber-300">··· {label("ui.cashflow.preview")}</li>}
                </ul>
              </div>

              {activePoint && (
                <div data-testid="selected-day-details" className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2 text-base">
                    <span className="font-bold text-white">
                      {label("ui.cashflow.day")} {shortDate(activePoint.date)}
                      {activePoint.counterfactual && ` · ${label("ui.cashflow.counterfactual")}`}
                    </span>
                    <span className="font-mono">
                      {label("ui.cashflow.balance")}: <strong>{pln(activePoint.balance)}</strong>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-base">
                    <div>
                      {label("ui.cashflow.opening")}: <strong className="font-mono">{pln(activePoint.openingBalance)}</strong>
                    </div>
                    <div>
                      {label("ui.cashflow.inflow")}: <strong className="font-mono text-emerald-300">{signed(activePoint.inflow, pln(activePoint.inflow))}</strong>
                    </div>
                    <div>
                      {label("ui.cashflow.outflow")}: <strong className="font-mono text-rose-200">{pln(activePoint.outflow)}</strong>
                    </div>
                  </div>
                  {activePoint.transactions.length > 0 && (
                    <ul className="space-y-1.5" data-testid="selected-day-transactions">
                      {activePoint.transactions.map((tx) => (
                        <TxRow key={`${tx.id}-${tx.date}`} tx={tx} />
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {(comparison.added.length > 0 || comparison.removed.length > 0) && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3" data-testid="comparison-changes">
                  {comparison.added.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-base font-bold text-emerald-300">{label("ui.cashflow.added")}</div>
                      <ul className="space-y-1.5">
                        {comparison.added.map((tx) => (
                          <TxRow key={`a-${tx.id}-${tx.date}`} tx={tx} />
                        ))}
                      </ul>
                    </div>
                  )}
                  {comparison.removed.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-base font-bold text-rose-200">{label("ui.cashflow.removed")}</div>
                      <ul className="space-y-1.5">
                        {comparison.removed.map((tx) => (
                          <TxRow key={`r-${tx.id}-${tx.date}`} tx={tx} />
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div role="tabpanel" data-testid="tasks-view" className="space-y-2">
              <ul className="space-y-2">
                {tasks.map((task) => (
                  <li
                    key={`${task.id}-${task.date}`}
                    data-testid={`task-row-${task.id}`}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-base"
                  >
                    <span className="space-y-0.5">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-slate-300">{shortDate(task.date)}</span>
                        <span className="px-1.5 py-0.5 rounded text-sm font-bold bg-slate-800 text-slate-100">
                          {label(TASK_STATUS_LABEL[task.status])}
                        </span>
                        <span className="font-bold text-white">{task.title}</span>
                      </span>
                      <span className="block text-slate-300">{task.counterpartyName}</span>
                    </span>
                    <span className="flex items-center gap-4 font-mono">
                      <span className={task.amount > 0 ? "text-emerald-300 font-bold" : "text-rose-200 font-bold"}>
                        {signed(task.amount, pln(task.amount))}
                      </span>
                      <span className="text-slate-200">
                        {label("ui.cashflow.balance")}: {pln(task.balanceAfter)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
