'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, AdminUser } from '@/lib/api/admin';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Ban } from 'lucide-react';

export function AdminUserActions({ user }: { user: AdminUser }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggleAdmin = async () => {
    setLoading(true);
    await adminApi.updateUser(user.id, { role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' });
    setLoading(false);
    router.refresh();
  };

  const handleBan = async () => {
    const reason = prompt('Alasan ban:');
    if (!reason) return;
    setLoading(true);
    await adminApi.banUser(user.id, reason);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" className="gap-1" disabled={loading} onClick={handleToggleAdmin}>
        <ShieldCheck className="h-3.5 w-3.5" />
        {user.role === 'ADMIN' ? 'Cabut Admin' : 'Jadikan Admin'}
      </Button>
      {user.role !== 'ADMIN' && (
        <Button size="sm" variant="destructive" className="gap-1" disabled={loading} onClick={handleBan}>
          <Ban className="h-3.5 w-3.5" />Ban
        </Button>
      )}
    </div>
  );
}
