'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  data: { date: string; label: string; leads: number; views?: number }[];
}

export function PropertyAnalyticsChart({ data }: Props) {
  const hasData = data.some((d) => d.leads > 0 || (d.views ?? 0) > 0);
  const hasViews = data.some((d) => (d.views ?? 0) > 0);

  if (!hasData) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
        Belum ada data dalam 30 hari terakhir
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={4} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }}
          labelFormatter={(label) => `Tanggal: ${label}`}
        />
        {hasViews && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {hasViews && <Bar dataKey="views" name="Views" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={24} />}
        <Bar dataKey="leads" name="Leads" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
