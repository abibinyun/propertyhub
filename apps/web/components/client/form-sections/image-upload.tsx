'use client';

import { useState } from 'react';
import Image from 'next/image';
import { propertiesApi } from '@/lib/api/properties';
import { PropertyImage } from '@/types/property';
import { Loader2, Upload, X, Star } from 'lucide-react';

interface Props {
  propertyId: string;
  initialImages: PropertyImage[];
  onCountChange?: (count: number) => void;
}

export function ImageUploadSection({ propertyId, initialImages, onCountChange }: Props) {
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const updateImages = (next: PropertyImage[]) => {
    setImages(next);
    onCountChange?.(next.length);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true); setError('');
    try {
      const newImage = await propertiesApi.uploadImage(propertyId, e.target.files[0], images.length === 0, images.length);
      updateImages([...images, newImage]);
    } catch {
      setError('Gagal upload gambar');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      await propertiesApi.deleteImage(imageId);
      updateImages(images.filter((img) => img.id !== imageId));
    } catch {
      setError('Gagal menghapus gambar');
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      await propertiesApi.setPrimaryImage(imageId);
      setImages((p) => p.map((img) => ({ ...img, isPrimary: img.id === imageId })));
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Gagal mengubah foto utama';
      setError(msg);
    }
  };

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Klik bintang ⭐ untuk jadikan foto utama. Foto utama tampil pertama di listing.</p>
        <span className={`text-xs font-medium ${images.length >= 3 ? 'text-emerald-600' : 'text-amber-600'}`}>
          {images.length}/3 foto minimum
        </span>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img) => (
          <div key={img.id} className={`relative aspect-video rounded-xl overflow-hidden group border-2 transition-colors ${img.isPrimary ? 'border-primary' : 'border-transparent'}`}>
            <Image src={img.url} alt={`Foto properti`} fill className="object-cover" />
            {img.isPrimary && (
              <span className="absolute top-1 left-1 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-lg font-medium">Utama</span>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!img.isPrimary && (
                <button type="button" onClick={() => handleSetPrimary(img.id)}
                  className="bg-amber-500 text-white rounded-full p-1" title="Jadikan foto utama">
                  <Star className="h-3 w-3" />
                </button>
              )}
              <button type="button" onClick={() => handleDelete(img.id)}
                className="bg-destructive text-destructive-foreground rounded-full p-1">
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
        <label className="aspect-video rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
          {uploading
            ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            : <><Upload className="h-5 w-5 text-muted-foreground mb-1" /><span className="text-xs text-muted-foreground">Upload</span></>
          }
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">Max 5MB per foto. Format: JPG, PNG, WebP</p>
    </div>
  );
}
