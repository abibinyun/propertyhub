'use client';

import { useState } from 'react';
import { Flag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/lib/context/auth-context';

const REASONS = [
  'Informasi tidak akurat / menyesatkan',
  'Foto tidak sesuai properti',
  'Harga tidak wajar / penipuan',
  'Properti sudah terjual/tersewa',
  'Konten tidak pantas',
  'Lainnya',
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function ReportButton({ propertyId }: { propertyId: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const submit = async () => {
    if (!reason) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, reason, notes: notes || undefined }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || 'Gagal mengirim laporan');
      }
      setDone(true);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
      >
        <Flag className="h-3.5 w-3.5" />
        Laporkan
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Flag className="h-4 w-4 text-destructive" />
              Laporkan Listing
            </DialogTitle>
          </DialogHeader>

          {done ? (
            <div className="py-4 text-center space-y-2">
              <p className="text-sm font-semibold text-emerald-600">Laporan terkirim</p>
              <p className="text-xs text-muted-foreground">Tim kami akan meninjau laporan ini.</p>
              <Button className="w-full mt-2" onClick={() => { setOpen(false); setDone(false); }}>Tutup</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                {REASONS.map(r => (
                  <label key={r} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio" name="reason" value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="accent-primary"
                    />
                    <span className="text-sm group-hover:text-foreground text-muted-foreground">{r}</span>
                  </label>
                ))}
              </div>
              <textarea
                placeholder="Keterangan tambahan (opsional)"
                value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Batal</Button>
                <Button className="flex-1 gap-2" onClick={submit} disabled={!reason || loading}>
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Kirim Laporan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
