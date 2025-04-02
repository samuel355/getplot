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
    
    // Fit bounds to markers when map loads
    if (properties.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      properties.forEach(property => {
        if (property.coordinates && property.coordinates.lat && property.coordinates.lng) {
          bounds.extend({
            lat: property.coordinates.lat,
            lng: property.coordinates.lng
          });
        }
      });
      map.fitBounds(bounds);
      
      // Don't zoom in too far on small datasets
      const listener = google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 16) {
          map.setZoom(16);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [properties]);

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

  // Function to handle panning to a specific property
  const panToProperty = useCallback((propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    if (property && property.coordinates && mapRef.current) {
      mapRef.current.panTo({
        lat: property.coordinates.lat,
        lng: property.coordinates.lng
      });
      mapRef.current.setZoom(16);
      setSelectedProperty(property);
    }
  }, [properties]);

  // Define map container style
  const mapContainerStyle = {
    height: '100%',
    width: '100%',
  };

  // Enhanced map options for better user experience
  const mapOptions = {
    fullscreenControl: true,
    streetViewControl: true,
    mapTypeControl: true,
    zoomControl: true,
    mapTypeId: 'roadmap', // Can be 'roadmap', 'satellite', 'hybrid', or 'terrain'
    mapTypeControlOptions: {
      style: 2, // DROPDOWN_MENU
      position: 9, // TOP_RIGHT
    },
    controlSize: 32, // Slightly larger controls
    gestureHandling: 'greedy', // Makes the map easier to scroll on mobile
    clickableIcons: false, // Prevents clicks on POIs
    disableDefaultUI: false,
    scrollwheel: true, // Enable scroll wheel zooming
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
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-md overflow-hidden">
      {/* Optional property selector buttons */}
      {properties.length > 0 && (
        <div className="flex gap-2 p-2 overflow-x-auto bg-gray-100">
          <button 
            onClick={() => {
              if (mapRef.current) {
                const bounds = new google.maps.LatLngBounds();
                properties.forEach(property => {
                  if (property.coordinates) {
                    bounds.extend({
                      lat: property.coordinates.lat,
                      lng: property.coordinates.lng
                    });
                  }
                });
                mapRef.current.fitBounds(bounds, { padding: 50 });
              }
            }}
            className="px-3 py-1 text-sm bg-primary text-white rounded-md whitespace-nowrap flex-shrink-0"
          >
            View All Properties
          </button>
          
          {/* Additional map controls can be added here */}
        </div>
      )}
      
      {/* Main map area */}
      <div className="flex-grow">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={getMapCenter()}
          zoom={12}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={mapOptions}
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
                animation={google.maps.Animation.DROP}
                icon={{
                  url: selectedProperty && selectedProperty.id === property.id 
                    ? '/images/marker-active.png' // Create custom marker images
                    : '/images/marker.png',
                  scaledSize: new google.maps.Size(32, 40),
                  origin: new google.maps.Point(0, 0),
                  anchor: new google.maps.Point(16, 40),
                }}
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
              options={{
                pixelOffset: new google.maps.Size(0, -40),
                maxWidth: 320
              }}
            >
              <div className="w-72">
                <PropertyCard property={selectedProperty} isCompact={true} />
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
      
      {/* Optional map legend or info */}
      <div className="p-2 bg-white border-t flex justify-between items-center text-sm text-gray-600">
        <div>
          <span>{properties.length} properties shown</span>
        </div>
        <div>
          <button 
            onClick={() => {
              if (mapRef.current) {
                const currentZoom = mapRef.current.getZoom();
                mapRef.current.setZoom(currentZoom + 1);
              }
            }}
            className="p-1 bg-gray-100 rounded mr-1"
            title="Zoom in"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={() => {
              if (mapRef.current) {
                const currentZoom = mapRef.current.getZoom();
                mapRef.current.setZoom(currentZoom - 1);
              }
            }}
            className="p-1 bg-gray-100 rounded"
            title="Zoom out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyMap;