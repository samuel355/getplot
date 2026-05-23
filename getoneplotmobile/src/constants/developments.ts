export type Development = {
  slug: string;
  title: string;
  subtitle: string;
  table: string;
  interestTable: string;
  center: { latitude: number; longitude: number };
};

export const DEVELOPMENTS: Development[] = [
  {
    slug: 'royal-court-estate',
    title: 'Royal Court Estate',
    subtitle: 'Saadi Gated Community',
    table: 'saadi',
    interestTable: 'saadi_interests',
    center: { latitude: 6.65, longitude: -1.62 },
  },
  {
    slug: 'nthc',
    title: 'NTHC',
    subtitle: 'Kwadaso',
    table: 'nthc',
    interestTable: 'nthc_interests',
    center: { latitude: 6.68, longitude: -1.65 },
  },
  {
    slug: 'dar-es-salaam',
    title: 'Dar Es Salaam',
    subtitle: 'Ejisu',
    table: 'dar_es_salaam',
    interestTable: 'dar_es_salaam_interests',
    center: { latitude: 6.72, longitude: -1.58 },
  },
  {
    slug: 'trabuom',
    title: 'Trabuom',
    subtitle: 'Kumasi',
    table: 'trabuom',
    interestTable: 'trabuom_interests',
    center: { latitude: 6.5967673180000475, longitude: -1.7712607859999707 },
  },
  {
    slug: 'new-trabuom',
    title: 'New Trabuom',
    subtitle: 'Kumasi',
    table: 'new_trabuom',
    interestTable: 'trabuom_interests',
    center: { latitude: 6.5967673180000475, longitude: -1.7712607859999707 },
  },
  {
    slug: 'legon-hills',
    title: 'East Legon Hills',
    subtitle: 'Accra',
    table: 'legon_hills',
    interestTable: 'legon_hills_interests',
    center: { latitude: 5.65, longitude: -0.15 },
  },
  {
    slug: 'yabi',
    title: 'Yabi',
    subtitle: 'Kumasi',
    table: 'yabi',
    interestTable: 'yabi_interests',
    center: { latitude: 6.7, longitude: -1.62 },
  },
  {
    slug: 'berekuso',
    title: 'Berekuso',
    subtitle: 'Eastern Region',
    table: 'berekuso',
    interestTable: 'berekuso_interests',
    center: { latitude: 6.78, longitude: -0.18 },
  },
  {
    slug: 'asokore-mampong',
    title: 'Asokore Mampong',
    subtitle: 'Kumasi',
    table: 'asokore_mampong',
    interestTable: 'asokore_mampong_interests',
    center: { latitude: 6.72, longitude: -1.58 },
  },
];

export function getDevelopment(slug: string): Development | undefined {
  return DEVELOPMENTS.find((d) => d.slug === slug);
}

export const ACCEPTED_ROLES = [
  'sysadmin',
  'admin',
  'property_agent',
  'chief',
  'chief_asst',
] as const;

export type UserRole = (typeof ACCEPTED_ROLES)[number];
