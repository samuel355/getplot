"use client";
import { useEffect, useState } from "react";
import { GoogleMap, Polygon, useLoadScript } from "@react-google-maps/api";
import { supabase } from "@/utils/supabase/client";

const containerStyle = {
  width: "100%",
  height: "600px",
};

const center = {
  lat: 6.5901048210000681,
  lng: -1.7678195729999402,
};

// Function to calculate the bounding box for a polygon
const calculateBoundingBox = (polygon) => {
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

// Check if a polygon's bounding box intersects with the map bounds
const isPolygonInBounds = (polygonBounds, mapBounds) => {
  return !(
    polygonBounds.maxLat < mapBounds.south ||
    polygonBounds.minLat > mapBounds.north ||
    polygonBounds.maxLng < mapBounds.west ||
    polygonBounds.minLng > mapBounds.east
  );
};

const Map = () => {
  const [polygons, setPolygons] = useState([]);
  const [map, setMap] = useState(null); // Store the map object here
  const [mapBounds, setMapBounds] = useState(null);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  });

  // Fetch all polygons and filter by map bounds
  const fetchPolygons = async (bounds) => {
    const { data, error } = await supabase.from("trabuom").select("*");
    // First batch (records 0 to 999)
    let { data: records1, error1 } = await supabase
      .from("trabuom")
      .select("*")
      .range(0, 999);

    // Second batch (records 1000 to 1999)
    let { data: records2, error2 } = await supabase
      .from("trabuom")
      .select("*")
      .range(1000, 1999);

    // Third batch (records 2000 to 2999)
    let { data: records3, error3 } = await supabase
      .from("trabuom")
      .select("*")
      .range(2000, 2999);

    // Fourth batch (records 3000 to 3279)
    let { data: records4, error4 } = await supabase
      .from("trabuom")
      .select("*")
      .range(3000, 3279);

    // Combine the results
    let allRecords = [...records1, ...records2, ...records3, ...records4];

    if (error) {
      console.error("Error fetching polygons:", error);
    } else {
      // Filter polygons by checking their bounding box against the map bounds
      const visiblePolygons = allRecords.filter((polygon) => {
        const polygonBounds = calculateBoundingBox(polygon);
        return isPolygonInBounds(polygonBounds, bounds);
      });

      setPolygons(visiblePolygons);
    }
  };

  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance); // Set the map instance in state
    const bounds = mapInstance.getBounds();
    if (bounds) {
      setMapBounds({
        south: bounds.getSouthWest().lat(),
        west: bounds.getSouthWest().lng(),
        north: bounds.getNorthEast().lat(),
        east: bounds.getNorthEast().lng(),
      });
    }
  };

  const handleBoundsChanged = () => {
    if (map) {
      const bounds = map.getBounds();
      if (bounds) {
        setMapBounds({
          south: bounds.getSouthWest().lat(),
          west: bounds.getSouthWest().lng(),
          north: bounds.getNorthEast().lat(),
          east: bounds.getNorthEast().lng(),
        });
      }
    }
  };

  useEffect(() => {
    if (mapBounds) {
      fetchPolygons(mapBounds);
    }
  }, [mapBounds]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      onLoad={handleMapLoad} // Correctly handle onLoad
      onBoundsChanged={handleBoundsChanged} // Update bounds when the map bounds change
    >
      {polygons.map((polygon, index) => (
        <Polygon
          key={index}
          paths={polygon.geometry.coordinates[0].map(([lng, lat]) => ({
            lat,
            lng,
          }))}
          options={{
            fillColor: "#00FF00",
            fillOpacity: 0.4,
            strokeColor: "#00FF00",
            strokeOpacity: 0.8,
            strokeWeight: 2,
          }}
        />
      ))}
    </GoogleMap>
  );
};

export default Map;
