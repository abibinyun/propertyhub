'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Building2, ShieldCheck, MessageSquare, Flag, Settings, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/moderation', label: 'Moderasi', icon: ShieldCheck },
  { href: '/admin/properties', label: 'Properti', icon: Building2 },
  { href: '/admin/users', label: 'Pengguna', icon: Users },
  { href: '/admin/leads', label: 'Leads', icon: MessageSquare },
  { href: '/admin/reports', label: 'Laporan', icon: Flag },
  { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
];

export function AdminSidebarActive() {
  const pathname = usePathname();
  return (
    <>
      {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-white',
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
            {active && <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-70" />}
          </Link>
        );
      })}
    </>
  );
}
