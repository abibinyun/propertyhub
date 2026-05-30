import Link from 'next/link';
import { serverApi } from '@/lib/server/api';
import { Flag, CheckCircle } from 'lucide-react';

export const metadata = { title: 'Laporan Listing — Admin' };

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<{ resolved?: string }> }) {
  const { resolved } = await searchParams;
  const reports = await serverApi.getReports(resolved);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Laporan Listing</h1>
          <p className="text-sm text-muted-foreground">Laporan dari pengguna tentang listing bermasalah</p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link href="?" className={`px-3 py-1.5 rounded-lg border transition-colors ${!resolved ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-slate-50'}`}>
            Belum Ditangani
          </Link>
          <Link href="?resolved=true" className={`px-3 py-1.5 rounded-lg border transition-colors ${resolved === 'true' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-slate-50'}`}>
            Selesai
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border/60 overflow-hidden">
        {reports.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">Tidak ada laporan</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-border/40">
              <tr>
                {['Properti', 'Pelapor', 'Alasan', 'Keterangan', 'Tanggal', 'Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {reports.map((r: any) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <Link href={`/properti/${r.property.slug}`} target="_blank" className="font-medium hover:underline line-clamp-1 max-w-[180px] block">
                      {r.property.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{r.property.city}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.user.name}</p>
                    <p className="text-xs text-muted-foreground">{r.user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full">{r.reason}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px]">
                    <p className="line-clamp-2">{r.notes || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    {!r.resolved && <ResolveButton reportId={r.id} />}
                    {r.resolved && <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle className="h-3.5 w-3.5" />Selesai</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Client component inline untuk resolve action
import { ResolveReportButton } from '@/components/client/resolve-report-button';
function ResolveButton({ reportId }: { reportId: string }) {
  return <ResolveReportButton reportId={reportId} />;
}
