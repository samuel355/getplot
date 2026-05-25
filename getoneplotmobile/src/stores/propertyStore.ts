import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { normalizePropertyImages } from "../lib/images";
import { supabase } from "../lib/supabase";
import type { Property, PropertyFilters } from "../types/property";

function mapProperty(row: Record<string, unknown>): Property {
  const p = row as Property;
  return {
    ...p,
    images: normalizePropertyImages(p.images),
  };
}

type PropertyState = {
  properties: Property[];
  filteredProperties: Property[];
  selectedProperty: Property | null;
  favorites: Property[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalProperties: number;
  propertiesPerPage: number;
  filters: PropertyFilters;
  setFilters: (f: Partial<PropertyFilters>) => void;
  setPage: (page: number) => void;
  fetchProperties: (page?: number) => Promise<void>;
  fetchPropertyById: (id: string) => Promise<Property | null>;
  fetchFavorites: (userId: string) => Promise<void>;
  toggleFavorite: (
    propertyId: string,
    userId?: string,
  ) => Promise<{ success: boolean; isFavorite: boolean; message?: string }>;
  isFavorite: (propertyId: string) => boolean;
};

const defaultFilters: PropertyFilters = {
  propertyType: "all",
  priceRange: [0, 10000000],
  location: "all",
  bedrooms: "any",
  bathrooms: "any",
  sortBy: "newest",
  property_type: "all",
};

export const usePropertyStore = create<PropertyState>()(
  persist(
    (set, get) => ({
      properties: [],
      filteredProperties: [],
      selectedProperty: null,
      favorites: [],
      loading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      totalProperties: 0,
      propertiesPerPage: 12,
      filters: defaultFilters,

      setFilters: (newFilters) =>
        set((s) => ({
          filters: { ...s.filters, ...newFilters },
          currentPage: 1,
        })),

      setPage: (page) => set({ currentPage: page }),

      fetchProperties: async (page = 1) => {
        const { filters, propertiesPerPage } = get();
        set({ loading: true, error: null });
        try {
          const from = (page - 1) * propertiesPerPage;
          const to = from + propertiesPerPage - 1;

          let query = supabase
            .from("properties")
            .select(
              "id, title, type, price, location, address, size, bedrooms, bathrooms, images, status, created_at, description, features, region, property_type, rental_price, listing_type, negotiable",
              { count: "exact" },
            )
            .eq("status", "approved");

          if (filters.propertyType !== "all") {
            query = query.eq("type", filters.propertyType);
          }
          if (filters.property_type !== "all") {
            query = query.eq("listing_type", filters.property_type);
          }
          if (filters.location !== "all") {
            query = query.eq("region", filters.location);
          }
          if (filters.bedrooms !== "any" && filters.propertyType !== "land") {
            query = query.gte("bedrooms", parseInt(filters.bedrooms, 10));
          }
          if (filters.bathrooms !== "any" && filters.propertyType !== "land") {
            query = query.gte("bathrooms", parseInt(filters.bathrooms, 10));
          }
          const [minPrice, maxPrice] = filters.priceRange;
          if (minPrice > 0 || maxPrice < 10000000) {
            if (filters.property_type === "rent" || filters.property_type === "airbnb") {
              query = query.gte("rental_price", minPrice).lte("rental_price", maxPrice);
            } else {
              query = query.gte("price", minPrice).lte("price", maxPrice);
            }
          }

          switch (filters.sortBy) {
            case "price-low":
              query = query.order("price", { ascending: true });
              break;
            case "price-high":
              query = query.order("price", { ascending: false });
              break;
            default:
              query = query.order("created_at", { ascending: false });
          }

          const { data, error, count } = await query.range(from, to);
          if (error) throw error;

          const total = count || 0;
          const mapped = (data || []).map((row) => mapProperty(row as Record<string, unknown>));
          set({
            properties: mapped,
            filteredProperties: mapped,
            totalProperties: total,
            totalPages: Math.max(1, Math.ceil(total / propertiesPerPage)),
            currentPage: page,
            loading: false,
          });
        } catch (e) {
          set({
            loading: false,
            error: e instanceof Error ? e.message : "Failed to load properties",
          });
        }
      },

      fetchPropertyById: async (id) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("properties")
            .select("*")
            .eq("id", id)
            .single();
          if (error) throw error;
          const property = mapProperty(data as Record<string, unknown>);
          set({ selectedProperty: property, loading: false });
          return property;
        } catch (e) {
          set({
            loading: false,
            error: e instanceof Error ? e.message : "Property not found",
          });
          return null;
        }
      },

      fetchFavorites: async (userId) => {
        const { data, error } = await supabase
          .from("favorites")
          .select(
            `property_id, properties (id, title, price, location, type, images, bedrooms, bathrooms, size, description, created_at, listing_type, rental_price)`,
          )
          .eq("user_id", userId);
        if (error) return;
        const favorites = (data || [])
          .map((row: { properties: Property | Property[] | null }) => {
            const p = Array.isArray(row.properties) ? row.properties[0] : row.properties;
            return p;
          })
          .filter(Boolean)
          .map((p) => mapProperty(p as Record<string, unknown>));
        set({ favorites });
      },

      toggleFavorite: async (propertyId, userId) => {
        if (!userId) {
          return {
            success: false,
            isFavorite: get().isFavorite(propertyId),
            message: "Sign in to save properties",
          };
        }
        const isFav = get().isFavorite(propertyId);
        try {
          if (isFav) {
            await supabase
              .from("favorites")
              .delete()
              .eq("user_id", userId)
              .eq("property_id", propertyId);
            set((s) => ({
              favorites: s.favorites.filter((f) => f.id !== propertyId),
            }));
          } else {
            await supabase.from("favorites").insert([{ user_id: userId, property_id: propertyId }]);
            const property =
              get().properties.find((p) => p.id === propertyId) || get().selectedProperty;
            if (property) {
              set((s) => ({ favorites: [...s.favorites, property] }));
            }
          }
          return { success: true, isFavorite: !isFav };
        } catch (e) {
          return {
            success: false,
            isFavorite: isFav,
            message: e instanceof Error ? e.message : "Failed",
          };
        }
      },

      isFavorite: (propertyId) => get().favorites.some((f) => f.id === propertyId),
    }),
    {
      name: "getoneplot-properties",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ favorites: s.favorites }),
    },
  ),
);
