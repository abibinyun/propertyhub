import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { propertiesApi } from '@/lib/api/properties';
import { PropertyCard } from '@/components/property/property-card';
import { HomeSearch } from '@/components/client/home-search';

const PROPERTY_TYPES = [
  { type: 'rumah', title: 'Rumah' },
  { type: 'apartemen', title: 'Apartemen' },
  { type: 'tanah', title: 'Tanah' },
  { type: 'komersial', title: 'Komersial' },
];

export default async function HomePage() {
  const { data: featured, meta } = await propertiesApi.getAll({ limit: 6, page: 1 });

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium">
              <TrendingUp className="w-3 h-3 mr-1.5" />
              Platform Properti Terpercaya #1 di Indonesia
            </Badge>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                Temukan Properti
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Impian Anda
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                Ribuan pilihan rumah, apartemen, dan properti komersial dengan sistem pencarian terbaik
              </p>
            </div>

            <HomeSearch />

            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8">
              <div>
                <div className="text-3xl md:text-4xl font-bold">{meta.total}+</div>
                <div className="text-sm text-muted-foreground">Properti</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold">50+</div>
                <div className="text-sm text-muted-foreground">Kota</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold">5K+</div>
                <div className="text-sm text-muted-foreground">Pengguna</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      {featured.length > 0 && (
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Properti Terbaru</h2>
                <p className="text-lg text-muted-foreground">Listing terbaru yang baru ditambahkan</p>
              </div>
              <Link href="/jual">
                <Button variant="outline" className="gap-2">
                  Lihat Semua <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Property Types */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Jelajahi Berdasarkan Tipe</h2>
            <p className="text-lg text-muted-foreground">Temukan properti sesuai kebutuhan Anda</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {PROPERTY_TYPES.map((item) => (
              <Link key={item.type} href={`/jual/${item.type}`}>
                <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary cursor-pointer">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                      Lihat Semua <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold">Siap Memasarkan Properti Anda?</h2>
            <p className="text-xl text-blue-100">
              Bergabunglah dengan ribuan penjual yang telah mempercayai PropertyHub
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="text-lg px-8 h-12">
                  Daftar Gratis <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/jual">
                <Button size="lg" variant="outline" className="text-lg px-8 h-12 bg-white/10 hover:bg-white/20 text-white border-white/30">
                  Lihat Properti
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
