"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin, Navigation, Radio, Sparkles } from "lucide-react";

const MARKER_POSITIONS = [
  [28, 24], [61, 19], [45, 37], [72, 48], [22, 57],
  [54, 66], [81, 72], [35, 81], [66, 86],
];

export default function LandMapShowcase({ sites }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSite = sites[activeIndex] ?? sites[0];

  useEffect(() => {
    if (sites.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % sites.length);
    }, 3800);
    return () => window.clearInterval(timer);
  }, [sites.length]);

  const visibleSites = useMemo(() => sites.slice(0, 9), [sites]);
  if (!activeSite) return null;

  return (
    <div className="relative mx-auto w-full max-w-[660px] lg:mx-0 lg:ml-auto">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-brand-teal/10 blur-3xl" aria-hidden="true" />

      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#071a32]/90 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-4">
        <div className="flex items-center justify-between px-1 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-brand-teal/15">
              <Radio className="h-4 w-4 text-brand-teal" />
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#071a32]" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-teal">Live site explorer</p>
              <p className="text-xs text-white/45">{sites.length} mapped locations</p>
            </div>
          </div>
          <Link href="/sites" className="group flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-brand-teal/50 hover:text-white">
            Explore all <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="relative min-h-[390px] overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#e9efe9] sm:min-h-[430px]">
          <div className="absolute inset-0 opacity-80 [background-image:linear-gradient(30deg,transparent_48%,rgba(15,23,42,.08)_49%,rgba(15,23,42,.08)_51%,transparent_52%),linear-gradient(120deg,transparent_48%,rgba(15,23,42,.06)_49%,rgba(15,23,42,.06)_51%,transparent_52%)] [background-size:80px_80px]" />
          <div className="absolute -left-20 top-10 h-48 w-[125%] rotate-[-9deg] border-y-[14px] border-white/80 bg-slate-400/35 shadow-[0_0_0_1px_rgba(100,116,139,.18)]" />
          <div className="absolute -right-16 top-44 h-32 w-[92%] rotate-[24deg] rounded-[50%] border-y-[10px] border-white/70 bg-brand-teal/10" />

          {visibleSites.map((site, index) => {
            const [left, top] = MARKER_POSITIONS[index];
            const active = index === activeIndex;
            return (
              <button
                key={site.slug}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show ${site.name}`}
                className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                {active && <span className="absolute inset-0 animate-ping rounded-full bg-brand-teal/50 motion-reduce:animate-none" />}
                <span className={`relative flex items-center justify-center rounded-full border-2 border-white shadow-lg transition-all duration-500 ${active ? "h-11 w-11 scale-110 bg-brand-navy" : "h-7 w-7 bg-white group-hover:scale-110"}`}>
                  <MapPin className={active ? "h-5 w-5 text-brand-teal" : "h-3.5 w-3.5 text-brand-navy"} />
                </span>
              </button>
            );
          })}

          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-3 py-2 text-[11px] font-semibold text-brand-navy shadow-sm backdrop-blur-md">
            <Navigation className="h-3.5 w-3.5 text-brand-teal" /> Kumasi & Accra
          </div>

          <div key={activeSite.slug} className="absolute inset-x-3 bottom-3 z-20 animate-[pulse_.35s_ease-out_1] rounded-2xl border border-white/70 bg-white/90 p-4 text-brand-navy shadow-xl backdrop-blur-xl motion-reduce:animate-none sm:inset-x-auto sm:left-4 sm:w-[330px]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                  <Sparkles className="h-3 w-3" /> Now exploring
                </div>
                <h2 className="text-lg font-bold leading-tight">{activeSite.name}</h2>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3 w-3" /> {activeSite.location}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">Verified</span>
            </div>
            <div className="mt-4 grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-200 pt-3">
              <Metric value={`${activeIndex + 1}/${sites.length}`} label="Location" />
              <Metric value="Mapped" label="Plot view" accent />
              <Metric value="View" label="Site map" href={`/sites/${activeSite.slug}`} />
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 px-1 pt-3" aria-label="Site rotation progress">
          {visibleSites.map((site, index) => (
            <button key={site.slug} type="button" onClick={() => setActiveIndex(index)} className={`h-1.5 rounded-full transition-all duration-500 ${index === activeIndex ? "w-8 bg-brand-teal" : "w-2 bg-white/20 hover:bg-white/40"}`} aria-label={site.name} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({ value, label, accent, href }) {
  const content = (
    <>
      <p className={`text-sm font-extrabold ${accent ? "text-emerald-700" : "text-brand-navy"}`}>{value}</p>
      <p className="mt-0.5 text-[9px] uppercase tracking-wide text-slate-400">{label}</p>
    </>
  );
  return href ? <Link href={href} className="px-3 text-left transition hover:opacity-65">{content}</Link> : <div className="px-3">{content}</div>;
}
