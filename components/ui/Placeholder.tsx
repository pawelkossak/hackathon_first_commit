import React from "react";

export interface PlaceholderProps {
  id: string;
  width?: number;
  height?: number;
  label?: string;
  className?: string;
  role?: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  sky: { bg: "bg-purple-950/60", text: "text-purple-300", border: "border-purple-700/60" },
  weather: { bg: "bg-purple-900/70", text: "text-purple-200", border: "border-purple-600" },
  campaign: { bg: "bg-indigo-950/70", text: "text-indigo-300", border: "border-indigo-700/60" },
  week: { bg: "bg-emerald-950/70", text: "text-emerald-300", border: "border-emerald-700/60" },
  boss: { bg: "bg-amber-950/60", text: "text-amber-300", border: "border-amber-700/60" },
  player: { bg: "bg-teal-950/70", text: "text-teal-300", border: "border-teal-700/60" },
  client: { bg: "bg-sky-950/70", text: "text-sky-300", border: "border-sky-700/60" },
  bank: { bg: "bg-slate-900", text: "text-slate-300", border: "border-slate-700" },
  cfo: { bg: "bg-violet-950/70", text: "text-violet-300", border: "border-violet-700/60" },
  cat: { bg: "bg-orange-950/60", text: "text-orange-300", border: "border-orange-700/60" },
  action: { bg: "bg-amber-900/60", text: "text-amber-200", border: "border-amber-500/80" },
  event: { bg: "bg-rose-950/70", text: "text-rose-300", border: "border-rose-700/70" },
  crash: { bg: "bg-red-950/80", text: "text-red-300", border: "border-red-600" },
  default: { bg: "bg-slate-900", text: "text-slate-400", border: "border-slate-700" },
};

function getColors(id: string) {
  for (const [prefix, col] of Object.entries(CATEGORY_COLORS)) {
    if (id.includes(prefix)) return col;
  }
  return CATEGORY_COLORS.default;
}

export function Placeholder({
  id,
  width,
  height,
  label,
  className = "",
  role = "img",
}: PlaceholderProps) {
  const colors = getColors(id);
  const style: React.CSSProperties = {
    maxWidth: "100%",
    ...(width ? { width: `${width}px` } : {}),
    ...(height ? { height: `${height}px` } : {}),
    ...(width && height ? { aspectRatio: `${width} / ${height}` } : {}),
  };

  return (
    <div
      role={role}
      aria-label={label ?? `Placeholder dla ${id}`}
      data-asset-id={id}
      data-testid={`placeholder-${id}`}
      style={style}
      className={`flex flex-col items-center justify-center p-2 rounded-xl border border-dashed transition-all select-none overflow-hidden text-center ${colors.bg} ${colors.text} ${colors.border} ${className}`}
    >
      <div className="font-mono text-xs font-bold truncate max-w-full px-1">{id}</div>
      {(width || height) && (
        <div className="text-[10px] opacity-75 font-mono mt-0.5">
          {width ?? "?"}×{height ?? "?"} px
        </div>
      )}
      {label && <div className="text-xs font-medium mt-1 truncate max-w-full px-1">{label}</div>}
    </div>
  );
}
