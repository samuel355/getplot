"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/utils/supabase/client";
import { MapPin, Layers, Info, X, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const STATUS_COLORS = {
  Available: "#22c55e",
  AVAILABLE: "#22c55e",
  Reserved: "#f97316",
  RESERVED: "#f97316",
  Sold: "#ef4444",
  SOLD: "#ef4444",
  Hold: "#3b82f6",
  HOLD: "#3b82f6",
};

export default function SiteView({ site }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [plots, setPlots] = useState([]);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, available: 0, reserved: 0, sold: 0 });

  useEffect(() => {
    fetchPlots();
  }, [site.table]);

  useEffect(() => {
    if (!plots.length || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      zoom: 15,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      addPlotsToMap();
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [plots]);

  const fetchPlots = async () => {
    setLoading(true);
    const { data, error } = await supabase.from(site.table).select("*");
    if (error) {
      console.error("Error fetching plots:", error);
      setLoading(false);
      return;
    }

    const validPlots = (data || []).filter(
      (p) => p.geometry?.coordinates?.length > 0
    );
    setPlots(validPlots);

    const total = validPlots.length;
    const available = validPlots.filter((p) =>
      ["Available", "AVAILABLE"].includes(p.status ?? p.properties?.status)
    ).length;
    const reserved = validPlots.filter((p) =>
      ["Reserved", "RESERVED"].includes(p.status ?? p.properties?.status)
    ).length;
    const sold = validPlots.filter((p) =>
      ["Sold", "SOLD"].includes(p.status ?? p.properties?.status)
    ).length;

    setStats({ total, available, reserved, sold });
    setLoading(false);
  };

  const addPlotsToMap = () => {
    if (!map.current || !plots.length) return;

    const geojson = {
      type: "FeatureCollection",
      features: plots.map((plot) => ({
        type: "Feature",
        geometry: plot.geometry,
        properties: {
          id: plot.id,
          status: plot.status ?? plot.properties?.status ?? "Available",
          plotNo: plot.properties?.Plot_No ?? plot.id,
          streetName: plot.properties?.Street_Nam ?? "",
          area: plot.properties?.Area ?? plot.properties?.Shape_Length ?? 0,
          price: plot.plotTotalAmount ?? plot.properties?.plotAmount ?? 0,
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
        { padding: 40 }
      );
    }

    map.current.addSource("plots", { type: "geojson", data: geojson });

    map.current.addLayer({
      id: "plots-fill",
      type: "fill",
      source: "plots",
      paint: {
        "fill-color": [
          "match",
          ["get", "status"],
          "Available", STATUS_COLORS.Available,
          "AVAILABLE", STATUS_COLORS.Available,
          "Reserved", STATUS_COLORS.Reserved,
          "RESERVED", STATUS_COLORS.Reserved,
          "Sold", STATUS_COLORS.Sold,
          "SOLD", STATUS_COLORS.Sold,
          "#94a3b8",
        ],
        "fill-opacity": 0.6,
      },
    });

    map.current.addLayer({
      id: "plots-outline",
      type: "line",
      source: "plots",
      paint: {
        "line-color": "#ffffff",
        "line-width": 1.5,
      },
    });

    map.current.on("click", "plots-fill", (e) => {
      const props = e.features[0].properties;
      const raw = plots.find((p) => p.id === props.id);
      setSelectedPlot(raw);
    });

    map.current.on("mouseenter", "plots-fill", () => {
      map.current.getCanvas().style.cursor = "pointer";
    });
    map.current.on("mouseleave", "plots-fill", () => {
      map.current.getCanvas().style.cursor = "";
    });
  };

  const plotStatus = (plot) => plot.status ?? plot.properties?.status ?? "Available";
  const isAvailable = (plot) => ["Available", "AVAILABLE"].includes(plotStatus(plot));

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Site header bar */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-[#05014c]" />
          <div>
            <h1 className="font-semibold text-gray-900">{site.name}</h1>
            <p className="text-xs text-gray-500">{site.location}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <Stat label="Total" value={stats.total} color="text-gray-600" />
          <Stat label="Available" value={stats.available} color="text-green-600" />
          <Stat label="Reserved" value={stats.reserved} color="text-orange-500" />
          <Stat label="Sold" value={stats.sold} color="text-red-500" />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <LegendDot color="bg-green-500" label="Available" />
          <LegendDot color="bg-orange-500" label="Reserved" />
          <LegendDot color="bg-red-500" label="Sold" />
        </div>
      </div>

      {/* Map + panel */}
      <div className="relative flex-1 flex">
        {/* Map */}
        <div ref={mapContainer} className="flex-1" />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <Loader2 className="w-8 h-8 text-[#05014c] animate-spin" />
          </div>
        )}

        {/* Plot detail panel */}
        {selectedPlot && (
          <PlotPanel
            plot={selectedPlot}
            siteSlug={site.slug}
            onClose={() => setSelectedPlot(null)}
            isAvailable={isAvailable(selectedPlot)}
          />
        )}
      </div>
    </div>
  );
}

function PlotPanel({ plot, siteSlug, onClose, isAvailable }) {
  const props = plot.properties ?? {};
  const price = plot.plotTotalAmount ?? props.plotAmount ?? 0;
  const area = props.Area ?? props.Shape_Length ?? 0;
  const plotNo = props.Plot_No ?? plot.id;
  const street = props.Street_Nam ?? "";
  const status = plot.status ?? props.status ?? "Available";

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl border-l flex flex-col z-10">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-[#05014c] text-white">
        <div>
          <p className="text-xs text-white/60">Plot No.</p>
          <h3 className="font-semibold">{plotNo}</h3>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Details */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Status badge */}
        <div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full",
              status === "Available" || status === "AVAILABLE"
                ? "bg-green-100 text-green-700"
                : status === "Reserved" || status === "RESERVED"
                ? "bg-orange-100 text-orange-700"
                : "bg-red-100 text-red-600"
            )}
          >
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              status === "Available" || status === "AVAILABLE" ? "bg-green-500" :
              status === "Reserved" || status === "RESERVED" ? "bg-orange-500" : "bg-red-500"
            )} />
            {status}
          </span>
        </div>

        <DetailRow label="Street" value={street || "—"} />
        <DetailRow label="Size" value={area ? `${parseFloat(area).toFixed(3)} Acres` : "—"} />
        <DetailRow label="Price" value={price ? `GHS ${Number(price).toLocaleString()}` : "Contact us"} />
        {props.landUse && <DetailRow label="Land Use" value={props.landUse} />}
        {props.Remarks && <DetailRow label="Remarks" value={props.Remarks} />}
      </div>

      {/* Actions */}
      {isAvailable ? (
        <div className="p-4 border-t space-y-2">
          <Link
            href={`/sites/${siteSlug}/plot/${plot.id}/reserve`}
            className="flex items-center justify-center gap-2 w-full bg-[#05014c] text-white font-medium py-2.5 rounded-xl hover:bg-[#05014c]/90 transition-colors text-sm"
          >
            Reserve Plot <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={`/sites/${siteSlug}/plot/${plot.id}/buy`}
            className="flex items-center justify-center gap-2 w-full bg-orange-400 text-white font-medium py-2.5 rounded-xl hover:bg-orange-500 transition-colors text-sm"
          >
            Buy Plot <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="p-4 border-t">
          <p className="text-sm text-gray-500 text-center">This plot is not available.</p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="text-center">
      <p className={cn("font-bold text-lg leading-none", color)}>{value}</p>
      <p className="text-gray-400 text-xs">{label}</p>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1">
      <span className={cn("w-2.5 h-2.5 rounded-sm", color)} />
      {label}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-800 text-right max-w-[60%]">{value}</span>
    </div>
  );
}
