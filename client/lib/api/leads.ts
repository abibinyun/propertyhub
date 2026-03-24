import { Lead, CreateLeadDto } from '@/types/lead';

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

export const leadsApi = {
  getUnreadCount: (): Promise<{ count: number }> =>
    apiFetch('/leads/unread-count'),

  create: (data: CreateLeadDto): Promise<Lead> =>
    apiFetch('/leads', { method: 'POST', body: JSON.stringify(data) }),

  getMy: (): Promise<Lead[]> => apiFetch('/leads/my'),

  getByProperty: (propertyId: string): Promise<Lead[]> =>
    apiFetch(`/leads/property/${propertyId}`),

  updateStatus: (id: string, status: string): Promise<Lead> =>
    apiFetch(`/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};
