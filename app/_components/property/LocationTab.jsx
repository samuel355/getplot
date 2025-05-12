import { MapPinIcon } from "@heroicons/react/24/outline";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";

export default function LocationTab({ 
  property, 
  directions, 
  startLocation, 
  setStartLocation, 
  searchInputRef, 
  getCurrentLocation 
}) {
  return (
    <div>
      <div className="aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden mb-4 h-80">
        <GoogleMap
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
      </div>

      <div className="mb-4 flex gap-2">
        <div className="flex-1 relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Enter your starting location"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
          />
        </div>
        <button
          onClick={getCurrentLocation}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
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