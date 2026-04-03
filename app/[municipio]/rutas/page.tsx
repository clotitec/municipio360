import { createServerSupabaseClient } from "@/lib/supabase/server";
import RutasListClient from "./RutasListClient";

export default async function RutasPage({
  params,
}: {
  params: Promise<{ municipio: string }>;
}) {
  const { municipio: slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: municipio } = await supabase
    .from("municipios")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!municipio) return null;

  const { data: rutas } = await supabase
    .from("rutas")
    .select("*")
    .eq("municipio_id", municipio.id)
    .eq("visible", true)
    .order("orden");

  return <RutasListClient municipio={municipio} rutas={rutas || []} />;
}
