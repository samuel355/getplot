import { currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";
import StatCard from "@/app/_components/ui/StatCard";
import { List, PlusCircle, TrendingUp, Eye, ArrowRight } from "lucide-react";

async function getMyListings(userId) {
  const { data } = await supabase
    .from("properties")
    .select("id, title, type, price, status, created_at, listing_type")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);
  return data ?? [];
}

async function getMyStats(userId) {
  const { data } = await supabase
    .from("properties")
    .select("status")
    .eq("user_id", userId);
  if (!data) return { total: 0, active: 0, pending: 0 };
  return {
    total: data.length,
    active: data.filter((p) => p.status === "approved").length,
    pending: data.filter((p) => p.status === "pending").length,
  };
}

export default async function AgentPage() {
  const user = await currentUser();
  const userId = user?.id ?? "";
  const [listings, stats] = await Promise.all([getMyListings(userId), getMyStats(userId)]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.firstName ?? "Agent"}</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your property listings from here.</p>
        </div>
        <Link
          href="/agent/listings/new"
          className="inline-flex items-center gap-2 bg-brand-navy text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-brand-navy/90 transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> Add Listing
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Listings" value={stats.total} icon={List} />
        <StatCard label="Active" value={stats.active} icon={TrendingUp} color="text-green-600" bg="bg-green-50" />
        <StatCard label="Pending Review" value={stats.pending} icon={Eye} color="text-brand-teal" bg="bg-brand-teal/10" />
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Recent Listings</h2>
          <Link href="/agent/listings" className="text-sm text-brand-navy hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {listings.length ? (
          <div className="divide-y">
            {listings.map((listing) => (
              <div key={listing.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{listing.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {listing.type} · {listing.listing_type} · GHS {Number(listing.price || 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={listing.status} />
                  <Link href={`/agent/listings/${listing.id}`} className="text-brand-navy text-xs hover:underline">Edit</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-gray-400">
            <p className="text-sm">No listings yet.</p>
            <Link href="/agent/listings/new" className="text-brand-navy text-sm hover:underline mt-1 inline-block">
              Create your first listing →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    rejected: "bg-red-100 text-red-600",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status ?? "draft"}
    </span>
  );
}
