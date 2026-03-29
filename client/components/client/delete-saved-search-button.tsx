'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function DeleteSavedSearchButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const del = async () => {
    setLoading(true);
    await fetch(`${API_URL}/saved-searches/${id}`, { method: 'DELETE', credentials: 'include' });
    setLoading(false);
    router.refresh();
  };

  return (
    <button onClick={del} disabled={loading} className="text-muted-foreground hover:text-destructive transition-colors">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}
