"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { DirectionsRenderer, GoogleMap, InfoWindow, OverlayView, useJsApiLoader } from "@react-google-maps/api";
import {
  ArrowRight,
  Bike,
  Car,
  Footprints,
  LayoutGrid,
  List,
  Loader2,
  LocateFixed,
  MapPin,
  Search,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

const GOOGLE_MAPS_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
  process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

const GHANA_CENTER = { lat: 7.9465, lng: -1.0232 };
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };
const MAP_OPTIONS = {
  clickableIcons: false,
  fullscreenControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  zoomControl: false,
  gestureHandling: "greedy",
};

function normalizeStatus(status) {
  const value = String(status || "Available").toLowerCase();
  if (value === "sold") return "sold";
  if (value === "reserved") return "reserved";
  if (value === "hold" || value === "on hold") return "hold";
  return "available";
}

function emptyCounts() {
  return { total: 0, available: 0, reserved: 0, sold: 0, hold: 0 };
}

const TRAVEL_MODES = [
  { mode: "DRIVING", label: "Drive", icon: Car },
  { mode: "WALKING", label: "Walk", icon: Footprints },
  { mode: "BICYCLING", label: "Bike", icon: Bike },
];

function useTravelDirections(origin, destination, enabled) {
  const [state, setState] = useState({ status: "idle", results: null });

  useEffect(() => {
    if (!enabled || !origin || !destination || !window.google?.maps) {
      setState({ status: "idle", results: null });
      return;
    }

    let alive = true;
    setState({ status: "loading", results: null });

    const service = new window.google.maps.DirectionsService();

    Promise.all(
      TRAVEL_MODES.map(
        (travelMode) =>
          new Promise((resolve) => {
            service.route(
              {
                origin,
                destination,
                travelMode: window.google.maps.TravelMode[travelMode.mode],
              },
              (result, status) => {
                const leg = status === "OK" ? result?.routes?.[0]?.legs?.[0] : null;
                if (!leg) return resolve({ ...travelMode, ok: false });
                resolve({
                  ...travelMode,
                  ok: true,
                  duration: leg.duration?.text,
                  distance: leg.distance?.text,
                  route: result,
                });
              },
            );
          }),
      ),
    ).then((results) => {
      if (!alive) return;
      const ok = results.filter((result) => result.ok);
      setState({ status: ok.length ? "ready" : "error", results: ok.length ? ok : null });
    });

    return () => {
      alive = false;
    };
  }, [enabled, origin?.lat, origin?.lng, destination?.lat, destination?.lng]);

  return state;
}

