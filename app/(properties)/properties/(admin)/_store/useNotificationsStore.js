import { create } from "zustand";
import { supabase } from "@/utils/supabase/client";

const useNotificationsStore = create((set, get) => ({
  notifications: [],
  loading: false,
  error: null,
  filters: {
    type: null,
    status: null,
    dateRange: null,
  },
  sort: {
    field: "created_at",
    order: "desc",
  },

  // Fetch notifications
  fetchNotifications: async (userId, isAdmin) => {
    try {
      set({ loading: true, error: null });

      // First, get the user's properties to get the correct user_id
      const { data: userProperties, error: propertiesError } = await supabase
        .from("properties")
        .select("user_id, user_email")
        .eq("user_email", userId)
        .limit(1);

      if (propertiesError) throw propertiesError;

      // If user has properties, use that user_id, otherwise use the email
      const propertyUserId = userProperties?.[0]?.user_id;
      const userIdentifier = propertyUserId || userId;

      let query = supabase
        .from("notifications")
        .select(
          `
          *,
          properties (
            id,
            title,
            status,
            user_id,
            user_email
          )
        `
        )
        .order(get().sort.field, { ascending: get().sort.order === "asc" });

      // Apply filters
      const { filters } = get();
      if (!isAdmin) {
        // For regular users, show notifications for their properties
        query = query.or(
          `user_id.eq.${userIdentifier},properties.user_id.eq.${userIdentifier}`
        );
      }
      if (filters.type) {
        query = query.eq("type", filters.type);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.dateRange) {
        query = query
          .gte("created_at", filters.dateRange.start)
          .lte("created_at", filters.dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;
      set({ notifications: data || [], loading: false });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      set({ error: error.message, loading: false });
    }
  },

  // Set filters
  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  // Set sort
  setSort: (field, order) => {
    set({ sort: { field, order } });
  },

  // Mark notification as sent
  markAsSent: async (notificationId) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .eq("id", notificationId);

      if (error) throw error;

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId
            ? { ...n, status: "sent", sent_at: new Date().toISOString() }
            : n
        ),
      }));
    } catch (error) {
      console.error("Error marking notification as sent:", error);
      throw error;
    }
  },

  // Mark all notifications as sent
  markAllAsSent: async (userId) => {
    try {
      // Get the user's properties to get the correct user_id
      const { data: userProperties, error: propertiesError } = await supabase
        .from("properties")
        .select("user_id, user_email")
        .eq("user_email", userId)
        .limit(1);

      if (propertiesError) throw propertiesError;

      const propertyUserId = userProperties?.[0]?.user_id;
      const userIdentifier = propertyUserId || userId;

      const { error } = await supabase
        .from("notifications")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .or(
          `user_id.eq.${userIdentifier},properties.user_id.eq.${userIdentifier}`
        );

      if (error) throw error;

      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          status: "sent",
          sent_at: new Date().toISOString(),
        })),
      }));
    } catch (error) {
      console.error("Error marking all notifications as sent:", error);
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;

      set((state) => ({
        notifications: state.notifications.filter(
          (n) => n.id !== notificationId
        ),
      }));
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },

  // Clear filters
  clearFilters: () => {
    set({
      filters: {
        type: null,
        status: null,
        dateRange: null,
      },
    });
  },
}));

export default useNotificationsStore;
