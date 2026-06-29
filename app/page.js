import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle,
  ClipboardCheck,
  MapPin,
  Phone,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import PublicHeader from "@/app/_components/nav/PublicHeader";
import Footer from "@/app/_components/Footer";
import { SITES } from "@/lib/sites";

const STATS = [
  { value: "9", label: "Verified land sites" },
  { value: "500+", label: "Land plots" },
  { value: "2", label: "Active cities" },
  { value: "100%", label: "Mapped inventory" },
];

const PROCESS = [
  {
    icon: MapPin,
    title: "Inspect the map",
    desc: "Open any site, review plot boundaries, status colors, size, price, and location context.",
  },
  {
    icon: ClipboardCheck,
    title: "Choose an action",
    desc: "Reserve, buy, express interest, or call the office directly from each plot popup.",
  },
  {
    icon: Building2,
    title: "Plan payment",
    desc: "Receive payment instructions, discuss flexible payment options, and complete documentation with expert support.",
  },
];

const TRUST = [
  { icon: ShieldCheck, title: "Verified land sites", desc: "Land inventory is reviewed before appearing on the platform." },
  { icon: MapPin, title: "GIS mapped", desc: "Plot boundaries are visible on interactive Google Maps." },
  { icon: TrendingUp, title: "Affordable prices", desc: "Compare pricing and status labels before making an enquiry." },
  { icon: Phone, title: "Expert consultation", desc: "Speak with the team before, during, or after selection." },
];

export default function LandingPage() {
  const kumasi = SITES.filter((site) => site.location === "Kumasi");
  const accra = SITES.filter((site) => site.location === "Accra");

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PublicHeader />

      <main>
        <section className="bg-brand-navy text-white">
          <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/75">
                <span className="h-2 w-2 rounded-full bg-brand-teal" />
                Verified land listings across Ghana
              </p>
              <h1 className="mt-7 max-w-3xl text-4xl font-bold leading-tight tracking-normal sm:text-5xl lg:text-6xl">
                Find Your Perfect Land In Ghana
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">
                Explore verified listings across all regions with ease. Whether you&apos;re seeking residential, commercial, or investment opportunities, we connect you with the right land to build your dreams.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/marketplace" className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-teal px-6 py-3 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-teal/90">
                  Browse Listed Properties <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/sites/trabuom-sector-1" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10">
                  Browse our Land locations
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-white/15 bg-white/[0.06] p-5 shadow-2xl shadow-black/10">
              <div className="rounded-lg border border-white/10 bg-white p-5 text-brand-navy">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Featured site</p>
                    <h2 className="mt-1 text-xl font-bold">Trabuom Sector 1</h2>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                      <MapPin className="h-4 w-4" /> Kumasi
                    </p>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Active</span>
                </div>

                <div className="grid grid-cols-3 gap-3 py-5">
                  {[
                    { label: "Inventory", value: "80+" },
                    { label: "Available", value: "60+" },
                    { label: "Mapped", value: "100%" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg bg-slate-50 p-3">
                      <p className="text-lg font-bold">{item.value}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  {["Verified Land Sites", "Affordable Prices", "Flexible Payment Plans", "Expert Consultation"].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-brand-teal" />
                      {item}
                    </div>
                  ))}
                </div>

                <Link href="/sites/trabuom-sector-1" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-navy/90">
                  Open map <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-slate-200 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-white py-8 text-center">
                <p className="text-3xl font-bold text-brand-navy">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader eyebrow="Land locations" title="Browse our verified land locations" desc="Open any location to inspect available, reserved, sold, hold, and other plot statuses on Google Maps." />
            <SiteGroup title="Kumasi" sites={kumasi} />
            <SiteGroup title="Accra" sites={accra} />
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-teal">Listed properties</p>
              <h2 className="mt-3 text-3xl font-bold text-brand-navy">Residential, commercial, and investment land opportunities.</h2>
              <p className="mt-4 text-slate-500 leading-7">
                Search listed opportunities with filters for category, region, rooms, price, and map view.
              </p>
              <Link href="/marketplace" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-navy px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-navy/90">
                Explore marketplace <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {["List view", "Map view", "Advanced filters"].map((item) => (
                <div key={item} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-navy/5">
                    <CheckCircle className="h-5 w-5 text-brand-navy" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{item}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Built for quick comparison and confident enquiry.</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader eyebrow="Process" title="A clear route from search to ownership" desc="The platform keeps each step focused: inspect, choose, submit details, then complete documentation." />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {PROCESS.map(({ icon: Icon, title, desc }, index) => (
                <div key={title} className="rounded-lg border border-slate-200 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-navy text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold text-brand-teal">0{index + 1}</span>
                  </div>
                  <h3 className="mt-5 font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader eyebrow="Why GetOnePlot" title="Everything you need to choose land with confidence" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {TRUST.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-lg border border-slate-200 bg-white p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-navy/5">
                    <Icon className="h-5 w-5 text-brand-navy" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-brand-navy py-16 text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <h2 className="text-3xl font-bold">Start with verified land locations.</h2>
              <p className="mt-2 max-w-2xl text-white/60">Review land sites, compare listed opportunities, and speak with an expert before you commit.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/sites/trabuom-sector-1" className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-teal px-5 py-3 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-teal/90">
                Browse sites <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10">
                Contact office
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function SectionHeader({ eyebrow, title, desc }) {
  return (
    <div className="mb-10 max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-teal">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold text-brand-navy sm:text-4xl">{title}</h2>
      {desc && <p className="mt-3 text-slate-500 leading-7">{desc}</p>}
    </div>
  );
}

function SiteGroup({ title, sites }) {
  return (
    <div className="mb-10 last:mb-0">
      <div className="mb-4 flex items-center gap-3">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-sm text-slate-400">{sites.length} sites</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sites.map((site) => <SiteCard key={site.slug} site={site} />)}
      </div>
    </div>
  );
}

function SiteCard({ site }) {
  return (
    <Link href={`/sites/${site.slug}`} className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-teal/50 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-navy/5 transition-colors group-hover:bg-brand-navy">
          <MapPin className="h-5 w-5 text-brand-navy transition-colors group-hover:text-white" />
        </div>
        <ArrowRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-brand-teal" />
      </div>
      <h3 className="mt-5 font-semibold text-slate-900">{site.name}</h3>
      <p className="mt-1 text-sm text-slate-500">{site.description}</p>
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
        <span className="font-semibold text-brand-navy">{site.location}</span>
        <span className="text-slate-400 group-hover:text-brand-navy">Open map</span>
      </div>
    </Link>
  );
}
