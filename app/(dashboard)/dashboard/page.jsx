import { currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";
import { SITES } from "@/lib/sites";
import StatCard from "@/app/_components/ui/StatCard";
import { MapPin, List, TrendingUp, ArrowRight } from "lucide-react";

async function getSiteStats(table) {
  try {
    const { data } = await supabase.from(table).select("status");
    if (!data) return { total: 0, available: 0, sold: 0, reserved: 0 };
    return {
      total: data.length,
      available: data.filter((p) => ["Available", "AVAILABLE"].includes(p.status)).length,
      sold: data.filter((p) => ["Sold", "SOLD"].includes(p.status)).length,
      reserved: data.filter((p) => ["Reserved", "RESERVED"].includes(p.status)).length,
    };
  } catch {
    return { total: 0, available: 0, sold: 0, reserved: 0 };
  }
}

async function getPropertyCount() {
  try {
    const { count } = await supabase.from("properties").select("id", { count: "exact", head: true });
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function DashboardPage() {
  const user = await currentUser();
  const firstName = user?.firstName ?? "Admin";

  const [propCount, ...siteStats] = await Promise.all([
    getPropertyCount(),
    ...SITES.map((s) => getSiteStats(s.table)),
  ]);

  const totalPlots = siteStats.reduce((a, s) => a + s.total, 0);
  const availablePlots = siteStats.reduce((a, s) => a + s.available, 0);
  const soldPlots = siteStats.reduce((a, s) => a + s.sold, 0);
  const siteOverview = SITES.map((site, i) => ({ ...site, ...siteStats[i] }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of all land sites and marketplace listings.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Plots" value={totalPlots} icon={MapPin} />
        <StatCard label="Available" value={availablePlots} icon={TrendingUp} color="text-green-600" bg="bg-green-50" />
        <StatCard label="Sold" value={soldPlots} icon={TrendingUp} color="text-red-500" bg="bg-red-50" />
        <StatCard label="Listings" value={propCount} icon={List} color="text-orange-500" bg="bg-orange-50" />
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Sites Overview</h2>
          <Link href="/dashboard/sites" className="text-sm text-[#05014c] hover:underline flex items-center gap-1">
            Manage all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Site", "Location", "Total", "Available", "Reserved", "Sold", ""].map((h) => (
                  <th key={h} className={`px-5 py-3 font-medium text-gray-500 ${h === "" || h === "Total" || h === "Available" || h === "Reserved" || h === "Sold" ? "text-center" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {siteOverview.map((site) => (
                <tr key={site.slug} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{site.name}</td>
                  <td className="px-5 py-3.5 text-gray-500">{site.location}</td>
                  <td className="px-5 py-3.5 text-center text-gray-700">{site.total}</td>
                  <td className="px-5 py-3.5 text-center font-medium text-green-600">{site.available}</td>
                  <td className="px-5 py-3.5 text-center font-medium text-orange-500">{site.reserved}</td>
                  <td className="px-5 py-3.5 text-center font-medium text-red-500">{site.sold}</td>
                  <td className="px-5 py-3.5">
                    <Link href={`/dashboard/sites/${site.slug}`} className="text-[#05014c] hover:underline text-xs font-medium">
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