export default function SitesExplorer({ sites }) {
  const mapRef = useRef(null);
  const [view, setView] = useState("map");
  const [query, setQuery] = useState("");
  const [activeSite, setActiveSite] = useState(null);
  const [counts, setCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [travelMode, setTravelMode] = useState("DRIVING");
  const [activeRoute, setActiveRoute] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-scripts",
    googleMapsApiKey: GOOGLE_MAPS_KEY ?? "",
  });

  useEffect(() => {
    let alive = true;

    async function fetchSiteCounts() {
      setLoadingCounts(true);
      const results = await Promise.all(
        sites.map(async (site) => {
          const count = emptyCounts();
          const batchSize = 1000;
          let from = 0;

          while (true) {
            const { data, error } = await supabase
              .from(site.table)
              .select("status")
              .range(from, from + batchSize - 1);

            if (error || !data?.length) break;
            data.forEach((plot) => {
              const key = normalizeStatus(plot.status);
              count.total += 1;
              count[key] += 1;
            });
            if (data.length < batchSize) break;
            from += batchSize;
          }

          return [site.slug, count];
        }),
      );

      if (alive) {
        setCounts(Object.fromEntries(results));
        setLoadingCounts(false);
      }
    }

    fetchSiteCounts();
    return () => {
      alive = false;
    };
  }, [sites]);

  const filteredSites = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return sites;
    return sites.filter((site) =>
      [site.name, site.location, site.description].some((value) =>
        String(value).toLowerCase().includes(term),
      ),
    );
  }, [query, sites]);

  const totals = useMemo(() => {
    return sites.reduce((acc, site) => {
      const siteCounts = counts[site.slug] ?? emptyCounts();
      acc.total += siteCounts.total;
      acc.available += siteCounts.available;
      acc.sold += siteCounts.sold;
      return acc;
    }, { total: 0, available: 0, sold: 0 });
  }, [counts, sites]);

  const fitGhana = () => {
    if (!mapRef.current || !window.google?.maps) return;

    const bounds = new window.google.maps.LatLngBounds();
    sites.forEach((site) => bounds.extend(site.coordinates));
    mapRef.current.fitBounds(bounds, 80);
  };

  const focusSite = (site) => {
    setActiveSite(site);
    setActiveRoute(null);
    setView("map");
    if (!mapRef.current) return;
    mapRef.current.panTo(site.coordinates);
    mapRef.current.setZoom(12);
  };

  useEffect(() => {
    if (view === "map" && activeSite && mapRef.current) {
      mapRef.current.panTo(activeSite.coordinates);
      mapRef.current.setZoom(12);
    }
  }, [activeSite, view]);

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationStatus("granted");
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-navy">
                <MapPin className="h-3.5 w-3.5" />
                Land Locations
              </p>
              <h1 className="mt-4 max-w-3xl text-3xl font-bold text-brand-navy sm:text-4xl">
                Browse all verified land locations
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Compare GetOnePlot sites across Ghana in list or map view, then open a location to inspect its plot boundaries, prices, and availability.
              </p>
            </div>

            <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200 bg-white text-center shadow-sm">
              <SummaryStat label="Sites" value={sites.length} />
              <SummaryStat label="Plots" value={loadingCounts ? "..." : totals.total.toLocaleString()} />
              <SummaryStat label="Available" value={loadingCounts ? "..." : totals.available.toLocaleString()} />
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative block w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by site or city"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
              />
            </label>

            <div className="inline-flex rounded-lg bg-white p-1 shadow-sm">
              <ViewButton active={view === "list"} onClick={() => setView("list")} icon={List}>
                List
              </ViewButton>
              <ViewButton active={view === "map"} onClick={() => setView("map")} icon={LayoutGrid}>
                Map
              </ViewButton>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {view === "list" ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredSites.map((site) => (
              <SiteCard key={site.slug} site={site} counts={counts[site.slug]} loading={loadingCounts} />
            ))}
          </div>
        ) : (
          <div className="grid min-h-[690px] grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[23rem_1fr]">
            <div className="order-2 border-t border-slate-200 bg-white lg:order-1 lg:border-r lg:border-t-0">
              <div className="border-b border-slate-100 px-4 py-4">
                <p className="text-sm font-bold text-slate-900">Locations</p>
                <p className="mt-0.5 text-xs text-slate-400">{filteredSites.length} visible sites on the Ghana map</p>
              </div>
              <div className="max-h-[600px] overflow-y-auto p-3">
                {filteredSites.map((site) => (
                  <button
                    key={site.slug}
                    type="button"
                    onClick={() => focusSite(site)}
                    className={cn(
                      "mb-2 w-full rounded-xl border p-3 text-left transition",
                      activeSite?.slug === site.slug
                        ? "border-brand-teal bg-brand-teal/10 shadow-sm"
                        : "border-slate-200 bg-white hover:border-brand-teal/50 hover:shadow-sm",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-navy text-[10px] font-bold text-white">
                        {site.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className="block text-sm font-semibold text-slate-900">{site.name}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{site.location}</span>
                        </span>
                        <span className="mt-1.5 block text-xs leading-5 text-slate-400">{site.description}</span>
                        <span className="mt-3 grid grid-cols-3 rounded-lg border border-slate-100 bg-white/70 text-center">
                          <MiniCount label="Plots" value={counts[site.slug]?.total} loading={loadingCounts} />
                          <MiniCount label="Avail." value={counts[site.slug]?.available} loading={loadingCounts} />
                          <MiniCount label="Sold" value={counts[site.slug]?.sold} loading={loadingCounts} />
                        </span>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative order-1 min-h-[460px] overflow-hidden bg-slate-100 lg:order-2">
              {!GOOGLE_MAPS_KEY || loadError ? (
                <div className="flex h-full min-h-[420px] items-center justify-center bg-slate-50 p-6 text-center">
                  <div>
                    <MapPin className="mx-auto h-9 w-9 text-brand-navy" />
                    <p className="mt-3 text-sm font-semibold text-slate-800">Map unavailable</p>
                    <p className="mt-1 text-sm text-slate-500">Add Google Maps API key to enable Ghana map view.</p>
                  </div>
                </div>
              ) : !isLoaded ? (
                <div className="flex h-full min-h-[420px] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-navy" />
                </div>
              ) : (
                <GoogleMap
                  mapContainerStyle={MAP_CONTAINER_STYLE}
                  center={GHANA_CENTER}
                  zoom={7}
                  options={MAP_OPTIONS}
                  onLoad={(map) => {
                    mapRef.current = map;
                    window.setTimeout(fitGhana, 150);
                  }}
                >
                  {filteredSites.map((site) => (
                    <OverlayView
                      key={site.slug}
                      position={site.coordinates}
                      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                      <SiteMapPin
                        site={site}
                        active={activeSite?.slug === site.slug}
                        onClick={() => focusSite(site)}
                      />
                    </OverlayView>
                  ))}

                  {userLocation && (
                    <OverlayView position={userLocation} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
                      <UserLocationDot />
                    </OverlayView>
                  )}

                  {activeRoute && (
                    <DirectionsRenderer
                      directions={activeRoute}
                      options={{
                        suppressMarkers: true,
                        preserveViewport: false,
                        polylineOptions: { strokeColor: "#30D5C7", strokeWeight: 5, strokeOpacity: 0.9 },
                      }}
                    />
                  )}

                  {activeSite && (
                    <InfoWindow
                      position={activeSite.coordinates}
                      onCloseClick={() => {
                        setActiveSite(null);
                        setActiveRoute(null);
                      }}
                    >
                      <MapInfo
                        site={activeSite}
                        counts={counts[activeSite.slug]}
                        loading={loadingCounts}
                        userLocation={userLocation}
                        locationStatus={locationStatus}
                        onRequestLocation={requestUserLocation}
                        travelMode={travelMode}
                        onTravelModeChange={setTravelMode}
                        onRouteChange={setActiveRoute}
                      />
                    </InfoWindow>
                  )}
                </GoogleMap>
              )}
              <div className="pointer-events-none absolute left-4 top-4 z-10 hidden rounded-xl border border-white/70 bg-white/90 px-4 py-3 shadow-sm backdrop-blur md:block">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ghana Overview</p>
                <p className="mt-1 text-sm font-bold text-brand-navy">{filteredSites.length} mapped locations</p>
              </div>
              {GOOGLE_MAPS_KEY && !loadError && isLoaded && (
                <MapControls
                  onZoomIn={() => mapRef.current?.setZoom((mapRef.current?.getZoom() ?? 7) + 1)}
                  onZoomOut={() => mapRef.current?.setZoom((mapRef.current?.getZoom() ?? 7) - 1)}
                  onFit={fitGhana}
                />
              )}
            </div>
          </div>
        )}

        {!filteredSites.length && (
          <div className="rounded-lg border border-dashed border-slate-200 bg-white p-10 text-center">
            <p className="text-sm font-semibold text-slate-700">No locations found.</p>
            <button type="button" onClick={() => setQuery("")} className="mt-3 text-sm font-semibold text-brand-navy hover:underline">
              Clear search
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function MapControls({ onZoomIn, onZoomOut, onFit }) {
  return (
    <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
      <button type="button" onClick={onZoomIn} title="Zoom in" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-200/80 hover:bg-gray-100 transition-colors">
        <ZoomIn className="h-5 w-5 text-brand-navy" />
      </button>
      <button type="button" onClick={onZoomOut} title="Zoom out" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-200/80 hover:bg-gray-100 transition-colors">
        <ZoomOut className="h-5 w-5 text-brand-navy" />
      </button>
      <button type="button" onClick={onFit} title="Show all Ghana locations" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-200/80 hover:bg-gray-100 transition-colors">
        <LocateFixed className="h-5 w-5 text-brand-navy" />
      </button>
    </div>
  );
}

function SiteMapPin({ site, active, onClick }) {
  const label = site.name
    .replace(/\([^)]*\)/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group -translate-x-1/2 -translate-y-full rounded-full border bg-white px-2.5 py-1.5 shadow-xl transition hover:-translate-y-[calc(100%+2px)] hover:border-brand-teal",
        active ? "border-brand-teal ring-4 ring-brand-teal/25" : "border-white",
      )}
      title={site.name}
    >
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-brand-teal" />
        <span className="text-[11px] font-bold text-brand-navy">{label}</span>
      </span>
      <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-white bg-white group-hover:border-brand-teal" />
    </button>
  );
}

function SummaryStat({ label, value }) {
  return (
    <div className="min-w-[6.5rem] border-r border-slate-200 px-4 py-3 last:border-r-0">
      <p className="text-lg font-bold text-brand-navy">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

function ViewButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition",
        active ? "bg-white text-brand-navy shadow-sm" : "text-slate-500 hover:text-slate-800",
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function SiteCard({ site, counts, loading }) {
  const safeCounts = counts ?? emptyCounts();

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-teal/60 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy text-white">
          <MapPin className="h-5 w-5" />
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{site.location}</span>
      </div>
      <h2 className="mt-5 text-lg font-bold text-slate-950">{site.name}</h2>
      <p className="mt-2 min-h-10 text-sm leading-6 text-slate-500">{site.description}</p>
      <SiteCounts counts={safeCounts} loading={loading} />
      <Link href={`/sites/${site.slug}`} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-navy/90">
        View plots <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

function MiniCount({ label, value, loading }) {
  return (
    <span className="border-r border-slate-100 px-1.5 py-2 last:border-r-0">
      <span className="block text-[11px] font-bold text-slate-800">{loading ? "..." : (value ?? 0).toLocaleString()}</span>
      <span className="block text-[10px] text-slate-400">{label}</span>
    </span>
  );
}

function SiteCounts({ counts, loading }) {
  const items = [
    ["Plots", counts.total],
    ["Available", counts.available],
    ["Sold", counts.sold],
  ];

  return (
    <div className="mt-5 grid grid-cols-3 rounded-lg border border-slate-100 bg-slate-50 text-center">
      {items.map(([label, value]) => (
        <div key={label} className="border-r border-slate-100 px-2 py-3 last:border-r-0">
          <p className="text-sm font-bold text-slate-900">{loading ? "..." : value.toLocaleString()}</p>
          <p className="mt-0.5 text-[11px] text-slate-400">{label}</p>
        </div>
      ))}
    </div>
  );
}

function MapInfo({
  site,
  counts,
  loading,
  userLocation,
  locationStatus,
  onRequestLocation,
  travelMode,
  onTravelModeChange,
  onRouteChange,
}) {
  return (
    <div className="w-64 p-1">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-navy text-white">
          <MapPin className="h-4 w-4" />
        </span>
        <span>
          <p className="text-sm font-bold text-slate-950">{site.name}</p>
          <p className="text-xs font-medium text-slate-400">{site.location}</p>
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{site.description}</p>
      <div className="mt-3">
        <SiteCounts counts={counts ?? emptyCounts()} loading={loading} />
      </div>
      <DirectionsPanel
        destination={site.coordinates}
        userLocation={userLocation}
        locationStatus={locationStatus}
        onRequestLocation={onRequestLocation}
        travelMode={travelMode}
        onTravelModeChange={onTravelModeChange}
        onRouteChange={onRouteChange}
      />
      <Link href={`/sites/${site.slug}`} className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-brand-navy px-3 py-2 text-xs font-semibold text-white">
        View all plots <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function DirectionsPanel({
  destination,
  userLocation,
  locationStatus,
  onRequestLocation,
  travelMode,
  onTravelModeChange,
  onRouteChange,
}) {
  const { status, results } = useTravelDirections(userLocation, destination, locationStatus === "granted");

  useEffect(() => {
    if (status !== "ready") {
      onRouteChange(null);
      return;
    }
    const match = results.find((result) => result.mode === travelMode) ?? results[0];
    onRouteChange(match?.route ?? null);
  }, [status, results, travelMode]);

  return (
    <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Travel time</p>
        {locationStatus !== "granted" && (
          <button
            type="button"
            onClick={onRequestLocation}
            disabled={locationStatus === "loading"}
            className="text-[11px] font-semibold text-brand-navy hover:underline disabled:opacity-60"
          >
            {locationStatus === "loading" ? "Locating..." : locationStatus === "denied" ? "Retry" : "Use my location"}
          </button>
        )}
      </div>

      {locationStatus === "denied" && (
        <p className="mt-1.5 text-[11px] leading-4 text-slate-400">Enable location access to see the route and travel time.</p>
      )}

      {status === "loading" && (
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
          <Loader2 className="h-3 w-3 animate-spin" /> Calculating route...
        </p>
      )}

      {status === "error" && (
        <p className="mt-1.5 text-[11px] leading-4 text-slate-400">Couldn&apos;t calculate a route right now.</p>
      )}

      {status === "ready" && (
        <div className="mt-1.5 grid grid-cols-3 gap-1.5">
          {results.map((result) => (
            <button
              key={result.mode}
              type="button"
              onClick={() => onTravelModeChange(result.mode)}
              className={cn(
                "rounded-md px-1.5 py-1.5 text-center shadow-sm transition",
                result.mode === travelMode ? "bg-brand-navy text-white" : "bg-white text-slate-900 hover:bg-white/70",
              )}
            >
              <result.icon className={cn("mx-auto h-3.5 w-3.5", result.mode === travelMode ? "text-brand-teal" : "text-brand-navy")} />
              <p className="mt-1 text-[11px] font-bold">{result.duration}</p>
              <p className={cn("text-[9px]", result.mode === travelMode ? "text-white/70" : "text-slate-400")}>{result.distance}</p>
            </button>
          ))}
        </div>
      )}

      {status === "ready" && (
        <p className="mt-2 text-[10px] leading-4 text-slate-400">Route shown on the map above.</p>
      )}
    </div>
  );
}

function UserLocationDot() {
  return (
    <span className="relative flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
      <span className="absolute h-4 w-4 animate-ping rounded-full bg-sky-500/50" />
      <span className="relative h-2.5 w-2.5 rounded-full border-2 border-white bg-sky-500 shadow-md" />
    </span>
  );
}
