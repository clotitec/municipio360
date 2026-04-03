"use client";

import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLE } from "@/lib/maplibre/config";
import { getPoiMarkerHtml, getClusterMarkerHtml } from "@/lib/maplibre/icons";
import type { POI } from "@/lib/supabase/types";

interface MapViewProps {
  center: [number, number];
  zoom: number;
  pois: (POI & { lng: number; lat: number })[];
  color: string;
  onPoiClick?: (poi: POI) => void;
}

export default function MapView({ center, zoom, pois, color, onPoiClick }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center,
      zoom,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      "top-right"
    );

    mapRef.current = map;

    return () => {
      clearMarkers();
      map.remove();
      mapRef.current = null;
    };
  }, [center, zoom, clearMarkers]);

  // Render POI markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const renderMarkers = () => {
      clearMarkers();

      // Simple clustering: group nearby POIs at low zoom
      const currentZoom = map.getZoom();
      if (currentZoom < 12 && pois.length > 10) {
        // Basic grid clustering
        const gridSize = 0.05;
        const clusters = new Map<string, (POI & { lng: number; lat: number })[]>();

        pois.forEach((poi) => {
          const key = `${Math.round(poi.lng / gridSize)}_${Math.round(poi.lat / gridSize)}`;
          if (!clusters.has(key)) clusters.set(key, []);
          clusters.get(key)!.push(poi);
        });

        clusters.forEach((group) => {
          if (group.length === 1) {
            addPoiMarker(map, group[0]);
          } else {
            const avgLng = group.reduce((s, p) => s + p.lng, 0) / group.length;
            const avgLat = group.reduce((s, p) => s + p.lat, 0) / group.length;
            const el = document.createElement("div");
            el.innerHTML = getClusterMarkerHtml(group.length, color);
            el.style.cursor = "pointer";
            el.addEventListener("click", () => {
              map.flyTo({ center: [avgLng, avgLat], zoom: currentZoom + 2 });
            });
            const marker = new maplibregl.Marker({ element: el })
              .setLngLat([avgLng, avgLat])
              .addTo(map);
            markersRef.current.push(marker);
          }
        });
      } else {
        pois.forEach((poi) => addPoiMarker(map, poi));
      }
    };

    const addPoiMarker = (m: maplibregl.Map, poi: POI & { lng: number; lat: number }) => {
      const el = document.createElement("div");
      el.innerHTML = getPoiMarkerHtml(poi.tipo, color);
      el.style.cursor = "pointer";
      el.addEventListener("click", () => onPoiClick?.(poi));

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([poi.lng, poi.lat])
        .addTo(m);
      markersRef.current.push(marker);
    };

    // Initial render
    map.on("load", renderMarkers);
    map.on("zoomend", renderMarkers);

    // If map already loaded
    if (map.loaded()) renderMarkers();

    return () => {
      map.off("load", renderMarkers);
      map.off("zoomend", renderMarkers);
    };
  }, [pois, color, onPoiClick, clearMarkers]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
