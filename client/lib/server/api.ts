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
  try {
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
  } catch (err: unknown) {
    // Network error (BE mati) — wrap jadi error yang bisa dibaca
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('Tidak dapat terhubung ke server. Pastikan koneksi internet Anda aktif.');
    }
    throw err;
  }
}

export const serverApi = {
  // Auth
  getMe: () => serverFetch<User>('/auth/me'),

  // Users
  getUserStats: () => serverFetch<{ properties: number; leads: number; favorites: number; views: number; receivedFavorites: number }>('/users/stats'),
  getUserProfile: () => serverFetch<User>('/users/profile'),

  // Properties
  getMyProperties: (params?: string) => serverFetch<{ data: Property[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(`/properties/my${params ? '?' + params : ''}`),
  getPropertyAnalytics: (propertyId: string) => serverFetch<{
    property: { id: string; title: string; viewsCount: number; leadsCount: number; rankScore: number; featured: boolean; featuredUntil: string | null };
    summary: { views30d: number; leads30d: number; conversionRate: number };
    topReferrers: { referrer: string; count: number }[];
    data: { date: string; label: string; leads: number; views: number }[];
  }>(`/properties/my/analytics/${propertyId}`),

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
  getReports: (resolved?: string) => serverFetch<any[]>(`/reports${resolved !== undefined ? `?resolved=${resolved}` : ''}`),
  getSavedSearches: () => serverFetch<any[]>('/saved-searches'),
  getAgentProfile: (handle: string) => serverFetch<any>(`/users/${handle}/public`),
  getAgentReviews: (agentId: string) => serverFetch<any>(`/reviews/agent/${agentId}`),
};
