"use client";

import { useState, useEffect } from "react";
import { Volume2, Wand2, Play, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { POI } from "@/lib/supabase/types";

export default function AdminAudioPage() {
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: admin } = await supabase.from("admin_users").select("municipio_id").eq("id", user.id).single();
      if (!admin) return;

      const { data } = await supabase.from("pois").select("*").eq("municipio_id", admin.municipio_id).order("orden");
      setPois(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const handleGenerate = async (poiId: string) => {
    setGenerating(poiId);
    try {
      const res = await fetch("/api/audio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poi_id: poiId }),
      });
      if (!res.ok) throw new Error("Failed");
      // Refresh POI data
      const supabase = createClient();
      const { data } = await supabase.from("pois").select("*").eq("id", poiId).single();
      if (data) {
        setPois((prev) => prev.map((p) => (p.id === poiId ? data : p)));
      }
    } catch {
      alert("Error generando audio. Verifica la API key de ElevenLabs.");
    }
    setGenerating(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Audioguías</h1>
      <p className="text-sm text-gray-500">Genera y gestiona las audioguías de cada punto de interés.</p>

      <div className="space-y-3">
        {pois.map((poi) => {
          const nombre = (poi.nombre as Record<string, string>)?.es || "POI";
          const audioUrls = poi.audio_urls as Record<string, string>;
          const hasAudio = audioUrls && Object.keys(audioUrls).length > 0;

          return (
            <div key={poi.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Volume2 size={18} className={hasAudio ? "text-green-500" : "text-gray-300"} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{nombre}</p>
                <p className="text-xs text-gray-400 capitalize">{poi.tipo.replace("_", " ")}</p>
              </div>
              {hasAudio ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-600 font-medium">
                    {Object.keys(audioUrls).length} idiomas
                  </span>
                  <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                    <Play size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleGenerate(poi.id)}
                  disabled={generating === poi.id}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 disabled:opacity-50"
                >
                  {generating === poi.id ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                  Generar
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
