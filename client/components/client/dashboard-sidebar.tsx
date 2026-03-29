'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Building2, Heart, MessageSquare, User, LayoutDashboard, Plus, Menu, LogOut, ChevronRight, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/lib/context/auth-context';
import { cn } from '@/lib/utils';
import { User as UserType } from '@/types/auth';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/properties', label: 'Properti Saya', icon: Building2 },
  { href: '/dashboard/leads', label: 'Pesan & Leads', icon: MessageSquare },
  { href: '/dashboard/favorites', label: 'Favorit', icon: Heart },
  { href: '/dashboard/saved-searches', label: 'Pencarian Tersimpan', icon: Bookmark },
  { href: '/dashboard/profile', label: 'Profil', icon: User },
];

function NavItem({ href, label, icon: Icon, exact, onClick }: { href: string; label: string; icon: React.ElementType; exact?: boolean; onClick?: () => void }) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link href={href} onClick={onClick}
      className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
        active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-white')}>
      <Icon className="h-4 w-4 flex-shrink-0" />
      {label}
      {active && <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-70" />}
    </Link>
  );
}

function SidebarContent({ user, onNav }: { user: UserType | null; onNav?: () => void }) {
  const { logout } = useAuth();
  return (
    <div className="flex flex-col h-full">
      {/* User info */}
      <div className="p-4 mb-2">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-border/60">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name ?? 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV.map((item) => <NavItem key={item.href} {...item} onClick={onNav} />)}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-border/50 space-y-2 mt-4">
        <Button asChild size="sm" className="w-full gap-2 rounded-xl">
          <Link href="/dashboard/properties/new" onClick={onNav}>
            <Plus className="h-4 w-4" />Pasang Iklan
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="w-full gap-2 rounded-xl text-muted-foreground hover:text-destructive" onClick={logout}>
          <LogOut className="h-4 w-4" />Keluar
        </Button>
      </div>
    </div>
  );
}

export function DashboardSidebar({ user }: { user: UserType | null }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-20 bg-slate-50/50 rounded-2xl border border-border/60 overflow-hidden">
        <SidebarContent user={user} />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed bottom-20 right-4 z-30">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="icon" className="h-12 w-12 rounded-2xl shadow-lg">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0" aria-describedby={undefined}>
            <SheetTitle className="sr-only">Menu Dashboard</SheetTitle>
            <SidebarContent user={user} onNav={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
