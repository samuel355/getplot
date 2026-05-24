import { PLOT_STATUS } from '../constants/plotStatus';
import type { PlotFeature } from '../types/plot';

export type MapBounds = {
  south: number;
  west: number;
  north: number;
  east: number;
};

export type LatLng = { latitude: number; longitude: number };

/** Parse geometry from Supabase (object or JSON string). */
export function normalizePlot(raw: Record<string, unknown>): PlotFeature | null {
  try {
    let geometry = raw.geometry;
    if (typeof geometry === 'string') {
      geometry = JSON.parse(geometry);
    }
    if (!geometry || typeof geometry !== 'object') return null;

    const props =
      typeof raw.properties === 'string'
        ? JSON.parse(raw.properties as string)
        : raw.properties;

    return {
      ...(raw as PlotFeature),
      geometry: geometry as PlotFeature['geometry'],
      properties: (props || {}) as PlotFeature['properties'],
      plotTotalAmount: Number(raw.plotTotalAmount) || 0,
      status: (raw.status as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

/** Extract outer ring coordinates from Polygon / MultiPolygon GeoJSON. */
export function getPolygonRing(plot: PlotFeature): LatLng[] {
  const geometry = plot.geometry;
  const coords = geometry?.coordinates;
  if (!coords?.length) return [];

  // MultiPolygon: coordinates[polygonIndex][ringIndex][pointIndex]
  if (
    Array.isArray(coords[0]) &&
    Array.isArray(coords[0][0]) &&
    Array.isArray(coords[0][0][0])
  ) {
    const ring = coords[0][0] as number[][];
    return ringToLatLng(ring);
  }

  // Polygon: coordinates[ringIndex][pointIndex] — Supabase often omits geometry.type
  const ring = coords[0] as number[][];
  if (!Array.isArray(ring?.[0])) return [];
  // Point ring: [[lng, lat], ...]
  if (typeof ring[0][0] === 'number') {
    return ringToLatLng(ring);
  }

  return [];
}

function ringToLatLng(ring: number[][]): LatLng[] {
  return ring
    .filter((c) => Array.isArray(c) && c.length >= 2)
    .map(([lng, lat]) => ({
      latitude: Number(lat),
      longitude: Number(lng),
    }))
    .filter((c) => !Number.isNaN(c.latitude) && !Number.isNaN(c.longitude));
}

export const calculateBoundingBox = (plot: PlotFeature) => {
  const ring = getPolygonRing(plot);
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  ring.forEach(({ latitude: lat, longitude: lng }) => {
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
  if (polygonBounds.minLat === Infinity) return false;
  return !(
    polygonBounds.maxLat < mapBounds.south ||
    polygonBounds.minLat > mapBounds.north ||
    polygonBounds.maxLng < mapBounds.west ||
    polygonBounds.minLng > mapBounds.east
  );
};

export function getPlotFillColor(status: string | null, amount: number): string {
  if (Number(amount) > 0) {
    if (!status || status === 'Available') return PLOT_STATUS.available.fill;
    if (status === 'Reserved') return PLOT_STATUS.reserved.fill;
    if (status === 'Sold') return PLOT_STATUS.sold.fill;
    if (status === 'On Hold') return PLOT_STATUS.onHold.fill;
  }
  if (Number(amount) === 0 && status === 'Sold') return PLOT_STATUS.sold.fill;
  return PLOT_STATUS.unpriced.fill;
}

export function getPlotStrokeColor(status: string | null, amount: number): string {
  if (Number(amount) > 0) {
    if (!status || status === 'Available') return PLOT_STATUS.available.stroke;
    if (status === 'Reserved') return PLOT_STATUS.reserved.stroke;
    if (status === 'Sold') return PLOT_STATUS.sold.stroke;
    if (status === 'On Hold') return PLOT_STATUS.onHold.stroke;
  }
  return PLOT_STATUS.unpriced.stroke;
}

/** Batch-fetch plot rows from Supabase (same ranges as web fetchPolygons). */
export async function fetchPlotsForTable(table: string): Promise<PlotFeature[]> {
  const { supabase } = await import('./supabase');
  const batches = [
    [0, 999],
    [1000, 1999],
    [2000, 2999],
    [3000, 3999],
  ];
  const all: PlotFeature[] = [];
  let lastError: string | null = null;

  for (const [start, end] of batches) {
    const { data, error } = await supabase.from(table).select('*').range(start, end);
    if (error) {
      lastError = error.message;
      console.warn(`fetch ${table} batch error`, error.message);
      continue;
    }
    for (const row of data || []) {
      const plot = normalizePlot(row as Record<string, unknown>);
      if (plot && getPolygonRing(plot).length >= 3) {
        all.push(plot);
      }
    }
  }

  if (all.length === 0 && lastError) {
    throw new Error(lastError);
  }

  return all;
}
