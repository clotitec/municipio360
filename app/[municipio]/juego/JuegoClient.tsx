"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, MapPin } from "lucide-react";
import CollectibleGrid from "@/components/game/CollectibleGrid";
import ProgressBar from "@/components/game/ProgressBar";
import CheckInButton from "@/components/game/CheckInButton";
import GlassCard from "@/components/ui/GlassCard";
import GlassModal from "@/components/ui/GlassModal";
import { useMunicipio } from "@/app/[municipio]/MunicipioLayoutClient";
import { getLocalizedText } from "@/lib/i18n/config";
import { trackEvent } from "@/lib/analytics";
import type { Municipio, Coleccionable } from "@/lib/supabase/types";

export default function JuegoClient({
  municipio,
  coleccionables,
}: {
  municipio: Municipio;
  coleccionables: Coleccionable[];
}) {
  const { lang } = useMunicipio();
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [points, setPoints] = useState(0);
  const [selected, setSelected] = useState<Coleccionable | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`m360_game_${municipio.id}`);
    if (saved) {
      const data = JSON.parse(saved);
      setUnlocked(data.unlocked || []);
      setPoints(data.points || 0);
    }
  }, [municipio.id]);

  const saveState = useCallback(
    (newUnlocked: string[], newPoints: number) => {
      localStorage.setItem(
        `m360_game_${municipio.id}`,
        JSON.stringify({ unlocked: newUnlocked, points: newPoints })
      );
    },
    [municipio.id]
  );

  const handleUnlock = (coleccionable: Coleccionable) => {
    if (unlocked.includes(coleccionable.id)) return;

    const newUnlocked = [...unlocked, coleccionable.id];
    const newPoints = points + coleccionable.puntos;
    setUnlocked(newUnlocked);
    setPoints(newPoints);
    saveState(newUnlocked, newPoints);

    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);

    trackEvent(municipio.id, "coleccionable_unlock", {
      coleccionable_id: coleccionable.id,
      idioma: lang,
    });
  };

  const categories = [...new Set(coleccionables.map((c) => c.categoria))];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto">
      <div className="p-4 space-y-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Colección</h1>
          <GlassCard className="px-3 py-1.5 flex items-center gap-1.5" animate={false}>
            <Star size={14} className="text-yellow-500" />
            <span className="text-sm font-bold text-gray-800">{points} pts</span>
          </GlassCard>
        </div>

        {/* Progress */}
        <ProgressBar
          current={unlocked.length}
          total={coleccionables.length}
          color={municipio.color_primario}
        />

        {/* Empty state */}
        {coleccionables.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Trophy size={48} className="mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">Próximamente</p>
            <p className="text-sm mt-1">Los coleccionables estarán disponibles pronto</p>
          </div>
        ) : (
          <>
            {/* Grid by category */}
            {categories.map((cat) => (
              <div key={cat}>
                <h2 className="text-sm font-semibold text-gray-600 capitalize mb-2">{cat}</h2>
                <CollectibleGrid
                  coleccionables={coleccionables.filter((c) => c.categoria === cat)}
                  unlocked={unlocked}
                  lang={lang}
                  onSelect={setSelected}
                />
              </div>
            ))}
          </>
        )}
      </div>

      {/* Detail Modal */}
      <GlassModal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? getLocalizedText(selected.nombre, lang) : ""}
      >
        {selected && (
          <div className="space-y-4">
            <img
              src={unlocked.includes(selected.id) ? selected.imagen_url : (selected.imagen_locked_url || selected.imagen_url)}
              alt={getLocalizedText(selected.nombre, lang)}
              className={`w-full h-48 object-cover rounded-xl ${
                unlocked.includes(selected.id) ? "" : "grayscale opacity-40"
              }`}
            />
            <p className="text-sm text-gray-600">
              {getLocalizedText(selected.descripcion, lang)}
            </p>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Star size={14} className="text-yellow-500" /> {selected.puntos} pts
              </span>
              <span className="capitalize">{selected.rareza}</span>
            </div>

            {!unlocked.includes(selected.id) && selected.desbloqueo_tipo === "checkin" && selected.poi_id && (
              <CheckInButton
                targetLat={0}
                targetLng={0}
                radiusM={selected.radio_checkin_m}
                onSuccess={() => handleUnlock(selected)}
                color={municipio.color_primario}
              />
            )}

            {unlocked.includes(selected.id) && (
              <div className="text-center py-2 text-green-600 font-medium flex items-center justify-center gap-2">
                <Trophy size={16} /> ¡Desbloqueado!
              </div>
            )}
          </div>
        )}
      </GlassModal>

      {/* Confetti overlay */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-6xl"
            >
              🎉
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
