import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { propertiesApi } from '@/lib/api/properties';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PropertyGallery } from '@/components/client/property-gallery';
import { ContactForm } from '@/components/client/contact-form';
import { PropertyMapView } from '@/components/client/property-map-view';
import { ShareButton } from '@/components/client/share-button';
import { MobileStickyContact } from '@/components/client/mobile-sticky-contact';
import { SimilarProperties } from '@/components/property/similar-properties';
import { AuthGate } from '@/components/client/auth-gate';
import {
  MapPin, Bed, Bath, Maximize, Home, Phone, Mail, ChevronRight,
  Shield, Calendar, Layers, Car, CheckCircle2, Eye, Tag,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Props {
  params: Promise<{ location: string; slug: string }>;
}

const TYPE_LABEL: Record<string, string> = {
  HOUSE: 'Rumah', APARTMENT: 'Apartemen', LAND: 'Tanah',
  COMMERCIAL: 'Ruko/Komersial', VILLA: 'Villa', WAREHOUSE: 'Gudang',
};
const FURNISHING_LABEL: Record<string, string> = {
  UNFURNISHED: 'Tidak Furnished', SEMI_FURNISHED: 'Semi Furnished', FULLY_FURNISHED: 'Fully Furnished',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, location } = await params;
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const p = await propertiesApi.getBySlug(slug);
    const img = p.images?.[0]?.url;
    const statusLabel = p.listingType === 'SALE' ? 'Dijual' : 'Disewa';
    const title = `${p.title} - ${TYPE_LABEL[p.propertyType] ?? p.propertyType} ${statusLabel} di ${p.district}, ${p.city}`;
    const description = `${TYPE_LABEL[p.propertyType] ?? p.propertyType} ${statusLabel.toLowerCase()} di ${p.district}, ${p.city}. ${p.description?.slice(0, 120)}`;
    const canonical = `${BASE_URL}/properti/${location}/${slug}`;
    return {
      title, description,
      keywords: [p.city, p.district, TYPE_LABEL[p.propertyType], statusLabel, 'properti', 'PropertyHub'],
      alternates: { canonical },
      openGraph: { title, description, url: canonical, type: 'article', siteName: 'PropertyHub', ...(img && { images: [{ url: img, width: 1200, height: 630, alt: p.title }] }) },
      twitter: { card: 'summary_large_image', title, description, ...(img && { images: [img] }) },
    };
  } catch {
    return { title: 'Properti' };
  }
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug, location } = await params;

  let property;
  try {
    property = await propertiesApi.getBySlug(slug);
  } catch {
    notFound();
  }

  const images = property.images || [];
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const pageUrl = `${BASE_URL}/properti/${location}/${slug}`;
  const statusLabel = property.listingType === 'SALE' ? 'Dijual' : 'Disewa';
  const typeLabel = TYPE_LABEL[property.propertyType] ?? property.propertyType;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: pageUrl,
    image: images.map((i: { url: string }) => i.url),
    datePosted: property.createdAt,
    offers: { '@type': 'Offer', price: Number(property.price), priceCurrency: 'IDR', availability: 'https://schema.org/InStock' },
    address: { '@type': 'PostalAddress', streetAddress: property.address, addressLocality: property.district, addressRegion: property.city, addressCountry: 'ID' },
    ...(property.buildingArea && { floorSize: { '@type': 'QuantitativeValue', value: property.buildingArea, unitCode: 'MTK' } }),
    ...(property.bedrooms && { numberOfRooms: property.bedrooms }),
    seller: { '@type': 'Person', name: property.user?.name, telephone: property.user?.phone },
  };

  const specs = [
    property.bedrooms && { icon: Bed, label: 'Kamar Tidur', value: `${property.bedrooms} KT` },
    property.bathrooms && { icon: Bath, label: 'Kamar Mandi', value: `${property.bathrooms} KM` },
    property.landArea && { icon: Maximize, label: 'Luas Tanah', value: `${property.landArea} m²` },
    property.buildingArea && { icon: Home, label: 'Luas Bangunan', value: `${property.buildingArea} m²` },
    property.floors && { icon: Layers, label: 'Jumlah Lantai', value: `${property.floors} Lantai` },
    property.garage && { icon: Car, label: 'Garasi', value: `${property.garage} Mobil` },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string }[];

  const details = [
    property.certificateType && { label: 'Sertifikat', value: property.certificateType },
    property.yearBuilt && { label: 'Tahun Dibangun', value: String(property.yearBuilt) },
    property.furnishing && { label: 'Kondisi Furnitur', value: FURNISHING_LABEL[property.furnishing] ?? property.furnishing },
    { label: 'Tipe Properti', value: typeLabel },
    { label: 'Status', value: statusLabel },
    { label: 'ID Properti', value: property.id.slice(0, 8).toUpperCase() },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/${property.listingType === 'SALE' ? 'jual' : 'sewa'}`} className="hover:text-primary transition-colors">
              {statusLabel}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/${property.listingType === 'SALE' ? 'jual' : 'sewa'}/${property.city.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-primary transition-colors capitalize">
              {property.city}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium line-clamp-1 max-w-[200px]">{property.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8 pb-24 lg:pb-8">
        {/* Gallery */}
        <PropertyGallery images={images} title={property.title} />

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

          {/* LEFT: Content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Title card */}
            <div className="bg-white rounded-2xl border border-border/60 p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge className={property.listingType === 'SALE' ? 'bg-primary text-primary-foreground border-0' : 'bg-emerald-500 text-white border-0'}>
                      {statusLabel}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{typeLabel}</Badge>
                    {property.featured && <Badge className="bg-amber-500 text-white border-0 text-xs">Unggulan</Badge>}
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold leading-snug mb-3">{property.title}</h1>
                  <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-primary/60 mt-0.5" />
                    <span>{property.address}, {property.district}, {property.city}</span>
                  </div>
                </div>
                <ShareButton url={pageUrl} title={property.title} />
              </div>

              <div className="mt-4 pt-4 border-t border-border/50 flex items-end justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {property.listingType === 'RENT' ? 'Harga Sewa / Bulan' : 'Harga Jual'}
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-primary">{formatPrice(property.price)}</p>
                  {property.listingType === 'RENT' && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ≈ {formatPrice(Math.round(Number(property.price) * 12))} / tahun
                    </p>
                  )}
                  {property.listingType === 'SALE' && property.landArea && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatPrice(Math.round(Number(property.price) / property.landArea))}/m²
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{property.viewsCount} dilihat</span>
                  <span className="flex items-center gap-1"><Tag className="h-3.5 w-3.5" />{property.id.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Specs */}
            {specs.length > 0 ? (
              <div className="bg-white rounded-2xl border border-border/60 p-5 md:p-6">
                <h2 className="font-semibold text-base mb-4">Spesifikasi</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {specs.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-sm font-semibold">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-border/60 p-5 md:p-6">
                <h2 className="font-semibold text-base mb-3">Spesifikasi</h2>
                <p className="text-sm text-muted-foreground">Hubungi agen untuk informasi spesifikasi lengkap.</p>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-2xl border border-border/60 p-5 md:p-6">
              <h2 className="font-semibold text-base mb-4">Deskripsi Properti</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{property.description}</p>
            </div>

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <div className="bg-white rounded-2xl border border-border/60 p-5 md:p-6">
                <h2 className="font-semibold text-base mb-4">Fasilitas & Fitur</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {property.features.map((f) => (
                    <div key={f.id} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span>{f.feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Details table */}
            <div className="bg-white rounded-2xl border border-border/60 p-5 md:p-6">
              <h2 className="font-semibold text-base mb-4">Detail Properti</h2>
              <div className="divide-y divide-border/40">
                {details.map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-3">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            {property.latitude && property.longitude && (
              <div className="bg-white rounded-2xl border border-border/60 p-5 md:p-6">
                <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Lokasi di Peta
                </h2>
                <PropertyMapView lat={property.latitude} lng={property.longitude} title={property.title} />
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Lokasi ditampilkan dalam radius terdekat untuk privasi pemilik
                </p>
              </div>
            )}

            {/* Similar properties */}
            <SimilarProperties city={property.city} listingType={property.listingType} excludeId={property.id} />
          </div>

          {/* RIGHT: Sticky sidebar */}
          <div className="space-y-4">
            <div className="lg:sticky lg:top-24 space-y-4">

              {/* Agent card */}
              <div className="bg-white rounded-2xl border border-border/60 overflow-hidden">
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 px-5 py-4 border-b border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Ditawarkan oleh</p>
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                      {property.user?.name?.charAt(0) ?? 'A'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{property.user?.name ?? 'Agen Properti'}</p>
                      {property.user?.company && <p className="text-xs text-muted-foreground truncate">{property.user.company}</p>}
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-2.5">
                  <AuthGate>
                    {property.user?.phone && (
                      <Button className="w-full gap-2 font-semibold" size="lg" asChild>
                        <a href={`https://wa.me/${property.user.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                          <Phone className="h-4 w-4" />
                          Hubungi via WhatsApp
                        </a>
                      </Button>
                    )}
                    {property.user?.phone && (
                      <Button variant="outline" className="w-full gap-2" asChild>
                        <a href={`tel:${property.user.phone}`}>
                          <Phone className="h-4 w-4" />
                          {property.user.phone}
                        </a>
                      </Button>
                    )}
                    {property.user?.email && (
                      <Button variant="outline" className="w-full gap-2" asChild>
                        <a href={`mailto:${property.user.email}`}>
                          <Mail className="h-4 w-4" />
                          Kirim Email
                        </a>
                      </Button>
                    )}
                  </AuthGate>
                </div>
              </div>

              {/* Lead form */}
              <div className="bg-white rounded-2xl border border-border/60 p-5">
                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Jadwalkan Survei
                </h3>
                <ContactForm propertyId={property.id} />
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <MobileStickyContact
        phone={property.user?.phone}
        name={property.user?.name}
        price={formatPrice(property.price)}
      />
    </div>
  );
}
