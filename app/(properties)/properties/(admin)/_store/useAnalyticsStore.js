import { create } from "zustand";
import { supabase } from "@/utils/supabase/client";
import {
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
} from "date-fns";

const useAnalyticsStore = create((set, get) => ({
  // Analytics data
  propertyTrends: {
    labels: [],
    listings: [],
    approved: [],
    rejected: [],
  },
  locationStats: [],
  propertyTypeStats: [],
  userStats: {
    total: 0,
    newThisMonth: 0,
    growth: 0,
  },
  approvalStats: {
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    rate: 0,
  },
  loading: false,
  error: null,

  // Fetch property trends (last 6 months)
  fetchPropertyTrends: async () => {
    try {
      set({ loading: true });

      const sixMonthsAgo = subMonths(new Date(), 6);

      // Fetch all properties within date range
      const { data: properties, error } = await supabase
        .from("properties")
        .select("*")
        .gte("created_at", sixMonthsAgo.toISOString());

      if (error) throw error;

      // Generate labels for last 6 months
      const labels = Array.from({ length: 6 }, (_, i) => {
        const date = subMonths(new Date(), i);
        return format(date, "MMM yyyy");
      }).reverse();

      // Process data for each month
      const monthlyData = labels.map((monthLabel) => {
        const month = new Date(monthLabel + " 1");
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);

        const monthProperties = properties.filter((p) => {
          const createDate = new Date(p.created_at);
          return createDate >= monthStart && createDate <= monthEnd;
        });

        return {
          total: monthProperties.length,
          approved: monthProperties.filter((p) => p.status === "approved")
            .length,
          rejected: monthProperties.filter((p) => p.status === "rejected")
            .length,
        };
      });

      set({
        propertyTrends: {
          labels,
          listings: monthlyData.map((d) => d.total),
          approved: monthlyData.map((d) => d.approved),
          rejected: monthlyData.map((d) => d.rejected),
        },
      });
    } catch (error) {
      console.error("Error fetching property trends:", error);
      set({ error: "Failed to fetch property trends" });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch location statistics
  fetchLocationStats: async () => {
    try {
      set({ loading: true });

      const { data, error } = await supabase
        .from("properties")
        .select("location");

      if (error) throw error;

      // Count properties by location
      const locationCounts = data.reduce((acc, curr) => {
        acc[curr.location] = (acc[curr.location] || 0) + 1;
        return acc;
      }, {});

      // Convert to array and sort by count
      const locationStats = Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count);

      set({ locationStats });
    } catch (error) {
      console.error("Error fetching location stats:", error);
      set({ error: "Failed to fetch location statistics" });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch property type statistics
  fetchPropertyTypeStats: async () => {
    try {
      set({ loading: true });

      const { data, error } = await supabase.from("properties").select("type");

      if (error) throw error;

      // Count properties by type
      const typeStats = data.reduce((acc, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
      }, {});

      set({ propertyTypeStats: typeStats });
    } catch (error) {
      console.error("Error fetching property type stats:", error);
      set({ error: "Failed to fetch property type statistics" });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch approval statistics
  fetchApprovalStats: async () => {
    try {
      set({ loading: true });

      const { data, error } = await supabase
        .from("properties")
        .select("status");

      if (error) throw error;

      const stats = data.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {});

      const total = data.length;
      const approved = stats.approved || 0;
      const rejected = stats.rejected || 0;
      const pending = stats.pending || 0;

      set({
        approvalStats: {
          total,
          approved,
          rejected,
          pending,
          rate: total ? ((approved / total) * 100).toFixed(1) : 0,
        },
      });
    } catch (error) {
      console.error("Error fetching approval stats:", error);
      set({ error: "Failed to fetch approval statistics" });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch all analytics data
  fetchAllAnalytics: async () => {
    const {
      fetchPropertyTrends,
      fetchLocationStats,
      fetchPropertyTypeStats,
      fetchApprovalStats,
    } = get();

    Promise.all([
      fetchPropertyTrends(),
      fetchLocationStats(),
      fetchPropertyTypeStats(),
      fetchApprovalStats(),
    ]);
  },
}));

export default useAnalyticsStore;
