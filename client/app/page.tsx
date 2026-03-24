import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight, Home, Building2, Trees, Store, Hotel, Warehouse,
  ShieldCheck, TrendingUp, Headphones, Star,
} from 'lucide-react';
import { propertiesApi } from '@/lib/api/properties';
import { PropertyCard } from '@/components/property/property-card';
import { HomeSearch } from '@/components/client/home-search';

const PROPERTY_TYPES = [
  { slug: 'rumah', label: 'Rumah', icon: Home, count: '2.4K+', color: 'bg-blue-50 text-blue-600' },
  { slug: 'apartemen', label: 'Apartemen', icon: Building2, count: '1.8K+', color: 'bg-violet-50 text-violet-600' },
  { slug: 'tanah', label: 'Tanah', icon: Trees, count: '980+', color: 'bg-emerald-50 text-emerald-600' },
  { slug: 'komersial', label: 'Komersial', icon: Store, count: '640+', color: 'bg-orange-50 text-orange-600' },
  { slug: 'villa', label: 'Villa', icon: Hotel, count: '320+', color: 'bg-pink-50 text-pink-600' },
  { slug: 'gudang', label: 'Gudang', icon: Warehouse, count: '210+', color: 'bg-slate-50 text-slate-600' },
];

const WHY_US = [
  { icon: ShieldCheck, title: 'Terverifikasi & Terpercaya', desc: 'Setiap listing diverifikasi tim kami. Tidak ada penipuan, tidak ada listing palsu.' },
  { icon: TrendingUp, title: 'Harga Transparan', desc: 'Harga ditampilkan jelas tanpa biaya tersembunyi. Bandingkan ribuan properti sekaligus.' },
  { icon: Headphones, title: 'Dukungan 24/7', desc: 'Tim kami siap membantu Anda menemukan properti impian kapan saja.' },
];

const TESTIMONIALS = [
  { name: 'Budi Santoso', role: 'Pembeli Rumah', text: 'Proses pencarian sangat mudah. Dalam 2 minggu saya sudah menemukan rumah impian di Jakarta Selatan.', rating: 5 },
  { name: 'Siti Rahayu', role: 'Investor Properti', text: 'Platform terbaik untuk investasi properti. Data lengkap, harga transparan, dan tim sangat responsif.', rating: 5 },
  { name: 'Ahmad Fauzi', role: 'Penjual Properti', text: 'Iklan saya terjual dalam 3 minggu. Jangkauan pembeli sangat luas dan prosesnya mudah.', rating: 5 },
];

