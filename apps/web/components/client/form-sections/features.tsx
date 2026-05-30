'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const COMMON_FEATURES: { label: string; value: string }[] = [
  // Keamanan
  { label: 'Keamanan 24 Jam', value: 'security_24h' },
  { label: 'CCTV', value: 'cctv' },
  { label: 'One Gate System', value: 'one_gate' },
  // Air & Listrik
  { label: 'Air PAM', value: 'pam_water' },
  { label: 'Air Sumur', value: 'well_water' },
  { label: 'Listrik PLN', value: 'pln' },
  { label: 'Genset', value: 'genset' },
  { label: 'Solar Panel', value: 'solar_panel' },
  // Fasilitas dalam
  { label: 'Kolam Renang', value: 'swimming_pool' },
  { label: 'Gym / Fitness', value: 'gym' },
  { label: 'Taman', value: 'garden' },
  { label: 'Rooftop', value: 'rooftop' },
  { label: 'Balkon', value: 'balcony' },
  { label: 'Ruang Tamu', value: 'living_room' },
  { label: 'Ruang Makan', value: 'dining_room' },
  { label: 'Dapur', value: 'kitchen' },
  { label: 'Dapur Kotor', value: 'dirty_kitchen' },
  { label: 'Ruang Laundry', value: 'laundry_room' },
  { label: 'Gudang', value: 'storage_room' },
  // Fasilitas luar
  { label: 'Carport', value: 'carport' },
  { label: 'Garasi', value: 'garage_facility' },
  { label: 'Pagar', value: 'fence' },
  // Konektivitas
  { label: 'Internet / WiFi', value: 'internet' },
  { label: 'TV Kabel', value: 'cable_tv' },
  // Lingkungan
  { label: 'Dekat Sekolah', value: 'near_school' },
  { label: 'Dekat Rumah Sakit', value: 'near_hospital' },
  { label: 'Dekat Mall', value: 'near_mall' },
  { label: 'Dekat Tol', value: 'near_highway' },
  { label: 'Dekat Transportasi Umum', value: 'near_public_transport' },
  { label: 'Hook / Sudut', value: 'corner_lot' },
];

interface Props {
  value: string[];
  onChange: (features: string[]) => void;
}

export function FeaturesSection({ value, onChange }: Props) {
  const [others, setOthers] = useState<string[]>(() =>
    value
      .filter((f) => f.startsWith('other_'))
      .map((f) => f.replace('other_', '').replace(/_/g, ' '))
  );
  const [otherInput, setOtherInput] = useState('');

  const toggle = (feat: string) => {
    onChange(value.includes(feat) ? value.filter((f) => f !== feat) : [...value, feat]);
  };

  const addOther = () => {
    const trimmed = otherInput.trim();
    if (!trimmed) return;
    const key = `other_${trimmed.toLowerCase().replace(/\s+/g, '_')}`;
    setOthers((p) => [...p, trimmed]);
    onChange([...value, key]);
    setOtherInput('');
  };

  const removeOther = (idx: number) => {
    const key = `other_${others[idx].toLowerCase().replace(/\s+/g, '_')}`;
    setOthers((p) => p.filter((_, i) => i !== idx));
    onChange(value.filter((f) => f !== key));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {COMMON_FEATURES.map((f) => {
          const active = value.includes(f.value);
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => toggle(f.value)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                active
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Other tags */}
      {others.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {others.map((o, i) => (
            <span key={i} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-secondary border border-border">
              {o}
              <button type="button" onClick={() => removeOther(i)} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add other */}
      <div className="flex gap-2">
        <Input
          value={otherInput}
          onChange={(e) => setOtherInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOther())}
          placeholder="Fasilitas lainnya..."
          className="rounded-xl"
        />
        <Button type="button" variant="outline" onClick={addOther} className="rounded-xl shrink-0">
          <Plus className="h-4 w-4 mr-1" /> Tambah
        </Button>
      </div>
    </div>
  );
}
