import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Building2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <Building2 className="h-6 w-6" />
              PropertyHub
            </Link>
            <p className="text-sm text-muted-foreground">
              Platform listing properti terpercaya di Indonesia
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Properti</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/jual" className="text-muted-foreground hover:text-foreground">
                  Jual
                </Link>
              </li>
              <li>
                <Link href="/sewa" className="text-muted-foreground hover:text-foreground">
                  Sewa
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Perusahaan</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privasi
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Syarat & Ketentuan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} PropertyHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
