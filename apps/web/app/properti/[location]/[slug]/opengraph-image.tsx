import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'PropertyHub';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const TYPE_LABEL: Record<string, string> = {
  HOUSE: 'Rumah', APARTMENT: 'Apartemen', LAND: 'Tanah',
  COMMERCIAL: 'Ruko/Komersial', VILLA: 'Villa', WAREHOUSE: 'Gudang',
};

function formatPrice(price: string | number): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1)} M`;
  if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(0)} Jt`;
  return `Rp ${num.toLocaleString('id-ID')}`;
}

export default async function Image({ params }: { params: { location: string; slug: string } }) {
  let property: any = null;
  try {
    const res = await fetch(`${API_URL}/properties/properti/detail/${params.slug}`, { cache: 'no-store' });
    if (res.ok) property = await res.json();
  } catch {}

  const title = property?.title ?? 'Properti';
  const price = property?.price ? formatPrice(property.price) : '';
  const location = property ? `${property.district}, ${property.city}` : '';
  const type = property ? (TYPE_LABEL[property.propertyType] ?? property.propertyType) : '';
  const status = property?.listingType === 'SALE' ? 'Dijual' : 'Disewa';
  const imgUrl = property?.images?.find((i: any) => i.isPrimary)?.url ?? property?.images?.[0]?.url;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex', width: '100%', height: '100%',
          background: '#0f172a', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Background image */}
        {imgUrl && (
          <img
            src={imgUrl}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.7) 100%)' }} />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '60px', width: '100%', position: 'relative' }}>
          {/* Top */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#2563eb', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '18px', fontWeight: 700 }}>
              PropertyHub
            </div>
            {type && (
              <div style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '16px' }}>
                {type} · {status}
              </div>
            )}
          </div>

          {/* Middle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '52px', fontWeight: 800, color: 'white', lineHeight: 1.1, maxWidth: '800px' }}>
              {title}
            </div>
            {location && (
              <div style={{ fontSize: '24px', color: '#94a3b8' }}>📍 {location}</div>
            )}
          </div>

          {/* Bottom */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {price && (
              <div style={{ fontSize: '40px', fontWeight: 800, color: '#3b82f6' }}>{price}</div>
            )}
            <div style={{ fontSize: '18px', color: '#64748b' }}>propertyhub.id</div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
