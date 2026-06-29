import { currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/utils/supabase/client";
import { getSiteBySlug } from "@/lib/sites";
import Link from "next/link";
import StatCard from "@/app/_components/ui/StatCard";
import { MapPin, TrendingUp, ArrowRight } from "lucide-react";

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

export default async function ManagerPage() {
  const user = await currentUser();
  const assignedSlugs = (user?.publicMetadata?.sites ?? []);
  const firstName = user?.firstName ?? "Manager";

  const sites = assignedSlugs.map(getSiteBySlug).filter(Boolean);
  const stats = await Promise.all(sites.map((s) => getSiteStats(s.table)));
  const siteData = sites.map((s, i) => ({ ...s, ...stats[i] }));

  const totalPlots = stats.reduce((a, s) => a + s.total, 0);
  const available = stats.reduce((a, s) => a + s.available, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {firstName}</h1>
        <p className="text-sm text-gray-500 mt-1">
          You manage {sites.length} site{sites.length !== 1 ? "s" : ""}.
        </p>
      </div>

      {sites.length ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard label="Total Plots (your sites)" value={totalPlots} icon={MapPin} />
            <StatCard label="Available" value={available} icon={TrendingUp} color="text-green-600" bg="bg-green-50" />
          </div>

          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Your Sites</h2>
            </div>
            <div className="divide-y">
              {siteData.map((site) => (
                <Link
                  key={site.slug}
                  href={`/manager/sites/${site.slug}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-navy/5 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-brand-navy" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{site.name}</p>
                      <p className="text-xs text-gray-400">{site.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-gray-500">{site.total} plots</span>
                    <span className="text-green-600 font-medium">{site.available} avail.</span>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-navy transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg border p-12 text-center text-gray-400">
          <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No sites assigned yet. Contact your admin.</p>
        </div>
      )}
    </div>
  );
}
