export type Property = {
  id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  address?: string;
  size?: string | number;
  bedrooms?: number;
  bathrooms?: number;
  images: string[];
  status?: string;
  created_at?: string;
  description?: string;
  features?: string[];
  region?: string;
  listing_type?: string;
  rental_price?: number;
  negotiable?: boolean;
  location_coordinates?: unknown;
};

export type PropertyFilters = {
  propertyType: string;
  priceRange: [number, number];
  location: string;
  bedrooms: string;
  bathrooms: string;
  sortBy: string;
  property_type: string;
};
