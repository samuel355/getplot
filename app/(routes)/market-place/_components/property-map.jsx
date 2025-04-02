"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import PropertyCard from "./property-card";

const PropertyMap = ({ properties, loading }) => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const mapRef = useRef(null);
  
  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "your-api-key-here"
  });

  // Store map reference once it's loaded
  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Clear reference when map unmounts
  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Calculate the center of all properties or default to Ghana's coordinates
  const defaultCenter = { lat: 5.6037, lng: -0.1870 }; // Accra, Ghana
  
  const getMapCenter = () => {
    if (properties.length === 0) return defaultCenter;
    
    const validCoordinates = properties.filter(p => 
      p.coordinates && p.coordinates.lat && p.coordinates.lng
    );
    
    if (validCoordinates.length === 0) return defaultCenter;
    
    const lats = validCoordinates.map(p => p.coordinates.lat);
    const lngs = validCoordinates.map(p => p.coordinates.lng);
    
    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    
    return { lat: centerLat, lng: centerLng };
  };

  // Define map container style
  const mapContainerStyle = {
    height: '100%',
    width: '100%',
  };

  if (loading) {
    return (
      <div className="bg-gray-200 animate-pulse rounded-lg h-[600px]"></div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="bg-gray-100 rounded-lg h-[600px] flex items-center justify-center">
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-[600px]">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={getMapCenter()}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          fullscreenControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          zoomControl: true,
        }}
      >
        {properties.map((property) => (
          property.coordinates && (
            <Marker
              key={property.id}
              position={{
                lat: property.coordinates.lat,
                lng: property.coordinates.lng
              }}
              onClick={() => setSelectedProperty(property)}
            />
          )
        ))}

        {selectedProperty && (
          <InfoWindow
            position={{
              lat: selectedProperty.coordinates.lat,
              lng: selectedProperty.coordinates.lng
            }}
            onCloseClick={() => setSelectedProperty(null)}
          >
            <div className="w-64">
              <PropertyCard property={selectedProperty} />
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default PropertyMap;