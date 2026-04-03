import { createServerSupabaseClient } from "@/lib/supabase/server";
import RutasAdminClient from "./RutasAdminClient";

export default async function AdminRutasPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: adminUser } = await supabase.from("admin_users").select("municipio_id").eq("id", user.id).single();
  if (!adminUser) return null;

  const { data: rutas } = await supabase
    .from("rutas")
    .select("*")
    .eq("municipio_id", adminUser.municipio_id)
    .order("orden");

  return <RutasAdminClient rutas={rutas || []} municipioId={adminUser.municipio_id} />;
}
