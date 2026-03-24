'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, LocateFixed } from 'lucide-react';

const DEFAULT_LAT = -2.5;
const DEFAULT_LNG = 118.0;

interface Props {
  lat?: number | string;
  lng?: number | string;
  onChange: (lat: number, lng: number) => void;
}

export function PropertyMapPicker({ lat: latProp, lng: lngProp, onChange }: Props) {
  const lat = latProp ? Number(latProp) : undefined;
  const lng = lngProp ? Number(lngProp) : undefined;

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null);
  const markerRef = useRef<import('leaflet').Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let map: import('leaflet').Map;

    import('leaflet').then((L) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const initLat = lat ?? DEFAULT_LAT;
      const initLng = lng ?? DEFAULT_LNG;

      map = L.map(mapRef.current!).setView([initLat, initLng], lat ? 15 : 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      const marker = L.marker([initLat, initLng], { draggable: true }).addTo(map);
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChange(pos.lat, pos.lng);
      });
      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        onChange(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!markerRef.current || !mapInstanceRef.current || !lat || !lng) return;
    markerRef.current.setLatLng([lat, lng]);
    mapInstanceRef.current.setView([lat, lng], 15);
  }, [lat, lng]);

  const handleDetect = () => {
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => {
        onChange(coords.latitude, coords.longitude);
        markerRef.current?.setLatLng([coords.latitude, coords.longitude]);
        mapInstanceRef.current?.setView([coords.latitude, coords.longitude], 16);
      },
      () => alert('Tidak dapat mendeteksi lokasi. Pastikan izin lokasi diaktifkan.'),
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>Klik peta atau drag pin untuk menentukan lokasi</span>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleDetect}>
          <LocateFixed className="h-4 w-4 mr-2" />
          Deteksi Lokasi
        </Button>
      </div>
      <div ref={mapRef} className="h-64 w-full rounded-lg border z-0" />
      {lat && lng && (
        <p className="text-xs text-muted-foreground">
          Koordinat: {lat.toFixed(6)}, {lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}
