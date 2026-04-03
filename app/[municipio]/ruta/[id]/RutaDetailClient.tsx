"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Download, MapPin, Clock, Mountain,
  Ruler, TrendingUp, RotateCcw
} from "lucide-react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLE } from "@/lib/maplibre/config";
import { getPoiMarkerHtml } from "@/lib/maplibre/icons";
import ElevationProfile from "@/components/map/ElevationProfile";
import AudioPlayer from "@/components/media/AudioPlayer";
import GlassCard from "@/components/ui/GlassCard";
import { useMunicipio } from "@/app/[municipio]/MunicipioLayoutClient";
import { getLocalizedText } from "@/lib/i18n/config";
import { trackEvent } from "@/lib/analytics";
import type { Municipio, Ruta, POI } from "@/lib/supabase/types";

const DIFICULTAD_COLORS = { facil: "#4CAF50", media: "#FF9800", dificil: "#F44336" };

export default function RutaDetailClient({
  municipio,
  ruta,
  pois,
}: {
  municipio: Municipio;
  ruta: Ruta;
  pois: POI[];
}) {
  const { lang, setLang } = useMunicipio();
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    trackEvent(municipio.id, "ruta_start", { ruta_id: ruta.id, idioma: lang });
  }, [municipio.id, ruta.id, lang]);

  // Map with route + POI markers
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [-4.7553, 43.4213],
      zoom: 13,
      attributionControl: false,
    });

    map.on("load", () => {
      // Add route line
      if (ruta.geojson) {
        map.addSource("route", {
          type: "geojson",
          data: ruta.geojson as unknown as GeoJSON.GeoJSON,
        });
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          paint: {
            "line-color": municipio.color_primario,
            "line-width": 4,
            "line-opacity": 0.8,
          },
          layout: { "line-join": "round", "line-cap": "round" },
        });
      }

      // Fit to bbox
      if (ruta.bbox && ruta.bbox.length === 4) {
        map.fitBounds(
          [[ruta.bbox[0], ruta.bbox[1]], [ruta.bbox[2], ruta.bbox[3]]],
          { padding: 50, duration: 500 }
        );
      }

      // Add numbered POI markers
      pois.forEach((poi, index) => {
        const c = poi.coords as unknown as { coordinates?: number[] };
        if (!c?.coordinates) return;

        const el = document.createElement("div");
        el.innerHTML = getPoiMarkerHtml(poi.tipo, municipio.color_primario);

        // Add number badge
        const badge = document.createElement("div");
        badge.style.cssText = `position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;background:${municipio.color_secundario};color:white;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid white;`;
        badge.textContent = String(index + 1);
        el.style.position = "relative";
        el.appendChild(badge);

        el.style.cursor = "pointer";
        el.addEventListener("click", () => {
          router.push(`/${municipio.slug}/poi/${poi.id}`);
        });

        new maplibregl.Marker({ element: el })
          .setLngLat([c.coordinates[0], c.coordinates[1]])
          .addTo(map);
      });
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [ruta, pois, municipio, router]);

  const handleDownloadGpx = () => {
    if (!ruta.gpx_url) return;
    trackEvent(municipio.id, "gpx_download", { ruta_id: ruta.id });
    window.open(ruta.gpx_url, "_blank");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto">
      {/* Map */}
      <div className="relative h-64">
        <div ref={mapContainer} className="w-full h-full" />
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 rounded-full backdrop-blur-xl bg-white/60 border border-white/30 shadow-md z-10"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="p-4 space-y-4 pb-24">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getLocalizedText(ruta.nombre, lang)}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: DIFICULTAD_COLORS[ruta.dificultad] }}
            >
              {ruta.dificultad}
            </span>
            <span className="text-sm text-gray-500 capitalize">{ruta.tipo}</span>
            {ruta.circular && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <RotateCcw size={12} /> Circular
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Ruler, value: ruta.distancia_km ? `${ruta.distancia_km.toFixed(1)} km` : "-", label: "Distancia" },
            { icon: Clock, value: ruta.duracion_min ? `${ruta.duracion_min} min` : "-", label: "Duración" },
            { icon: TrendingUp, value: ruta.desnivel_positivo_m ? `+${ruta.desnivel_positivo_m}m` : "-", label: "Desnivel+" },
            { icon: Mountain, value: ruta.desnivel_negativo_m ? `-${ruta.desnivel_negativo_m}m` : "-", label: "Desnivel-" },
          ].map((stat, i) => (
            <GlassCard key={i} className="p-3 text-center" animate={false}>
              <stat.icon size={16} className="mx-auto text-gray-400 mb-1" />
              <div className="text-sm font-semibold text-gray-800">{stat.value}</div>
              <div className="text-[10px] text-gray-400">{stat.label}</div>
            </GlassCard>
          ))}
        </div>

        {/* Elevation Profile */}
        {ruta.elevation_profile && (ruta.elevation_profile as { distance: number; elevation: number }[]).length > 0 && (
          <ElevationProfile
            data={ruta.elevation_profile as { distance: number; elevation: number }[]}
            color={municipio.color_primario}
          />
        )}

        {/* Audio */}
        {ruta.audio_ruta_urls && Object.keys(ruta.audio_ruta_urls).length > 0 && (
          <AudioPlayer
            audioUrls={ruta.audio_ruta_urls as Record<string, string>}
            languages={municipio.idiomas}
            currentLang={lang}
            onLangChange={setLang}
            onPlay={() => trackEvent(municipio.id, "audio_play", { ruta_id: ruta.id, idioma: lang })}
            color={municipio.color_primario}
          />
        )}

        {/* Description */}
        <GlassCard className="p-4" animate={false}>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {getLocalizedText(ruta.descripcion, lang)}
          </p>
        </GlassCard>

        {/* POIs list */}
        {pois.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Puntos de la ruta ({pois.length})
            </h3>
            <div className="space-y-2">
              {pois.map((poi, i) => (
                <GlassCard
                  key={poi.id}
                  className="p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                  animate={false}
                  onClick={() => router.push(`/${municipio.slug}/poi/${poi.id}`)}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: municipio.color_primario }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {getLocalizedText(poi.nombre, lang)}
                    </div>
                    <div className="text-xs text-gray-400 capitalize">{poi.tipo.replace("_", " ")}</div>
                  </div>
                  <MapPin size={14} className="text-gray-300 flex-shrink-0" />
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Download GPX */}
        {ruta.gpx_url && (
          <button
            onClick={handleDownloadGpx}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium text-sm active:scale-95 transition-all"
            style={{ backgroundColor: municipio.color_primario }}
          >
            <Download size={16} />
            Descargar GPX
          </button>
        )}
      </div>
    </motion.div>
  );
}
