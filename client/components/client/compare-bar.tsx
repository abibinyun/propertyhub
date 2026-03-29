'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompare } from '@/lib/context/compare-context';
import { formatPrice } from '@/lib/utils';

export function CompareBar() {
  const { items, remove, clear } = useCompare();
  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border/60 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3">
      <div className="container mx-auto flex items-center gap-3">
        <p className="text-sm font-semibold shrink-0 hidden sm:block">
          Bandingkan ({items.length}/3)
        </p>
        <div className="flex-1 flex items-center gap-2 overflow-x-auto">
          {items.map(p => {
            const img = p.images?.find(i => i.isPrimary) ?? p.images?.[0];
            return (
              <div key={p.id} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-1.5 shrink-0 border border-border/60">
                {img && (
                  <div className="relative h-8 w-12 rounded-lg overflow-hidden shrink-0">
                    <Image src={img.url} alt={p.title} fill className="object-cover" sizes="48px" />
                  </div>
                )}
                <div className="min-w-0 hidden sm:block">
                  <p className="text-xs font-medium truncate max-w-[120px]">{p.title}</p>
                  <p className="text-xs text-primary">{formatPrice(p.price)}</p>
                </div>
                <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive transition-colors ml-1">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={clear} className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            Hapus semua
          </button>
          <Button asChild size="sm" className="gap-1.5" disabled={items.length < 2}>
            <Link href={`/bandingkan?ids=${items.map(p => p.slug).join(',')}`}>
              <GitCompare className="h-4 w-4" />
              Bandingkan
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
