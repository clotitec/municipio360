"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, Clock, Accessibility, Phone, Globe,
  Navigation, Share2, Eye
} from "lucide-react";
import ImageCarousel from "@/components/media/ImageCarousel";
import Tour360Viewer from "@/components/media/Tour360Viewer";
import AudioPlayer from "@/components/media/AudioPlayer";
import GlassCard from "@/components/ui/GlassCard";
import { useMunicipio } from "@/app/[municipio]/MunicipioLayoutClient";
import { getLocalizedText } from "@/lib/i18n/config";
import { trackEvent } from "@/lib/analytics";
import type { Municipio, POI } from "@/lib/supabase/types";

function extractCoords(poi: POI): [number, number] | null {
  const c = poi.coords as unknown;
  if (c && typeof c === "object" && "coordinates" in (c as Record<string, unknown>)) {
    const coords = (c as { coordinates: number[] }).coordinates;
    return [coords[1], coords[0]]; // lat, lng
  }
  return null;
}

export default function PoiDetailClient({
  municipio,
  poi,
}: {
  municipio: Municipio;
  poi: POI;
}) {
  const { lang, setLang } = useMunicipio();
  const router = useRouter();
  const coords = extractCoords(poi);

  useEffect(() => {
    trackEvent(municipio.id, "page_view", { poi_id: poi.id, idioma: lang });
  }, [municipio.id, poi.id, lang]);

  const handleShare = async () => {
    trackEvent(municipio.id, "share", { poi_id: poi.id });
    if (navigator.share) {
      await navigator.share({
        title: getLocalizedText(poi.nombre, lang),
        text: getLocalizedText(poi.descripcion_corta, lang),
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleDirections = () => {
    if (!coords) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}`;
    window.open(url, "_blank");
  };

  const horario = poi.horario as Record<string, string> | null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full overflow-y-auto"
    >
      {/* Header */}
      <div className="relative">
        <ImageCarousel
          images={poi.imagenes || []}
          alt={getLocalizedText(poi.nombre, lang)}
        />
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 rounded-full backdrop-blur-xl bg-white/60 border border-white/30 shadow-md"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 p-2 rounded-full backdrop-blur-xl bg-white/60 border border-white/30 shadow-md"
        >
          <Share2 size={20} />
        </button>
      </div>

      <div className="p-4 space-y-4 pb-24">
        {/* Title + tipo */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getLocalizedText(poi.nombre, lang)}
          </h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <MapPin size={14} />
            <span className="capitalize">{poi.tipo.replace("_", " ")}</span>
            {poi.precio && (
              <>
                <span>·</span>
                <span>{poi.precio}</span>
              </>
            )}
            {poi.accesible && (
              <>
                <span>·</span>
                <Accessibility size={14} />
                <span>Accesible</span>
              </>
            )}
          </div>
        </div>

        {/* 360° Tour */}
        {(poi.tour_360_url || poi.gothru_embed) && (
          <GlassCard className="overflow-hidden" animate={false}>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <Eye size={16} />
                Tour 360°
              </div>
              <Tour360Viewer
                panoramaUrl={poi.tour_360_url}
                config={poi.tour_360_config as { hfov?: number; pitch?: number; yaw?: number; hotSpots?: { pitch: number; yaw: number; text: string; type?: string }[] } | null}
                gothruEmbed={poi.gothru_embed}
              />
            </div>
          </GlassCard>
        )}

        {/* Audio Guide */}
        {poi.audio_urls && Object.keys(poi.audio_urls).length > 0 && (
          <AudioPlayer
            audioUrls={poi.audio_urls as Record<string, string>}
            languages={municipio.idiomas}
            currentLang={lang}
            onLangChange={setLang}
            onPlay={() => trackEvent(municipio.id, "audio_play", { poi_id: poi.id, idioma: lang })}
            onComplete={() => trackEvent(municipio.id, "audio_complete", { poi_id: poi.id, idioma: lang })}
            onPause={() => trackEvent(municipio.id, "audio_pause", { poi_id: poi.id, idioma: lang })}
            color={municipio.color_primario}
          />
        )}

        {/* Description */}
        <GlassCard className="p-4" animate={false}>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {getLocalizedText(poi.descripcion, lang)}
          </p>
        </GlassCard>

        {/* Schedule */}
        {horario && Object.keys(horario).length > 0 && (
          <GlassCard className="p-4" animate={false}>
            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
              <Clock size={16} />
              Horario
            </div>
            <div className="space-y-1.5">
              {Object.entries(horario).map(([day, hours]) => (
                <div key={day} className="flex justify-between text-sm">
                  <span className="text-gray-500 capitalize">{day}</span>
                  <span className="text-gray-700">{hours}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Contact + Links */}
        <div className="flex gap-2 flex-wrap">
          {coords && (
            <button
              onClick={handleDirections}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium text-sm active:scale-95 transition-all"
              style={{ backgroundColor: municipio.color_primario }}
            >
              <Navigation size={16} />
              Cómo llegar
            </button>
          )}
          {poi.telefono && (
            <a
              href={`tel:${poi.telefono}`}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl backdrop-blur-xl bg-white/70 border border-white/30 text-sm font-medium text-gray-700"
            >
              <Phone size={16} />
            </a>
          )}
          {poi.web_url && (
            <a
              href={poi.web_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl backdrop-blur-xl bg-white/70 border border-white/30 text-sm font-medium text-gray-700"
            >
              <Globe size={16} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
