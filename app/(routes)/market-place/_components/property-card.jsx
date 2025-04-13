"use client";

import { useState } from "react";
import { HeartIcon, HomeIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import usePropertyStore from "@/store/usePropertyStore";
import { favoriteToasts } from "@/utils/toast";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

const PropertyCard = ({ property, isCompact = false }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const toggleFavorite = usePropertyStore((state) => state.toggleFavorite);
  const isFavorite = usePropertyStore((state) => state.isFavorite(property.id));
  const { toast } = useToast();
  const { user } = useUser();

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 800);
    
    try {
      const result = await toggleFavorite(property.id, user?.id);
      console.log('result', result);
      
      if (result.success) {
        if (result.isFavorite) {
          // Property was added to favorites
          toast({
            title: "Added to Favorites",
            description: property.title,
            variant: "default",
          });
        } else {
          // Property was removed from favorites
          toast({
            title: "Removed from Favorites",
            description: property.title,
            variant: "default",
          });
        }
      } else {
        // Handle error case
        toast({
          title: "Error",
          description: result.message || "Could not update favorites",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Could not update favorites",
        variant: "destructive",
      });
    }
  };
  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === property.images.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? property.images.length - 1 : prevIndex - 1,
    );
  };

  // For compact view in map info windows
  if (isCompact) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl group">
        <div className="relative">
          {/* Property image */}
          <div className="h-48 overflow-hidden">
            <img
              src={property.images[currentImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="absolute top-2 right-2">
            <button
              onClick={handleFavoriteClick}
              className={`absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:scale-110 transition-all duration-300 ${
                isAnimating ? "scale-125" : ""
              }`}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              {isFavorite ? (
                <HeartSolidIcon
                  className={`h-5 w-5 text-red-500 ${isAnimating ? "animate-pulse" : ""}`}
                />
              ) : (
                <HeartIcon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        <div className="p-2">
          <Link href={`/property/${property.id}`}>
          <h3 className="font-medium text-sm truncate">{property.title}</h3>
          </Link>
          <div className="flex items-center text-xs text-gray-600 mt-0.5">
            <MapPinIcon className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-primary font-bold text-sm">
              ${property.price.toLocaleString()}
            </span>
            <span className="text-gray-600 text-xs">{property.type}</span>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = `/property/${property.id}`;
            }}
            className="w-full text-center mt-2 text-xs bg-primary text-white py-1 rounded hover:bg-primary-dark transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    );
  }

  // Regular card view
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl group">
      <div className="relative">
        {/* Property image */}
        <div className="h-48 overflow-hidden">
          <img
            src={property.images[currentImageIndex]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Image navigation buttons (only shown if more than one image) */}
        {property.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
          {property.type === "house" ? "House" : "Land"}
        </div>

        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:scale-110 transition-transform"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? (
            <HeartSolidIcon className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-600" />
          )}
        </button>

        {/* Featured badge */}
        {property.featured && (
          <div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
            Featured
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
            {property.title}
          </h3>
        </div>

        <div className="mt-1 flex items-center text-gray-600">
          <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="text-sm truncate">{property.location}</span>
        </div>

        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
          {property.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-primary font-bold">
            GHS {property.price.toLocaleString()}
          </span>
          <span className="text-gray-600 text-sm">{property.size}</span>
        </div>

        {property.type === "house" && (
          <div className="mt-3 flex items-center space-x-4 text-gray-600">
            <div className="flex items-center">
              <HomeIcon className="h-4 w-4 mr-1" />
              <span className="text-sm">{property.bedrooms} bd</span>
            </div>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-4 w-4 mr-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 6v8h12V6M6 14v1a3 3 0 003 3h6a3 3 0 003-3v-1"
                />
              </svg>
              <span className="text-sm">{property.bathrooms} ba</span>
            </div>
          </div>
        )}

        {property.features && property.features.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {property.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded"
              >
                {feature}
              </span>
            ))}
            {property.features.length > 3 && (
              <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                +{property.features.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;
