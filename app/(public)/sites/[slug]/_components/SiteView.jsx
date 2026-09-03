"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, OverlayView, Polygon, useJsApiLoader } from "@react-google-maps/api";
import { useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  HeartHandshake,
  Info,
  LayoutGrid,
  Loader2,
  LocateFixed,
  Layers,
  MapPin,
  Maximize,
  Minimize,
  Pencil,
  Phone,
  RefreshCw,
  SlidersHorizontal,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

const GOOGLE_MAPS_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
  process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

const STATUSES = ["Available", "Reserved", "Sold", "On Hold"];
const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "available", label: "Available" },
  { key: "reserved", label: "Reserved" },
  { key: "sold", label: "Sold" },
  { key: "hold", label: "On Hold" },
];
const CONTACT_PHONE = "+233548554216";
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };
const POPUP_PAN_OFFSET_Y = -170;
const MAP_OPTIONS = {
  clickableIcons: false,
  fullscreenControl: false,
  mapTypeControl: false,
  rotateControl: false,
  scaleControl: true,
  streetViewControl: false,
  zoomControl: false,
  gestureHandling: "greedy",
};

const STATUS_STYLE = {
  available: { fill: "#166534", stroke: "#166534", opacity: 0.35 },
  reserved: { fill: "#171717", stroke: "#171717", opacity: 0.45 },
  sold: { fill: "#dc2626", stroke: "#dc2626", opacity: 0.4 },
  hold: { fill: "#6b7280", stroke: "#6b7280", opacity: 0.45 },
  other: { fill: "#1e3a8a", stroke: "#1e3a8a", opacity: 0.4 },
};

function plotStatus(plot) {
  return plot.status ?? plot.properties?.status ?? "Available";
}

function statusKey(status) {
  const normalized = String(status ?? "").toLowerCase();
  if (!normalized || normalized === "available") return "available";
  if (normalized === "reserved") return "reserved";
  if (normalized === "sold") return "sold";
  if (normalized === "hold" || normalized === "on hold") return "hold";
  return "other";
}

function statusLabel(status) {
  const key = statusKey(status);
  if (key === "hold") return "On Hold";
  if (key === "available") return "Available";
  if (key === "reserved") return "Reserved";
  if (key === "sold") return "Sold";
  return status || "Other";
}

function isAvailable(plot) {
  return statusKey(plotStatus(plot)) === "available";
}

function getPlotStyle(plot) {
  return STATUS_STYLE[statusKey(plotStatus(plot))] ?? STATUS_STYLE.other;
}

function buildPlotStats(items) {
  return {
    total: items.length,
    available: items.filter((plot) => statusKey(plotStatus(plot)) === "available").length,
    reserved: items.filter((plot) => statusKey(plotStatus(plot)) === "reserved").length,
    sold: items.filter((plot) => statusKey(plotStatus(plot)) === "sold").length,
    hold: items.filter((plot) => statusKey(plotStatus(plot)) === "hold").length,
  };
}

function getPolygonPath(plot) {
  const coords = plot.geometry?.coordinates;
  if (!coords?.length) return [];

  if (Array.isArray(coords[0]) && Array.isArray(coords[0][0]) && Array.isArray(coords[0][0][0])) {
    return ringToLatLng(coords[0][0]);
  }

  const ring = coords[0];
  if (!Array.isArray(ring?.[0])) return [];
  return ringToLatLng(ring);
}

function ringToLatLng(ring) {
  return ring
    .filter((coord) => Array.isArray(coord) && coord.length >= 2)
    .map(([lng, lat]) => ({ lat: Number(lat), lng: Number(lng) }))
    .filter((coord) => !Number.isNaN(coord.lat) && !Number.isNaN(coord.lng));
}

function getPolygonCenter(path) {
  if (!path.length) return null;
  const sum = path.reduce(
    (acc, coord) => ({ lat: acc.lat + coord.lat, lng: acc.lng + coord.lng }),
    { lat: 0, lng: 0 },
  );
  return { lat: sum.lat / path.length, lng: sum.lng / path.length };
}

