import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { poi_id } = await req.json();
    const supabase = createAdminClient();

    const { data: poi } = await supabase.from("pois").select("*, municipios(nombre, provincia)").eq("id", poi_id).single();
    if (!poi) return NextResponse.json({ error: "POI not found" }, { status: 404 });

    const nombre = (poi.nombre as Record<string, string>)?.es || "";
    const muni = poi.municipios as unknown as { nombre: string; provincia: string };

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.startsWith("PLACEHOLDER")) {
      // Mock response when no API key
      const mock = {
        es: `${nombre} es uno de los puntos más emblemáticos de ${muni.nombre}, ${muni.provincia}. Este lugar ofrece una experiencia única para visitantes que buscan conocer la riqueza cultural y natural de la zona.`,
        en: `${nombre} is one of the most emblematic points of ${muni.nombre}, ${muni.provincia}. This place offers a unique experience for visitors seeking to discover the cultural and natural richness of the area.`,
      };
      await supabase.from("pois").update({
        descripcion: mock,
        descripcion_corta: {
          es: mock.es.substring(0, 120),
          en: mock.en.substring(0, 120),
        },
      }).eq("id", poi_id);

      return NextResponse.json({ descriptions: mock, mock: true });
    }

    const prompt = `Eres un redactor turístico experto. Genera una descripción turística para:
- Nombre: ${nombre}
- Tipo: ${poi.tipo}
- Municipio: ${muni.nombre}, ${muni.provincia}

Genera en formato JSON:
{
  "es": "Descripción en español (150-200 palabras, tono invitador)",
  "en": "English description"
}

Incluye datos históricos si es patrimonio, menciona el entorno natural, y termina con una invitación a visitar.
Responde SOLO con el JSON, sin markdown.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) throw new Error(`Claude API error: ${res.status}`);

    const data = await res.json();
    const text = data.content[0].text;
    const descriptions = JSON.parse(text);

    await supabase.from("pois").update({
      descripcion: descriptions,
      descripcion_corta: {
        es: (descriptions.es || "").substring(0, 120),
        en: (descriptions.en || "").substring(0, 120),
      },
    }).eq("id", poi_id);

    return NextResponse.json({ descriptions });
  } catch (error) {
    console.error("Text generation error:", error);
    return NextResponse.json({ error: "Failed to generate text" }, { status: 500 });
  }
}
