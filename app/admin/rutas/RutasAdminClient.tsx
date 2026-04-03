"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Route } from "lucide-react";
import SearchBar from "@/components/ui/SearchBar";
import { createClient } from "@/lib/supabase/client";
import type { Ruta } from "@/lib/supabase/types";

const DIF_COLORS = { facil: "#4CAF50", media: "#FF9800", dificil: "#F44336" };

export default function RutasAdminClient({ rutas: initial, municipioId }: { rutas: Ruta[]; municipioId: string }) {
  const router = useRouter();
  const [rutas, setRutas] = useState(initial);
  const [search, setSearch] = useState("");

  const filtered = rutas.filter((r) => {
    const name = (r.nombre as Record<string, string>)?.es || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta ruta?")) return;
    const supabase = createClient();
    await supabase.from("rutas").delete().eq("id", id);
    setRutas(rutas.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Rutas</h1>
        <button
          onClick={() => router.push("/admin/rutas/new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
        >
          <Plus size={16} /> Nueva Ruta
        </button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Buscar rutas..." />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-medium text-gray-500 uppercase">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Dificultad</th>
              <th className="px-4 py-3">Distancia</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((ruta) => (
              <tr key={ruta.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Route size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-800">
                      {(ruta.nombre as Record<string, string>)?.es || "Sin nombre"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 capitalize">{ruta.tipo}</td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
                    style={{ backgroundColor: DIF_COLORS[ruta.dificultad] }}
                  >
                    {ruta.dificultad}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {ruta.distancia_km ? `${ruta.distancia_km.toFixed(1)} km` : "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => router.push(`/admin/rutas/${ruta.id}`)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(ruta.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
