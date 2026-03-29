'use client';

import { useState } from 'react';
import { paymentsApi, FEATURED_TIERS } from '@/lib/api/payments';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, Zap } from 'lucide-react';

interface Props {
  propertyId: string;
  propertyTitle: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const IS_LOG_MODE = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER !== 'midtrans';

function formatPrice(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`;
}

export function FeaturedModal({ propertyId, propertyTitle, open, onClose, onSuccess }: Props) {
  const [selected, setSelected] = useState<string>('PREMIUM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (IS_LOG_MODE) {
        await paymentsApi.activateDirect(propertyId, selected);
        onSuccess();
        onClose();
        return;
      }

      const result = await paymentsApi.createFeatured(propertyId, selected);
      // Load Midtrans Snap
      (window as any).snap.pay(result.token, {
        onSuccess: () => { onSuccess(); onClose(); },
        onPending: () => { onClose(); },
        onError: () => setError('Pembayaran gagal, coba lagi'),
        onClose: () => {},
      });
    } catch {
      setError('Terjadi kesalahan, coba lagi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Promosikan Properti
          </DialogTitle>
          <p className="text-sm text-muted-foreground line-clamp-1">{propertyTitle}</p>
        </DialogHeader>

        {IS_LOG_MODE && (
          <div className="text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-3 py-2">
            Mode development — featured akan langsung aktif tanpa pembayaran
          </div>
        )}

        <div className="space-y-3">
          {FEATURED_TIERS.map((tier) => (
            <button
              key={tier.type}
              onClick={() => setSelected(tier.type)}
              className={`w-full text-left rounded-xl border-2 p-4 transition-all ${selected === tier.type ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{tier.label}</span>
                  {tier.type === 'PREMIUM' && <Badge className="bg-blue-500 text-white text-xs border-0">Populer</Badge>}
                  {tier.type === 'ULTIMATE' && <Badge className="bg-amber-500 text-white text-xs border-0">Terbaik</Badge>}
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{formatPrice(tier.price)}</p>
                  <p className="text-xs text-muted-foreground">/{tier.duration}</p>
                </div>
              </div>
              <ul className="space-y-1">
                {tier.perks.map((p) => (
                  <li key={p} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>Batal</Button>
          <Button className="flex-1 gap-2" onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {IS_LOG_MODE ? 'Aktifkan Sekarang' : 'Bayar Sekarang'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
