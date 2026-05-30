'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold mb-2">Properti tidak ditemukan</h2>
      <p className="text-muted-foreground mb-6">Properti yang Anda cari tidak ada atau sudah dihapus.</p>
      <Button asChild><Link href="/jual">Lihat Properti Lainnya</Link></Button>
    </div>
  );
}
