import { createServerSupabaseClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("municipio_id")
    .eq("id", user.id)
    .single();

  if (!adminUser) return null;
  const muniId = adminUser.municipio_id;

  // Get stats
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    { count: totalPois },
    { count: totalRutas },
    { count: visitsWeek },
    { count: audioPlays },
    { data: recentEvents },
    { data: topPois },
  ] = await Promise.all([
    supabase.from("pois").select("*", { count: "exact", head: true }).eq("municipio_id", muniId),
    supabase.from("rutas").select("*", { count: "exact", head: true }).eq("municipio_id", muniId),
    supabase.from("analytics_events").select("*", { count: "exact", head: true })
      .eq("municipio_id", muniId).eq("tipo", "page_view").gte("created_at", weekAgo.toISOString()),
    supabase.from("analytics_events").select("*", { count: "exact", head: true })
      .eq("municipio_id", muniId).eq("tipo", "audio_play").gte("created_at", weekAgo.toISOString()),
    supabase.from("analytics_events").select("created_at")
      .eq("municipio_id", muniId).eq("tipo", "page_view")
      .gte("created_at", monthAgo.toISOString()).order("created_at"),
    supabase.from("analytics_events").select("poi_id")
      .eq("municipio_id", muniId).eq("tipo", "page_view")
      .not("poi_id", "is", null)
      .gte("created_at", weekAgo.toISOString()),
  ]);

  // Group visits by day for chart
  const chartData: { date: string; value: number }[] = [];
  const dayMap = new Map<string, number>();
  (recentEvents || []).forEach((e) => {
    const day = e.created_at.substring(0, 10);
    dayMap.set(day, (dayMap.get(day) || 0) + 1);
  });
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().substring(0, 10);
    chartData.push({ date: key.substring(5), value: dayMap.get(key) || 0 });
  }

  // Top POIs
  const poiCounts = new Map<string, number>();
  (topPois || []).forEach((e) => {
    if (e.poi_id) poiCounts.set(e.poi_id, (poiCounts.get(e.poi_id) || 0) + 1);
  });
  const topPoiIds = [...poiCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ id, count }));

  let topPoiNames: { id: string; name: string; count: number }[] = [];
  if (topPoiIds.length > 0) {
    const { data: poiData } = await supabase
      .from("pois")
      .select("id, nombre")
      .in("id", topPoiIds.map((p) => p.id));
    topPoiNames = topPoiIds.map((tp) => ({
      ...tp,
      name: (poiData?.find((p) => p.id === tp.id)?.nombre as Record<string, string>)?.es || "POI",
    }));
  }

  return (
    <DashboardClient
      stats={{
        totalPois: totalPois || 0,
        totalRutas: totalRutas || 0,
        visitsWeek: visitsWeek || 0,
        audioPlays: audioPlays || 0,
      }}
      chartData={chartData}
      topPois={topPoiNames}
    />
  );
}
