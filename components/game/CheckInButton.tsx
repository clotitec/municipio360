"use client";

import { useState } from "react";
import { MapPin, Loader2, Check } from "lucide-react";
import { getCurrentPosition, haversineDistance } from "@/lib/geolocation";

interface CheckInButtonProps {
  targetLat: number;
  targetLng: number;
  radiusM: number;
  onSuccess: () => void;
  color?: string;
  disabled?: boolean;
}

export default function CheckInButton({
  targetLat,
  targetLng,
  radiusM,
  onSuccess,
  color = "#1A5276",
  disabled = false,
}: CheckInButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "too_far" | "error">("idle");

  const handleCheckIn = async () => {
    setStatus("loading");
    try {
      const pos = await getCurrentPosition();
      const dist = haversineDistance(
        pos.coords.latitude,
        pos.coords.longitude,
        targetLat,
        targetLng
      );

      if (dist <= radiusM) {
        setStatus("success");
        // Vibrate on success
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        onSuccess();
      } else {
        setStatus("too_far");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const labels = {
    idle: "Check-in",
    loading: "Localizando...",
    success: "¡Desbloqueado!",
    too_far: "Demasiado lejos",
    error: "Error GPS",
  };

  return (
    <button
      onClick={handleCheckIn}
      disabled={disabled || status === "loading" || status === "success"}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium text-sm transition-all active:scale-95 disabled:opacity-50"
      style={{
        backgroundColor: status === "success" ? "#4CAF50" : status === "too_far" ? "#F44336" : color,
      }}
    >
      {status === "loading" ? (
        <Loader2 size={16} className="animate-spin" />
      ) : status === "success" ? (
        <Check size={16} />
      ) : (
        <MapPin size={16} />
      )}
      {labels[status]}
    </button>
  );
}
