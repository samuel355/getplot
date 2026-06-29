import { notFound } from "next/navigation";
import { getSiteBySlug } from "@/lib/sites";
import SiteView from "./_components/SiteView";

export async function generateMetadata({ params }) {
  const site = getSiteBySlug(params.slug);
  if (!site) return { title: "Site Not Found" };
  return {
    title: `${site.name} — GetOnePlot`,
    description: site.description,
  };
}

export default function SitePage({ params }) {
  const site = getSiteBySlug(params.slug);
  if (!site) notFound();

  return <SiteView site={site} />;
}
