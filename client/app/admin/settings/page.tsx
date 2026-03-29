'use client';

import { useState, useEffect } from 'react';
import { settingsApi } from '@/lib/api/settings';
import { SiteSettings } from '@/lib/server/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, Upload } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ImageUploadField({ label, currentUrl, onUpload }: {
  label: string;
  currentUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    try { await onUpload(e.target.files[0]); } finally { setUploading(false); e.target.value = ''; }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {currentUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={currentUrl} alt={label} className="h-12 object-contain rounded border bg-muted/30 p-1" />
      )}
      <label className="flex items-center gap-2 cursor-pointer w-fit">
        <Button type="button" variant="outline" size="sm" className="gap-2 pointer-events-none" disabled={uploading}>
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
        <input type="file" accept="image/*" className="hidden" onChange={handleChange} disabled={uploading} />
      </label>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    settingsApi.get().then(setSettings);
  }, []);

  const set = (key: keyof SiteSettings, value: any) =>
    setSettings((s) => s ? { ...s, [key]: value } : s);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true); setError(''); setSaved(false);
    try {
      const updated = await settingsApi.update(settings);
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pengaturan Situs</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola branding, kontak, harga, dan tampilan</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saved ? 'Tersimpan ✓' : 'Simpan'}
        </Button>
      </div>

      {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>}

      <Tabs defaultValue="branding">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="contact">Kontak & Sosmed</TabsTrigger>
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
          <TabsTrigger value="pricing">Harga</TabsTrigger>
          <TabsTrigger value="system">Sistem</TabsTrigger>
        </TabsList>

        {/* Branding */}
        <TabsContent value="branding" className="space-y-4 pt-4">
          <Field label="Nama Situs">
            <Input value={settings.siteName} onChange={(e) => set('siteName', e.target.value)} className="rounded-xl" />
          </Field>
          <Field label="Tagline">
            <Input value={settings.tagline} onChange={(e) => set('tagline', e.target.value)} className="rounded-xl" />
          </Field>
          <ImageUploadField
            label="Logo"
            currentUrl={settings.logoUrl}
            onUpload={async (file) => {
              const { logoUrl } = await settingsApi.uploadLogo(file);
              set('logoUrl', logoUrl);
            }}
          />
          <ImageUploadField
            label="Favicon"
            currentUrl={settings.faviconUrl}
            onUpload={async (file) => {
              const { faviconUrl } = await settingsApi.uploadFavicon(file);
              set('faviconUrl', faviconUrl);
            }}
          />
        </TabsContent>

        {/* Kontak & Sosmed */}
        <TabsContent value="contact" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email">
              <Input value={settings.email ?? ''} onChange={(e) => set('email', e.target.value)} placeholder="info@propertyhub.id" className="rounded-xl" />
            </Field>
            <Field label="Telepon">
              <Input value={settings.phone ?? ''} onChange={(e) => set('phone', e.target.value)} placeholder="021-1234-5678" className="rounded-xl" />
            </Field>
            <Field label="WhatsApp" hint="Nomor saja, tanpa +62 atau 0">
              <Input value={settings.whatsapp ?? ''} onChange={(e) => set('whatsapp', e.target.value)} placeholder="81234567890" className="rounded-xl" />
            </Field>
            <Field label="Alamat">
              <Input value={settings.address ?? ''} onChange={(e) => set('address', e.target.value)} placeholder="Jakarta, Indonesia" className="rounded-xl" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Instagram">
              <Input value={settings.instagram ?? ''} onChange={(e) => set('instagram', e.target.value)} placeholder="https://instagram.com/..." className="rounded-xl" />
            </Field>
            <Field label="Facebook">
              <Input value={settings.facebook ?? ''} onChange={(e) => set('facebook', e.target.value)} placeholder="https://facebook.com/..." className="rounded-xl" />
            </Field>
            <Field label="TikTok">
              <Input value={settings.tiktok ?? ''} onChange={(e) => set('tiktok', e.target.value)} placeholder="https://tiktok.com/@..." className="rounded-xl" />
            </Field>
            <Field label="YouTube">
              <Input value={settings.youtube ?? ''} onChange={(e) => set('youtube', e.target.value)} placeholder="https://youtube.com/@..." className="rounded-xl" />
            </Field>
            <Field label="Twitter / X">
              <Input value={settings.twitter ?? ''} onChange={(e) => set('twitter', e.target.value)} placeholder="https://twitter.com/..." className="rounded-xl" />
            </Field>
          </div>
        </TabsContent>

        {/* Homepage */}
        <TabsContent value="homepage" className="space-y-4 pt-4">
          <Field label="Hero Title" hint="Judul besar di homepage">
            <Input value={settings.heroTitle} onChange={(e) => set('heroTitle', e.target.value)} className="rounded-xl" />
          </Field>
          <Field label="Hero Subtitle" hint="Teks di bawah judul">
            <Input value={settings.heroSubtitle} onChange={(e) => set('heroSubtitle', e.target.value)} className="rounded-xl" />
          </Field>
        </TabsContent>

        {/* Harga */}
        <TabsContent value="pricing" className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">Harga featured listing yang ditampilkan ke pengguna.</p>
          {(['priceBasic', 'pricePremium', 'priceUltimate'] as const).map((key) => {
            const label = key === 'priceBasic' ? 'BASIC' : key === 'pricePremium' ? 'PREMIUM' : 'ULTIMATE';
            return (
              <Field key={key} label={`Harga ${label} (Rp)`}>
                <Input
                  type="number"
                  value={settings[key]}
                  onChange={(e) => set(key, parseInt(e.target.value) || 0)}
                  className="rounded-xl"
                />
                <p className="text-xs text-primary font-medium">{formatPrice(String(settings[key]))}</p>
              </Field>
            );
          })}
        </TabsContent>

        {/* Sistem */}
        <TabsContent value="system" className="space-y-4 pt-4">
          <div className="flex items-center justify-between p-4 rounded-xl border">
            <div>
              <p className="font-medium text-sm">Maintenance Mode</p>
              <p className="text-xs text-muted-foreground">Semua halaman publik akan menampilkan halaman maintenance</p>
            </div>
            <button
              type="button"
              onClick={() => set('maintenanceMode', !settings.maintenanceMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.maintenanceMode ? 'bg-destructive' : 'bg-muted'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {settings.maintenanceMode && (
            <Field label="Pesan Maintenance">
              <Input value={settings.maintenanceMsg} onChange={(e) => set('maintenanceMsg', e.target.value)} className="rounded-xl" />
            </Field>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
