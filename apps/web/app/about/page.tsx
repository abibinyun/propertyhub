import type { Metadata } from 'next';
import { Building2, Target, Users, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tentang Kami',
  description: 'PropertyHub adalah platform listing properti terpercaya di Indonesia. Pasang iklan gratis, jangkau lebih banyak pembeli.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Tentang PropertyHub</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Platform listing properti terpercaya di Indonesia. Kami hadir untuk memudahkan proses jual, beli, dan sewa properti bagi semua orang.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl space-y-10">
        {/* Misi */}
        <div className="bg-white rounded-2xl border p-6 space-y-3">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Misi Kami</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Memberikan platform yang adil dan terbuka bagi semua orang untuk memasarkan properti mereka tanpa biaya listing. Kami percaya bahwa setiap orang berhak mendapatkan akses ke pasar properti yang luas tanpa hambatan biaya.
          </p>
        </div>

        {/* Model Bisnis */}
        <div className="bg-white rounded-2xl border p-6 space-y-3">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Model Bisnis</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Listing properti di PropertyHub sepenuhnya <strong>gratis</strong>. Kami menghasilkan pendapatan melalui layanan promosi berbayar (Featured Listing) yang membantu properti Anda tampil lebih menonjol di hasil pencarian.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { tier: 'Basic', price: 'Rp 50rb/minggu', desc: 'Top pencarian' },
              { tier: 'Premium', price: 'Rp 100rb/minggu', desc: 'Homepage + badge' },
              { tier: 'Ultimate', price: 'Rp 200rb/bulan', desc: 'Posisi teratas' },
            ].map((t) => (
              <div key={t.tier} className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="font-semibold text-sm">{t.tier}</p>
                <p className="text-xs text-primary font-medium">{t.price}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Komitmen */}
        <div className="bg-white rounded-2xl border p-6 space-y-3">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Komitmen Kami</h2>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              'Listing properti gratis tanpa batas',
              'Data pengguna dijaga kerahasiaannya',
              'Sistem moderasi untuk menjaga kualitas listing',
              'Leads langsung diteruskan ke pemilik properti',
              'Platform terus dikembangkan berdasarkan feedback pengguna',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
