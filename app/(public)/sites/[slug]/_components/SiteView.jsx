"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/utils/supabase/client";
import { MapPin, X, ArrowRight, Loader2, LayoutGrid, Info } from "lucide-react";
import { cn } from "@/lib/utils";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const STATUS_COLOR = {
  Available: "#22c55e",
  AVAILABLE: "#22c55e",
  Reserved: "#f97316",
  RESERVED: "#f97316",
  Sold: "#ef4444",
  SOLD: "#ef4444",
  Hold: "#3b82f6",
  HOLD: "#3b82f6",
};

function plotStatus(plot) {
  return plot.status ?? plot.properties?.status ?? "Available";
}

function isAvailable(plot) {
  return ["Available", "AVAILABLE"].includes(plotStatus(plot));
}

export default function SiteView({ site }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [plots, setPlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("map"); // "map" | "list"
  const [stats, setStats] = useState({ total: 0, available: 0, reserved: 0, sold: 0 });

  useEffect(() => { fetchPlots(); }, [site.table]);

  useEffect(() => {
    if (!plots.length || map.current || view !== "map") return;
    initMap();
    return () => {
      if (map.current) { map.current.remove(); map.current = null; }
    };
  }, [plots, view]);

  const fetchPlots = async () => {
    setLoading(true);
    const { data } = await supabase.from(site.table).select("*");
    const valid = (data ?? []).filter((p) => p.geometry?.coordinates?.length);
    setPlots(valid);
    const s = plotStatus;
    setStats({
      total: valid.length,
      available: valid.filter((p) => ["Available", "AVAILABLE"].includes(s(p))).length,
      reserved: valid.filter((p) => ["Reserved", "RESERVED"].includes(s(p))).length,
      sold: valid.filter((p) => ["Sold", "SOLD"].includes(s(p))).length,
    });
    setLoading(false);
  };

  const initMap = () => {
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      zoom: 14,
    });
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.current.on("load", () => renderPlots());
  };

  const renderPlots = () => {
    if (!map.current || !plots.length) return;

    const geojson = {
      type: "FeatureCollection",
      features: plots.map((p) => ({
        type: "Feature",
        geometry: p.geometry,
        properties: {
          id: p.id,
          status: plotStatus(p),
          plotNo: p.properties?.Plot_No ?? p.id,
          area: p.properties?.Area ?? 0,
          price: p.plotTotalAmount ?? p.properties?.plotAmount ?? 0,
        },
      })),
    };

    // Fit bounds
    const coords = plots.flatMap((p) => p.geometry.coordinates.flat());
    if (coords.length) {
      const lngs = coords.map(([lng]) => lng);
      const lats = coords.map(([, lat]) => lat);
      map.current.fitBounds(
        [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
        { padding: 60 }
      );
    }

    map.current.addSource("plots", { type: "geojson", data: geojson });
    map.current.addLayer({
      id: "plots-fill",
      type: "fill",
      source: "plots",
      paint: {
        "fill-color": [
          "match", ["get", "status"],
          "Available", STATUS_COLOR.Available,
          "AVAILABLE", STATUS_COLOR.Available,
          "Reserved", STATUS_COLOR.Reserved,
          "RESERVED", STATUS_COLOR.Reserved,
          "Sold", STATUS_COLOR.Sold,
          "SOLD", STATUS_COLOR.Sold,
          "#94a3b8",
        ],
        "fill-opacity": ["case", ["==", ["get", "id"], selected?.id ?? ""], 0.9, 0.55],
      },
    });
    map.current.addLayer({
      id: "plots-outline",
      type: "line",
      source: "plots",
      paint: { "line-color": "#fff", "line-width": 1.5 },
    });
    map.current.on("click", "plots-fill", (e) => {
      const { id } = e.features[0].properties;
      setSelected(plots.find((p) => p.id === id) ?? null);
    });
    map.current.on("mouseenter", "plots-fill", () => { map.current.getCanvas().style.cursor = "pointer"; });
    map.current.on("mouseleave", "plots-fill", () => { map.current.getCanvas().style.cursor = ""; });
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      {/* Top bar */}
      <div className="bg-white border-b px-4 sm:px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#05014c] rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 text-sm sm:text-base">{site.name}</h1>
            <p className="text-xs text-gray-400">{site.location}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Stats */}
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <StatPill value={stats.total} label="Total" cls="text-gray-600" />
            <StatPill value={stats.available} label="Available" cls="text-green-600 font-semibold" />
            <StatPill value={stats.reserved} label="Reserved" cls="text-orange-500" />
            <StatPill value={stats.sold} label="Sold" cls="text-red-500" />
          </div>

          {/* Legend */}
          <div className="hidden md:flex items-center gap-3 text-xs text-gray-400 pl-4 border-l">
            <Legend color="bg-green-500" label="Available" />
            <Legend color="bg-orange-400" label="Reserved" />
            <Legend color="bg-red-500" label="Sold" />
          </div>

          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setView("map")}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors", view === "map" ? "bg-white text-[#05014c] shadow-sm" : "text-gray-500 hover:text-gray-700")}
            >
              <MapPin className="w-3.5 h-3.5" /> Map
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors", view === "list" ? "bg-white text-[#05014c] shadow-sm" : "text-gray-500 hover:text-gray-700")}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> List
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-[#05014c] animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading plots…</p>
            </div>
          </div>
        )}

        {/* Map view */}
        {view === "map" && (
          <div className="flex h-full">
            <div ref={mapContainer} className="flex-1" />
            {selected && (
              <PlotPanel plot={selected} siteSlug={site.slug} onClose={() => setSelected(null)} />
            )}
          </div>
        )}

        {/* List view */}
        {view === "list" && !loading && (
          <div className="h-full overflow-y-auto p-4 sm:p-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {plots.map((plot) => (
                  <PlotCard
                    key={plot.id}
                    plot={plot}
                    siteSlug={site.slug}
                    onClick={() => { setSelected(plot); setView("map"); }}
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

function PlotPanel({ plot, siteSlug, onClose }) {
  const props = plot.properties ?? {};
  const status = plotStatus(plot);
  const available = isAvailable(plot);
  const price = plot.plotTotalAmount ?? props.plotAmount ?? 0;
  const area = props.Area ?? props.Shape_Length ?? 0;

  const statusCls = {
    Available: "bg-green-100 text-green-700",
    AVAILABLE: "bg-green-100 text-green-700",
    Reserved: "bg-orange-100 text-orange-700",
    RESERVED: "bg-orange-100 text-orange-700",
    Sold: "bg-red-100 text-red-600",
    SOLD: "bg-red-100 text-red-600",
  }[status] ?? "bg-gray-100 text-gray-600";

  return (
    <div className="w-72 sm:w-80 bg-white border-l shadow-xl flex flex-col flex-shrink-0 z-10">
      {/* Header */}
      <div className="bg-[#05014c] text-white p-4 flex items-start justify-between">
        <div>
          <p className="text-white/50 text-xs mb-0.5">Plot</p>
          <h3 className="font-bold text-lg">No. {props.Plot_No ?? plot.id}</h3>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors mt-0.5">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Details */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full", statusCls)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", available ? "bg-green-500" : status.toLowerCase().includes("reserved") ? "bg-orange-500" : "bg-red-500")} />
          {status}
        </span>

        <div className="space-y-3">
          {props.Street_Nam && <Row label="Street" value={props.Street_Nam} />}
          {area > 0 && <Row label="Size" value={`${parseFloat(area).toFixed(3)} Acres`} />}
          <Row label="Price" value={price ? `GHS ${Number(price).toLocaleString()}` : "Contact us for price"} />
          {props.landUse && <Row label="Land Use" value={props.landUse} />}
        </div>

        {available && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-xs text-blue-700 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              After submitting your details, you will receive bank account information via email.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t space-y-2">
        {available ? (
          <>
            <Link
              href={`/sites/${siteSlug}/plot/${plot.id}/reserve`}
              className="flex items-center justify-center gap-2 w-full bg-[#05014c] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#05014c]/90 transition-colors"
            >
              Reserve Plot <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={`/sites/${siteSlug}/plot/${plot.id}/buy`}
              className="flex items-center justify-center gap-2 w-full bg-orange-400 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-orange-500 transition-colors"
            >
              Buy Plot <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        ) : (
          <p className="text-sm text-center text-gray-400 py-2">This plot is not available.</p>
        )}
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
    <div className={cn("bg-white rounded-2xl border p-4 hover:shadow-md transition-all", available && "hover:border-[#05014c]/20")}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900">Plot No. {props.Plot_No ?? plot.id}</p>
          {props.Street_Nam && <p className="text-xs text-gray-400">{props.Street_Nam}</p>}
        </div>
        <span className={cn(
          "text-xs font-medium px-2.5 py-0.5 rounded-full",
          available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
        )}>
          {status}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm mb-4">
        {area > 0 && <span className="text-gray-500">{parseFloat(area).toFixed(3)} Acres</span>}
        {price > 0 && <span className="font-semibold text-[#05014c]">GHS {Number(price).toLocaleString()}</span>}
      </div>

      {available ? (
        <div className="flex gap-2">
          <Link
            href={`/sites/${siteSlug}/plot/${plot.id}/reserve`}
            className="flex-1 text-center text-xs font-medium bg-[#05014c] text-white py-2 rounded-lg hover:bg-[#05014c]/90 transition-colors"
          >
            Reserve
          </Link>
          <Link
            href={`/sites/${siteSlug}/plot/${plot.id}/buy`}
            className="flex-1 text-center text-xs font-medium bg-orange-400 text-white py-2 rounded-lg hover:bg-orange-500 transition-colors"
          >
            Buy
          </Link>
        </div>
      ) : (
        <button
          onClick={onClick}
          className="w-full text-xs text-gray-400 text-center py-2 rounded-lg border hover:bg-gray-50 transition-colors"
        >
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

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-start text-sm border-b border-gray-50 pb-2.5 last:border-0 last:pb-0">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="font-medium text-gray-800 text-right ml-4 break-words">{value}</span>
    </div>
  );
}
