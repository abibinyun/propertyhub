'use client';

import { useRouter, usePathname } from 'next/navigation';

const TABS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Disetujui' },
  { value: 'REJECTED', label: 'Ditolak' },
  { value: 'FLAGGED', label: 'Diflag' },
];

export function ModerationStatusTabs({ currentStatus }: { currentStatus: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex gap-2 border-b">
      {TABS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => router.push(`${pathname}?status=${value}`)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            currentStatus === value
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
