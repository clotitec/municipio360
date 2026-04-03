"use client";

import { useState, useEffect } from "react";
import { BarChart3, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ChartLine from "@/components/admin/ChartLine";

export default function AdminAnaliticaPage() {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]);
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: admin } = await supabase.from("admin_users").select("municipio_id").eq("id", user.id).single();
      if (!admin) return;

      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const { data: events } = await supabase
        .from("analytics_events")
        .select("tipo, created_at")
        .eq("municipio_id", admin.municipio_id)
        .gte("created_at", monthAgo.toISOString());

      // Chart data: daily page views
      const dayMap = new Map<string, number>();
      const typeCounts: Record<string, number> = {};

      (events || []).forEach((e) => {
        const day = e.created_at.substring(0, 10);
        if (e.tipo === "page_view") {
          dayMap.set(day, (dayMap.get(day) || 0) + 1);
        }
        typeCounts[e.tipo] = (typeCounts[e.tipo] || 0) + 1;
      });

      const now = new Date();
      const chart: { date: string; value: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().substring(0, 10);
        chart.push({ date: key.substring(5), value: dayMap.get(key) || 0 });
      }

      setChartData(chart);
      setEventCounts(typeCounts);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analítica</h1>

      <ChartLine data={chartData} />

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Eventos por tipo (30 días)</h3>
        {Object.keys(eventCounts).length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <BarChart3 size={32} className="mx-auto mb-2 opacity-40" />
            <p>Sin datos aún</p>
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(eventCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([tipo, count]) => (
                <div key={tipo} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 flex-1">{tipo.replace("_", " ")}</span>
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${(count / Math.max(...Object.values(eventCounts))) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-800 w-12 text-right">{count}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
