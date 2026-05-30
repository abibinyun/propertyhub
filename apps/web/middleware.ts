import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip: admin, api, static, maintenance page itself
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/maintenance') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  try {
    const res = await fetch(`${API_URL}/settings`, { next: { revalidate: 60 } });
    if (res.ok) {
      const settings = await res.json();
      if (settings.maintenanceMode) {
        return NextResponse.rewrite(new URL('/maintenance', request.url));
      }
    }
  } catch {
    // Jika server down, tetap lanjut (jangan block user)
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
