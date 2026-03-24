'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { propertiesApi } from '@/lib/api/properties';
import { Property, PropertyStatus } from '@/types/property';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { propertyDetailUrl } from '@/lib/url';

const STATUS_VARIANT: Record<PropertyStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ACTIVE: 'default', DRAFT: 'secondary', SOLD: 'destructive',
  RENTED: 'destructive', INACTIVE: 'outline',
};

export function PropertyList({ initialProperties }: { initialProperties: Property[] }) {
  const router = useRouter();
  const [properties, setProperties] = useState(initialProperties);

  const handleDelete = async (slug: string) => {
    if (!confirm('Yakin ingin menghapus properti ini?')) return;
    await propertiesApi.delete(slug);
    setProperties((p) => p.filter((x) => x.slug !== slug));
    router.refresh();
  };

  if (properties.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">Belum ada properti</p>
          <Button asChild><Link href="/dashboard/properties/new">Tambah Properti Pertama</Link></Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => {
        const img = property.images?.find((i) => i.isPrimary) ?? property.images?.[0];
        return (
          <Card key={property.id} className="overflow-hidden">
            <div className="relative aspect-[4/3]">
              <Image src={img?.url || '/placeholder-property.jpg'} alt={property.title} fill className="object-cover" />
              <div className="absolute top-2 left-2">
                <Badge variant={STATUS_VARIANT[property.status]}>{property.status}</Badge>
              </div>
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={propertyDetailUrl(property)}><Eye className="mr-2 h-4 w-4" />Lihat</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/properties/${property.slug}/edit`}><Edit className="mr-2 h-4 w-4" />Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(property.slug)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-1 line-clamp-2">{property.title}</h3>
              <p className="text-xl font-bold text-primary mb-2">{formatPrice(property.price)}</p>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{property.city}</span>
                <span>{property.viewsCount} views</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
