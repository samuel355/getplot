"use client";

import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/Header";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import PropertyFilters from "./_components/property-filters";
import PropertyListHeader from "./_components/property-list-header";
import PropertyGrid from "./_components/property-grid";
import PropertyMap from "./_components/property-map";
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

// Mock data for development
const mockProperties = [
  {
    id: 1,
    type: "land",
    title: "East Legon Hills Premium Plot",
    description: "Beautiful residential plot in an upscale community",
    price: 45000,
    size: "600 sqm",
    location: "East Legon Hills, Accra",
    coordinates: { lat: 5.6037, lng: -0.187 },
    images: ["/images/property15.jpg", "/images/property16.jpg"],
    features: ["Gated community", "Good road network", "Underground utilities"],
    createdAt: "2023-08-15T12:00:00.000Z",
    featured: true,
  },
  {
    id: 2,
    type: "house",
    title: "Modern 3-Bedroom Home",
    description: "Luxury house with modern finishes in a prime location",
    price: 250000,
    size: "200 sqm",
    location: "Kumasi, Ashanti Region",
    coordinates: { lat: 6.6885, lng: -1.6244 },
    bedrooms: 3,
    bathrooms: 2,
    images: ["/images/property11.jpg", "/images/property12.jpg"],
    features: ["Swimming pool", "Security", "Air conditioning", "Garden"],
    createdAt: "2023-09-02T15:30:00.000Z",
    featured: true,
  },
  {
    id: 3,
    type: "land",
    title: "Commercial Plot at Trabuom",
    description: "Prime commercial land with excellent visibility",
    price: 75000,
    size: "1200 sqm",
    location: "Trabuom, Kumasi",
    coordinates: { lat: 6.6015, lng: -1.688 },
    images: ["/images/property17.jpg", "/images/property18.jpg"],
    features: ["Corner plot", "Commercial zoning", "Main road access"],
    createdAt: "2023-07-22T09:15:00.000Z",
    featured: false,
  },
  {
    id: 4,
    type: "house",
    title: "Family Home with Garden",
    description: "Spacious 4-bedroom house perfect for families",
    price: 180000,
    size: "250 sqm",
    location: "East Legon, Accra",
    coordinates: { lat: 5.636, lng: -0.1652 },
    bedrooms: 4,
    bathrooms: 3,
    images: ["/images/property19.jpg", "/images/property20.jpg"],
    features: ["Large garden", "Garage", "Security system", "Modern kitchen"],
    createdAt: "2023-09-10T11:45:00.000Z",
    featured: false,
  },
  {
    id: 5,
    type: "land",
    title: "NTHC Development Land",
    description: "Build your dream home in this developing area",
    price: 35000,
    size: "500 sqm",
    location: "NTHC, Kumasi",
    coordinates: { lat: 6.7081, lng: -1.5913 },
    images: ["/images/property21.jpg", "/images/property22.jpg"],
    features: [
      "Residential zoning",
      "Growing neighborhood",
      "Nearby amenities",
    ],
    createdAt: "2023-08-28T14:20:00.000Z",
    featured: false,
  },
  {
    id: 6,
    type: "house",
    title: "Luxury Villa in Dar Es Salaam",
    description: "Executive home with premium finishes",
    price: 420000,
    size: "350 sqm",
    location: "Dar Es Salaam, Kumasi",
    coordinates: { lat: 6.6572, lng: -1.6284 },
    bedrooms: 5,
    bathrooms: 4,
    images: ["/images/property36.jpg", "/images/property37.jpg"],
    features: [
      "Swimming pool",
      "Home office",
      "Smart home system",
      "Wine cellar",
    ],
    createdAt: "2023-09-05T10:30:00.000Z",
    featured: true,
  },
  {
    id: 7,
    type: "land",
    title: "Yabi Residential Plot",
    description: "Affordable land in a growing residential area",
    price: 25000,
    size: "450 sqm",
    location: "Yabi, Kumasi",
    coordinates: { lat: 6.722, lng: -1.612 },
    images: ["/images/property25.jpg", "/images/property26.jpg"],
    features: ["Residential zoning", "Peaceful neighborhood", "Nearby schools"],
    createdAt: "2023-08-10T08:45:00.000Z",
    featured: false,
  },
  {
    id: 8,
    type: "house",
    title: "Townhouse near University",
    description: "Modern townhouse perfect for students or professionals",
    price: 120000,
    size: "180 sqm",
    location: "Legon, Accra",
    coordinates: { lat: 5.6502, lng: -0.186 },
    bedrooms: 2,
    bathrooms: 2,
    images: ["/images/property27.jpg", "/images/property28.jpg"],
    features: [
      "Furnished",
      "Security",
      "Close to university",
      "Public transport",
    ],
    createdAt: "2023-09-15T16:10:00.000Z",
    featured: false,
  },
];
