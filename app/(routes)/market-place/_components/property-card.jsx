"use client";

import { useState } from "react";
import { HeartIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import usePropertyStore from "@/store/usePropertyStore";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

const BADGE = {
  airbnb: { label: "Airbnb · Short Stay", cls: "bg-rose-500" },
  rent:   { label: "For Rent",             cls: "bg-amber-500" },
  sale:   { label: "For Sale",             cls: "bg-emerald-600" },
};

function badge(property) {
  return BADGE[property.listing_type] ?? BADGE.sale;
}

function imgSrc(img) {
  if (!img) return "/image-placeholder.png";
  return typeof img === "string" ? img : (img.url ?? "/image-placeholder.png");
}

function PriceDisplay({ property }) {
  const isRent = property.listing_type === "rent";
  const isAirbnb = property.listing_type === "airbnb";
  if (isRent || isAirbnb) {
    return (
      <>
        <span className="text-xl font-bold text-gray-900">
          GHS {Number(property.rental_price).toLocaleString()}
        </span>
        <span className="text-sm text-gray-500 ml-0.5">{isAirbnb ? "/day" : "/mo"}</span>
      </>
    );
  }
  return (
    <>
      <span className="text-xl font-bold text-gray-900">
        GHS {Number(property.price).toLocaleString()}
      </span>
      {property.negotiable && (
        <span className="text-sm text-gray-500 ml-1.5">· Negotiable</span>
      )}
    </>
  );
}

const PropertyCard = ({ property, isCompact = false }) => {
  const [idx, setIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const toggleFavorite = usePropertyStore((s) => s.toggleFavorite);
  const isFavorite = usePropertyStore((s) => s.isFavorite(property.id));
  const { toast } = useToast();
  const { user } = useUser();

  const images = property.images?.length ? property.images : [null];
  const b = badge(property);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);
    try {
      const result = await toggleFavorite(property.id, user?.id);
      toast({
        title: result.isFavorite ? "Added to Favorites" : "Removed from Favorites",
        description: property.title,
      });
    } catch {
      toast({ title: "Error", description: "Could not update favorites", variant: "destructive" });
    }
  };

  const prev = (e) => { e.preventDefault(); e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.preventDefault(); e.stopPropagation(); setIdx((i) => (i + 1) % images.length); };

  // ── Compact (map popup) ──────────────────────────────────────────────────
  if (isCompact) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden w-56 group">
        <div className="relative h-36 overflow-hidden">
          <img src={imgSrc(images[idx])} alt={property.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <span className={`absolute top-2 left-2 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full ${b.cls}`}>
            {b.label}
          </span>
          {user && (
            <button onClick={handleFavorite} className="absolute top-2 right-2 backdrop-blur-md bg-white/20 border border-white/30 rounded-full p-1.5 hover:bg-white/40 transition-all">
              {isFavorite
                ? <HeartSolidIcon className="h-4 w-4 text-red-400" />
                : <HeartIcon className="h-4 w-4 text-white" />}
            </button>
          )}
          <p className="absolute bottom-2 left-3 right-3 text-white font-semibold text-sm leading-tight truncate">{property.title}</p>
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <MapPinIcon className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <PriceDisplay property={property} />
            <span className="text-xs text-gray-400">{property.size}</span>
          </div>
          <Link
            href={`/property/${property.id}`}
            className="block text-center text-xs font-semibold bg-primary text-white py-1.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            View Details →
          </Link>
        </div>
      </div>
    );
  }

  // ── Full card ────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imgSrc(images[idx])}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

        {/* Type badge */}
        <span className={`absolute top-3 left-3 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm backdrop-blur-sm ${b.cls}`}>
          {b.label}
        </span>

        {/* Favorite */}
        {user && (
          <button
            onClick={handleFavorite}
            className={`absolute top-3 right-3 backdrop-blur-md bg-white/20 border border-white/30 rounded-full p-2 transition-all duration-200 hover:bg-white/40 ${animating ? "scale-125" : ""}`}
          >
            {isFavorite
              ? <HeartSolidIcon className="h-5 w-5 text-red-400" />
              : <HeartIcon className="h-5 w-5 text-white" />}
          </button>
        )}

        {/* Featured */}
        {property.featured && (
          <span className="absolute bottom-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
            ★ Featured
          </span>
        )}

        {/* Arrow nav */}
        {images.length > 1 && (
          <>
            <button onClick={prev} aria-label="Previous" className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button onClick={next} aria-label="Next" className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIdx(i); }}
                  className={`h-1.5 rounded-full transition-all duration-200 ${i === idx ? "bg-white w-4" : "bg-white/50 w-1.5"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Price + size */}
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-0.5">
            <PriceDisplay property={property} />
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full font-medium shrink-0 ml-2">
            {property.size}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-1 mb-1">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate">{property.location}</span>
        </div>

        {/* House specs */}
        {property.type === "house" && (
          <div className="flex items-center gap-3 text-sm text-gray-600 pb-3 mb-3 border-b border-gray-100">
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>{property.bedrooms} beds</span>
            </div>
            <div className="w-px h-3 bg-gray-200" />
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6v8h12V6M6 14v1a3 3 0 003 3h6a3 3 0 003-3v-1" />
              </svg>
              <span>{property.bathrooms} baths</span>
            </div>
          </div>
        )}

        {/* Feature tags */}
        {property.features?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {property.features.slice(0, 3).map((f, i) => (
              <span key={i} className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">
                {f}
              </span>
            ))}
            {property.features.length > 3 && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full">
                +{property.features.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/property/${property.id}`}
          onClick={(e) => e.stopPropagation()}
          className="block w-full text-center text-sm font-semibold bg-primary text-white py-2.5 rounded-xl hover:opacity-90 active:scale-[.98] transition-all duration-150"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default PropertyCard;
