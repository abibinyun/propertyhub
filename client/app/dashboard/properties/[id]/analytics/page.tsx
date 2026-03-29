import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { serverApi } from '@/lib/server/api';
import { getToken } from '@/lib/server/auth';
import { PropertyAnalyticsChart } from '@/components/client/property-analytics-chart';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, MessageSquare, TrendingUp, Percent, Star, ExternalLink } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PropertyAnalyticsPage({ params }: Props) {
  const token = await getToken();
  if (!token) redirect('/login');

  const { id } = await params;

  let analytics: any;
  try {
    analytics = await serverApi.getPropertyAnalytics(id);
  } catch {
    notFound();
  }

  const { property, data, summary, topReferrers } = analytics;

  const stats = [
    { icon: Eye, label: 'Views 30 Hari', value: summary.views30d.toLocaleString('id-ID'), sub: `Total: ${property.viewsCount.toLocaleString('id-ID')}`, color: 'text-violet-500' },
    { icon: MessageSquare, label: 'Leads 30 Hari', value: summary.leads30d, sub: `Total: ${property.leadsCount}`, color: 'text-emerald-500' },
    { icon: Percent, label: 'Conversion Rate', value: `${summary.conversionRate}%`, sub: 'Views → Leads (30 hari)', color: 'text-blue-500' },
    { icon: TrendingUp, label: 'Rank Score', value: Number(property.rankScore ?? 0).toFixed(1), sub: property.featured ? `Featured hingga ${new Date(property.featuredUntil).toLocaleDateString('id-ID')}` : 'Tidak featured', color: 'text-amber-500' },
  ];

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-border/60 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Views + Leads chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border/60 p-5">
          <h2 className="font-semibold text-sm mb-4">Views & Leads per Hari</h2>
          <PropertyAnalyticsChart data={data} />
        </div>

        {/* Top Referrers */}
        <div className="bg-white rounded-2xl border border-border/60 p-5">
          <h2 className="font-semibold text-sm mb-4">Top Sumber Traffic</h2>
          {topReferrers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada data referrer</p>
          ) : (
            <div className="space-y-3">
              {topReferrers.map((r: { referrer: string; count: number }, i: number) => {
                const total = topReferrers.reduce((s: number, x: any) => s + x.count, 0);
                const pct = Math.round((r.count / total) * 100);
                const domain = r.referrer === 'Direct' ? 'Direct' : (() => { try { return new URL(r.referrer).hostname; } catch { return r.referrer; } })();
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="truncate max-w-[140px] font-medium">{domain}</span>
                      <span className="text-muted-foreground">{r.count}x ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Featured status */}
          <div className="mt-6 pt-4 border-t border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-2">Status Featured</p>
            {property.featured ? (
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="font-medium">Aktif</span>
                <span className="text-xs text-muted-foreground">s/d {new Date(property.featuredUntil).toLocaleDateString('id-ID')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Tidak featured</span>
                <Link href="/dashboard/properties" className="text-xs text-primary hover:underline flex items-center gap-1">
                  Promosikan <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
