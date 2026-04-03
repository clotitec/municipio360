import { createServerSupabaseClient } from "@/lib/supabase/server";
import MapPageClient from "./MapPageClient";

export default async function MunicipioMapPage({
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

  // Fetch POIs with coordinates extracted
  const { data: pois } = await supabase
    .from("pois")
    .select("*")
    .eq("municipio_id", municipio.id)
    .eq("visible", true)
    .order("orden");

  return <MapPageClient municipio={municipio} pois={pois || []} />;
}
