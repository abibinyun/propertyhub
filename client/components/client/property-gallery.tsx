'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Grid2x2, Expand } from 'lucide-react';
import { PropertyImage } from '@/types/property';
import { cn } from '@/lib/utils';

interface Props {
  images: PropertyImage[];
  title: string;
}

export function PropertyGallery({ images, title }: Props) {
  const sorted = [...images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0) || a.order - b.order);
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = useCallback(() => setCurrent((c) => (c - 1 + sorted.length) % sorted.length), [sorted.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % sorted.length), [sorted.length]);

  const thumbs = sorted.slice(0, 5);
  const remaining = sorted.length - 5;

  return (
    <>
      {/* Gallery Grid */}
      <div className="relative grid grid-cols-4 grid-rows-2 gap-2 h-[320px] md:h-[480px] rounded-2xl overflow-hidden">
        {/* Main image */}
        <div
          className="col-span-4 md:col-span-2 row-span-2 relative cursor-pointer group"
          onClick={() => setLightbox(true)}
        >
          <Image src={sorted[0]?.url || '/placeholder-property.jpg'} alt={title} fill className="object-cover group-hover:brightness-95 transition-all" priority sizes="(max-width: 768px) 100vw, 50vw" />
        </div>

        {/* Thumbnails — desktop only */}
        {thumbs.slice(1).map((img, i) => (
          <div
            key={img.id}
            className="hidden md:block relative cursor-pointer group"
            onClick={() => { setCurrent(i + 1); setLightbox(true); }}
          >
            <Image src={img.url} alt="" fill className="object-cover group-hover:brightness-95 transition-all" sizes="25vw" />
            {/* "Lihat semua" overlay on last thumb */}
            {i === 3 && remaining > 0 && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white gap-1">
                <Grid2x2 className="h-5 w-5" />
                <span className="text-sm font-semibold">+{remaining} foto</span>
              </div>
            )}
          </div>
        ))}

        {/* Mobile: show all button */}
        <button
          onClick={() => setLightbox(true)}
          className="md:hidden absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow"
        >
          <Grid2x2 className="h-3.5 w-3.5" />
          {sorted.length} Foto
        </button>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 text-white flex-shrink-0">
            <span className="text-sm font-medium opacity-70">{current + 1} / {sorted.length}</span>
            <button onClick={() => setLightbox(false)} className="h-9 w-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Main image */}
          <div className="flex-1 relative flex items-center justify-center px-12">
            <Image src={sorted[current]?.url || ''} alt={title} fill className="object-contain" sizes="100vw" />
            <button onClick={prev} className="absolute left-2 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={next} className="absolute right-2 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Thumbnails strip */}
          <div className="flex gap-2 px-4 py-3 overflow-x-auto flex-shrink-0">
            {sorted.map((img, i) => (
              <button key={img.id} onClick={() => setCurrent(i)} className={cn('relative h-14 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all', current === i ? 'border-white' : 'border-transparent opacity-50 hover:opacity-80')}>
                <Image src={img.url} alt="" fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
