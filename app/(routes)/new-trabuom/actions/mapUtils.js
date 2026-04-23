export const calculateBoundingBox = (polygon) => {
  let minLat = Infinity,
    maxLat = -Infinity,
    minLng = Infinity,
    maxLng = -Infinity;

  polygon.geometry.coordinates[0].forEach(([lng, lat]) => {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  });

  return { minLat, maxLat, minLng, maxLng };
};

export const isPolygonInBounds = (polygonBounds, mapBounds) => {
  return !(
    polygonBounds.maxLat < mapBounds.south ||
    polygonBounds.minLat > mapBounds.north ||
    polygonBounds.maxLng < mapBounds.west ||
    polygonBounds.minLng > mapBounds.east
  );
}; 