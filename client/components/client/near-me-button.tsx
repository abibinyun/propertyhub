'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  variant?: 'default' | 'outline';
}

export function NearMeButton({ className, variant = 'outline' }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = () => {
    if (!navigator.geolocation) {
      setError('Browser tidak mendukung geolokasi');
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        router.push(`/jual?lat=${latitude}&lng=${longitude}&radius=10`);
        setLoading(false);
      },
      () => {
        setError('Izin lokasi ditolak');
        setLoading(false);
      },
      { timeout: 8000 },
    );
  };

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <Button variant={variant} size="sm" onClick={handleClick} disabled={loading} className="gap-2">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
        Dekat Saya
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
