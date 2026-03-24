'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRICE_PRESETS = [
  { label: '< 500 Jt', min: '', max: '500000000' },
  { label: '500 Jt – 1 M', min: '500000000', max: '1000000000' },
  { label: '1 M – 2 M', min: '1000000000', max: '2000000000' },
  { label: '2 M – 5 M', min: '2000000000', max: '5000000000' },
  { label: '> 5 M', min: '5000000000', max: '' },
];

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-sm font-semibold hover:text-primary transition-colors"
      >
        {title}
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

function FilterForm({ initialMinPrice, initialMaxPrice, initialBedrooms, initialMinArea, initialCertificate, initialFurnishing, onApply }: {
  initialMinPrice?: string;
  initialMaxPrice?: string;
  initialBedrooms?: string;
  initialMinArea?: string;
  initialCertificate?: string;
  initialFurnishing?: string;
  onApply?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(initialMinPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice || '');
  const [bedrooms, setBedrooms] = useState(initialBedrooms || '');
  const [minArea, setMinArea] = useState(initialMinArea || '');
  const [certificate, setCertificate] = useState(initialCertificate || '');
  const [furnishing, setFurnishing] = useState(initialFurnishing || '');
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const hasFilters = minPrice || maxPrice || bedrooms || minArea || certificate || furnishing;

  const apply = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    minPrice ? params.set('minPrice', minPrice) : params.delete('minPrice');
    maxPrice ? params.set('maxPrice', maxPrice) : params.delete('maxPrice');
    bedrooms ? params.set('bedrooms', bedrooms) : params.delete('bedrooms');
    minArea ? params.set('minArea', minArea) : params.delete('minArea');
    certificate ? params.set('certificate', certificate) : params.delete('certificate');
    furnishing ? params.set('furnishing', furnishing) : params.delete('furnishing');
    router.push(`${pathname}?${params.toString()}`);
    onApply?.();
  };

  const reset = () => {
    setMinPrice(''); setMaxPrice(''); setBedrooms(''); setMinArea(''); setCertificate(''); setFurnishing(''); setActivePreset(null);
    router.push(pathname);
    onApply?.();
  };

  const applyPreset = (preset: typeof PRICE_PRESETS[0]) => {
    setMinPrice(preset.min); setMaxPrice(preset.max); setActivePreset(preset.label);
  };

  return (
    <div className="space-y-0">
      <FilterSection title="Kamar Tidur">
        <div className="flex gap-2 flex-wrap">
          {['', '1', '2', '3', '4'].map((val) => (
            <button key={val} onClick={() => setBedrooms(val)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors min-w-[40px]',
                bedrooms === val ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary hover:text-primary')}>
              {val === '' ? 'Semua' : val === '4' ? '4+' : val}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Rentang Harga">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {PRICE_PRESETS.map((p) => (
              <button key={p.label} onClick={() => applyPreset(p)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                  activePreset === p.label ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary hover:text-primary')}>
                {p.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Min (Rp)</Label>
              <Input type="number" placeholder="0" value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setActivePreset(null); }} className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Max (Rp)</Label>
              <Input type="number" placeholder="∞" value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setActivePreset(null); }} className="h-9 text-sm" />
            </div>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Luas Tanah (m²)" defaultOpen={false}>
        <Input type="number" placeholder="Min. luas tanah" value={minArea}
          onChange={(e) => setMinArea(e.target.value)} className="h-9 text-sm" />
      </FilterSection>

      <FilterSection title="Sertifikat" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {['', 'SHM', 'SHGB', 'HGB', 'GIRIK'].map((val) => (
            <button key={val} onClick={() => setCertificate(val)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                certificate === val ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary hover:text-primary')}>
              {val === '' ? 'Semua' : val}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Kondisi" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {[
            { val: '', label: 'Semua' },
            { val: 'UNFURNISHED', label: 'Unfurnished' },
            { val: 'SEMI_FURNISHED', label: 'Semi' },
            { val: 'FULLY_FURNISHED', label: 'Furnished' },
          ].map((item) => (
            <button key={item.val} onClick={() => setFurnishing(item.val)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                furnishing === item.val ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary hover:text-primary')}>
              {item.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <div className="pt-4 flex gap-2">
        <Button className="flex-1 h-10 font-semibold" onClick={apply}>Terapkan Filter</Button>
        {hasFilters && (
          <Button variant="outline" size="icon" className="h-10 w-10 flex-shrink-0" onClick={reset}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function PropertyFilters({ initialMinPrice, initialMaxPrice, initialBedrooms, initialMinArea, initialCertificate, initialFurnishing, mobile }: {
  initialMinPrice?: string;
  initialMaxPrice?: string;
  initialBedrooms?: string;
  initialMinArea?: string;
  initialCertificate?: string;
  initialFurnishing?: string;
  mobile?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hasFilters = initialMinPrice || initialMaxPrice || initialBedrooms || initialMinArea || initialCertificate || initialFurnishing;

  if (mobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className={cn('gap-2 rounded-xl', hasFilters && 'border-primary text-primary')}>
            <SlidersHorizontal className="h-4 w-4" />
            Filter
            {hasFilters && <span className="h-2 w-2 rounded-full bg-primary" />}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 overflow-y-auto" aria-describedby={undefined}>
          <SheetHeader>
            <SheetTitle>Filter Properti</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterForm initialMinPrice={initialMinPrice} initialMaxPrice={initialMaxPrice}
              initialBedrooms={initialBedrooms} initialMinArea={initialMinArea}
              initialCertificate={initialCertificate} initialFurnishing={initialFurnishing}
              onApply={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border/60 overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Filter</span>
        </div>
        {hasFilters && <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">Aktif</span>}
      </div>
      <div className="px-5">
        <FilterForm initialMinPrice={initialMinPrice} initialMaxPrice={initialMaxPrice}
          initialBedrooms={initialBedrooms} initialMinArea={initialMinArea}
          initialCertificate={initialCertificate} initialFurnishing={initialFurnishing} />
      </div>
    </div>
  );
}
