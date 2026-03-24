// Client-side user mutations
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const usersApi = {
  updateProfile: async (data: { name?: string; phone?: string; company?: string }) => {
    const res = await fetch(`${API_URL}/users/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
};
