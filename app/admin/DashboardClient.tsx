"use client";

import { Eye, MapPin, Route, Volume2 } from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";
import ChartLine from "@/components/admin/ChartLine";
import { useAdmin } from "./AdminLayoutClient";

interface DashboardProps {
  stats: {
    totalPois: number;
    totalRutas: number;
    visitsWeek: number;
    audioPlays: number;
  };
  chartData: { date: string; value: number }[];
  topPois: { id: string; name: string; count: number }[];
}

export default function DashboardClient({ stats, chartData, topPois }: DashboardProps) {
  const { adminUser } = useAdmin();
  const color = adminUser.municipios.color_primario;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Resumen de {adminUser.municipios.nombre}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Visitas (7d)" value={stats.visitsWeek} icon={Eye} color={color} />
        <StatsCard title="POIs" value={stats.totalPois} icon={MapPin} color="#4CAF50" />
        <StatsCard title="Rutas" value={stats.totalRutas} icon={Route} color="#FF9800" />
        <StatsCard title="Audios (7d)" value={stats.audioPlays} icon={Volume2} color="#9C27B0" />
      </div>

      <ChartLine data={chartData} color={color} />

      {topPois.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Top 5 POIs (7 días)</h3>
          <div className="space-y-3">
            {topPois.map((poi, i) => (
              <div key={poi.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm text-gray-700 truncate">{poi.name}</span>
                <span className="text-sm font-medium text-gray-900">{poi.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
