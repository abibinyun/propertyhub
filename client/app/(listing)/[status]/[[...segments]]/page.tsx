import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home, SlidersHorizontal, MapPin } from 'lucide-react';
import { propertiesApi } from '@/lib/api/properties';
import { serverApi } from '@/lib/server/api';
import { getToken } from '@/lib/server/auth';
import { PropertyCard } from '@/components/property/property-card';
import { PaginationControls } from '@/components/client/pagination-controls';
import { PropertyFilters } from '@/components/client/property-filters';
import { SortControls } from '@/components/client/sort-controls';
import { Property } from '@/types/property';

interface Props {
  params: Promise<{ status: string; segments?: string[] }>;
  searchParams: Promise<{ page?: string; minPrice?: string; maxPrice?: string; sort?: string; bedrooms?: string; minArea?: string; certificate?: string; furnishing?: string }>;
}

const LISTING_TYPES = ['jual', 'sewa'];
const PROPERTY_TYPES = ['rumah', 'apartemen', 'tanah', 'komersial', 'villa', 'gudang'];
const TYPE_LABELS: Record<string, string> = {
  rumah: 'Rumah', apartemen: 'Apartemen', tanah: 'Tanah',
  komersial: 'Komersial', villa: 'Villa', gudang: 'Gudang',
};

function parseSegments(status: string, segments: string[] = []) {
  const [seg0, seg1, seg2] = segments;
  // /jual/jakarta/kebayoran/rumah
  if (seg2 && PROPERTY_TYPES.includes(seg2)) return { status, city: seg0, district: seg1, type: seg2 };
  // /jual/jakarta/rumah
  if (seg1 && PROPERTY_TYPES.includes(seg1)) return { status, city: seg0, type: seg1 };
  // /jual/rumah
  if (seg0 && PROPERTY_TYPES.includes(seg0)) return { status, type: seg0 };
  // /jual/jakarta
  if (seg0) return { status, city: seg0 };
  // /jual
  return { status };
}

