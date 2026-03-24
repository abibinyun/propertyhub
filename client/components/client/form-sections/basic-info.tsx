'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BasicInfoProps {
  values: {
    title: string;
    description: string;
    propertyType: string;
    listingType: string;
    price: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export function BasicInfoSection({ values, onChange }: BasicInfoProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Informasi Dasar</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Judul *</Label>
          <Input id="title" name="title" value={values.title} onChange={onChange} required placeholder="Rumah Modern 3 Kamar di Jakarta" />
        </div>
        <div>
          <Label htmlFor="description">Deskripsi *</Label>
          <textarea
            id="description" name="description" value={values.description} onChange={onChange}
            required rows={4}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Deskripsi lengkap properti..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="propertyType">Tipe Properti *</Label>
            <select id="propertyType" name="propertyType" value={values.propertyType} onChange={onChange} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="HOUSE">Rumah</option>
              <option value="APARTMENT">Apartemen</option>
              <option value="LAND">Tanah</option>
              <option value="COMMERCIAL">Komersial</option>
              <option value="VILLA">Villa</option>
              <option value="WAREHOUSE">Gudang</option>
            </select>
          </div>
          <div>
            <Label htmlFor="listingType">Tipe Listing *</Label>
            <select id="listingType" name="listingType" value={values.listingType} onChange={onChange} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="SALE">Jual</option>
              <option value="RENT">Sewa</option>
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="price">Harga (Rp) *</Label>
          <Input id="price" name="price" type="number" value={values.price} onChange={onChange} required placeholder="2500000000" />
        </div>
      </CardContent>
    </Card>
  );
}
