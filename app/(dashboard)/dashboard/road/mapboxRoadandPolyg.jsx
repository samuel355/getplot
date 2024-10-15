"use client";
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { polygonData, roadData } from "./mapData"; // Your GeoJSON data for polygons and roads

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const MapComponent = () => {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-1.499152922013753, 6.759245559146633], // Center coordinates [lng, lat]
      zoom: 14,
    });

    map.on("load", () => {
      // Add the polygon data as a source
      map.addSource("polygons", {
        type: "geojson",
        data: polygonData, // Your GeoJSON polygons
      });

      // Add a fill layer for the polygons
      map.addLayer({
        id: "polygon-layer",
        type: "fill",
        source: "polygons",
        layout: {},
        paint: {
          "fill-color": "#FF0000", // Red fill
          "fill-opacity": 0.5,
        },
      });

      // Add the road data as a source
      map.addSource("roads", {
        type: "geojson",
        data: roadData, // Your GeoJSON roads
      });

      // Add a line layer for the roads
      map.addLayer({
        id: "road-layer",
        type: "line",
        source: "roads",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#1E90FF", // Blue road lines
          "line-width": 4,
        },
      });
    });

    return () => map.remove();
  }, []);

  return <div ref={mapContainerRef} style={{ width: "100%", height: "75vh" }} />;
};

export default MapComponent;
