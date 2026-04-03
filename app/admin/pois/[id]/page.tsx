"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Save, Loader2, ArrowLeft, Wand2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { PoiTipo } from "@/lib/supabase/types";

const MapPicker = dynamic(() => import("@/components/admin/MapPicker"), { ssr: false });

const POI_TIPOS: PoiTipo[] = [
  "monumento", "playa", "mirador", "museo", "iglesia",
  "castillo", "cueva", "puente", "faro", "parque",
  "ruta_inicio", "restaurante", "alojamiento", "parking", "oficina_turismo",
];

export default function PoiEditorPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [municipioId, setMunicipioId] = useState("");
  const [form, setForm] = useState({
    nombre_es: "",
    nombre_en: "",
    descripcion_es: "",
    descripcion_en: "",
    descripcion_corta_es: "",
    tipo: "monumento" as PoiTipo,
    coords: null as { lat: number; lng: number } | null,
    direccion: "",
    precio: "",
    accesible: false,
    destacado: false,
    visible: true,
    telefono: "",
    web_url: "",
    tour_360_url: "",
    gothru_embed: "",
    matterport_url: "",
  });

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: admin } = await supabase.from("admin_users").select("municipio_id").eq("id", user.id).single();
      if (admin) setMunicipioId(admin.municipio_id);

      if (!isNew) {
        const { data: poi } = await supabase.from("pois").select("*").eq("id", params.id).single();
        if (poi) {
          const nombre = poi.nombre as Record<string, string>;
          const desc = poi.descripcion as Record<string, string>;
          const descCorta = poi.descripcion_corta as Record<string, string>;
          const c = poi.coords as unknown as { coordinates?: number[] };
          setForm({
            nombre_es: nombre?.es || "",
            nombre_en: nombre?.en || "",
            descripcion_es: desc?.es || "",
            descripcion_en: desc?.en || "",
            descripcion_corta_es: descCorta?.es || "",
            tipo: poi.tipo,
            coords: c?.coordinates ? { lat: c.coordinates[1], lng: c.coordinates[0] } : null,
            direccion: poi.direccion || "",
            precio: poi.precio || "",
            accesible: poi.accesible,
            destacado: poi.destacado,
            visible: poi.visible,
            telefono: poi.telefono || "",
            web_url: poi.web_url || "",
            tour_360_url: poi.tour_360_url || "",
            gothru_embed: poi.gothru_embed || "",
            matterport_url: poi.matterport_url || "",
          });
        }
      }
      setLoading(false);
    };
    load();
  }, [isNew, params.id]);

  const handleSave = async () => {
    if (!form.coords || !municipioId) return;
    setSaving(true);

    const supabase = createClient();
    const data = {
      municipio_id: municipioId,
      nombre: { es: form.nombre_es, en: form.nombre_en },
      descripcion: { es: form.descripcion_es, en: form.descripcion_en },
      descripcion_corta: { es: form.descripcion_corta_es },
      tipo: form.tipo,
      coords: `SRID=4326;POINT(${form.coords.lng} ${form.coords.lat})`,
      direccion: form.direccion || null,
      precio: form.precio || null,
      accesible: form.accesible,
      destacado: form.destacado,
      visible: form.visible,
      telefono: form.telefono || null,
      web_url: form.web_url || null,
      tour_360_url: form.tour_360_url || null,
      gothru_embed: form.gothru_embed || null,
      matterport_url: form.matterport_url || null,
    };

    if (isNew) {
      await supabase.from("pois").insert(data);
    } else {
      await supabase.from("pois").update(data).eq("id", params.id);
    }

    setSaving(false);
    router.push("/admin/pois");
    router.refresh();
  };

  const handleGenerateAI = async () => {
    // TODO: Call /api/textos/generate when Claude API key is available
    alert("Generación IA requiere API key de Anthropic configurada");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{isNew ? "Nuevo POI" : "Editar POI"}</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
        {/* Basic info */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre (ES)" value={form.nombre_es} onChange={(v) => setForm({ ...form, nombre_es: v })} />
          <Field label="Nombre (EN)" value={form.nombre_en} onChange={(v) => setForm({ ...form, nombre_en: v })} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value as PoiTipo })}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
          >
            {POI_TIPOS.map((t) => (
              <option key={t} value={t}>{t.replace("_", " ")}</option>
            ))}
          </select>
        </div>

        <Field label="Descripción corta (ES)" value={form.descripcion_corta_es} onChange={(v) => setForm({ ...form, descripcion_corta_es: v })} />

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Descripción (ES)</label>
            <button onClick={handleGenerateAI} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
              <Wand2 size={12} /> Generar con IA
            </button>
          </div>
          <textarea
            value={form.descripcion_es}
            onChange={(e) => setForm({ ...form, descripcion_es: e.target.value })}
            rows={4}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Descripción (EN)</label>
          <textarea
            value={form.descripcion_en}
            onChange={(e) => setForm({ ...form, descripcion_en: e.target.value })}
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none mt-1"
          />
        </div>

        {/* Location */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Ubicación (click en el mapa)</label>
          <MapPicker value={form.coords} onChange={(c) => setForm({ ...form, coords: c })} />
        </div>

        <Field label="Dirección" value={form.direccion} onChange={(v) => setForm({ ...form, direccion: v })} />

        {/* Details */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Precio" value={form.precio} onChange={(v) => setForm({ ...form, precio: v })} placeholder="Gratuito" />
          <Field label="Teléfono" value={form.telefono} onChange={(v) => setForm({ ...form, telefono: v })} />
        </div>

        <Field label="Web URL" value={form.web_url} onChange={(v) => setForm({ ...form, web_url: v })} />

        {/* Immersive */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-600">Contenido inmersivo</h3>
          <Field label="Tour 360° URL (Pannellum)" value={form.tour_360_url} onChange={(v) => setForm({ ...form, tour_360_url: v })} />
          <Field label="GoThru Embed URL" value={form.gothru_embed} onChange={(v) => setForm({ ...form, gothru_embed: v })} />
          <Field label="Matterport URL" value={form.matterport_url} onChange={(v) => setForm({ ...form, matterport_url: v })} />
        </div>

        {/* Toggles */}
        <div className="flex gap-6">
          <Toggle label="Visible" checked={form.visible} onChange={(v) => setForm({ ...form, visible: v })} />
          <Toggle label="Destacado" checked={form.destacado} onChange={(v) => setForm({ ...form, destacado: v })} />
          <Toggle label="Accesible" checked={form.accesible} onChange={(v) => setForm({ ...form, accesible: v })} />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !form.coords || !form.nombre_es}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        {isNew ? "Crear POI" : "Guardar cambios"}
      </button>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40"
      />
    </div>
  );
}

function Toggle({
  label, checked, onChange,
}: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="rounded" />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}
