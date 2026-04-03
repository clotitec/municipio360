export const MAP_STYLE = `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`;

export const DEFAULT_CENTER: [number, number] = [-4.7553, 43.4213]; // Llanes
export const DEFAULT_ZOOM = 13;

export const CLUSTER_CONFIG = {
  clusterRadius: 50,
  clusterMaxZoom: 14,
};
