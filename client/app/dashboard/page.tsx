import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { serverApi } from '@/lib/server/api';
import { getToken } from '@/lib/server/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2, Heart, MessageSquare, Eye, Plus, ArrowRight,
  TrendingUp, MapPin, Phone, Mail, Bell,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { propertyDetailUrl } from '@/lib/url';
import { Lead, LeadStatus } from '@/types/lead';
import { Property } from '@/types/property';

const STATUS_COLOR: Record<LeadStatus, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-amber-100 text-amber-700',
  QUALIFIED: 'bg-purple-100 text-purple-700',
  CLOSED: 'bg-emerald-100 text-emerald-700',
  LOST: 'bg-red-100 text-red-700',
};
const STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: 'Baru', CONTACTED: 'Dihubungi', QUALIFIED: 'Qualified', CLOSED: 'Selesai', LOST: 'Batal',
};

export default async function DashboardPage() {
  const token = await getToken();
  if (!token) redirect('/login');

  const [user, stats, recentLeads, recentProperties] = await Promise.all([
    serverApi.getMe(),
    serverApi.getUserStats().catch(() => ({ properties: 0, leads: 0, favorites: 0, views: 0, receivedFavorites: 0 })),
    serverApi.getReceivedLeads('limit=5').catch(() => ({ data: [] as Lead[], meta: { total: 0, page: 1, limit: 5, totalPages: 0 } })),
    serverApi.getMyProperties('limit=4').catch(() => ({ data: [] as Property[], meta: { total: 0, page: 1, limit: 4, totalPages: 0 } })),
  ]);

  const newLeadsCount = recentLeads.data.filter((l) => l.status === 'NEW').length;

  const statCards = [
    { label: 'Properti Aktif', value: stats.properties, icon: Building2, color: 'bg-blue-50 text-blue-600', href: '/dashboard/properties' },
    { label: 'Total Views', value: stats.views, icon: Eye, color: 'bg-violet-50 text-violet-600', href: '/dashboard/properties' },
    { label: 'Leads Masuk', value: stats.leads, icon: MessageSquare, color: 'bg-emerald-50 text-emerald-600', href: '/dashboard/leads' },
    { label: 'Difavoritkan', value: stats.receivedFavorites, icon: Heart, color: 'bg-rose-50 text-rose-600', href: '/dashboard/properties' },
  ];

  return (
    <div className="py-2 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Selamat datang, {user.name.split(' ')[0]}! 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button asChild className="rounded-xl gap-2 flex-shrink-0">
          <Link href="/dashboard/properties/new">
            <Plus className="h-4 w-4" />Pasang Iklan
          </Link>
        </Button>
      </div>

      {/* Alert leads baru */}
      {newLeadsCount > 0 && (
        <Link href="/dashboard/leads" className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl hover:bg-blue-100 transition-colors">
          <div className="h-9 w-9 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Bell className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900">
              {newLeadsCount} leads baru menunggu respons
            </p>
            <p className="text-xs text-blue-600">Segera hubungi calon pembeli</p>
          </div>
          <ArrowRight className="h-4 w-4 text-blue-500 flex-shrink-0" />
        </Link>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href}>
            <div className="bg-white rounded-2xl border border-border/60 p-4 hover:shadow-md transition-all hover:border-border group">
              <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold group-hover:text-primary transition-colors">{value ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent leads */}
        <div className="bg-white rounded-2xl border border-border/60 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm">Leads Terbaru</h2>
            </div>
            <Link href="/dashboard/leads" className="text-xs text-primary hover:underline flex items-center gap-1">
              Lihat semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentLeads.data.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Belum ada leads masuk</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {recentLeads.data.map((lead) => (
                <div key={lead.id} className="px-5 py-3 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    {lead.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold truncate">{lead.name}</p>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLOR[lead.status]}`}>
                        {STATUS_LABEL[lead.status]}
                      </span>
                    </div>
                    {lead.property && (
                      <p className="text-xs text-muted-foreground truncate">{lead.property.title}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      {lead.phone && (
                        <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-emerald-600 hover:underline">
                          <Phone className="h-3 w-3" />{lead.phone}
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground flex-shrink-0">
                    {new Date(lead.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent properties */}
        <div className="bg-white rounded-2xl border border-border/60 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm">Properti Terbaru</h2>
            </div>
            <Link href="/dashboard/properties" className="text-xs text-primary hover:underline flex items-center gap-1">
              Lihat semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentProperties.data.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Building2 className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Belum ada properti</p>
              <Button asChild size="sm" className="mt-3 rounded-xl">
                <Link href="/dashboard/properties/new">Tambah Sekarang</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {recentProperties.data.map((property) => {
                const img = property.images?.find((i) => i.isPrimary) ?? property.images?.[0];
                return (
                  <Link key={property.id} href={propertyDetailUrl(property)}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className="relative h-12 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image src={img?.url || '/placeholder-property.jpg'} alt={property.title} fill className="object-cover" sizes="64px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold line-clamp-1">{property.title}</p>
                      <p className="text-xs font-bold text-primary">{formatPrice(property.price)}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="h-3 w-3" />{property.city}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />{property.viewsCount}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />{property.leadsCount}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
