import { supabase } from "@/utils/supabase/client";
import { calculateBoundingBox, isPolygonInBounds } from "./mapUtils";

export const fetchPolygons = async (bounds, setPolygons, setLoading) => {
  const cacheKey = "trabuom_polygons";
  const cacheExpiryKey = "trabuom_polygons_expiry";
  const cacheExpiryDuration = 0.15 * 60 * 60 * 1000; //15 mins

  const currentTime = Date.now();

  // Check if polygons exist in localStorage and are still valid
  const cachedPolygons = localStorage.getItem(cacheKey);
  const cachedExpiry = localStorage.getItem(cacheExpiryKey);

  if (
    cachedPolygons &&
    cachedExpiry &&
    currentTime < parseInt(cachedExpiry)
  ) {
    // Use cached data
    const polygons = JSON.parse(cachedPolygons);

    const visiblePolygons = polygons.filter((polygon) => {
      const polygonBounds = calculateBoundingBox(polygon);
      return isPolygonInBounds(polygonBounds, bounds);
    });

    setPolygons(visiblePolygons);
    return;
  }

  let allRecords = [];
  console.log('setLoading is', setLoading, 'typeof:', typeof setLoading);
  if (typeof setLoading === 'function') setLoading(true);

  // Fetch from Supabase if no valid cache
  const fetchBatch = async (start, end) => {
    let { data, error } = await supabase
      .from("trabuom")
      .select("*")
      .range(start, end);
    if (error) {
      console.log(error);
      return [];
    }
    return data || [];
  };

  // Fetch all records in batches
  allRecords = [
    ...(await fetchBatch(0, 999)),
    ...(await fetchBatch(1000, 1999)),
    ...(await fetchBatch(2000, 2999)),
    ...(await fetchBatch(3000, 3050)),
  ];

  if (allRecords.length > 0) {
    // Save to localStorage
    //localStorage.setItem(cacheKey, JSON.stringify(allRecords));
    //localStorage.setItem(cacheExpiryKey, (currentTime + cacheExpiryDuration).toString());

    // Filter polygons based on bounds
    const visiblePolygons = allRecords.filter((polygon) => {
      const polygonBounds = calculateBoundingBox(polygon);
      return isPolygonInBounds(polygonBounds, bounds);
    });

    setPolygons(visiblePolygons);
  }

  if (typeof setLoading === 'function') setLoading(false);
}; 