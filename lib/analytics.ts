import type { EventoTipo } from "./supabase/types";

export function trackEvent(
  municipioId: string,
  tipo: EventoTipo,
  extra?: {
    poi_id?: string;
    ruta_id?: string;
    coleccionable_id?: string;
    idioma?: string;
    metadata?: Record<string, unknown>;
  }
) {
  if (typeof navigator === "undefined") return;

  const payload = {
    municipio_id: municipioId,
    tipo,
    ...extra,
    user_agent: navigator.userAgent,
    referer: document.referrer || null,
  };

  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  navigator.sendBeacon("/api/analytics/event", blob);
}
