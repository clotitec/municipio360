"use client";

import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Globe, Users } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { useMunicipio } from "@/app/[municipio]/MunicipioLayoutClient";
import { getLocalizedText } from "@/lib/i18n/config";
import type { Municipio } from "@/lib/supabase/types";

export default function InfoClient({ municipio }: { municipio: Municipio }) {
  const { lang } = useMunicipio();
  const redes = municipio.redes_sociales as Record<string, string> | null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto">
      <div className="p-4 space-y-4 pb-24">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{municipio.nombre}</h1>
          <p className="text-sm text-gray-500">{municipio.provincia}, {municipio.ccaa}</p>
        </div>

        {/* Description */}
        {municipio.descripcion && Object.keys(municipio.descripcion).length > 0 && (
          <GlassCard className="p-4" animate={false}>
            <p className="text-sm text-gray-700 leading-relaxed">
              {getLocalizedText(municipio.descripcion as Record<string, string>, lang)}
            </p>
          </GlassCard>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {municipio.poblacion && (
            <GlassCard className="p-4 text-center" animate={false}>
              <Users size={20} className="mx-auto text-gray-400 mb-2" />
              <p className="text-lg font-bold text-gray-800">{municipio.poblacion.toLocaleString("es-ES")}</p>
              <p className="text-xs text-gray-400">Habitantes</p>
            </GlassCard>
          )}
          <GlassCard className="p-4 text-center" animate={false}>
            <MapPin size={20} className="mx-auto text-gray-400 mb-2" />
            <p className="text-lg font-bold text-gray-800">{municipio.provincia}</p>
            <p className="text-xs text-gray-400">Provincia</p>
          </GlassCard>
        </div>

        {/* Contact */}
        {(municipio.contacto_email || municipio.contacto_telefono) && (
          <GlassCard className="p-4 space-y-3" animate={false}>
            <h2 className="text-sm font-semibold text-gray-700">Contacto</h2>
            {municipio.contacto_email && (
              <a href={`mailto:${municipio.contacto_email}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600">
                <Mail size={16} className="text-gray-400" />
                {municipio.contacto_email}
              </a>
            )}
            {municipio.contacto_telefono && (
              <a href={`tel:${municipio.contacto_telefono}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600">
                <Phone size={16} className="text-gray-400" />
                {municipio.contacto_telefono}
              </a>
            )}
          </GlassCard>
        )}

        {/* Social */}
        {redes && Object.keys(redes).length > 0 && (
          <GlassCard className="p-4 space-y-3" animate={false}>
            <h2 className="text-sm font-semibold text-gray-700">Redes y web</h2>
            {Object.entries(redes).map(([key, url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600"
              >
                <Globe size={16} className="text-gray-400" />
                <span className="capitalize">{key}</span>
              </a>
            ))}
          </GlassCard>
        )}

        {/* Credits */}
        <div className="text-center py-6 text-xs text-gray-400 space-y-1">
          <p>Municipio360 by CLOTITEC SLU</p>
          <p>Digitalización turística municipal</p>
        </div>
      </div>
    </motion.div>
  );
}
