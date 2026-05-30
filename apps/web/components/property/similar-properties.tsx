import Link from 'next/link';
import { propertiesApi } from '@/lib/api/properties';
import { serverApi } from '@/lib/server/api';
import { getToken } from '@/lib/server/auth';
import { PropertyCard } from '@/components/property/property-card';
import { Property } from '@/types/property';
import { ArrowRight } from 'lucide-react';

interface Props {
  city: string;
  listingType: 'SALE' | 'RENT';
  excludeId: string;
}

export async function SimilarProperties({ city, listingType, excludeId }: Props) {
  let properties: Property[] = [];
  try {
    const token = await getToken();
    const status = listingType === 'SALE' ? 'jual' : 'sewa';
    const [res, favoriteIds] = await Promise.all([
      propertiesApi.getByCategory(`${status}/${city.toLowerCase()}`, { limit: 4 }),
      token ? serverApi.getFavoriteIds().catch(() => [] as string[]) : Promise.resolve([] as string[]),
    ]);
    properties = res.data.filter((p) => p.id !== excludeId).slice(0, 3);

    if (properties.length === 0) return null;

    return (
      <div className="bg-white rounded-2xl border border-border/60 p-5 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-base">Properti Lainnya di {city}</h2>
          <Link href={`/${status}/${city.toLowerCase()}`} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
            Lihat semua <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} favoriteIds={favoriteIds} />
          ))}
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
