const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const reviewsApi = {
  create: (agentId: string, data: { rating: number; comment?: string }) =>
    fetch(`${API_URL}/reviews/agent/${agentId}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(async (r) => { if (!r.ok) throw await r.json(); return r.json(); }),
};
