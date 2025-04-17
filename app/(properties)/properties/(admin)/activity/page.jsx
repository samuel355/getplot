"use client";

import { useEffect } from "react";
import AdminLayout from "../_components/admin-layout";
import { LogFilters } from "../_components/activity/log-filters";
import { LogTable } from "../_components/activity/log-table";
import { LogPagination } from "../_components/activity/log-pagination";
import useActivityLogStore from "../_store/useActivityLogStore";
import AuthCheck from "@/app/_components/AuthCheck";

export default function ActivityLogsPage() {
  const { logs, loading, error, fetchLogs } = useActivityLogStore();

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

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
        <div className="p-8">
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            Error: {error}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AuthCheck>
      <AdminLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Activity Logs</h1>

        <LogFilters />

        <div className="bg-white rounded-lg shadow">
          <LogTable logs={logs} />
        </div>

        <div className="mt-6 flex justify-center">
          <LogPagination />
        </div>
      </div>
    </AdminLayout>
    </AuthCheck>
  );
}