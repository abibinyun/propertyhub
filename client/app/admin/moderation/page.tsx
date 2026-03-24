import Image from 'next/image';
import Link from 'next/link';
import { serverApi } from '@/lib/server/api';
import { ModerationActions } from '@/components/client/moderation-actions';
import { ModerationStatusTabs } from '@/components/client/moderation-status-tabs';
import { formatPrice } from '@/lib/utils';
import { MapPin, Eye, Clock, User, Building2 } from 'lucide-react';

const TYPE_LABEL: Record<string, string> = {
  HOUSE: 'Rumah', APARTMENT: 'Apartemen', LAND: 'Tanah',
  COMMERCIAL: 'Ruko', VILLA: 'Villa', WAREHOUSE: 'Gudang',
};
const LISTING_LABEL: Record<string, string> = { SALE: 'Dijual', RENT: 'Disewa' };

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function ModerationPage({ searchParams }: Props) {
  const { status = 'PENDING', page = '1' } = await searchParams;
  const { data: properties, meta } = await serverApi.getModerationQueue(status);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Moderasi Properti</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{meta.total} properti dalam antrian</p>
        </div>
      </div>

      <ModerationStatusTabs currentStatus={status} />

      {properties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/60 py-16 text-center">
          <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Tidak ada properti di antrian ini</p>
          <p className="text-sm text-muted-foreground mt-1">Semua sudah diproses 🎉</p>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => {
            const img = property.images?.find((i) => i.isPrimary) ?? property.images?.[0];
            return (
              <div key={property.id} className="bg-white rounded-2xl border border-border/60 overflow-hidden">
                <div className="flex gap-0">
                  {/* Image */}
                  <div className="relative w-48 flex-shrink-0 bg-slate-100">
                    {img
                      ? <Image src={img.url} alt={property.title} fill className="object-cover" />
                      : <div className="absolute inset-0 flex items-center justify-center"><Building2 className="h-8 w-8 text-slate-300" /></div>
                    }
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                            {TYPE_LABEL[property.propertyType] ?? property.propertyType}
                          </span>
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                            {LISTING_LABEL[property.listingType] ?? property.listingType}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-900 line-clamp-1">{property.title}</h3>
                      </div>
                      <p className="text-lg font-bold text-blue-600 whitespace-nowrap flex-shrink-0">
                        {formatPrice(property.price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {property.district}, {property.city}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        {property.user?.name}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(property.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {property.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{property.description}</p>
                    )}

                    <div className="flex items-center justify-between gap-4">
                      <Link href={`/properti/${property.city?.toLowerCase().replace(/\s+/g, '-')}/${property.slug}`}
                        target="_blank"
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                        <Eye className="h-3.5 w-3.5" />
                        Preview properti
                      </Link>
                      {status === 'PENDING' && <ModerationActions property={property} />}
                      {status !== 'PENDING' && property.moderationNotes && (
                        <p className="text-xs text-muted-foreground italic">Catatan: {property.moderationNotes}</p>
                      )}
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
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Halaman {meta.page} dari {meta.totalPages}</p>
          <div className="flex gap-2">
            {meta.page > 1 && (
              <Link href={`?status=${status}&page=${meta.page - 1}`}
                className="text-xs px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-slate-50 transition-colors">
                Sebelumnya
              </Link>
            )}
            {meta.page < meta.totalPages && (
              <Link href={`?status=${status}&page=${meta.page + 1}`}
                className="text-xs px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-slate-50 transition-colors">
                Berikutnya
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
