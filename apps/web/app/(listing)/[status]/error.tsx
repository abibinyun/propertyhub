'use client';

import { Button } from '@/components/ui/button';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold mb-2">Gagal memuat properti</h2>
      <p className="text-muted-foreground mb-6">Terjadi kesalahan saat mengambil data.</p>
      <Button onClick={reset}>Coba Lagi</Button>
    </div>
  );
}
