import { notFound } from "next/navigation";
import { getSiteBySlug } from "@/lib/sites";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import PlotStatusBadge from "./_components/PlotStatusBadge";
import EditPriceCell from "./_components/EditPriceCell";

async function getPlots(table) {
  const { data } = await supabase.from(table).select("*").order("id");
  return data ?? [];
}

export default async function AdminSitePage({ params }) {
  const site = getSiteBySlug(params.slug);
  if (!site) notFound();

  const plots = await getPlots(site.table);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/sites" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> All Sites
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-navy rounded-lg flex items-center justify-center">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{site.name}</h1>
          <p className="text-sm text-gray-500">{plots.length} plots · {site.location}</p>
        </div>
        <Link
          href={`/sites/${site.slug}`}
          className="ml-auto text-sm text-brand-navy hover:underline"
          target="_blank"
        >
          View public page →
        </Link>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
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
                  <tr key={plot.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{props.Plot_No ?? plot.id}</td>
                    <td className="px-5 py-3.5 text-gray-600">{props.Street_Nam ?? "—"}</td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {props.Area ? parseFloat(props.Area).toFixed(3) : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <EditPriceCell plotId={plot.id} table={site.table} price={plot.plotTotalAmount ?? props.plotAmount} />
                    </td>
                    <td className="px-5 py-3.5">
                      <PlotStatusBadge status={plot.status ?? props.status} />
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {plot.firstname ? `${plot.firstname} ${plot.lastname ?? ""}` : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/dashboard/edit-plot/${plot.id}?table=${site.table}&slug=${site.slug}`}
                        className="text-brand-navy hover:underline text-xs font-medium"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {!plots.length && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">No plots found for this site.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
