'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, AdminUser } from '@/lib/api/admin';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Ban, BadgeCheck } from 'lucide-react';

export function AdminUserActions({ user }: { user: AdminUser }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const act = async (fn: () => Promise<unknown>) => {
    setLoading(true);
    await fn();
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <Button size="sm" variant="outline" className="gap-1" disabled={loading}
        onClick={() => act(() => adminApi.updateUser(user.id, { role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' }))}>
        <ShieldCheck className="h-3.5 w-3.5" />
        {user.role === 'ADMIN' ? 'Cabut Admin' : 'Jadikan Admin'}
      </Button>
      <Button size="sm" variant="outline" className={`gap-1 ${user.verified ? 'text-emerald-600 border-emerald-300' : 'text-slate-500'}`}
        disabled={loading}
        onClick={() => act(() => adminApi.updateUser(user.id, { verified: !user.verified }))}>
        <BadgeCheck className="h-3.5 w-3.5" />
        {user.verified ? 'Cabut Verifikasi' : 'Verifikasi'}
      </Button>
      {user.role !== 'ADMIN' && (
        <Button size="sm" variant="destructive" className="gap-1" disabled={loading}
          onClick={() => act(async () => { const r = prompt('Alasan ban:'); if (r) await adminApi.banUser(user.id, r); })}>
          <Ban className="h-3.5 w-3.5" />Ban
        </Button>
      )}
    </div>
  );
}
