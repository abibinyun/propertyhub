'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmailVerificationBanner({ email }: { email: string }) {
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  if (dismissed) return null;

  const resend = async () => {
    setSending(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`, {
        method: 'POST', credentials: 'include',
      });
      if (!res.ok) throw new Error('Gagal mengirim');
      setSent(true);
    } catch {
      setError('Gagal mengirim email. Coba lagi.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-sm">
      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
      <p className="flex-1 text-amber-800">
        Email <span className="font-medium">{email}</span> belum diverifikasi.{' '}
        {sent
          ? <span className="text-emerald-700 font-medium">Email verifikasi telah dikirim!</span>
          : error
          ? <span className="text-destructive">{error} <button onClick={resend} className="underline font-medium">Coba lagi</button></span>
          : <button onClick={resend} disabled={sending} className="underline font-medium hover:no-underline disabled:opacity-50">
              {sending ? 'Mengirim...' : 'Kirim ulang email verifikasi'}
            </button>
        }
      </p>
      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setDismissed(true)}>
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
