'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';
import { propertiesApi } from '@/lib/api/properties';

interface Props {
  propertyId: string;
  initialUrl?: string;
}

export function FloorPlanUpload({ propertyId, initialUrl }: Props) {
  const [url, setUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true); setError('');
    try {
      const { floorPlanUrl } = await propertiesApi.uploadFloorPlan(propertyId, e.target.files[0]);
      setUrl(floorPlanUrl);
    } catch {
      setError('Gagal upload denah');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async () => {
    try {
      await propertiesApi.deleteFloorPlan(propertyId);
      setUrl(undefined);
    } catch {
      setError('Gagal menghapus denah');
    }
  };

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}
      {url ? (
        <div className="relative w-full max-w-sm">
          <Image src={url} alt="Denah lantai" width={400} height={300} className="rounded-xl border object-contain w-full" />
          <button type="button" onClick={handleDelete}
            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full max-w-sm h-32 rounded-xl border-2 border-dashed border-muted-foreground/30 cursor-pointer hover:border-primary transition-colors">
          {uploading
            ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            : <><Upload className="h-6 w-6 text-muted-foreground mb-1" /><span className="text-xs text-muted-foreground">Upload denah lantai</span></>
          }
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      )}
      <p className="text-xs text-muted-foreground">Max 5MB. Format: JPG, PNG, WebP</p>
    </div>
  );
}
