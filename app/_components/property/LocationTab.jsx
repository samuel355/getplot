import { MapPinIcon } from "@heroicons/react/24/outline";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { useEffect } from "react";

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
      <div className="aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden mb-4 h-80 relative  w-full">
        <GoogleMap
          className="shadow-sm"
          mapContainerStyle={{ height: "100%", width: "100%" }}
          center={{
            lat: property?.location_coordinates.coordinates[0],
            lng: property?.location_coordinates.coordinates[1],
          }}
          zoom={15}
          options={{
            fullscreenControl: false,
            streetViewControl: true,
            mapTypeControl: false,
            zoomControl: true,
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