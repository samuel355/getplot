"use client";

import { useEffect } from "react";
import AdminLayout from "../_components/admin-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "../_components/settings/general-settings";
import { PropertySettings } from "../_components/settings/property-settings";
import { EmailSettings } from "../_components/settings/email-settings";
import { FeaturedProperties } from "../_components/settings/featured-properties";
import useSettingsStore from "../_store/useSettingsStore";
import AuthCheck from "@/app/_components/AuthCheck";

export default function SettingsPage() {
  const { fetchSettings, loading } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AuthCheck>
      <AdminLayout>
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="property">Property</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <GeneralSettings />
            </TabsContent>

            <TabsContent value="property">
              <PropertySettings />
            </TabsContent>

            <TabsContent value="email">
              <EmailSettings />
            </TabsContent>

            <TabsContent value="featured">
              <FeaturedProperties />
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </AuthCheck>
  );
}
