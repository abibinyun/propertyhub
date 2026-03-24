'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { favoritesApi, FavoriteItem } from '@/lib/api/favorites';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { propertyDetailUrl } from '@/lib/url';

export function FavoriteList({ initialFavorites }: { initialFavorites: FavoriteItem[] }) {
  const router = useRouter();
  const [favorites, setFavorites] = useState(initialFavorites);

  const handleRemove = async (propertyId: string) => {
    await favoritesApi.remove(propertyId);
    setFavorites((p) => p.filter((f) => f.propertyId !== propertyId));
    router.refresh();
  };

  if (favorites.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">Belum ada properti favorit</p>
          <Button asChild><Link href="/jual">Jelajahi Properti</Link></Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map(({ id, property }) => {
        const img = property.images?.find((i) => i.isPrimary) ?? property.images?.[0];
        return (
          <Card key={id} className="overflow-hidden group">
            <Link href={propertyDetailUrl(property)}>
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <Image src={img?.url || '/placeholder-property.jpg'} alt={property.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            </Link>
            <CardContent className="p-4">
              <Link href={propertyDetailUrl(property)}>
                <p className="font-bold text-lg text-primary mb-1">{formatPrice(property.price)}</p>
                <h3 className="font-semibold line-clamp-2 mb-2 hover:text-primary transition-colors">{property.title}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{property.district}, {property.city}</span>
                </div>
              </Link>
              <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive" onClick={() => handleRemove(property.id)}>
                <Trash2 className="h-4 w-4 mr-2" />Hapus dari Favorit
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
