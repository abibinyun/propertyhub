'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api/admin';
import { Property, PropertyStatus } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Eye, Trash2 } from 'lucide-react';
import { propertyDetailUrl } from '@/lib/url';

export function AdminPropertyActions({ property }: { property: Property }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Hapus properti ini?')) return;
    setLoading(true);
    await adminApi.deleteProperty(property.id);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex gap-2">
      <Button size="icon" variant="ghost" asChild>
        <Link href={propertyDetailUrl(property)} target="_blank"><Eye className="h-4 w-4" /></Link>
      </Button>
      <Button size="icon" variant="ghost" className="text-destructive" disabled={loading} onClick={handleDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
