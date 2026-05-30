import type { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const STATUSES = ['jual', 'sewa'];
const TYPES = ['rumah', 'apartemen', 'tanah', 'komersial', 'villa', 'gudang'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, priority: 1, changeFrequency: 'daily' },
    { url: `${BASE_URL}/about`, lastModified: now, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/contact`, lastModified: now, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/privacy`, lastModified: now, priority: 0.3, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/terms`, lastModified: now, priority: 0.3, changeFrequency: 'monthly' },
    ...STATUSES.map(s => ({ url: `${BASE_URL}/${s}`, lastModified: now, priority: 0.9, changeFrequency: 'daily' as const })),
    ...STATUSES.flatMap(s => TYPES.map(t => ({ url: `${BASE_URL}/${s}/${t}`, lastModified: now, priority: 0.8, changeFrequency: 'daily' as const }))),
  ];

  try {
    const res = await fetch(`${API_URL}/properties?limit=500`, { cache: 'no-store' });
    const { data } = await res.json();

    const cities = [...new Set<string>((data ?? []).map((p: { city: string }) => p.city.toLowerCase().replace(/\s+/g, '-')))];
    const cityUrls: MetadataRoute.Sitemap = STATUSES.flatMap(s =>
      cities.map(city => ({ url: `${BASE_URL}/${s}/${city}`, lastModified: now, priority: 0.7, changeFrequency: 'daily' as const }))
    );

    const propertyUrls: MetadataRoute.Sitemap = (data ?? []).map((p: { city: string; slug: string; updatedAt: string }) => ({
      url: `${BASE_URL}/properti/${p.city.toLowerCase().replace(/\s+/g, '-')}/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    }));

    return [...staticUrls, ...cityUrls, ...propertyUrls];
  } catch {
    return staticUrls;
  }
}
