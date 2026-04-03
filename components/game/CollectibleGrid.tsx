"use client";

import { motion } from "framer-motion";
import type { Coleccionable } from "@/lib/supabase/types";
import { getLocalizedText } from "@/lib/i18n/config";

interface CollectibleGridProps {
  coleccionables: Coleccionable[];
  unlocked: string[];
  lang: string;
  onSelect: (c: Coleccionable) => void;
}

const RAREZA_BORDER = {
  comun: "border-gray-300",
  raro: "border-blue-400",
  epico: "border-purple-500",
  legendario: "border-yellow-500",
};

export default function CollectibleGrid({ coleccionables, unlocked, lang, onSelect }: CollectibleGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {coleccionables.map((c, i) => {
        const isUnlocked = unlocked.includes(c.id);
        const borderClass = RAREZA_BORDER[c.rareza as keyof typeof RAREZA_BORDER] || RAREZA_BORDER.comun;

        return (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(c)}
            className={`relative aspect-square rounded-2xl border-2 overflow-hidden backdrop-blur-xl transition-all active:scale-95 ${
              isUnlocked
                ? `${borderClass} bg-white/70 shadow-lg`
                : "border-gray-200 bg-gray-100/50"
            }`}
          >
            <img
              src={isUnlocked ? c.imagen_url : (c.imagen_locked_url || c.imagen_url)}
              alt={getLocalizedText(c.nombre, lang)}
              className={`w-full h-full object-cover ${isUnlocked ? "" : "grayscale opacity-40"}`}
            />
            {!isUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-3xl">🔒</div>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent">
              <span className="text-[10px] text-white font-medium line-clamp-1">
                {getLocalizedText(c.nombre, lang)}
              </span>
            </div>
            {isUnlocked && (
              <div className="absolute top-1 right-1 text-xs">✅</div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
