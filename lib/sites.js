export const SITES = [
  {
    slug: "trabuom-sector-1",
    table: "trabuom",
    name: "Trabuom Sector 1",
    location: "Kumasi",
    description: "Residential plots in Trabuom, Kumasi",
    coordinates: { lat: 6.596767, lng: -1.771261 },
  },
  {
    slug: "trabuom-sector-2",
    table: "new_trabuom",
    name: "Trabuom Sector 2",
    location: "Kumasi",
    description: "Residential plots in New Trabuom, Kumasi",
    coordinates: { lat: 6.6022, lng: -1.7645 },
  },
  {
    slug: "legon-hills",
    table: "legon_hills",
    name: "East Legon Hills",
    location: "Accra",
    description: "Premium plots in East Legon Hills, Accra",
    coordinates: { lat: 5.6866, lng: -0.1141 },
  },
  {
    slug: "kwadaso-nthc",
    table: "nthc",
    name: "Kwadaso (NTHC)",
    location: "Kumasi",
    description: "NTHC residential plots in Kwadaso, Kumasi",
    coordinates: { lat: 6.6884, lng: -1.6643 },
  },
  {
    slug: "ejisu-adense",
    table: "dar_es_salaam",
    name: "Ejisu - Adense",
    location: "Kumasi",
    description: "Plots in the Ejisu - Adense area",
    coordinates: { lat: 6.7167, lng: -1.4586 },
  },
  {
    slug: "yabi",
    table: "yabi",
    name: "Yabi",
    location: "Kumasi",
    description: "Residential plots in Yabi, Kumasi",
    coordinates: { lat: 6.7357, lng: -1.5249 },
  },
  {
    slug: "berekuso",
    table: "berekuso",
    name: "Berekuso",
    location: "Accra",
    description: "Plots in Berekuso, Eastern Accra",
    coordinates: { lat: 5.7592, lng: -0.2191 },
  },
  {
    slug: "asokore-mampong",
    table: "asokore_mampong",
    name: "Asokore Mampong",
    location: "Kumasi",
    description: "Residential plots in Asokore Mampong, Kumasi",
    coordinates: { lat: 6.7075, lng: -1.5922 },
  },
  {
    slug: "royal-court-estate",
    table: "saadi",
    name: "Royal Court Estate",
    location: "Kumasi",
    description: "Premium gated community plots in Kumasi",
    coordinates: { lat: 6.6745, lng: -1.5716 },
  },
];

export function getSiteBySlug(slug) {
  return SITES.find((s) => s.slug === slug) ?? null;
}

export function getSiteByTable(table) {
  return SITES.find((s) => s.table === table) ?? null;
}
