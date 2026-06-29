import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getSiteBySlug } from "@/lib/sites";
import { canManageSite } from "@/lib/roles";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import PlotStatusBadge from "@/app/(dashboard)/dashboard/sites/[slug]/_components/PlotStatusBadge";
import ManagerPlotActions from "./_components/ManagerPlotActions";

async function getPlots(table) {
  const { data } = await supabase.from(table).select("*").order("id");
  return data ?? [];
}

export default async function ManagerSitePage({ params }) {
  const site = getSiteBySlug(params.slug);
  if (!site) notFound();

  const user = await currentUser();
  if (!canManageSite(user, params.slug)) redirect("/unauthorized");

  const plots = await getPlots(site.table);

  return (
    <div className="space-y-6">
      <Link href="/manager/sites" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> My Sites
      </Link>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#05014c] rounded-xl flex items-center justify-center">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{site.name}</h1>
          <p className="text-sm text-gray-500">{plots.length} plots · {site.location}</p>
        </div>
        <Link href={`/sites/${site.slug}`} className="ml-auto text-sm text-[#05014c] hover:underline" target="_blank">
          Public view →
        </Link>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Plot No.", "Street", "Size (Acres)", "Price (GHS)", "Status", "Client", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-medium text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {plots.map((plot) => {
                const props = plot.properties ?? {};
                return (
                  <tr key={plot.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{props.Plot_No ?? plot.id}</td>
                    <td className="px-5 py-3.5 text-gray-600">{props.Street_Nam ?? "—"}</td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {props.Area ? parseFloat(props.Area).toFixed(3) : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">
                      {plot.plotTotalAmount ? `GHS ${Number(plot.plotTotalAmount).toLocaleString()}` : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <PlotStatusBadge status={plot.status ?? props.status} />
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {plot.firstname ? `${plot.firstname} ${plot.lastname ?? ""}` : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <ManagerPlotActions plotId={plot.id} table={site.table} currentStatus={plot.status ?? props.status} />
                    </td>
                  </tr>
                );
              })}
              {!plots.length && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">No plots found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
