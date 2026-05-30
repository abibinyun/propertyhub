import { redirect } from 'next/navigation';
import Link from 'next/link';
import { serverApi } from '@/lib/server/api';
import { getToken } from '@/lib/server/auth';
import { getSettings } from '@/lib/server/settings';
import { PropertyList } from '@/components/client/property-list';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Eye, MessageSquare, TrendingUp } from 'lucide-react';

interface Props {
  searchParams: Promise<{ page?: string; search?: string; status?: string; sort?: string }>;
}

export default async function MyPropertiesPage({ searchParams }: Props) {
  const token = await getToken();
  if (!token) redirect('/login');

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const search = sp.search || '';
  const status = sp.status || '';
  const sort = sp.sort || '';

  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', '10');
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  if (sort) params.set('sort', sort);

  const [{ data: properties, meta }, userStats, allForCount, favoriteCounts, settings] = await Promise.all([
    serverApi.getMyProperties(params.toString()),
    serverApi.getUserStats(),
    serverApi.getMyProperties('limit=1000&page=1'),
    serverApi.getPropertyFavoriteCounts().catch(() => ({} as Record<string, number>)),
    getSettings(),
  ]);

  const activeCount = userStats.properties;
  const draftCount = allForCount.data.filter((p) => p.status === 'DRAFT').length;
  const totalCount = allForCount.meta.total;

  const stats = [
    { icon: Building2, label: 'Total', value: totalCount, sub: `${activeCount} aktif · ${draftCount} draft` },
    { icon: Eye, label: 'Total Views', value: userStats.views.toLocaleString('id-ID'), sub: 'Semua properti' },
    { icon: MessageSquare, label: 'Total Leads', value: userStats.leads, sub: 'Semua properti' },
    { icon: TrendingUp, label: 'Avg Rank', value: allForCount.data.length ? Math.round(allForCount.data.reduce((s, p) => s + Number(p.rankScore || 0), 0) / allForCount.data.length) : 0, sub: 'Skor rata-rata' },
  ];

  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Properti Saya</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{totalCount} properti terdaftar</p>
        </div>
        <Button asChild className="rounded-xl gap-2">
          <Link href="/dashboard/properties/new">
            <Plus className="h-4 w-4" />Tambah Properti
          </Link>
        </Button>
      </div>

      {totalCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {stats.map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="bg-white rounded-2xl border border-border/60 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      )}

      <PropertyList
        initialProperties={properties}
        meta={meta}
        initialSearch={search}
        initialStatus={status}
        initialSort={sort}
        favoriteCounts={favoriteCounts}
        prices={{ priceBasic: settings.priceBasic, pricePremium: settings.pricePremium, priceUltimate: settings.priceUltimate }}
      />
    </div>
  );
}