const FEATURED_CITIES = [
  { name: 'Jakarta', slug: 'jakarta', img: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=400&q=80', count: '8.2K+' },
  { name: 'Surabaya', slug: 'surabaya', img: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&q=80', count: '3.1K+' },
  { name: 'Bandung', slug: 'bandung', img: 'https://images.unsplash.com/photo-1570521462033-3015e76e7432?w=400&q=80', count: '2.4K+' },
  { name: 'Bali', slug: 'bali', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80', count: '1.9K+' },
  { name: 'Yogyakarta', slug: 'yogyakarta', img: 'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?w=400&q=80', count: '1.2K+' },
  { name: 'Semarang', slug: 'semarang', img: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=400&q=80', count: '890+' },
];

export default async function HomePage() {
  const { data: featured, meta } = await propertiesApi.getAll({ limit: 6, page: 1 });

  return (
    <div className="flex flex-col">

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col bg-slate-900 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80"
          alt="Hero"
          fill
          className="object-cover opacity-30"
          priority
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-slate-900/95 via-slate-900/70 to-slate-900/40" />

        {/* Content */}
        <div className="relative container mx-auto px-4 pt-14 pb-24 md:pt-24 md:pb-32">
          <div className="max-w-2xl space-y-6">
            <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm text-xs">
              <TrendingUp className="h-3 w-3 mr-1.5" />
              #1 Platform Properti Indonesia
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
              Temukan Rumah<br />
              <span className="text-primary">Impian Anda</span><br />
              di Sini
            </h1>

            <p className="text-base md:text-lg text-slate-300 max-w-lg leading-relaxed">
              Lebih dari {meta.total}+ properti pilihan di seluruh Indonesia.
            </p>

            <HomeSearch />
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative bg-white/5 backdrop-blur-md border-t border-white/10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 divide-x divide-white/10">
              {[
                { value: `${meta.total}+`, label: 'Properti' },
                { value: '50+', label: 'Kota' },
                { value: '10K+', label: 'Pengguna' },
              ].map((stat) => (
                <div key={stat.label} className="py-3 md:py-4 px-3 md:px-6 text-center">
                  <div className="text-xl md:text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROPERTY TYPES ───────────────────────────────────────────── */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-6 md:mb-10">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Kategori</p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Cari Berdasarkan Tipe</h2>
            </div>
            <Link href="/jual" className="text-sm font-medium text-primary hover:underline flex items-center gap-1 flex-shrink-0">
              Semua <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {PROPERTY_TYPES.map((type) => (
              <Link key={type.slug} href={`/jual/${type.slug}`}>
                <div className="group flex flex-col items-center gap-2 md:gap-3 p-3 md:p-5 rounded-xl md:rounded-2xl border border-border/60 hover:border-primary/30 hover:shadow-lg transition-all duration-200 cursor-pointer bg-white">
                  <div className={`flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl ${type.color} group-hover:scale-110 transition-transform duration-200`}>
                    <type.icon className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-xs md:text-sm">{type.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 hidden md:block">{type.count}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PROPERTIES ──────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-12 md:py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-6 md:mb-10">
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Terbaru</p>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Properti Pilihan</h2>
              </div>
              <Link href="/jual">
                <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs md:text-sm">
                  Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {/* Mobile: horizontal scroll, Desktop: grid */}
            <div className="md:hidden flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-2 -mx-4 px-4">
              {featured.map((property) => (
                <div key={property.id} className="flex-shrink-0 w-72">
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── WHY US ───────────────────────────────────────────────────── */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Keunggulan</p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Mengapa Memilih PropertyHub?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {WHY_US.map((item) => (
              <div key={item.title} className="flex gap-4 md:flex-col md:gap-4 p-5 md:p-8 rounded-2xl bg-slate-50 border border-border/40">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-base md:text-lg mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED CITIES ──────────────────────────────────────────── */}
      <section className="py-12 md:py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-6 md:mb-10">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Lokasi</p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Properti per Kota</h2>
            </div>
            <Link href="/jual" className="text-sm font-medium text-primary hover:underline flex items-center gap-1 flex-shrink-0">
              Semua <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile: 2 col, Desktop: 6 col */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {FEATURED_CITIES.map((city) => (
              <Link key={city.slug} href={`/jual/${city.slug}`}>
                <div className="group relative rounded-xl md:rounded-2xl overflow-hidden aspect-[4/5] md:aspect-[3/4] cursor-pointer">
                  <Image
                    src={city.img}
                    alt={city.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 md:p-3">
                    <p className="text-white font-bold text-sm">{city.name}</p>
                    <p className="text-white/70 text-xs">{city.count}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────────────────────── */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Testimoni</p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Kata Mereka</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="flex flex-col gap-3 p-5 md:p-6 rounded-2xl bg-slate-50 border border-border/60">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-5">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Siap Pasang Iklan<br />Properti Anda?
            </h2>
            <p className="text-slate-400 text-base md:text-lg">
              Bergabung dengan ribuan penjual. Gratis, mudah, dan jangkauan luas.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full px-8 h-12 font-semibold rounded-xl">
                  Mulai Gratis <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/jual" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full px-8 h-12 rounded-xl border-white/20 text-white hover:bg-white/10 hover:text-white">
                  Jelajahi Properti
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
