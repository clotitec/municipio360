import { createServerSupabaseClient } from "@/lib/supabase/server";
import JuegoClient from "./JuegoClient";

export default async function JuegoPage({
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

  const { data: coleccionables } = await supabase
    .from("coleccionables")
    .select("*")
    .eq("municipio_id", municipio.id)
    .eq("activo", true)
    .order("orden");

  return <JuegoClient municipio={municipio} coleccionables={coleccionables || []} />;
}
