"use client";

import Link from "next/link";
import PropertyCard from "./property-card";

const PropertyGrid = ({ properties, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="bg-gray-200 aspect-[4/3]" />
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <div className="h-6 bg-gray-200 rounded w-2/5" />
                <div className="h-5 bg-gray-100 rounded-full w-16" />
              </div>
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-10 bg-gray-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-900">
          No properties found
        </h3>
        <p className="mt-2 text-gray-500">
          Try adjusting your filters to see more results.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <Link key={property.id} href={`/property/${property.id}`}>
          <PropertyCard property={property} />
        </Link>
      ))}
    </div>
  );
};

export default PropertyGrid;
