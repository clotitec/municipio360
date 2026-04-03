"use client";

import { useEffect, useRef } from "react";

interface Tour360ViewerProps {
  panoramaUrl?: string | null;
  config?: {
    hfov?: number;
    pitch?: number;
    yaw?: number;
    hotSpots?: Array<{
      pitch: number;
      yaw: number;
      text: string;
      type?: string;
    }>;
  } | null;
  gothruEmbed?: string | null;
  className?: string;
}

export default function Tour360Viewer({ panoramaUrl, config, gothruEmbed, className = "" }: Tour360ViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const pannellumRef = useRef<unknown>(null);

  useEffect(() => {
    if (!panoramaUrl || !viewerRef.current) return;

    // Dynamically load Pannellum
    const loadPannellum = async () => {
      // Load CSS
      if (!document.querySelector('link[href*="pannellum"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css";
        document.head.appendChild(link);
      }

      // Load JS
      if (!(window as unknown as Record<string, unknown>).pannellum) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js";
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
      }

      const pannellum = (window as unknown as { pannellum: { viewer: (el: HTMLElement, config: Record<string, unknown>) => unknown } }).pannellum;
      if (pannellum && viewerRef.current) {
        pannellumRef.current = pannellum.viewer(viewerRef.current, {
          type: "equirectangular",
          panorama: panoramaUrl,
          autoLoad: true,
          showControls: true,
          hfov: config?.hfov || 110,
          pitch: config?.pitch || 0,
          yaw: config?.yaw || 0,
          hotSpots: config?.hotSpots || [],
        });
      }
    };

    loadPannellum();

    return () => {
      if (pannellumRef.current && typeof (pannellumRef.current as { destroy: () => void }).destroy === "function") {
        (pannellumRef.current as { destroy: () => void }).destroy();
      }
    };
  }, [panoramaUrl, config]);

  // GoThru iframe fallback
  if (!panoramaUrl && gothruEmbed) {
    return (
      <div className={`w-full rounded-2xl overflow-hidden ${className}`}>
        <iframe
          src={gothruEmbed}
          className="w-full h-64 sm:h-80"
          allowFullScreen
          loading="lazy"
          title="Tour 360°"
        />
      </div>
    );
  }

  if (!panoramaUrl) return null;

  return (
    <div className={`w-full rounded-2xl overflow-hidden ${className}`}>
      <div ref={viewerRef} className="w-full h-64 sm:h-80" />
    </div>
  );
}
