'use client';

import { useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/context/auth-context';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function SaveSearchButton({ label }: { label: string }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const url = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '');

  const save = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/saved-searches`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: label, url }),
      });
      setSaved(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline" size="sm"
      className={`gap-1.5 rounded-xl text-xs ${saved ? 'text-primary border-primary/40 bg-primary/5' : ''}`}
      onClick={save} disabled={loading || saved}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
        saved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
      {saved ? 'Tersimpan' : 'Simpan Pencarian'}
    </Button>
  );
}
