'use client';

import { useState } from 'react';
import { usersApi } from '@/lib/api/users';
import { useAuth } from '@/lib/context/auth-context';
import { User } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';

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

export function ProfileForm({ user }: { user: User }) {
  const { setUser } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileError(''); setProfileSuccess(false); setProfileLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const updated = await usersApi.updateProfile({
        name: fd.get('name') as string,
        phone: fd.get('phone') as string || undefined,
        company: fd.get('company') as string || undefined,
      });
      setUser({ ...user, ...(updated as Partial<User>) });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPwError(''); setPwSuccess(false); setPwLoading(true);
    const fd = new FormData(e.currentTarget);
    const newPw = fd.get('newPassword') as string;
    const confirm = fd.get('confirmPassword') as string;
    if (newPw !== confirm) { setPwError('Konfirmasi password tidak cocok'); setPwLoading(false); return; }
    try {
      await usersApi.changePassword({
        currentPassword: fd.get('currentPassword') as string,
        newPassword: newPw,
      });
      setPwSuccess(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : 'Gagal mengubah password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Profile info */}
      <SectionCard title="Informasi Akun">
        <form onSubmit={handleProfile} className="space-y-4">
          {profileError && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-xl">{profileError}</p>}
          {profileSuccess && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl">
              <CheckCircle className="h-4 w-4" />Profil berhasil disimpan
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={user.email} disabled className="bg-muted rounded-xl" />
            <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Lengkap *</Label>
            <Input id="name" name="name" defaultValue={user.name} required className="rounded-xl" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Nomor Telepon / WhatsApp</Label>
            <Input id="phone" name="phone" defaultValue={user.phone ?? ''} placeholder="08123456789" className="rounded-xl" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company">Nama Perusahaan / Agen</Label>
            <Input id="company" name="company" defaultValue={user.company ?? ''} placeholder="PT. Properti Indonesia" className="rounded-xl" />
          </div>

          <Button type="submit" disabled={profileLoading} className="w-full rounded-xl font-semibold">
            {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {profileLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </form>
      </SectionCard>

      {/* Change password */}
      <SectionCard title="Ganti Password">
        <form onSubmit={handlePassword} className="space-y-4">
          {pwError && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-xl">{pwError}</p>}
          {pwSuccess && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl">
              <CheckCircle className="h-4 w-4" />Password berhasil diubah
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Password Saat Ini</Label>
            <div className="relative">
              <Input id="currentPassword" name="currentPassword" type={showCurrent ? 'text' : 'password'} required className="rounded-xl pr-10" />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword">Password Baru</Label>
            <div className="relative">
              <Input id="newPassword" name="newPassword" type={showNew ? 'text' : 'password'} required minLength={6} className="rounded-xl pr-10" />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Minimal 6 karakter</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required className="rounded-xl" />
          </div>

          <Button type="submit" variant="outline" disabled={pwLoading} className="w-full rounded-xl font-semibold">
            {pwLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pwLoading ? 'Mengubah...' : 'Ubah Password'}
          </Button>
        </form>
      </SectionCard>
      </div>
    </div>
  );
}
