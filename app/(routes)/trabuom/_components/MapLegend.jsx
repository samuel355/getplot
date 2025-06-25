const MapLegend = () => (
  <div className="absolute w-40 top-20 left-0 bg-white/90 shadow-md rounded-md z-10 hidden md:flex md:flex-col justify-center items-center">
    <div className="p-2 bg-gray-100 font-medium rounded-t-md w-full">
      Land Status
    </div>
    <div className="flex gap-3 w-full items-center pl-2 pt-3">
      <div className="w-4 h-4 bg-green-800 rounded-sm"></div>
      <span>Available</span>
    </div>
    <div className="flex gap-3 w-full items-center pl-2 mt-2">
      <div className="w-4 h-4 bg-black rounded-sm"></div>
      <span>Reserved</span>
    </div>
    <div className="flex gap-3 w-full items-center pl-2 mt-2 pb-3">
      <div className="w-4 h-4 bg-red-600 rounded-sm"></div>
      <span>Sold</span>
    </div>
  </div>
);

export default MapLegend; 