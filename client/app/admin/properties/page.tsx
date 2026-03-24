import Image from 'next/image';
import Link from 'next/link';
import { serverApi } from '@/lib/server/api';
import { formatPrice } from '@/lib/utils';
import { AdminPropertyActions } from '@/components/client/admin-property-actions';
import { AdminPropertiesFilter } from '@/components/client/admin-properties-filter';
import { Building2, Eye, MessageSquare } from 'lucide-react';

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  DRAFT: 'bg-slate-100 text-slate-600',
  INACTIVE: 'bg-red-100 text-red-600',
  SOLD: 'bg-blue-100 text-blue-700',
  RENTED: 'bg-purple-100 text-purple-700',
};
const TYPE_LABEL: Record<string, string> = {
  HOUSE: 'Rumah', APARTMENT: 'Apartemen', LAND: 'Tanah',
  COMMERCIAL: 'Ruko', VILLA: 'Villa', WAREHOUSE: 'Gudang',
};

interface Props {
  searchParams: Promise<{ status?: string; type?: string; search?: string; page?: string }>;
}

export default async function AdminPropertiesPage({ searchParams }: Props) {
  const { status, type, search, page = '1' } = await searchParams;
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (search) params.set('search', search);
  if (page) params.set('page', page);
  params.set('limit', '15');

  const { data: properties, meta } = await serverApi.getAdminProperties(params.toString());

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Properti</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{meta.total.toLocaleString()} total properti</p>
        </div>
      </div>

      {/* Filter */}
      <AdminPropertiesFilter />

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-slate-50/60">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Properti</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Pemilik</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Harga</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipe</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statistik</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tanggal</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {properties.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">Tidak ada properti</td></tr>
              )}
              {properties.map((p) => {
                const img = p.images?.find((i) => i.isPrimary) ?? p.images?.[0];
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-9 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                          {img
                            ? <Image src={img.url} alt="" fill className="object-cover" />
                            : <Building2 className="h-4 w-4 text-slate-300 m-auto absolute inset-0" />
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[200px]">{p.title}</p>
                          <p className="text-xs text-muted-foreground">{p.district}, {p.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{p.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{p.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{TYPE_LABEL[p.propertyType] ?? p.propertyType}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLE[p.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{p.viewsCount ?? 0}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{p.leadsCount ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <AdminPropertyActions property={p} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
            <p className="text-xs text-muted-foreground">
              Halaman {meta.page} dari {meta.totalPages} ({meta.total} total)
            </p>
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
