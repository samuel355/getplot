import { GoogleMap, Polygon } from "@react-google-maps/api";
import MapLegend from "./MapLegend";
import MapControls from "./MapControls";

const containerStyle = {
  height: "90vh",
  width: "100%",
};

const center = {
  lat: 6.5967673180000475,
  lng: -1.7712607859999707,
};

const TrabuomMap = ({
  map,
  setMap,
  mapType,
  polygons,
  handleMapLoad,
  handleBoundsChanged,
  getColorBasedOnStatus,
  handleInfo,
  isMapTypeMenuOpen,
  setIsMapTypeMenuOpen,
  changeMapType,
  isFullscreen,
  toggleFullscreen,
  fitBoundsToAllParcels,
  tToast,
}) => (
  <div className="map-container relative w-full">
    <GoogleMap
      className="relative"
      key={"google-map-1"}
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      onLoad={handleMapLoad}
      onBoundsChanged={handleBoundsChanged}
      options={{
        fullscreenControl: false,
        streetViewControl: true,
        mapTypeControl: false,
        zoomControl: false,
        scrollwheel: true,
        gestureHandling: "greedy",
        mapTypeId: mapType,
      }}
    >
      <MapLegend />
      <MapControls
        map={map}
        mapType={mapType}
        isMapTypeMenuOpen={isMapTypeMenuOpen}
        setIsMapTypeMenuOpen={setIsMapTypeMenuOpen}
        changeMapType={changeMapType}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        fitBoundsToAllParcels={fitBoundsToAllParcels}
        tToast={tToast}
      />
      {polygons.map((polygon, index) => (
        <Polygon
          key={index}
          paths={polygon.geometry.coordinates[0].map(([lng, lat]) => ({
            lat,
            lng,
          }))}
          options={{
            fillColor: getColorBasedOnStatus(polygon.status),
            fillOpacity: 0.9,
            strokeWeight: 1,
            strokeColor: "#000000",
          }}
          onClick={() =>
            handleInfo(
              polygon.geometry?.coordinates[0],
              polygon.properties?.Plot_No,
              polygon.properties?.Street_Nam,
              polygon.id,
              polygon.plotTotalAmount,
              polygon.status,
              polygon
            )
          }
        />
      ))}
    </GoogleMap>
  </div>
);

export default TrabuomMap; 