import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  CheckCircle,
  Mail,
  Building2,
  ShieldCheck,
  Phone,
  Users,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import PublicHeader from "@/app/_components/nav/PublicHeader";
import Footer from "@/app/_components/Footer";
import { SITES } from "@/lib/sites";

export default function LandingPage() {
  const kumasi = SITES.filter((s) => s.location === "Kumasi");
  const accra = SITES.filter((s) => s.location === "Accra");

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PublicHeader />

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center bg-[#05014c] overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}
        />
        {/* Glow blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/80 mb-8">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                Trusted land management across Ghana
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
                Own Your
                <span className="block text-orange-400">Land in Ghana</span>
                <span className="block text-white/60 text-3xl sm:text-4xl lg:text-5xl mt-1 font-medium">
                  the right way.
                </span>
              </h1>

              <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-lg">
                Browse verified plot sites across Kumasi and Accra. Choose your plot, fill in your details, and receive bank payment instructions by email. Simple as that.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <Link
                  href="/sites/trabuom-sector-1"
                  className="inline-flex items-center justify-center gap-2 bg-orange-400 hover:bg-orange-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-orange-400/30 hover:shadow-orange-400/50 hover:-translate-y-0.5"
                >
                  Browse Sites <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/marketplace"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200"
                >
                  View Marketplace
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 flex-wrap">
                {[
                  { icon: ShieldCheck, label: "Verified Sites" },
                  { icon: Users, label: "100+ Clients" },
                  { icon: MapPin, label: "9 Locations" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-white/50 text-sm">
                    <Icon className="w-4 h-4 text-orange-400" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: site cards preview */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Main card */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-400 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">Trabuom Sector 1</p>
                        <p className="text-white/40 text-xs">Kumasi</p>
                      </div>
                    </div>
                    <span className="bg-green-500/20 text-green-400 text-xs font-medium px-2.5 py-1 rounded-full">Available</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Total Plots", val: "80+" },
                      { label: "Available", val: "60+" },
                      { label: "Sold", val: "20+" },
                    ].map(({ label, val }) => (
                      <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
                        <p className="text-white font-bold text-lg">{val}</p>
                        <p className="text-white/40 text-xs">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating cards */}
                <div className="grid grid-cols-2 gap-4">
                  {SITES.slice(1, 5).map((site) => (
                    <Link
                      key={site.slug}
                      href={`/sites/${site.slug}`}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors group"
                    >
                      <MapPin className="w-4 h-4 text-orange-400 mb-2" />
                      <p className="text-white text-sm font-medium leading-tight">{site.name}</p>
                      <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
                        {site.location} <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 30C1200 60 900 0 720 0C540 0 240 60 0 30L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────── */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "9", label: "Verified Sites" },
              { value: "500+", label: "Total Plots" },
              { value: "2", label: "Cities" },
              { value: "100%", label: "Legit Titles" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-[#05014c]">{value}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SITES GRID ───────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-orange-500 uppercase tracking-wider mb-2">Our Locations</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Browse Our Land Sites</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Every site is verified with GIS-mapped plots. Click any site to view the interactive map and available plots.
            </p>
          </div>

          {/* Kumasi */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-6 rounded-full bg-[#05014c] flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800">Kumasi</h3>
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-400">{kumasi.length} sites</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {kumasi.map((site) => <SiteCard key={site.slug} site={site} />)}
            </div>
          </div>

          {/* Accra */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-6 rounded-full bg-[#05014c] flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800">Accra</h3>
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-400">{accra.length} sites</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {accra.map((site) => <SiteCard key={site.slug} site={site} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-orange-500 uppercase tracking-wider mb-2">Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">How to Own a Plot</h2>
            <p className="text-gray-500 mt-3">No complicated processes. Just these simple steps.</p>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-0.5 bg-gray-100" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  step: "01",
                  icon: MapPin,
                  title: "Browse & Pick",
                  desc: "Explore our interactive site maps. Click any green (available) plot to view its size, price, and details.",
                },
                {
                  step: "02",
                  icon: Mail,
                  title: "Submit Your Details",
                  desc: "Fill in your name, email, and contact info. We send you bank account details with your plot info via email.",
                },
                {
                  step: "03",
                  icon: Building2,
                  title: "Pay & Claim",
                  desc: "Make payment to the provided bank account. Visit our office with your receipt to finalise ownership.",
                },
              ].map(({ step, icon: Icon, title, desc }) => (
                <div key={step} className="text-center relative">
                  <div className="w-20 h-20 bg-[#05014c] rounded-2xl flex items-center justify-center mx-auto mb-5 relative">
                    <Icon className="w-8 h-8 text-white" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {step}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-orange-500 uppercase tracking-wider mb-2">Why Us</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">The GetOnePlot Difference</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: "Legitimate Titles", desc: "All plots are registered with full documentation and legal backing." },
              { icon: MapPin, title: "GIS-Mapped Plots", desc: "Every plot is mapped with GPS coordinates. See exactly what you're buying." },
              { icon: TrendingUp, title: "Transparent Pricing", desc: "No hidden fees. Price shown is what you pay — nothing more." },
              { icon: Phone, title: "24/7 Support", desc: "Call us anytime on 0322008282 or +233 54 855 4216." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border p-6 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 bg-[#05014c]/5 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#05014c]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────── */}
      <section className="py-20 px-4 bg-[#05014c] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}
        />
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to own land in Ghana?
          </h2>
          <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
            Browse our verified sites, pick your plot, and get started today. No account required to browse.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/sites/trabuom-sector-1"
              className="inline-flex items-center justify-center gap-2 bg-orange-400 hover:bg-orange-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-orange-400/20 hover:-translate-y-0.5"
            >
              Browse Sites <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function SiteCard({ site }) {
  return (
    <Link
      href={`/sites/${site.slug}`}
      className="group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:border-[#05014c]/20 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 bg-[#05014c]/5 rounded-xl flex items-center justify-center group-hover:bg-[#05014c] transition-colors duration-200">
          <MapPin className="w-4 h-4 text-[#05014c] group-hover:text-white transition-colors duration-200" />
        </div>
        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors duration-200" />
      </div>
      <h3 className="font-semibold text-gray-900 text-sm mb-1">{site.name}</h3>
      <p className="text-xs text-gray-400 leading-relaxed">{site.description}</p>
      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-xs text-[#05014c] font-medium">
          <MapPin className="w-3 h-3" /> {site.location}
        </span>
        <span className="text-xs text-gray-400 group-hover:text-[#05014c] transition-colors">View map →</span>
      </div>
    </Link>
  );
}
