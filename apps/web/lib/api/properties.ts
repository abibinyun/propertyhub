import { Property, CreatePropertyDto, UpdatePropertyDto, PropertyImage } from '@/types/property';
import { PaginatedResponse } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface PropertyQuery {
  city?: string;
  propertyType?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

// Server-safe fetch (no auto-refresh, used in Server Components)
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
      throw new Error('Tidak dapat terhubung ke server. Coba lagi nanti.');
    }
    throw err;
  }
}

export const propertiesApi = {
  getAll: (params?: PropertyQuery): Promise<PaginatedResponse<Property>> => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return apiFetch(`/properties${qs}`, { cache: 'no-store' } as RequestInit);
  },

  getByCategory: (path: string, params?: PropertyQuery): Promise<PaginatedResponse<Property>> => {
    const clean = params
      ? Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== undefined && v !== null && !Number.isNaN(v))
        )
      : {};
    const qs = Object.keys(clean).length ? '?' + new URLSearchParams(clean as Record<string, string>).toString() : '';
    return apiFetch(`/properties/${path}${qs}`, { cache: 'no-store' } as RequestInit);
  },

  getBySlug: (slug: string): Promise<Property> =>
    apiFetch(`/properties/properti/detail/${slug}`, { cache: 'no-store' } as RequestInit),

  getPriceHistory: (slug: string): Promise<{ price: number; createdAt: string }[]> =>
    apiFetch(`/properties/price-history/${slug}`, { cache: 'no-store' } as RequestInit),

  uploadFloorPlan: async (propertyId: string, file: File): Promise<{ floorPlanUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/properties/${propertyId}/floor-plan`, {
      method: 'POST', credentials: 'include', body: formData,
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  deleteFloorPlan: (propertyId: string): Promise<{ message: string }> =>
    apiFetch(`/properties/${propertyId}/floor-plan`, { method: 'DELETE' }),

  getMy: (): Promise<Property[]> => apiFetch('/properties/my'),

  create: (data: CreatePropertyDto): Promise<Property> =>
    apiFetch('/properties', { method: 'POST', body: JSON.stringify(data) }),

  update: (slug: string, data: UpdatePropertyDto): Promise<Property> =>
    apiFetch(`/properties/${slug}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (slug: string): Promise<{ message: string }> =>
    apiFetch(`/properties/${slug}`, { method: 'DELETE' }),

  deleteImage: (imageId: string): Promise<{ message: string }> =>
    apiFetch(`/properties/images/${imageId}`, { method: 'DELETE' }),

  setPrimaryImage: (imageId: string): Promise<{ message: string }> =>
    apiFetch(`/properties/images/${imageId}/primary`, { method: 'PATCH' }),

  uploadImage: async (propertyId: string, file: File, isPrimary: boolean, order: number): Promise<PropertyImage> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isPrimary', String(isPrimary));
    formData.append('order', String(order));
    try {
      const res = await fetch(`${API_URL}/properties/${propertyId}/images`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) throw await res.json();
      return res.json();
    } catch (err: unknown) {
      if (err instanceof TypeError && err.message.includes('fetch')) throw new Error('Tidak dapat terhubung ke server.');
      throw err;
    }
  },
};