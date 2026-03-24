import { redirect } from 'next/navigation';
import Link from 'next/link';
import { serverApi } from '@/lib/server/api';
import { getToken } from '@/lib/server/auth';
import { PropertyList } from '@/components/client/property-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function MyPropertiesPage() {
  const token = await getToken();
  if (!token) redirect('/login');

  const properties = await serverApi.getMyProperties();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Properti Saya</h1>
          <p className="text-muted-foreground">{properties.length} properti</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/properties/new" className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Properti
          </Link>
        </Button>
      </div>
      <PropertyList initialProperties={properties} />
    </div>
  );
}
