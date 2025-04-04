"use client";

import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/Header";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import PropertyFilters from "./_components/property-filters";
import PropertyListHeader from "./_components/property-list-header";
import PropertyGrid from "./_components/property-grid";
import PropertyMap from "./_components/property-map";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export default function MarketPlace() {
  const [viewMode, setViewMode] = useState("grid"); // grid, map, split
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    propertyType: "all", // all, land, house
    priceRange: [0, 10000000],
    location: "all",
    bedrooms: "any",
    bathrooms: "any",
    sortBy: "newest",
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    setLoading(true);

    const propertyType = searchParams.get("propertyType") || "all";
    const minPrice = searchParams.get("minPrice") || 0;
    const maxPrice = searchParams.get("maxPrice") || 1000000;
    const location = searchParams.get("location") || "all";

    setFilters((prev) => ({
      ...prev,
      propertyType,
      priceRange: [parseInt(minPrice), parseInt(maxPrice)],
      location,
    }));

    async function fetchProperties() {
      let query = supabase
        .from("properties")
        .select(
          "id, title, type, price, location, address, size, bedrooms, bathrooms, images, status, created_at, location_coordinates",
        );
      // .eq("status", "approved");

      if (propertyType !== "all") {
        query = query.eq("type", propertyType);
      }

      query = query.gte("price", minPrice).lte("price", maxPrice);

      if (location !== "all") {
        query = query.eq("location", location);
      }

      if (filters.sortBy === "newest") {
        query = query.order("created_at", { ascending: false });
      } else if (filters.sortBy === "price_low") {
        query = query.order("price", { ascending: true });
      } else if (filters.sortBy === "price_high") {
        query = query.order("price", { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching properties:", error);
      } else {
        const formattedData = data.map((property) => {
          // Extract coordinates properly from PostGIS format
          let coordinates = null;

          if (property.location_coordinates) {
            try {
              // If it's a PostGIS point object
              if (property.location_coordinates.coordinates) {
                // IMPORTANT: Check if we need to swap coordinates
                // PostGIS stores as [longitude, latitude] but we need {lat: latitude, lng: longitude}
                coordinates = {
                  lat: property.location_coordinates.coordinates[0], // Latitude (second value)
                  lng: property.location_coordinates.coordinates[1], // Longitude (first value)
                };
              }
              
              // If it's a string, try to parse it
              else if (typeof property.location_coordinates === "string") {
                const geoJSON = JSON.parse(property.location_coordinates);
                if (geoJSON.coordinates) {
                  coordinates = {
                    lat: geoJSON.coordinates[1], // Latitude
                    lng: geoJSON.coordinates[0], // Longitude
                  };
                }
              }
              // If it has direct x/y properties
              else if (property.location_coordinates.x !== undefined) {
                coordinates = {
                  lat: property.location_coordinates.y, // y is latitude
                  lng: property.location_coordinates.x, // x is longitude
                };
              }
            } catch (e) {
              console.error(
                "Error parsing coordinates for property:",
                property.id,
                e,
              );
            }
          }

          return {
            ...property,
            images: property.images?.length
              ? property.images.map((img) => img.url || img)
              : [],
            coordinates: coordinates,
          };
        });

        setProperties(formattedData);
      }
      setLoading(false);
    }

    fetchProperties();
  }, [searchParams]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  return (
    <>
      <Header />
      <main className="w-full mx-auto px-10 md:px-14 py-6 min-h-screen mt-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Property Marketplace
        </h1>

        <PropertyFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <PropertyListHeader
          propertyCount={properties.length}
          viewMode={viewMode}
          setViewMode={setViewMode}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {viewMode === "grid" && (
          <PropertyGrid properties={properties} loading={loading} />
        )}

        {viewMode === "map" && (
          <PropertyMap properties={properties} loading={loading} />
        )}

        {viewMode === "split" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PropertyGrid properties={properties} loading={loading} />
            <div className="sticky top-24 h-[calc(100vh-120px)]">
              <PropertyMap properties={properties} loading={loading} />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
