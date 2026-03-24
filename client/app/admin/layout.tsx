import { redirect } from 'next/navigation';
import Link from 'next/link';
import { serverApi } from '@/lib/server/api';
import { getToken } from '@/lib/server/auth';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Building2, ShieldCheck } from 'lucide-react';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/moderation', label: 'Moderasi', icon: ShieldCheck },
  { href: '/admin/properties', label: 'Properti', icon: Building2 },
  { href: '/admin/users', label: 'Pengguna', icon: Users },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = await getToken();
  if (!token) redirect('/login');

  const user = await serverApi.getMe();
  if (user.role !== 'ADMIN') redirect('/');

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-muted/30 flex-shrink-0">
        <div className="p-4 border-b">
          <p className="font-bold text-sm">Admin Panel</p>
          <p className="text-xs text-muted-foreground">{user.name}</p>
        </div>
        <nav className="p-2 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent')}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
