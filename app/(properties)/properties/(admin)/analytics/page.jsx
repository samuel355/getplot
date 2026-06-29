"use client";

import { useEffect } from "react";
import AdminLayout from "../_components/admin-layout";
import { TrendChart } from "../_components/analytics/trend-chart";
import { LocationChart } from "../_components/analytics/location-chart";
import { PropertyTypeChart } from "../_components/analytics/property-type-chart";
import { StatsCards } from "../_components/analytics/stats-cards";
import useAnalyticsStore from "../_store/useAnalyticsStore";
import AuthCheck from "@/app/_components/AuthCheck";

export default function AnalyticsPage() {
  const {
    propertyTrends,
    locationStats,
    propertyTypeStats,
    approvalStats,
    loading,
    error,
    fetchAllAnalytics,
  } = useAnalyticsStore();

  useEffect(() => {
    fetchAllAnalytics();
  }, [fetchAllAnalytics]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-4 text-red-500">Error loading analytics: {error}</div>
      </AdminLayout>
    );
  }

  return (
    <AuthCheck>
      <AdminLayout>
        <div className="p-8 space-y-8">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

          {/* Stats Cards */}
          <StatsCards approvalStats={approvalStats} />

          {/* Charts Grid */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Property Trends */}
            <div className="col-span-2">
              <TrendChart data={propertyTrends} />
            </div>

            {/* Location Distribution */}
            <div>
              <LocationChart data={locationStats} />
            </div>

            {/* Property Types */}
            <div>
              <PropertyTypeChart data={propertyTypeStats} />
            </div>
          </div>
        </div>
      </AdminLayout>
    </AuthCheck>
  );
}
