"use client";

import { useState } from "react";
import { LANGUAGE_FLAGS, LANGUAGE_NAMES, type SupportedLanguage } from "@/lib/i18n/config";

interface LanguageSelectorProps {
  languages: string[];
  current: string;
  onChange: (lang: string) => void;
}

export default function LanguageSelector({ languages, current, onChange }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-xl bg-white/60 border border-white/30 text-sm font-medium hover:bg-white/80 transition-all"
      >
        <span>{LANGUAGE_FLAGS[current as SupportedLanguage] || "🌐"}</span>
        <span className="uppercase text-xs">{current}</span>
      </button>
      {open && (
        <div className="absolute top-full mt-1 right-0 backdrop-blur-xl bg-white/90 border border-white/30 rounded-xl shadow-lg overflow-hidden z-50 min-w-[140px]">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => { onChange(lang); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-blue-50/60 transition-colors ${
                lang === current ? "bg-blue-50/80 font-medium" : ""
              }`}
            >
              <span>{LANGUAGE_FLAGS[lang as SupportedLanguage] || "🌐"}</span>
              <span>{LANGUAGE_NAMES[lang as SupportedLanguage] || lang}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
