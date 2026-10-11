import { Zap } from 'lucide-react';
import { packagesApi } from '@/lib/api/packages';
import { PackagesPricing } from '@/components/client/packages-pricing';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Paket Iklan Agen — Dashboard' };

export default async function PackagesPage() {
  const [packages, subscription] = await Promise.all([
    packagesApi.getPackages().catch(() => []),
    packagesApi.getMySubscription().catch(() => null),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          Paket Iklan Agen
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tingkatkan eksposur listing properti Anda dan dapatkan lebih banyak leads potensial.
        </p>
      </div>

      <PackagesPricing packages={packages} subscription={subscription} />
    </div>
  );
}
