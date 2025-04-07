"use client";

import { useEffect } from "react";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";
import usePropertyStore from "@/store/usePropertyStore";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/app/(routes)/market-place/_components/property-card";

export default function FavoritesPage() {
  const favorites = usePropertyStore(state => state.favorites);
  
  // <Link href="/favorites" className="flex items-center relative ml-4">
  //   <div className="relative">
  //     <HeartIcon className="h-6 w-6" />
  //     {favoritesCount > 0 && (
  //       <Badge 
  //         className="absolute -top-2 -right-2 flex items-center justify-center h-5 min-w-[1.25rem] px-1 bg-red-500 text-white hover:bg-red-600" 
  //         variant="destructive"
  //       >
  //         {favoritesCount}
  //       </Badge>
  //     )}
  //   </div>
  // </Link>
  
  return (
    <>
      <Header />
      <main className="w-full mx-auto px-10 md:px-14 py-6 min-h-screen mt-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Favorite Properties
        </h1>
        
        {favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="flex justify-center mb-4">
              <HeartIcon className="h-16 w-16 text-gray-300" />
            </div>
            <h2 className="text-2xl font-medium text-gray-700 mb-4">No Favorites Yet</h2>
            <p className="text-gray-500 mb-6">
              You haven't added any properties to your favorites list yet.
            </p>
            <Button asChild>
              <Link href="/market-place">
                Browse Properties
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(property => (
              <Link key={property.id} href={`/property/${property.id}`}>
                <PropertyCard property={property} />
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}