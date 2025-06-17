"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/Header";
import PropertyFilters from "./_components/property-filters";
import PropertyListHeader from "./_components/property-list-header";
import PropertyGrid from "./_components/property-grid";
import PropertyMap from "./_components/property-map";
import Pagination from "./_components/pagination";
import usePropertyStore from "@/store/usePropertyStore";
import ListYourPropertyCallout from "@/app/_components/ListYourPropertyCallout";

export default function MarketPlace() {
  const {
    properties,
    loading,
    filters,
    currentPage, 
    totalPages,
    totalProperties,
    setFilters,
    fetchProperties,
    setPage,
  } = usePropertyStore();
  
  const [viewMode, setViewMode] = useState("grid"); // grid, map
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize filters from URL params
    const propertyType = searchParams.get("propertyType") || "all";
    const minPrice = parseInt(searchParams.get("minPrice") || "0");
    const maxPrice = parseInt(searchParams.get("maxPrice") || "10000000");
    const location = searchParams.get("location") || "all";
    const bedrooms = searchParams.get("bedrooms") || "any";
    const bathrooms = searchParams.get("bathrooms") || "any";
    const sortBy = searchParams.get("sortBy") || "newest";
    const property_type = searchParams.get("property_type") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    
    // Update store with URL params
    setFilters({
      propertyType,
      priceRange: [minPrice, maxPrice],
      location,
      bedrooms,
      bathrooms,
      sortBy,
      property_type,
    });
    
    setPage(page);
    
    // Fetch properties with the current filters and page
    fetchProperties(page);
    
  }, [searchParams]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) { // Tailwind's 'md' breakpoint is 768px
        setViewMode("grid");
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call once on mount to set initial view mode

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Fetch properties will be called after state update
    fetchProperties(1); // Reset to page 1 when filters change
  };

  const handlePageChange = (page) => {
    setPage(page);
    fetchProperties(page);
    
    // Update URL to include page
    const url = new URL(window.location.href);
    url.searchParams.set('page', page);
    window.history.pushState({}, '', url);
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
          propertyCount={totalProperties}
          viewMode={viewMode}
          setViewMode={setViewMode}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <ListYourPropertyCallout />

        {viewMode === "grid" && (
          <>
            <PropertyGrid properties={properties} loading={loading} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}

        {viewMode === "map" && (
          <PropertyMap properties={properties} loading={loading} />
        )}
      </main>
      <Footer />
    </>
  );
}