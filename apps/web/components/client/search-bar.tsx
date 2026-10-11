'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Home, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getKotaList, searchKota } from '@/lib/wilayah';

const TYPES = [
  { label: 'Rumah', slug: 'rumah' },
  { label: 'Apartemen', slug: 'apartemen' },
  { label: 'Tanah', slug: 'tanah' },
  { label: 'Ruko / Komersial', slug: 'komersial' },
  { label: 'Villa', slug: 'villa' },
  { label: 'Gudang', slug: 'gudang' },
];

interface Suggestion {
  type: 'city' | 'property';
  label: string;
  href: string;
}

interface Props {
  onClose?: () => void;
  autoFocus?: boolean;
  className?: string;
}

export function SearchBar({ onClose, autoFocus, className }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [kotaList, setKotaList] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load wilayah data once
  useEffect(() => {
    getKotaList()
      .then(setKotaList)
      .catch((err: unknown) => console.warn('Failed to load kota list:', err));
  }, []);

  useEffect(() => {
    if (autoFocus) setTimeout(() => inputRef.current?.focus(), 50);
  }, [autoFocus]);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const lower = query.toLowerCase();

    const cities: Suggestion[] = searchKota(kotaList, query, 5).map((c) => ({
      type: 'city',
      label: c,
      href: `/jual/${c.toLowerCase().replace(/\s+/g, '-')}`,
    }));

    const types: Suggestion[] = TYPES
      .filter((t) => t.label.toLowerCase().includes(lower))
      .slice(0, 3)
      .map((t) => ({ type: 'property', label: t.label, href: `/jual/${t.slug}` }));

    return [...cities, ...types].slice(0, 7);
  }, [query, kotaList]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navigate = (href: string) => {
    router.push(href);
    setQuery('');
    setOpen(false);
    onClose?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIdx >= 0 && suggestions[activeIdx]) {
      navigate(suggestions[activeIdx].href);
      return;
    }
    if (!query.trim()) return;
    const slug = query.trim().toLowerCase().replace(/\s+/g, '-');
    navigate(`/jual/${slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, -1)); }
    if (e.key === 'Escape') { setOpen(false); onClose?.(); }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Cari kota, area, tipe properti..."
            className="pl-9 h-9 text-sm"
            autoComplete="off"
          />
        </div>
        <Button type="submit" size="sm">Cari</Button>
        {onClose && (
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border shadow-lg z-50 overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={s.href}
              type="button"
              onClick={() => navigate(s.href)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors',
                i === activeIdx && 'bg-slate-50',
              )}
            >
              {s.type === 'city'
                ? <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                : <Home className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              }
              <span>{s.label}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {s.type === 'city' ? 'Kota / Kabupaten' : 'Tipe Properti'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
