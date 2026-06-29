import { currentUser } from "@clerk/nextjs/server";
import { getSiteBySlug } from "@/lib/sites";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";

async function getSiteStats(table) {
  try {
    const { data } = await supabase.from(table).select("status");
    if (!data) return { total: 0, available: 0 };
    return {
      total: data.length,
      available: data.filter((p) => ["Available", "AVAILABLE"].includes(p.status)).length,
    };
  } catch {
    return { total: 0, available: 0 };
  }
}

export default async function ManagerSitesPage() {
  const user = await currentUser();
  const assignedSlugs = user?.publicMetadata?.sites ?? [];
  const sites = assignedSlugs.map(getSiteBySlug).filter(Boolean);
  const stats = await Promise.all(sites.map((s) => getSiteStats(s.table)));
  const siteData = sites.map((s, i) => ({ ...s, ...stats[i] }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Sites</h1>
        <p className="text-sm text-gray-500 mt-1">Sites assigned to you for management.</p>
      </div>

      {siteData.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {siteData.map((site) => (
            <Link
              key={site.slug}
              href={`/manager/sites/${site.slug}`}
              className="group bg-white rounded-lg border p-5 hover:shadow-md hover:border-brand-teal/40 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-brand-navy/5 rounded-lg flex items-center justify-center group-hover:bg-brand-navy/10 transition-colors">
                  <MapPin className="w-5 h-5 text-brand-navy" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-navy transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-0.5">{site.name}</h3>
              <p className="text-xs text-gray-400 mb-4">{site.location}</p>
              <div className="flex gap-4 text-sm">
                <span className="text-gray-500">{site.total} plots</span>
                <span className="text-green-600 font-medium">{site.available} available</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border p-16 text-center text-gray-400">
          <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No sites assigned. Contact your admin.</p>
        </div>
      )}
    </div>
  );
}
