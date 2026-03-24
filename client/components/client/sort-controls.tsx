'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'default', label: 'Relevansi' },
  { value: 'price_asc', label: 'Harga Terendah' },
  { value: 'price_desc', label: 'Harga Tertinggi' },
  { value: 'newest', label: 'Terbaru' },
];

export function SortControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get('sort') || 'default';

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    value === 'default' ? params.delete('sort') : params.set('sort', value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative">
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="appearance-none text-sm font-medium bg-transparent pr-6 pl-1 py-0.5 cursor-pointer focus:outline-none text-foreground"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
    </div>
  );
}
