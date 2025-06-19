"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, MapPin, Bed, Bath, DollarSign } from "lucide-react";
import Link from "next/link";
import usePropertyStore from "@/store/usePropertyStore";
import { useToast } from "@/hooks/use-toast";

export default function SavedProperties() {
  const { user } = useUser();
  const { favorites, toggleFavorite, fetchFavorites } = usePropertyStore();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadFavorites = async () => {
      if (user?.id) {
        try {
          await fetchFavorites(user.id);
        } catch (error) {
          console.error("Error loading favorites:", error);
          toast({
            title: "Error",
            description: "Failed to load saved properties. Please try again.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    loadFavorites();
  }, [user?.id, fetchFavorites, toast]);

  const handleRemoveFavorite = async (propertyId) => {
    const result = await toggleFavorite(propertyId, user?.id);
    if (result.success) {
      toast({
        title: "Property Removed",
        description:
          "The property has been removed from your saved properties.",
        variant: "default",
      });
    } else {
      toast({
        title: "Error",
        description:
          result.message || "Failed to remove the property. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Saved Properties</h1>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Saved Properties</h1>
        <Button variant="outline" asChild>
          <Link href="/market-place">Browse More Properties</Link>
        </Button>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Bookmark className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No Saved Properties</h3>
            <p className="text-gray-500 mb-4">
              You haven't saved any properties yet. Browse the market place to
              find properties you like.
            </p>
            <Button asChild>
              <Link href="/market-place">Browse Properties</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((property) => (
            <Card
              key={property.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle className="text-lg">{property.title}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {property.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    <span>{property.bedrooms} beds</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    <span>{property.bathrooms} baths</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>
                      {property.listing_type === "rent" ? (
                        <>
                          GHS {Number(property.rental_price).toLocaleString()}
                          <span className="text-xs text-muted-foreground">
                            /month
                          </span>
                        </>
                      ) : property.listing_type === "airbnb" ? (
                        <>
                          GHS {Number(property.rental_price).toLocaleString()}
                          <span className="text-xs text-muted-foreground">
                            /day
                          </span>
                        </>
                      ) : (
                        <>GHS {Number(property.price).toLocaleString()}</>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleRemoveFavorite(property.id)}
                  >
                    <Bookmark className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                  <Button className="flex-1" asChild>
                    <Link href={`/properties/property/${property.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
