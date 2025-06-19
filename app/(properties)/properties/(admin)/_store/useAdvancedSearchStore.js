import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/utils/supabase/client";

const useAdvancedSearchStore = create(
  persist(
    (set, get) => ({
      // Search state
      searchQuery: "",
      filters: {
        type: "all",
        status: "all",
        priceRange: {
          min: "",
          max: "",
        },
        dateRange: {
          from: null,
          to: null,
        },
        location: "all",
        bedrooms: "any",
        bathrooms: "any",
        features: [],
        userId: null,
      },

      // Sort state
      sortBy: "created_at",
      sortOrder: "desc",

      // Saved presets
      savedPresets: [],

      // Results state
      results: [],
      totalResults: 0,
      loading: false,
      error: null,

      // Update search query
      setSearchQuery: (query) => {
        set({ searchQuery: query });
        get().executeSearch();
      },

      // Update filters
      setFilter: (key, value) => {
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: value,
          },
        }));
        get().executeSearch();
      },

      // Update multiple filters at once
      setFilters: (newFilters) => {
        set((state) => ({
          filters: {
            ...state.filters,
            ...newFilters,
          },
        }));
        get().executeSearch();
      },

      // Update sort
      setSort: (by, order) => {
        set({ sortBy: by, sortOrder: order });
        get().executeSearch();
      },

      // Save filter preset
      savePreset: (name) => {
        const { filters, sortBy, sortOrder } = get();
        set((state) => ({
          savedPresets: [
            ...state.savedPresets,
            {
              id: Date.now(),
              name,
              filters,
              sortBy,
              sortOrder,
            },
          ],
        }));
      },

      // Load preset
      loadPreset: (presetId) => {
        const { savedPresets } = get();
        const preset = savedPresets.find((p) => p.id === presetId);
        if (preset) {
          set({
            filters: preset.filters,
            sortBy: preset.sortBy,
            sortOrder: preset.sortOrder,
          });
          get().executeSearch();
        }
      },

      // Delete preset
      deletePreset: (presetId) => {
        set((state) => ({
          savedPresets: state.savedPresets.filter((p) => p.id !== presetId),
        }));
      },

      // Execute search
      executeSearch: async () => {
        try {
          set({ loading: true, error: null });
          const { searchQuery, filters, sortBy, sortOrder } = get();

          let query = supabase
            .from("properties")
            .select("*", { count: "exact" });

          // Apply text search
          if (searchQuery) {
            // Properly escape the searchQuery for use in the ilike pattern
            const queryPattern = `%${searchQuery.replace(/%/g, "\\%")}%`;

            query = query.or(
              `title.ilike."${queryPattern}",description.ilike."${queryPattern}",location.ilike."${queryPattern}"`
            );
          }

          // Apply filters
          if (filters.type !== "all") {
            query = query.eq("type", filters.type);
          }

          if (filters.status !== "all") {
            query = query.eq("status", filters.status);
          }

          if (filters.priceRange.min) {
            query = query.gte("price", filters.priceRange.min);
          }

          if (filters.priceRange.max) {
            query = query.lte("price", filters.priceRange.max);
          }

          if (filters.dateRange.from) {
            query = query.gte("created_at", filters.dateRange.from);
          }

          if (filters.dateRange.to) {
            query = query.lte("created_at", filters.dateRange.to);
          }

          if (filters.location !== "all") {
            query = query.eq("location", filters.location);
          }

          if (filters.bedrooms !== "any") {
            query = query.eq("bedrooms", filters.bedrooms);
          }

          if (filters.bathrooms !== "any") {
            query = query.eq("bathrooms", filters.bathrooms);
          }

          if (filters.features.length > 0) {
            query = query.contains("features", filters.features);
          }

          if (filters.userId) {
            query = query.eq("user_id", filters.userId);
          }

          // Apply sorting
          query = query.order(sortBy, { ascending: sortOrder === "asc" });

          const { data, error, count } = await query;

          if (error) throw error;

          set({
            results: data,
            totalResults: count,
            loading: false,
          });
        } catch (error) {
          console.error("Search error:", error);
          set({
            error: "Failed to execute search",
            loading: false,
          });
        }
      },

      // Reset filters
      resetFilters: () => {
        set({
          searchQuery: "",
          filters: {
            type: "all",
            status: "all",
            priceRange: {
              min: "",
              max: "",
            },
            dateRange: {
              from: null,
              to: null,
            },
            location: "all",
            bedrooms: "any",
            bathrooms: "any",
            features: [],
            userId: null,
          },
          sortBy: "created_at",
          sortOrder: "desc",
        });
        get().executeSearch();
      },
    }),
    {
      name: "advanced-search-store",
      // Only persist saved presets
      partialize: (state) => ({
        savedPresets: state.savedPresets,
      }),
    }
  )
);

export default useAdvancedSearchStore;
