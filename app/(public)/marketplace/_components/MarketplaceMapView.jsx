"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { GoogleMap, InfoWindow, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import {
  Bath,
  BedDouble,
  Home,
  Layers,
  Loader2,
  LocateFixed,
  MapPin,
  RefreshCw,
  Ruler,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const GOOGLE_MAPS_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
  process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

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

function pointArrayToLatLng(point) {
  const first = Number(point[0]);
  const second = Number(point[1]);
  if (Number.isNaN(first) || Number.isNaN(second)) return null;

  if (first >= 4 && first <= 12 && second >= -4 && second <= 2) {
    return { lat: first, lng: second };
  }
  return { lat: second, lng: first };
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

export default function MarketplaceMapView({ properties, loading, onRefresh }) {
  const mapRef = useRef(null);
  const [mapType, setMapType] = useState("roadmap");
  const [selected, setSelected] = useState(null);

  const { isLoaded: mapLoaded } = useJsApiLoader({
    id: "google-map-scripts",
    googleMapsApiKey: GOOGLE_MAPS_KEY ?? "",
  });

  const center = useMemo(() => {
    if (properties.length) return parseCoordinates(properties[0], 0);
    return { lat: 7.9465, lng: -1.0232 };
  }, [properties]);

  useEffect(() => {
    if (mapLoaded && mapRef.current && properties.length) {
      fitPropertiesOnMap(mapRef.current, properties);
    }
  }, [mapLoaded, properties]);

  if (loading && !properties.length) return <MapLoadingState />;
  if (!properties.length) return <MapEmptyState />;
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
                setSelected({ ...property, position });
              }}
            />
          );
        })}
        {selected?.position && (
          <InfoWindow position={selected.position} onCloseClick={() => setSelected(null)}>
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

        <Link href={`/contact?property=${encodeURIComponent(property.title)}`} className="inline-flex w-full items-center justify-center rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy/90">
          Enquire now
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

function Badge({ children, accent }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
        accent ? "bg-brand-teal text-brand-navy" : "bg-white/90 text-brand-navy",
      )}
    >
      {children}
    </span>
  );
}

function MapLoadingState() {
  return (
    <div className="flex min-h-80 items-center justify-center rounded-lg border border-slate-200 bg-white">
      <Loader2 className="h-8 w-8 animate-spin text-brand-navy" />
    </div>
  );
}

function MapEmptyState() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
      <MapPin className="mx-auto h-10 w-10 text-slate-300" />
      <h3 className="mt-4 text-lg font-semibold text-brand-navy">No properties match your filters</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Try adjusting your category, region, rooms, or price range.</p>
    </div>
  );
}
