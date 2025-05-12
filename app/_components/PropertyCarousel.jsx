"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/utils/supabase/client";

const PropertyCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("properties")
          .select("id, title, type, price, location, size, bedrooms, bathrooms, images, status, listing_type, rental_price")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(9);

        if (error) throw error;
        setProperties(data || []);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + itemsPerPage >= properties.length ? 0 : prevIndex + itemsPerPage
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - itemsPerPage < 0 ? properties.length - itemsPerPage : prevIndex - itemsPerPage
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-t-lg"></div>
            <div className="p-4 border border-gray-200 rounded-b-lg">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return null;
  }

  const visibleProperties = properties.slice(currentIndex, currentIndex + itemsPerPage);

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleProperties.map((property) => (
          <div key={property.id} className="border rounded-lg overflow-hidden bg-white shadow-lg">
            {/* Property Image */}
            <div className="relative h-48">
              <img
                src={property.images?.[0]?.url || "/placeholder-property.jpg"}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-md capitalize">
                  {property.listing_type === 'rent' ? 'For Rent' : 
                   property.listing_type === 'airbnb' ? 'Airbnb' : 
                   property.type}
                </span>
              </div>
            </div>

            {/* Property Details */}
            <div className="p-4">
              <h3 className="font-semibold text-lg truncate">{property.title}</h3>
              <p className="text-sm text-gray-600 truncate flex items-center mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="w-4 h-4 mr-1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {property.location}
              </p>

              <div className="flex justify-between items-center mt-2">
                <div className="font-medium">
                  {property.listing_type === 'rent' ? (
                    <>GHS {Number(property.rental_price).toLocaleString()}/month</>
                  ) : property.listing_type === 'airbnb' ? (
                    <>GHS {Number(property.rental_price).toLocaleString()}/night</>
                  ) : (
                    <>GHS {Number(property.price).toLocaleString()}</>
                  )}
                </div>
                <div className="text-sm text-gray-600">{property.size}</div>
              </div>

              {property.type === "house" && (
                <div className="flex mt-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="w-4 h-4 mr-1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    {property.bedrooms} beds
                  </div>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="w-4 h-4 mr-1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 6v8h12V6M6 14v1a3 3 0 003 3h6a3 3 0 003-3v-1"
                      />
                    </svg>
                    {property.bathrooms} baths
                  </div>
                </div>
              )}

              <Link
                href={`/property/${property.id}`}
                className="mt-4 block w-full text-center bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {properties.length > itemsPerPage && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots */}
      {properties.length > itemsPerPage && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(properties.length / itemsPerPage) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * itemsPerPage)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === Math.floor(currentIndex / itemsPerPage) ? "bg-primary" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyCarousel; 