import { Property } from '@/types/property';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface FavoriteItem {
  id: string;
  propertyId: string;
  property: Property;
  createdAt: string;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, { ...init, credentials: 'include' });
    if (!res.ok) throw await res.json();
    return res.json();
  } catch (err: unknown) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('Tidak dapat terhubung ke server.');
    }
    throw err;
  }
}

export const favoritesApi = {
  getAll: (): Promise<FavoriteItem[]> => apiFetch('/favorites'),
  getIds: (): Promise<string[]> => apiFetch('/favorites/ids'),
  add: (propertyId: string): Promise<FavoriteItem> => apiFetch(`/favorites/${propertyId}`, { method: 'POST' }),
  remove: (propertyId: string): Promise<void> => apiFetch(`/favorites/${propertyId}`, { method: 'DELETE' }),
  check: (propertyId: string): Promise<{ isFavorited: boolean }> => apiFetch(`/favorites/check/${propertyId}`),
};
