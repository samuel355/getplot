export const SITES = [
  {
    slug: "trabuom-sector-1",
    table: "trabuom",
    name: "Trabuom Sector 1",
    location: "Kumasi",
    description: "Residential plots in Trabuom, Kumasi",
  },
  {
    slug: "trabuom-sector-2",
    table: "new_trabuom",
    name: "Trabuom Sector 2",
    location: "Kumasi",
    description: "Residential plots in New Trabuom, Kumasi",
  },
  {
    slug: "legon-hills",
    table: "legon_hills",
    name: "East Legon Hills",
    location: "Accra",
    description: "Premium plots in East Legon Hills, Accra",
  },
  {
    slug: "kwadaso-nthc",
    table: "nthc",
    name: "Kwadaso (NTHC)",
    location: "Kumasi",
    description: "NTHC residential plots in Kwadaso, Kumasi",
  },
  {
    slug: "ejisu-adense",
    table: "dar_es_salaam",
    name: "Ejisu - Adense",
    location: "Kumasi",
    description: "Plots in the Ejisu - Adense area",
  },
  {
    slug: "yabi",
    table: "yabi",
    name: "Yabi",
    location: "Kumasi",
    description: "Residential plots in Yabi, Kumasi",
  },
  {
    slug: "berekuso",
    table: "berekuso",
    name: "Berekuso",
    location: "Accra",
    description: "Plots in Berekuso, Eastern Accra",
  },
  {
    slug: "asokore-mampong",
    table: "asokore_mampong",
    name: "Asokore Mampong",
    location: "Kumasi",
    description: "Residential plots in Asokore Mampong, Kumasi",
  },
  {
    slug: "royal-court-estate",
    table: "royal_court_estate",
    name: "Royal Court Estate",
    location: "Kumasi",
    description: "Premium gated community plots in Kumasi",
  },
];

export function getSiteBySlug(slug) {
  return SITES.find((s) => s.slug === slug) ?? null;
}

export function getSiteByTable(table) {
  return SITES.find((s) => s.table === table) ?? null;
}
