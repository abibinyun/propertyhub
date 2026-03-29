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
  { type: 'BASIC', label: 'Basic', price: 50000, duration: '1 minggu', perks: ['Muncul di atas hasil pencarian', '2x lebih banyak dilihat'] },
  { type: 'PREMIUM', label: 'Premium', price: 100000, duration: '1 minggu', perks: ['Tampil di homepage', '5x lebih banyak dilihat', 'Badge Unggulan'] },
  { type: 'ULTIMATE', label: 'Ultimate', price: 200000, duration: '1 bulan', perks: ['Posisi teratas di mana saja', '10x lebih banyak dilihat', 'Badge Premium', 'Prioritas support'] },
] as const;

export const paymentsApi = {
  createFeatured: (propertyId: string, featuredType: string): Promise<FeaturedPaymentResult> =>
    apiFetch(`/payments/featured/${propertyId}/${featuredType}`, { method: 'POST' }),

  // Dev only (log mode)
  activateDirect: (propertyId: string, featuredType: string): Promise<{ featured: boolean }> =>
    apiFetch(`/payments/featured/${propertyId}/${featuredType}/activate`, { method: 'POST' }),
};
