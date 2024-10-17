"use client";
import React from "react";
import { LoadScript } from "@react-google-maps/api";

const Provider = ({ children }) => {
  return (
    <div>
      <LoadScript
        id="google-maps-plots"
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY}
        libraries={[
          "places",
          "maps",
          "geocoding",
          "marker",
          "streetView",
          "routes",
          "visualization",
          "drawing",
          "core",
          "geometry",
          "streetView",
          "journeySharing",
        ]}
      >
        <div className="flex flex-col items-center">{children}</div>
      </LoadScript>
    </div>
  );
};

export default Provider;
