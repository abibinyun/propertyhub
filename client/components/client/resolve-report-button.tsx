'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function ResolveReportButton({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const resolve = async () => {
    setLoading(true);
    await fetch(`${API_URL}/reports/${reportId}/resolve`, { method: 'PATCH', credentials: 'include' });
    setLoading(false);
    router.refresh();
  };

  return (
    <Button size="sm" variant="outline" className="gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50" disabled={loading} onClick={resolve}>
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
      Selesai
    </Button>
  );
}
