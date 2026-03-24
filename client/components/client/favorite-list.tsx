'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { favoritesApi, FavoriteItem } from '@/lib/api/favorites';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Trash2, Bed, Bath, Maximize2, Heart, ArrowRight } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { propertyDetailUrl } from '@/lib/url';

export function FavoriteList({ initialFavorites }: { initialFavorites: FavoriteItem[] }) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const [removing, setRemoving] = useState<string | null>(null);
  const [visible, setVisible] = useState(9);

  const displayed = favorites.slice(0, visible);

  const handleRemove = async (propertyId: string) => {
    setRemoving(propertyId);
    try {
      await favoritesApi.remove(propertyId);
      setFavorites((p) => p.filter((f) => f.propertyId !== propertyId));
    } catch { /* silent */ }
    finally { setRemoving(null); }
  };

  if (favorites.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-border/60">
        <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Heart className="h-8 w-8 text-red-300" />
        </div>
        <h3 className="text-lg font-bold mb-2">Belum ada favorit</h3>
        <p className="text-sm text-muted-foreground mb-6">Simpan properti yang menarik untuk dilihat nanti</p>
        <Button asChild className="rounded-xl gap-2">
          <Link href="/jual">Jelajahi Properti <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {displayed.map(({ id, property, createdAt }) => {
        const img = property.images?.find((i) => i.isPrimary) ?? property.images?.[0];
        const isRemoving = removing === property.id;

        return (
          <div key={id} className={cn('group bg-white rounded-2xl border border-border/60 overflow-hidden hover:shadow-xl transition-all duration-300', isRemoving && 'opacity-50 pointer-events-none')}>
            {/* Image */}
            <Link href={propertyDetailUrl(property)}>
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <Image
                  src={img?.url || '/placeholder-property.jpg'}
                  alt={property.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <Badge className={cn('border-0 font-semibold text-xs', property.listingType === 'SALE' ? 'bg-primary text-primary-foreground' : 'bg-emerald-500 text-white')}>
                    {property.listingType === 'SALE' ? 'Dijual' : 'Disewa'}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="text-white font-bold text-base drop-shadow-md">{formatPrice(property.price)}</span>
                </div>
              </div>
            </Link>

            {/* Content */}
            <div className="p-4">
              <Link href={propertyDetailUrl(property)}>
                <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug mb-2">
                  {property.title}
                </h3>
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                <MapPin className="h-3 w-3 flex-shrink-0 text-primary/60" />
                <span className="line-clamp-1">{property.district}, {property.city}</span>
              </div>

              {(property.bedrooms || property.bathrooms || property.landArea) && (
                <div className="flex items-center gap-3 pb-3 border-b border-border/50 mb-3">
                  {property.bedrooms && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Bed className="h-3.5 w-3.5" />{property.bedrooms} KT
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Bath className="h-3.5 w-3.5" />{property.bathrooms} KM
                    </div>
                  )}
                  {property.landArea && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Maximize2 className="h-3.5 w-3.5" />{property.landArea} m²
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button asChild size="sm" className="flex-1 rounded-xl text-xs font-semibold">
                  <Link href={propertyDetailUrl(property)}>Lihat Detail</Link>
                </Button>
                <Button
                  variant="outline" size="icon"
                  className="h-8 w-8 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 flex-shrink-0"
                  onClick={() => handleRemove(property.id)}
                  disabled={isRemoving}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-2 text-center">
                Disimpan {new Date(createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        );
      })}
      {visible < favorites.length && (
        <div className="col-span-full flex justify-center pt-2">
          <Button variant="outline" className="rounded-xl gap-2 px-8" onClick={() => setVisible((v) => v + 9)}>
            Muat Lebih Banyak
            <span className="text-xs text-muted-foreground">({favorites.length - visible} lagi)</span>
          </Button>
        </div>
      )}
    </div>
  );
}
