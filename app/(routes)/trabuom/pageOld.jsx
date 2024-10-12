"use client";
import Footer from "@/app/_components/Footer";
import Map from "@/app/_components/Map";
import { supabase } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import Header from "@/app/_components/Header";
import mapboxgl from "mapbox-gl";
import { GoogleMap, Polygon, useLoadScript } from "@react-google-maps/api";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const containerStyle = {
  height: "75vh",
  width: "85%",
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

const page = () => {
  const [plots, setPlots] = useState([]);
  const [center, setCenter] = useState({
    lng: -1.7678195729999402,
    lat: 6.5901048210000681,
  });

  const [polygons, setPolygons] = useState([]);
  const [mapBounds, setMapBounds] = useState(null);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  });

  // Fetch all polygons and filter by map bounds
  const fetchPolygons = async (bounds) => {
    const { data, error } = await supabase.from("trabuom").select("*");

    if (error) {
      console.error("Error fetching polygons:", error);
    } else {
      // Filter polygons by checking their bounding box against the map bounds
      const visiblePolygons = data.filter((polygon) => {
        const polygonBounds = calculateBoundingBox(polygon);
        return isPolygonInBounds(polygonBounds, bounds);
      });

      setPolygons(visiblePolygons);
    }
  };

  const onLoad = (map) => {
    setMapBounds(map.getBounds());
  };

  const onBoundsChanged = (map) => {
    const bounds = map.getBounds();
    setMapBounds({
      south: bounds.getSouthWest().lat(),
      west: bounds.getSouthWest().lng(),
      north: bounds.getNorthEast().lat(),
      east: bounds.getNorthEast().lng(),
    });
  };

  useEffect(() => {
    if (mapBounds) {
      fetchPolygons(mapBounds);
    }
  }, [mapBounds]);

  if (!isLoaded) return <div>Loading...</div>;

  // useEffect(() => {
  //   getPlots();
  // }, []);

  // const getPlost = async () => {
  //   // First batch (records 0 to 999)
  //   let { data: records1, error1 } = await supabase
  //     .from("trabuom")
  //     .select("*")
  //     .range(0, 999);

  //   // Second batch (records 1000 to 1999)
  //   let { data: records2, error2 } = await supabase
  //     .from("trabuom")
  //     .select("*")
  //     .range(1000, 1999);

  //   // Third batch (records 2000 to 2999)
  //   let { data: records3, error3 } = await supabase
  //     .from("trabuom")
  //     .select("*")
  //     .range(2000, 2999);

  //   // Fourth batch (records 3000 to 3279)
  //   let { data: records4, error4 } = await supabase
  //     .from("trabuom")
  //     .select("*")
  //     .range(3000, 3279);

  //   // Combine the results
  //   let allRecords = [...records1, ...records2, ...records3, ...records4];

  //   //  const { data, error } = await supabase
  //   //  .from("trabuom")
  //   //  .select("*")
  //   //  .eq("properties->OBJECTID_1", 126);

  //   if (allRecords) {
  //     //console.log('DATA: ', data);
  //     setPlots(allRecords);
  //     console.log(allRecords.length);

  //     if (plots.length > 0) {
  //       setCenter({
  //         lng: plots[0].geometry.coordinates[0][0][1],
  //         lat: plots[0].geometry.coordinates[0][0][0],
  //       });
  //     }
  //   }
  //   let error = error1 | error2 | error3 | error4
  //   if (error) {
  //     console.log(error);
  //   }
  // };

  // async function insertFeatures(features) {
  //   try {
  //     const transformedFeatures = features.map((feature) => ({
  //       type: feature.type,
  //       geometry: feature.geometry,
  //       properties: feature.properties,
  //     }));

  //     const { data: checkDatabase, error: checkError } = await supabase
  //       .from("trabuom_duplicate")
  //       .select("*");

  //     if (checkError) {
  //       console.log(checkError);
  //       return;
  //     }
  //     if (checkDatabase.length === 0) {
  //       // Insert the transformed features into the 'trabuom' table
  //       const { data, error } = await supabase
  //         .from("trabuom_duplicate")
  //         .insert(transformedFeatures)
  //         .select("*");

  //       console.log(data);
  //       if (error) {
  //         console.error("Error inserting features:", error);
  //       } else {
  //         console.log("Inserted features:", data);
  //       }
  //     }
  //   } catch (err) {
  //     console.error("Error:", err);
  //   }
  // }

  // useEffect(() => {
  //   //insertFeatures(trabuomFeatures);
  // }, [])

  const getPlots = async () => {
    try {
      const { data, error } = await supabase
        .from("trabuom")
        .select("*")
        .range(0, 100);

      if (data) {
        setPlots(data);
      }
      if (plots.length > 0) {
        setCenter({
          lng: plots[0].geometry.coordinates[0][0][1],
          lat: plots[0].geometry.coordinates[0][0][0],
        });
      }
      if (error) {
        console.log(error);
      }
    } catch (error) {
      console.error("Error fetching plot:", error);
    }
  };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      onLoad={onLoad}
      onBoundsChanged={onBoundsChanged}
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

export default page;
