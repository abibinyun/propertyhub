'use client';

import { useState } from 'react';
import Image from 'next/image';
import { propertiesApi } from '@/lib/api/properties';
import { PropertyImage } from '@/types/property';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, X } from 'lucide-react';

interface Props {
  propertyId: string;
  initialImages: PropertyImage[];
}

export function ImageUploadSection({ propertyId, initialImages }: Props) {
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true); setError('');
    try {
      const file = e.target.files[0];
      const newImage = await propertiesApi.uploadImage(propertyId, file, images.length === 0, images.length);
      setImages((p) => [...p, newImage]);
    } catch {
      setError('Gagal upload gambar');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (imageId: string) => {
    await propertiesApi.deleteImage(imageId);
    setImages((p) => p.filter((img) => img.id !== imageId));
  };

  return (
    <Card>
      <CardHeader><CardTitle>Foto Properti</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative aspect-video rounded-md overflow-hidden group">
              <Image src={img.url} alt="" fill className="object-cover" />
              {img.isPrimary && (
                <span className="absolute top-1 left-1 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Utama</span>
              )}
              <button
                type="button"
                onClick={() => handleDelete(img.id)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="aspect-video rounded-md border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
            {uploading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : (
              <><Upload className="h-5 w-5 text-muted-foreground mb-1" /><span className="text-xs text-muted-foreground">Upload</span></>
            )}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">Max 5MB per foto. Format: JPG, PNG, WebP</p>
      </CardContent>
    </Card>
  );
}
