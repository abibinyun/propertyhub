const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(Array.isArray(err.message) ? err.message[0] : err.message || 'Request failed');
  }
  return res.json();
}

export const usersApi = {
  updateProfile: (data: { name?: string; phone?: string; company?: string }) =>
    apiFetch('/users/profile', { method: 'PATCH', body: JSON.stringify(data) }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiFetch('/users/password', { method: 'PATCH', body: JSON.stringify(data) }),
};
