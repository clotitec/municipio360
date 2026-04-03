import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import MunicipioLayoutClient from "./MunicipioLayoutClient";

export default async function MunicipioLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ municipio: string }>;
}) {
  const { municipio: slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: municipio } = await supabase
    .from("municipios")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!municipio) {
    notFound();
  }

  return (
    <MunicipioLayoutClient municipio={municipio}>
      {children}
    </MunicipioLayoutClient>
  );
}
