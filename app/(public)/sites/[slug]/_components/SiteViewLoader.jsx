"use client";

import dynamic from "next/dynamic";

const SiteView = dynamic(() => import("./SiteView"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-brand-navy border-t-transparent" />
        <p className="mt-4 text-sm text-slate-500">Loading site map...</p>
      </div>
    </div>
  ),
});

export default function SiteViewLoader({ site }) {
  return <SiteView site={site} />;
}
