const EARTH_RADIUS_METRES = 6378137;
const SQUARE_METRES_PER_ACRE = 4046.8564224;
const EARTH_RADIUS_FEET = 20902231;

function ringFromPlot(plot) {
  const coordinates = plot?.geometry?.coordinates;
  if (!Array.isArray(coordinates) || !coordinates.length) return [];
  const ring = Array.isArray(coordinates[0]?.[0]?.[0]) ? coordinates[0][0] : coordinates[0];
  return Array.isArray(ring)
    ? ring.filter((point) => Array.isArray(point) && point.length >= 2)
    : [];
}

function radians(value) {
  return (Number(value) * Math.PI) / 180;
}

export function calculatePlotAreaAcres(plot) {
  const ring = ringFromPlot(plot);
  if (ring.length >= 3) {
    const averageLatitude = ring.reduce((sum, point) => sum + Number(point[1]), 0) / ring.length;
    const latitudeScale = Math.cos(radians(averageLatitude));
    const points = ring.map(([longitude, latitude]) => ({
      x: EARTH_RADIUS_METRES * radians(longitude) * latitudeScale,
      y: EARTH_RADIUS_METRES * radians(latitude),
    }));
    const squareMetres = Math.abs(points.reduce((sum, point, index) => {
      const next = points[(index + 1) % points.length];
      return sum + point.x * next.y - next.x * point.y;
    }, 0)) / 2;
    const acres = squareMetres / SQUARE_METRES_PER_ACRE;
    if (Number.isFinite(acres) && acres > 0) return acres;
  }

  const props = plot?.properties ?? {};
  const direct = Number(props.Area ?? props.area ?? plot?.Area);
  if (Number.isFinite(direct) && direct > 0) return direct;
  const gisArea = Number(props.SHAPE_Area ?? props.Shape_Area ?? props.shape_area);
  return Number.isFinite(gisArea) && gisArea > 0 ? gisArea * 3109111.525693 : null;
}

export function calculatePlotDimensionsFeet(plot) {
  const props = plot?.properties ?? {};
  const stored = props.Dimensions ?? props.Dimension ?? props.Plot_Size ?? props.Size;
  if (stored) return String(stored).replace(/\s*(ft|feet)?\s*$/i, " feet");

  const ring = ringFromPlot(plot);
  if (ring.length < 3) return null;
  const lengths = ring.map((point, index) => {
    const next = ring[(index + 1) % ring.length];
    const [lng1, lat1] = point;
    const [lng2, lat2] = next;
    const dLat = radians(lat2 - lat1);
    const dLng = radians(lng2 - lng1);
    const value = Math.sin(dLat / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLng / 2) ** 2;
    return EARTH_RADIUS_FEET * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
  }).filter((length) => Number.isFinite(length) && length > 3).sort((a, b) => b - a);
  if (lengths.length < 2) return null;
  const shorter = lengths.find((length) => length < lengths[0] * 0.9) ?? lengths[lengths.length - 1];
  return `${Math.round(lengths[0])}x${Math.round(shorter)} feet`;
}

export function formatCalculatedPlotSize(plot) {
  const acres = calculatePlotAreaAcres(plot);
  const dimensions = calculatePlotDimensionsFeet(plot);
  return [acres ? `${acres.toFixed(2)} Acres` : null, dimensions].filter(Boolean).join(" • ") || "Size unavailable";
}
