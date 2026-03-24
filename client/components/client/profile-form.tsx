'use client';

import { useState } from 'react';
import { usersApi } from '@/lib/api/users';
import { User } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export function ProfileForm({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); setSuccess(false); setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await usersApi.updateProfile({
        name: fd.get('name') as string,
        phone: fd.get('phone') as string || undefined,
        company: fd.get('company') as string || undefined,
      });
      setSuccess(true);
    } catch {
      setError('Gagal menyimpan profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
      {success && <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">Profil berhasil disimpan!</div>}
      <div>
        <Label>Email</Label>
        <Input value={user.email} disabled className="bg-muted" />
      </div>
      <div>
        <Label htmlFor="name">Nama Lengkap</Label>
        <Input id="name" name="name" defaultValue={user.name} required />
      </div>
      <div>
        <Label htmlFor="phone">Nomor Telepon</Label>
        <Input id="phone" name="phone" defaultValue={user.phone ?? ''} placeholder="08123456789" />
      </div>
      <div>
        <Label htmlFor="company">Nama Perusahaan / Agen</Label>
        <Input id="company" name="company" defaultValue={user.company ?? ''} placeholder="Opsional" />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
      </Button>
    </form>
  );
}
