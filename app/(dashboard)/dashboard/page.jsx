import Link from "next/link";
import { clerkClient } from "@clerk/nextjs/server";
import { ArrowRight, Building2, LandPlot, ShieldCheck, Users2 } from "lucide-react";
import { SITES } from "@/lib/sites";
import { supabase } from "@/utils/supabase/client";

async function getSiteStats(table) {
  try {
    const { data } = await supabase.from(table).select("status");
    if (!data) return { total: 0, available: 0, reserved: 0, sold: 0 };

    return {
      total: data.length,
      available: data.filter((plot) => ["Available", "AVAILABLE"].includes(plot.status)).length,
      reserved: data.filter((plot) => ["Reserved", "RESERVED"].includes(plot.status)).length,
      sold: data.filter((plot) => ["Sold", "SOLD"].includes(plot.status)).length,
    };
  } catch {
    return { total: 0, available: 0, reserved: 0, sold: 0 };
  }
}

async function getPropertyCount() {
  try {
    const { count } = await supabase
      .from("properties")
      .select("id", { count: "exact", head: true });
    return count ?? 0;
  } catch {
    return 0;
  }
}

async function getUserCount() {
  try {
    const client = await clerkClient();
    const users = await client.users.getUserList({ limit: 1 });
    return users.totalCount ?? users.data?.length ?? 0;
  } catch {
    return 0;
  }
}

export default async function Dashboard() {
  const [siteStats, propertyCount, userCount] = await Promise.all([
    Promise.all(SITES.map((site) => getSiteStats(site.table))),
    getPropertyCount(),
    getUserCount(),
  ]);

  const sites = SITES.map((site, index) => ({ ...site, ...siteStats[index] }));
  const totals = siteStats.reduce(
    (sum, site) => ({
      plots: sum.plots + site.total,
      available: sum.available + site.available,
      reserved: sum.reserved + site.reserved,
      sold: sum.sold + site.sold,
    }),
    { plots: 0, available: 0, reserved: 0, sold: 0 },
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-teal">Admin dashboard</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">Overview</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage land sites, property listings, users, and assignments from one place.
          </p>
        </div>
        <Link
          href="/dashboard/users"
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-navy/90"
        >
          Manage users
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total plots" value={totals.plots} icon={LandPlot} />
        <MetricCard label="Available plots" value={totals.available} icon={ShieldCheck} tone="green" />
        <MetricCard label="Property listings" value={propertyCount} icon={Building2} tone="blue" />
        <MetricCard label="Registered users" value={userCount} icon={Users2} tone="amber" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ActionCard
          title="Land sites"
          text="Open site dashboards, update plot records, and review site availability."
          href="/dashboard/sites"
        />
        <ActionCard
          title="User access"
          text="Assign admin, chief, land manager, assistant, and property agent roles."
          href="/dashboard/users"
        />
        <ActionCard
          title="Property marketplace"
          text="Review posted properties and monitor listings submitted by agents."
          href="/properties/all-properties"
        />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Land Sites</h2>
            <p className="text-sm text-slate-500">All managed sites and current plot status.</p>
          </div>
          <Link href="/dashboard/sites" className="text-sm font-medium text-brand-navy hover:underline">
            View all
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sites.map((site) => (
            <Link
              key={site.slug}
              href={`/dashboard/sites/${site.slug}`}
              className="group rounded-lg border border-slate-200 bg-white p-5 transition-colors hover:border-brand-teal/60"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-950">{site.name}</h3>
                  <p className="mt-0.5 text-xs text-slate-400">{site.location}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-brand-navy" />
              </div>

              <div className="mt-5 grid grid-cols-4 gap-2 text-center">
                <MiniStat label="Total" value={site.total} />
                <MiniStat label="Avail." value={site.available} className="text-green-600" />
                <MiniStat label="Resv." value={site.reserved} className="text-amber-600" />
                <MiniStat label="Sold" value={site.sold} className="text-red-600" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold leading-none text-slate-950">{Number(value).toLocaleString()}</p>
    </div>
  );
}

function ActionCard({ title, text, href }) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-slate-200 bg-white p-5 transition-colors hover:border-brand-teal/60"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-semibold text-slate-950">{title}</h2>
        <ArrowRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-brand-navy" />
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </Link>
  );
}

function MiniStat({ label, value, className = "text-slate-800" }) {
  return (
    <div>
      <p className={`text-lg font-bold leading-none ${className}`}>{Number(value).toLocaleString()}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}
