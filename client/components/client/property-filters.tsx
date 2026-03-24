'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal } from 'lucide-react';

interface Props {
  initialCity?: string;
  initialMinPrice?: string;
  initialMaxPrice?: string;
  mobile?: boolean;
}

function FilterForm({ initialCity, initialMinPrice, initialMaxPrice, onApply }: {
  initialCity?: string;
  initialMinPrice?: string;
  initialMaxPrice?: string;
  onApply?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [city, setCity] = useState(initialCity || '');
  const [minPrice, setMinPrice] = useState(initialMinPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice || '');

  const apply = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    city ? params.set('city', city) : params.delete('city');
    minPrice ? params.set('minPrice', minPrice) : params.delete('minPrice');
    maxPrice ? params.set('maxPrice', maxPrice) : params.delete('maxPrice');
    router.push(`${pathname}?${params.toString()}`);
    onApply?.();
  };

  const reset = () => {
    setCity(''); setMinPrice(''); setMaxPrice('');
    router.push(pathname);
    onApply?.();
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Kota</Label>
        <Input
          placeholder="cth: Jakarta Selatan"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Harga Minimum (Rp)</Label>
        <Input
          type="number"
          placeholder="500000000"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Harga Maksimum (Rp)</Label>
        <Input
          type="number"
          placeholder="2000000000"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button className="flex-1" onClick={apply}>Terapkan</Button>
        <Button variant="outline" onClick={reset}>Reset</Button>
      </div>
    </div>
  );
}

export function PropertyFilters({ initialCity, initialMinPrice, initialMaxPrice, mobile }: Props) {
  const [open, setOpen] = useState(false);

  if (mobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Filter Properti</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterForm
              initialCity={initialCity}
              initialMinPrice={initialMinPrice}
              initialMaxPrice={initialMaxPrice}
              onApply={() => setOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Filter</CardTitle>
      </CardHeader>
      <CardContent>
        <FilterForm
          initialCity={initialCity}
          initialMinPrice={initialMinPrice}
          initialMaxPrice={initialMaxPrice}
        />
      </CardContent>
    </Card>
  );
}
