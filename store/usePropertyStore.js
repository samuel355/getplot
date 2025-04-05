import { supabase } from '@/utils/supabase/client';
import { create } from 'zustand';

const usePropertyStore = create((set, get) => ({
  // Properties state
  properties: [],
  filteredProperties: [],
  similarProperties: [],
  selectedProperty: null,
  loading: false,
  error: null,
  
  // Pagination state
  currentPage: 1,
  totalPages: 1,
  propertiesPerPage: 9,
  totalProperties: 0,
  
  // Filters state
  filters: {
    propertyType: 'all',
    priceRange: [0, 10000000],
    location: 'all',
    bedrooms: 'any',
    bathrooms: 'any',
    sortBy: 'newest',
  },
  
  // Actions
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
    currentPage: 1, // Reset to page 1 when filters change
  })),
  
  setPage: (page) => set({ currentPage: page }),
  
  toggleFavorite: (propertyId) => {
    set((state) => {
      // Implement favorite toggling logic here
      // This is a placeholder that you'll need to expand based on your requirements
      return { ...state };
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
      
      let query = supabase
        .from('properties')
        .select(
          'id, title, type, price, location, address, size, bedrooms, bathrooms, images, status, created_at, location_coordinates',
          { count: 'exact' } // Get total count for pagination
        );
      
      // Apply filters
      if (filters.propertyType !== 'all') {
        query = query.eq('type', filters.propertyType);
      }
      
      query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1]);
      
      if (filters.location !== 'all') {
        query = query.eq('location', filters.location);
      }
      
      if (filters.bedrooms !== 'any' && filters.propertyType !== 'land') {
        query = query.gte('bedrooms', filters.bedrooms);
      }
      
      if (filters.bathrooms !== 'any' && filters.propertyType !== 'land') {
        query = query.gte('bathrooms', filters.bathrooms);
      }
      
      // Apply sorting
      if (filters.sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (filters.sortBy === 'price-asc') {
        query = query.order('price', { ascending: true });
      } else if (filters.sortBy === 'price-desc') {
        query = query.order('price', { ascending: false });
      }
      
      // Apply pagination
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
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
        
        return {
          ...property,
          images: property.images?.length
            ? property.images.map((img) => img.url || img)
            : [],
          coordinates,
        };
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
      console.error('Error fetching properties:', error);
      set({ error: error.message, loading: false });
    }
  },
  
  // Fetch a single property by ID
  fetchPropertyById: async (propertyId) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();
      
      if (error) throw error;
      
      // Format property data (similar to above)
      let coordinates = null;
      if (data.location_coordinates) {
        // Same coordinate parsing as in fetchProperties
        // ...
      }
      
      const formattedProperty = {
        ...data,
        images: data.images?.length
          ? data.images.map((img) => img.url || img)
          : [],
        coordinates,
      };
      
      set({
        selectedProperty: formattedProperty,
        loading: false,
      });
      
      return formattedProperty;
    } catch (error) {
      console.error('Error fetching property:', error);
      set({ error: error.message, loading: false });
      return null;
    }
  },
  
  // Fetch similar properties
  fetchSimilarProperties: async (property, limit = 3) => {
    if (!property) return;
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('type', property.type)
        .neq('id', property.id)
        .limit(limit);
      
      if (error) throw error;
      
      // Format similar properties data (similar to above)
      const formattedProperties = data.map(property => {
        // Same formatting as in fetchProperties
        // ...
        
        return {
          ...property,
          images: property.images?.length
            ? property.images.map((img) => img.url || img)
            : [],
        };
      });
      
      set({ similarProperties: formattedProperties });
    } catch (error) {
      console.error('Error fetching similar properties:', error);
    }
  },
  
  // Reset store to default values
  resetStore: () => set({
    properties: [],
    filteredProperties: [],
    similarProperties: [],
    selectedProperty: null,
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
  }),
}));

export default usePropertyStore;