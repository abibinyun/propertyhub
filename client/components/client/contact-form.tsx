'use client';

import { useState } from 'react';
import { leadsApi } from '@/lib/api/leads';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MessageSquare, CheckCircle } from 'lucide-react';

interface Props {
  propertyId: string;
}

export function ContactForm({ propertyId }: Props) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await leadsApi.create({ ...form, propertyId });
      setSent(true);
    } catch {
      setError('Gagal mengirim pesan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Card>
        <CardContent className="py-8 text-center space-y-3">
          <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
          <p className="font-semibold">Pesan terkirim!</p>
          <p className="text-sm text-muted-foreground">Penjual akan menghubungi Anda segera.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Kirim Pesan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>}
          <div>
            <Label htmlFor="name">Nama *</Label>
            <Input id="name" name="name" value={form.name} onChange={handleChange} required placeholder="Nama Anda" />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="email@contoh.com" />
          </div>
          <div>
            <Label htmlFor="phone">Telepon *</Label>
            <Input id="phone" name="phone" value={form.phone} onChange={handleChange} required placeholder="08123456789" />
          </div>
          <div>
            <Label htmlFor="message">Pesan *</Label>
            <textarea
              id="message" name="message" value={form.message} onChange={handleChange} required rows={3}
              placeholder="Saya tertarik dengan properti ini..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Mengirim...' : 'Kirim Pesan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
