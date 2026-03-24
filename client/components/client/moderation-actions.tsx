'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { adminApi } from '@/lib/api/admin';
import { Property } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Flag } from 'lucide-react';

export function ModerationActions({ property }: { property: Property }) {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const act = async (fn: () => Promise<unknown>) => {
    setLoading(true);
    await fn();
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="space-y-2 mt-3">
      <Input
        placeholder="Alasan penolakan / flag (wajib untuk tolak/flag)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="h-8 text-sm"
      />
      <div className="flex gap-2">
        <Button size="sm" className="gap-1" disabled={loading} onClick={() => act(() => adminApi.approve(property.id))}>
          <CheckCircle className="h-3.5 w-3.5" />Setujui
        </Button>
        <Button size="sm" variant="destructive" className="gap-1" disabled={loading || !reason.trim()}
          onClick={() => act(() => adminApi.reject(property.id, reason))}>
          <XCircle className="h-3.5 w-3.5" />Tolak
        </Button>
        <Button size="sm" variant="outline" className="gap-1" disabled={loading || !reason.trim()}
          onClick={() => act(() => adminApi.flag(property.id, reason))}>
          <Flag className="h-3.5 w-3.5" />Flag
        </Button>
      </div>
    </div>
  );
}
