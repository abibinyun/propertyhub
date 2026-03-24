'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Maximize2, ArrowRight, Phone, X } from 'lucide-react';
import { Property } from '@/types/property';
import { formatPrice } from '@/lib/utils';
import { propertyDetailUrl } from '@/lib/url';

interface Props {
  property: Property | null;
  onClose: () => void;
}

export function PropertyQuickView({ property, onClose }: Props) {
  if (!property) return null;
  const img = property.images?.find((i) => i.isPrimary) ?? property.images?.[0];

  return (
    <Dialog open={!!property} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-2xl p-0 overflow-hidden gap-0 max-h-[85dvh] flex flex-col" aria-describedby={undefined}>
        <DialogTitle className="sr-only">{property.title}</DialogTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 overflow-y-auto flex-1">
          {/* Image */}
          <div className="relative aspect-[16/6] md:aspect-auto md:min-h-[300px] bg-muted flex-shrink-0">
            <Image
              src={img?.url || '/placeholder-property.jpg'}
              alt={property.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute top-3 left-3">
              <Badge className={property.listingType === 'SALE' ? 'bg-primary text-primary-foreground border-0' : 'bg-emerald-500 text-white border-0'}>
                {property.listingType === 'SALE' ? 'Dijual' : 'Disewa'}
              </Badge>
            </div>
            {/* Close button — visible di mobile karena tertimpa gambar */}
            <button
              onClick={onClose}
              className="md:hidden absolute top-3 right-3 z-50 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Info */}
          <div className="p-4 md:p-6 flex flex-col gap-3 md:gap-4">
            <div>
              <p className="text-xl md:text-2xl font-bold text-primary">{formatPrice(property.price)}</p>
              <h3 className="font-semibold text-sm md:text-base mt-1 line-clamp-2">{property.title}</h3>
              <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground mt-1.5">
                <MapPin className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary/60" />
                <span>{property.district}, {property.city}</span>
              </div>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-3 gap-2">
              {property.bedrooms && (
                <div className="flex flex-col items-center gap-0.5 p-2 md:p-3 rounded-xl bg-slate-50">
                  <Bed className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                  <span className="text-xs md:text-sm font-semibold">{property.bedrooms}</span>
                  <span className="text-xs text-muted-foreground">KT</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex flex-col items-center gap-0.5 p-2 md:p-3 rounded-xl bg-slate-50">
                  <Bath className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                  <span className="text-xs md:text-sm font-semibold">{property.bathrooms}</span>
                  <span className="text-xs text-muted-foreground">KM</span>
                </div>
              )}
              {property.landArea && (
                <div className="flex flex-col items-center gap-0.5 p-2 md:p-3 rounded-xl bg-slate-50">
                  <Maximize2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                  <span className="text-xs md:text-sm font-semibold">{property.landArea}</span>
                  <span className="text-xs text-muted-foreground">m²</span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 md:line-clamp-3 leading-relaxed">
              {property.description}
            </p>

            {/* Agent */}
            {property.user && (
              <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-xl bg-slate-50">
                <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                  {property.user.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-semibold truncate">{property.user.name}</p>
                  {property.user.company && <p className="text-xs text-muted-foreground truncate">{property.user.company}</p>}
                </div>
                {property.user.phone && (
                  <a href={`tel:${property.user.phone}`} className="flex-shrink-0">
                    <Button size="icon" variant="outline" className="h-7 w-7 md:h-8 md:w-8 rounded-lg">
                      <Phone className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    </Button>
                  </a>
                )}
              </div>
            )}

            <Link href={propertyDetailUrl(property)} onClick={onClose} className="mt-auto">
              <Button className="w-full gap-2 font-semibold text-sm">
                Lihat Detail Lengkap <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
