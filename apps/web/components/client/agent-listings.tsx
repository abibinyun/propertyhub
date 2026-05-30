'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PropertyCard } from '@/components/property/property-card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PROPERTY_TYPES = [
  { value: '', label: 'Semua Tipe' },
  { value: 'HOUSE', label: 'Rumah' },
  { value: 'APARTMENT', label: 'Apartemen' },
  { value: 'LAND', label: 'Tanah' },
  { value: 'COMMERCIAL', label: 'Komersial' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'WAREHOUSE', label: 'Gudang' },
];

const LISTING_TYPES = [
  { value: '', label: 'Jual & Sewa' },
  { value: 'SALE', label: 'Dijual' },
  { value: 'RENT', label: 'Disewa' },
];

const SORTS = [
  { value: 'rank', label: 'Terbaik' },
  { value: 'newest', label: 'Terbaru' },
  { value: 'price_asc', label: 'Harga Terendah' },
  { value: 'price_desc', label: 'Harga Tertinggi' },
];

interface Meta { total: number; page: number; limit: number; totalPages: number }

interface Props {
  properties: any[];
  meta: Meta;
  initialPropertyType: string;
  initialListingType: string;
  initialSort: string;
  initialPage: number;
}

export function AgentListings({ properties, meta, initialPropertyType, initialListingType, initialSort, initialPage }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    if (key !== 'page') params.delete('page');
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const selectClass = "text-sm border border-input rounded-lg px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <select value={initialPropertyType} onChange={(e) => update('propertyType', e.target.value)} className={selectClass}>
          {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={initialListingType} onChange={(e) => update('listingType', e.target.value)} className={selectClass}>
          {LISTING_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={initialSort} onChange={(e) => update('sort', e.target.value)} className={selectClass}>
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <span className="text-xs text-muted-foreground ml-auto">{meta.total} listing</span>
      </div>

      {/* Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
        {properties.length === 0 ? (
          <div className="col-span-2 bg-white rounded-2xl border border-border/60 py-12 text-center text-muted-foreground text-sm">
            Tidak ada listing yang sesuai filter
          </div>
        ) : (
          properties.map((p: any) => <PropertyCard key={p.id} property={p} />)
        )}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={meta.page <= 1 || isPending}
            onClick={() => update('page', String(meta.page - 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {meta.page} / {meta.totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={meta.page >= meta.totalPages || isPending}
            onClick={() => update('page', String(meta.page + 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
