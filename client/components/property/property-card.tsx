import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Maximize } from 'lucide-react';
import { Property } from '@/types/property';
import { formatPrice } from '@/lib/utils';
import { propertyDetailUrl } from '@/lib/url';

interface Props { property: Property }

export function PropertyCard({ property }: Props) {
  const primaryImage = property.images?.find((img) => img.isPrimary) ?? property.images?.[0];
  const imageUrl = primaryImage?.url || '/placeholder-property.jpg';

  return (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 ring-1 ring-border hover:ring-2 hover:ring-primary">
      <Link href={propertyDetailUrl(property)}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 left-3">
            <Badge variant={property.listingType === 'SALE' ? 'default' : 'secondary'}>
              {property.listingType === 'SALE' ? 'Dijual' : 'Disewa'}
            </Badge>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <span className="text-2xl font-bold text-primary">{formatPrice(property.price)}</span>
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors min-h-[3.5rem]">
            {property.title}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">{property.district}, {property.city}</span>
          </div>
          <div className="flex items-center gap-4 pt-2 border-t">
            {property.bedrooms && (
              <div className="flex items-center gap-1.5 text-sm">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1.5 text-sm">
                <Bath className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{property.bathrooms}</span>
              </div>
            )}
            {property.landArea && (
              <div className="flex items-center gap-1.5 text-sm">
                <Maximize className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{property.landArea}m²</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}
