import { HeartHandshake } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { SITES } from "@/lib/sites";
import InterestsTable from "./_components/InterestsTable";

async function getSiteInterests(site) {
  const { data } = await supabase
    .from(`${site.table}_interests`)
    .select("*")
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => ({
    ...row,
    _table: `${site.table}_interests`,
    _siteSlug: site.slug,
    _siteName: site.name,
  }));
}

export default async function InterestsPage() {
  const perSite = await Promise.all(SITES.map(getSiteInterests));
  const interests = perSite
    .flat()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-navy rounded-lg flex items-center justify-center">
          <HeartHandshake className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plot Interests</h1>
          <p className="text-sm text-gray-500">
            {interests.length} {interests.length === 1 ? "person has" : "people have"} expressed interest across all sites
          </p>
        </div>
      </div>

      <InterestsTable interests={interests} sites={SITES} />
    </div>
  );
}
