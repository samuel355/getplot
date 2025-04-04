import { supabase } from '@/utils/supabase/client';
import { create } from 'zustand';

const usePropertyStore = create((set, get) => ({
  // State
  properties: [],
  filteredProperties: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 9,
    totalCount: 0,
    totalPages: 0
  },
  filters: {
    propertyType: 'all',
    priceRange: [0, 1000000],
    location: 'all',
    bedrooms: 'any',
    bathrooms: 'any',
    sortBy: 'newest',
    searchQuery: ''
  },
  
  // Actions
  fetchProperties: async () => {
    set({ loading: true, error: null });
    
    try {
      // Prepare query with pagination
      const { page, pageSize } = get().pagination;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Build the query with filters
      let query = supabase
        .from('properties')
        .select('*', { count: 'exact' });
      
      // Apply filters
      const { propertyType, priceRange, location, bedrooms, bathrooms, sortBy } = get().filters;
      
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
      
      // Execute the query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      // Transform coordinates from PostGIS point to regular lat/lng format
      const transformedData = data.map(property => {
        // Check if location_coordinates exists and extract lat/lng
        const coordinates = property.location_coordinates 
          ? {
              lat: parseFloat(property.location_coordinates.coordinates[1]),
              lng: parseFloat(property.location_coordinates.coordinates[0])
            }
          : null;
        
        return {
          ...property,
          coordinates
        };
      });
      
      // Update pagination
      const totalPages = Math.ceil(count / pageSize);
      
      set({
        properties: transformedData,
        filteredProperties: transformedData,
        pagination: {
          ...get().pagination,
          totalCount: count,
          totalPages
        },
        loading: false
      });
      
    } catch (error) {
      console.error('Error fetching properties:', error);
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
  
  setPageSize: (pageSize) => {
    set(state => ({
      pagination: {
        ...state.pagination,
        pageSize,
        page: 1 // Reset to first page when changing page size
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
  },
  
  searchProperties: (searchQuery) => {
    set(state => ({
      filters: {
        ...state.filters,
        searchQuery
      },
      pagination: {
        ...state.pagination,
        page: 1 // Reset to first page when searching
      }
    }));
    
    // Handle client-side search if needed (for already loaded properties)
    if (searchQuery.trim() === '') {
      set(state => ({ filteredProperties: state.properties }));
      return;
    }
    
    const query = searchQuery.toLowerCase();
    set(state => ({
      filteredProperties: state.properties.filter(property => 
        property.title?.toLowerCase().includes(query) ||
        property.description?.toLowerCase().includes(query) ||
        property.location?.toLowerCase().includes(query)
      )
    }));
    
    get().fetchProperties();
  },
  
  resetFilters: () => {
    set({
      filters: {
        propertyType: 'all',
        priceRange: [0, 1000000],
        location: 'all',
        bedrooms: 'any',
        bathrooms: 'any',
        sortBy: 'newest',
        searchQuery: ''
      },
      pagination: {
        ...get().pagination,
        page: 1
      }
    });
    get().fetchProperties();
  }
}));

export default usePropertyStore;