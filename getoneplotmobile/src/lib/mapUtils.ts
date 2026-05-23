import type { PlotFeature } from '../types/plot';

export type MapBounds = {
  south: number;
  west: number;
  north: number;
  east: number;
};

export const calculateBoundingBox = (polygon: PlotFeature) => {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  polygon.geometry.coordinates[0].forEach(([lng, lat]) => {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  });

  return { minLat, maxLat, minLng, maxLng };
};

export const isPolygonInBounds = (
  polygonBounds: ReturnType<typeof calculateBoundingBox>,
  mapBounds: MapBounds
) => {
  return !(
    polygonBounds.maxLat < mapBounds.south ||
    polygonBounds.minLat > mapBounds.north ||
    polygonBounds.maxLng < mapBounds.west ||
    polygonBounds.minLng > mapBounds.east
  );
};

export function getPlotFillColor(status: string | null, amount: number): string {
  if (Number(amount) > 0) {
    if (!status || status === 'Available') return 'rgba(22, 101, 52, 0.55)';
    if (status === 'Reserved') return 'rgba(0, 0, 0, 0.55)';
    if (status === 'Sold') return 'rgba(220, 38, 38, 0.55)';
    if (status === 'On Hold') return 'rgba(156, 163, 175, 0.55)';
  }
  if (Number(amount) === 0 && status === 'Sold') return 'rgba(220, 38, 38, 0.55)';
  return 'rgba(30, 58, 138, 0.55)';
}

export function getPlotStrokeColor(status: string | null, amount: number): string {
  if (Number(amount) > 0) {
    if (!status || status === 'Available') return '#166534';
    if (status === 'Reserved') return '#000000';
    if (status === 'Sold') return '#dc2626';
    if (status === 'On Hold') return '#9ca3af';
  }
  return '#1e3a8a';
}

export async function fetchPlotsForTable(table: string): Promise<PlotFeature[]> {
  const { supabase } = await import('./supabase');
  const batches = [
    [0, 999],
    [1000, 1999],
    [2000, 2999],
    [3000, 3999],
  ];
  const all: PlotFeature[] = [];
  for (const [start, end] of batches) {
    const { data, error } = await supabase.from(table).select('*').range(start, end);
    if (error) {
      console.warn(`fetch ${table} batch error`, error.message);
      continue;
    }
    if (data?.length) all.push(...(data as PlotFeature[]));
  }
  return all;
}
