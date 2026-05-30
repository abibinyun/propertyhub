'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PropertyMapPicker } from '@/components/client/property-map-picker';
import { Search, Loader2, MapPin, ChevronDown } from 'lucide-react';

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

interface WilayahItem { id: string; nama: string; latitude?: number; longitude?: number; }

function toTitle(s: string) {
  return s.toLowerCase().replace(/(?:^|\s|\.)\w/g, (c) => c.toUpperCase());
}

function makeEv(name: string, value: string): React.ChangeEvent<HTMLInputElement> {
  return { target: { name, value } } as React.ChangeEvent<HTMLInputElement>;
}

// Cache kecamatan agar tidak re-fetch
const kecamatanCache: Record<string, WilayahItem[]> = {};

function WilayahSelect({
  label, required, placeholder, items, value, loading, disabled, onSelect,
}: {
  label: string; required?: boolean; placeholder: string;
  items: WilayahItem[]; value: string; loading?: boolean; disabled?: boolean;
  onSelect: (item: WilayahItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const filtered = q ? items.filter((i) => i.nama.toLowerCase().includes(q.toLowerCase())) : items;

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { if (!open) setQ(''); }, [open]);

  return (
    <div ref={ref} className="relative">
      <Label className="mb-1.5 block text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <button
        type="button" disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm text-left disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/30 transition-colors"
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {value || placeholder}
        </span>
        {loading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-border rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border/50">
            <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
              placeholder={`Cari ${label.toLowerCase()}...`} className="h-8 rounded-lg text-sm" />
          </div>
          <ul className="max-h-52 overflow-y-auto">
            {filtered.length === 0
              ? <li className="px-3 py-2 text-sm text-muted-foreground">Tidak ditemukan</li>
              : filtered.map((item) => (
                <li key={item.id} onMouseDown={() => { onSelect(item); setOpen(false); }}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-muted transition-colors ${value === toTitle(item.nama) ? 'bg-primary/5 font-medium text-primary' : ''}`}>
                  {toTitle(item.nama)}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface NominatimResult { place_id: number; display_name: string; lat: string; lon: string; }

function MapSearch({ onSelect }: { onSelect: (lat: number, lon: number) => void }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (val: string) => {
    if (val.length < 3) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&countrycodes=id&limit=5&format=json`,
        { headers: { 'Accept-Language': 'id' } }
      );
      const data: NominatimResult[] = await res.json();
      setResults(data); setOpen(data.length > 0);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative mb-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => {
          setQ(e.target.value);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => search(e.target.value), 500);
        }} placeholder="Cari lokasi untuk pin peta..." className="pl-9 pr-9 rounded-xl" />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
      </div>
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-border rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
          {results.map((r) => (
            <li key={r.place_id}
              onMouseDown={() => { onSelect(parseFloat(r.lat), parseFloat(r.lon)); setQ(r.display_name.split(',').slice(0, 2).join(',')); setOpen(false); }}
              className="flex items-start gap-2 px-3 py-2.5 hover:bg-muted cursor-pointer text-sm border-b border-border/50 last:border-0">
              <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
              <span className="line-clamp-2">{r.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function LocationSection({ values, onChange, onCoordinatesChange }: LocationProps) {
  const [provinsi, setProvinsi] = useState<WilayahItem[]>([]);
  const [kabupaten, setKabupaten] = useState<WilayahItem[]>([]);
  const [kecamatan, setKecamatan] = useState<WilayahItem[]>([]);
  const [allKabupaten, setAllKabupaten] = useState<Record<string, WilayahItem[]>>({});
  const [loadingKec, setLoadingKec] = useState(false);
  const [selectedProvId, setSelectedProvId] = useState('');
  const [selectedKabId, setSelectedKabId] = useState('');
  // Koordinat untuk map — diupdate oleh dropdown ATAU search pin
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | undefined>(
    values.latitude && values.longitude
      ? { lat: Number(values.latitude), lng: Number(values.longitude) }
      : undefined
  );

  useEffect(() => {
    fetch('/wilayah/provinsi-kabupaten.json')
      .then((r) => r.json())
      .then((d: { provinsi: WilayahItem[]; kabupaten: Record<string, WilayahItem[]> }) => {
        setProvinsi(d.provinsi);
        setAllKabupaten(d.kabupaten);

        // Edit mode: restore selectedProvId & kabupaten dari values.province
        if (values.province) {
          const prov = d.provinsi.find((p) => toTitle(p.nama) === values.province);
          if (prov) {
            setSelectedProvId(prov.id);
            const kabs = d.kabupaten[prov.id] ?? [];
            setKabupaten(kabs);

            // Restore selectedKabId & kecamatan dari values.city
            if (values.city) {
              const kab = kabs.find((k) => toTitle(k.nama) === values.city);
              if (kab) {
                setSelectedKabId(kab.id);
                // Load kecamatan
                const loadKec = async () => {
                  if (kecamatanCache[kab.id]) { setKecamatan(kecamatanCache[kab.id]); return; }
                  setLoadingKec(true);
                  const data: Record<string, WilayahItem[]> = await fetch('/wilayah/kecamatan.json').then((r) => r.json());
                  Object.assign(kecamatanCache, data);
                  setKecamatan(data[kab.id] ?? []);
                  setLoadingKec(false);
                };
                loadKec();
              }
            }
          }
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveMap = (item: WilayahItem) => {
    if (item.latitude && item.longitude) {
      setMapCoords({ lat: item.latitude, lng: item.longitude });
    }
  };

  const selectProvinsi = (item: WilayahItem) => {
    onChange(makeEv('province', toTitle(item.nama)));
    onChange(makeEv('city', ''));
    onChange(makeEv('district', ''));
    setSelectedProvId(item.id);
    setSelectedKabId('');
    setKabupaten(allKabupaten[item.id] ?? []);
    setKecamatan([]);
    moveMap(item);
  };

  const selectKabupaten = async (item: WilayahItem) => {
    onChange(makeEv('city', toTitle(item.nama)));
    onChange(makeEv('district', ''));
    setSelectedKabId(item.id);
    setKecamatan([]);
    moveMap(item);

    if (kecamatanCache[item.id]) {
      setKecamatan(kecamatanCache[item.id]);
      return;
    }
    setLoadingKec(true);
    const data: Record<string, WilayahItem[]> = await fetch('/wilayah/kecamatan.json').then((r) => r.json());
    Object.assign(kecamatanCache, data);
    setKecamatan(data[item.id] ?? []);
    setLoadingKec(false);
  };

  const selectKecamatan = (item: WilayahItem) => {
    onChange(makeEv('district', toTitle(item.nama)));
    moveMap(item);
  };

  // Search pin hanya update koordinat, tidak ubah dropdown
  const handlePinSearch = (lat: number, lng: number) => {
    setMapCoords({ lat, lng });
    onCoordinatesChange(lat, lng);
  };

  // Map drag/click hanya update koordinat
  const handleMapChange = (lat: number, lng: number) => {
    setMapCoords({ lat, lng });
    onCoordinatesChange(lat, lng);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address" className="mb-1.5 block text-sm font-medium">
          Alamat Lengkap <span className="text-destructive">*</span>
        </Label>
        <Input id="address" name="address" value={values.address} onChange={onChange} required
          placeholder="Jl. Sudirman No. 123" className="rounded-xl" />
      </div>

      <WilayahSelect label="Provinsi" required placeholder="Pilih provinsi"
        items={provinsi} value={values.province} onSelect={selectProvinsi} />

      <div className="grid grid-cols-2 gap-4">
        <WilayahSelect label="Kota / Kabupaten" required
          placeholder={selectedProvId ? 'Pilih kota' : 'Pilih provinsi dulu'}
          items={kabupaten} value={values.city}
          disabled={!selectedProvId} onSelect={selectKabupaten} />
        <WilayahSelect label="Kecamatan" required
          placeholder={selectedKabId ? 'Pilih kecamatan' : 'Pilih kota dulu'}
          items={kecamatan} value={values.district}
          loading={loadingKec} disabled={!selectedKabId} onSelect={selectKecamatan} />
      </div>

      <div className="w-1/2 pr-2">
        <Label htmlFor="postalCode" className="mb-1.5 block text-sm font-medium">Kode Pos</Label>
        <Input id="postalCode" name="postalCode" value={values.postalCode} onChange={onChange}
          placeholder="12190" className="rounded-xl" />
      </div>

      <div>
        <Label className="mb-1.5 block text-sm font-medium">Pin Lokasi di Peta</Label>
        <MapSearch onSelect={handlePinSearch} />
        <PropertyMapPicker lat={mapCoords?.lat} lng={mapCoords?.lng} onChange={handleMapChange} />
      </div>
    </div>
  );
}
