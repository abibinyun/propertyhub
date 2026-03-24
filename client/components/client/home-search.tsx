'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowRight } from 'lucide-react';

const POPULAR_CITIES = ['Jakarta', 'Surabaya', 'Bandung', 'Bali'];

export function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      const slug = query.trim().toLowerCase().replace(/\s+/g, '-');
      router.push(`/jual/${slug}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border">
        <div className="flex-1 flex items-center gap-3 px-4">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <Input
            placeholder="Cari lokasi, kota, atau area..."
            className="border-0 focus-visible:ring-0 text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button size="lg" className="rounded-xl px-8" onClick={handleSearch}>
          Cari Properti
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
        <span className="text-sm text-muted-foreground">Populer:</span>
        {POPULAR_CITIES.map((city) => (
          <Link key={city} href={`/jual/${city.toLowerCase()}`}>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">{city}</Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
