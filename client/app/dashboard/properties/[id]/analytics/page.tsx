import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { serverApi } from '@/lib/server/api';
import { getToken } from '@/lib/server/auth';
import { PropertyAnalyticsChart } from '@/components/client/property-analytics-chart';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, MessageSquare, TrendingUp } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PropertyAnalyticsPage({ params }: Props) {
  const token = await getToken();
  if (!token) redirect('/login');

  const { id } = await params;

  let analytics;
  try {
    analytics = await serverApi.getPropertyAnalytics(id);
  } catch {
    notFound();
  }

  const { property, data } = analytics;
  const totalLeads30d = data.reduce((s, d) => s + d.leads, 0);

  return (
    <div className="py-2 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="rounded-xl">
          <Link href="/dashboard/properties"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold line-clamp-1">{property.title}</h1>
          <p className="text-sm text-muted-foreground">Analitik 30 hari terakhir</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-border/60 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="h-4 w-4 text-violet-500" />
            <span className="text-xs text-muted-foreground">Total Views</span>
          </div>
          <p className="text-2xl font-bold">{property.viewsCount.toLocaleString('id-ID')}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Sepanjang waktu</p>
        </div>
        <div className="bg-white rounded-2xl border border-border/60 p-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Total Leads</span>
          </div>
          <p className="text-2xl font-bold">{property.leadsCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Sepanjang waktu</p>
        </div>
        <div className="bg-white rounded-2xl border border-border/60 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Leads 30 Hari</span>
          </div>
          <p className="text-2xl font-bold">{totalLeads30d}</p>
          <p className="text-xs text-muted-foreground mt-0.5">30 hari terakhir</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-border/60 p-5">
        <h2 className="font-semibold text-sm mb-4">Leads per Hari</h2>
        <PropertyAnalyticsChart data={data} />
      </div>
    </div>
  );
}
