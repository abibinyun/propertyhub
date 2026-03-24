'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Props {
  defaultSearch: string;
  defaultStatus: string;
  tab: string;
  statuses: { value: string; label: string }[];
}

export function LeadsSearchBar({ defaultSearch, defaultStatus, tab, statuses }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const push = useCallback((search: string, status: string) => {
    const u = new URLSearchParams();
    u.set('tab', tab);
    if (search) u.set('search', search);
    if (status) u.set('status', status);
    startTransition(() => router.push(`${pathname}?${u.toString()}`));
  }, [router, pathname, tab]);

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          defaultValue={defaultSearch}
          placeholder={tab === 'received' ? 'Cari nama, telepon, pesan...' : 'Cari properti, pesan...'}
          className="pl-9 pr-9 rounded-xl"
          onChange={(e) => {
            const val = e.target.value;
            const timeout = setTimeout(() => push(val, defaultStatus), 400);
            return () => clearTimeout(timeout);
          }}
        />
        {defaultSearch && (
          <button onClick={() => push('', defaultStatus)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Status filter */}
      <select
        value={defaultStatus}
        onChange={(e) => push(defaultSearch, e.target.value)}
        className={cn('rounded-xl border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:w-40',
          isPending && 'opacity-60')}
      >
        <option value="">Semua Status</option>
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </div>
  );
}
