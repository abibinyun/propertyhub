import { serverApi } from '@/lib/server/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminPropertyActions } from '@/components/client/admin-property-actions';
import { Property, PropertyStatus } from '@/types/property';
import { formatPrice } from '@/lib/utils';

const STATUS_VARIANT: Record<PropertyStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ACTIVE: 'default', DRAFT: 'secondary', SOLD: 'outline', RENTED: 'outline', INACTIVE: 'destructive',
};

export default async function AdminPropertiesPage() {
  const { data: properties } = await serverApi.getAdminProperties();

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Semua Properti</h1>
        <span className="text-muted-foreground text-sm">{properties.length} properti</span>
      </div>
      <div className="space-y-3">
        {properties.map((p: Property) => (
          <Card key={p.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p.title}</p>
                <p className="text-sm text-muted-foreground">
                  {p.city} · {formatPrice(p.price)}
                </p>
              </div>
              <Badge variant={STATUS_VARIANT[p.status] ?? 'secondary'}>{p.status}</Badge>
              <AdminPropertyActions property={p} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
