"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Compass, Route, Trophy, Info } from "lucide-react";

interface GlassNavProps {
  municipioSlug: string;
}

const NAV_ITEMS = [
  { href: "", icon: Map, label: "Mapa" },
  { href: "/explorar", icon: Compass, label: "Explorar" },
  { href: "/rutas", icon: Route, label: "Rutas" },
  { href: "/juego", icon: Trophy, label: "Juego" },
  { href: "/info", icon: Info, label: "Info" },
];

export default function GlassNav({ municipioSlug }: GlassNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-t border-white/30 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const fullHref = `/${municipioSlug}${item.href}`;
          const isActive =
            item.href === ""
              ? pathname === `/${municipioSlug}`
              : pathname.startsWith(fullHref);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={fullHref}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-blue-600 bg-blue-50/60"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
