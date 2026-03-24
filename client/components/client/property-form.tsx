'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { propertiesApi } from '@/lib/api/properties';
import { Property, CreatePropertyDto, PropertyType, ListingType, Furnishing } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { BasicInfoSection } from './form-sections/basic-info';
import { LocationSection } from './form-sections/location';
import { SpecsSection } from './form-sections/specs';
import { ImageUploadSection } from './form-sections/image-upload';

interface FormState {
  title: string; description: string; propertyType: PropertyType; listingType: ListingType;
  price: string; address: string; city: string; district: string; province: string;
  postalCode: string; landArea: string; buildingArea: string; bedrooms: string;
  bathrooms: string; floors: string; certificateType: string; yearBuilt: string;
  furnishing: Furnishing; latitude?: number; longitude?: number;
}

const DEFAULT: FormState = {
  title: '', description: '', propertyType: 'HOUSE', listingType: 'SALE',
  price: '', address: '', city: '', district: '', province: '', postalCode: '',
  landArea: '', buildingArea: '', bedrooms: '', bathrooms: '', floors: '',
  certificateType: '', yearBuilt: '', furnishing: 'UNFURNISHED',
};

export function PropertyForm({ property }: { property?: Property }) {
  const router = useRouter();
  const isEdit = !!property;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormState>({
    title: property?.title ?? DEFAULT.title,
    description: property?.description ?? DEFAULT.description,
    propertyType: property?.propertyType ?? DEFAULT.propertyType,
    listingType: property?.listingType ?? DEFAULT.listingType,
    price: property?.price ?? DEFAULT.price,
    address: property?.address ?? DEFAULT.address,
    city: property?.city ?? DEFAULT.city,
    district: property?.district ?? DEFAULT.district,
    province: property?.province ?? DEFAULT.province,
    postalCode: property?.postalCode ?? DEFAULT.postalCode,
    landArea: property?.landArea?.toString() ?? DEFAULT.landArea,
    buildingArea: property?.buildingArea?.toString() ?? DEFAULT.buildingArea,
    bedrooms: property?.bedrooms?.toString() ?? DEFAULT.bedrooms,
    bathrooms: property?.bathrooms?.toString() ?? DEFAULT.bathrooms,
    floors: property?.floors?.toString() ?? DEFAULT.floors,
    certificateType: property?.certificateType ?? DEFAULT.certificateType,
    yearBuilt: property?.yearBuilt?.toString() ?? DEFAULT.yearBuilt,
    furnishing: property?.furnishing ?? DEFAULT.furnishing,
    latitude: property?.latitude,
    longitude: property?.longitude,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const payload: CreatePropertyDto = {
        ...form,
        price: parseFloat(form.price),
        landArea: form.landArea ? parseInt(form.landArea) : undefined,
        buildingArea: form.buildingArea ? parseInt(form.buildingArea) : undefined,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : undefined,
        floors: form.floors ? parseInt(form.floors) : undefined,
        yearBuilt: form.yearBuilt ? parseInt(form.yearBuilt) : undefined,
        latitude: form.latitude,
        longitude: form.longitude,
      };
      if (isEdit) await propertiesApi.update(property.slug, payload);
      else await propertiesApi.create(payload);
      router.push('/dashboard/properties');
      router.refresh();
    } catch (err: unknown) {
      const e = err as { message?: string[] | string };
      setError(Array.isArray(e?.message) ? e.message[0] : (e?.message ?? 'Gagal menyimpan'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}

      <BasicInfoSection values={form} onChange={handleChange} />
      <LocationSection
        values={form}
        onChange={handleChange}
        onCoordinatesChange={(lat, lng) => setForm((p) => ({ ...p, latitude: lat, longitude: lng }))}
      />
      <SpecsSection values={form} onChange={handleChange} />

      {isEdit && property.images && (
        <ImageUploadSection propertyId={property.id} initialImages={property.images} />
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Properti'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Batal
        </Button>
      </div>
    </form>
  );
}
