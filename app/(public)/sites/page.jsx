import PublicHeader from "@/app/_components/nav/PublicHeader";
import Footer from "@/app/_components/Footer";
import { SITES } from "@/lib/sites";
import SitesExplorer from "./_components/SitesExplorer";

export const metadata = {
  title: "Land Locations - GetOnePlot",
  description: "Browse all verified GetOnePlot land locations in list and map view.",
};

export default function SitesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PublicHeader />
      <main className="flex-1 pt-20">
        <SitesExplorer sites={SITES} />
      </main>
      <Footer />
    </div>
  );
}
