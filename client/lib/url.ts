import { Property } from '@/types/property';

const LISTING_SLUG: Record<string, string> = { SALE: 'jual', RENT: 'sewa' };
const TYPE_SLUG: Record<string, string> = {
  HOUSE: 'rumah', APARTMENT: 'apartemen', LAND: 'tanah',
  COMMERCIAL: 'komersial', VILLA: 'villa', WAREHOUSE: 'gudang',
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/**
 * URL detail: /properti/kota[-kecamatan]/slug
 * Contoh: /properti/jakarta-selatan-cipete/rumah-mewah-3-kamar
 */
export function propertyDetailUrl(property: Pick<Property, 'slug' | 'city' | 'district'>): string {
  const city = slugify(property.city);
  const district = slugify(property.district);
  const location = district ? `${city}-${district}` : city;
  return `/properti/${location}/${property.slug}`;
}

/**
 * URL listing: /jual/kota/[kecamatan]/jenis
 * Contoh: /jual/jakarta-selatan/rumah
 * Contoh: /jual/jakarta-selatan/cipete/rumah
 */
export function listingUrl(params: {
  listingType: string;
  city?: string;
  district?: string;
  propertyType?: string;
}): string {
  const status = LISTING_SLUG[params.listingType] ?? params.listingType.toLowerCase();
  const parts = [status];
  if (params.city) parts.push(slugify(params.city));
  if (params.district) parts.push(slugify(params.district));
  if (params.propertyType) parts.push(TYPE_SLUG[params.propertyType] ?? params.propertyType.toLowerCase());
  return '/' + parts.join('/');
}
