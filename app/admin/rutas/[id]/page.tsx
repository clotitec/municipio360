"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { RutaTipo, DificultadTipo } from "@/lib/supabase/types";

export default function RutaEditorPage() {
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
    tipo: "senderismo" as RutaTipo,
    dificultad: "media" as DificultadTipo,
    circular: false,
    distancia_km: "",
    desnivel_positivo_m: "",
    desnivel_negativo_m: "",
    duracion_min: "",
    visible: true,
    destacada: false,
  });

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: admin } = await supabase.from("admin_users").select("municipio_id").eq("id", user.id).single();
      if (admin) setMunicipioId(admin.municipio_id);

      if (!isNew) {
        const { data: ruta } = await supabase.from("rutas").select("*").eq("id", params.id).single();
        if (ruta) {
          const nombre = ruta.nombre as Record<string, string>;
          const desc = ruta.descripcion as Record<string, string>;
          setForm({
            nombre_es: nombre?.es || "",
            nombre_en: nombre?.en || "",
            descripcion_es: desc?.es || "",
            descripcion_en: desc?.en || "",
            tipo: ruta.tipo,
            dificultad: ruta.dificultad,
            circular: ruta.circular,
            distancia_km: ruta.distancia_km?.toString() || "",
            desnivel_positivo_m: ruta.desnivel_positivo_m?.toString() || "",
            desnivel_negativo_m: ruta.desnivel_negativo_m?.toString() || "",
            duracion_min: ruta.duracion_min?.toString() || "",
            visible: ruta.visible,
            destacada: ruta.destacada,
          });
        }
      }
      setLoading(false);
    };
    load();
  }, [isNew, params.id]);

  const handleSave = async () => {
    if (!municipioId) return;
    setSaving(true);

    const supabase = createClient();
    const data = {
      municipio_id: municipioId,
      nombre: { es: form.nombre_es, en: form.nombre_en },
      descripcion: { es: form.descripcion_es, en: form.descripcion_en },
      tipo: form.tipo,
      dificultad: form.dificultad,
      circular: form.circular,
      distancia_km: form.distancia_km ? parseFloat(form.distancia_km) : null,
      desnivel_positivo_m: form.desnivel_positivo_m ? parseInt(form.desnivel_positivo_m) : null,
      desnivel_negativo_m: form.desnivel_negativo_m ? parseInt(form.desnivel_negativo_m) : null,
      duracion_min: form.duracion_min ? parseInt(form.duracion_min) : null,
      visible: form.visible,
      destacada: form.destacada,
    };

    if (isNew) {
      await supabase.from("rutas").insert(data);
    } else {
      await supabase.from("rutas").update(data).eq("id", params.id);
    }

    setSaving(false);
    router.push("/admin/rutas");
    router.refresh();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold text-gray-900">{isNew ? "Nueva Ruta" : "Editar Ruta"}</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre (ES)" value={form.nombre_es} onChange={(v) => setForm({ ...form, nombre_es: v })} />
          <Field label="Nombre (EN)" value={form.nombre_en} onChange={(v) => setForm({ ...form, nombre_en: v })} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as RutaTipo })}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm">
              {(["senderismo", "urbana", "ciclista", "patrimonial", "gastronomica", "costera"] as const).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dificultad</label>
            <select value={form.dificultad} onChange={(e) => setForm({ ...form, dificultad: e.target.value as DificultadTipo })}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm">
              {(["facil", "media", "dificil"] as const).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Distancia (km)" value={form.distancia_km} onChange={(v) => setForm({ ...form, distancia_km: v })} />
          <Field label="Duración (min)" value={form.duracion_min} onChange={(v) => setForm({ ...form, duracion_min: v })} />
          <Field label="Desnivel+ (m)" value={form.desnivel_positivo_m} onChange={(v) => setForm({ ...form, desnivel_positivo_m: v })} />
          <Field label="Desnivel- (m)" value={form.desnivel_negativo_m} onChange={(v) => setForm({ ...form, desnivel_negativo_m: v })} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Descripción (ES)</label>
          <textarea value={form.descripcion_es} onChange={(e) => setForm({ ...form, descripcion_es: e.target.value })}
            rows={4} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none mt-1" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Descripción (EN)</label>
          <textarea value={form.descripcion_en} onChange={(e) => setForm({ ...form, descripcion_en: e.target.value })}
            rows={3} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none mt-1" />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.circular} onChange={(e) => setForm({ ...form, circular: e.target.checked })} className="rounded" />
            <span className="text-sm text-gray-700">Circular</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} className="rounded" />
            <span className="text-sm text-gray-700">Visible</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.destacada} onChange={(e) => setForm({ ...form, destacada: e.target.checked })} className="rounded" />
            <span className="text-sm text-gray-700">Destacada</span>
          </label>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !form.nombre_es}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 disabled:opacity-50"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        {isNew ? "Crear Ruta" : "Guardar cambios"}
      </button>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40" />
    </div>
  );
}
