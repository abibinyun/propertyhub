'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const TYPE_ICON: Record<string, string> = {
  lead_received: '💬',
  property_approved: '✅',
  property_rejected: '❌',
  property_flagged: '⚠️',
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<{ items: any[]; unread: number }>({ items: [], unread: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const fetch_ = () =>
    fetch(`${API_URL}/notifications`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setData(d))
      .catch(() => {});

  useEffect(() => {
    fetch_();
    const id = setInterval(fetch_, 30_000);
    return () => clearInterval(id);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAll = async () => {
    await fetch(`${API_URL}/notifications/read-all`, { method: 'PATCH', credentials: 'include' });
    setData(d => ({ ...d, unread: 0, items: d.items.map(i => ({ ...i, read: true })) }));
  };

  const markOne = async (id: string) => {
    await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PATCH', credentials: 'include' });
    setData(d => ({ ...d, unread: Math.max(0, d.unread - 1), items: d.items.map(i => i.id === id ? { ...i, read: true } : i) }));
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative h-9 w-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
      >
        <Bell className="h-4.5 w-4.5" />
        {data.unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
            {data.unread > 9 ? '9+' : data.unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl border border-border/60 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
            <p className="font-semibold text-sm">Notifikasi</p>
            <div className="flex items-center gap-2">
              {data.unread > 0 && (
                <button onClick={markAll} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <CheckCheck className="h-3.5 w-3.5" />Tandai semua
                </button>
              )}
              <button onClick={() => setOpen(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border/30">
            {data.items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Tidak ada notifikasi</p>
            ) : data.items.map(n => (
              <div
                key={n.id}
                className={cn('px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer', !n.read && 'bg-primary/5')}
                onClick={() => { markOne(n.id); if (n.url) { setOpen(false); window.location.href = n.url; } }}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-base flex-shrink-0 mt-0.5">{TYPE_ICON[n.type] ?? '🔔'}</span>
                  <div className="min-w-0">
                    <p className={cn('text-sm', !n.read && 'font-semibold')}>{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(n.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
