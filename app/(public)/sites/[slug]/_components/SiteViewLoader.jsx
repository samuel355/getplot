"use client";

import dynamic from "next/dynamic";
import BrandLoader from "@/app/_components/BrandLoader";

const SiteView = dynamic(() => import("./SiteView"), {
  ssr: false,
  loading: () => (
    <BrandLoader label="Loading site map..." />
  ),
});

export default function SiteViewLoader({ site }) {
  return <SiteView site={site} />;
}
