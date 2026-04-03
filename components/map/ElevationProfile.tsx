"use client";

interface ElevationProfileProps {
  data: { distance: number; elevation: number }[];
  color?: string;
  height?: number;
}

export default function ElevationProfile({
  data,
  color = "#1A5276",
  height = 120,
}: ElevationProfileProps) {
  if (!data.length) return null;

  const maxDist = Math.max(...data.map((d) => d.distance));
  const minElev = Math.min(...data.map((d) => d.elevation));
  const maxElev = Math.max(...data.map((d) => d.elevation));
  const elevRange = maxElev - minElev || 1;
  const padding = 10;
  const w = 100;

  const points = data
    .map((d) => {
      const x = (d.distance / maxDist) * w;
      const y = height - padding - ((d.elevation - minElev) / elevRange) * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height - padding} ${points} ${w},${height - padding}`;

  return (
    <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Perfil de elevación</span>
        <span className="text-xs text-gray-400">
          {Math.round(minElev)}m — {Math.round(maxElev)}m
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#elevGrad)" />
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>0 km</span>
        <span>{(maxDist / 1000).toFixed(1)} km</span>
      </div>
    </div>
  );
}
