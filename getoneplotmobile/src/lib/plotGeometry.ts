import type { PlotFeature } from "../types/plot";

const radians = (value: number) => (value * Math.PI) / 180;

export function formatCoordinatePlotSize(plot: PlotFeature | null): string {
  const ring = plot?.geometry?.coordinates?.[0] ?? [];
  let acres: number | null = null;
  if (ring.length >= 3) {
    const averageLatitude = ring.reduce((sum, point) => sum + Number(point[1]), 0) / ring.length;
    const latitudeScale = Math.cos(radians(averageLatitude));
    const points = ring.map(([longitude, latitude]) => ({
      x: 6378137 * radians(Number(longitude)) * latitudeScale,
      y: 6378137 * radians(Number(latitude)),
    }));
    const squareMetres = Math.abs(points.reduce((sum, point, index) => {
      const next = points[(index + 1) % points.length];
      return sum + point.x * next.y - next.x * point.y;
    }, 0)) / 2;
    const calculated = squareMetres / 4046.8564224;
    if (Number.isFinite(calculated) && calculated > 0) acres = calculated;
  }

  const edges = ring.map((point, index) => {
    const next = ring[(index + 1) % ring.length];
    const [lng1, lat1] = point;
    const [lng2, lat2] = next;
    const dLat = radians(lat2 - lat1);
    const dLng = radians(lng2 - lng1);
    const value = Math.sin(dLat / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLng / 2) ** 2;
    return 20902231 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
  }).filter((value) => Number.isFinite(value) && value > 3).sort((a, b) => b - a);
  const shorter = edges.length >= 2 ? edges.find((value) => value < edges[0] * 0.9) ?? edges[edges.length - 1] : null;
  const dimensions = edges.length >= 2 && shorter ? `${Math.round(edges[0])}x${Math.round(shorter)} feet` : null;

  if (!acres) {
    const stored = Number(plot?.properties?.Area);
    acres = Number.isFinite(stored) && stored > 0 ? stored : null;
  }
  return [acres ? `${acres.toFixed(2)} Acres` : null, dimensions].filter(Boolean).join(" • ") || "Size unavailable";
}
