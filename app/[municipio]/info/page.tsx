import { createServerSupabaseClient } from "@/lib/supabase/server";
import InfoClient from "./InfoClient";

export default async function InfoPage({
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

  return <InfoClient municipio={municipio} />;
}
