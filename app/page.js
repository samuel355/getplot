import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle,
  ClipboardCheck,
  Filter,
  Layers,
  Map,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import PublicHeader from "@/app/_components/nav/PublicHeader";
import Footer from "@/app/_components/Footer";
import { SITES } from "@/lib/sites";

const HERO_METRICS = [
  { value: "Verified", label: "Land locations" },
  { value: "Mapped", label: "Plot boundaries" },
  { value: "Guided", label: "Purchase support" },
];

const STATUS_ITEMS = [
  { label: "Available", color: "bg-green-600" },
  { label: "Reserved", color: "bg-neutral-950" },
  { label: "Sold", color: "bg-red-600" },
  { label: "Hold", color: "bg-slate-400" },
];

const CAPABILITIES = [
  {
    icon: Map,
    title: "Interactive land maps",
    desc: "Inspect plot boundaries, live status colors, land use, size, price, and direct actions from the map.",
  },
  {
    icon: Search,
    title: "Property marketplace",
    desc: "Browse land, homes, rentals, and investment listings with category, region, room, price, list, and map views.",
  },
  {
    icon: ShieldCheck,
    title: "Verified inventory",
    desc: "Land locations and listed properties are organized around clear documentation, status, and team support.",
  },
  {
    icon: Phone,
    title: "Guided enquiries",
    desc: "Buyers can reserve, buy, express interest, or call for consultation from the exact plot or listing they choose.",
  },
];

const PROCESS = [
  {
    icon: Layers,
    title: "Explore verified sites",
    desc: "Open land locations across Kumasi and Accra, then compare plot boundaries and statuses visually.",
  },
  {
    icon: SlidersHorizontal,
    title: "Filter the marketplace",
    desc: "Narrow by property category, listing type, region, rooms, and budget before making an enquiry.",
  },
  {
    icon: ClipboardCheck,
    title: "Reserve or request support",
    desc: "Submit interest, reserve available plots, discuss payment options, and complete the next step with the team.",
  },
];

const MARKET_FEATURES = [
  "Land, residential, commercial, and investment listings",
  "List and map views for faster comparison",
  "Verified locations with expert consultation",
];

