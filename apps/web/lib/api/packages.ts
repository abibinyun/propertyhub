import { API_URL } from '@/lib/config';
import { AdPackage, UserSubscription } from '@/types/property';

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
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('Tidak dapat terhubung ke server.');
    }
    throw err;
  }
}

export const packagesApi = {
  getPackages: (): Promise<AdPackage[]> => apiFetch('/packages'),

  getMySubscription: (): Promise<UserSubscription | null> =>
    apiFetch('/packages/my-subscription'),

  bumpProperty: (propertyId: string): Promise<{ message: string }> =>
    apiFetch(`/packages/bump/${propertyId}`, { method: 'POST' }),
};
