"use client";
import { Polyline, MarkerF } from "@react-google-maps/api";

const lineOptions = {
  strokeColor: "#4285F4",
  strokeOpacity: 0.8,
  strokeWeight: 3,
};

function midpoint(coords) {
  const midIndex = Math.floor(coords.length / 2);
  return { lat: coords[midIndex][1], lng: coords[midIndex][0] };
}

export default function StreetLine({ feature }) {
  const path = feature.geometry.coordinates.map(([lng, lat]) => ({ lng, lat }));
  const mid = midpoint(feature.geometry.coordinates);

  const polygonCoords = [];
  for (const coord of feature.geometry.coordinates) {
    const [lng, lat] = coord;
    polygonCoords.push({ lng, lat });
  }

  // Calculate the centroid of the polygon
  var bounds = new google.maps.LatLngBounds();
  polygonCoords.forEach(function (coord) {
    bounds.extend(coord);
  });
  var centroid = bounds.getCenter();

  return (
    <>
      <Polyline path={path} options={lineOptions} />
      {feature.properties.Street_Name && (
        <MarkerF
          position={mid}
          label={{
            text: feature.properties.Street_Name,
            fontSize: "12px",
            fontWeight: "bold",
          }}
          icon={{
            path: "M0,0", // invisible point
            strokeOpacity: 0,
            fillOpacity: 0,
          }}
        />
      )}
    </>
  );
}
