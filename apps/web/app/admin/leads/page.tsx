import Link from 'next/link';
import { serverApi } from '@/lib/server/api';
import { AdminLead } from '@/lib/api/admin';
import { MessageSquare, ExternalLink } from 'lucide-react';

const STATUS_STYLE: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-amber-100 text-amber-700',
  QUALIFIED: 'bg-purple-100 text-purple-700',
  CLOSED: 'bg-emerald-100 text-emerald-700',
  LOST: 'bg-red-100 text-red-600',
};

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminLeadsPage({ searchParams }: Props) {
  const { status, page = '1' } = await searchParams;
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  params.set('page', page);
  params.set('limit', '20');

  const { data: leads, meta } = await serverApi.getAdminLeads(params.toString());

  const STATUSES = ['', 'NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED', 'LOST'];
  const STATUS_LABEL: Record<string, string> = {
    '': 'Semua', NEW: 'Baru', CONTACTED: 'Dihubungi', QUALIFIED: 'Qualified', CLOSED: 'Selesai', LOST: 'Gagal',
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Leads</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{meta.total.toLocaleString()} total leads</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {STATUSES.map((s) => (
          <Link key={s} href={`?${s ? `status=${s}` : ''}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              (status ?? '') === s ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border/60 overflow-hidden">
        {leads.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Tidak ada leads</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-slate-50/60">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Pengirim</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Properti</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Pesan</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {leads.map((lead: AdminLead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.phone}</p>
                      <p className="text-xs text-muted-foreground">{lead.user?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/properti/${lead.property?.city?.toLowerCase().replace(/\s+/g, '-')}/${lead.property?.slug}`}
                        target="_blank"
                        className="font-medium hover:text-blue-600 flex items-center gap-1 group">
                        <span className="line-clamp-1 max-w-[180px]">{lead.property?.title}</span>
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 flex-shrink-0" />
                      </Link>
                      <p className="text-xs text-muted-foreground">{lead.property?.city}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-muted-foreground line-clamp-2 max-w-[200px]">
                        {lead.message || <span className="italic">Tidak ada pesan</span>}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLE[lead.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
            <p className="text-xs text-muted-foreground">Halaman {meta.page} dari {meta.totalPages}</p>
            <div className="flex gap-2">
              {meta.page > 1 && (
                <Link href={`?page=${meta.page - 1}${status ? `&status=${status}` : ''}`}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 transition-colors">
                  Sebelumnya
                </Link>
              )}
              {meta.page < meta.totalPages && (
                <Link href={`?page=${meta.page + 1}${status ? `&status=${status}` : ''}`}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 transition-colors">
                  Berikutnya
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
