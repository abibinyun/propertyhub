'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PropertyMapPicker } from '@/components/client/property-map-picker';

interface LocationProps {
  values: {
    address: string;
    city: string;
    district: string;
    province: string;
    postalCode: string;
    latitude?: number | string;
    longitude?: number | string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoordinatesChange: (lat: number, lng: number) => void;
}

export function LocationSection({ values, onChange, onCoordinatesChange }: LocationProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Lokasi</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="address">Alamat *</Label>
          <Input id="address" name="address" value={values.address} onChange={onChange} required placeholder="Jl. Sudirman No. 123" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">Kota *</Label>
            <Input id="city" name="city" value={values.city} onChange={onChange} required placeholder="Jakarta Selatan" />
          </div>
          <div>
            <Label htmlFor="district">Kecamatan *</Label>
            <Input id="district" name="district" value={values.district} onChange={onChange} required placeholder="Kebayoran Baru" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="province">Provinsi *</Label>
            <Input id="province" name="province" value={values.province} onChange={onChange} required placeholder="DKI Jakarta" />
          </div>
          <div>
            <Label htmlFor="postalCode">Kode Pos</Label>
            <Input id="postalCode" name="postalCode" value={values.postalCode} onChange={onChange} placeholder="12190" />
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Pin Lokasi di Peta</Label>
          <PropertyMapPicker
            lat={values.latitude}
            lng={values.longitude}
            onChange={onCoordinatesChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
