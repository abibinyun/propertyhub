import { redirect } from 'next/navigation';
import Link from 'next/link';
import { serverApi } from '@/lib/server/api';
import { getToken } from '@/lib/server/auth';
import { Badge } from '@/components/ui/badge';
import { LeadStatusActions } from '@/components/client/lead-status-actions';
import { LeadsSearchBar } from '@/components/client/leads-search-bar';
import { MessageSquare, Send, Inbox, MapPin, Phone, Mail, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Lead, LeadStatus } from '@/types/lead';
import { propertyDetailUrl } from '@/lib/url';
import { cn } from '@/lib/utils';

interface Props {
  searchParams: Promise<{ tab?: string; page?: string; search?: string; status?: string }>;
}

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
const ALL_STATUSES = Object.keys(STATUS_LABEL) as LeadStatus[];

function LeadCard({ lead, isReceived }: { lead: Lead; isReceived?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-border/60 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', STATUS_COLOR[lead.status])}>
              {STATUS_LABEL[lead.status]}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(lead.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* Property */}
          {lead.property && (
            <Link
              href={propertyDetailUrl(lead.property)}
              className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mb-1 w-fit"
            >
              <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="line-clamp-1">{lead.property.title}</span>
            </Link>
          )}
          {lead.property?.city && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
              <MapPin className="h-3 w-3" />{lead.property.district}, {lead.property.city}
            </div>
          )}

          {/* Sender info — only for received */}
          {isReceived && (
            <div className="flex flex-wrap items-center gap-3 mb-3 p-3 rounded-xl bg-slate-50">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                {lead.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{lead.name}</p>
                <div className="flex flex-wrap gap-3 mt-0.5">
                  {lead.phone && (
                    <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-emerald-600 hover:underline font-medium">
                      <Phone className="h-3 w-3" />{lead.phone}
                    </a>
                  )}
                  {lead.email && (
                    <a href={`mailto:${lead.email}`}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                      <Mail className="h-3 w-3" />{lead.email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Message */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{lead.message}</p>
        </div>

        {/* Status dropdown — only for received */}
        {isReceived && (
          <div className="flex-shrink-0">
            <LeadStatusActions leadId={lead.id} currentStatus={lead.status} />
          </div>
        )}
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, buildUrl }: { page: number; totalPages: number; buildUrl: (p: number) => string }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Link href={buildUrl(page - 1)}
        className={cn('h-9 w-9 rounded-xl border flex items-center justify-center text-sm transition-colors',
          page <= 1 ? 'pointer-events-none opacity-40 bg-white' : 'bg-white hover:bg-slate-50')}>
        <ChevronLeft className="h-4 w-4" />
      </Link>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link key={p} href={buildUrl(p)}
          className={cn('h-9 w-9 rounded-xl border flex items-center justify-center text-sm font-medium transition-colors',
            p === page ? 'bg-primary text-primary-foreground border-primary' : 'bg-white hover:bg-slate-50')}>
          {p}
        </Link>
      ))}
      <Link href={buildUrl(page + 1)}
        className={cn('h-9 w-9 rounded-xl border flex items-center justify-center text-sm transition-colors',
          page >= totalPages ? 'pointer-events-none opacity-40 bg-white' : 'bg-white hover:bg-slate-50')}>
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default async function LeadsPage({ searchParams }: Props) {
  const token = await getToken();
  if (!token) redirect('/login');

  const sp = await searchParams;
  const tab = sp.tab === 'sent' ? 'sent' : 'received';
  const page = Math.max(1, Number(sp.page) || 1);
  const search = sp.search || '';
  const status = sp.status || '';

  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  const qs = params.toString();

  const [receivedRes, sentRes] = await Promise.all([
    serverApi.getReceivedLeads(tab === 'received' ? qs : 'limit=1').catch(() => ({ data: [] as Lead[], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } })),
    serverApi.getMyLeads(tab === 'sent' ? qs : 'limit=1').catch(() => ({ data: [] as Lead[], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } })),
  ]);

  // Get total counts for tab badges (unfiltered)
  const [receivedTotal, sentTotal] = await Promise.all([
    tab !== 'received' ? serverApi.getReceivedLeads('limit=1').then(r => r.meta.total).catch(() => 0) : Promise.resolve(receivedRes.meta.total),
    tab !== 'sent' ? serverApi.getMyLeads('limit=1').then(r => r.meta.total).catch(() => 0) : Promise.resolve(sentRes.meta.total),
  ]);

  const activeData = tab === 'received' ? receivedRes : sentRes;

  function buildUrl(p: number, overrides: Record<string, string> = {}) {
    const u = new URLSearchParams();
    u.set('tab', tab);
    if (p > 1) u.set('page', String(p));
    if (search) u.set('search', search);
    if (status) u.set('status', status);
    Object.entries(overrides).forEach(([k, v]) => v ? u.set(k, v) : u.delete(k));
    return `/dashboard/leads?${u.toString()}`;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold">Pesan & Leads</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-6 w-full sm:w-fit">
        {[
          { key: 'received', label: 'Leads Masuk', icon: Inbox, count: receivedTotal },
          { key: 'sent', label: 'Pesan Terkirim', icon: Send, count: sentTotal },
        ].map(({ key, label, icon: Icon, count }) => (
          <Link key={key} href={`/dashboard/leads?tab=${key}`}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 sm:flex-none justify-center',
              tab === key ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
            <Icon className="h-4 w-4" />
            {label}
            {count > 0 && (
              <span className={cn('h-5 min-w-5 rounded-full text-xs flex items-center justify-center px-1',
                tab === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                {count}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Search + Filter */}
      <LeadsSearchBar
        defaultSearch={search}
        defaultStatus={status}
        tab={tab}
        statuses={ALL_STATUSES.map(s => ({ value: s, label: STATUS_LABEL[s] }))}
      />

      {/* Results info */}
      {(search || status) && (
        <p className="text-sm text-muted-foreground mb-4">
          {activeData.meta.total} hasil
          {search && <> untuk &quot;<strong>{search}</strong>&quot;</>}
          {status && <> · status: <strong>{STATUS_LABEL[status as LeadStatus]}</strong></>}
          {' · '}<Link href={`/dashboard/leads?tab=${tab}`} className="text-primary hover:underline">Reset</Link>
        </p>
      )}

      {/* List */}
      {activeData.data.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-border/60">
          <MessageSquare className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {search || status ? 'Tidak ada hasil yang cocok' : tab === 'received' ? 'Belum ada leads masuk' : 'Belum ada pesan terkirim'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeData.data.map((lead) => (
            <LeadCard key={lead.id} lead={lead} isReceived={tab === 'received'} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={activeData.meta.page}
        totalPages={activeData.meta.totalPages}
        buildUrl={(p) => buildUrl(p)}
      />
    </div>
  );
}
