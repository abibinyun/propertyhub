// Client-only fetch with auto-refresh interceptor
// Import ini HANYA dari Client Components

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function clientFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const doFetch = () =>
    fetch(`${API_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });

  try {
    let res = await doFetch();

    if (res.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        const ok = await tryRefresh();
        isRefreshing = false;
        refreshQueue.forEach((fn) => fn());
        refreshQueue = [];
        if (!ok) throw { statusCode: 401, message: 'Unauthorized' };
      } else {
        await new Promise<void>((resolve) => refreshQueue.push(resolve));
      }
      res = await doFetch();
    }

    if (!res.ok) throw await res.json();
    return res.json();
  } catch (err: unknown) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('Tidak dapat terhubung ke server. Coba lagi nanti.');
    }
    throw err;
  }
}
