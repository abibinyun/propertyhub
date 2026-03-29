import Link from 'next/link';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Building2, Instagram, Facebook, Twitter, MessageCircle, Youtube } from 'lucide-react';
import { SiteSettings } from '@/lib/server/settings';

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white mb-3">
              {settings.logoUrl
                ? <Image src={settings.logoUrl} alt={settings.siteName} width={32} height={32} className="h-8 w-auto object-contain" />
                : <Building2 className="h-6 w-6 text-blue-400" />
              }
              {settings.siteName}
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              {settings.tagline}
            </p>
            <div className="flex items-center gap-3">
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                  className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                  className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {settings.twitter && (
                <a href={settings.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter"
                  className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {settings.youtube && (
                <a href={settings.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                  className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-red-600 flex items-center justify-center transition-colors">
                  <Youtube className="h-4 w-4" />
                </a>
              )}
              {settings.whatsapp && (
                <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                  className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-green-600 flex items-center justify-center transition-colors">
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
            </div>
            {(settings.email || settings.phone) && (
              <div className="mt-4 space-y-1 text-xs text-slate-400">
                {settings.email && <p>✉ {settings.email}</p>}
                {settings.phone && <p>📞 {settings.phone}</p>}
                {settings.address && <p>📍 {settings.address}</p>}
              </div>
            )}
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
          <p>© {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
          <p>Listing gratis · Jangkauan luas · Leads langsung ke Anda</p>
        </div>
      </div>
    </footer>
  );
}
