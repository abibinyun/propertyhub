'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { leadsApi } from '@/lib/api/leads';
import { useAuth } from '@/lib/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, Send, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ContactForm({ propertyId }: { propertyId: string }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
  const registerUrl = `/register?redirect=${encodeURIComponent(pathname)}`;
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    message: 'Halo, saya tertarik dengan properti ini. Mohon info lebih lanjut.',
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await leadsApi.create({ ...form, email: user?.email ?? '', propertyId });
      setSent(true);
    } catch {
      setError('Gagal mengirim. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-2 space-y-3">
        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold">Login untuk mengirim pesan</p>
          <p className="text-xs text-muted-foreground mt-1">Anda perlu login untuk menghubungi agen properti ini.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="flex-1 rounded-xl">
            <Link href={loginUrl}>Login</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 rounded-xl">
            <Link href={registerUrl}>Daftar</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="text-center py-4 space-y-2">
        <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
        <p className="font-semibold text-sm">Pesan terkirim!</p>
        <p className="text-xs text-muted-foreground">Agen akan menghubungi Anda segera.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
      <Input placeholder="Nama Anda *" value={form.name} onChange={set('name')} required className="rounded-xl" />
      <Input placeholder="No. WhatsApp *" value={form.phone} onChange={set('phone')} required className="rounded-xl" />
      <textarea
        value={form.message} onChange={set('message')} required rows={3}
        className={cn('flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none')}
      />
      <Button type="submit" className="w-full gap-2 font-semibold" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {loading ? 'Mengirim...' : 'Kirim Pesan'}
      </Button>
    </form>
  );
}
