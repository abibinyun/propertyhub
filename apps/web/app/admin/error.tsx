'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
        <h2 className="font-bold mb-1">Gagal memuat halaman admin</h2>
        <p className="text-sm text-muted-foreground mb-4">Terjadi kesalahan saat mengambil data.</p>
        <Button onClick={reset} variant="outline" size="sm" className="gap-2">
          <RotateCcw className="h-4 w-4" />Coba Lagi
        </Button>
      </div>
    </div>
  );
}
