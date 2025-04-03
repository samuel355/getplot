"use client";

import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/Header";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import PropertyFilters from "./_components/property-filters";
import PropertyListHeader from "./_components/property-list-header";
import PropertyGrid from "./_components/property-grid";
import PropertyMap from "./_components/property-map";
import { mockProperties } from "./mock-data";
import { useEffect } from "react";


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

  // Fetch properties based on filters
  useEffect(() => {
    setLoading(true);

    // Initialize from URL parameters if they exist
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

    // This would be an API call in a real application
    // For now, we'll use mock data
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => {
        setProperties(mockProperties);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch properties:", err);
        setProperties(mockProperties);
        setLoading(false);
      });
  }, [searchParams]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  return (
    <>
      <Header />
      <main className=" w-full mx-auto px-10 md:px-14 py-6 min-h-screen mt-24">
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
