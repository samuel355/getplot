// components/GoogleMapsProvider.tsx
"use client";
import { useJsApiLoader } from "@react-google-maps/api";
import { ReactNode } from "react";

export default function GoogleMapsProvider({ children }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "your-api-key-here",
  });

  return <>{isLoaded ? children : <p>Loading Google Maps...</p>}</>;
}
