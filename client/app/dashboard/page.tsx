import { redirect } from 'next/navigation';
import Link from 'next/link';
import { serverApi } from '@/lib/server/api';
import { getToken } from '@/lib/server/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Heart, MessageSquare, Eye, Plus } from 'lucide-react';

export default async function DashboardPage() {
  const token = await getToken();
  if (!token) redirect('/login');

  const [user, stats] = await Promise.all([
    serverApi.getMe(),
    serverApi.getUserStats(),
  ]);

  const statCards = [
    { title: 'Total Properti', value: stats.properties, icon: Building2, sub: 'Properti aktif' },
    { title: 'Total Views', value: stats.views, icon: Eye, sub: 'Dilihat bulan ini' },
    { title: 'Leads', value: stats.leads, icon: MessageSquare, sub: 'Pertanyaan masuk' },
    { title: 'Favorites', value: stats.favorites, icon: Heart, sub: 'Properti favorit' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Selamat datang, {user.name}!</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/properties/new" className="gap-2">
            <Plus className="h-4 w-4" />
            Pasang Iklan
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map(({ title, value, icon: Icon, sub }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: '/dashboard/properties', icon: Building2, label: 'Properti Saya', sub: 'Kelola listing Anda' },
          { href: '/dashboard/leads', icon: MessageSquare, label: 'Leads', sub: 'Pertanyaan masuk' },
          { href: '/dashboard/favorites', icon: Heart, label: 'Favorit', sub: 'Properti tersimpan' },
        ].map(({ href, icon: Icon, label, sub }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <Icon className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-semibold">{label}</p>
                  <p className="text-sm text-muted-foreground">{sub}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