export default function LandingPage() {
  const kumasi = SITES.filter((site) => site.location === "Kumasi");
  const accra = SITES.filter((site) => site.location === "Accra");
  const featuredSites = SITES.slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PublicHeader />

      <main>
        <section className="relative overflow-hidden bg-brand-navy text-white">
          <div
            className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "url('/images/trabuom-lt.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-brand-navy/80" aria-hidden="true" />

          <div className="relative mx-auto grid min-h-[calc(100vh-120px)] max-w-7xl grid-cols-1 items-center gap-12 px-4 pt-28 pb-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80">
                <BadgeCheck className="h-4 w-4 text-brand-teal" />
                Land management and marketplace platform
              </p>

              <h1 className="mt-7 max-w-3xl text-4xl font-bold leading-tight tracking-normal sm:text-5xl lg:text-6xl">
                Find Your Perfect Land In Ghana
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
                Explore verified listings across all regions with ease. Whether you&apos;re seeking residential, commercial, or investment opportunities, we connect you with the right land to build your dreams.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/marketplace" className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-teal px-6 py-3 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-teal/90">
                  Browse Listed Properties <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/sites/trabuom-sector-1" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10">
                  Browse our Land locations
                </Link>
              </div>

              <div className="mt-10 grid max-w-xl grid-cols-3 border-y border-white/15">
                {HERO_METRICS.map((item) => (
                  <div key={item.label} className="border-r border-white/15 px-4 py-6 last:border-r-0 sm:px-6">
                    <p className="text-2xl font-bold text-white">{item.value}</p>
                    <p className="mt-1 text-xs text-white/55 sm:text-sm">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <LandMapShowcase />
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-teal">Marketplace</p>
              <h2 className="mt-3 text-3xl font-bold text-brand-navy sm:text-4xl">
                Search beyond land and compare every opportunity with confidence.
              </h2>
              <p className="mt-4 max-w-xl text-slate-500 leading-7">
                The marketplace supports land, houses, apartments, commercial options, rentals, and investment listings with the filters buyers expect.
              </p>

              <div className="mt-7 space-y-3">
                {MARKET_FEATURES.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-teal/15">
                      <CheckCircle className="h-3.5 w-3.5 text-brand-navy" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>

              <Link href="/marketplace" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-navy px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-navy/90">
                Explore marketplace <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <MarketplacePreview />
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-px bg-slate-200 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
            {[
              { title: "Verified Land Sites", desc: "Mapped locations with clear plot boundaries and site-level inventory." },
              { title: "Affordable Prices", desc: "Compare price, status, size, and availability before enquiry." },
              { title: "Flexible Payment Plans", desc: "Speak with the team about payment options and documentation support." },
            ].map((item) => (
              <div key={item.title} className="bg-white px-6 py-7">
                <CheckCircle className="h-5 w-5 text-brand-teal" />
                <h2 className="mt-4 font-semibold text-brand-navy">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Platform"
              title="One place to manage land inventory and convert serious buyers"
              desc="GetOnePlot combines mapped land sites, marketplace discovery, buyer actions, and staff workflows into a single experience."
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {CAPABILITIES.map(({ icon: Icon, title, desc }) => (
                <article key={title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-navy text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-brand-navy py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeader
                eyebrow="Land locations"
                title="Browse verified land locations"
                desc="Open each location to inspect available, reserved, sold, hold, and other plot statuses on Google Maps."
                dark
              />
              <Link href="/sites/trabuom-sector-1" className="inline-flex w-fit items-center gap-2 rounded-lg bg-brand-teal px-5 py-3 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-teal/90">
                Open featured map <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredSites.map((site) => <SiteCard key={site.slug} site={site} dark />)}
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <SiteList title="Kumasi" sites={kumasi} />
              <SiteList title="Accra" sites={accra} />
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Buyer journey"
              title="From inspection to enquiry without losing context"
              desc="The interface keeps the plot, price, status, and next action together so buyers and staff can move faster."
            />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {PROCESS.map(({ icon: Icon, title, desc }, index) => (
                <article key={title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-navy text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold text-brand-teal">0{index + 1}</span>
                  </div>
                  <h3 className="mt-5 font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-teal">Expert consultation</p>
              <h2 className="mt-3 text-3xl font-bold text-brand-navy sm:text-4xl">
                Serious decisions need clear data and a reachable team.
              </h2>
              <p className="mt-4 max-w-2xl text-slate-500 leading-7">
                Buyers can inspect mapped plots, compare marketplace properties, and connect with the office before committing. Admin teams can keep statuses aligned with real inventory.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  { label: "Reserve", desc: "Hold an available plot for follow-up." },
                  { label: "Buy", desc: "Start a purchase flow from the plot." },
                  { label: "Express interest", desc: "Send enquiry details with context." },
                  { label: "Call for info", desc: "Speak directly with the office." },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-white p-4">
                    <h3 className="font-semibold text-brand-navy">{item.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-brand-navy py-16 text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <h2 className="text-3xl font-bold">Start with verified land locations.</h2>
              <p className="mt-2 max-w-2xl text-white/65">Review land sites, compare listed properties, and speak with an expert before you commit.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/marketplace" className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-teal px-5 py-3 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-teal/90">
                Browse listings <ArrowRight className="h-4 w-4" />
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

function LandMapShowcase() {
  const plots = [
    "col-span-2 row-span-2 bg-green-600/80",
    "bg-green-600/80",
    "bg-red-600/85",
    "bg-neutral-950/85",
    "col-span-2 bg-green-600/80",
    "bg-slate-400/90",
    "bg-green-600/80",
    "col-span-2 row-span-2 bg-green-600/80",
    "bg-blue-800/80",
    "bg-red-600/85",
    "bg-green-600/80",
    "bg-slate-400/90",
  ];

  return (
    <div className="rounded-lg border border-white/15 bg-white p-4 shadow-2xl shadow-black/20">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Live site map</p>
          <h2 className="mt-1 font-bold text-brand-navy">Verified Land Site</h2>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          <span className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-brand-navy shadow-sm">Map</span>
          <span className="px-3 py-1 text-xs font-semibold text-slate-500">List</span>
        </div>
      </div>

      <div className="grid gap-4 py-4 lg:grid-cols-[1fr_15rem]">
        <div className="relative min-h-[360px] overflow-hidden rounded-lg bg-slate-100">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.07)_1px,transparent_1px),linear-gradient(rgba(15,23,42,0.07)_1px,transparent_1px)] bg-[size:34px_34px]" />
          <div className="relative grid h-full grid-cols-5 grid-rows-5 gap-2 p-5">
            {plots.map((plot, index) => (
              <div key={index} className={`rounded-md border border-white/80 shadow-sm ${plot}`} />
            ))}
          </div>
          <div className="absolute left-5 top-5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-brand-navy shadow-sm">
            Google map polygons
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Selected plot</p>
              <h3 className="mt-1 text-xl font-bold text-brand-navy">Plot 24</h3>
            </div>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Available</span>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <Fact label="Size" value="0.315 Acres" />
            <Fact label="Price" value="GHS 85,000" />
            <Fact label="Use" value="Residential" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <span className="rounded-lg bg-brand-navy px-3 py-2 text-center text-xs font-bold text-white">Reserve</span>
            <span className="rounded-lg bg-brand-teal px-3 py-2 text-center text-xs font-bold text-brand-navy">Buy</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
        {STATUS_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className={`h-2.5 w-2.5 rounded-sm ${item.color}`} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketplacePreview() {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Marketplace search</p>
          <h3 className="mt-1 font-bold text-brand-navy">Approved listings</h3>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-brand-navy shadow-sm">
            <Filter className="h-3.5 w-3.5" /> Filters
          </span>
          <span className="rounded-lg bg-brand-navy px-3 py-2 text-xs font-semibold text-white">Map view</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { title: "Residential land", location: "Kumasi", image: "/images/trabuom-lt.jpg", price: "GHS 85,000" },
          { title: "Modern house", location: "Accra", image: "/hero-main.png", price: "Contact" },
          { title: "Investment plot", location: "Greater Accra", image: "/images/property24a.jpg", price: "GHS 120,000" },
        ].map((item) => (
          <article key={item.title} className="overflow-hidden rounded-lg bg-white shadow-sm">
            <div className="h-32 bg-slate-200 bg-cover bg-center" style={{ backgroundImage: `url('${item.image}')` }} />
            <div className="p-4">
              <h4 className="font-semibold text-slate-900">{item.title}</h4>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5" /> {item.location}
              </p>
              <p className="mt-3 font-bold text-brand-navy">{item.price}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Fact({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-b-0">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function SectionHeader({ eyebrow, title, desc, dark }) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-teal">{eyebrow}</p>
      <h2 className={`mt-3 text-3xl font-bold sm:text-4xl ${dark ? "text-white" : "text-brand-navy"}`}>{title}</h2>
      {desc && <p className={`mt-3 leading-7 ${dark ? "text-white/65" : "text-slate-500"}`}>{desc}</p>}
    </div>
  );
}

function SiteList({ title, sites }) {
  return (
    <div className="border-t border-white/15 pt-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-white">{title}</h3>
        <span className="text-sm text-white/45">{sites.length} sites</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {sites.map((site) => (
          <Link key={site.slug} href={`/sites/${site.slug}`} className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/70 transition-colors hover:border-brand-teal hover:text-white">
            {site.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

function SiteCard({ site, dark }) {
  return (
    <Link href={`/sites/${site.slug}`} className={`group rounded-lg border p-5 transition hover:-translate-y-0.5 ${dark ? "border-white/15 bg-white/5 hover:border-brand-teal/70" : "border-slate-200 bg-white shadow-sm hover:border-brand-teal/50 hover:shadow-md"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${dark ? "bg-white/10 group-hover:bg-brand-teal" : "bg-brand-navy/5 group-hover:bg-brand-navy"}`}>
          <MapPin className={`h-5 w-5 transition-colors ${dark ? "text-brand-teal group-hover:text-brand-navy" : "text-brand-navy group-hover:text-white"}`} />
        </div>
        <ArrowRight className={`h-4 w-4 transition-colors ${dark ? "text-white/35 group-hover:text-brand-teal" : "text-slate-300 group-hover:text-brand-teal"}`} />
      </div>
      <h3 className={`mt-5 font-semibold ${dark ? "text-white" : "text-slate-900"}`}>{site.name}</h3>
      <p className={`mt-1 text-sm ${dark ? "text-white/55" : "text-slate-500"}`}>{site.description}</p>
      <div className={`mt-5 flex items-center justify-between border-t pt-4 text-xs ${dark ? "border-white/10" : "border-slate-100"}`}>
        <span className={`font-semibold ${dark ? "text-brand-teal" : "text-brand-navy"}`}>{site.location}</span>
        <span className={dark ? "text-white/40 group-hover:text-white" : "text-slate-400 group-hover:text-brand-navy"}>Open map</span>
      </div>
    </Link>
  );
}
