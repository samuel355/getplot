/**
 * Resolve image URLs the same way as the Next.js app (usePropertyStore, listings).
 * Properties bucket: full publicUrl or { url } objects.
 * Legacy house/land listings use NEXT_PUBLIC_IMAGE_URL / IMAGE_LAND_URL prefixes.
 */

type ImageInput = string | { url?: string; path?: string } | null | undefined;

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://izawjgcfbdfvixnqjqjg.supabase.co';

export const STORAGE = {
  properties: `${supabaseUrl}/storage/v1/object/public/properties/`,
  houseListing: process.env.EXPO_PUBLIC_IMAGE_URL || '',
  landListing: process.env.EXPO_PUBLIC_IMAGE_LAND_URL || '',
};

export function resolveImageUrl(input: ImageInput): string | null {
  if (!input) return null;

  if (typeof input === 'object') {
    if (input.url) return input.url;
    if (input.path) {
      const path = input.path.startsWith('/') ? input.path.slice(1) : input.path;
      return `${STORAGE.properties}${path}`;
    }
    return null;
  }

  const value = input.trim();
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;

  if (value.startsWith('property-images/') || value.includes('/')) {
    const path = value.startsWith('properties/') ? value.replace(/^properties\//, '') : value;
    return `${STORAGE.properties}${path}`;
  }

  return value;
}

/** Normalize properties.images from Supabase (string | object[]) */
export function normalizePropertyImages(
  images: unknown
): string[] {
  if (!images) return [];
  if (!Array.isArray(images)) return [];

  return images
    .map((img) => resolveImageUrl(img as ImageInput))
    .filter((url): url is string => Boolean(url));
}
