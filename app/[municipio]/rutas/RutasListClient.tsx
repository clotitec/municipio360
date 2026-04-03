"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Route, Clock, Ruler, Mountain } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import SearchBar from "@/components/ui/SearchBar";
import { useMunicipio } from "@/app/[municipio]/MunicipioLayoutClient";
import { getLocalizedText } from "@/lib/i18n/config";
import type { Municipio, Ruta, RutaTipo, DificultadTipo } from "@/lib/supabase/types";

const TIPO_LABELS: Record<RutaTipo, string> = {
  senderismo: "Senderismo",
  urbana: "Urbana",
  ciclista: "Ciclista",
  patrimonial: "Patrimonial",
  gastronomica: "Gastronómica",
  costera: "Costera",
};

const DIF_COLORS: Record<DificultadTipo, string> = {
  facil: "#4CAF50",
  media: "#FF9800",
  dificil: "#F44336",
};

export default function RutasListClient({
  municipio,
  rutas,
}: {
  municipio: Municipio;
  rutas: Ruta[];
}) {
  const { lang } = useMunicipio();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState<RutaTipo | "all">("all");
  const [filterDif, setFilterDif] = useState<DificultadTipo | "all">("all");

  const filtered = useMemo(() => {
    return rutas.filter((r) => {
      if (filterTipo !== "all" && r.tipo !== filterTipo) return false;
      if (filterDif !== "all" && r.dificultad !== filterDif) return false;
      if (search) {
        const name = getLocalizedText(r.nombre, lang).toLowerCase();
        if (!name.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [rutas, filterTipo, filterDif, search, lang]);

  const tipos = [...new Set(rutas.map((r) => r.tipo))];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto">
      <div className="p-4 space-y-4 pb-24">
        <h1 className="text-2xl font-bold text-gray-900">Rutas</h1>

        <SearchBar value={search} onChange={setSearch} placeholder="Buscar rutas..." />

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <FilterPill active={filterTipo === "all"} onClick={() => setFilterTipo("all")}>
            Todas
          </FilterPill>
          {tipos.map((t) => (
            <FilterPill key={t} active={filterTipo === t} onClick={() => setFilterTipo(t)}>
              {TIPO_LABELS[t]}
            </FilterPill>
          ))}
        </div>
        <div className="flex gap-2">
          <FilterPill active={filterDif === "all"} onClick={() => setFilterDif("all")}>
            Cualquier dificultad
          </FilterPill>
          {(["facil", "media", "dificil"] as const).map((d) => (
            <FilterPill key={d} active={filterDif === d} onClick={() => setFilterDif(d)}>
              <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: DIF_COLORS[d] }} />
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </FilterPill>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Route size={40} className="mx-auto mb-2 opacity-40" />
            <p>No se encontraron rutas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((ruta) => (
              <GlassCard
                key={ruta.id}
                className="overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => router.push(`/${municipio.slug}/ruta/${ruta.id}`)}
              >
                {ruta.imagenes?.[0] && (
                  <img
                    src={ruta.imagenes[0]}
                    alt={getLocalizedText(ruta.nombre, lang)}
                    className="w-full h-36 object-cover"
                    loading="lazy"
                  />
                )}
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">
                      {getLocalizedText(ruta.nombre, lang)}
                    </h3>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
                      style={{ backgroundColor: DIF_COLORS[ruta.dificultad] }}
                    >
                      {ruta.dificultad}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {ruta.distancia_km && (
                      <span className="flex items-center gap-1">
                        <Ruler size={12} /> {ruta.distancia_km.toFixed(1)} km
                      </span>
                    )}
                    {ruta.duracion_min && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {ruta.duracion_min} min
                      </span>
                    )}
                    {ruta.desnivel_positivo_m && (
                      <span className="flex items-center gap-1">
                        <Mountain size={12} /> +{ruta.desnivel_positivo_m}m
                      </span>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function FilterPill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
        active
          ? "bg-gray-800 text-white"
          : "backdrop-blur-xl bg-white/60 border border-white/30 text-gray-600 hover:bg-white/80"
      }`}
    >
      {children}
    </button>
  );
}
