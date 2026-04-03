import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PoiDetailClient from "./PoiDetailClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ municipio: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { municipio: slug, id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: poi } = await supabase.from("pois").select("nombre, descripcion_corta, imagenes").eq("id", id).single();
  const { data: muni } = await supabase.from("municipios").select("nombre").eq("slug", slug).single();

  const nombre = poi?.nombre?.es || "POI";
  const desc = poi?.descripcion_corta?.es || "";

  return {
    title: `${nombre} - ${muni?.nombre || slug} | Municipio360`,
    description: desc,
    openGraph: {
      title: nombre,
      description: desc,
      images: poi?.imagenes?.[0] ? [{ url: poi.imagenes[0] }] : [],
    },
  };
}

export default async function PoiDetailPage({ params }: Props) {
  const { municipio: slug, id } = await params;
  const supabase = await createServerSupabaseClient();

  const [{ data: municipio }, { data: poi }] = await Promise.all([
    supabase.from("municipios").select("*").eq("slug", slug).single(),
    supabase.from("pois").select("*").eq("id", id).single(),
  ]);

  if (!municipio || !poi) notFound();

  return <PoiDetailClient municipio={municipio} poi={poi} />;
}
