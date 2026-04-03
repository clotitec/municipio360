export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Enums
export type PlanTipo = "free" | "pro" | "enterprise";
export type PoiTipo =
  | "monumento" | "playa" | "mirador" | "museo" | "iglesia"
  | "castillo" | "cueva" | "puente" | "faro" | "parque"
  | "ruta_inicio" | "restaurante" | "alojamiento" | "parking" | "oficina_turismo";
export type RutaTipo = "senderismo" | "urbana" | "ciclista" | "patrimonial" | "gastronomica" | "costera";
export type DificultadTipo = "facil" | "media" | "dificil";
export type EventoTipo =
  | "page_view" | "tour_360_open" | "tour_360_close"
  | "audio_play" | "audio_complete" | "audio_pause"
  | "gpx_download" | "coleccionable_unlock" | "poi_checkin"
  | "share" | "pwa_install" | "map_interaction" | "search"
  | "ruta_start" | "ruta_complete" | "language_change"
  | "matterport_open" | "splat_open" | "qr_scan";

// Multilingual JSON field
export type MultiLang = { [lang: string]: string };

// Tables
export interface Municipio {
  id: string;
  nombre: string;
  slug: string;
  provincia: string;
  ccaa: string;
  poblacion: number | null;
  codigo_ine: string | null;
  coords: unknown; // PostGIS Geography
  zoom_default: number;
  logo_url: string | null;
  color_primario: string;
  color_secundario: string;
  color_fondo: string;
  fuente: string;
  idiomas: string[];
  idioma_default: string;
  plan: PlanTipo;
  activo: boolean;
  dominio_custom: string | null;
  descripcion: MultiLang;
  redes_sociales: Json;
  horario_oficina: Json;
  contacto_email: string | null;
  contacto_telefono: string | null;
  created_at: string;
  updated_at: string;
}

export interface POI {
  id: string;
  municipio_id: string;
  nombre: MultiLang;
  descripcion: MultiLang;
  descripcion_corta: MultiLang;
  tipo: PoiTipo;
  tags: string[];
  coords: unknown;
  direccion: string | null;
  imagenes: string[];
  thumbnail_url: string | null;
  tour_360_url: string | null;
  tour_360_config: Json;
  gothru_embed: string | null;
  matterport_url: string | null;
  splat_url: string | null;
  audio_urls: MultiLang;
  audio_duracion: { [lang: string]: number };
  horario: Json;
  precio: string | null;
  accesible: boolean;
  telefono: string | null;
  web_url: string | null;
  destacado: boolean;
  visible: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface Ruta {
  id: string;
  municipio_id: string;
  nombre: MultiLang;
  descripcion: MultiLang;
  tipo: RutaTipo;
  dificultad: DificultadTipo;
  circular: boolean;
  distancia_km: number | null;
  desnivel_positivo_m: number | null;
  desnivel_negativo_m: number | null;
  duracion_min: number | null;
  gpx_url: string | null;
  geojson: Json;
  bbox: number[] | null;
  elevation_profile: { distance: number; elevation: number }[] | null;
  pois_ids: string[];
  audio_ruta_urls: MultiLang;
  imagenes: string[];
  thumbnail_url: string | null;
  visible: boolean;
  destacada: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface Coleccionable {
  id: string;
  municipio_id: string;
  poi_id: string | null;
  nombre: MultiLang;
  descripcion: MultiLang;
  imagen_url: string;
  imagen_locked_url: string | null;
  categoria: string;
  puntos: number;
  rareza: string;
  desbloqueo_tipo: string;
  desbloqueo_config: Json;
  radio_checkin_m: number;
  orden: number;
  activo: boolean;
  created_at: string;
}

export interface Visitante {
  id: string;
  municipio_id: string;
  device_id: string | null;
  idioma: string;
  coleccionables_ids: string[];
  puntos_total: number;
  pois_visitados: string[];
  rutas_completadas: string[];
  primera_visita: string;
  ultima_actividad: string;
  num_visitas: number;
}

export interface AnalyticsEvent {
  id: number;
  municipio_id: string;
  tipo: EventoTipo;
  poi_id: string | null;
  ruta_id: string | null;
  coleccionable_id: string | null;
  visitante_id: string | null;
  idioma: string | null;
  user_agent: string | null;
  referer: string | null;
  ip_hash: string | null;
  metadata: Json;
  created_at: string;
}

export interface AdminUser {
  id: string;
  municipio_id: string;
  nombre: string;
  email: string;
  rol: string;
  created_at: string;
}

// Database type for Supabase client
export interface Database {
  public: {
    Tables: {
      municipios: {
        Row: Municipio;
        Insert: Partial<Municipio> & Pick<Municipio, "nombre" | "slug" | "provincia" | "ccaa" | "coords">;
        Update: Partial<Municipio>;
      };
      pois: {
        Row: POI;
        Insert: Partial<POI> & Pick<POI, "municipio_id" | "tipo" | "coords">;
        Update: Partial<POI>;
      };
      rutas: {
        Row: Ruta;
        Insert: Partial<Ruta> & Pick<Ruta, "municipio_id" | "tipo">;
        Update: Partial<Ruta>;
      };
      coleccionables: {
        Row: Coleccionable;
        Insert: Partial<Coleccionable> & Pick<Coleccionable, "municipio_id" | "imagen_url">;
        Update: Partial<Coleccionable>;
      };
      visitantes: {
        Row: Visitante;
        Insert: Partial<Visitante> & Pick<Visitante, "municipio_id">;
        Update: Partial<Visitante>;
      };
      analytics_events: {
        Row: AnalyticsEvent;
        Insert: Partial<AnalyticsEvent> & Pick<AnalyticsEvent, "municipio_id" | "tipo">;
        Update: Partial<AnalyticsEvent>;
      };
      admin_users: {
        Row: AdminUser;
        Insert: Partial<AdminUser> & Pick<AdminUser, "id" | "municipio_id" | "nombre" | "email">;
        Update: Partial<AdminUser>;
      };
    };
    Enums: {
      plan_tipo: PlanTipo;
      poi_tipo: PoiTipo;
      ruta_tipo: RutaTipo;
      dificultad_tipo: DificultadTipo;
      evento_tipo: EventoTipo;
    };
  };
}
