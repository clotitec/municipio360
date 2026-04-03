import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { poi_id } = await req.json();
    const supabase = createAdminClient();

    const { data: poi } = await supabase.from("pois").select("*").eq("id", poi_id).single();
    if (!poi) return NextResponse.json({ error: "POI not found" }, { status: 404 });

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey || apiKey.startsWith("PLACEHOLDER")) {
      return NextResponse.json({
        error: "ElevenLabs API key not configured",
        mock: true,
        message: "Configure ELEVENLABS_API_KEY to enable audio generation",
      }, { status: 200 });
    }

    const descripcion = (poi.descripcion as Record<string, string>)?.es || "";
    if (!descripcion) {
      return NextResponse.json({ error: "POI has no description to convert to audio" }, { status: 400 });
    }

    // Generate audio with ElevenLabs
    const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: descripcion.substring(0, 5000),
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    if (!res.ok) throw new Error(`ElevenLabs error: ${res.status}`);

    const audioBuffer = await res.arrayBuffer();
    const fileName = `${poi_id}_es.mp3`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("audioguias")
      .upload(fileName, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabase.storage.from("audioguias").getPublicUrl(fileName);

    // Update POI with audio URL
    const currentAudio = (poi.audio_urls as Record<string, string>) || {};
    await supabase.from("pois").update({
      audio_urls: { ...currentAudio, es: publicUrl.publicUrl },
    }).eq("id", poi_id);

    return NextResponse.json({ url: publicUrl.publicUrl });
  } catch (error) {
    console.error("Audio generation error:", error);
    return NextResponse.json({ error: "Failed to generate audio" }, { status: 500 });
  }
}
