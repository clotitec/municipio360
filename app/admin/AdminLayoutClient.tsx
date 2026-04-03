"use client";

import { createContext, useContext } from "react";
import Sidebar from "@/components/admin/Sidebar";
import type { AdminUser, Municipio } from "@/lib/supabase/types";

interface AdminContextType {
  adminUser: AdminUser & { municipios: Municipio };
}

const AdminContext = createContext<AdminContextType | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminLayout");
  return ctx;
}

export default function AdminLayoutClient({
  children,
  adminUser,
}: {
  children: React.ReactNode;
  adminUser: AdminUser & { municipios: Municipio };
}) {
  return (
    <AdminContext.Provider value={{ adminUser }}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar municipio={adminUser.municipios} userName={adminUser.nombre} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </AdminContext.Provider>
  );
}
