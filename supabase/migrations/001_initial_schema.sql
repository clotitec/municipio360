-- ============================================
-- MUNICIPIO360: Schema inicial
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ENUMS
CREATE TYPE plan_tipo AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE poi_tipo AS ENUM (
  'monumento', 'playa', 'mirador', 'museo', 'iglesia',
  'castillo', 'cueva', 'puente', 'faro', 'parque',
  'ruta_inicio', 'restaurante', 'alojamiento', 'parking', 'oficina_turismo'
);
CREATE TYPE ruta_tipo AS ENUM ('senderismo', 'urbana', 'ciclista', 'patrimonial', 'gastronomica', 'costera');
CREATE TYPE dificultad_tipo AS ENUM ('facil', 'media', 'dificil');
CREATE TYPE evento_tipo AS ENUM (
  'page_view', 'tour_360_open', 'tour_360_close',
  'audio_play', 'audio_complete', 'audio_pause',
  'gpx_download', 'coleccionable_unlock', 'poi_checkin',
  'share', 'pwa_install', 'map_interaction', 'search',
  'ruta_start', 'ruta_complete', 'language_change',
  'matterport_open', 'splat_open', 'qr_scan'
);

-- TABLA: municipios
CREATE TABLE municipios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  provincia TEXT NOT NULL,
  ccaa TEXT NOT NULL,
  poblacion INTEGER,
  codigo_ine TEXT,
  coords GEOGRAPHY(POINT, 4326) NOT NULL,
  zoom_default INTEGER DEFAULT 14 CHECK (zoom_default BETWEEN 8 AND 18),
  logo_url TEXT,
  color_primario TEXT DEFAULT '#1B4F72',
  color_secundario TEXT DEFAULT '#2E86C1',
  color_fondo TEXT DEFAULT '#F8F9FA',
  fuente TEXT DEFAULT 'Inter',
  idiomas TEXT[] DEFAULT ARRAY['es'],
  idioma_default TEXT DEFAULT 'es',
  plan plan_tipo DEFAULT 'free',
  activo BOOLEAN DEFAULT true,
  dominio_custom TEXT,
  descripcion JSONB DEFAULT '{}',
  redes_sociales JSONB DEFAULT '{}',
  horario_oficina JSONB DEFAULT '{}',
  contacto_email TEXT,
  contacto_telefono TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA: pois
CREATE TABLE pois (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipio_id UUID NOT NULL REFERENCES municipios(id) ON DELETE CASCADE,
  nombre JSONB NOT NULL DEFAULT '{}',
  descripcion JSONB DEFAULT '{}',
  descripcion_corta JSONB DEFAULT '{}',
  tipo poi_tipo NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  coords GEOGRAPHY(POINT, 4326) NOT NULL,
  direccion TEXT,
  imagenes TEXT[] DEFAULT ARRAY[]::TEXT[],
  thumbnail_url TEXT,
  tour_360_url TEXT,
  tour_360_config JSONB,
  gothru_embed TEXT,
  matterport_url TEXT,
  splat_url TEXT,
  audio_urls JSONB DEFAULT '{}',
  audio_duracion JSONB DEFAULT '{}',
  horario JSONB DEFAULT '{}',
  precio TEXT,
  accesible BOOLEAN DEFAULT false,
  telefono TEXT,
  web_url TEXT,
  destacado BOOLEAN DEFAULT false,
  visible BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pois_municipio ON pois(municipio_id);
CREATE INDEX idx_pois_tipo ON pois(tipo);
CREATE INDEX idx_pois_coords ON pois USING GIST(coords);
CREATE INDEX idx_pois_destacado ON pois(municipio_id, destacado) WHERE destacado = true;

-- TABLA: rutas
CREATE TABLE rutas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipio_id UUID NOT NULL REFERENCES municipios(id) ON DELETE CASCADE,
  nombre JSONB NOT NULL DEFAULT '{}',
  descripcion JSONB DEFAULT '{}',
  tipo ruta_tipo NOT NULL,
  dificultad dificultad_tipo DEFAULT 'media',
  circular BOOLEAN DEFAULT false,
  distancia_km FLOAT,
  desnivel_positivo_m INTEGER,
  desnivel_negativo_m INTEGER,
  duracion_min INTEGER,
  gpx_url TEXT,
  geojson JSONB,
  bbox FLOAT[],
  elevation_profile JSONB,
  pois_ids UUID[] DEFAULT ARRAY[]::UUID[],
  audio_ruta_urls JSONB DEFAULT '{}',
  imagenes TEXT[] DEFAULT ARRAY[]::TEXT[],
  thumbnail_url TEXT,
  visible BOOLEAN DEFAULT true,
  destacada BOOLEAN DEFAULT false,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rutas_municipio ON rutas(municipio_id);

-- TABLA: coleccionables
CREATE TABLE coleccionables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipio_id UUID NOT NULL REFERENCES municipios(id) ON DELETE CASCADE,
  poi_id UUID REFERENCES pois(id) ON DELETE SET NULL,
  nombre JSONB NOT NULL DEFAULT '{}',
  descripcion JSONB DEFAULT '{}',
  imagen_url TEXT NOT NULL,
  imagen_locked_url TEXT,
  categoria TEXT DEFAULT 'general',
  puntos INTEGER DEFAULT 10,
  rareza TEXT DEFAULT 'comun',
  desbloqueo_tipo TEXT DEFAULT 'checkin',
  desbloqueo_config JSONB DEFAULT '{}',
  radio_checkin_m INTEGER DEFAULT 50,
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA: visitantes
CREATE TABLE visitantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipio_id UUID NOT NULL REFERENCES municipios(id) ON DELETE CASCADE,
  device_id TEXT,
  idioma TEXT DEFAULT 'es',
  coleccionables_ids UUID[] DEFAULT ARRAY[]::UUID[],
  puntos_total INTEGER DEFAULT 0,
  pois_visitados UUID[] DEFAULT ARRAY[]::UUID[],
  rutas_completadas UUID[] DEFAULT ARRAY[]::UUID[],
  primera_visita TIMESTAMPTZ DEFAULT NOW(),
  ultima_actividad TIMESTAMPTZ DEFAULT NOW(),
  num_visitas INTEGER DEFAULT 1
);

