"use client";

import { useEffect } from "react";
import type { Map as MaplibreMap } from "maplibre-gl";

interface RouteLayerProps {
  map: MaplibreMap | null;
  geojson: GeoJSON.Feature | GeoJSON.FeatureCollection | null;
  color?: string;
  bbox?: number[] | null;
}

export default function RouteLayer({ map, geojson, color = "#1A5276", bbox }: RouteLayerProps) {
  useEffect(() => {
    if (!map || !geojson) return;

    const sourceId = "route-source";
    const layerId = "route-layer";

    const addRoute = () => {
      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(geojson as GeoJSON.GeoJSON);
      } else {
        map.addSource(sourceId, { type: "geojson", data: geojson as GeoJSON.GeoJSON });
        map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": color,
            "line-width": 4,
            "line-opacity": 0.8,
          },
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
        });
      }

      if (bbox && bbox.length === 4) {
        map.fitBounds(
          [[bbox[0], bbox[1]], [bbox[2], bbox[3]]],
          { padding: 60, duration: 500 }
        );
      }
    };

    if (map.loaded()) {
      addRoute();
    } else {
      map.on("load", addRoute);
    }

    return () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map, geojson, color, bbox]);

  return null;
}
