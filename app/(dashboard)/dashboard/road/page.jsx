"use client";
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { mapRoads } from "./roadData"; // Your GeoJSON road data with properties

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const MapComponent = () => {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-1.499152922013753, 6.759245559146633], // Initial map center [lng, lat]
      zoom: 14,
    });

    // Add road polylines and labels
    map.on("load", () => {
      // Add the roads data as a source
      map.addSource("roads", {
        type: "geojson",
        data: mapRoads, // Your GeoJSON data with coordinates and road names
      });

      // Add the polyline layer for the roads
      map.addLayer({
        id: "road-lines",
        type: "line",
        source: "roads",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#1E90FF", // Color of the road
          "line-width": 4,         // Thickness of the road line
        },
      });

      // Add a symbol layer for the road names (labels along the line)
      map.addLayer({
        id: "road-labels",
        type: "symbol",
        source: "roads",
        layout: {
          "symbol-placement": "line", // Align text with the line
          "text-field": ["get", "Names"], // Use the 'Name' property from GeoJSON for label
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 14,
        },
        paint: {
          "text-color": "#000",  // Label color
          "text-halo-color": "#fff",  // Outline around text for better readability
          "text-halo-width": 1,
        },
      });
    });

    // Clean up on unmount
    return () => map.remove();
  }, []);

  return <div ref={mapContainerRef} style={{ width: "100%", height: "75vh" }} />;
};

export default MapComponent;
