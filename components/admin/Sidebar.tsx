"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, MapPin, Route, Volume2, Trophy,
  BarChart3, Settings, LogOut
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Municipio } from "@/lib/supabase/types";

const NAV = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/pois", icon: MapPin, label: "POIs" },
  { href: "/admin/rutas", icon: Route, label: "Rutas" },
  { href: "/admin/audio", icon: Volume2, label: "Audio" },
  { href: "/admin/gamificacion", icon: Trophy, label: "Gamificación" },
  { href: "/admin/analitica", icon: BarChart3, label: "Analítica" },
  { href: "/admin/config", icon: Settings, label: "Configuración" },
];

export default function Sidebar({ municipio, userName }: { municipio: Municipio; userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h1 className="font-bold text-lg" style={{ color: municipio.color_primario }}>
          {municipio.nombre}
        </h1>
        <p className="text-xs text-gray-400">Panel de administración</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV.map((item) => {
          const isActive = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">{userName}</p>
          </div>
          <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
