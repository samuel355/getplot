import { notFound } from "next/navigation";
import { getSiteBySlug } from "@/lib/sites";
import SiteViewLoader from "./_components/SiteViewLoader";

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

  return <SiteViewLoader site={site} />;
}
