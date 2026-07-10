"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GoogleMap, InfoWindow, Marker, useJsApiLoader } from "@react-google-maps/api";
import { ArrowRight, LayoutGrid, List, Loader2, MapPin, Search } from "lucide-react";
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
  zoomControl: true,
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

export default function SitesExplorer({ sites }) {
  const [view, setView] = useState("list");
  const [query, setQuery] = useState("");
  const [activeSite, setActiveSite] = useState(null);
  const [counts, setCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(true);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "site-locations-map",
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

  return (
    <div>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-teal">Land Locations</p>
              <h1 className="mt-3 text-3xl font-bold text-brand-navy sm:text-4xl">
                Browse all verified land locations
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Compare GetOnePlot sites across Ghana in list or map view, then open a location to inspect its plot boundaries, prices, and availability.
              </p>
            </div>

            <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-slate-200 bg-white text-center shadow-sm">
              <SummaryStat label="Sites" value={sites.length} />
              <SummaryStat label="Plots" value={loadingCounts ? "..." : totals.total.toLocaleString()} />
              <SummaryStat label="Available" value={loadingCounts ? "..." : totals.available.toLocaleString()} />
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative block w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by site or city"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
              />
            </label>

            <div className="inline-flex rounded-lg bg-slate-100 p-1">
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredSites.map((site) => (
              <SiteCard key={site.slug} site={site} counts={counts[site.slug]} loading={loadingCounts} />
            ))}
          </div>
        ) : (
          <div className="grid min-h-[640px] grid-cols-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[1fr_22rem]">
            <div className="min-h-[420px]">
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
                >
                  {filteredSites.map((site) => (
                    <Marker
                      key={site.slug}
                      position={site.coordinates}
                      title={site.name}
                      onClick={() => setActiveSite(site)}
                    />
                  ))}

                  {activeSite && (
                    <InfoWindow
                      position={activeSite.coordinates}
                      onCloseClick={() => setActiveSite(null)}
                    >
                      <MapInfo site={activeSite} counts={counts[activeSite.slug]} loading={loadingCounts} />
                    </InfoWindow>
                  )}
                </GoogleMap>
              )}
            </div>

            <div className="border-t border-slate-200 lg:border-l lg:border-t-0">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">Locations on map</p>
                <p className="text-xs text-slate-400">{filteredSites.length} visible sites</p>
              </div>
              <div className="max-h-[560px] overflow-y-auto p-3">
                {filteredSites.map((site) => (
                  <button
                    key={site.slug}
                    type="button"
                    onClick={() => setActiveSite(site)}
                    className={cn(
                      "mb-2 w-full rounded-lg border p-3 text-left transition",
                      activeSite?.slug === site.slug
                        ? "border-brand-teal bg-brand-teal/10"
                        : "border-slate-200 bg-white hover:border-brand-teal/50",
                    )}
                  >
                    <p className="text-sm font-semibold text-slate-900">{site.name}</p>
                    <p className="text-xs text-slate-500">{site.location}</p>
                    <p className="mt-2 text-xs text-slate-400">{site.description}</p>
                  </button>
                ))}
              </div>
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
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-teal/60 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-navy text-white">
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

function MapInfo({ site, counts, loading }) {
  return (
    <div className="w-56 p-1">
      <p className="text-sm font-bold text-slate-950">{site.name}</p>
      <p className="mt-1 text-xs text-slate-500">{site.description}</p>
      <div className="mt-3">
        <SiteCounts counts={counts ?? emptyCounts()} loading={loading} />
      </div>
      <Link href={`/sites/${site.slug}`} className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-brand-navy px-3 py-2 text-xs font-semibold text-white">
        View all plots
      </Link>
    </div>
  );
}
