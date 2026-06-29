"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { mapRoads } from "../roadData";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function RoadMapClient() {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-1.499152922013753, 6.759245559146633],
      zoom: 14,
    });

    map.on("load", () => {
      map.addSource("roads", {
        type: "geojson",
        data: mapRoads,
      });

      map.addLayer({
        id: "road-lines",
        type: "line",
        source: "roads",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#1E90FF",
          "line-width": 4,
        },
      });

      map.addLayer({
        id: "road-labels",
        type: "symbol",
        source: "roads",
        layout: {
          "symbol-placement": "line",
          "text-field": ["get", "Names"],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 14,
        },
        paint: {
          "text-color": "#000",
          "text-halo-color": "#fff",
          "text-halo-width": 1,
        },
      });
    });

    return () => map.remove();
  }, []);

  return <div ref={mapContainerRef} style={{ width: "100%", height: "75vh" }} />;
}
