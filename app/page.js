import Link from "next/link";
import { MapPin, ArrowRight, CheckCircle, Building2, TreePine, Star } from "lucide-react";
import PublicHeader from "@/app/_components/nav/PublicHeader";
import Footer from "@/app/_components/Footer";
import { SITES } from "@/lib/sites";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      {/* Hero */}
      <section className="relative bg-[#05014c] text-white pt-28 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-orange-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6">
            <Star className="w-3.5 h-3.5 text-orange-400" />
            Ghana&apos;s trusted land management platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Find Your Perfect{" "}
            <span className="text-orange-400">Plot of Land</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10">
            Browse verified land plots across Ghana. Reserve or buy your plot online — we&apos;ll guide you through the rest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sites/trabuom-sector-1"
              className="inline-flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
            >
              Browse Sites <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 font-semibold px-8 py-3.5 rounded-xl transition-colors"
            >
              View Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Sites grid */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Land Sites</h2>
            <p className="text-gray-500 mt-2">Verified sites across Ghana with available plots</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SITES.map((site) => (
              <Link
                key={site.slug}
                href={`/sites/${site.slug}`}
                className="group relative bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-[#05014c]/20 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-[#05014c]/5 rounded-xl flex items-center justify-center group-hover:bg-[#05014c]/10 transition-colors">
                    <MapPin className="w-5 h-5 text-[#05014c]" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#05014c] transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{site.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{site.description}</p>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#05014c] bg-[#05014c]/5 px-2.5 py-1 rounded-full">
                  <MapPin className="w-3 h-3" /> {site.location}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="text-gray-500 mt-2">Simple steps to own your plot</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Browse & Choose",
                desc: "Explore our interactive site maps. Click any available plot to view its details, size, and price.",
                icon: MapPin,
              },
              {
                step: "02",
                title: "Reserve or Buy",
                desc: "Fill in your details to reserve or buy your chosen plot. We send you bank account details via email.",
                icon: Building2,
              },
              {
                step: "03",
                title: "Make Payment",
                desc: "Visit any of our listed bank branches and make your payment to claim your plot.",
                icon: CheckCircle,
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-[#05014c] text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-[#05014c] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <TreePine className="w-10 h-10 text-orange-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Ready to own land in Ghana?</h2>
          <p className="text-white/70 mb-8">Browse our verified sites and take the first step toward land ownership today.</p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 bg-orange-400 hover:bg-orange-500 font-semibold px-8 py-3.5 rounded-xl transition-colors"
          >
            Explore Marketplace <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
