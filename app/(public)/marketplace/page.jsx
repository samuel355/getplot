"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { GoogleMap, InfoWindow, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import {
  Bath,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Filter,
  Home,
  Layers,
  LayoutGrid,
  List,
  Loader2,
  LocateFixed,
  Map,
  MapPin,
  RefreshCw,
  Ruler,
  Search,
  SlidersHorizontal,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const GOOGLE_MAPS_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
  process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

const PROPERTY_TYPES = [
  { label: "All", value: "all" },
  { label: "House", value: "house" },
  { label: "Land", value: "land" },
  { label: "Apartment", value: "apartment" },
];

const LISTING_TYPES = [
  { label: "All", value: "all" },
  { label: "For Sale", value: "sale" },
  { label: "For Rent", value: "rent" },
  { label: "Short-term", value: "airbnb" },
];

const REGIONS = [
  "all",
  "Ahafo",
  "Ashanti",
  "Bono",
  "Bono East",
  "Central",
  "Eastern",
  "Greater Accra",
  "North East",
  "Northern",
  "Oti",
  "Savannah",
  "Upper East",
  "Upper West",
  "Volta",
  "Western",
  "Western North",
];

const ROOM_OPTIONS = ["any", "1", "2", "3", "4", "5"];
const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price low", value: "price-low" },
  { label: "Price high", value: "price-high" },
];

const REGION_COORDS = {
  "Greater Accra": { lat: 5.6037, lng: -0.187 },
  Ashanti: { lat: 6.6885, lng: -1.6244 },
  Eastern: { lat: 6.0833, lng: -0.25 },
  Central: { lat: 5.55, lng: -1.0 },
  Western: { lat: 5.0, lng: -2.5 },
  "Western North": { lat: 6.2, lng: -2.85 },
  Volta: { lat: 6.6, lng: 0.45 },
  Oti: { lat: 7.9, lng: 0.3 },
  Northern: { lat: 9.4, lng: -0.84 },
  "North East": { lat: 10.35, lng: -0.8 },
  Savannah: { lat: 9.0, lng: -1.8 },
  "Upper East": { lat: 10.78, lng: -0.85 },
  "Upper West": { lat: 10.25, lng: -2.25 },
  Bono: { lat: 7.95, lng: -2.35 },
  "Bono East": { lat: 7.75, lng: -1.05 },
  Ahafo: { lat: 7.0, lng: -2.6 },
};

const DEFAULT_FILTERS = {
  propertyType: "all",
  listingType: "all",
  region: "all",
  bedrooms: "any",
  bathrooms: "any",
  minPrice: "",
  maxPrice: "",
  sortBy: "newest",
};

const MAP_STYLE = { width: "100%", height: "100%" };
const MAP_OPTIONS = {
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  clickableIcons: false,
  zoomControl: false,
};

function priceOf(property) {
  return property.listing_type === "rent" || property.listing_type === "airbnb"
    ? property.rental_price
    : property.price;
}

function formatPrice(property) {
  const price = priceOf(property);
  return price ? `GHS ${Number(price).toLocaleString()}` : "Contact for price";
}

function firstImage(images) {
  if (Array.isArray(images)) return images[0];
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed[0] : images;
    } catch {
      return images;
    }
  }
  return null;
}

function parseCoordinates(property, index = 0) {
  const raw = property.location_coordinates;
  let coords = raw;
  if (typeof raw === "string") {
    try {
      coords = JSON.parse(raw);
    } catch {
      coords = null;
    }
  }

  if (coords?.lat && coords?.lng) return { lat: Number(coords.lat), lng: Number(coords.lng) };
  if (coords?.latitude && coords?.longitude) return { lat: Number(coords.latitude), lng: Number(coords.longitude) };
  if (coords?.type === "Point" && Array.isArray(coords.coordinates)) {
    const parsed = pointArrayToLatLng(coords.coordinates);
    if (parsed) return parsed;
  }
  if (Array.isArray(coords) && coords.length >= 2) {
    const parsed = pointArrayToLatLng(coords);
    if (parsed) return parsed;
  }

  const fallback = REGION_COORDS[property.region] ?? REGION_COORDS[property.location] ?? { lat: 7.9465, lng: -1.0232 };
  const offset = (index % 9) * 0.012;
  return { lat: fallback.lat + offset, lng: fallback.lng + offset };
}

