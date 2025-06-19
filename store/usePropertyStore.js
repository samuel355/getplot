import { supabase } from "@/utils/supabase/client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const usePropertyStore = create(
  persist(
    (set, get) => ({
      // Properties state
      properties: [],
      filteredProperties: [],
      similarProperties: [],
      selectedProperty: null,
      favorites: [],
      loading: false,
      error: null,

      // Pagination state
      currentPage: 1,
      totalPages: 1,
      propertiesPerPage: 9,
      totalProperties: 0,

      // Filters state
      filters: {
        propertyType: "all",
        priceRange: [0, 10000000],
        location: "all",
        bedrooms: "any",
        bathrooms: "any",
        sortBy: "newest",
        property_type: "all",
      },

      // Recently viewed properties
      recentlyViewed: [],

      // Actions
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          currentPage: 1, // Reset to page 1 when filters change
        })),

      setPage: (page) => set({ currentPage: page }),

      // Fetch favorites from database
      fetchFavorites: async (userId) => {
        try {
          const { data, error } = await supabase
            .from("favorites")
            .select(
              `
              property_id,
              properties (
                id,
                title,
                price,
                location,
                type,
                images,
                bedrooms,
                bathrooms,
                size,
                location_coordinates,
                description,
                features,
                created_at
              )
            `
            )
            .eq("user_id", userId);

          if (error) throw error;

          const formattedFavorites = data.map((item) => ({
            id: item.properties.id,
            title: item.properties.title,
            price: item.properties.price,
            location: item.properties.location,
            type: item.properties.type,
            images: item.properties.images || [],
            bedrooms: item.properties.bedrooms,
            bathrooms: item.properties.bathrooms,
            size: item.properties.size,
            coordinates: item.properties.location_coordinates,
            description: item.properties.description?.substring(0, 100) + "...",
            createdAt: item.properties.created_at,
            features: item.properties.features || [],
          }));

          set({ favorites: formattedFavorites });
          return formattedFavorites;
        } catch (error) {
          console.error("Error fetching favorites:", error);
          return [];
        }
      },

      toggleFavorite: async (propertyId, userId) => {
        const state = get();
        const isFavorite = state.favorites.some((fav) => fav.id === propertyId);

        if (!userId) {
          return {
            success: false,
            isFavorite,
            message: "Sign in to save this property",
          };
        }

        try {
          if (isFavorite) {
            // Remove from favorites
            const { error } = await supabase
              .from("favorites")
              .delete()
              .eq("user_id", userId)
              .eq("property_id", propertyId);

            console.log("error", error);
            if (error) throw error;

            set((state) => ({
              favorites: state.favorites.filter((fav) => fav.id !== propertyId),
            }));
          } else {
            // Add to favorites
            const { error } = await supabase
              .from("favorites")
              .insert([{ user_id: userId, property_id: propertyId }]);
            console.log("error", error);
            if (error) throw error;

            // Find the property from various possible sources
            const property =
              state.properties.find((p) => p.id === propertyId) ||
              state.filteredProperties.find((p) => p.id === propertyId) ||
              (state.selectedProperty?.id === propertyId
                ? state.selectedProperty
                : null);

            if (!property) {
              return {
                success: false,
                isFavorite,
                message: "Property not found",
              };
            }

            set((state) => ({
              favorites: [
                ...state.favorites,
                {
                  id: property.id,
                  title: property.title,
                  price: property.price,
                  location: property.location,
                  type: property.type,
                  images: property.images || [],
                  bedrooms: property.bedrooms,
                  bathrooms: property.bathrooms,
                  size: property.size,
                  coordinates: property.coordinates,
                  description: property.description?.substring(0, 100) + "...",
                  createdAt: property.created_at || property.createdAt,
                  features: property.features || [],
                },
              ],
            }));
          }

          return {
            success: true,
            isFavorite: !isFavorite,
            propertyId,
          };
        } catch (error) {
          console.error("Error toggling favorite:", error);
          return {
            success: false,
            isFavorite,
            message: error.message,
          };
        }
      },

      isFavorite: (propertyId) => {
        const state = get();
        return state.favorites.some((fav) => fav.id === propertyId);
      },

      addToRecentlyViewed: (property) => {
        if (!property) return;

        set((state) => {
          // Remove if already exists (to move to top)
          const filtered = state.recentlyViewed.filter(
            (p) => p.id !== property.id
          );

          // Add to the beginning, keep only the last 10
          const newRecentlyViewed = [
            {
              id: property.id,
              title: property.title,
              price: property.price,
              location: property.location,
              type: property.type,
              images: property.images || [],
              createdAt: property.created_at || property.createdAt,
            },
            ...filtered,
          ].slice(0, 10);

          return { recentlyViewed: newRecentlyViewed };
        });
      },

      // Fetch properties with pagination and filtering
      fetchProperties: async (page = 1) => {
        const state = get();
        const { filters, propertiesPerPage } = state;

        try {
          set({ loading: true, error: null });

          // Calculate pagination
          const from = (page - 1) * propertiesPerPage;
          const to = from + propertiesPerPage - 1;

          // Start with basic query - just approved properties
          let query = supabase
            .from("properties")
            .select(
              "id, title, type, price, location, address, size, bedrooms, bathrooms, images, status, created_at, location_coordinates, description, features, region, property_type, rental_type, rental_duration, rental_price, rental_available_from, rental_available_to, rental_deposit, rental_utilities_included, rental_furnished, airbnb_min_stay, listing_type, negotiable",
              { count: "exact" }
            );

          // Only fetch approved properties
          query = query.eq("status", "approved");
          //console.log('filters->', filters);

          // Add property type filter
          if (filters.propertyType !== "all") {
            query = query.eq("type", filters.propertyType);
          }

          // Add listing type filter
          if (filters.property_type !== "all") {
            query = query.eq("listing_type", filters.property_type);
          }

          // Add region/location filter
          if (filters.location !== "all") {
            query = query.eq("region", filters.location);
          }

          // Add bedrooms filter
          if (filters.bedrooms !== "any" && filters.propertyType !== "land") {
            query = query.gte("bedrooms", filters.bedrooms);
          }

          // Add bathrooms filter
          if (filters.bathrooms !== "any" && filters.propertyType !== "land") {
            query = query.gte("bathrooms", filters.bathrooms);
          }

          // Add price range filter based on listing type
          if (
            filters.priceRange &&
            Array.isArray(filters.priceRange) &&
            filters.priceRange.length === 2
          ) {
            const [minPrice, maxPrice] = filters.priceRange;

            if (minPrice > 0 || maxPrice < 10000000) {
              if (filters.property_type === "sale") {
                // For sale properties, filter by price
                query = query.gte("price", minPrice).lte("price", maxPrice);
                console.log("Applying sale price filter:", {
                  minPrice,
                  maxPrice,
                });
              } else if (
                filters.property_type === "rent" ||
                filters.property_type === "airbnb"
              ) {
                // For rental properties, filter by rental_price
                query = query
                  .gte("rental_price", minPrice)
                  .lte("rental_price", maxPrice);
                console.log("Applying rental price filter:", {
                  minPrice,
                  maxPrice,
                });
              }
            }
          }

          // Apply pagination
          query = query.range(from, to);

          const { data, error, count } = await query;

          if (error) {
            console.error("Query error:", error);
            throw error;
          }

          // Format property data
          const formattedData = data.map((property) => {
            // Extract coordinates properly from PostGIS format
            let coordinates = null;

            if (property.location_coordinates) {
              try {
                // If it's a PostGIS point object
                if (property.location_coordinates.coordinates) {
                  coordinates = {
                    lat: property.location_coordinates.coordinates[0],
                    lng: property.location_coordinates.coordinates[1],
                  };
                }
                // If it's a string, try to parse it
                else if (typeof property.location_coordinates === "string") {
                  const geoJSON = JSON.parse(property.location_coordinates);
                  if (geoJSON.coordinates) {
                    coordinates = {
                      lat: geoJSON.coordinates[1],
                      lng: geoJSON.coordinates[0],
                    };
                  }
                }
                // If it has direct x/y properties
                else if (property.location_coordinates.x !== undefined) {
                  coordinates = {
                    lat: property.location_coordinates.y,
                    lng: property.location_coordinates.x,
                  };
                }
              } catch (e) {
                console.error(
                  "Error parsing coordinates for property:",
                  property.id,
                  e
                );
              }
            }

            const formattedProperty = {
              ...property,
              images: property.images?.length
                ? property.images.map((img) => img.url || img)
                : [],
              coordinates,
              // Add listing type specific fields
              listing_type: property.listing_type || "sale",
              rental_price: property.rental_price || null,
              rental_duration: property.rental_duration || null,
              rental_deposit: property.rental_deposit || null,
              rental_utilities_included:
                property.rental_utilities_included || false,
              rental_furnished: property.rental_furnished || false,
              rental_available_from: property.rental_available_from || null,
              rental_available_to: property.rental_available_to || null,
            };

            return formattedProperty;
          });

          // Update state with the fetched properties and pagination info
          set({
            properties: formattedData,
            filteredProperties: formattedData,
            loading: false,
            totalProperties: count || 0,
            totalPages: Math.ceil((count || 0) / propertiesPerPage),
            currentPage: page,
          });
        } catch (error) {
          console.error("Error fetching properties:", error);
          set({ error: error.message, loading: false });
        }
      },

      // Search properties by query string
      searchProperties: (query) => {
        if (!query.trim()) {
          set((state) => ({ filteredProperties: state.properties }));
          return;
        }

        set((state) => {
          const lowerQuery = query.toLowerCase();
          const filtered = state.properties.filter(
            (property) =>
              property.title?.toLowerCase().includes(lowerQuery) ||
              property.location?.toLowerCase().includes(lowerQuery) ||
              property.description?.toLowerCase().includes(lowerQuery)
          );

          return { filteredProperties: filtered };
        });
      },

      // Fetch a single property by ID
      fetchPropertyById: async (propertyId) => {
        try {
          set({ loading: true, error: null });

          const { data, error } = await supabase
            .from("properties")
            .select("*")
            .eq("id", propertyId)
            .single();

          if (error) throw error;

          // Format property data
          let coordinates = null;
          if (data.location_coordinates) {
            try {
              // If it's a PostGIS point object
              if (data.location_coordinates.coordinates) {
                coordinates = {
                  lat: data.location_coordinates.coordinates[0],
                  lng: data.location_coordinates.coordinates[1],
                };
              }
              // If it's a string, try to parse it
              else if (typeof data.location_coordinates === "string") {
                const geoJSON = JSON.parse(data.location_coordinates);
                if (geoJSON.coordinates) {
                  coordinates = {
                    lat: geoJSON.coordinates[1],
                    lng: geoJSON.coordinates[0],
                  };
                }
              }
              // If it has direct x/y properties
              else if (data.location_coordinates.x !== undefined) {
                coordinates = {
                  lat: data.location_coordinates.y,
                  lng: data.location_coordinates.x,
                };
              }
            } catch (e) {
              console.error(
                "Error parsing coordinates for property:",
                data.id,
                e
              );
            }
          }

          const formattedProperty = {
            ...data,
            images: data.images?.length
              ? data.images.map((img) => img.url || img)
              : [],
            coordinates,
            // Add listing type specific fields
            listing_type: data.listing_type || "sale",
            rental_price: data.rental_price || null,
            rental_duration: data.rental_duration || null,
            rental_deposit: data.rental_deposit || null,
            rental_utilities_included: data.rental_utilities_included || false,
            rental_furnished: data.rental_furnished || false,
            rental_available_from: data.rental_available_from || null,
            rental_available_to: data.rental_available_to || null,
          };

          // Add to recently viewed
          get().addToRecentlyViewed(formattedProperty);

          set({
            selectedProperty: formattedProperty,
            loading: false,
          });

          return formattedProperty;
        } catch (error) {
          console.error("Error fetching property:", error);
          set({ error: error.message, loading: false });
          return null;
        }
      },

      // Fetch similar properties
      fetchSimilarProperties: async (property, limit = 3) => {
        if (!property) return;

        try {
          const { data, error } = await supabase
            .from("properties")
            .select("*")
            .eq("type", property.type)
            .neq("id", property.id)
            .limit(limit);

          if (error) throw error;

          // Format similar properties data
          const formattedProperties = data.map((property) => {
            let coordinates = null;
            if (property.location_coordinates) {
              // Same coordinate parsing logic as above
              try {
                if (property.location_coordinates.coordinates) {
                  coordinates = {
                    lat: property.location_coordinates.coordinates[0],
                    lng: property.location_coordinates.coordinates[1],
                  };
                } else if (typeof property.location_coordinates === "string") {
                  const geoJSON = JSON.parse(property.location_coordinates);
                  if (geoJSON.coordinates) {
                    coordinates = {
                      lat: geoJSON.coordinates[1],
                      lng: geoJSON.coordinates[0],
                    };
                  }
                } else if (property.location_coordinates.x !== undefined) {
                  coordinates = {
                    lat: property.location_coordinates.y,
                    lng: property.location_coordinates.x,
                  };
                }
              } catch (e) {}
            }

            return {
              ...property,
              images: property.images?.length
                ? property.images.map((img) => img.url || img)
                : [],
              coordinates,
              // Add listing type specific fields
              listing_type: property.property_type || "sale",
              rental_price: property.rental_price || null,
              rental_duration: property.rental_duration || null,
              rental_deposit: property.rental_deposit || null,
              rental_utilities_included:
                property.rental_utilities_included || false,
              rental_furnished: property.rental_furnished || false,
              rental_available_from: property.rental_available_from || null,
              rental_available_to: property.rental_available_to || null,
            };
          });

          set({ similarProperties: formattedProperties });
          return formattedProperties;
        } catch (error) {
          console.error("Error fetching similar properties:", error);
          return [];
        }
      },

      // Reset store to default values
      resetStore: () =>
        set({
          properties: [],
          filteredProperties: [],
          similarProperties: [],
          selectedProperty: null,
          loading: false,
          error: null,
          currentPage: 1,
          totalPages: 1,
          filters: {
            propertyType: "all",
            priceRange: [0, 10000000],
            location: "all",
            bedrooms: "any",
            bathrooms: "any",
            sortBy: "newest",
            property_type: "all",
          },
          // We don't reset favorites or recently viewed
        }),
    }),
    {
      name: "property-store", // Name for the persisted store in localStorage
      partialize: (state) => ({
        // Only persist these parts of the state
        favorites: state.favorites,
        recentlyViewed: state.recentlyViewed,
      }),
    }
  )
);

export default usePropertyStore;
