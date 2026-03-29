'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Loader2 } from 'lucide-react';

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Simulasi kirim — nanti bisa connect ke endpoint /contact
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="text-center py-8 space-y-3">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
        <p className="font-semibold">Pesan terkirim!</p>
        <p className="text-sm text-muted-foreground">Tim kami akan menghubungi Anda dalam 1x24 jam.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nama</Label>
          <Input id="name" name="name" placeholder="Nama lengkap" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="email@contoh.com" required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="subject">Subjek</Label>
        <Input id="subject" name="subject" placeholder="Topik pesan Anda" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">Pesan</Label>
        <Textarea id="message" name="message" placeholder="Tulis pesan Anda..." rows={4} required />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Mengirim...' : 'Kirim Pesan'}
      </Button>
    </form>
  );
}
