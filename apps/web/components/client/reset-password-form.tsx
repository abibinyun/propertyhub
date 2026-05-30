'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle } from 'lucide-react';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    const password = fd.get('password') as string;
    const confirm = fd.get('confirm') as string;

    if (password !== confirm) {
      setError('Password tidak cocok');
      return;
    }
    if (!token) {
      setError('Token tidak valid');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4 py-4">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
        <p className="text-sm text-muted-foreground">Password berhasil diubah. Mengalihkan ke halaman login...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center space-y-4 py-4">
        <p className="text-sm text-destructive">Link tidak valid atau sudah kadaluarsa.</p>
        <Link href="/forgot-password" className="text-primary hover:underline text-sm font-medium">
          Minta link baru
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="password">Password Baru</Label>
        <Input id="password" name="password" type="password" placeholder="Min. 6 karakter" required minLength={6} className="h-11" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Konfirmasi Password</Label>
        <Input id="confirm" name="confirm" type="password" placeholder="Ulangi password baru" required minLength={6} className="h-11" />
      </div>
      <Button type="submit" className="w-full h-11" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
      </Button>
    </form>
  );
}
