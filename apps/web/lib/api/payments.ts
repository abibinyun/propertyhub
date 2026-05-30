const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
    if (!res.ok) throw await res.json();
    return res.json();
  } catch (err: unknown) {
    if (err instanceof TypeError && err.message.includes('fetch')) throw new Error('Tidak dapat terhubung ke server.');
    throw err;
  }
}

export interface FeaturedPaymentResult {
  token: string;
  redirectUrl: string;
  orderId: string;
  amount: number;
  featuredType: string;
}

export const FEATURED_TIERS = [
  { type: 'BASIC', label: 'Basic', price: 99000, duration: '1 minggu', boost: '1.3x', perks: ['Muncul di atas hasil pencarian', 'Rank boost 1.3x', 'Freshness tidak turun'] },
  { type: 'PREMIUM', label: 'Premium', price: 299000, duration: '1 minggu', boost: '1.5x', perks: ['Tampil di homepage', 'Rank boost 1.5x', 'Freshness tidak turun', 'Badge Unggulan'] },
  { type: 'ULTIMATE', label: 'Ultimate', price: 599000, duration: '1 bulan', boost: '2x', perks: ['Posisi teratas di mana saja', 'Rank boost 2x', 'Freshness tidak turun', 'Badge Premium', 'Prioritas support'] },
] as const;

export function getFeaturedTiers(prices?: { priceBasic: number; pricePremium: number; priceUltimate: number }) {
  if (!prices) return FEATURED_TIERS.map((t) => ({ ...t }));
  return [
    { ...FEATURED_TIERS[0], price: prices.priceBasic },
    { ...FEATURED_TIERS[1], price: prices.pricePremium },
    { ...FEATURED_TIERS[2], price: prices.priceUltimate },
  ];
}

export const paymentsApi = {
  createFeatured: (propertyId: string, featuredType: string): Promise<FeaturedPaymentResult> =>
    apiFetch(`/payments/featured/${propertyId}/${featuredType}`, { method: 'POST' }),

  // Dev only (log mode)
  activateDirect: (propertyId: string, featuredType: string): Promise<{ featured: boolean }> =>
    apiFetch(`/payments/featured/${propertyId}/${featuredType}/activate`, { method: 'POST' }),
};
