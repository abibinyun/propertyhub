'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { propertiesApi } from '@/lib/api/properties';
import { Property, PropertyStatus } from '@/types/property';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Eye, Edit, Trash2, MapPin, TrendingUp, MessageSquare, Plus, ChevronLeft, ChevronRight, Heart, Zap } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { propertyDetailUrl } from '@/lib/url';
import { FeaturedModal } from './featured-modal';

const STATUS_CONFIG: Record<PropertyStatus, { label: string; className: string }> = {
  ACTIVE:   { label: 'Aktif',    className: 'bg-emerald-100 text-emerald-700' },
  DRAFT:    { label: 'Draft',    className: 'bg-slate-100 text-slate-600' },
  SOLD:     { label: 'Terjual', className: 'bg-blue-100 text-blue-700' },
  RENTED:   { label: 'Tersewa', className: 'bg-purple-100 text-purple-700' },
  INACTIVE: { label: 'Nonaktif', className: 'bg-red-100 text-red-600' },
};

const TYPE_LABEL: Record<string, string> = {
  HOUSE: 'Rumah', APARTMENT: 'Apartemen', LAND: 'Tanah',
  COMMERCIAL: 'Komersial', VILLA: 'Villa', WAREHOUSE: 'Gudang',
};

interface Meta { total: number; page: number; limit: number; totalPages: number }

interface Props {
  initialProperties: Property[];
  meta: Meta;
  initialSearch?: string;
  initialStatus?: string;
  initialSort?: string;
  favoriteCounts?: Record<string, number>;
  prices?: { priceBasic: number; pricePremium: number; priceUltimate: number };
}

