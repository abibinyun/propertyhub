import Image from 'next/image';
import { serverApi } from '@/lib/server/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { ModerationActions } from '@/components/client/moderation-actions';
import { ModerationStatusTabs } from '@/components/client/moderation-status-tabs';
import { formatPrice } from '@/lib/utils';

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function ModerationPage({ searchParams }: Props) {
  const { status = 'PENDING' } = await searchParams;
  const { data: properties } = await serverApi.getModerationQueue(status);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Moderasi Properti</h1>

      <ModerationStatusTabs currentStatus={status} />

      {properties.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Tidak ada properti di antrian ini</p>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => {
            const img = property.images?.find((i) => i.isPrimary) ?? property.images?.[0];
            return (
              <Card key={property.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative w-32 h-24 flex-shrink-0 rounded overflow-hidden bg-muted">
                      {img && <Image src={img.url} alt={property.title} fill className="object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold line-clamp-1">{property.title}</h3>
                        <Badge variant="outline" className="flex-shrink-0">{property.propertyType}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{property.district}, {property.city}</span>
                      </div>
                      <p className="text-sm font-semibold text-primary">
                        {formatPrice(property.price)}
                      </p>
                      {status === 'PENDING' && <ModerationActions property={property} />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
