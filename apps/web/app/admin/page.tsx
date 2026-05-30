import Link from 'next/link';
import { serverApi } from '@/lib/server/api';
import { Badge } from '@/components/ui/badge';
import { SimpleBarChart, SimpleDonutChart } from '@/components/client/admin-charts';
import { formatPrice } from '@/lib/utils';
import {
  Users, Building2, MessageSquare, TrendingUp,
  Clock, CheckCircle2, AlertTriangle, ArrowUpRight,
} from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  HOUSE: '#3b82f6', APARTMENT: '#8b5cf6', LAND: '#10b981',
  COMMERCIAL: '#f59e0b', VILLA: '#ef4444', WAREHOUSE: '#6b7280',
};
const TYPE_LABEL: Record<string, string> = {
  HOUSE: 'Rumah', APARTMENT: 'Apartemen', LAND: 'Tanah',
  COMMERCIAL: 'Ruko', VILLA: 'Villa', WAREHOUSE: 'Gudang',
};
const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  DRAFT: 'bg-slate-100 text-slate-600',
  INACTIVE: 'bg-red-100 text-red-600',
  SOLD: 'bg-blue-100 text-blue-700',
  RENTED: 'bg-purple-100 text-purple-700',
};

function StatCard({ title, value, sub, icon: Icon, color, href }: {
  title: string; value: number | string; sub?: string;
  icon: React.ElementType; color: string; href?: string;
}) {
  const content = (
    <div className={`bg-white rounded-2xl border border-border/60 p-5 flex items-start justify-between gap-4 ${href ? 'hover:shadow-md transition-shadow' : ''}`}>
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : <div>{content}</div>;
}

export default async function AdminDashboardPage() {
  const data = await serverApi.getAdminStats();
  const { stats, recentUsers, recentProperties, charts } = data;

  // Siapkan data chart listing harian (30 hari)
  const today = new Date();
  const dailyMap = new Map(charts.dailyListings.map((d) => [d.date, d.count]));
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().split('T')[0];
    return { label: key.slice(5), value: dailyMap.get(key) ?? 0 };
  });

  const donutData = charts.propertiesByType.map((p) => ({
    label: TYPE_LABEL[p.type] ?? p.type,
    value: p.count,
    color: TYPE_COLORS[p.type] ?? '#94a3b8',
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Ringkasan aktivitas platform PropertyHub</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Pengguna" value={stats.totalUsers.toLocaleString()}
          sub={`+${stats.newUsersToday} hari ini`} icon={Users}
          color="bg-blue-50 text-blue-600" href="/admin/users" />
        <StatCard title="Total Properti" value={stats.totalProperties.toLocaleString()}
          sub={`${stats.activeProperties} aktif`} icon={Building2}
          color="bg-emerald-50 text-emerald-600" href="/admin/properties" />
        <StatCard title="Total Leads" value={stats.totalLeads.toLocaleString()}
          sub={`+${stats.newLeadsToday} hari ini`} icon={MessageSquare}
          color="bg-purple-50 text-purple-600" href="/admin/leads" />
        <StatCard title="Pending Moderasi" value={stats.pendingModeration}
          sub="Menunggu review" icon={AlertTriangle}
          color={stats.pendingModeration > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}
          href="/admin/moderation" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Listing harian */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-sm text-slate-900">Listing Baru</p>
              <p className="text-xs text-muted-foreground">30 hari terakhir</p>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <SimpleBarChart data={last30} color="#3b82f6" height={120} />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">{last30[0]?.label}</span>
            <span className="text-xs text-muted-foreground">{last30[last30.length - 1]?.label}</span>
          </div>
        </div>

        {/* Distribusi tipe */}
        <div className="bg-white rounded-2xl border border-border/60 p-5">
          <div className="mb-4">
            <p className="font-semibold text-sm text-slate-900">Distribusi Tipe</p>
            <p className="text-xs text-muted-foreground">Semua properti</p>
          </div>
          <SimpleDonutChart data={donutData} size={110} />
        </div>
      </div>

      {/* Top kota */}
      <div className="bg-white rounded-2xl border border-border/60 p-5">
        <p className="font-semibold text-sm text-slate-900 mb-4">Top Kota</p>
        <div className="space-y-2.5">
          {charts.propertiesByCity.map((c, i) => {
            const pct = stats.totalProperties > 0 ? (c.count / stats.totalProperties) * 100 : 0;
            return (
              <div key={c.city} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                <span className="text-sm font-medium w-36 truncate">{c.city}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{c.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent users */}
        <div className="bg-white rounded-2xl border border-border/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm text-slate-900">Pengguna Terbaru</p>
            <Link href="/admin/users" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Lihat semua <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600 flex-shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent properties */}
        <div className="bg-white rounded-2xl border border-border/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm text-slate-900">Properti Terbaru</p>
            <Link href="/admin/properties" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Lihat semua <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentProperties.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.city} · {formatPrice(p.price)}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[p.status] ?? 'bg-slate-100 text-slate-600'}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
