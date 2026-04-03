"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLE } from "@/lib/maplibre/config";

interface MapPickerProps {
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
  center?: [number, number];
}

export default function MapPicker({ value, onChange, center = [-4.7553, 43.4213] }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [coords, setCoords] = useState(value);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: value ? [value.lng, value.lat] : center,
      zoom: 15,
    });

    if (value) {
      markerRef.current = new maplibregl.Marker({ draggable: true })
        .setLngLat([value.lng, value.lat])
        .addTo(map);

      markerRef.current.on("dragend", () => {
        const lngLat = markerRef.current!.getLngLat();
        const newCoords = { lat: lngLat.lat, lng: lngLat.lng };
        setCoords(newCoords);
        onChange(newCoords);
      });
    }

    map.on("click", (e) => {
      const newCoords = { lat: e.lngLat.lat, lng: e.lngLat.lng };
      setCoords(newCoords);
      onChange(newCoords);

      if (markerRef.current) {
        markerRef.current.setLngLat([newCoords.lng, newCoords.lat]);
      } else {
        markerRef.current = new maplibregl.Marker({ draggable: true })
          .setLngLat([newCoords.lng, newCoords.lat])
          .addTo(map);

        markerRef.current.on("dragend", () => {
          const lngLat = markerRef.current!.getLngLat();
          const c = { lat: lngLat.lat, lng: lngLat.lng };
          setCoords(c);
          onChange(c);
        });
      }
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  return (
    <div>
      <div ref={containerRef} className="w-full h-64 rounded-xl overflow-hidden border border-gray-200" />
      {coords && (
        <p className="text-xs text-gray-400 mt-1">
          {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}
