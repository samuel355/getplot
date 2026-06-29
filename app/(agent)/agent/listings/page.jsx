import { currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import StatusPill from "./_components/StatusPill";

async function getListings(userId) {
  const { data } = await supabase
    .from("properties")
    .select("id, title, type, listing_type, price, rental_price, status, region, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function AgentListingsPage() {
  const user = await currentUser();
  const listings = await getListings(user?.id ?? "");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-sm text-gray-500 mt-1">{listings.length} listing{listings.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/properties/add-listing"
          className="inline-flex items-center gap-2 bg-brand-navy text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-brand-navy/90 transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> Add Listing
        </Link>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {listings.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {["Title", "Type", "Listing", "Price", "Region", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-medium text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900 max-w-[200px] truncate">{l.title}</td>
                    <td className="px-5 py-3.5 text-gray-600 capitalize">{l.type}</td>
                    <td className="px-5 py-3.5 text-gray-600 capitalize">{l.listing_type}</td>
                    <td className="px-5 py-3.5 text-gray-700">
                      GHS {Number(l.listing_type === "rent" ? l.rental_price : l.price || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{l.region ?? "—"}</td>
                    <td className="px-5 py-3.5"><StatusPill status={l.status} /></td>
                    <td className="px-5 py-3.5">
                      <Link href={`/properties/edit-property/${l.id}`} className="text-brand-navy hover:underline text-xs font-medium">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-gray-400">
            <p className="text-sm mb-2">No listings yet.</p>
            <Link href="/properties/add-listing" className="text-brand-navy text-sm hover:underline">
              Create your first listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
