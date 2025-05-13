import { MapPinIcon } from "@heroicons/react/24/outline";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { useEffect, useRef, useCallback, useState } from "react";
import { ZoomIn, ZoomOut, Layers } from "lucide-react";

export default function LocationTab({ 
  property, 
  directions, 
  startLocation, 
  setStartLocation, 
  searchInputRef, 
  getCurrentLocation,
  calculateRoute,
  isCalculatingRoute
}) {
  const [mapType, setMapType] = useState("roadmap");
  const [isMapTypeMenuOpen, setIsMapTypeMenuOpen] = useState(false);
  const mapRef = useRef(null);

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

  useEffect(() => {
    if (!searchInputRef.current || !window.google) {
      console.log("Search input ref or Google not available:", {
        hasSearchInput: !!searchInputRef.current,
        hasGoogle: !!window.google
      });
      return;
    }

    const options = {
      types: ["geocode", "establishment"],
      componentRestrictions: { country: "gh" },
    };

    const autocomplete = new window.google.maps.places.Autocomplete(
      searchInputRef.current,
      options
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (!place.geometry) {
        console.warn("No geometry available for place:", place);
        return;
      }

      const origin = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      // Update the input value with the selected place's formatted address
      setStartLocation(place.formatted_address);

      // Calculate route
      calculateRoute(origin);
    });

    // Cleanup
    return () => {
      if (autocomplete) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [searchInputRef.current, window.google, setStartLocation, calculateRoute]);

  return (
    <div>
      <div className="aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden mb-4 h-96 relative w-full">
        <GoogleMap
          className="shadow-sm"
          mapContainerStyle={{ height: "100%", width: "100%" }}
          center={{
            lat: property?.location_coordinates.coordinates[0],
            lng: property?.location_coordinates.coordinates[1],
          }}
          zoom={15}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
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
          }}
        >
          <Marker
            position={{
              lat: property?.location_coordinates.coordinates[0],
              lng: property?.location_coordinates.coordinates[1],
            }}
          />
          {directions && <DirectionsRenderer directions={directions} />}
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

        {isCalculatingRoute && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-gray-700">Calculating route...</span>
            </div>
          </div>
        )}
      </div>

      <h4 className="text-xl text-primary my-3 font-medium">Get directions to the property location</h4>
      <div className="mb-4 flex gap-2">
        <div className="flex-1 relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Enter your starting location"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
            disabled={isCalculatingRoute}
          />
        </div>
        <button
          onClick={getCurrentLocation}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isCalculatingRoute}
        >
          <MapPinIcon className="h-5 w-5" />
          <span>Use Current Location</span>
        </button>
      </div>

      <h3 className="text-lg font-semibold mb-2">Location</h3>
      <p className="text-gray-600 mb-2">{property?.location}</p>

      <h3 className="text-lg font-semibold mt-4 mb-2">Address</h3>
      <p className="text-gray-600">{property?.address}</p>
    </div>
  );
} 