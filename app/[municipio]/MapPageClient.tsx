"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { MapPin, Clock, ChevronRight } from "lucide-react";
import GlassModal from "@/components/ui/GlassModal";
import LanguageSelector from "@/components/ui/LanguageSelector";
import SearchBar from "@/components/ui/SearchBar";
import { useMunicipio } from "./MunicipioLayoutClient";
import { getLocalizedText } from "@/lib/i18n/config";
import { trackEvent } from "@/lib/analytics";
import type { Municipio, POI } from "@/lib/supabase/types";

const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });

function extractCoords(poi: POI): { lng: number; lat: number } | null {
  const c = poi.coords as unknown;
  if (c && typeof c === "object" && "coordinates" in (c as Record<string, unknown>)) {
    const coords = (c as { coordinates: number[] }).coordinates;
    return { lng: coords[0], lat: coords[1] };
  }
  return null;
}

export default function MapPageClient({
  municipio,
  pois: rawPois,
}: {
  municipio: Municipio;
  pois: POI[];
}) {
  const { lang, setLang } = useMunicipio();
  const router = useRouter();
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [search, setSearch] = useState("");

  const pois = useMemo(() => {
    return rawPois
      .map((p) => {
        const c = extractCoords(p);
        if (!c) return null;
        return { ...p, ...c };
      })
      .filter(Boolean) as (POI & { lng: number; lat: number })[];
  }, [rawPois]);

  const filteredPois = useMemo(() => {
    if (!search) return pois;
    const q = search.toLowerCase();
    return pois.filter((p) => {
      const name = getLocalizedText(p.nombre, lang).toLowerCase();
      return name.includes(q) || p.tipo.includes(q);
    });
  }, [pois, search, lang]);

  // Extract center from municipio coords
  const center = useMemo<[number, number]>(() => {
    const c = municipio.coords as unknown;
    if (c && typeof c === "object" && "coordinates" in (c as Record<string, unknown>)) {
      const coords = (c as { coordinates: number[] }).coordinates;
      return [coords[0], coords[1]];
    }
    return [-4.7553, 43.4213];
  }, [municipio.coords]);

  const handlePoiClick = (poi: POI) => {
    setSelectedPoi(poi);
    trackEvent(municipio.id, "page_view", { poi_id: poi.id, idioma: lang });
  };

  return (
    <div className="relative h-full">
      {/* Search + Language overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder={`Buscar en ${municipio.nombre}...`}
          />
        </div>
        <LanguageSelector
          languages={municipio.idiomas}
          current={lang}
          onChange={setLang}
        />
      </div>

      {/* Map */}
      <MapView
        center={center}
        zoom={municipio.zoom_default}
        pois={filteredPois}
        color={municipio.color_primario}
        onPoiClick={handlePoiClick}
      />

      {/* POI Preview Bottom Sheet */}
      <GlassModal
        open={!!selectedPoi}
        onClose={() => setSelectedPoi(null)}
        title={selectedPoi ? getLocalizedText(selectedPoi.nombre, lang) : ""}
      >
        {selectedPoi && (
          <div className="space-y-3">
            {selectedPoi.imagenes?.[0] && (
              <img
                src={selectedPoi.imagenes[0]}
                alt={getLocalizedText(selectedPoi.nombre, lang)}
                className="w-full h-40 object-cover rounded-xl"
              />
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin size={14} />
              <span className="capitalize">{selectedPoi.tipo.replace("_", " ")}</span>
              {selectedPoi.precio && (
                <>
                  <span>·</span>
                  <span>{selectedPoi.precio}</span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-700 line-clamp-3">
              {getLocalizedText(selectedPoi.descripcion_corta, lang) ||
                getLocalizedText(selectedPoi.descripcion, lang)}
            </p>
            {selectedPoi.horario && Object.keys(selectedPoi.horario as object).length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock size={12} />
                <span>Ver horarios</span>
              </div>
            )}
            <button
              onClick={() => {
                router.push(`/${municipio.slug}/poi/${selectedPoi.id}`);
                setSelectedPoi(null);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-white transition-all active:scale-95"
              style={{ backgroundColor: municipio.color_primario }}
            >
              Ver detalle
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </GlassModal>
    </div>
  );
}
