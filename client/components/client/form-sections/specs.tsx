'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SpecsProps {
  values: {
    landArea: string; buildingArea: string; bedrooms: string;
    bathrooms: string; floors: string; certificateType: string;
    yearBuilt: string; furnishing: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function SpecsSection({ values, onChange }: SpecsProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Spesifikasi</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="landArea">Luas Tanah (m²)</Label>
            <Input id="landArea" name="landArea" type="number" value={values.landArea} onChange={onChange} placeholder="150" />
          </div>
          <div>
            <Label htmlFor="buildingArea">Luas Bangunan (m²)</Label>
            <Input id="buildingArea" name="buildingArea" type="number" value={values.buildingArea} onChange={onChange} placeholder="120" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="bedrooms">Kamar Tidur</Label>
            <Input id="bedrooms" name="bedrooms" type="number" value={values.bedrooms} onChange={onChange} placeholder="3" />
          </div>
          <div>
            <Label htmlFor="bathrooms">Kamar Mandi</Label>
            <Input id="bathrooms" name="bathrooms" type="number" value={values.bathrooms} onChange={onChange} placeholder="2" />
          </div>
          <div>
            <Label htmlFor="floors">Lantai</Label>
            <Input id="floors" name="floors" type="number" value={values.floors} onChange={onChange} placeholder="2" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="certificateType">Sertifikat</Label>
            <Input id="certificateType" name="certificateType" value={values.certificateType} onChange={onChange} placeholder="SHM" />
          </div>
          <div>
            <Label htmlFor="yearBuilt">Tahun Dibangun</Label>
            <Input id="yearBuilt" name="yearBuilt" type="number" value={values.yearBuilt} onChange={onChange} placeholder="2023" />
          </div>
        </div>
        <div>
          <Label htmlFor="furnishing">Kondisi</Label>
          <select id="furnishing" name="furnishing" value={values.furnishing} onChange={onChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="UNFURNISHED">Unfurnished</option>
            <option value="SEMI_FURNISHED">Semi Furnished</option>
            <option value="FULLY_FURNISHED">Fully Furnished</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
