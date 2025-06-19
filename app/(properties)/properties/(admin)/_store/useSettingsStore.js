import { create } from "zustand";
import { supabase } from "@/utils/supabase/client";

const useSettingsStore = create((set, get) => ({
  // Settings state
  settings: {
    general: {
      siteName: "Property Manager",
      supportEmail: "",
      maxImagesPerProperty: 10,
      allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
      maxImageSize: 5, // in MB
    },
    property: {
      requireApproval: true,
      minPrice: 0,
      maxPrice: 10000000,
      allowNegotiable: true,
      requiredFields: ["title", "description", "location", "price"],
      houseFields: ["bedrooms", "bathrooms", "size"],
      landFields: ["size"],
    },
    email: {
      templates: {},
      notifications: {
        propertyApproved: true,
        propertyRejected: true,
        userBanned: true,
        userUnbanned: true,
      },
    },
    featured: {
      maxFeaturedProperties: 6,
      featuredDuration: 30, // days
      autoRemoveExpired: true,
    },
  },
  featuredProperties: [],
  loading: false,
  error: null,

  // Fetch settings from database
  fetchSettings: async () => {
    try {
      set({ loading: true });

      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .single();

      if (error) throw error;

      set({ settings: data || get().settings });
    } catch (error) {
      console.error("Error fetching settings:", error);
      set({ error: "Failed to fetch settings" });
    } finally {
      set({ loading: false });
    }
  },

  // Update settings
  updateSettings: async (section, newSettings) => {
    try {
      set({ loading: true });

      const updatedSettings = {
        ...get().settings,
        [section]: {
          ...get().settings[section],
          ...newSettings,
        },
      };

      const { error } = await supabase.from("settings").upsert({
        id: 1, // Assuming single settings record
        ...updatedSettings,
        updated_at: new Date(),
      });

      if (error) throw error;

      set({ settings: updatedSettings });
      return { success: true };
    } catch (error) {
      console.error("Error updating settings:", error);
      set({ error: "Failed to update settings" });
      return { success: false, error };
    } finally {
      set({ loading: false });
    }
  },

  // Fetch featured properties
  fetchFeaturedProperties: async () => {
    try {
      set({ loading: true });

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("featured", true)
        .order("featured_until", { ascending: true });

      if (error) throw error;

      set({ featuredProperties: data });
    } catch (error) {
      console.error("Error fetching featured properties:", error);
      set({ error: "Failed to fetch featured properties" });
    } finally {
      set({ loading: false });
    }
  },

  // Toggle featured status
  toggleFeatured: async (propertyId, featured) => {
    try {
      set({ loading: true });

      const featuredUntil = featured
        ? new Date(
            Date.now() +
              get().settings.featured.featuredDuration * 24 * 60 * 60 * 1000
          )
        : null;

      const { error } = await supabase
        .from("properties")
        .update({
          featured,
          featured_until: featuredUntil,
          updated_at: new Date(),
        })
        .eq("id", propertyId);

      if (error) throw error;

      // Refresh featured properties
      await get().fetchFeaturedProperties();

      return { success: true };
    } catch (error) {
      console.error("Error updating featured status:", error);
      return { success: false, error };
    } finally {
      set({ loading: false });
    }
  },

  // Update email template
  updateEmailTemplate: async (templateName, content) => {
    try {
      set({ loading: true });

      const { settings } = get();
      const updatedTemplates = {
        ...settings.email.templates,
        [templateName]: content,
      };

      const result = await get().updateSettings("email", {
        templates: updatedTemplates,
      });

      return result;
    } catch (error) {
      console.error("Error updating email template:", error);
      return { success: false, error };
    } finally {
      set({ loading: false });
    }
  },
}));

export default useSettingsStore;
