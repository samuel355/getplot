import { create } from 'zustand';
import { supabase } from "@/utils/supabase/client";

const useActivityLogStore = create((set, get) => ({
  logs: [],
  filteredLogs: [],
  loading: false,
  error: null,
  filters: {
    type: 'all',
    user: '',
    dateRange: {
      from: null,
      to: null
    },
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },

  // Fetch activity logs
  fetchLogs: async (page = 1) => {
    try {
      set({ loading: true });
      const { filters, pagination } = get();
      
      let query = supabase
        .from('activity_logs')
        .select('*, user:user_id(*)', { count: 'exact' });

      // Apply filters
      if (filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      if (filters.user) {
        query = query.eq('user_id', filters.user);
      }

      if (filters.dateRange.from) {
        query = query.gte('created_at', filters.dateRange.from);
      }

      if (filters.dateRange.to) {
        query = query.lte('created_at', filters.dateRange.to);
      }

      // Apply pagination
      const from = (page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      set({
        logs: data,
        filteredLogs: data,
        pagination: {
          ...pagination,
          page,
          total: count,
        },
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      set({ 
        error: 'Failed to fetch activity logs',
        loading: false,
      });
    }
  },

  // Set filters
  setFilters: (newFilters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
      },
    }));
    get().fetchLogs(1); // Reset to first page when filters change
  },

  // Create new log entry
  createLog: async (logData) => {
    try {
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          ...logData,
          created_at: new Date(),
        });

      if (error) throw error;

      // Refresh logs
      await get().fetchLogs(get().pagination.page);
      return { success: true };
    } catch (error) {
      console.error('Error creating activity log:', error);
      return { success: false, error };
    }
  },
}));

export default useActivityLogStore;