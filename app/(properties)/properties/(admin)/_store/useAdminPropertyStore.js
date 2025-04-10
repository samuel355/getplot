import { create } from "zustand";
import { supabase } from "@/utils/supabase/client";

const useAdminPropertyStore = create((set, get) => ({
  // Properties state
  properties: [],
  filteredProperties: [],
  selectedProperty: null,
  loading: true,
  error: null,
  
  // Pagination state
  currentPage: 1,
  totalPages: 1,
  propertiesPerPage: 10,
  totalProperties: 0,
  
  // UI state
  currentTab: "all",
  searchQuery: "",
  filterType: "all",
  sortOrder: "newest",
  
  // Stats
  stats: {
    pending: 0,
    approved: 0,
    rejected: 0,
    sold: 0,
    total: 0,
  },
  
  // Initialize and fetch properties
  fetchProperties: async (page = 1) => {
    try {
      set({ loading: true, error: null });
      
      // Calculate pagination
      const from = (page - 1) * get().propertiesPerPage;
      const to = from + get().propertiesPerPage - 1;
      
      const { data, error, count } = await supabase
        .from("properties")
        .select("*, user_id", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      // Calculate stats
      const stats = {
        pending: data.filter(p => p.status === "pending").length,
        approved: data.filter(p => p.status === "approved").length,
        rejected: data.filter(p => p.status === "rejected").length,
        sold: data.filter(p => p.status === "sold").length,
        total: count || 0,
      };
      
      set({ 
        properties: data,
        stats,
        loading: false,
        totalProperties: count || 0,
        totalPages: Math.ceil((count || 0) / get().propertiesPerPage),
        currentPage: page
      });
      
      // Apply initial filtering
      get().filterProperties();
      
    } catch (error) {
      console.error("Error fetching properties:", error);
      set({ 
        error: error.message,
        loading: false
      });
    }
  },
  
  // Filter properties based on tab, search and filters
  filterProperties: () => {
    const { properties, currentTab, searchQuery, filterType, sortOrder } = get();
    
    let filtered = [...properties];
    
    // Filter by status (tab)
    if (currentTab !== "all") {
      filtered = filtered.filter(p => p.status === currentTab);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p => 
          p.title?.toLowerCase().includes(query) ||
          p.location?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }
    
    // Filter by property type
    if (filterType !== "all") {
      filtered = filtered.filter(p => p.type === filterType);
    }
    
    // Sort properties
    if (sortOrder === "newest") {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortOrder === "oldest") {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortOrder === "price-high") {
      filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortOrder === "price-low") {
      filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    }
    
    set({ filteredProperties: filtered });
  },
  
  // Set current tab and filter properties
  setTab: (tab) => {
    set({ currentTab: tab });
    get().filterProperties();
  },
  
  // Set search query and filter properties
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().filterProperties();
  },
  
  // Set filter type and filter properties
  setFilterType: (type) => {
    set({ filterType: type });
    get().filterProperties();
  },
  
  // Set sort order and filter properties
  setSortOrder: (order) => {
    set({ sortOrder: order });
    get().filterProperties();
  },
  
  // Set current page
  setPage: (page) => {
    set({ currentPage: page });
    get().fetchProperties(page);
  },
  
  // Approve a property
  approveProperty: async (propertyId) => {
    try {
      // Update property status
      const { error } = await supabase
        .from("properties")
        .update({ 
          status: "approved", 
          updated_at: new Date().toISOString() 
        })
        .eq("id", propertyId);

      if (error) throw error;
      
      // Update local state
      const updatedProperties = get().properties.map(p => 
        p.id === propertyId ? { ...p, status: "approved" } : p
      );
      
      // Update stats
      const oldStatus = get().properties.find(p => p.id === propertyId)?.status;
      const stats = { ...get().stats };
      
      if (oldStatus) {
        stats[oldStatus] = Math.max(0, stats[oldStatus] - 1);
      }
      stats.approved += 1;
      
      set({ 
        properties: updatedProperties,
        stats
      });
      
      // Re-apply filters
      get().filterProperties();
      
      return {
        success: true,
        property: updatedProperties.find(p => p.id === propertyId)
      };
    } catch (error) {
      console.error("Error approving property:", error);
      return { success: false, error: error.message };
    }
  },
  
  // Reject a property
  rejectProperty: async (propertyId, reason) => {
    try {
      // Update property status with rejection reason
      const { error } = await supabase
        .from("properties")
        .update({ 
          status: "rejected", 
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq("id", propertyId);

      if (error) throw error;
      
      // Update local state
      const updatedProperties = get().properties.map(p => 
        p.id === propertyId ? { ...p, status: "rejected", rejection_reason: reason } : p
      );
      
      // Update stats
      const oldStatus = get().properties.find(p => p.id === propertyId)?.status;
      const stats = { ...get().stats };
      
      if (oldStatus) {
        stats[oldStatus] = Math.max(0, stats[oldStatus] - 1);
      }
      stats.rejected += 1;
      
      set({ 
        properties: updatedProperties,
        stats
      });
      
      // Re-apply filters
      get().filterProperties();
      
      return {
        success: true,
        property: updatedProperties.find(p => p.id === propertyId)
      };
    } catch (error) {
      console.error("Error rejecting property:", error);
      return { success: false, error: error.message };
    }
  }
}));

export default useAdminPropertyStore;