function buildBreadcrumbs(parsed: ReturnType<typeof parseSegments>) {
  const crumbs: { label: string; href?: string }[] = [
    { label: 'Beranda', href: '/' },
    { label: parsed.status === 'jual' ? 'Jual' : 'Sewa', href: `/${parsed.status}` },
  ];
  // /jual/rumah — type tanpa city
  if (!parsed.city && parsed.type) {
    crumbs.push({ label: TYPE_LABELS[parsed.type] ?? parsed.type });
    return crumbs;
  }
  if (parsed.city) {
    const label = parsed.city.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    crumbs.push({ label, href: `/${parsed.status}/${parsed.city}` });
  }
  if ('district' in parsed && parsed.district) {
    crumbs.push({ label: parsed.district.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) });
  }
  if (parsed.type) crumbs.push({ label: TYPE_LABELS[parsed.type] ?? parsed.type });
  return crumbs;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { status, segments } = await params;
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const parsed = parseSegments(status, segments ?? []);
  const statusLabel = status === 'jual' ? 'Dijual' : 'Disewa';
  const typeLabel = parsed.type ? (TYPE_LABELS[parsed.type] ?? parsed.type) : 'Properti';
  const locationParts: string[] = [];
  if ('district' in parsed && parsed.district) locationParts.push(parsed.district.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
  if (parsed.city) locationParts.push(parsed.city.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
  const locationLabel = locationParts.length ? locationParts.join(', ') : 'Indonesia';
  const title = `${typeLabel} ${statusLabel} di ${locationLabel}`;
  const description = `Daftar ${typeLabel.toLowerCase()} ${statusLabel.toLowerCase()} di ${locationLabel}. Temukan pilihan terbaik dengan harga terjangkau di PropertyHub.`;
  const canonical = `${BASE_URL}/${[status, ...(segments ?? [])].join('/')}`;
  return {
    title, description,
    keywords: [typeLabel, statusLabel, locationLabel, 'properti', 'PropertyHub'],
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function ListingPage({ params, searchParams }: Props) {
  const { status, segments } = await params;
  const { page: pageParam, minPrice, maxPrice, sort, bedrooms, minArea, certificate, furnishing } = await searchParams;

  if (!LISTING_TYPES.includes(status)) notFound();

  const parsed = parseSegments(status, segments);
  const page = parseInt(pageParam || '1');

  let properties: Property[] = [];
  let meta = { total: 0, page, limit: 12, totalPages: 0 };
  let favoriteIdsSet = new Set<string>();

  try {
    const token = await getToken();
    const [result, favoriteIds] = await Promise.all([
      propertiesApi.getByCategory(
        [status, ...(segments ?? [])].join('/'),
        { page, limit: 12, ...(minPrice && { minPrice: Number(minPrice) }), ...(maxPrice && { maxPrice: Number(maxPrice) }), ...(sort && { sort }), ...(bedrooms && { bedrooms: Number(bedrooms) }), ...(minArea && { minArea: Number(minArea) }), ...(certificate && { certificate }), ...(furnishing && { furnishing }) },
      ),
      token ? serverApi.getFavoriteIds().catch(() => [] as string[]) : Promise.resolve([] as string[]),
    ]);
    properties = result.data;
    meta = result.meta;
    favoriteIdsSet = new Set(favoriteIds);
  } catch { /* render empty */ }

  const breadcrumbs = buildBreadcrumbs(parsed);
  const pageTitle = breadcrumbs[breadcrumbs.length - 1].label;
  const statusLabel = status === 'jual' ? 'Dijual' : 'Disewa';

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, i) => ({
      '@type': 'ListItem', position: i + 1, name: crumb.label,
      ...(crumb.href && { item: `${BASE_URL}${crumb.href}` }),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* ─── Page Header ─────────────────────────────────────────────── */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-5">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4 flex-wrap">
            <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="h-3 w-3" />Beranda
            </Link>
            {breadcrumbs.slice(1).map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3" />
                {crumb.href && i < breadcrumbs.length - 2 ? (
                  <Link href={crumb.href} className="hover:text-foreground transition-colors">{crumb.label}</Link>
                ) : (
                  <span className={i === breadcrumbs.length - 2 ? 'text-foreground font-medium' : ''}>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>

          {/* Title row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {pageTitle}
                <span className="ml-2 text-lg font-normal text-muted-foreground">{statusLabel}</span>
              </h1>
              <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                {parsed.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {parsed.city.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                )}
                <span className="font-semibold text-foreground">{meta.total.toLocaleString('id-ID')}</span>
                <span>properti ditemukan</span>
              </div>
            </div>

            {/* Mobile filter */}
            <div className="lg:hidden flex-shrink-0">
              <PropertyFilters initialMinPrice={minPrice} initialMaxPrice={maxPrice} initialBedrooms={bedrooms} initialMinArea={minArea} initialCertificate={certificate} initialFurnishing={furnishing} mobile />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─────────────────────────────────────────────── */}
      <div className="bg-slate-50 min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-6 items-start">

            {/* Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-20">
              <PropertyFilters initialMinPrice={minPrice} initialMaxPrice={maxPrice} initialBedrooms={bedrooms} initialMinArea={minArea} initialCertificate={certificate} initialFurnishing={furnishing} />
            </aside>

            {/* Results */}
            <div className="flex-1 min-w-0">
              {/* Sort bar */}
              <div className="flex items-center justify-between mb-5 bg-white rounded-xl border border-border/60 px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Menampilkan <span className="font-semibold text-foreground">{properties.length}</span> dari <span className="font-semibold text-foreground">{meta.total.toLocaleString('id-ID')}</span> properti
                </p>
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                  <SortControls />
                </div>
              </div>

              {properties.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                    {properties.map((property: Property) => (
                      <PropertyCard key={property.id} property={property} favoriteIds={[...favoriteIdsSet]} />
                    ))}
                  </div>

                  {meta.totalPages > 1 && (
                    <div className="mt-10">
                      <PaginationControls currentPage={page} totalPages={meta.totalPages} />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-border/60">
                  <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                    <MapPin className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Tidak ada properti ditemukan</h3>
                  <p className="text-muted-foreground text-sm mb-6 text-center max-w-xs">
                    Coba ubah filter atau cari di lokasi lain
                  </p>
                  <Link href={`/${status}`} className="text-sm font-medium text-primary hover:underline">
                    Lihat semua properti {statusLabel.toLowerCase()} →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
