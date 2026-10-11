import Link from 'next/link';
import { serverApi, AdminVerificationItem } from '@/lib/server/api';
import { UserCheck, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AdminVerificationActions } from '@/components/client/admin-verification-actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Verifikasi Agen — Admin' };

export default async function AdminVerificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = 'PENDING' } = await searchParams;
  const verifications = await serverApi.getAdminVerifications(status).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Verifikasi Agen & Lisensi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tinjau pengajuan identitas KTP dan lisensi AREBI agen properti
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link
            href="?status=PENDING"
            className={`px-3 py-1.5 rounded-lg border transition-colors ${
              status === 'PENDING'
                ? 'bg-primary text-primary-foreground border-primary font-medium'
                : 'border-border hover:bg-slate-50'
            }`}
          >
            Menunggu Review
          </Link>
          <Link
            href="?status=APPROVED"
            className={`px-3 py-1.5 rounded-lg border transition-colors ${
              status === 'APPROVED'
                ? 'bg-primary text-primary-foreground border-primary font-medium'
                : 'border-border hover:bg-slate-50'
            }`}
          >
            Disetujui
          </Link>
          <Link
            href="?status=REJECTED"
            className={`px-3 py-1.5 rounded-lg border transition-colors ${
              status === 'REJECTED'
                ? 'bg-primary text-primary-foreground border-primary font-medium'
                : 'border-border hover:bg-slate-50'
            }`}
          >
            Ditolak
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border/60 overflow-hidden">
        {verifications.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            Tidak ada pengajuan verifikasi dengan status {status}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-border/40">
              <tr>
                {['Agen', 'Kontak', 'NIK KTP', 'No. Lisensi (AREBI)', 'Status', 'Tanggal', 'Aksi'].map(
                  (h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {verifications.map((v: AdminVerificationItem) => (
                <tr key={v.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{v.user?.name ?? 'Agen'}</p>
                    <p className="text-xs text-muted-foreground">{v.user?.company || 'Independen'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-mono">{v.user?.phone || '—'}</p>
                    <p className="text-xs text-muted-foreground">{v.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold">
                    {v.idCardNumber || '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {v.licenseNumber || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        v.status === 'APPROVED'
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
                          : v.status === 'REJECTED'
                            ? 'text-red-700 bg-red-50 border-red-300'
                            : 'text-amber-700 bg-amber-50 border-amber-300'
                      }`}
                    >
                      {v.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {v.createdAt
                      ? new Date(v.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {v.status === 'PENDING' ? (
                      <AdminVerificationActions verificationId={v.id} />
                    ) : (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Selesai
                      </span>
                    )}
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