function pointArrayToLatLng(point) {
  const first = Number(point[0]);
  const second = Number(point[1]);
  if (Number.isNaN(first) || Number.isNaN(second)) return null;

  // Current Ghana property rows store [lat, lng], even when wrapped as GeoJSON Point.
  if (first >= 4 && first <= 12 && second >= -4 && second <= 2) {
    return { lat: first, lng: second };
  }
  return { lat: second, lng: first };
}

function fitPropertiesOnMap(map, properties) {
  if (!map || !properties.length || !window.google?.maps) return;

  const bounds = new window.google.maps.LatLngBounds();
  properties.forEach((property, index) => bounds.extend(parseCoordinates(property, index)));
  map.fitBounds(bounds, 64);
}

function marketplaceMarkerIcon(property, active) {
  if (!window.google?.maps) return undefined;

  const type = String(property.type ?? property.property_type ?? "").toLowerCase();
  const isLand = type.includes("land");
  const size = active ? 54 : 44;

  return {
    url: isLand ? "/images/marker-land.png" : "/images/marker-house.png",
    scaledSize: new window.google.maps.Size(size, size),
    anchor: new window.google.maps.Point(size / 2, size),
  };
}

export default function MarketplacePage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [properties, setProperties] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const { isLoaded: mapLoaded } = useJsApiLoader({
    id: "google-map-scripts",
    googleMapsApiKey: GOOGLE_MAPS_KEY ?? "",
  });

  const mapCenter = useMemo(() => {
    if (properties.length) return parseCoordinates(properties[0], 0);
    return { lat: 7.9465, lng: -1.0232 };
  }, [properties]);

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "sortBy") return value !== "newest";
    if (key === "minPrice" || key === "maxPrice") return Boolean(value);
    return value !== DEFAULT_FILTERS[key];
  }).length;

  useEffect(() => {
    fetchProperties(page);
  }, [page, filters]);

  async function fetchProperties(nextPage) {
    setLoading(true);
    const params = new URLSearchParams({
      limit: String(pageSize),
      page: String(nextPage),
      type: filters.propertyType,
      listing_type: filters.listingType,
      region: filters.region,
      min_price: filters.minPrice || "0",
      max_price: filters.maxPrice || "10000000",
      sort_by: filters.sortBy,
      bedrooms: filters.bedrooms,
      bathrooms: filters.bathrooms,
    });

    const res = await fetch(`/api/properties/list?${params.toString()}`, { cache: "no-store" });
    const json = await res.json();
    setProperties(json.data ?? []);
    setTotal(json.total ?? 0);
    setLoading(false);
  }

  function updateFilter(key, value) {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function resetFilters() {
    setPage(1);
    setFilters(DEFAULT_FILTERS);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-teal">Marketplace</p>
              <h1 className="mt-2 text-3xl font-bold text-brand-navy sm:text-4xl">Find your perfect property</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Filter approved homes, land, rentals, and short-stay listings across Ghana.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Segmented value={view} onChange={setView} />
              <button
                type="button"
                onClick={() => setShowFilters((open) => !open)}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy/90"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFilterCount ? <span className="rounded-full bg-brand-teal px-2 py-0.5 text-xs text-brand-navy">{activeFilterCount}</span> : null}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateFilter("sortBy", option.value)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  filters.sortBy === option.value
                    ? "border-brand-navy bg-brand-navy text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                {option.label}
              </button>
            ))}
            {activeFilterCount ? (
              <button type="button" onClick={resetFilters} className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
                <X className="h-4 w-4" /> Clear filters
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {showFilters && (
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
            <FilterGroup label="Category" options={PROPERTY_TYPES} value={filters.propertyType} onChange={(value) => updateFilter("propertyType", value)} />
            <FilterGroup label="Listing Type" options={LISTING_TYPES} value={filters.listingType} onChange={(value) => updateFilter("listingType", value)} />
            <SelectField label="Region" value={filters.region} onChange={(value) => updateFilter("region", value)} options={REGIONS.map((region) => ({ value: region, label: region === "all" ? "All Regions" : region }))} />
            <SelectField label="Bedrooms" value={filters.bedrooms} onChange={(value) => updateFilter("bedrooms", value)} options={ROOM_OPTIONS.map((room) => ({ value: room, label: room === "any" ? "Any" : `${room}+` }))} disabled={filters.propertyType === "land"} />
            <SelectField label="Bathrooms" value={filters.bathrooms} onChange={(value) => updateFilter("bathrooms", value)} options={ROOM_OPTIONS.map((room) => ({ value: room, label: room === "any" ? "Any" : `${room}+` }))} disabled={filters.propertyType === "land"} />
            <NumberField label="Min Price" value={filters.minPrice} onChange={(value) => updateFilter("minPrice", value)} />
            <NumberField label="Max Price" value={filters.maxPrice} onChange={(value) => updateFilter("maxPrice", value)} />
          </div>
        </section>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-brand-navy">Approved listings</h2>
            <p className="text-sm text-slate-500">{loading ? "Loading..." : `${total.toLocaleString()} result${total === 1 ? "" : "s"}`}</p>
          </div>
          <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
            <SlidersHorizontal className="h-4 w-4" />
            Page {page} of {totalPages}
          </div>
        </div>

        {view === "list" ? (
          <ListView properties={properties} loading={loading} />
        ) : (
          <MapView
            properties={properties}
            loading={loading}
            mapLoaded={mapLoaded}
            center={mapCenter}
            selected={selectedProperty}
            onSelect={setSelectedProperty}
            onRefresh={() => fetchProperties(page)}
          />
        )}

        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
}

function Segmented({ value, onChange }) {
  return (
    <div className="flex rounded-lg bg-slate-100 p-1">
      {[
        { value: "list", label: "List", icon: LayoutGrid },
        { value: "map", label: "Map", icon: Map },
      ].map(({ value: optionValue, label, icon: Icon }) => (
        <button
          key={optionValue}
          type="button"
          onClick={() => onChange(optionValue)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
            value === optionValue ? "bg-white text-brand-navy shadow-sm" : "text-slate-500 hover:text-brand-navy",
          )}
        >
          <Icon className="h-4 w-4" /> {label}
        </button>
      ))}
    </div>
  );
}

function ListView({ properties, loading }) {
  if (loading && !properties.length) return <LoadingState />;
  if (!properties.length) return <EmptyState />;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {properties.map((property) => <PropertyCard key={property.id} property={property} />)}
    </div>
  );
}

function MapView({ properties, loading, mapLoaded, center, selected, onSelect, onRefresh }) {
  const mapRef = useRef(null);
  const [mapType, setMapType] = useState("roadmap");

  useEffect(() => {
    if (mapLoaded && mapRef.current && properties.length) {
      fitPropertiesOnMap(mapRef.current, properties);
    }
  }, [mapLoaded, properties]);

  if (loading && !properties.length) return <LoadingState />;
  if (!properties.length) return <EmptyState />;
  if (!GOOGLE_MAPS_KEY) {
    return (
      <div className="flex h-[640px] items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-center">
        <div>
          <MapPin className="mx-auto h-10 w-10 text-brand-navy/35" />
          <h3 className="mt-4 font-semibold text-brand-navy">Map unavailable</h3>
          <p className="mt-2 text-sm text-slate-500">Add `NEXT_PUBLIC_GOOGLE_API_KEY` to enable marketplace map view.</p>
        </div>
      </div>
    );
  }
  if (!mapLoaded) {
    return <div className="flex h-[640px] items-center justify-center rounded-lg bg-slate-100"><Loader2 className="h-8 w-8 animate-spin text-brand-navy" /></div>;
  }

  return (
    <div className="relative h-[640px] overflow-hidden rounded-lg border border-slate-200 bg-white">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={7}
        options={{ ...MAP_OPTIONS, mapTypeId: mapType }}
        onLoad={(map) => {
          mapRef.current = map;
          fitPropertiesOnMap(map, properties);
        }}
      >
        {properties.map((property, index) => {
          const position = parseCoordinates(property, index);
          const active = selected?.id === property.id;
          return (
            <MarkerF
              key={property.id}
              position={position}
              icon={marketplaceMarkerIcon(property, active)}
              zIndex={active ? 2 : 1}
              onClick={() => {
                mapRef.current?.panTo(position);
                onSelect({ ...property, position });
              }}
            />
          );
        })}
        {selected?.position && (
          <InfoWindow position={selected.position} onCloseClick={() => onSelect(null)}>
            <MarketplaceInfoWindow property={selected} />
          </InfoWindow>
        )}
      </GoogleMap>
      <MarketplaceMapControls
        mapType={mapType}
        onToggleMapType={() => setMapType((type) => type === "satellite" ? "roadmap" : "satellite")}
        onZoomIn={() => mapRef.current?.setZoom((mapRef.current?.getZoom() ?? 7) + 1)}
        onZoomOut={() => mapRef.current?.setZoom((mapRef.current?.getZoom() ?? 7) - 1)}
        onFit={() => fitPropertiesOnMap(mapRef.current, properties)}
        onRefresh={onRefresh}
        loading={loading}
      />
    </div>
  );
}

function MarketplaceInfoWindow({ property }) {
  const image = firstImage(property.images);
  const location = property.location || property.address || property.region || "Ghana";
  const type = property.type || property.property_type;
  const listingType = property.listing_type;

  return (
    <article className="w-[min(20rem,calc(100vw-3rem))] overflow-hidden rounded-lg bg-white text-slate-900">
      <div className="relative h-32 bg-slate-100">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={property.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-brand-navy/5">
            <Home className="h-9 w-9 text-brand-navy/35" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {type ? <Badge>{type}</Badge> : null}
          {listingType ? <Badge accent>{listingType}</Badge> : null}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="line-clamp-1 font-bold text-brand-navy">{property.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">{location}</span>
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Price</p>
          <p className="font-bold text-brand-navy">{formatPrice(property)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          {property.bedrooms ? <span className="inline-flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{property.bedrooms} beds</span> : null}
          {property.bathrooms ? <span className="inline-flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{property.bathrooms} baths</span> : null}
          {property.size ? <span className="inline-flex items-center gap-1"><Ruler className="h-3.5 w-3.5" />{property.size}</span> : null}
        </div>

        <Link href={`/contact?property=${encodeURIComponent(property.title)}`} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy/90">
          Enquire now <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function MarketplaceMapControls({ mapType, onToggleMapType, onZoomIn, onZoomOut, onFit, onRefresh, loading }) {
  return (
    <div className="absolute right-4 top-4 z-10 flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
      <MarketplaceMapControlButton label="Zoom in" onClick={onZoomIn} icon={ZoomIn} />
      <MarketplaceMapControlButton label="Zoom out" onClick={onZoomOut} icon={ZoomOut} />
      <MarketplaceMapControlButton label="Fit listings" onClick={onFit} icon={LocateFixed} />
      <MarketplaceMapControlButton label={mapType === "satellite" ? "Roadmap" : "Satellite"} onClick={onToggleMapType} icon={Layers} />
      <MarketplaceMapControlButton label="Refresh listings" onClick={onRefresh} icon={RefreshCw} loading={loading} />
    </div>
  );
}

function MarketplaceMapControlButton({ label, onClick, icon: Icon, loading }) {
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

function PropertyCard({ property }) {
  const image = firstImage(property.images);

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] bg-slate-100">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={property.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-brand-navy/5">
            <Home className="h-10 w-10 text-brand-navy/35" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          {property.type && <Badge>{property.type}</Badge>}
          {property.listing_type && <Badge accent>{property.listing_type}</Badge>}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="line-clamp-1 font-semibold text-slate-900">{property.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">{property.location || property.address || property.region || "Ghana"}</span>
          </p>
        </div>

        <p className="line-clamp-2 min-h-10 text-sm text-slate-500">{property.description || "Approved marketplace property listing."}</p>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <p className="font-bold text-brand-navy">{formatPrice(property)}</p>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {property.bedrooms ? <span className="inline-flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{property.bedrooms}</span> : null}
            {property.bathrooms ? <span className="inline-flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{property.bathrooms}</span> : null}
            {property.size ? <span className="inline-flex items-center gap-1"><Ruler className="h-3.5 w-3.5" />{property.size}</span> : null}
          </div>
        </div>

        <Link href={`/contact?property=${encodeURIComponent(property.title)}`} className="inline-flex w-full items-center justify-center rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy/90">
          Enquire
        </Link>
      </div>
    </article>
  );
}

function Badge({ children, accent }) {
  return (
    <span className={cn(
      "rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
      accent ? "bg-brand-teal text-brand-navy" : "bg-white/90 text-brand-navy",
    )}>
      {children}
    </span>
  );
}

function FilterGroup({ label, options, value, onChange }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              value === option.value ? "border-brand-navy bg-brand-navy text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SelectField({ label, options, value, onChange, disabled }) {
  return (
    <label className={cn("block", disabled && "opacity-45")}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-teal"
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-teal"
      />
    </label>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-80 items-center justify-center rounded-lg border border-slate-200 bg-white">
      <Loader2 className="h-8 w-8 animate-spin text-brand-navy" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
      <Search className="mx-auto h-10 w-10 text-slate-300" />
      <h3 className="mt-4 text-lg font-semibold text-brand-navy">No properties match your filters</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Try adjusting your category, region, rooms, or price range.</p>
    </div>
  );
}
