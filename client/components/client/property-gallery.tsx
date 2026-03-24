'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PropertyImage } from '@/types/property';

interface Props {
  images: PropertyImage[];
  title: string;
}

export function PropertyGallery({ images, title }: Props) {
  const [current, setCurrent] = useState(0);
  const primaryIndex = images.findIndex((img) => img.isPrimary);
  const displayIndex = current === 0 && primaryIndex > 0 ? primaryIndex : current;
  const src = images[displayIndex]?.url || '/placeholder-property.jpg';

  return (
    <div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg mb-4">
        <Image src={src} alt={title} fill className="object-cover" priority />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setCurrent(i)}
              className={`relative aspect-video overflow-hidden rounded border-2 ${
                displayIndex === i ? 'border-primary' : 'border-transparent'
              }`}
            >
              <Image src={img.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
