// Client-side auth mutations — set cookie via credentials: 'include'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function apiFetch<T>(path: string, body: unknown): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(Array.isArray(err.message) ? err.message[0] : err.message || 'Request failed');
    }
    return res.json();
  } catch (err: unknown) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('Tidak dapat terhubung ke server. Coba lagi nanti.');
    }
    throw err;
  }
}

export interface AuthResult {
  user: { id: string; email: string; name: string; role: string; emailVerified: boolean };
  token: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<AuthResult>('/auth/login', { email, password }),

  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    apiFetch<AuthResult>('/auth/register', data),

  logout: () =>
    fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' }),

  forgotPassword: (email: string) =>
    apiFetch<{ message: string }>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    apiFetch<{ message: string }>('/auth/reset-password', { token, password }),

  googleLogin: () => {
    window.location.href = `${API_URL}/auth/google`;
  },
};
