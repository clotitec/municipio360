import { createServerSupabaseClient } from "@/lib/supabase/server";
import PoisListClient from "./PoisListClient";

export default async function AdminPoisPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: adminUser } = await supabase.from("admin_users").select("municipio_id").eq("id", user.id).single();
  if (!adminUser) return null;

  const { data: pois } = await supabase
    .from("pois")
    .select("*")
    .eq("municipio_id", adminUser.municipio_id)
    .order("orden");

  return <PoisListClient pois={pois || []} municipioId={adminUser.municipio_id} />;
}
