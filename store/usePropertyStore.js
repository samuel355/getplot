import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const usePropertyStore = create((set, get) => ({
  // State
  properties: [],
  loading: false,
  error: null,
  filters: {
    propertyType: 'all',
    priceRange: [0, 1000000],
    location: 'all',
    bedrooms: 'any',
    bathrooms: 'any',
    sortBy: 'newest'
  },
  pagination: {
    page: 1,
    pageSize: 9,
    totalCount: 0,
    totalPages: 0
  },
  
  // Actions
  fetchProperties: async () => {
    set({ loading: true, error: null });
    
    try {
      // Get current pagination and filters
      const { page, pageSize } = get().pagination;
      const { propertyType, priceRange, location, bedrooms, bathrooms, sortBy } = get().filters;
      
      // Calculate range for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Start building the query
      let query = supabase.from('properties').select('*', { count: 'exact' });
      
      // Apply filters
      if (propertyType !== 'all') {
        query = query.eq('type', propertyType);
      }
      
      if (priceRange[0] > 0) {
        query = query.gte('price', priceRange[0]);
      }
      
      if (priceRange[1] < 1000000) {
        query = query.lte('price', priceRange[1]);
      }
      
      if (location !== 'all') {
        query = query.ilike('location', `%${location}%`);
      }
      
      if (bedrooms !== 'any' && propertyType !== 'land') {
        query = query.gte('bedrooms', bedrooms);
      }
      
      if (bathrooms !== 'any' && propertyType !== 'land') {
        query = query.gte('bathrooms', bathrooms);
      }
      
      // Apply sorting
      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'price-asc') {
        query = query.order('price', { ascending: true });
      } else if (sortBy === 'price-desc') {
        query = query.order('price', { ascending: false });
      }
      
      // Apply pagination
      query = query.range(from, to);
      
      // Execute query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      // Process data to format coordinates
      const processedData = data.map(property => {
        // Add coordinates in the format your map component expects
        let coordinates = null;
        
        if (property.location_coordinates) {
          try {
            // If location_coordinates is a PostGIS point stored as text or object
            if (typeof property.location_coordinates === 'string') {
              // Parse from WKT format or JSON string
              if (property.location_coordinates.startsWith('POINT')) {
                // Extract coordinates from WKT format: POINT(lng lat)
                const match = property.location_coordinates.match(/POINT\((.+) (.+)\)/);
                if (match) {
                  coordinates = {
                    lng: parseFloat(match[1]),
                    lat: parseFloat(match[2])
                  };
                }
              } else {
                // Try parsing as JSON
                const parsed = JSON.parse(property.location_coordinates);
                coordinates = {
                  lat: parsed.coordinates ? parsed.coordinates[1] : parsed.y || parsed.lat,
                  lng: parsed.coordinates ? parsed.coordinates[0] : parsed.x || parsed.lng
                };
              }
            } else if (property.location_coordinates.coordinates) {
              // PostGIS typically stores as [longitude, latitude]
              coordinates = {
                lat: property.location_coordinates.coordinates[1],
                lng: property.location_coordinates.coordinates[0]
              };
            }
          } catch (e) {
            console.error("Error parsing coordinates:", e);
          }
        }
        
        return {
          ...property,
          coordinates
        };
      });
      
      // Calculate total pages
      const totalPages = Math.ceil(count / pageSize);
      
      set({
        properties: processedData,
        loading: false,
        pagination: {
          ...get().pagination,
          totalCount: count,
          totalPages
        }
      });
    } catch (error) {
      console.error("Error fetching properties:", error);
      set({ error: error.message, loading: false });
    }
  },
  
  setPage: (page) => {
    set(state => ({
      pagination: {
        ...state.pagination,
        page
      }
    }));
    get().fetchProperties();
  },
  
  updateFilters: (newFilters) => {
    set(state => ({
      filters: {
        ...state.filters,
        ...newFilters
      },
      pagination: {
        ...state.pagination,
        page: 1 // Reset to first page when filters change
      }
    }));
    get().fetchProperties();
  }
}));

export default usePropertyStore;