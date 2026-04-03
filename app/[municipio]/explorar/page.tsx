import { createServerSupabaseClient } from "@/lib/supabase/server";
import ExplorarClient from "./ExplorarClient";

export default async function ExplorarPage({
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

  const { data: pois } = await supabase
    .from("pois")
    .select("*")
    .eq("municipio_id", municipio.id)
    .eq("visible", true)
    .order("orden");

  return <ExplorarClient municipio={municipio} pois={pois || []} />;
}
