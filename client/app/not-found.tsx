import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-primary/20 mb-4">404</p>
        <h1 className="text-2xl font-bold mb-2">Halaman tidak ditemukan</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Halaman yang Anda cari tidak ada atau sudah dipindahkan.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button asChild variant="outline" className="gap-2">
            <Link href="javascript:history.back()">
              <ArrowLeft className="h-4 w-4" />Kembali
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />Beranda
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/jual">
              <Search className="h-4 w-4" />Cari Properti
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
