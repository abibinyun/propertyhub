'use client';

import { useState } from 'react';
import { AdPackage, UserSubscription } from '@/types/property';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, CheckCircle2, ShieldCheck, Sparkles, Clock, ArrowRight, Loader2 } from 'lucide-react';

interface Props {
  packages: AdPackage[];
  subscription: UserSubscription | null;
}

export function PackagesPricing({ packages, subscription }: Props) {
  const [loadingCode, setLoadingCode] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const handleSelectPackage = async (pkg: AdPackage) => {
    setLoadingCode(pkg.code);
    setMessage('');
    try {
      // Future integration with Midtrans subscription checkout
      setMessage(`Paket "${pkg.name}" dipilih. Integrasi payment gateway siap memproses invoice.`);
    } catch {
      setMessage('Terjadi kesalahan saat memproses paket.');
    } finally {
      setLoadingCode(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription Card */}
      {subscription && (
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Langganan Aktif</span>
                <Badge variant="outline" className="text-xs font-bold text-emerald-600 border-emerald-300">
                  {subscription.status}
                </Badge>
              </div>
              <h2 className="text-xl font-bold">{subscription.package?.name ?? 'Paket Agen'}</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="h-3.5 w-3.5" />
                Berlaku hingga: {new Date(subscription.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white rounded-xl border px-4 py-2 text-center">
                <span className="text-xs text-muted-foreground block">Sisa Kuota Listing</span>
                <span className="text-lg font-bold text-primary">{subscription.listingQuotaRemaining}</span>
              </div>
              <div className="bg-white rounded-xl border px-4 py-2 text-center">
                <span className="text-xs text-muted-foreground block">Sisa Kuota Sundul</span>
                <span className="text-lg font-bold text-amber-600">{subscription.bumpQuotaRemaining}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 rounded-xl">
          {message}
        </div>
      )}

      {/* Package Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const isPro = pkg.code === 'PRO';
          return (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-2xl border flex flex-col p-6 transition-all duration-300 hover:shadow-xl ${
                isPro ? 'border-primary shadow-md ring-2 ring-primary/20' : 'border-border/60'
              }`}
            >
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" /> Paling Populer
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-bold text-lg">{pkg.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 min-h-[32px]">{pkg.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-extrabold text-foreground">{formatPrice(pkg.price)}</span>
                <span className="text-xs text-muted-foreground ml-1">/ {pkg.durationDays} hari</span>
              </div>

              <div className="space-y-3 mb-6 flex-1 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span><strong>{pkg.listingQuota}</strong> Kuota Pasang Listing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <span><strong>{pkg.bumpQuota}x</strong> Kuota Sundul Listing</span>
                </div>
                {pkg.featuredQuota > 0 && (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                    <span><strong>{pkg.featuredQuota}x</strong> Featured Listing Gratis</span>
                  </div>
                )}
                {pkg.badgeVerified && (
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="text-blue-600 font-medium">Lencana Agen Terverifikasi</span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => handleSelectPackage(pkg)}
                disabled={loadingCode === pkg.code}
                variant={isPro ? 'default' : 'outline'}
                className="w-full rounded-xl gap-2 font-semibold"
              >
                {loadingCode === pkg.code ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Pilih Paket <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
