"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { GoogleMap, OverlayView, Polygon, useJsApiLoader } from "@react-google-maps/api";
import { useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  HeartHandshake,
  LayoutGrid,
  Loader2,
  LocateFixed,
  Layers,
  MapPin,
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

const GOOGLE_MAPS_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
  process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

const STATUSES = ["Available", "Reserved", "Sold", "Hold"];
const CONTACT_PHONE = "+233548554216";
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };
const POPUP_PAN_OFFSET_Y = -170;
const MAP_OPTIONS = {
  clickableIcons: false,
  fullscreenControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  zoomControl: false,
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

function isAvailable(plot) {
  return statusKey(plotStatus(plot)) === "available";
}

function getPlotStyle(plot) {
  return STATUS_STYLE[statusKey(plotStatus(plot))] ?? STATUS_STYLE.other;
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
  const [popupPosition, setPopupPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("map");
  const [mapType, setMapType] = useState("satellite");
  const [stats, setStats] = useState({ total: 0, available: 0, reserved: 0, sold: 0 });
  const role = user?.publicMetadata?.role;
  const canManagePlots = role === "sysadmin" || role === "land_manager";
  const canEditPlots = role === "sysadmin";

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-scripts",
    googleMapsApiKey: GOOGLE_MAPS_KEY ?? "",
  });

  const defaultCenter = useMemo(() => {
    const firstPath = plots.map(getPolygonPath).find((path) => path.length);
    return getPolygonCenter(firstPath ?? []) ?? { lat: 6.6885, lng: -1.6244 };
  }, [plots]);

  useEffect(() => { fetchPlots(); }, [site.table]);

  useEffect(() => {
    if (isLoaded && mapRef.current && plots.length) {
      fitMapToPlots(mapRef.current, plots);
    }
  }, [isLoaded, plots]);

  const fetchPlots = async () => {
    setLoading(true);
    const { data } = await supabase.from(site.table).select("*");
    const valid = (data ?? []).filter((plot) => getPolygonPath(plot).length >= 3);
    setPlots(valid);
    setStats({
      total: valid.length,
      available: valid.filter((plot) => statusKey(plotStatus(plot)) === "available").length,
      reserved: valid.filter((plot) => statusKey(plotStatus(plot)) === "reserved").length,
      sold: valid.filter((plot) => statusKey(plotStatus(plot)) === "sold").length,
    });
    setLoading(false);
  };

  const selectPlot = (plot) => {
    const path = getPolygonPath(plot);
    const center = getPolygonCenter(path);
    setSelected(plot);
    setPopupPosition(center);
    revealPopupOnMap(mapRef.current, center);
  };

  const handleStatusSaved = (plotId, status) => {
    const nextPlots = plots.map((plot) => plot.id === plotId ? { ...plot, status } : plot);
    setPlots(nextPlots);
    setSelected((plot) => plot?.id === plotId ? { ...plot, status } : plot);
    setStats((current) => ({
      ...current,
      available: nextPlots.filter((plot) => statusKey(plotStatus(plot)) === "available").length,
      reserved: nextPlots.filter((plot) => statusKey(plotStatus(plot)) === "reserved").length,
      sold: nextPlots.filter((plot) => statusKey(plotStatus(plot)) === "sold").length,
    }));
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 80px)" }}>
      <div className="bg-white border-b px-4 sm:px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-navy rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 text-sm sm:text-base">{site.name}</h1>
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
          <div className="relative h-full">
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
                >
                  {plots.map((plot) => {
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
                        onStatusSaved={handleStatusSaved}
                      />
                    </OverlayView>
                  )}
                </GoogleMap>
                <MapControls
                  mapType={mapType}
                  onToggleMapType={() => setMapType((type) => type === "satellite" ? "roadmap" : "satellite")}
                  onZoomIn={() => mapRef.current?.setZoom((mapRef.current?.getZoom() ?? 15) + 1)}
                  onZoomOut={() => mapRef.current?.setZoom((mapRef.current?.getZoom() ?? 15) - 1)}
                  onFit={() => fitMapToPlots(mapRef.current, plots)}
                  onRefresh={fetchPlots}
                  loading={loading}
                />
              </>
            )}
          </div>
        )}

        {view === "list" && !loading && (
          <div className="h-full overflow-y-auto p-4 sm:p-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {plots.map((plot) => (
                  <PlotCard
                    key={plot.id}
                    plot={plot}
                    siteSlug={site.slug}
                    onClick={() => { selectPlot(plot); setView("map"); }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MapControls({ mapType, onToggleMapType, onZoomIn, onZoomOut, onFit, onRefresh, loading }) {
  return (
    <div className="absolute right-4 top-4 z-10 flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
      <MapControlButton label="Zoom in" onClick={onZoomIn} icon={ZoomIn} />
      <MapControlButton label="Zoom out" onClick={onZoomOut} icon={ZoomOut} />
      <MapControlButton label="Fit plots" onClick={onFit} icon={LocateFixed} />
      <MapControlButton label={mapType === "satellite" ? "Roadmap" : "Satellite"} onClick={onToggleMapType} icon={Layers} />
      <MapControlButton label="Refresh plots" onClick={onRefresh} icon={RefreshCw} loading={loading} />
    </div>
  );
}

function MapControlButton({ label, onClick, icon: Icon, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center border-b border-slate-100 text-brand-navy transition-colors last:border-b-0 hover:bg-slate-50"
    >
      <Icon className={cn("h-4 w-4", loading && "animate-spin")} />
    </button>
  );
}

function PlotPopup({ plot, site, canManage, canEdit, onClose, onStatusSaved }) {
  const props = plot.properties ?? {};
  const status = plotStatus(plot);
  const available = isAvailable(plot);
  const price = plot.plotTotalAmount ?? props.plotAmount ?? 0;
  const area = props.Area ?? props.Shape_Length ?? 0;
  const plotNo = props.Plot_No ?? plot.id;
  const [statusValue, setStatusValue] = useState(status);
  const [saving, setSaving] = useState(false);
  const dirty = statusValue !== status;

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
    if (!error) onStatusSaved(plot.id, statusValue);
  };

  return (
    <div
      className="relative w-[min(23rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-[calc(100%+14px)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl"
      onClick={stopPopupEvent}
      onDoubleClick={stopPopupEvent}
      onMouseDown={stopPopupEvent}
      onTouchStart={(event) => event.stopPropagation()}
    >
      <div className="bg-brand-navy p-4 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-teal">Selected plot</p>
            <h3 className="mt-1 text-2xl font-bold leading-tight">Plot {plotNo}</h3>
            {props.Street_Nam && <p className="mt-1 text-sm text-white/60">{props.Street_Nam}</p>}
          </div>
          <button
            type="button"
            onClick={closePopup}
            onMouseDown={stopPopupEvent}
            aria-label="Close plot details"
            className="rounded-md p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusBadge status={status} />
          {area > 0 && <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/75">{parseFloat(area).toFixed(3)} Acres</span>}
          {props.landUse && <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/75">{props.landUse}</span>}
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Plot price</p>
          <p className="mt-1 text-2xl font-bold text-brand-navy">{price ? `GHS ${Number(price).toLocaleString()}` : "Contact us"}</p>
          <p className="mt-1 text-xs text-slate-500">Pricing and availability are confirmed by the land team.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <PopupFact label="Plot ID" value={plotNo} />
          {area > 0 && <PopupFact label="Size" value={`${parseFloat(area).toFixed(3)} Acres`} />}
          {props.landUse && <PopupFact label="Land Use" value={props.landUse} />}
          {plot.firstname && <PopupFact label="Client" value={`${plot.firstname} ${plot.lastname ?? ""}`} />}
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
          {available && (
            <>
              <Link href={`/sites/${site.slug}/plot/${plot.id}/reserve`} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-navy px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-navy/90">
                Reserve <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href={`/sites/${site.slug}/plot/${plot.id}/buy`} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-teal px-3 py-2 text-xs font-semibold text-brand-navy transition-colors hover:bg-brand-teal/90">
                Buy <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
          <Link href={`/contact?plot=${encodeURIComponent(plotNo)}&site=${encodeURIComponent(site.name)}`} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-brand-navy transition-colors hover:bg-slate-50">
            <HeartHandshake className="h-3.5 w-3.5" /> Express interest
          </Link>
          <a href={`tel:${CONTACT_PHONE}`} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-brand-navy transition-colors hover:bg-slate-50">
            <Phone className="h-3.5 w-3.5" /> Call for info
          </a>
        </div>

        {canManage && (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-navy">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Admin tools
            </div>
            <div className="flex items-center gap-2">
              <select value={statusValue} onChange={(event) => setStatusValue(event.target.value)} className="h-9 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-teal">
                {STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <button type="button" onClick={saveStatus} disabled={!dirty || saving} className="h-9 rounded-lg bg-brand-navy px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-40">
                {saving ? "Saving" : "Save"}
              </button>
            </div>
            {canEdit && (
              <Link href={`/dashboard/edit-plot/${plot.id}?table=${site.table}&slug=${site.slug}`} className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-brand-navy transition-colors hover:bg-slate-50">
                <Pencil className="h-3.5 w-3.5" /> Edit plot
              </Link>
            )}
          </div>
        )}
      </div>
      <span className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-slate-200 bg-white" />
    </div>
  );
}

function PopupFact({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
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
      {status}
    </span>
  );
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

function PlotCard({ plot, siteSlug, onClick }) {
  const props = plot.properties ?? {};
  const status = plotStatus(plot);
  const available = isAvailable(plot);
  const price = plot.plotTotalAmount ?? props.plotAmount ?? 0;
  const area = props.Area ?? 0;

  return (
    <div className={cn("bg-white rounded-lg border p-4 hover:shadow-md transition-all", available && "hover:border-brand-teal/40")}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900">Plot No. {props.Plot_No ?? plot.id}</p>
          {props.Street_Nam && <p className="text-xs text-gray-400">{props.Street_Nam}</p>}
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex items-center justify-between text-sm mb-4">
        {area > 0 && <span className="text-gray-500">{parseFloat(area).toFixed(3)} Acres</span>}
        {price > 0 && <span className="font-semibold text-brand-navy">GHS {Number(price).toLocaleString()}</span>}
      </div>

      {available ? (
        <div className="flex gap-2">
          <Link href={`/sites/${siteSlug}/plot/${plot.id}/reserve`} className="flex-1 text-center text-xs font-medium bg-brand-navy text-white py-2 rounded-lg hover:bg-brand-navy/90 transition-colors">
            Reserve
          </Link>
          <Link href={`/sites/${siteSlug}/plot/${plot.id}/buy`} className="flex-1 text-center text-xs font-medium bg-brand-teal text-brand-navy py-2 rounded-lg hover:bg-brand-teal/90 transition-colors">
            Buy
          </Link>
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
