"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Palette } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [municipioId, setMunicipioId] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    color_primario: "#1A5276",
    color_secundario: "#2E86C1",
    color_fondo: "#F8F9FA",
    fuente: "Inter",
    idiomas: ["es"] as string[],
    idioma_default: "es",
    contacto_email: "",
    contacto_telefono: "",
    dominio_custom: "",
  });

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: admin } = await supabase.from("admin_users").select("municipio_id").eq("id", user.id).single();
      if (!admin) return;
      setMunicipioId(admin.municipio_id);

      const { data: muni } = await supabase.from("municipios").select("*").eq("id", admin.municipio_id).single();
      if (muni) {
        setForm({
          nombre: muni.nombre,
          color_primario: muni.color_primario,
          color_secundario: muni.color_secundario,
          color_fondo: muni.color_fondo,
          fuente: muni.fuente,
          idiomas: muni.idiomas,
          idioma_default: muni.idioma_default,
          contacto_email: muni.contacto_email || "",
          contacto_telefono: muni.contacto_telefono || "",
          dominio_custom: muni.dominio_custom || "",
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("municipios").update({
      color_primario: form.color_primario,
      color_secundario: form.color_secundario,
      color_fondo: form.color_fondo,
      fuente: form.fuente,
      idiomas: form.idiomas,
      idioma_default: form.idioma_default,
      contacto_email: form.contacto_email || null,
      contacto_telefono: form.contacto_telefono || null,
      dominio_custom: form.dominio_custom || null,
    }).eq("id", municipioId);
    setSaving(false);
  };

  const toggleIdioma = (lang: string) => {
    if (form.idiomas.includes(lang)) {
      if (form.idiomas.length > 1) {
        setForm({ ...form, idiomas: form.idiomas.filter((l) => l !== lang) });
      }
    } else {
      setForm({ ...form, idiomas: [...form.idiomas, lang] });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>

      {/* Branding */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
        <h2 className="text-sm font-semibold text-gray-600 flex items-center gap-2"><Palette size={16} /> Branding</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
          <input value={form.nombre} disabled className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color primario</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.color_primario} onChange={(e) => setForm({ ...form, color_primario: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
              <input type="text" value={form.color_primario} onChange={(e) => setForm({ ...form, color_primario: e.target.value })}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color secundario</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.color_secundario} onChange={(e) => setForm({ ...form, color_secundario: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
              <input type="text" value={form.color_secundario} onChange={(e) => setForm({ ...form, color_secundario: e.target.value })}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color fondo</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.color_fondo} onChange={(e) => setForm({ ...form, color_fondo: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
              <input type="text" value={form.color_fondo} onChange={(e) => setForm({ ...form, color_fondo: e.target.value })}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm" />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 rounded-xl border border-gray-100" style={{ backgroundColor: form.color_fondo }}>
          <div className="flex gap-2">
            <div className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: form.color_primario }}>
              Primario
            </div>
            <div className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: form.color_secundario }}>
              Secundario
            </div>
          </div>
        </div>
      </div>

      {/* Idiomas */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Idiomas</h2>
        <div className="flex gap-2 flex-wrap">
          {[
            { code: "es", name: "Español", flag: "🇪🇸" },
            { code: "en", name: "English", flag: "🇬🇧" },
            { code: "fr", name: "Français", flag: "🇫🇷" },
            { code: "de", name: "Deutsch", flag: "🇩🇪" },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => toggleIdioma(lang.code)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                form.idiomas.includes(lang.code)
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-gray-50 text-gray-500 border border-gray-100"
              }`}
            >
              <span>{lang.flag}</span> {lang.name}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Idioma por defecto</label>
          <select value={form.idioma_default} onChange={(e) => setForm({ ...form, idioma_default: e.target.value })}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm">
            {form.idiomas.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Contacto</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.contacto_email} onChange={(e) => setForm({ ...form, contacto_email: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input type="text" value={form.contacto_telefono} onChange={(e) => setForm({ ...form, contacto_telefono: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dominio personalizado</label>
          <input type="text" value={form.dominio_custom} onChange={(e) => setForm({ ...form, dominio_custom: e.target.value })}
            placeholder="turismo.llanes.es"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 disabled:opacity-50">
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Guardar configuración
      </button>
    </div>
  );
}
