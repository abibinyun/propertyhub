import { redirect } from 'next/navigation';
import { getToken } from '@/lib/server/auth';
import { serverApi } from '@/lib/server/api';
import { DashboardSidebar } from '@/components/client/dashboard-sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const token = await getToken();
  if (!token) redirect('/login?redirect=/dashboard');

  const user = await serverApi.getMe().catch(() => null);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6 items-start">
          <DashboardSidebar user={user} />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
