import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("*, municipios(*)")
    .eq("id", user.id)
    .single();

  if (!adminUser) {
    redirect("/admin/login");
  }

  return <AdminLayoutClient adminUser={adminUser}>{children}</AdminLayoutClient>;
}