function distanceInFeet(a, b) {
  const radians = (value) => (value * Math.PI) / 180;
  const earthRadiusFeet = 20902231;
  const lat = radians(b.lat - a.lat);
  const lng = radians(b.lng - a.lng);
  const value =
    Math.sin(lat / 2) ** 2 +
    Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(lng / 2) ** 2;
  return earthRadiusFeet * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function getPlotDimensions(plot) {
  const props = plot.properties ?? {};
  const stored = props.Dimensions ?? props.Dimension ?? props.Plot_Size ?? props.Size;
  if (stored) return String(stored).replace(/\s*(ft|feet)?\s*$/i, " feet");

  const path = getPolygonPath(plot);
  if (path.length < 3) return null;
  const edges = path
    .map((point, index) => distanceInFeet(point, path[(index + 1) % path.length]))
    .filter((length) => Number.isFinite(length) && length > 3)
    .sort((a, b) => b - a);
  if (edges.length < 2) return null;

  const longest = edges[0];
  const shorter = edges.find((edge) => edge < longest * 0.9) ?? edges[edges.length - 1];
  return `${Math.round(longest)}x${Math.round(shorter)} feet`;
}

function getPlotAreaAcres(plot) {
  const props = plot.properties ?? {};
  const path = getPolygonPath(plot);
  if (path.length >= 3) {
    const earthRadiusMetres = 6378137;
    const averageLatitude = path.reduce((sum, point) => sum + point.lat, 0) / path.length;
    const latitudeScale = Math.cos((averageLatitude * Math.PI) / 180);
    const points = path.map((point) => ({
      x: earthRadiusMetres * ((point.lng * Math.PI) / 180) * latitudeScale,
      y: earthRadiusMetres * ((point.lat * Math.PI) / 180),
    }));
    const squareMetres = Math.abs(points.reduce((sum, point, index) => {
      const next = points[(index + 1) % points.length];
      return sum + point.x * next.y - next.x * point.y;
    }, 0)) / 2;
    const calculatedAcres = squareMetres / 4046.8564224;
    if (Number.isFinite(calculatedAcres) && calculatedAcres > 0) return calculatedAcres;
  }

  const direct = Number(props.Area ?? props.area ?? plot.Area);
  if (Number.isFinite(direct) && direct > 0) return direct;

  const gisArea = Number(props.SHAPE_Area ?? props.Shape_Area ?? props.shape_area);
  if (Number.isFinite(gisArea) && gisArea > 0) {
    return gisArea * 3109111.525693;
  }
  return null;
}

function fitMapToPlots(map, plots) {
  const allCoords = plots.flatMap(getPolygonPath);
  if (!map || !allCoords.length || !window.google?.maps) return;

  const bounds = new window.google.maps.LatLngBounds();
  allCoords.forEach((coord) => bounds.extend(coord));
  map.fitBounds(bounds, 56);
}

function revealPopupOnMap(map, position) {
  if (!map || !position) return;

  map.panTo(position);
  window.setTimeout(() => {
    map.panBy(0, POPUP_PAN_OFFSET_Y);
  }, 180);
}

export default function SiteView({ site }) {
  const { user } = useUser();
  const mapRef = useRef(null);
  const [plots, setPlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editingPlot, setEditingPlot] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [mapZoom, setMapZoom] = useState(15);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("map");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mapType, setMapType] = useState("hybrid");
  const [isMapTypeMenuOpen, setIsMapTypeMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stats, setStats] = useState({ total: 0, available: 0, reserved: 0, sold: 0, hold: 0 });
  const role = user?.publicMetadata?.role;
  const canManagePlots = ["sysadmin", "admin", "land_manager", "chief", "chief_asst"].includes(role);
  const canEditPlots = role === "sysadmin" || role === "admin";

  const changeMapType = (type) => {
    setMapType(type);
    setIsMapTypeMenuOpen(false);
  };

  const toggleFullscreen = () => {
    const container = document.querySelector(".map-container");
    if (!container) return;
    if (!isFullscreen) {
      (container.requestFullscreen ?? container.webkitRequestFullscreen ?? container.msRequestFullscreen)?.call(container);
      setIsFullscreen(true);
    } else {
      (document.exitFullscreen ?? document.webkitExitFullscreen ?? document.msExitFullscreen)?.call(document);
      setIsFullscreen(false);
    }
  };

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-scripts",
    googleMapsApiKey: GOOGLE_MAPS_KEY ?? "",
  });

  const defaultCenter = useMemo(() => {
    const firstPath = plots.map(getPolygonPath).find((path) => path.length);
    return getPolygonCenter(firstPath ?? []) ?? { lat: 6.6885, lng: -1.6244 };
  }, [plots]);

  const filteredPlots = useMemo(() => {
    if (statusFilter === "all") return plots;
    return plots.filter((plot) => statusKey(plotStatus(plot)) === statusFilter);
  }, [plots, statusFilter]);
  const soldOut = !loading && stats.total > 0 && stats.sold === stats.total;

  useEffect(() => { fetchPlots(); }, [site.table]);

  useEffect(() => {
    if (isLoaded && mapRef.current && plots.length) {
      fitMapToPlots(mapRef.current, plots);
    }
  }, [isLoaded, plots]);

  useEffect(() => {
    const handlePlotActionComplete = (event) => {
      if (event.origin !== window.location.origin || event.data?.type !== "plot-action-complete") return;
      const actionLabels = {
        buy: "Purchase request submitted successfully.",
        reserve: "Reservation request submitted successfully.",
        interest: "Interest submitted successfully.",
      };
      setActionModal(null);
      setSelected(null);
      setPopupPosition(null);
      setEditingPlot(null);
      setIsMapTypeMenuOpen(false);
      toast.success(actionLabels[event.data.action] ?? "Plot request submitted successfully.");
      fetchPlots();
    };

    window.addEventListener("message", handlePlotActionComplete);
    return () => window.removeEventListener("message", handlePlotActionComplete);
  }, [site.table]);

  const fetchPlots = async () => {
    setLoading(true);
    const batchSize = 1000;
    let all = [];
    let from = 0;

    while (true) {
      const { data, error } = await supabase
        .from(site.table)
        .select("*")
        .range(from, from + batchSize - 1);

      if (error || !data?.length) break;
      all = [...all, ...data];
      if (data.length < batchSize) break;
      from += batchSize;
    }

    const valid = all.filter((plot) => getPolygonPath(plot).length >= 3);
    setPlots(valid);
    setStats(buildPlotStats(valid));
    setLoading(false);
  };

  const selectPlot = (plot) => {
    const path = getPolygonPath(plot);
    const center = getPolygonCenter(path);
    setSelected(plot);
    setPopupPosition(center);
    revealPopupOnMap(mapRef.current, center);
  };

  const handlePlotSaved = (plotId, patch) => {
    const nextPlots = plots.map((plot) => plot.id === plotId ? { ...plot, ...patch } : plot);
    setPlots(nextPlots);
    setSelected((plot) => plot?.id === plotId ? { ...plot, ...patch } : plot);
    setStats(buildPlotStats(nextPlots));
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 80px)" }}>
      <div className="bg-white border-b px-4 sm:px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-navy rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-gray-900 text-sm sm:text-base">{site.name}</h1>
              {soldOut && <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-red-700">Sold out</span>}
            </div>
            <p className="text-xs text-gray-400">{site.location}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <StatPill value={stats.total} label="Total" cls="text-gray-600" />
            <StatPill value={stats.available} label="Available" cls="text-green-700 font-semibold" />
            <StatPill value={stats.reserved} label="Reserved" cls="text-black font-semibold" />
            <StatPill value={stats.sold} label="Sold" cls="text-red-600" />
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs text-gray-400 pl-4 border-l">
            <Legend color="bg-green-700" label="Available" />
            <Legend color="bg-black" label="Reserved" />
            <Legend color="bg-red-600" label="Sold" />
            <Legend color="bg-gray-500" label="Hold" />
            <Legend color="bg-blue-900" label="Other" />
          </div>

          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setView("map")}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors", view === "map" ? "bg-white text-brand-navy shadow-sm" : "text-gray-500 hover:text-gray-700")}
            >
              <MapPin className="w-3.5 h-3.5" /> Map
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors", view === "list" ? "bg-white text-brand-navy shadow-sm" : "text-gray-500 hover:text-gray-700")}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> List
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-brand-navy animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading plots...</p>
            </div>
          </div>
        )}

        {view === "map" && (
          <div className="map-container relative h-full">
            {!GOOGLE_MAPS_KEY || loadError ? (
              <MapUnavailable onViewList={() => setView("list")} />
            ) : !isLoaded ? (
              <div className="h-full flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-brand-navy animate-spin" />
              </div>
            ) : (
              <>
                <GoogleMap
                  mapContainerStyle={MAP_CONTAINER_STYLE}
                  center={defaultCenter}
                  zoom={15}
                  options={{ ...MAP_OPTIONS, mapTypeId: mapType }}
                  onLoad={(map) => {
                    mapRef.current = map;
                    fitMapToPlots(map, plots);
                  }}
                  onClick={() => {
                    setSelected(null);
                    setPopupPosition(null);
                  }}
                  onZoomChanged={() => setMapZoom(mapRef.current?.getZoom() ?? 15)}
                >
                  {filteredPlots.map((plot) => {
                    const path = getPolygonPath(plot);
                    const style = getPlotStyle(plot);
                    return (
                      <Polygon
                        key={plot.id}
                        paths={path}
                        options={{
                          fillColor: style.fill,
                          fillOpacity: style.opacity,
                          strokeColor: style.stroke,
                          strokeOpacity: 0.95,
                          strokeWeight: 2,
                          clickable: true,
                          zIndex: selected?.id === plot.id ? 2 : 1,
                        }}
                        onClick={(event) => {
                          event.domEvent?.stopPropagation?.();
                          selectPlot(plot);
                        }}
                      />
                    );
                  })}

                  {mapZoom >= 17.4 && filteredPlots.map((plot) => {
                    const center = getPolygonCenter(getPolygonPath(plot));
                    if (!center) return null;
                    return (
                      <OverlayView key={`label-${plot.id}`} position={center} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            selectPlot(plot);
                          }}
                          className="-translate-x-1/2 -translate-y-1/2 bg-transparent p-0 text-xs font-extrabold leading-none text-white [text-shadow:0_1px_4px_rgba(0,0,0,1)] transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2"
                          title={`Plot ${plot.properties?.Plot_No ?? plot.id}`}
                        >
                          {plot.properties?.Plot_No ?? plot.id}
                        </button>
                      </OverlayView>
                    );
                  })}

                  {selected && popupPosition && (
                    <OverlayView
                      position={popupPosition}
                      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                      <PlotPopup
                        key={selected.id}
                        plot={selected}
                        site={site}
                        canManage={canManagePlots}
                        canEdit={canEditPlots}
                        onClose={() => {
                          setSelected(null);
                          setPopupPosition(null);
                        }}
                        onPlotSaved={handlePlotSaved}
                        onEditPlot={() => setEditingPlot(selected)}
                        onAction={(action) => setActionModal({ action, plot: selected })}
                      />
                    </OverlayView>
                  )}
                </GoogleMap>
                <MapFilterBar
                  active={statusFilter}
                  stats={stats}
                  onChange={(nextFilter) => {
                    setStatusFilter(nextFilter);
                    setSelected(null);
                    setPopupPosition(null);
                  }}
                />
                {soldOut && (
                  <div className="absolute bottom-20 left-1/2 z-10 -translate-x-1/2 rounded-2xl border border-red-200 bg-white/95 px-5 py-3 text-center shadow-elevated backdrop-blur-xl md:bottom-4">
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-red-700">Site sold out</p>
                    <p className="mt-1 text-[11px] text-slate-500">All {stats.total.toLocaleString()} mapped plots have been sold.</p>
                  </div>
                )}
                <MapControls
                  mapType={mapType}
                  isMapTypeMenuOpen={isMapTypeMenuOpen}
                  onToggleMapTypeMenu={() => setIsMapTypeMenuOpen((v) => !v)}
                  onChangeMapType={changeMapType}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={toggleFullscreen}
                  onZoomIn={() => mapRef.current?.setZoom((mapRef.current?.getZoom() ?? 15) + 1)}
                  onZoomOut={() => mapRef.current?.setZoom((mapRef.current?.getZoom() ?? 15) - 1)}
                  onFit={() => fitMapToPlots(mapRef.current, filteredPlots)}
                  onRefresh={fetchPlots}
                  loading={loading}
                />
                <MobileMapControls
                  onZoomIn={() => mapRef.current?.setZoom((mapRef.current?.getZoom() ?? 15) + 1)}
                  onZoomOut={() => mapRef.current?.setZoom((mapRef.current?.getZoom() ?? 15) - 1)}
                  onFit={() => fitMapToPlots(mapRef.current, filteredPlots)}
                  onOpenMapType={() => setIsMapTypeMenuOpen(true)}
                />
                <MobileMapTypeSheet
                  open={isMapTypeMenuOpen}
                  mapType={mapType}
                  onChangeMapType={changeMapType}
                  onClose={() => setIsMapTypeMenuOpen(false)}
                />
              </>
            )}
          </div>
        )}

        {view === "list" && !loading && (
          <div className="h-full overflow-y-auto p-4 sm:p-6">
            <div className="max-w-5xl mx-auto">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Plots</p>
                  <p className="text-xs text-gray-400">
                    Showing {filteredPlots.length.toLocaleString()} of {plots.length.toLocaleString()} plots
                  </p>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-end sm:overflow-visible sm:pb-0">
                  {STATUS_FILTERS.map(({ key, label }) => {
                    const active = statusFilter === key;
                    const count = key === "all" ? stats.total : stats[key] ?? 0;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setStatusFilter(key)}
                        className={cn(
                          "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors",
                          active
                            ? "border-brand-navy bg-brand-navy text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-brand-teal hover:text-brand-navy",
                        )}
                      >
                        {label}
                        <span className={cn("rounded-full px-1.5 py-0.5 text-[10px]", active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500")}>
                          {count.toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlots.map((plot) => (
                  <PlotCard
                    key={plot.id}
                    plot={plot}
                    onClick={() => { selectPlot(plot); setView("map"); }}
                    onAction={(action) => setActionModal({ action, plot })}
                  />
                ))}
              </div>
              {!filteredPlots.length && (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center">
                  <p className="text-sm font-semibold text-slate-700">
                    {statusFilter === "all"
                      ? "No plots found."
                      : `No ${STATUS_FILTERS.find((item) => item.key === statusFilter)?.label.toLowerCase()} plots found.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    className="mt-3 text-xs font-semibold text-brand-navy hover:underline"
                  >
                    Clear filter
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {actionModal && (
          <PlotActionModal
            action={actionModal.action}
            plot={actionModal.plot}
            site={site}
            onClose={() => setActionModal(null)}
          />
        )}
      </div>

      {editingPlot && (
        <PlotEditModal
          plot={editingPlot}
          site={site}
          onClose={() => setEditingPlot(null)}
          onSaved={(patch) => {
            handlePlotSaved(editingPlot.id, patch);
            setEditingPlot(null);
          }}
        />
      )}
    </div>
  );
}

const MAP_TYPES = [
  { value: "roadmap", label: "Road Map" },
  { value: "satellite", label: "Satellite" },
  { value: "hybrid", label: "Hybrid" },
  { value: "terrain", label: "Terrain" },
];

function MapControls({ mapType, isMapTypeMenuOpen, onToggleMapTypeMenu, onChangeMapType, isFullscreen, onToggleFullscreen, onZoomIn, onZoomOut, onFit, onRefresh, loading }) {
  return (
    <div className="absolute right-4 top-4 z-10 hidden flex-col overflow-visible rounded-2xl border border-brand-navy/25 bg-white/95 p-2 shadow-elevated backdrop-blur-xl md:flex">
      <button type="button" onClick={onZoomIn} title="Zoom in" className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-brand-teal/15 transition-colors">
        <ZoomIn className="h-6 w-6 text-brand-navy" />
      </button>
      <button type="button" onClick={onZoomOut} title="Zoom out" className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-brand-teal/15 transition-colors">
        <ZoomOut className="h-6 w-6 text-brand-navy" />
      </button>

      <div className="mx-1 my-1 border-t border-slate-200" />

      <div className="relative">
        <button type="button" onClick={onToggleMapTypeMenu} title="Change map type" className={cn("flex h-11 w-11 items-center justify-center rounded-xl transition-colors hover:bg-brand-teal/15", isMapTypeMenuOpen && "bg-brand-teal/15")}>
          <Layers className="h-6 w-6 text-brand-navy" />
        </button>
        {isMapTypeMenuOpen && (
          <div className="absolute right-full mr-3 top-0 min-w-[150px] overflow-hidden rounded-xl border border-slate-200 bg-white/95 p-1.5 shadow-elevated backdrop-blur-xl">
            {MAP_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onChangeMapType(value)}
                className={cn("w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-brand-teal/10", mapType === value && "bg-brand-navy text-white font-semibold")}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button type="button" onClick={onToggleFullscreen} title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-brand-teal/15 transition-colors">
        {isFullscreen ? <Minimize className="h-6 w-6 text-brand-navy" /> : <Maximize className="h-6 w-6 text-brand-navy" />}
      </button>

      <button type="button" onClick={onFit} title="Fit visible plots" className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-brand-teal/15 transition-colors">
        <LocateFixed className="h-6 w-6 text-brand-navy" />
      </button>

      <button type="button" onClick={onRefresh} title="Refresh plots" className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-brand-teal/15 transition-colors">
        <RefreshCw className={cn("h-6 w-6 text-brand-navy", loading && "animate-spin")} />
      </button>

      <button
        type="button"
        title="Help"
        onClick={() => alert("Click on any plot to see details and take action.")}
        className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-brand-teal/15 transition-colors"
      >
        <Info className="h-6 w-6 text-brand-navy" />
      </button>
    </div>
  );
}

function MapFilterBar({ active, stats, onChange }) {
  return (
    <div className="absolute left-3 right-3 top-3 z-10 flex overflow-x-auto rounded-2xl border border-white/70 bg-white/90 p-1.5 shadow-elevated backdrop-blur-xl md:left-4 md:right-auto md:max-w-[calc(100%-6rem)]">
      {STATUS_FILTERS.map(({ key, label }) => {
        const selected = active === key;
        const count = key === "all" ? stats.total : stats[key] ?? 0;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all",
              selected
                ? "bg-brand-navy text-white shadow-md"
                : "text-slate-600 hover:bg-brand-teal/15 hover:text-brand-navy",
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", {
              "bg-brand-teal": key === "all",
              "bg-green-600": key === "available",
              "bg-neutral-900": key === "reserved",
              "bg-red-600": key === "sold",
              "bg-slate-400": key === "hold",
            })} />
            {label}
            <span className={cn("rounded-full px-1.5 py-0.5 text-[10px]", selected ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500")}>
              {count.toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MobileMapControls({ onZoomIn, onZoomOut, onFit, onOpenMapType }) {
  return (
    <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-around rounded-2xl border border-brand-navy/25 bg-white/95 p-2 shadow-elevated backdrop-blur-xl md:hidden">
      <button type="button" onClick={onZoomIn} className="flex flex-col items-center gap-0.5 rounded-xl p-2 text-brand-navy">
        <ZoomIn size={21} />
        <span className="text-[10px]">Zoom In</span>
      </button>
      <button type="button" onClick={onZoomOut} className="flex flex-col items-center gap-0.5 rounded-xl p-2 text-brand-navy">
        <ZoomOut size={21} />
        <span className="text-[10px]">Zoom Out</span>
      </button>
      <button type="button" onClick={onOpenMapType} className="flex flex-col items-center gap-0.5 rounded-xl p-2 text-brand-navy">
        <Layers size={21} />
        <span className="text-[10px]">Map Type</span>
      </button>
      <button type="button" onClick={onFit} className="flex flex-col items-center gap-0.5 rounded-xl p-2 text-brand-navy">
        <LocateFixed size={21} />
        <span className="text-[10px]">All Plots</span>
      </button>
    </div>
  );
}

function MobileMapTypeSheet({ open, mapType, onChangeMapType, onClose }) {
  if (!open) return null;

  const MAP_TYPE_VISUALS = {
    roadmap: "bg-gray-100",
    satellite: "bg-gray-700",
    hybrid: "bg-gray-800 border border-white",
    terrain: "bg-green-100",
  };

  return (
    <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={onClose}>
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        <h3 className="text-base font-semibold mb-3">Map Type</h3>
        <div className="grid grid-cols-2 gap-2">
          {MAP_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChangeMapType(value)}
              className={cn("p-3 rounded-lg flex flex-col items-center border gap-2 transition-colors", mapType === value ? "border-brand-navy bg-brand-navy/5" : "border-gray-200")}
            >
              <span className="text-sm font-medium">{label}</span>
              <div className={cn("w-10 h-10 rounded-md", MAP_TYPE_VISUALS[value])} />
            </button>
          ))}
        </div>
        <button type="button" onClick={onClose} className="mt-4 w-full p-3 bg-brand-navy text-white rounded-lg font-medium text-sm">
          Close
        </button>
      </div>
    </div>
  );
}

function PlotPopup({ plot, site, canManage, canEdit, onClose, onPlotSaved, onEditPlot, onAction }) {
  const props = plot.properties ?? {};
  const status = plotStatus(plot);
  const available = isAvailable(plot);
  const price = plot.plotTotalAmount ?? props.plotAmount ?? 0;
  const area = getPlotAreaAcres(plot);
  const dimensions = getPlotDimensions(plot);
  const plotNo = props.Plot_No ?? plot.id;
  const [statusValue, setStatusValue] = useState(status);
  const [saving, setSaving] = useState(false);
  const dirty = statusValue !== status;

  useEffect(() => {
    setStatusValue(status);
  }, [status]);

  const stopPopupEvent = (event) => {
    event.stopPropagation?.();
    event.nativeEvent?.stopImmediatePropagation?.();
  };

  const closePopup = (event) => {
    event.preventDefault?.();
    stopPopupEvent(event);
    onClose();
  };

  const saveStatus = async () => {
    setSaving(true);
    const { error } = await supabase.from(site.table).update({ status: statusValue }).eq("id", plot.id);
    setSaving(false);
    if (!error) onPlotSaved(plot.id, { status: statusValue });
  };

  return (
    <div
      className="relative w-[min(272px,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-xl border border-slate-200/80 bg-white shadow-xl"
      onClick={stopPopupEvent}
      onDoubleClick={stopPopupEvent}
      onMouseDown={stopPopupEvent}
      onTouchStart={(event) => event.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2 min-w-0">
          <StatusDot status={status} />
          <span className="text-sm font-semibold text-slate-900 truncate">Plot {plotNo}</span>
          {props.Street_Nam && <span className="truncate text-xs font-bold text-slate-700">{props.Street_Nam}</span>}
        </div>
        <button
          type="button"
          onClick={closePopup}
          onMouseDown={stopPopupEvent}
          aria-label="Close"
          className="ml-2 flex-shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Price + meta */}
      <div className="px-3.5 pt-3 pb-2">
        <p className="text-lg font-bold text-slate-900 leading-none">
          {price ? `GHS ${Number(price).toLocaleString()}` : "—"}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-semibold text-slate-600">
          {area && <span>{area.toFixed(2)} Acres</span>}
          {dimensions && <><span>•</span><span>{dimensions}</span></>}
          {!price && <span className="text-slate-400">Contact team for price</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 gap-1.5 px-3.5 pb-3 pt-1">
        {available && (
          <>
            <button type="button" onClick={() => onAction("buy")} className="group inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-teal px-3 py-2.5 text-xs font-bold text-brand-navy shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#86dadd] hover:shadow-[0_8px_18px_rgba(104,201,205,0.35)] active:translate-y-0">
              Buy this plot <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
            <button type="button" onClick={() => onAction("reserve")} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-navy px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand-navy/90">
              Reserve this plot <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </>
        )}
        <button type="button" onClick={() => onAction("interest")} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50">
          <HeartHandshake className="h-3.5 w-3.5" /> Express interest
        </button>
        <a href={`tel:${CONTACT_PHONE}`} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50">
          <Phone className="h-3.5 w-3.5" /> Call for this plot
        </a>
      </div>

      {/* Admin tools */}
      {canManage && (
        <div className="border-t border-slate-100 px-3.5 py-2.5 space-y-2">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            <SlidersHorizontal className="h-3 w-3" /> Admin
          </p>
          <div className="flex gap-1.5">
            <select value={statusValue} onChange={(e) => setStatusValue(e.target.value)} className="h-7 flex-1 rounded-md border border-slate-200 bg-white px-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-teal">
              {STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <button type="button" onClick={saveStatus} disabled={!dirty || saving} className="h-7 rounded-md bg-brand-navy px-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-navy/90 disabled:opacity-40 disabled:cursor-not-allowed">
              {saving ? "…" : "Save"}
            </button>
          </div>
          {canEdit && (
            <button type="button" onClick={onEditPlot} className="inline-flex w-full items-center justify-center gap-1 rounded-md border border-slate-200 py-1.5 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-50">
              <Pencil className="h-3 w-3" /> Edit plot
            </button>
          )}
        </div>
      )}

      {/* Caret */}
      <span className="absolute left-1/2 top-full h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-slate-200/80 bg-white" />
    </div>
  );
}

function PlotActionModal({ action, plot, site, onClose }) {
  const [frameReady, setFrameReady] = useState(false);
  const plotNo = plot.properties?.Plot_No ?? plot.id;
  const streetName = plot.properties?.Street_Nam ?? plot.properties?.Street_Name;
  const acres = getPlotAreaAcres(plot);
  const dimensions = getPlotDimensions(plot);
  const plotSize = [acres ? `${acres.toFixed(2)} Acres` : null, dimensions].filter(Boolean).join(" • ");
  const labels = {
    buy: "Buy this plot",
    reserve: "Reserve this plot",
    interest: "Express interest",
  };
  const url = `/sites/${site.slug}/plot/${plot.id}/${action}?embedded=1`;

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const prepareEmbeddedPage = (event) => {
    const frameDocument = event.currentTarget.contentDocument;
    if (!frameDocument) return;
    frameDocument.querySelectorAll("header, footer").forEach((element) => {
      element.style.display = "none";
    });
    const main = frameDocument.querySelector("main");
    if (main) main.style.paddingTop = "0";
    frameDocument.querySelectorAll(`a[href="/sites/${site.slug}"]`).forEach((element) => {
      element.style.display = "none";
    });
    setFrameReady(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-navy/65 p-2 backdrop-blur-sm sm:p-5" role="dialog" aria-modal="true" aria-label={`${labels[action]} — Plot ${plotNo}`}>
      <div className="relative flex h-[min(92vh,860px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl">
        <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-5">
          <div>
            <p className="text-sm font-extrabold text-brand-navy">{labels[action]}</p>
            <p className="text-[11px] text-slate-500">
              {site.name} · Plot {plotNo}{streetName ? ` · ${streetName}` : ""}{plotSize ? ` · ${plotSize}` : ""}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900" aria-label="Close and return to map">
            <X className="h-4 w-4" />
          </button>
        </div>
        {!frameReady && (
          <div className="absolute inset-x-0 bottom-0 top-14 z-10 flex items-center justify-center bg-slate-50">
            <Loader2 className="h-7 w-7 animate-spin text-brand-navy" />
          </div>
        )}
        <iframe
          src={url}
          title={`${labels[action]} — Plot ${plotNo}`}
          onLoad={prepareEmbeddedPage}
          className={cn("min-h-0 flex-1 border-0 bg-slate-50 transition-opacity", frameReady ? "opacity-100" : "opacity-0")}
        />
      </div>
    </div>
  );
}

function PlotEditModal({ plot, site, onClose, onSaved }) {
  const props = plot.properties ?? {};
  const initialTotal = Number(plot.plotTotalAmount ?? props.plotAmount ?? 0) || 0;
  const initialPaid = Number(plot.paidAmount ?? 0) || 0;
  const [form, setForm] = useState({
    status: plotStatus(plot),
    plotTotalAmount: initialTotal,
    paidAmount: initialPaid,
    remainingAmount: Number(plot.remainingAmount ?? Math.max(initialTotal - initialPaid, 0)) || 0,
    firstname: plot.firstname ?? "",
    lastname: plot.lastname ?? "",
    email: plot.email ?? "",
    phone: plot.phone ?? "",
    country: plot.country ?? "",
    residentialAddress: plot.residentialAddress ?? "",
    agent: plot.agent ?? "",
    remarks: plot.remarks ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const plotNo = props.Plot_No ?? plot.id;

  const updateField = (name, value) => {
    setError("");
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "plotTotalAmount" || name === "paidAmount") {
        const total = Number(name === "plotTotalAmount" ? value : next.plotTotalAmount) || 0;
        const paid = Number(name === "paidAmount" ? value : next.paidAmount) || 0;
        next.remainingAmount = Math.max(total - paid, 0);
      }
      return next;
    });
  };

  const savePlot = async (event) => {
    event.preventDefault();
    const total = Number(form.plotTotalAmount) || 0;
    const paid = Number(form.paidAmount) || 0;

    if (paid > total) {
      setError("Paid amount cannot be greater than the plot amount.");
      return;
    }

    setSaving(true);
    const payload = {
      status: form.status,
      plotTotalAmount: total,
      paidAmount: paid,
      remainingAmount: Math.max(total - paid, 0),
      firstname: form.firstname.trim(),
      lastname: form.lastname.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      country: form.country.trim(),
      residentialAddress: form.residentialAddress.trim(),
      agent: form.agent.trim(),
      remarks: form.remarks.trim(),
    };

    const { error: saveError } = await supabase
      .from(site.table)
      .update(payload)
      .eq("id", plot.id);

    setSaving(false);
    if (saveError) {
      setError("Could not update this plot. Please try again.");
      return;
    }

    onSaved(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3" onClick={onClose}>
      <form
        onSubmit={savePlot}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
          <div>
            <p className="text-sm font-bold text-slate-900">Edit Plot {plotNo}</p>
            <p className="text-xs text-slate-400">{site.name}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <EditField label="Status">
            <select value={form.status} onChange={(event) => updateField("status", event.target.value)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30">
              {STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </EditField>
          <EditField label="Plot Amount (GHS)">
            <input type="number" min="0" value={form.plotTotalAmount} onChange={(event) => updateField("plotTotalAmount", event.target.value)} className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30" />
          </EditField>
          <EditField label="Paid Amount (GHS)">
            <input type="number" min="0" value={form.paidAmount} onChange={(event) => updateField("paidAmount", event.target.value)} className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30" />
          </EditField>
          <EditField label="Remaining Amount (GHS)">
            <input type="number" value={form.remainingAmount} readOnly className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500" />
          </EditField>
          <EditField label="First Name">
            <input value={form.firstname} onChange={(event) => updateField("firstname", event.target.value)} className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30" />
          </EditField>
          <EditField label="Last Name">
            <input value={form.lastname} onChange={(event) => updateField("lastname", event.target.value)} className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30" />
          </EditField>
          <EditField label="Email">
            <input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30" />
          </EditField>
          <EditField label="Phone">
            <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30" />
          </EditField>
          <EditField label="Country">
            <input value={form.country} onChange={(event) => updateField("country", event.target.value)} className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30" />
          </EditField>
          <EditField label="Agent">
            <input value={form.agent} onChange={(event) => updateField("agent", event.target.value)} className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30" />
          </EditField>
          <EditField label="Residential Address" className="sm:col-span-2">
            <input value={form.residentialAddress} onChange={(event) => updateField("residentialAddress", event.target.value)} className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30" />
          </EditField>
          <EditField label="Remarks" className="sm:col-span-2">
            <textarea value={form.remarks} onChange={(event) => updateField("remarks", event.target.value)} rows={3} className="w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30" />
          </EditField>
        </div>

        {error && <p className="px-4 pb-2 text-sm font-medium text-red-600">{error}</p>}

        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-100 bg-white px-4 py-3">
          <button type="button" onClick={onClose} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="h-10 rounded-lg bg-brand-navy px-4 text-sm font-semibold text-white hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function EditField({ label, className, children }) {
  return (
    <label className={cn("space-y-1.5", className)}>
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function StatusBadge({ status }) {
  const key = statusKey(status);
  const statusCls = {
    available: "bg-green-100 text-green-700",
    reserved: "bg-neutral-100 text-neutral-900",
    sold: "bg-red-100 text-red-600",
    hold: "bg-gray-100 text-gray-600",
    other: "bg-blue-100 text-blue-700",
  }[key];

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", statusCls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabel(status)}
    </span>
  );
}

function StatusDot({ status }) {
  const dotCls = {
    available: "bg-green-500",
    reserved: "bg-neutral-700",
    sold: "bg-red-500",
    hold: "bg-gray-400",
    other: "bg-blue-600",
  }[statusKey(status)] ?? "bg-blue-600";

  return <span className={cn("h-2 w-2 flex-shrink-0 rounded-full", dotCls)} title={status} />;
}

function MapUnavailable({ onViewList }) {
  return (
    <div className="h-full bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-sm rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-navy/5">
          <MapPin className="h-6 w-6 text-brand-navy" />
        </div>
        <h2 className="text-base font-semibold text-gray-900">Map unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Add `NEXT_PUBLIC_GOOGLE_API_KEY` or `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to enable the Google map.
        </p>
        <button type="button" onClick={onViewList} className="mt-5 inline-flex items-center justify-center rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy/90">
          View plot list
        </button>
      </div>
    </div>
  );
}

function PlotCard({ plot, onClick, onAction }) {
  const props = plot.properties ?? {};
  const status = plotStatus(plot);
  const available = isAvailable(plot);
  const price = plot.plotTotalAmount ?? props.plotAmount ?? 0;
  const area = getPlotAreaAcres(plot);

  return (
    <div className={cn("bg-white rounded-lg border p-4 hover:shadow-md transition-all", available && "hover:border-brand-teal/40")}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900">Plot No. {props.Plot_No ?? plot.id}</p>
          {props.Street_Nam && <p className="text-xs font-bold text-slate-700">{props.Street_Nam}</p>}
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex items-center justify-between text-sm mb-4">
        {area && <span className="text-gray-500">{area.toFixed(2)} Acres {getPlotDimensions(plot) ? `• ${getPlotDimensions(plot)}` : ""}</span>}
        {price > 0 && <span className="font-semibold text-brand-navy">GHS {Number(price).toLocaleString()}</span>}
      </div>

      {available ? (
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => onAction("buy")} className="group inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-teal py-2 text-center text-xs font-bold text-brand-navy shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#86dadd] hover:shadow-[0_8px_18px_rgba(104,201,205,0.35)] active:translate-y-0">
            Buy this plot <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
          <button type="button" onClick={() => onAction("reserve")} className="rounded-lg bg-brand-navy py-2 text-center text-xs font-bold text-white hover:bg-brand-navy/90">
            Reserve this plot
          </button>
          <button type="button" onClick={() => onAction("interest")} className="rounded-lg border border-slate-200 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50">
            Express interest
          </button>
          <a href={`tel:${CONTACT_PHONE}`} className="rounded-lg border border-slate-200 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50">
            Call for this plot
          </a>
        </div>
      ) : (
        <button onClick={onClick} className="w-full text-xs text-gray-400 text-center py-2 rounded-lg border hover:bg-gray-50 transition-colors">
          View on map
        </button>
      )}
    </div>
  );
}

function StatPill({ value, label, cls }) {
  return (
    <div className="text-center">
      <span className={cn("font-bold text-base block leading-none", cls)}>{value}</span>
      <span className="text-gray-400">{label}</span>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("w-2.5 h-2.5 rounded-sm flex-shrink-0", color)} />
      {label}
    </div>
  );
}
