"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Bath,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Filter,
  Home,
  LayoutGrid,
  Loader2,
  Map,
  MapPin,
  Ruler,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MarketplaceMapView = dynamic(() => import("./_components/MarketplaceMapView"), {
  ssr: false,
  loading: () => <LoadingState />,
});

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

export default function MarketplacePage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [properties, setProperties] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

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
          <MarketplaceMapView
            properties={properties}
            loading={loading}
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
