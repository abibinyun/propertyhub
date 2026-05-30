'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCallback, useTransition } from 'react';

const ROLES = ['', 'USER', 'ADMIN'];
const ROLE_LABEL: Record<string, string> = { '': 'Semua', USER: 'User', ADMIN: 'Admin' };

export function AdminUsersFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const currentRole = params.get('role') ?? '';

  const update = useCallback((key: string, value: string) => {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    startTransition(() => router.push(`?${p.toString()}`));
  }, [params, router]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          defaultValue={params.get('search') ?? ''}
          onChange={(e) => update('search', e.target.value)}
          placeholder="Cari nama, email..."
          className="pl-9 rounded-xl h-9 text-sm"
        />
      </div>
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {ROLES.map((r) => (
          <button key={r} onClick={() => update('role', r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              currentRole === r ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {ROLE_LABEL[r]}
          </button>
        ))}
      </div>
    </div>
  );
}
