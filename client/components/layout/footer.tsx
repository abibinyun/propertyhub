import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Building2, Instagram, Facebook, Twitter, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white mb-3">
              <Building2 className="h-6 w-6 text-blue-400" />
              PropertyHub
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Platform listing properti terpercaya di Indonesia. Pasang iklan gratis, jangkau lebih banyak pembeli.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"
                className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-green-600 flex items-center justify-center transition-colors">
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Properti */}
          <div>
            <h4 className="font-semibold text-white mb-4">Cari Properti</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/jual" className="hover:text-white transition-colors">Rumah Dijual</Link></li>
              <li><Link href="/sewa" className="hover:text-white transition-colors">Rumah Disewa</Link></li>
              <li><Link href="/jual?type=APARTMENT" className="hover:text-white transition-colors">Apartemen</Link></li>
              <li><Link href="/jual?type=LAND" className="hover:text-white transition-colors">Tanah</Link></li>
              <li><Link href="/jual?type=COMMERCIAL" className="hover:text-white transition-colors">Ruko / Komersial</Link></li>
            </ul>
          </div>

          {/* Akun */}
          <div>
            <h4 className="font-semibold text-white mb-4">Akun</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/register" className="hover:text-white transition-colors">Daftar Gratis</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Masuk</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/dashboard/properties/new" className="hover:text-white transition-colors">Pasang Iklan</Link></li>
            </ul>
          </div>

          {/* Perusahaan */}
          <div>
            <h4 className="font-semibold text-white mb-4">Perusahaan</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">Tentang Kami</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Kontak</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Kebijakan Privasi</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Syarat & Ketentuan</Link></li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-slate-700" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PropertyHub. All rights reserved.</p>
          <p>Listing gratis · Jangkauan luas · Leads langsung ke Anda</p>
        </div>
      </div>
    </footer>
  );
}
