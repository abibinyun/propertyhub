'use client';

import { useRouter, usePathname } from 'next/navigation';

const TABS = [
  { value: 'PENDING', label: 'Pending', color: 'text-amber-600 border-amber-500' },
  { value: 'APPROVED', label: 'Disetujui', color: 'text-emerald-600 border-emerald-500' },
  { value: 'REJECTED', label: 'Ditolak', color: 'text-red-600 border-red-500' },
  { value: 'FLAGGED', label: 'Diflag', color: 'text-orange-600 border-orange-500' },
];

export function ModerationStatusTabs({ currentStatus }: { currentStatus: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
      {TABS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => router.push(`${pathname}?status=${value}`)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentStatus === value
              ? 'bg-white shadow-sm text-slate-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
