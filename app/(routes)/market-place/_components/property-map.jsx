"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import PropertyCard from "./property-card";
import {
  Search,
  ZoomIn,
  ZoomOut,
  Maximize,
  Layers,
  RefreshCw,
  List,
  MapPin,
  X,
  Filter,
  Compass,
  Locate,
  Home,
  Building2,
  Paintbrush,
} from "lucide-react";

const PropertyMap = ({ properties, loading }) => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [mapType, setMapType] = useState("roadmap");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMapTypeMenuOpen, setIsMapTypeMenuOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [selectedPropertyType, setSelectedPropertyType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [showPropertyList, setShowPropertyList] = useState(false);
  const [hoveredProperty, setHoveredProperty] = useState(null);
  const [manuallyPannedTo, setManuallyPannedTo] = useState(null);

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "your-api-key-here",
  });

  // Initialize filtered properties when component mounts
  useEffect(() => {
    if (properties) {
      setFilteredProperties(properties);
    }
  }, [properties]);

  // Apply filters and search
  useEffect(() => {
    if (!properties) return;

    let filtered = [...properties];

    // Filter by property type
    if (selectedPropertyType !== "all") {
      filtered = filtered.filter((p) => p.type === selectedPropertyType);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(query) ||
          p.location?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query),
      );
    }

    setFilteredProperties(filtered);
  }, [properties, selectedPropertyType, searchQuery]);

  // Store map reference once it's loaded
  const onLoad = useCallback(
    (map) => {
      mapRef.current = map;

      // Fit bounds to markers when map loads (only if not manually centered)
      if (properties.length > 0 && !manuallyPannedTo) {
        fitMapToBounds();
      }
    },
    [properties, manuallyPannedTo],
  );

  // Function to fit map to property boundaries
  const fitMapToBounds = useCallback(() => {
    if (!mapRef.current || !filteredProperties.length) return;

    // Don't adjust bounds if we've manually set a property center
    if (manuallyPannedTo) return;

    const bounds = new google.maps.LatLngBounds();
    let hasValidCoords = false;

    filteredProperties.forEach((property) => {
      if (
        property.coordinates &&
        property.coordinates.lat &&
        property.coordinates.lng
      ) {
        bounds.extend({
          lat: property.coordinates.lat,
          lng: property.coordinates.lng,
        });
        hasValidCoords = true;
      }
    });

    if (hasValidCoords) {
      mapRef.current.fitBounds(bounds, 50);

      // Don't zoom in too far on small datasets
      google.maps.event.addListenerOnce(mapRef.current, "idle", () => {
        if (mapRef.current.getZoom() > 16) {
          mapRef.current.setZoom(16);
        }
      });
    }
  }, [filteredProperties, manuallyPannedTo]);

  // Effect to update bounds when filtered properties change, BUT ONLY IF NOT MANUALLY PANNED
  useEffect(() => {
    if (mapRef.current && filteredProperties.length && !manuallyPannedTo) {
      fitMapToBounds();
    }
  }, [filteredProperties, fitMapToBounds, manuallyPannedTo]);

  // Clear the manual pan flag when filters or search changes
  useEffect(() => {
    setManuallyPannedTo(null);
  }, [selectedPropertyType, searchQuery]);

  // Clear reference when map unmounts
  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Calculate the center of all properties or default to Ghana's coordinates
  const defaultCenter = { lat: 5.6037, lng: -0.187 }; // Accra, Ghana

  const getMapCenter = useCallback(() => {
    // If we've manually panned to a property, prioritize that
    if (manuallyPannedTo) {
      return {
        lat: manuallyPannedTo.coordinates.lat,
        lng: manuallyPannedTo.coordinates.lng,
      };
    }

    if (filteredProperties.length === 0) return defaultCenter;

    const validCoordinates = filteredProperties.filter(
      (p) => p.coordinates && p.coordinates.lat && p.coordinates.lng,
    );

    if (validCoordinates.length === 0) return defaultCenter;

    const lats = validCoordinates.map((p) => p.coordinates.lat);
    const lngs = validCoordinates.map((p) => p.coordinates.lng);

    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

    return { lat: centerLat, lng: centerLng };
  }, [filteredProperties, manuallyPannedTo]);

  // Function to handle panning to a specific property
  const panToProperty = useCallback((property) => {
    if (!property || !property.coordinates || !mapRef.current) return;

    // Set this property as our manual center point
    setManuallyPannedTo(property);

    // Pan to the property
    mapRef.current.panTo({
      lat: property.coordinates.lat,
      lng: property.coordinates.lng,
    });

    mapRef.current.setZoom(16);
    setSelectedProperty(property);

    // Prevent any other centering actions for a while
    const listener = google.maps.event.addListenerOnce(
      mapRef.current,
      "idle",
      () => {
        google.maps.event.removeListener(listener);
      },
    );
  }, []);

  // Function to handle marker click
  const handleMarkerClick = useCallback((property) => {
    setManuallyPannedTo(property);
    setSelectedProperty(property);
  }, []);

  // Function to handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;

    if (!isFullscreen) {
      if (mapContainerRef.current.requestFullscreen) {
        mapContainerRef.current.requestFullscreen();
      } else if (mapContainerRef.current.mozRequestFullScreen) {
        mapContainerRef.current.mozRequestFullScreen();
      } else if (mapContainerRef.current.webkitRequestFullscreen) {
        mapContainerRef.current.webkitRequestFullscreen();
      } else if (mapContainerRef.current.msRequestFullscreen) {
        mapContainerRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Function to handle map type change
  const changeMapType = (type) => {
    setMapType(type);
    if (mapRef.current) {
      mapRef.current.setMapTypeId(type);
    }
    setIsMapTypeMenuOpen(false);
  };

  // Handle property type filter change
  const handlePropertyTypeChange = (type) => {
    setSelectedPropertyType(type);
    setIsFilterMenuOpen(false);
    // Clear manual panning when changing filters
    setManuallyPannedTo(null);
  };

  // Get user's current location
  const handleGetUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          if (mapRef.current) {
            mapRef.current.panTo(userLocation);
            mapRef.current.setZoom(14);

            // Add a marker for the user's location
            new google.maps.Marker({
              position: userLocation,
              map: mapRef.current,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#FFFFFF",
                strokeWeight: 2,
              },
              title: "Your Location",
            });
          }
        },
        (error) => {
          console.error("Error getting user location:", error);
          alert(
            "Unable to get your location. Please check your browser permissions.",
          );
        },
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Define map container style
  const mapContainerStyle = {
    height: "100%",
    width: "100%",
  };

  // Enhanced map options for better user experience
  const mapOptions = {
    fullscreenControl: false,
    streetViewControl: true,
    mapTypeControl: false,
    zoomControl: false,
    mapTypeId: mapType,
    controlSize: 32,
    gestureHandling: "greedy",
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

  // Reset map view to show all properties
  const resetMapView = useCallback(() => {
    setManuallyPannedTo(null);
    setSelectedProperty(null);
    fitMapToBounds();
  }, [fitMapToBounds]);

  if (loading) {
    return (
      <div className="bg-gray-200 animate-pulse rounded-lg h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
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
    <div
      ref={mapContainerRef}
      className="flex flex-col h-[800px] bg-white rounded-lg shadow-md overflow-hidden relative"
    >
      {/* Search and filter bar */}
      <div className="flex items-center justify-between p-2 bg-white border-b z-10">
        <div className="relative flex-grow max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center ml-2 space-x-2">
          {/* List view toggle */}
          <button
            onClick={() => setShowPropertyList(!showPropertyList)}
            className={`p-2 rounded ${showPropertyList ? "bg-gray-100" : "hover:bg-gray-100"}`}
            title={
              showPropertyList ? "Hide property list" : "Show property list"
            }
          >
            <List size={20} className="text-gray-600" />
          </button>
          {/* Filter button */}
          <div className="relative">
            <button
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className={`p-2 rounded ${isFilterMenuOpen ? "bg-gray-100" : "hover:bg-gray-100"}`}
              title="Filter properties"
            >
              <Filter size={20} className="text-gray-600" />
            </button>

            {isFilterMenuOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-md shadow-lg border z-50">
                <div className="p-3 border-b">
                  <h3 className="font-medium text-gray-700">
                    Filter Properties
                  </h3>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </p>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm">
                      <input
                        type="radio"
                        name="property-type"
                        checked={selectedPropertyType === "all"}
                        onChange={() => handlePropertyTypeChange("all")}
                        className="mr-2"
                      />
                      All Properties
                    </label>
                    <label className="flex items-center text-sm">
                      <input
                        type="radio"
                        name="property-type"
                        checked={selectedPropertyType === "house"}
                        onChange={() => handlePropertyTypeChange("house")}
                        className="mr-2"
                      />
                      Houses
                    </label>
                    <label className="flex items-center text-sm">
                      <input
                        type="radio"
                        name="property-type"
                        checked={selectedPropertyType === "land"}
                        onChange={() => handlePropertyTypeChange("land")}
                        className="mr-2"
                      />
                      Land
                    </label>
                  </div>
                </div>
                <div className="flex p-3 border-t">
                  <button
                    onClick={() => {
                      setSelectedPropertyType("all");
                      setSearchQuery("");
                      setIsFilterMenuOpen(false);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => setIsFilterMenuOpen(false)}
                    className="ml-auto bg-primary text-white px-3 py-1 rounded-md text-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Property count badge */}
      <div className="absolute top-16 left-3 z-20 bg-white bg-opacity-90 rounded-full px-3 py-1 text-xs shadow-md">
        {filteredProperties.length}{" "}
        {filteredProperties.length === 1 ? "property" : "properties"} found
      </div>

      {/* Main content area - map and optional sidebar */}
      <div className="flex-grow flex relative">
        {/* Property list sidebar - with fixed height and scrollable content */}
        {showPropertyList && (
          <div className="w-80 flex flex-col h-full bg-white border-r z-20 transition-all duration-300 ease-in-out">
            <div className="bg-white p-2 border-b flex justify-between items-center">
              <h3 className="font-medium">Property List</h3>
              <button
                onClick={() => setShowPropertyList(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable property list container */}
            <div className="flex-grow overflow-y-auto">
              {filteredProperties.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No properties match your search criteria
                </div>
              ) : (
                <div className="divide-y">
                  {filteredProperties.map((property) => (
                    <div
                      key={property.id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedProperty?.id === property.id
                          ? "bg-blue-50 border-l-4 border-primary"
                          : ""
                      }`}
                      onClick={() => panToProperty(property)}
                      onMouseEnter={() => setHoveredProperty(property)}
                      onMouseLeave={() => setHoveredProperty(null)}
                    >
                      <div className="flex">
                        <div className="w-20 h-16 bg-gray-200 rounded overflow-hidden mr-3 flex-shrink-0">
                          {property.images && property.images[0] && (
                            <img
                              src={property.images[0]}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {property.title}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {property.location}
                          </p>
                          <p className="text-primary font-semibold text-sm mt-1">
                            ${property.price?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main map area */}
        <div className="flex-grow">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={getMapCenter()}
            zoom={manuallyPannedTo ? 16 : 12}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={mapOptions}
            // Disable auto-panning behavior
            onDragStart={() => {
              // When user manually drags, prevent auto-centering
              if (selectedProperty) {
                setManuallyPannedTo(selectedProperty);
              }
            }}
          >
            {filteredProperties.map(
              (property) =>
                property.coordinates && (
                  <Marker
                    key={property.id}
                    position={{
                      lat: property.coordinates.lat,
                      lng: property.coordinates.lng,
                    }}
                    onClick={() => handleMarkerClick(property)}
                    animation={
                      hoveredProperty?.id === property.id
                        ? google.maps.Animation.BOUNCE
                        : undefined
                    }
                    icon={{
                      url:
                        selectedProperty && selectedProperty.id === property.id
                          ? "/images/marker-active.png"
                          : property.type === "house"
                            ? "/images/marker-house.png"
                            : "/images/marker-land.png",
                      scaledSize: new google.maps.Size(32, 40),
                      origin: new google.maps.Point(0, 0),
                      anchor: new google.maps.Point(16, 40),
                    }}
                    zIndex={
                      selectedProperty && selectedProperty.id === property.id
                        ? 1000
                        : 1
                    }
                  />
                ),
            )}

            {selectedProperty && selectedProperty.coordinates && (
              <InfoWindow
                position={{
                  lat: selectedProperty.coordinates.lat,
                  lng: selectedProperty.coordinates.lng,
                }}
                onCloseClick={() => {
                  setSelectedProperty(null);
                  // Don't reset manuallyPannedTo so the map stays where it is
                }}
                options={{
                  pixelOffset: new google.maps.Size(0, -40),
                  maxWidth: 320,
                }}
              >
                <div className="w-72">
                  <PropertyCard property={selectedProperty} isCompact={true} />
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>

        {/* Custom map controls */}
        <div className="absolute top-4 right-4 bg-white shadow-lg rounded-lg p-2 flex flex-col gap-2 z-20">
          {/* Zoom controls */}
          <button
            onClick={() =>
              mapRef.current &&
              mapRef.current.setZoom(mapRef.current.getZoom() + 1)
            }
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
            title="Zoom in"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={() =>
              mapRef.current &&
              mapRef.current.setZoom(mapRef.current.getZoom() - 1)
            }
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
            title="Zoom out"
          >
            <ZoomOut size={20} />
          </button>

          {/* Separator */}
          <div className="border-t border-gray-200 my-1"></div>

          {/* Map type control */}
          <div className="relative">
            <button
              onClick={() => setIsMapTypeMenuOpen(!isMapTypeMenuOpen)}
              className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
              title="Change map type"
            >
              <Layers size={20} />
            </button>

            {isMapTypeMenuOpen && (
              <div className="absolute right-full mr-2 top-0 bg-white shadow-lg rounded-lg overflow-hidden">
                <button
                  onClick={() => changeMapType("roadmap")}
                  className={`px-3 py-2 w-full text-left hover:bg-gray-100 flex items-center ${mapType === "roadmap" ? "bg-blue-50 text-blue-600" : ""}`}
                >
                  <MapPin className="mr-2" size={16} />
                  Road Map
                </button>
                <button
                  onClick={() => changeMapType("satellite")}
                  className={`px-3 py-2 w-full text-left hover:bg-gray-100 flex items-center ${mapType === "satellite" ? "bg-blue-50 text-blue-600" : ""}`}
                >
                  <Compass className="mr-2" size={16} />
                  Satellite
                </button>
                <button
                  onClick={() => changeMapType("hybrid")}
                  className={`px-3 py-2 w-full text-left hover:bg-gray-100 flex items-center ${mapType === "hybrid" ? "bg-blue-50 text-blue-600" : ""}`}
                >
                  <Building2 className="mr-2" size={16} />
                  Hybrid
                </button>
                <button
                  onClick={() => changeMapType("terrain")}
                  className={`px-3 py-2 w-full text-left hover:bg-gray-100 flex items-center ${mapType === "terrain" ? "bg-blue-50 text-blue-600" : ""}`}
                >
                  <Paintbrush className="mr-2" size={16} />
                  Terrain
                </button>
              </div>
            )}
          </div>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <Maximize size={20} />
          </button>

          {/* Get current location */}
          <button
            onClick={handleGetUserLocation}
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
            title="Show my location"
          >
            <Locate size={20} />
          </button>

          {/* Reset view to all properties */}
          <button
            onClick={resetMapView}
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
            title="View all properties"
          >
            <Home size={20} />
          </button>

          {/* Refresh map */}
          <button
            onClick={() => window.location.reload()}
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
            title="Refresh map"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className="p-3 bg-white border-t flex justify-between items-center text-sm text-gray-600">
        <div>
          <span>
            {filteredProperties.length}{" "}
            {filteredProperties.length === 1 ? "property" : "properties"}
            {selectedPropertyType !== "all" ? ` (${selectedPropertyType})` : ""}
            {searchQuery ? ` matching "${searchQuery}"` : ""}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={resetMapView}
            className="text-primary hover:underline flex items-center gap-1"
          >
            <MapPin size={14} />
            <span>View All</span>
          </button>

          <button
            onClick={() => {
              if (mapRef.current) {
                const currentZoom = mapRef.current.getZoom();
                mapRef.current.setZoom(currentZoom + 1);
              }
            }}
            className="p-1 bg-gray-100 rounded"
            title="Zoom in"
          >
            <ZoomIn size={18} />
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
            <ZoomOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyMap;
