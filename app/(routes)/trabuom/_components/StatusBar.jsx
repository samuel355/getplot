import { Navigation, MapPin } from "lucide-react";

const StatusBar = ({ polygons, fitBoundsToAllParcels }) => (
  <div className="w-full bg-white shadow-md rounded-md mt-2 p-2 text-sm flex justify-between items-center">
    <div className="flex items-center gap-2">
      <Navigation size={16} className="text-gray-500" />
      <span>Trabuom-Kumasi • {polygons.length || 0} plots shown</span>
    </div>
    <div>
      <button
        onClick={fitBoundsToAllParcels}
        className="text-primary hover:underline flex items-center gap-1"
      >
        <MapPin size={14} />
        <span>View All Plots</span>
      </button>
    </div>
  </div>
);

export default StatusBar; 