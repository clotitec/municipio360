"use client";

import { useState, useEffect } from "react";
import { Trophy, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Coleccionable } from "@/lib/supabase/types";

export default function AdminGamificacionPage() {
  const [items, setItems] = useState<Coleccionable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: admin } = await supabase.from("admin_users").select("municipio_id").eq("id", user.id).single();
      if (!admin) return;
      const { data } = await supabase.from("coleccionables").select("*").eq("municipio_id", admin.municipio_id).order("orden");
      setItems(data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Gamificación</h1>
      <p className="text-sm text-gray-500">Gestiona los coleccionables de tu municipio.</p>

      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Trophy size={48} className="mx-auto mb-3 opacity-40" />
          <p>No hay coleccionables configurados</p>
          <p className="text-sm mt-1">Crea coleccionables desde la base de datos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <img src={item.imagen_url} alt="" className="w-full h-32 object-cover rounded-xl mb-3" />
              <h3 className="text-sm font-medium text-gray-800">
                {(item.nombre as Record<string, string>)?.es || "Coleccionable"}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                <span>{item.puntos} pts</span>
                <span>·</span>
                <span className="capitalize">{item.rareza}</span>
                <span>·</span>
                <span>{item.activo ? "Activo" : "Inactivo"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
