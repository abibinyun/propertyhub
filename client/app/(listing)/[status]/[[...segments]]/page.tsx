import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { propertiesApi } from '@/lib/api/properties';
import { PropertyCard } from '@/components/property/property-card';
import { PaginationControls } from '@/components/client/pagination-controls';
import { PropertyFilters } from '@/components/client/property-filters';
import { Property } from '@/types/property';

interface Props {
  params: Promise<{ status: string; segments?: string[] }>;
  searchParams: Promise<{ page?: string; minPrice?: string; maxPrice?: string }>;
}

const LISTING_TYPES = ['jual', 'sewa'];
const PROPERTY_TYPES = ['rumah', 'apartemen', 'tanah', 'komersial', 'villa', 'gudang'];

const TYPE_LABELS: Record<string, string> = {
  rumah: 'Rumah', apartemen: 'Apartemen', tanah: 'Tanah',
  komersial: 'Komersial', villa: 'Villa', gudang: 'Gudang',
};

/**
 * Segments bisa:
 * [] → hanya status (/jual)
 * [city] → /jual/jakarta-selatan
 * [city, type] → /jual/jakarta-selatan/rumah
 * [city, district, type] → /jual/jakarta-selatan/kebayoran-baru/rumah
 */
function parseSegments(status: string, segments: string[] = []) {
  const [seg0, seg1, seg2] = segments;

  // /jual/jakarta-selatan/kebayoran-baru/rumah
  if (seg2 && PROPERTY_TYPES.includes(seg2)) {
    return { status, city: seg0, district: seg1, type: seg2 };
  }
  // /jual/jakarta-selatan/rumah
  if (seg1 && PROPERTY_TYPES.includes(seg1)) {
    return { status, city: seg0, type: seg1 };
  }
  // /jual/jakarta-selatan
  if (seg0 && !PROPERTY_TYPES.includes(seg0)) {
    return { status, city: seg0 };
  }
  // /jual
  return { status };
}

function buildBreadcrumbs(parsed: ReturnType<typeof parseSegments>) {
  const crumbs: { label: string; href?: string }[] = [
    { label: 'Beranda', href: '/' },
    { label: parsed.status === 'jual' ? 'Jual' : 'Sewa', href: `/${parsed.status}` },
  ];
  if (parsed.city) {
    const cityLabel = parsed.city.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const href = `/${parsed.status}/${parsed.city}`;
    crumbs.push({ label: cityLabel, href });
  }
  if ('district' in parsed && parsed.district) {
    const distLabel = parsed.district.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    crumbs.push({ label: distLabel });
  }
  if (parsed.type) {
    crumbs.push({ label: TYPE_LABELS[parsed.type] ?? parsed.type });
  }
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
    title,
    description,
    keywords: [typeLabel, statusLabel, locationLabel, 'properti', 'PropertyHub'],
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function ListingPage({ params, searchParams }: Props) {
  const { status, segments } = await params;
  const { page: pageParam, minPrice, maxPrice } = await searchParams;

  if (!LISTING_TYPES.includes(status)) notFound();

  const parsed = parseSegments(status, segments);
  const page = parseInt(pageParam || '1');

  let properties: Property[] = [];
  let meta = { total: 0, page, limit: 12, totalPages: 0 };

  try {
    const result = await propertiesApi.getByCategory(
      [status, ...(segments ?? [])].join('/'),
      {
        page,
        limit: 12,
        ...(minPrice && { minPrice: Number(minPrice) }),
        ...(maxPrice && { maxPrice: Number(maxPrice) }),
      },
    );
    properties = result.data;
    meta = result.meta;
  } catch {
    // tetap render halaman kosong, bukan crash
  }

  const breadcrumbs = buildBreadcrumbs(parsed);
  const title = breadcrumbs[breadcrumbs.length - 1].label;
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.label,
      ...(crumb.href && { item: `${BASE_URL}${crumb.href}` }),
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            {breadcrumbs.map((crumb, i) => (
              <li key={i} className="flex items-center gap-2">
                {i > 0 && <span>/</span>}
                {crumb.href && i < breadcrumbs.length - 1 ? (
                  <Link href={crumb.href} className="hover:text-foreground transition-colors">{crumb.label}</Link>
                ) : (
                  <span className={i === breadcrumbs.length - 1 ? 'text-foreground font-medium' : ''}>{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex items-start gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <PropertyFilters initialMinPrice={minPrice} initialMaxPrice={maxPrice} />
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-1">{title}</h1>
                <p className="text-muted-foreground">{meta.total} properti ditemukan</p>
              </div>
              <div className="lg:hidden">
                <PropertyFilters initialMinPrice={minPrice} initialMaxPrice={maxPrice} mobile />
              </div>
            </div>

            {properties.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                  {properties.map((property: Property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
                {meta.totalPages > 1 && (
                  <PaginationControls currentPage={page} totalPages={meta.totalPages} />
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <h3 className="text-2xl font-bold mb-2">Tidak ada properti ditemukan</h3>
                <p className="text-muted-foreground">Coba ubah filter pencarian</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
