"use client";

interface ProgressBarProps {
  current: number;
  total: number;
  color?: string;
}

export default function ProgressBar({ current, total, color = "#1A5276" }: ProgressBarProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Progreso</span>
        <span className="text-sm font-bold" style={{ color }}>
          {current}/{total}
        </span>
      </div>
      <div className="w-full h-3 bg-gray-200/60 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
      <div className="text-right mt-1">
        <span className="text-xs text-gray-400">{percent}% completado</span>
      </div>
    </div>
  );
}
