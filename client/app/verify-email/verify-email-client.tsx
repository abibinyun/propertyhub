'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Status = 'loading' | 'success' | 'error' | 'expired' | 'no-token';

export function VerifyEmailClient() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');
  const [status, setStatus] = useState<Status>(token ? 'loading' : 'no-token');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${token}`, { credentials: 'include' })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
        } else {
          setStatus(data.message?.includes('kadaluarsa') ? 'expired' : 'error');
          setMessage(data.message || 'Verifikasi gagal');
        }
      })
      .catch(() => { setStatus('error'); setMessage('Terjadi kesalahan'); });
  }, [token]);

  if (status === 'loading') return (
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-sm">Memverifikasi email Anda...</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-8 w-full max-w-md text-center space-y-4">
      {status === 'success' && (
        <>
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
          <h1 className="text-xl font-semibold">Email Terverifikasi!</h1>
          <p className="text-muted-foreground text-sm">Akun Anda sudah aktif. Selamat menggunakan PropertyHub.</p>
          <Button className="w-full rounded-xl" onClick={() => router.push('/dashboard')}>Ke Dashboard</Button>
        </>
      )}
      {(status === 'error' || status === 'expired' || status === 'no-token') && (
        <>
          <XCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-xl font-semibold">
            {status === 'expired' ? 'Link Kadaluarsa' : status === 'no-token' ? 'Token Tidak Ditemukan' : 'Verifikasi Gagal'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {status === 'expired'
              ? 'Link verifikasi sudah kadaluarsa. Minta kirim ulang dari dashboard.'
              : message || 'Link tidak valid atau sudah digunakan.'}
          </p>
          <Button variant="outline" className="w-full rounded-xl" onClick={() => router.push('/dashboard')}>
            Ke Dashboard
          </Button>
        </>
      )}
    </div>
  );
}
