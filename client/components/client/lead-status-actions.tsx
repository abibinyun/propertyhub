'use client';

import { useState } from 'react';
import { leadsApi } from '@/lib/api/leads';
import { LeadStatus } from '@/types/lead';
import { useRouter } from 'next/navigation';

const STATUSES: { value: LeadStatus; label: string }[] = [
  { value: 'NEW', label: 'Baru' },
  { value: 'CONTACTED', label: 'Dihubungi' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'CLOSED', label: 'Selesai' },
  { value: 'LOST', label: 'Batal' },
];

export function LeadStatusActions({ leadId, currentStatus }: { leadId: string; currentStatus: LeadStatus }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const update = async (status: LeadStatus) => {
    if (status === currentStatus || loading) return;
    setLoading(true);
    try {
      await leadsApi.updateStatus(leadId, status);
      router.refresh();
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  return (
    <select
      value={currentStatus}
      onChange={(e) => update(e.target.value as LeadStatus)}
      disabled={loading}
      className="text-xs border border-border rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-ring flex-shrink-0 cursor-pointer disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  );
}
