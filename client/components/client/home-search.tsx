'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Home, Building2, Trees, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { label: 'Beli', value: 'jual' },
  { label: 'Sewa', value: 'sewa' },
];

const POPULAR = [
  { label: 'Jakarta', icon: MapPin },
  { label: 'Surabaya', icon: MapPin },
  { label: 'Bandung', icon: MapPin },
  { label: 'Bali', icon: MapPin },
  { label: 'Yogyakarta', icon: MapPin },
];

const QUICK_TYPES = [
  { label: 'Rumah', icon: Home, slug: 'rumah' },
  { label: 'Apartemen', icon: Building2, slug: 'apartemen' },
  { label: 'Tanah', icon: Trees, slug: 'tanah' },
  { label: 'Komersial', icon: Store, slug: 'komersial' },
];

const PRICE_RANGES = [
  { label: '< 500 Jt', query: '?maxPrice=500000000' },
  { label: '500 Jt – 1 M', query: '?minPrice=500000000&maxPrice=1000000000' },
  { label: '1 M – 2 M', query: '?minPrice=1000000000&maxPrice=2000000000' },
  { label: '2 M – 5 M', query: '?minPrice=2000000000&maxPrice=5000000000' },
  { label: '> 5 M', query: '?minPrice=5000000000' },
];

export function HomeSearch() {
  const router = useRouter();
  const [tab, setTab] = useState('jual');
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    const slug = query.trim().toLowerCase().replace(/\s+/g, '-');
    router.push(slug ? `/${tab}/${slug}` : `/${tab}`);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'px-4 md:px-5 py-2 rounded-t-lg text-sm font-semibold transition-colors',
              tab === t.value
                ? 'bg-white text-foreground shadow-sm'
                : 'bg-white/50 text-muted-foreground hover:bg-white/70',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search box */}
      <div className="flex items-center bg-white rounded-b-2xl rounded-tr-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
        <div className="flex-1 flex items-center gap-2 md:gap-3 px-3 md:px-5 py-1">
          <Search className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
          <input
            className="flex-1 py-3 text-sm md:text-base bg-transparent outline-none placeholder:text-muted-foreground"
            placeholder="Cari kota atau area..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="p-1.5 md:p-2">
          <Button size="sm" className="px-4 md:px-8 h-10 md:h-11 rounded-xl font-semibold" onClick={handleSearch}>
            Cari
          </Button>
        </div>
      </div>

      {/* Quick filters — scrollable on mobile */}
      <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <span className="text-xs text-white/70 whitespace-nowrap flex-shrink-0">Populer:</span>
        {POPULAR.map((city) => (
          <button
            key={city.label}
            onClick={() => router.push(`/${tab}/${city.label.toLowerCase()}`)}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs transition-colors backdrop-blur-sm border border-white/20"
          >
            <city.icon className="h-3 w-3" />
            {city.label}
          </button>
        ))}
        <span className="text-white/30 flex-shrink-0">|</span>
        {QUICK_TYPES.map((type) => (
          <button
            key={type.slug}
            onClick={() => router.push(`/${tab}/${type.slug}`)}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/80 text-xs transition-colors border border-white/10"
          >
            <type.icon className="h-3 w-3" />
            {type.label}
          </button>
        ))}
      </div>

      {/* Price range */}
      <div className="flex items-center gap-2 mt-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <span className="text-xs text-white/70 whitespace-nowrap flex-shrink-0">Harga:</span>
        {PRICE_RANGES.map((r) => (
          <button
            key={r.label}
            onClick={() => router.push(`/${tab}${r.query}`)}
            className="flex-shrink-0 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/80 text-xs transition-colors border border-white/10 whitespace-nowrap"
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