CREATE INDEX idx_visitantes_municipio ON visitantes(municipio_id);
CREATE INDEX idx_visitantes_device ON visitantes(device_id);

-- TABLA: analytics_events
CREATE TABLE analytics_events (
  id BIGSERIAL PRIMARY KEY,
  municipio_id UUID NOT NULL REFERENCES municipios(id) ON DELETE CASCADE,
  tipo evento_tipo NOT NULL,
  poi_id UUID,
  ruta_id UUID,
  coleccionable_id UUID,
  visitante_id UUID,
  idioma TEXT,
  user_agent TEXT,
  referer TEXT,
  ip_hash TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_municipio_fecha ON analytics_events(municipio_id, created_at DESC);
CREATE INDEX idx_analytics_tipo ON analytics_events(tipo);
CREATE INDEX idx_analytics_poi ON analytics_events(poi_id) WHERE poi_id IS NOT NULL;

-- TABLA: admin_users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  municipio_id UUID NOT NULL REFERENCES municipios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  rol TEXT DEFAULT 'editor',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY
ALTER TABLE municipios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pois ENABLE ROW LEVEL SECURITY;
ALTER TABLE rutas ENABLE ROW LEVEL SECURITY;
ALTER TABLE coleccionables ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "municipios_read_public" ON municipios FOR SELECT USING (activo = true);
CREATE POLICY "pois_read_public" ON pois FOR SELECT
  USING (visible = true AND municipio_id IN (SELECT id FROM municipios WHERE activo = true));
CREATE POLICY "rutas_read_public" ON rutas FOR SELECT
  USING (visible = true AND municipio_id IN (SELECT id FROM municipios WHERE activo = true));
CREATE POLICY "coleccionables_read_public" ON coleccionables FOR SELECT
  USING (activo = true);
CREATE POLICY "analytics_insert_public" ON analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "visitantes_all_public" ON visitantes FOR ALL USING (true);

CREATE POLICY "admin_municipio_all" ON municipios FOR ALL
  USING (id IN (SELECT municipio_id FROM admin_users WHERE id = auth.uid()));
CREATE POLICY "admin_pois_all" ON pois FOR ALL
  USING (municipio_id IN (SELECT municipio_id FROM admin_users WHERE id = auth.uid()));
CREATE POLICY "admin_rutas_all" ON rutas FOR ALL
  USING (municipio_id IN (SELECT municipio_id FROM admin_users WHERE id = auth.uid()));
CREATE POLICY "admin_coleccionables_all" ON coleccionables FOR ALL
  USING (municipio_id IN (SELECT municipio_id FROM admin_users WHERE id = auth.uid()));
CREATE POLICY "admin_analytics_read" ON analytics_events FOR SELECT
  USING (municipio_id IN (SELECT municipio_id FROM admin_users WHERE id = auth.uid()));

-- FUNCIÓN: updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER municipios_updated_at BEFORE UPDATE ON municipios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER pois_updated_at BEFORE UPDATE ON pois
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER rutas_updated_at BEFORE UPDATE ON rutas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- SEED: Llanes
INSERT INTO municipios (nombre, slug, provincia, ccaa, poblacion, codigo_ine, coords, zoom_default, color_primario, color_secundario, idiomas, plan) VALUES
('Llanes', 'llanes', 'Asturias', 'Principado de Asturias', 13500, '33036', ST_SetSRID(ST_MakePoint(-4.7553, 43.4213), 4326), 13, '#1A5276', '#2E86C1', ARRAY['es', 'en', 'fr', 'de'], 'pro');
