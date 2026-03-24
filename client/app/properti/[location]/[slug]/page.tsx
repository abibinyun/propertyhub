import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { propertiesApi } from '@/lib/api/properties';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PropertyGallery } from '@/components/client/property-gallery';
import { ContactForm } from '@/components/client/contact-form';
import { PropertyMapView } from '@/components/client/property-map-view';
import { MapPin, Bed, Bath, Maximize, Home, Phone, Mail } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Props {
  params: Promise<{ location: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, location } = await params;
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const p = await propertiesApi.getBySlug(slug);
    const img = p.images?.[0]?.url;
    const statusLabel = p.listingType === 'SALE' ? 'Dijual' : 'Disewa';
    const typeLabel: Record<string, string> = { HOUSE: 'Rumah', APARTMENT: 'Apartemen', LAND: 'Tanah', COMMERCIAL: 'Ruko/Komersial', VILLA: 'Villa', WAREHOUSE: 'Gudang' };
    const title = `${p.title} - ${typeLabel[p.propertyType] ?? p.propertyType} ${statusLabel} di ${p.district}, ${p.city}`;
    const description = `${typeLabel[p.propertyType] ?? p.propertyType} ${statusLabel.toLowerCase()} di ${p.district}, ${p.city}. ${p.description?.slice(0, 120)}`;
    const canonical = `${BASE_URL}/properti/${location}/${slug}`;
    return {
      title,
      description,
      keywords: [p.city, p.district, typeLabel[p.propertyType], statusLabel, 'properti', 'PropertyHub'],
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        type: 'article',
        siteName: 'PropertyHub',
        ...(img && { images: [{ url: img, width: 800, height: 600, alt: p.title }] }),
      },
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: `${BASE_URL}/properti/${location}/${slug}`,
    image: images.map((i: { url: string }) => i.url),
    datePosted: property.createdAt,
    offers: {
      '@type': 'Offer',
      price: Number(property.price),
      priceCurrency: 'IDR',
      availability: 'https://schema.org/InStock',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.district,
      addressRegion: property.city,
      postalCode: property.postalCode,
      addressCountry: 'ID',
    },
    ...(property.buildingArea && { floorSize: { '@type': 'QuantitativeValue', value: property.buildingArea, unitCode: 'MTK' } }),
    ...(property.bedrooms && { numberOfRooms: property.bedrooms }),
    seller: { '@type': 'Person', name: property.user?.name, telephone: property.user?.phone },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PropertyGallery images={images} title={property.title} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={property.listingType === 'SALE' ? 'default' : 'secondary'}>
                {property.listingType === 'SALE' ? 'Jual' : 'Sewa'}
              </Badge>
              <Badge variant="outline">{property.propertyType}</Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
            <p className="text-3xl font-bold text-primary mb-4">{formatPrice(property.price)}</p>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.address}, {property.district}, {property.city}</span>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-xl font-semibold mb-4">Spesifikasi</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {property.bedrooms && (
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-muted-foreground" />
                  <div><p className="text-sm text-muted-foreground">Kamar Tidur</p><p className="font-semibold">{property.bedrooms}</p></div>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-2">
                  <Bath className="h-5 w-5 text-muted-foreground" />
                  <div><p className="text-sm text-muted-foreground">Kamar Mandi</p><p className="font-semibold">{property.bathrooms}</p></div>
                </div>
              )}
              {property.landArea && (
                <div className="flex items-center gap-2">
                  <Maximize className="h-5 w-5 text-muted-foreground" />
                  <div><p className="text-sm text-muted-foreground">Luas Tanah</p><p className="font-semibold">{property.landArea}m²</p></div>
                </div>
              )}
              {property.buildingArea && (
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-muted-foreground" />
                  <div><p className="text-sm text-muted-foreground">Luas Bangunan</p><p className="font-semibold">{property.buildingArea}m²</p></div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-xl font-semibold mb-4">Deskripsi</h2>
            <p className="text-muted-foreground whitespace-pre-line">{property.description}</p>
          </div>

          {property.latitude && property.longitude && (
            <>
              <Separator />
              <div>
                <h2 className="text-xl font-semibold mb-4">Lokasi di Peta</h2>
                <PropertyMapView lat={property.latitude} lng={property.longitude} title={property.title} />
              </div>
            </>
          )}

          {property.features && property.features.length > 0 && (
            <>
              <Separator />
              <div>
                <h2 className="text-xl font-semibold mb-4">Fasilitas</h2>
                <div className="grid grid-cols-2 gap-2">
                  {property.features.map((f) => (
                    <div key={f.id} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span>{f.feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />
          <div className="grid grid-cols-2 gap-4 text-sm">
            {property.certificateType && <div><p className="text-muted-foreground">Sertifikat</p><p className="font-semibold">{property.certificateType}</p></div>}
            {property.yearBuilt && <div><p className="text-muted-foreground">Tahun Dibangun</p><p className="font-semibold">{property.yearBuilt}</p></div>}
            {property.furnishing && <div><p className="text-muted-foreground">Kondisi</p><p className="font-semibold">{property.furnishing}</p></div>}
            {property.floors && <div><p className="text-muted-foreground">Jumlah Lantai</p><p className="font-semibold">{property.floors}</p></div>}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Hubungi Penjual</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold">{property.user?.name}</p>
                {property.user?.company && <p className="text-sm text-muted-foreground">{property.user.company}</p>}
              </div>
              <div className="space-y-2">
                {property.user?.phone && (
                  <Button className="w-full" size="lg" asChild>
                    <a href={`tel:${property.user.phone}`}><Phone className="mr-2 h-4 w-4" />{property.user.phone}</a>
                  </Button>
                )}
                {property.user?.email && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`mailto:${property.user.email}`}><Mail className="mr-2 h-4 w-4" />Email</a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dilihat</span>
                <span className="font-semibold">{property.viewsCount}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID Properti</span>
                <span className="font-mono text-xs">{property.id.slice(0, 8)}</span>
              </div>
            </CardContent>
          </Card>

          <ContactForm propertyId={property.id} />
        </div>
      </div>
    </div>
  );
}
