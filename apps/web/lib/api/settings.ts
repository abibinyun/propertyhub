import { SiteSettings } from '@/lib/server/settings';

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

export const settingsApi = {
  get: (): Promise<SiteSettings> => apiFetch('/settings'),

  update: (data: Partial<SiteSettings>): Promise<SiteSettings> =>
    apiFetch('/settings', { method: 'PATCH', body: JSON.stringify(data) }),

  uploadLogo: async (file: File): Promise<{ logoUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/settings/logo`, {
      method: 'POST', credentials: 'include', body: formData,
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  uploadFavicon: async (file: File): Promise<{ faviconUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/settings/favicon`, {
      method: 'POST', credentials: 'include', body: formData,
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
};
