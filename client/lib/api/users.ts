const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  try {
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
  } catch (err: unknown) {
    if (err instanceof TypeError && err.message.includes('fetch')) throw new Error('Tidak dapat terhubung ke server.');
    throw err;
  }
}

export const usersApi = {
  updateProfile: (data: { name?: string; phone?: string; company?: string; username?: string; bio?: string }) =>
    apiFetch('/users/profile', { method: 'PATCH', body: JSON.stringify(data) }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiFetch('/users/password', { method: 'PATCH', body: JSON.stringify(data) }),

  checkUsername: (username: string): Promise<{ available: boolean }> =>
    apiFetch(`/users/check-username/${username}`),

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/users/avatar`, {
      method: 'POST', credentials: 'include', body: formData,
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
};
