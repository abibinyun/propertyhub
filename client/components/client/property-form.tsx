'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { propertiesApi } from '@/lib/api/properties';
import { Property, CreatePropertyDto, PropertyType, ListingType, Furnishing } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Info } from 'lucide-react';
import { LocationSection } from './form-sections/location';
import { ImageUploadSection } from './form-sections/image-upload';
import { cn, formatPrice } from '@/lib/utils';

interface FormState {
  title: string; description: string; propertyType: PropertyType; listingType: ListingType;
  price: string; address: string; city: string; district: string; province: string;
  postalCode: string; landArea: string; buildingArea: string; bedrooms: string;
  bathrooms: string; floors: string; garage: string; certificateType: string; yearBuilt: string;
  furnishing: Furnishing; latitude?: number; longitude?: number;
}

const DEFAULT: FormState = {
  title: '', description: '', propertyType: 'HOUSE', listingType: 'SALE',
  price: '', address: '', city: '', district: '', province: '', postalCode: '',
  landArea: '', buildingArea: '', bedrooms: '', bathrooms: '', floors: '', garage: '',
  certificateType: '', yearBuilt: '', furnishing: 'UNFURNISHED',
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-border/60 overflow-hidden">
      <div className="px-6 py-4 border-b border-border/50">
        <h2 className="font-semibold text-sm">{title}</h2>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function FormField({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground flex items-center gap-1"><Info className="h-3 w-3" />{hint}</p>}
    </div>
  );
}

const selectClass = "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function PropertyForm({ property }: { property?: Property }) {
  const router = useRouter();
  const isEdit = !!property;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdId, setCreatedId] = useState<string | null>(property?.id ?? null);
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
    garage: property?.garage?.toString() ?? DEFAULT.garage,
    certificateType: property?.certificateType ?? DEFAULT.certificateType,
    yearBuilt: property?.yearBuilt?.toString() ?? DEFAULT.yearBuilt,
    furnishing: property?.furnishing ?? DEFAULT.furnishing,
    latitude: property?.latitude,
    longitude: property?.longitude,
  });

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

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
        garage: form.garage ? parseInt(form.garage) : undefined,
        yearBuilt: form.yearBuilt ? parseInt(form.yearBuilt) : undefined,
        latitude: form.latitude,
        longitude: form.longitude,
      };
      if (isEdit) {
        await propertiesApi.update(property.slug, payload);
        router.push('/dashboard/properties');
        router.refresh();
      } else {
        const created = await propertiesApi.create(payload);
        setCreatedId(created.id);
        // Tidak redirect dulu — tampilkan image upload
      }
    } catch (err: unknown) {
      const e = err as { message?: string[] | string };
      setError(Array.isArray(e?.message) ? e.message[0] : (e?.message ?? 'Gagal menyimpan'));
    } finally {
      setLoading(false);
    }
  };

  // Setelah create berhasil — tampilkan image upload
  if (createdId && !isEdit) {
    return (
      <div className="space-y-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Properti berhasil disimpan!</p>
            <p className="text-xs text-emerald-600">Sekarang tambahkan foto properti Anda</p>
          </div>
        </div>

        <ImageUploadSection propertyId={createdId} initialImages={[]} />

        <div className="flex gap-3">
          <Button onClick={() => { router.push('/dashboard/properties'); router.refresh(); }} className="flex-1 rounded-xl">
            Selesai
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard/properties')} className="rounded-xl">
            Lewati
          </Button>
        </div>
      </div>
    );
  }

  const priceNum = parseFloat(form.price);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-xl border border-destructive/20">{error}</div>}

      {/* Informasi Dasar */}
      <SectionCard title="Informasi Dasar">
        <FormField label="Judul Iklan" required hint="Judul yang menarik meningkatkan peluang dilihat">
          <Input name="title" value={form.title} onChange={set} required placeholder="Rumah Modern 3 Kamar di Kebayoran Baru" className="rounded-xl" />
        </FormField>
        <FormField label="Deskripsi" required>
          <textarea
            name="description" value={form.description} onChange={set} required rows={4}
            placeholder="Deskripsikan properti Anda secara lengkap — lokasi, kondisi, fasilitas sekitar..."
            className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Tipe Properti" required>
            <select name="propertyType" value={form.propertyType} onChange={set} required className={selectClass}>
              <option value="HOUSE">Rumah</option>
              <option value="APARTMENT">Apartemen</option>
              <option value="LAND">Tanah</option>
              <option value="COMMERCIAL">Komersial / Ruko</option>
              <option value="VILLA">Villa</option>
              <option value="WAREHOUSE">Gudang</option>
            </select>
          </FormField>
          <FormField label="Dijual / Disewa" required>
            <select name="listingType" value={form.listingType} onChange={set} required className={selectClass}>
              <option value="SALE">Dijual</option>
              <option value="RENT">Disewa</option>
            </select>
          </FormField>
        </div>
        <FormField label={form.listingType === 'RENT' ? 'Harga Sewa / Bulan (Rp)' : 'Harga Jual (Rp)'} required>
          <Input name="price" type="number" value={form.price} onChange={set} required placeholder="2500000000" className="rounded-xl" />
          {priceNum > 0 && (
            <p className="text-xs text-primary font-medium mt-1">{formatPrice(String(priceNum))}</p>
          )}
        </FormField>
      </SectionCard>

      {/* Lokasi */}
      <div className="bg-white rounded-2xl border border-border/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50">
          <h2 className="font-semibold text-sm">Lokasi</h2>
        </div>
        <div className="p-6">
          <LocationSection
            values={form}
            onChange={set}
            onCoordinatesChange={(lat, lng) => setForm((p) => ({ ...p, latitude: lat, longitude: lng }))}
          />
        </div>
      </div>

      {/* Spesifikasi */}
      <SectionCard title="Spesifikasi">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Luas Tanah (m²)">
            <Input name="landArea" type="number" value={form.landArea} onChange={set} placeholder="150" className="rounded-xl" />
          </FormField>
          <FormField label="Luas Bangunan (m²)">
            <Input name="buildingArea" type="number" value={form.buildingArea} onChange={set} placeholder="120" className="rounded-xl" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <FormField label="Kamar Tidur">
            <Input name="bedrooms" type="number" value={form.bedrooms} onChange={set} placeholder="3" className="rounded-xl" />
          </FormField>
          <FormField label="Kamar Mandi">
            <Input name="bathrooms" type="number" value={form.bathrooms} onChange={set} placeholder="2" className="rounded-xl" />
          </FormField>
          <FormField label="Lantai">
            <Input name="floors" type="number" value={form.floors} onChange={set} placeholder="2" className="rounded-xl" />
          </FormField>
          <FormField label="Garasi">
            <Input name="garage" type="number" value={form.garage} onChange={set} placeholder="1" className="rounded-xl" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Sertifikat">
            <select name="certificateType" value={form.certificateType} onChange={set} className={selectClass}>
              <option value="">Pilih sertifikat</option>
              <option value="SHM">SHM (Sertifikat Hak Milik)</option>
              <option value="SHGB">SHGB (Hak Guna Bangunan)</option>
              <option value="HGB">HGB</option>
              <option value="GIRIK">Girik</option>
              <option value="STRATA_TITLE">Strata Title</option>
            </select>
          </FormField>
          <FormField label="Tahun Dibangun">
            <Input name="yearBuilt" type="number" value={form.yearBuilt} onChange={set} placeholder="2020" className="rounded-xl" />
          </FormField>
        </div>
        <FormField label="Kondisi Furnitur">
          <select name="furnishing" value={form.furnishing} onChange={set} className={selectClass}>
            <option value="UNFURNISHED">Tidak Furnished</option>
            <option value="SEMI_FURNISHED">Semi Furnished</option>
            <option value="FULLY_FURNISHED">Fully Furnished</option>
          </select>
        </FormField>
      </SectionCard>

      {/* Image upload untuk edit */}
      {isEdit && property.images && (
        <div className="bg-white rounded-2xl border border-border/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50">
            <h2 className="font-semibold text-sm">Foto Properti</h2>
          </div>
          <div className="p-6">
            <ImageUploadSection propertyId={property.id} initialImages={property.images} />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="flex-1 rounded-xl font-semibold">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Lanjut ke Upload Foto →'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading} className="rounded-xl">
          Batal
        </Button>
      </div>
    </form>
  );
}
