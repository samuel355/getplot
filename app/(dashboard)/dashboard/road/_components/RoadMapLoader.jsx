"use client";

import dynamic from "next/dynamic";

const RoadMapClient = dynamic(() => import("./RoadMapClient"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[75vh] items-center justify-center rounded-lg bg-slate-100">
      <div className="text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-brand-navy border-t-transparent" />
        <p className="mt-3 text-sm text-slate-500">Loading road map...</p>
      </div>
    </div>
  ),
});

export default function RoadMapLoader() {
  return <RoadMapClient />;
}
