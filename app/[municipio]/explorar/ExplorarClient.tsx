"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Star, Headphones, View } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import SearchBar from "@/components/ui/SearchBar";
import { useMunicipio } from "@/app/[municipio]/MunicipioLayoutClient";
import { getLocalizedText } from "@/lib/i18n/config";
import type { Municipio, POI, PoiTipo } from "@/lib/supabase/types";

const TIPO_LABELS: Partial<Record<PoiTipo, string>> = {
  monumento: "Monumentos",
  playa: "Playas",
  mirador: "Miradores",
  museo: "Museos",
  iglesia: "Iglesias",
  castillo: "Castillos",
  restaurante: "Restaurantes",
  parque: "Parques",
};

export default function ExplorarClient({
  municipio,
  pois,
}: {
  municipio: Municipio;
  pois: POI[];
}) {
  const { lang } = useMunicipio();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState<PoiTipo | "all">("all");

  const tipos = [...new Set(pois.map((p) => p.tipo))];

  const filtered = useMemo(() => {
    return pois.filter((p) => {
      if (filterTipo !== "all" && p.tipo !== filterTipo) return false;
      if (search) {
        const name = getLocalizedText(p.nombre, lang).toLowerCase();
        return name.includes(search.toLowerCase());
      }
      return true;
    });
  }, [pois, filterTipo, search, lang]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto">
      <div className="p-4 space-y-4 pb-24">
        <h1 className="text-2xl font-bold text-gray-900">Explorar</h1>
        <p className="text-sm text-gray-500">{pois.length} puntos de interés en {municipio.nombre}</p>

        <SearchBar value={search} onChange={setSearch} placeholder="Buscar lugares..." />

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <FilterPill active={filterTipo === "all"} onClick={() => setFilterTipo("all")}>
            Todos ({pois.length})
          </FilterPill>
          {tipos.map((t) => (
            <FilterPill key={t} active={filterTipo === t} onClick={() => setFilterTipo(t)}>
              {TIPO_LABELS[t] || t} ({pois.filter((p) => p.tipo === t).length})
            </FilterPill>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <MapPin size={40} className="mx-auto mb-2 opacity-40" />
            <p>No se encontraron lugares</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((poi, i) => (
              <motion.div
                key={poi.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <GlassCard
                  className="overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                  animate={false}
                  onClick={() => router.push(`/${municipio.slug}/poi/${poi.id}`)}
                >
                  {poi.imagenes?.[0] ? (
                    <img
                      src={poi.imagenes[0]}
                      alt={getLocalizedText(poi.nombre, lang)}
                      className="w-full h-32 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <MapPin size={24} className="text-gray-300" />
                    </div>
                  )}
                  <div className="p-3 space-y-1.5">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">
                        {getLocalizedText(poi.nombre, lang)}
                      </h3>
                      {poi.destacado && <Star size={14} className="text-yellow-500 flex-shrink-0 mt-0.5" />}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {getLocalizedText(poi.descripcion_corta, lang)}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span className="capitalize">{poi.tipo.replace("_", " ")}</span>
                      {poi.tour_360_url && (
                        <span className="flex items-center gap-0.5"><View size={10} /> 360°</span>
                      )}
                      {poi.audio_urls && Object.keys(poi.audio_urls).length > 0 && (
                        <span className="flex items-center gap-0.5"><Headphones size={10} /> Audio</span>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function FilterPill({
  children, active, onClick,
}: {
  children: React.ReactNode; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
        active ? "bg-gray-800 text-white" : "backdrop-blur-xl bg-white/60 border border-white/30 text-gray-600 hover:bg-white/80"
      }`}
    >
      {children}
    </button>
  );
}
