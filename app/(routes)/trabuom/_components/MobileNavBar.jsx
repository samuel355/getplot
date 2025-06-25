import { ZoomIn, ZoomOut, Layers, MapPin } from "lucide-react";

const MobileNavBar = ({ map, setIsMapTypeMenuOpen, isMapTypeMenuOpen, fitBoundsToAllParcels }) => (
  <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-20 flex justify-around items-center py-2 border-t">
    <button
      onClick={() => map && map.setZoom(map.getZoom() + 1)}
      className="p-2 rounded-full flex flex-col items-center text-xs text-gray-700"
    >
      <ZoomIn size={18} />
      <span>Zoom In</span>
    </button>
    <button
      onClick={() => map && map.setZoom(map.getZoom() - 1)}
      className="p-2 rounded-full flex flex-col items-center text-xs text-gray-700"
    >
      <ZoomOut size={18} />
      <span>Zoom Out</span>
    </button>
    <button
      onClick={() => setIsMapTypeMenuOpen(!isMapTypeMenuOpen)}
      className="p-2 rounded-full flex flex-col items-center text-xs text-gray-700"
    >
      <Layers size={18} />
      <span>Map Type</span>
    </button>
    <button
      onClick={fitBoundsToAllParcels}
      className="p-2 rounded-full flex flex-col items-center text-xs text-gray-700"
    >
      <MapPin size={18} />
      <span>All Plots</span>
    </button>
  </div>
);

export default MobileNavBar; 