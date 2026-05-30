import { cookies } from 'next/headers';
import { cache } from 'react';

// cache() deduplicates calls within a single render pass
export const getToken = cache(async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value ?? null;
});

export async function getAuthHeader(): Promise<HeadersInit> {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
