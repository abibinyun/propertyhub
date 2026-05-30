import { redirect } from 'next/navigation';
import Link from 'next/link';
import { serverApi } from '@/lib/server/api';
import { getToken } from '@/lib/server/auth';
import { AdminSidebarActive } from '@/components/client/admin-sidebar-active';
import { LayoutDashboard, LogOut } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = await getToken();
  if (!token) redirect('/login');

  let user;
  try {
    user = await serverApi.getMe();
  } catch {
    redirect('/login');
  }
  if (user.role !== 'ADMIN') redirect('/');

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6 items-start">

          {/* Sidebar */}
          <aside className="hidden lg:flex w-56 flex-shrink-0 sticky top-20 flex-col bg-slate-50/50 rounded-2xl border border-border/60 overflow-hidden">
            {/* User info */}
            <div className="p-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-border/60">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">Admin</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 space-y-1">
              <AdminSidebarActive />
            </nav>

            {/* Bottom */}
            <div className="p-3 border-t border-border/50 mt-4 space-y-1">
              <Link href="/dashboard"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white transition-all">
                <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
                Dashboard User
              </Link>
              <Link href="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white transition-all">
                <LogOut className="h-4 w-4 flex-shrink-0" />
                Kembali ke Situs
              </Link>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
