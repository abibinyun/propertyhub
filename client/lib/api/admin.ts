import { Property } from '@/types/property';
import { User } from '@/types/auth';
import { PaginatedResponse } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export interface AdminStats {
  stats: {
    totalUsers: number;
    totalProperties: number;
    totalLeads: number;
    activeProperties: number;
    draftProperties: number;
    pendingModeration: number;
    newUsersToday: number;
    newLeadsToday: number;
  };
  recentUsers: Pick<User, 'id' | 'name' | 'email' | 'role'>[];
  recentProperties: Pick<Property, 'id' | 'title' | 'status' | 'price' | 'city'>[];
  charts: {
    propertiesByType: { type: string; count: number }[];
    propertiesByCity: { city: string; count: number }[];
    dailyListings: { date: string; count: number }[];
    dailyLeads: { date: string; count: number }[];
  };
}

export interface AdminUser extends Pick<User, 'id' | 'email' | 'name' | 'phone' | 'role' | 'verified' | 'company'> {
  createdAt: string;
  _count: { properties: number; leads: number };
}

export interface ModerationLog {
  id: string;
  action: string;
  reason?: string;
  notes?: string;
  createdAt: string;
  property: { title: string; slug: string };
  moderator: { name: string; email: string };
}

export interface AdminLead {
  id: string;
  name: string;
  phone: string;
  message?: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  property: { title: string; slug: string; city: string };
}

export const adminApi = {
  getStats: (): Promise<AdminStats> => apiFetch('/admin/stats'),
  getUsers: (params?: string): Promise<PaginatedResponse<AdminUser>> =>
    apiFetch(`/admin/users${params ? '?' + params : ''}`),
  updateUser: (id: string, data: { role?: string; verified?: boolean }): Promise<AdminUser> =>
    apiFetch(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  banUser: (id: string, reason: string): Promise<{ message: string }> =>
    apiFetch(`/admin/users/${id}/ban`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  getProperties: (params?: string): Promise<PaginatedResponse<Property>> =>
    apiFetch(`/admin/properties${params ? '?' + params : ''}`),
  deleteProperty: (id: string): Promise<{ message: string }> =>
    apiFetch(`/admin/properties/${id}`, { method: 'DELETE' }),
  getModerationQueue: (status = 'PENDING'): Promise<PaginatedResponse<Property>> =>
    apiFetch(`/admin/moderation/queue?status=${status}`),
  approve: (id: string, notes?: string): Promise<{ message: string }> =>
    apiFetch(`/admin/moderation/${id}/approve`, { method: 'PATCH', body: JSON.stringify({ notes }) }),
  reject: (id: string, reason: string, notes?: string): Promise<{ message: string }> =>
    apiFetch(`/admin/moderation/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason, notes }) }),
  flag: (id: string, reason: string): Promise<{ message: string }> =>
    apiFetch(`/admin/moderation/${id}/flag`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  getModerationLogs: (): Promise<PaginatedResponse<ModerationLog>> =>
    apiFetch('/admin/moderation/logs'),
  getLeads: (params?: string): Promise<PaginatedResponse<AdminLead>> =>
    apiFetch(`/admin/leads${params ? '?' + params : ''}`),
};
