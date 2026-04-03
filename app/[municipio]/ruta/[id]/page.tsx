import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import RutaDetailClient from "./RutaDetailClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ municipio: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: ruta } = await supabase.from("rutas").select("nombre, descripcion").eq("id", id).single();
  const nombre = ruta?.nombre?.es || "Ruta";
  return {
    title: `${nombre} | Municipio360`,
    description: ruta?.descripcion?.es || "",
  };
}

export default async function RutaDetailPage({ params }: Props) {
  const { municipio: slug, id } = await params;
  const supabase = await createServerSupabaseClient();

  const [{ data: municipio }, { data: ruta }] = await Promise.all([
    supabase.from("municipios").select("*").eq("slug", slug).single(),
    supabase.from("rutas").select("*").eq("id", id).single(),
  ]);

  if (!municipio || !ruta) notFound();

  // Fetch POIs for this ruta
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rutaPois: any[] = [];
  if (ruta.pois_ids && ruta.pois_ids.length > 0) {
    const { data } = await supabase
      .from("pois")
      .select("*")
      .in("id", ruta.pois_ids);
    rutaPois = data || [];
  }

  return <RutaDetailClient municipio={municipio} ruta={ruta} pois={rutaPois} />;
}
