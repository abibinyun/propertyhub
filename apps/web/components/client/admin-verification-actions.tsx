'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { API_URL } from '@/lib/config';

interface Props {
  verificationId: string;
}

export function AdminVerificationActions({ verificationId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleReview = async (status: 'APPROVED' | 'REJECTED') => {
    let reason: string | undefined;
    if (status === 'REJECTED') {
      const promptReason = window.prompt('Masukkan alasan penolakan:');
      if (promptReason === null) return;
      reason = promptReason || 'Dokumen belum memenuhi persyaratan';
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/verification/${verificationId}/review`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        disabled={loading}
        onClick={() => handleReview('APPROVED')}
        className="h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
        Setujui
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={loading}
        onClick={() => handleReview('REJECTED')}
        className="h-8 gap-1 text-destructive border-destructive/30 hover:bg-destructive/10 rounded-lg text-xs"
      >
        <XCircle className="h-3.5 w-3.5" />
        Tolak
      </Button>
    </div>
  );
}
