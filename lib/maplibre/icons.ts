import type { PoiTipo } from "@/lib/supabase/types";

export const POI_ICONS: Record<PoiTipo, { icon: string; color: string }> = {
  monumento: { icon: "🏛️", color: "#8B4513" },
  playa: { icon: "🏖️", color: "#00BCD4" },
  mirador: { icon: "🔭", color: "#4CAF50" },
  museo: { icon: "🏛️", color: "#9C27B0" },
  iglesia: { icon: "⛪", color: "#795548" },
  castillo: { icon: "🏰", color: "#607D8B" },
  cueva: { icon: "🕳️", color: "#3E2723" },
  puente: { icon: "🌉", color: "#455A64" },
  faro: { icon: "🗼", color: "#FF9800" },
  parque: { icon: "🌳", color: "#4CAF50" },
  ruta_inicio: { icon: "🚩", color: "#F44336" },
  restaurante: { icon: "🍽️", color: "#FF5722" },
  alojamiento: { icon: "🏨", color: "#3F51B5" },
  parking: { icon: "🅿️", color: "#2196F3" },
  oficina_turismo: { icon: "ℹ️", color: "#009688" },
};

export function getPoiMarkerHtml(tipo: PoiTipo, color?: string): string {
  const config = POI_ICONS[tipo];
  const bgColor = color || config.color;
  return `<div style="
    width:36px;height:36px;border-radius:50%;
    background:${bgColor};
    display:flex;align-items:center;justify-content:center;
    font-size:18px;
    box-shadow:0 2px 8px rgba(0,0,0,0.3);
    border:2px solid white;
    cursor:pointer;
    transition:transform 0.2s;
  " class="poi-marker">${config.icon}</div>`;
}

export function getClusterMarkerHtml(count: number, color: string): string {
  const size = Math.min(24 + count * 2, 56);
  return `<div style="
    width:${size}px;height:${size}px;border-radius:50%;
    background:${color};color:white;
    display:flex;align-items:center;justify-content:center;
    font-weight:700;font-size:14px;
    box-shadow:0 2px 8px rgba(0,0,0,0.3);
    border:3px solid white;
  ">${count}</div>`;
}
