import { getAuthHeader } from '@/lib/server/auth';
import { User } from '@/types/auth';
import { Property } from '@/types/property';
import { PaginatedResponse } from '@/types/api';
import { FavoriteItem } from '@/lib/api/favorites';
import { Lead } from '@/types/lead';
import { AdminStats, AdminUser, AdminLead, ModerationLog } from '@/lib/api/admin';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function serverFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const authHeader = await getAuthHeader();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...authHeader, ...init?.headers },
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw err;
  }
  return res.json();
}

export const serverApi = {
  // Auth
  getMe: () => serverFetch<User>('/auth/me'),

  // Users
  getUserStats: () => serverFetch<{ properties: number; leads: number; favorites: number; views: number; receivedFavorites: number }>('/users/stats'),
  getUserProfile: () => serverFetch<User>('/users/profile'),

  // Properties
  getMyProperties: (params?: string) => serverFetch<{ data: Property[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(`/properties/my${params ? '?' + params : ''}`),

  // Favorites
  getFavorites: () => serverFetch<FavoriteItem[]>('/favorites'),
  getFavoriteIds: () => serverFetch<string[]>('/favorites/ids'),
  getPropertyFavoriteCounts: () => serverFetch<Record<string, number>>('/favorites/property-counts'),

  // Leads
  getMyLeads: (params?: string) => serverFetch<{ data: Lead[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(`/leads/my${params ? '?' + params : ''}`),
  getReceivedLeads: (params?: string) => serverFetch<{ data: Lead[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(`/leads/received${params ? '?' + params : ''}`),

  // Admin
  getAdminStats: () => serverFetch<AdminStats>('/admin/stats'),
  getAdminUsers: (params?: string) => serverFetch<PaginatedResponse<AdminUser>>(`/admin/users${params ? '?' + params : ''}`),
  getAdminProperties: (params?: string) => serverFetch<PaginatedResponse<Property>>(`/admin/properties${params ? '?' + params : ''}`),
  getModerationQueue: (status = 'PENDING') => serverFetch<PaginatedResponse<Property>>(`/admin/moderation/queue?status=${status}`),
  getModerationLogs: () => serverFetch<PaginatedResponse<ModerationLog>>('/admin/moderation/logs'),
  getAdminLeads: (params?: string) => serverFetch<PaginatedResponse<AdminLead>>(`/admin/leads${params ? '?' + params : ''}`),
};