export function PropertyList({ initialProperties, meta, initialSearch = '', initialStatus = '', initialSort = '', favoriteCounts = {}, prices }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [properties, setProperties] = useState(initialProperties);
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [featuredTarget, setFeaturedTarget] = useState<Property | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [filterStatus, setFilterStatus] = useState(initialStatus);
  const [sort, setSort] = useState(initialSort);

  useEffect(() => {
    setProperties(initialProperties);
    setSearch(initialSearch);
    setFilterStatus(initialStatus);
    setSort(initialSort);
  }, [initialProperties, initialSearch, initialStatus, initialSort]);

  const pushUrl = (overrides: Record<string, string>) => {
    const u = new URLSearchParams();
    const merged = { page: '1', search, status: filterStatus, sort, ...overrides };
    if (merged.page && merged.page !== '1') u.set('page', merged.page);
    if (merged.search) u.set('search', merged.search);
    if (merged.status) u.set('status', merged.status);
    if (merged.sort) u.set('sort', merged.sort);
    startTransition(() => router.push(`${pathname}?${u.toString()}`));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await propertiesApi.delete(deleteTarget.slug);
      setProperties((p) => p.filter((x) => x.id !== deleteTarget.id));
    } catch { /* silent */ }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  if (meta.total === 0 && !initialSearch && !initialStatus) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-border/60">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Plus className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-bold mb-2">Belum ada properti</h3>
        <p className="text-sm text-muted-foreground mb-6">Mulai pasang iklan properti pertama Anda</p>
        <Button asChild className="rounded-xl gap-2">
          <Link href="/dashboard/properties/new">Tambah Properti</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Cari judul, kota, kecamatan..."
          defaultValue={search}
          onChange={(e) => {
            const val = e.target.value;
            setSearch(val);
            const t = setTimeout(() => pushUrl({ search: val, page: '1' }), 400);
            return () => clearTimeout(t);
          }}
          className="flex-1 rounded-xl border border-input bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); pushUrl({ status: e.target.value, page: '1' }); }}
          className="rounded-xl border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:w-36"
        >
          <option value="">Semua Status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); pushUrl({ sort: e.target.value, page: '1' }); }}
          className="rounded-xl border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:w-44"
        >
          <option value="">Terbaru</option>
          <option value="views">Paling Banyak Dilihat</option>
          <option value="leads">Paling Banyak Leads</option>
          <option value="favorites">Paling Banyak Favorit</option>
          <option value="rank">Skor Tertinggi</option>
        </select>
      </div>

      {/* Results info */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">
          {meta.total} properti
          {(search || filterStatus) && (
            <> · <button onClick={() => { setSearch(''); setFilterStatus(''); setSort(''); pushUrl({ search: '', status: '', sort: '', page: '1' }); }} className="text-primary hover:underline">Reset</button></>
          )}
        </p>
        <p className="text-xs text-muted-foreground">Halaman {meta.page} dari {meta.totalPages}</p>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-border/60">
          <p className="text-sm text-muted-foreground">Tidak ada properti yang cocok</p>
        </div>
      ) : (
        <div className={cn('space-y-3', isPending && 'opacity-60 pointer-events-none')}>
          {properties.map((property) => {
            const img = property.images?.find((i) => i.isPrimary) ?? property.images?.[0];
            const status = STATUS_CONFIG[property.status];
            return (
              <div key={property.id} className="bg-white rounded-2xl border border-border/60 p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <Link href={propertyDetailUrl(property)} className="flex-shrink-0">
                    <div className="relative h-20 w-28 sm:h-24 sm:w-36 rounded-xl overflow-hidden bg-muted">
                      <Image src={img?.url || '/placeholder-property.jpg'} alt={property.title} fill className="object-cover hover:scale-105 transition-transform duration-300" sizes="144px" />
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', status.className)}>{status.label}</span>
                          <span className="text-xs text-muted-foreground">{TYPE_LABEL[property.propertyType] ?? property.propertyType}</span>
                          {property.featured && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Unggulan</span>}
                        </div>
                        <Link href={propertyDetailUrl(property)}>
                          <h3 className="font-semibold text-sm line-clamp-1 hover:text-primary transition-colors">{property.title}</h3>
                        </Link>
                        <p className="text-base font-bold text-primary mt-0.5">{formatPrice(property.price)}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />{property.district}, {property.city}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(property.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={propertyDetailUrl(property)}><Eye className="mr-2 h-4 w-4" />Lihat</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/properties/${property.id}/analytics`}><TrendingUp className="mr-2 h-4 w-4" />Analitik</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/properties/${property.slug}/edit`}><Edit className="mr-2 h-4 w-4" />Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setFeaturedTarget(property)}>
                            <Zap className="mr-2 h-4 w-4 text-amber-500" />Promosikan
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteTarget(property)} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/40">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />{property.viewsCount} dilihat
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />{property.leadsCount} leads
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Heart className="h-3 w-3" />{favoriteCounts[property.id] ?? 0} favorit
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />Skor {Math.round(Number(property.rankScore))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => pushUrl({ page: String(meta.page - 1) })}
            disabled={meta.page <= 1 || isPending}
            className="h-9 w-9 rounded-xl border bg-white flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => pushUrl({ page: String(p) })} disabled={isPending}
              className={cn('h-9 w-9 rounded-xl border text-sm font-medium transition-colors',
                p === meta.page ? 'bg-primary text-primary-foreground border-primary' : 'bg-white hover:bg-slate-50')}>
              {p}
            </button>
          ))}
          <button
            onClick={() => pushUrl({ page: String(meta.page + 1) })}
            disabled={meta.page >= meta.totalPages || isPending}
            className="h-9 w-9 rounded-xl border bg-white flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Properti?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.title}</strong> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive hover:bg-destructive/90">
              {deleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {featuredTarget && (
        <FeaturedModal
          propertyId={featuredTarget.id}
          propertyTitle={featuredTarget.title}
          open={!!featuredTarget}
          onClose={() => setFeaturedTarget(null)}
          onSuccess={() => { setFeaturedTarget(null); router.refresh(); }}
          prices={prices}
        />
      )}
    </>
  );
}
