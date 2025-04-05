"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState, useEffect, useRef } from "react";
import { GoogleMap, Marker,StandaloneSearchBox } from "@react-google-maps/api";
import { MapPinIcon, ArrowsPointingOutIcon, MapIcon } from '@heroicons/react/24/outline';

const schema = yup.object().shape({
  location: yup.string().required("Location is required"),
  address: yup.string().required("Address is required"),
});

const libraries = ["places"];

export default function LocationForm({ formData, updateFormData, nextStep, prevStep }) {
  const [mapCenter, setMapCenter] = useState({ lat: 5.6037, lng: -0.1870 }); // Accra, Ghana
  const [markerPosition, setMarkerPosition] = useState(formData.coordinates || null);
  const [mapZoom, setMapZoom] = useState(15);
  const [isMarkerDraggable, setIsMarkerDraggable] = useState(true);
  const [isFindingLocation, setIsFindingLocation] = useState(false);
  
  const searchBoxRef = useRef(null);
  const mapRef = useRef(null);
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: formData
  });
  
  useEffect(() => {
    // Initialize marker position from existing data if available
    if (formData.coordinates) {
      setMarkerPosition(formData.coordinates);
      setMapCenter(formData.coordinates);
    }
  }, [formData.coordinates]);

  const handleMapClick = (event) => {
    const newPosition = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    setMarkerPosition(newPosition);
    
    // Reverse geocode to get address (optional)
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: newPosition }, (results, status) => {
        if (status === "OK" && results[0]) {
          const address = results[0].formatted_address;
          setValue("address", address);
          
          // Extract the locality or area name
          const locality = results[0].address_components.find(
            comp => comp.types.includes("locality") || comp.types.includes("neighborhood")
          );
          if (locality) {
            setValue("location", locality.long_name);
          }
        }
      });
    }
  };
  
  const handlePlacesChanged = () => {
    const places = searchBoxRef.current.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      const newPosition = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      
      setMarkerPosition(newPosition);
      setMapCenter(newPosition);
      setMapZoom(16); // Zoom in when a place is selected
      
      // Update form fields
      setValue("location", place.name);
      setValue("address", place.formatted_address);
    }
  };

  const onSubmit = (data) => {
    if (!markerPosition) {
      alert("Please select a location on the map");
      return;
    }
    
    updateFormData({
      ...data,
      coordinates: markerPosition
    });
    nextStep();
  };

  // Get user's current location
  const handleGetCurrentLocation = () => {
    setIsFindingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setMapCenter(pos);
          setMarkerPosition(pos);
          setMapZoom(18); // Zoom in closer when using current location
          
          // Reverse geocode to get address
          if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: pos }, (results, status) => {
              if (status === "OK" && results[0]) {
                setValue("address", results[0].formatted_address);
                
                // Extract locality or area name
                const locality = results[0].address_components.find(
                  comp => comp.types.includes("locality") || comp.types.includes("neighborhood")
                );
                if (locality) {
                  setValue("location", locality.long_name);
                }
              }
              setIsFindingLocation(false);
            });
          } else {
            setIsFindingLocation(false);
          }
        },
        () => {
          alert("Error: The Geolocation service failed.");
          setIsFindingLocation(false);
        }
      );
    } else {
      alert("Error: Your browser doesn't support geolocation.");
      setIsFindingLocation(false);
    }
  };

  const mapStyles = {
    height: "400px",
    width: "100%"
  };
  
  const onMapLoad = (map) => {
    mapRef.current = map;
  };
  
  const enableMarkerDragging = () => {
    setIsMarkerDraggable(true);
  };
  
  // Center map on marker
  const centerMapOnMarker = () => {
    if (markerPosition && mapRef.current) {
      mapRef.current.panTo(markerPosition);
      setMapZoom(18); // Zoom in
    }
  };

  return (
    <div className="min-h-[600px]">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-xl font-semibold mb-6">Location Information</h2>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">
            Search for Location
          </label>
          <StandaloneSearchBox
            onLoad={ref => searchBoxRef.current = ref}
            onPlacesChanged={handlePlacesChanged}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for an address or location"
                className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </StandaloneSearchBox>
          <p className="text-sm text-gray-500 mt-1">
            Type to search for a location or use the map below to pinpoint the exact property location
          </p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="location" className="block text-gray-700 mb-2 font-medium">
            Location/Area
          </label>
          <input
            id="location"
            {...register("location")}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., East Legon, Accra"
          />
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
        </div>
        
        <div className="mb-6">
          <label htmlFor="address" className="block text-gray-700 mb-2 font-medium">
            Full Address
          </label>
          <textarea
            id="address"
            {...register("address")}
            rows="2"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter the full address of the property"
          ></textarea>
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-gray-700 font-medium">Pin Location on Map</label>
            <div className="flex space-x-2">
              {markerPosition && (
                <button
                  type="button"
                  onClick={centerMapOnMarker}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <ArrowsPointingOutIcon className="h-4 w-4 mr-1" />
                  Zoom to Pin
                </button>
              )}
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isFindingLocation}
                className={`inline-flex items-center text-sm ${
                  isFindingLocation ? "text-gray-400" : "text-blue-600 hover:text-blue-800"
                }`}
              >
                <MapPinIcon className="h-4 w-4 mr-1" />
                {isFindingLocation ? "Finding location..." : "Use My Location"}
              </button>
            </div>
          </div>
          
          <div className="rounded-lg overflow-hidden border border-gray-300 shadow-md">
            <GoogleMap
              mapContainerStyle={mapStyles}
              center={mapCenter}
              zoom={mapZoom}
              onClick={handleMapClick}
              onLoad={onMapLoad}
              options={{
                streetViewControl: false,
                mapTypeControl: true,
                fullscreenControl: true
              }}
            >
              {markerPosition && (
                <Marker
                  position={markerPosition}
                  draggable={isMarkerDraggable}
                  onDragEnd={(e) => {
                    const newPos = {
                      lat: e.latLng.lat(),
                      lng: e.latLng.lng()
                    };
                    setMarkerPosition(newPos);
                    
                    // Optional: Update address via reverse geocoding
                    if (window.google && window.google.maps) {
                      const geocoder = new window.google.maps.Geocoder();
                      geocoder.geocode({ location: newPos }, (results, status) => {
                        if (status === "OK" && results[0]) {
                          setValue("address", results[0].formatted_address);
                        }
                      });
                    }
                  }}
                  animation={window.google?.maps.Animation.DROP}
                />
              )}
            </GoogleMap>
          </div>
          
          <div className="mt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm">
            {markerPosition ? (
              <div className="text-gray-600 mb-2 sm:mb-0">
                <span className="font-medium">Selected coordinates:</span> {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
                <p className="text-xs text-gray-500 mt-1">
                  {isMarkerDraggable ? "You can drag the pin to refine its position" : "Click the map to drop a pin"}
                </p>
              </div>
            ) : (
              <p className="text-amber-600 mb-2 sm:mb-0 flex items-center">
                <MapPinIcon className="h-4 w-4 mr-1" />
                Click on the map to select the property location
              </p>
            )}
            
            {markerPosition && !isMarkerDraggable && (
              <button
                type="button"
                onClick={enableMarkerDragging}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Enable marker dragging
              </button>
            )}
          </div>
        </div>
        
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={prevStep}
            className="border border-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-50 transition duration-300"
          >
            Previous
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Next: Images
          </button>
        </div>
      </form>
    </div>
  );
}