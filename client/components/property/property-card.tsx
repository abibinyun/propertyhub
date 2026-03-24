'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Maximize2, Heart, Eye } from 'lucide-react';
import { Property } from '@/types/property';
import { formatPrice, cn } from '@/lib/utils';
import { propertyDetailUrl } from '@/lib/url';
import { favoritesApi } from '@/lib/api/favorites';
import { PropertyQuickView } from '@/components/client/property-quick-view';

function FavoriteButton({ propertyId }: { propertyId: string }) {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      if (liked) {
        await favoritesApi.remove(propertyId);
      } else {
        await favoritesApi.add(propertyId);
      }
      setLiked(!liked);
    } catch { /* not logged in — silently ignore */ }
    finally { setLoading(false); }
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        'absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm',
        liked
          ? 'bg-red-500 text-white shadow-lg'
          : 'bg-white/80 text-slate-600 hover:bg-white hover:text-red-500 shadow',
      )}
    >
      <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
    </button>
  );
}

function isNew(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
}

export function PropertyCard({ property }: { property: Property }) {
  const img = property.images?.find((i) => i.isPrimary) ?? property.images?.[0];
  const fresh = isNew(property.createdAt);
  const [quickView, setQuickView] = useState(false);

  return (
    <>
      <PropertyQuickView property={quickView ? property : null} onClose={() => setQuickView(false)} />

      <Link href={propertyDetailUrl(property)} className="group block">
        <div className="rounded-2xl overflow-hidden bg-white border border-border/60 hover:border-border hover:shadow-xl transition-all duration-300">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            <Image
              src={img?.url || '/placeholder-property.jpg'}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Badges top-left */}
            <div className="absolute top-3 left-3 flex gap-1.5">
              <Badge className={cn('border-0 font-semibold text-xs',
                property.listingType === 'SALE' ? 'bg-primary text-primary-foreground' : 'bg-emerald-500 text-white')}>
                {property.listingType === 'SALE' ? 'Dijual' : 'Disewa'}
              </Badge>
              {fresh && <Badge className="bg-amber-500 text-white border-0 font-semibold text-xs">Baru</Badge>}
            </div>

            {/* Favorite — always visible */}
            <FavoriteButton propertyId={property.id} />
            {/* Quick view — sejajar dengan heart, geser ke kiri */}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickView(true); }}
              className="absolute top-3 right-12 h-8 w-8 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-primary flex items-center justify-center shadow backdrop-blur-sm transition-all duration-200 md:opacity-0 md:group-hover:opacity-100"
            >
              <Eye className="h-4 w-4" />
            </button>

            {/* Price overlay */}
            <div className="absolute bottom-3 left-3">
              <span className="text-white font-bold text-base drop-shadow-md">{formatPrice(property.price)}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug mb-2">
              {property.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
              <MapPin className="h-3 w-3 flex-shrink-0 text-primary/60" />
              <span className="line-clamp-1">{property.district}, {property.city}</span>
            </div>
            {(property.bedrooms || property.bathrooms || property.landArea) && (
              <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                {property.bedrooms && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Bed className="h-3.5 w-3.5" /><span>{property.bedrooms} KT</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Bath className="h-3.5 w-3.5" /><span>{property.bathrooms} KM</span>
                  </div>
                )}
                {property.landArea && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Maximize2 className="h-3.5 w-3.5" /><span>{property.landArea} m²</span>
                  </div>
                )}
                {property.user?.name && (
                  <span className="ml-auto text-xs text-muted-foreground truncate max-w-[80px]">{property.user.name}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </>
  );
}
