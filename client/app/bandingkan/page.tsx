import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { propertiesApi } from '@/lib/api/properties';
import { formatPrice } from '@/lib/utils';
import { propertyDetailUrl } from '@/lib/url';
import { BadgeCheck } from 'lucide-react';

export const metadata: Metadata = { title: 'Bandingkan Properti', robots: { index: false } };

interface Props { searchParams: Promise<{ ids?: string }> }

const ROWS: { label: string; key: string; format?: (v: any) => string }[] = [
  { label: 'Harga', key: 'price', format: v => formatPrice(String(v)) },
  { label: 'Tipe', key: 'propertyType' },
  { label: 'Status', key: 'listingType', format: v => v === 'SALE' ? 'Dijual' : 'Disewa' },
  { label: 'Kota', key: 'city' },
  { label: 'Kecamatan', key: 'district' },
  { label: 'Luas Tanah', key: 'landArea', format: v => v ? `${v} m²` : '—' },
  { label: 'Luas Bangunan', key: 'buildingArea', format: v => v ? `${v} m²` : '—' },
  { label: 'Kamar Tidur', key: 'bedrooms', format: v => v ?? '—' },
  { label: 'Kamar Mandi', key: 'bathrooms', format: v => v ?? '—' },
  { label: 'Lantai', key: 'floors', format: v => v ?? '—' },
  { label: 'Garasi', key: 'garage', format: v => v ?? '—' },
  { label: 'Sertifikat', key: 'certificateType', format: v => v ?? '—' },
  { label: 'Tahun Dibangun', key: 'yearBuilt', format: v => v ?? '—' },
  { label: 'Furnitur', key: 'furnishing', format: v => v ?? '—' },
  { label: 'Agen', key: 'user', format: v => v?.name ?? '—' },
];

export default async function BandingkanPage({ searchParams }: Props) {
  const { ids } = await searchParams;
  if (!ids) notFound();

  const idList = ids.split(',').slice(0, 3).filter(Boolean);
  if (idList.length < 2) notFound();

  const properties = await Promise.all(
    idList.map(slug => propertiesApi.getBySlug(slug).catch(() => null))
  ).then(r => r.filter(Boolean));

  if (properties.length < 2) notFound();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Perbandingan Properti</h1>
          <p className="text-sm text-muted-foreground mt-1">Membandingkan {properties.length} properti</p>
        </div>

        <div className="bg-white rounded-2xl border border-border/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Header — foto & judul */}
              <thead>
                <tr className="border-b border-border/40">
                  <th className="px-4 py-4 text-left text-sm font-semibold text-muted-foreground w-32">Spesifikasi</th>
                  {properties.map((p: any) => {
                    const img = p.images?.find((i: any) => i.isPrimary) ?? p.images?.[0];
                    return (
                      <th key={p.id} className="px-4 py-4 text-left min-w-[220px]">
                        <Link href={propertyDetailUrl(p)} className="block hover:opacity-80 transition-opacity">
                          {img && (
                            <div className="relative aspect-video rounded-xl overflow-hidden mb-2">
                              <Image src={img.url} alt={p.title} fill className="object-cover" sizes="220px" />
                            </div>
                          )}
                          <p className="font-semibold text-sm line-clamp-2">{p.title}</p>
                          <p className="text-primary font-bold mt-1">{formatPrice(p.price)}</p>
                          {p.user?.verified && (
                            <span className="flex items-center gap-1 text-xs text-primary mt-1">
                              <BadgeCheck className="h-3.5 w-3.5" />Agen Terverifikasi
                            </span>
                          )}
                        </Link>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Rows */}
              <tbody>
                {ROWS.map(({ label, key, format }, i) => (
                  <tr key={key} className={i % 2 === 0 ? 'bg-slate-50/50' : ''}>
                    <td className="px-4 py-3 text-xs font-medium text-muted-foreground">{label}</td>
                    {properties.map((p: any) => {
                      const val = p[key];
                      const display = format ? format(val) : (val ?? '—');
                      return (
                        <td key={p.id} className="px-4 py-3 text-sm">{String(display)}</td>
                      );
                    })}
                  </tr>
                ))}

                {/* Fitur */}
                <tr>
                  <td className="px-4 py-3 text-xs font-medium text-muted-foreground">Fasilitas</td>
                  {properties.map((p: any) => (
                    <td key={p.id} className="px-4 py-3">
                      {p.features?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {p.features.map((f: any) => (
                            <Badge key={f.feature} variant="secondary" className="text-xs">{f.feature}</Badge>
                          ))}
                        </div>
                      ) : <span className="text-sm text-muted-foreground">—</span>}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
