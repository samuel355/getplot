import { create } from "zustand";
import { supabase } from "@/utils/supabase/client";

const formatDateForSupabase = (date) => {
  if (!date) return null;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split(".")[0];
  } catch (error) {
    console.error("Error formatting date:", error);
    return null;
  }
};

const useActivityLogStore = create((set, get) => ({
  logs: [],
  filteredLogs: [],
  loading: false,
  error: null,
  filters: {
    type: "all",
    status: "all",
    dateRange: {
      from: null,
      to: null,
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
        .from("activity_logs")
        .select("*", { count: "exact" });

      // Apply filters
      if (filters.type !== "all") {
        query = query.eq("type", filters.type);
      }

      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      const fromDate = formatDateForSupabase(filters.dateRange.from);
      if (fromDate) {
        query = query.gte("created_at", fromDate);
      }

      const toDate = formatDateForSupabase(filters.dateRange.to);
      if (toDate) {
        query = query.lte("created_at", toDate);
      }

      // Apply pagination
      const from = (page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      query = query.order("created_at", { ascending: false }).range(from, to);

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
      console.error("Error fetching activity logs:", error);
      set({
        error: "Failed to fetch activity logs",
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
      const { error } = await supabase.from("activity_logs").insert({
        ...logData,
        created_at: formatDateForSupabase(new Date()),
      });

      if (error) throw error;

      // Refresh logs
      await get().fetchLogs(get().pagination.page);
      return { success: true };
    } catch (error) {
      console.error("Error creating activity log:", error);
      return { success: false, error };
    }
  },
}));

export default useActivityLogStore;
