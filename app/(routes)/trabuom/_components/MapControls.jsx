import { ZoomIn, ZoomOut, Layers, Maximize, MapPin, RefreshCw, Info } from "lucide-react";

const MapControls = ({
  map,
  mapType,
  isMapTypeMenuOpen,
  setIsMapTypeMenuOpen,
  changeMapType,
  isFullscreen,
  toggleFullscreen,
  fitBoundsToAllParcels,
  tToast
}) => (
  <div
    id="map-controls"
    className="absolute hidden top-4 right-4 bg-white shadow-lg rounded-lg p-2 md:flex flex-col gap-2 z-10"
  >
    {/* Zoom controls */}
    <button
      onClick={() => map && map.setZoom(map.getZoom() + 1)}
      className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
      title="Zoom in"
    >
      <ZoomIn size={20} />
    </button>
    <button
      onClick={() => map && map.setZoom(map.getZoom() - 1)}
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
            className={`px-3 py-2 w-full text-left hover:bg-gray-100 ${mapType === "roadmap" ? "bg-blue-50 text-blue-600" : ""}`}
          >
            Road Map
          </button>
          <button
            onClick={() => changeMapType("satellite")}
            className={`px-3 py-2 w-full text-left hover:bg-gray-100 ${mapType === "satellite" ? "bg-blue-50 text-blue-600" : ""}`}
          >
            Satellite
          </button>
          <button
            onClick={() => changeMapType("hybrid")}
            className={`px-3 py-2 w-full text-left hover:bg-gray-100 ${mapType === "hybrid" ? "bg-blue-50 text-blue-600" : ""}`}
          >
            Hybrid
          </button>
          <button
            onClick={() => changeMapType("terrain")}
            className={`px-3 py-2 w-full text-left hover:bg-gray-100 ${mapType === "terrain" ? "bg-blue-50 text-blue-600" : ""}`}
          >
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
    {/* Fit all parcels */}
    <button
      onClick={fitBoundsToAllParcels}
      className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
      title="Show all plots"
    >
      <MapPin size={20} />
    </button>
    {/* Refresh map */}
    <button
      onClick={() => window.location.reload()}
      className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
      title="Refresh map"
    >
      <RefreshCw size={20} />
    </button>
    {/* Help/Info Button */}
    <button
      onClick={() => tToast.info("Click on any plot to see details and take actions", { duration: 5000 })}
      className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
      title="Help"
    >
      <Info size={20} />
    </button>
  </div>
);

export default MapControls; 