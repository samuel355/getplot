"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import PropertyCard from "./property-card";

// Fix the default marker icon issue in Leaflet with Next.js
const fixLeafletIcon = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  });
};

const PropertyMap = ({ properties, loading }) => {
  const [mapReady, setMapReady] = useState(false);
  
  // Fix Leaflet icon issue
  useEffect(() => {
    fixLeafletIcon();
    setMapReady(true);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-200 animate-pulse rounded-lg h-[600px]"></div>
    );
  }

  if (!mapReady) {
    return (
      <div className="bg-gray-100 rounded-lg h-[600px] flex items-center justify-center">
        <p>Loading map...</p>
      </div>
    );
  }

  // Calculate the center of all properties or default to Ghana's coordinates
  const defaultCenter = [5.6037, -0.1870]; // Accra, Ghana
  
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
    
    return [centerLat, centerLng];
  };

  return (
    <div className="h-[600px] rounded-lg overflow-hidden shadow-md">
      <MapContainer 
        center={getMapCenter()} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {properties.map((property) => (
          property.coordinates && (
            <Marker 
              key={property.id} 
              position={[property.coordinates.lat, property.coordinates.lng]}
            >
              <Popup>
                <div className="w-64">
                  <PropertyCard property={property} />
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default PropertyMap;