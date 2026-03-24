import { redirect } from 'next/navigation';
import { serverApi } from '@/lib/server/api';
import { getToken } from '@/lib/server/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Building2, MessageSquare, TrendingUp } from 'lucide-react';

export default async function AdminDashboardPage() {
  const token = await getToken();
  if (!token) redirect('/login');

  const me = await serverApi.getMe();
  if (me.role !== 'ADMIN') redirect('/');

  const data = await serverApi.getAdminStats();
  const { stats, recentUsers, recentProperties } = data;

  const statCards = [
    { title: 'Total Pengguna', value: stats.totalUsers, icon: Users },
    { title: 'Total Properti', value: stats.totalProperties, icon: Building2 },
    { title: 'Total Leads', value: stats.totalLeads, icon: MessageSquare },
    { title: 'Properti Aktif', value: stats.activeProperties, icon: TrendingUp },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Admin</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ title, value, icon: Icon }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Pengguna Terbaru</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>{u.role}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Properti Terbaru</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {recentProperties.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.city}</p>
                </div>
                <Badge variant={p.status === 'ACTIVE' ? 'default' : 'secondary'} className="ml-2 flex-shrink-0">
                  {p.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
