"use client";

import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";
import usePropertyStore from "@/store/usePropertyStore";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/app/(properties)/properties/components/property-card";

export default function FavoritesPage() {
  const favorites = usePropertyStore((state) => state.favorites);

  return (
    <div className="w-full mx-auto px-4 md:px-6 py-6 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Favorite Properties</h1>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="flex justify-center mb-4">
            <HeartIcon className="h-16 w-16 text-gray-300" />
          </div>
          <h2 className="text-2xl font-medium text-gray-700 mb-4">No Favorites Yet</h2>
          <p className="text-gray-500 mb-6">
            You haven&apos;t added any properties to your favorites list yet.
          </p>
          <Button asChild>
            <Link href="/marketplace">Browse Properties</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((property) => (
            <Link key={property.id} href={`/properties/property/${property.id}`}>
              <PropertyCard property={property} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
