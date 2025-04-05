"use client";

import { useRef, useCallback, useState } from "react";
import { GoogleMap, Marker, InfoWindow} from "@react-google-maps/api";
import { MapPin, ZoomIn, ZoomOut, Maximize, Layers } from "lucide-react";

export default function PropertyMap({ property }) {
  const [mapType, setMapType] = useState("roadmap");
  const [isMapTypeMenuOpen, setIsMapTypeMenuOpen] = useState(false);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  // Default coordinates (Ghana) if property doesn't have coordinates
  const defaultCoordinates = { lat: 5.6037, lng: -0.187 };
  
  // Extract coordinates from property - this is just a placeholder
  // In a real app, you'd get this from your database
  const coordinates = {
    lat: property.latitude || defaultCoordinates.lat,
    lng: property.longitude || defaultCoordinates.lng
  };

  // Store map reference once it's loaded
  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Clear reference when map unmounts
  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Function to handle map type change
  const changeMapType = (type) => {
    setMapType(type);
    if (mapRef.current) {
      mapRef.current.setMapTypeId(type);
    }
    setIsMapTypeMenuOpen(false);
  };

  // Map container style
  const mapContainerStyle = {
    width: "100%",
    height: "100%",
  };

  // Map options
  const mapOptions = {
    fullscreenControl: false,
    streetViewControl: true,
    mapTypeControl: false,
    zoomControl: false,
    mapTypeId: mapType,
    controlSize: 32,
    gestureHandling: "cooperative",
    clickableIcons: false,
    disableDefaultUI: false,
    scrollwheel: true,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ],
  };
  return (
      <div ref={mapContainerRef} className="w-full h-full relative">
        {/* Main map */}
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={coordinates}
          zoom={15}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={mapOptions}
        >
          {/* Property marker */}
          <Marker
            position={coordinates}
            onClick={() => setShowInfoWindow(!showInfoWindow)}
            animation={window.google.maps.Animation.DROP}
          />
  
          {/* Info Window */}
          {showInfoWindow && (
            <InfoWindow
              position={coordinates}
              onCloseClick={() => setShowInfoWindow(false)}
            >
              <div className="p-2 max-w-xs">
                <h3 className="font-medium text-sm">{property.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{property.address}</p>
                {property.price && (
                  <p className="text-primary font-medium text-sm mt-1">
                    ${Number(property.price).toLocaleString()}
                  </p>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
  
        {/* Map controls */}
        <div className="absolute top-3 right-3 bg-white shadow-md rounded-lg p-2 flex flex-col gap-2 z-10">
          {/* Zoom controls */}
          <button
            onClick={() => mapRef.current?.setZoom((mapRef.current.getZoom() || 15) + 1)}
            className="p-1.5 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
            title="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={() => mapRef.current?.setZoom((mapRef.current.getZoom() || 15) - 1)}
            className="p-1.5 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
            title="Zoom out"
          >
            <ZoomOut size={18} />
          </button>
  
          {/* Map type control */}
          <div className="relative">
            <button
              onClick={() => setIsMapTypeMenuOpen(!isMapTypeMenuOpen)}
              className="p-1.5 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
              title="Change map type"
            >
              <Layers size={18} />
            </button>
  
            {isMapTypeMenuOpen && (
              <div className="absolute right-full mr-2 top-0 bg-white shadow-lg rounded-lg overflow-hidden w-28">
                <button
                  onClick={() => changeMapType("roadmap")}
                  className={`px-2 py-1.5 w-full text-left text-sm hover:bg-gray-100 ${
                    mapType === "roadmap" ? "bg-blue-50 text-blue-600" : ""
                  }`}
                >
                  Road Map
                </button>
                <button
                  onClick={() => changeMapType("satellite")}
                  className={`px-2 py-1.5 w-full text-left text-sm hover:bg-gray-100 ${
                    mapType === "satellite" ? "bg-blue-50 text-blue-600" : ""
                  }`}
                >
                  Satellite
                </button>
                <button
                  onClick={() => changeMapType("hybrid")}
                  className={`px-2 py-1.5 w-full text-left text-sm hover:bg-gray-100 ${
                    mapType === "hybrid" ? "bg-blue-50 text-blue-600" : ""
                  }`}
                >
                  Hybrid
                </button>
              </div>
            )}
          </div>
        </div>
  
        {/* Property location badge */}
        <div className="absolute bottom-3 left-3 bg-white bg-opacity-90 rounded-md px-3 py-2 shadow-md max-w-[80%] z-10">
          <div className="flex items-start">
            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0 mr-1.5" />
            <div>
              <p className="text-sm font-medium leading-tight">{property.location}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{property.address}</p>
            </div>
          </div>
        </div>
      </div>
  );
}