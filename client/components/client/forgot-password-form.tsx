'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle } from 'lucide-react';

export function ForgotPasswordForm() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await authApi.forgotPassword(fd.get('email') as string);
      setSuccess(true);
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
        <p className="text-sm text-muted-foreground">
          Jika email terdaftar, link reset password telah dikirim. Cek inbox Anda.
        </p>
        <Link href="/login" className="text-primary hover:underline text-sm font-medium">
          Kembali ke Login
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
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="nama@email.com" required className="h-11" />
      </div>
      <Button type="submit" className="w-full h-11" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Mengirim...' : 'Kirim Link Reset'}
      </Button>
      <p className="text-center text-sm text-muted-foreground pt-2">
        Ingat password?{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">Masuk</Link>
      </p>
    </form>
  );
}
