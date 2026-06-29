import Link from "next/link";
import { supabase } from "@/utils/supabase/client";
import { SITES } from "@/lib/sites";
import { MapPin, ArrowRight } from "lucide-react";

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

export default async function SitesPage() {
  const stats = await Promise.all(SITES.map((s) => getSiteStats(s.table)));
  const sites = SITES.map((site, i) => ({ ...site, ...stats[i] }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Land Sites</h1>
        <p className="text-sm text-gray-500 mt-1">Manage plots across all sites. Click a site to view and edit individual plots.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {sites.map((site) => (
          <Link
            key={site.slug}
            href={`/dashboard/sites/${site.slug}`}
            className="group bg-white rounded-2xl border p-5 hover:shadow-md hover:border-[#05014c]/30 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-[#05014c]/5 rounded-xl flex items-center justify-center group-hover:bg-[#05014c]/10 transition-colors">
                <MapPin className="w-5 h-5 text-[#05014c]" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#05014c] transition-colors" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-0.5">{site.name}</h3>
            <p className="text-xs text-gray-400 mb-4">{site.location}</p>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <MiniStat label="Total" value={site.total} color="text-gray-700" />
              <MiniStat label="Avail." value={site.available} color="text-green-600" />
              <MiniStat label="Resv." value={site.reserved} color="text-orange-500" />
              <MiniStat label="Sold" value={site.sold} color="text-red-500" />
            </div>

            {/* Availability bar */}
            <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: site.total ? `${(site.available / site.total) * 100}%` : "0%" }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {site.total ? Math.round((site.available / site.total) * 100) : 0}% available
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div>
      <p className={`font-bold text-base ${color}`}>{value}</p>
      <p className="text-gray-400">{label}</p>
    </div>
  );
}
