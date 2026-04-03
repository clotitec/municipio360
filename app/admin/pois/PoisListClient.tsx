"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Eye, EyeOff, Star, MapPin } from "lucide-react";
import SearchBar from "@/components/ui/SearchBar";
import { createClient } from "@/lib/supabase/client";
import type { POI } from "@/lib/supabase/types";

export default function PoisListClient({ pois: initialPois, municipioId }: { pois: POI[]; municipioId: string }) {
  const router = useRouter();
  const [pois, setPois] = useState(initialPois);
  const [search, setSearch] = useState("");

  const filtered = pois.filter((p) => {
    const name = (p.nombre as Record<string, string>)?.es || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este POI?")) return;
    const supabase = createClient();
    await supabase.from("pois").delete().eq("id", id);
    setPois(pois.filter((p) => p.id !== id));
  };

  const toggleVisibility = async (poi: POI) => {
    const supabase = createClient();
    await supabase.from("pois").update({ visible: !poi.visible }).eq("id", poi.id);
    setPois(pois.map((p) => (p.id === poi.id ? { ...p, visible: !p.visible } : p)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Puntos de Interés</h1>
        <button
          onClick={() => router.push(`/admin/pois/new`)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} /> Nuevo POI
        </button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Buscar POIs..." />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-medium text-gray-500 uppercase">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((poi) => (
              <tr key={poi.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {poi.thumbnail_url ? (
                      <img src={poi.thumbnail_url} className="w-10 h-10 rounded-lg object-cover" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <MapPin size={16} className="text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {(poi.nombre as Record<string, string>)?.es || "Sin nombre"}
                      </p>
                      {poi.destacado && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-yellow-600">
                          <Star size={10} /> Destacado
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-gray-500 capitalize">{poi.tipo.replace("_", " ")}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleVisibility(poi)} className="text-xs">
                    {poi.visible ? (
                      <span className="flex items-center gap-1 text-green-600"><Eye size={14} /> Visible</span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400"><EyeOff size={14} /> Oculto</span>
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => router.push(`/admin/pois/${poi.id}`)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(poi.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">
                  No se encontraron POIs
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
