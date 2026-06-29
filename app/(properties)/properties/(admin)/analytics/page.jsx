"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLayout from "../_components/admin-layout";
import { StatsCards } from "../_components/analytics/stats-cards";
import useAnalyticsStore from "../_store/useAnalyticsStore";
import AuthCheck from "@/app/_components/AuthCheck";

const TrendChart = dynamic(
  () => import("../_components/analytics/trend-chart").then((mod) => mod.TrendChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);
const LocationChart = dynamic(
  () => import("../_components/analytics/location-chart").then((mod) => mod.LocationChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);
const PropertyTypeChart = dynamic(
  () => import("../_components/analytics/property-type-chart").then((mod) => mod.PropertyTypeChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

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

function ChartSkeleton() {
  return <div className="h-80 animate-pulse rounded-lg bg-white shadow" />;
}
