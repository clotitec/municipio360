import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();

    const { error } = await supabase.from("analytics_events").insert({
      municipio_id: body.municipio_id,
      tipo: body.tipo,
      poi_id: body.poi_id || null,
      ruta_id: body.ruta_id || null,
      coleccionable_id: body.coleccionable_id || null,
      idioma: body.idioma || null,
      user_agent: body.user_agent || null,
      referer: body.referer || null,
      metadata: body.metadata || {},
    });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
