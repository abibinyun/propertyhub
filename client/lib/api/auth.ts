// Client-side auth mutations — set cookie via credentials: 'include'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function apiFetch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(Array.isArray(err.message) ? err.message[0] : err.message || 'Request failed');
  }
  return res.json();
}

export interface AuthResult {
  user: { id: string; email: string; name: string; role: string };
  token: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<AuthResult>('/auth/login', { email, password }),

  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    apiFetch<AuthResult>('/auth/register', data),

  logout: () =>
    fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' }),
};
