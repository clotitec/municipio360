"use client";

import { createContext, useContext, useState, useEffect } from "react";
import GlassNav from "@/components/ui/GlassNav";
import type { Municipio } from "@/lib/supabase/types";

interface MunicipioContextType {
  municipio: Municipio;
  lang: string;
  setLang: (lang: string) => void;
}

const MunicipioContext = createContext<MunicipioContextType | null>(null);

export function useMunicipio() {
  const ctx = useContext(MunicipioContext);
  if (!ctx) throw new Error("useMunicipio must be used within MunicipioLayout");
  return ctx;
}

export default function MunicipioLayoutClient({
  children,
  municipio,
}: {
  children: React.ReactNode;
  municipio: Municipio;
}) {
  const [lang, setLang] = useState(municipio.idioma_default || "es");

  useEffect(() => {
    const saved = localStorage.getItem(`m360_lang_${municipio.slug}`);
    if (saved && municipio.idiomas.includes(saved)) {
      setLang(saved);
    }
  }, [municipio.slug, municipio.idiomas]);

  const handleSetLang = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem(`m360_lang_${municipio.slug}`, newLang);
  };

  // Set CSS custom properties for municipio branding
  useEffect(() => {
    document.documentElement.style.setProperty("--color-primario", municipio.color_primario);
    document.documentElement.style.setProperty("--color-secundario", municipio.color_secundario);
  }, [municipio.color_primario, municipio.color_secundario]);

  return (
    <MunicipioContext.Provider value={{ municipio, lang, setLang: handleSetLang }}>
      <div
        className="h-full flex flex-col"
        style={{
          background: `linear-gradient(135deg, ${municipio.color_primario}08 0%, ${municipio.color_fondo} 100%)`,
        }}
      >
        <main className="flex-1 overflow-hidden pb-16">{children}</main>
        <GlassNav municipioSlug={municipio.slug} />
      </div>
    </MunicipioContext.Provider>
  );
}
