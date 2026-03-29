'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem,
  NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Home, Building2, Warehouse, Trees, Store, Hotel,
  MapPin, TrendingUp, Star, LayoutDashboard, Heart,
  Settings, LogOut, Plus, ShieldCheck, Menu, ChevronRight,
  Phone, Search, Bell, X, Megaphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchBar } from '@/components/client/search-bar';
import { NotificationBell } from '@/components/client/notification-bell';

const JUAL_MENU = {
  types: [
    { icon: Home, label: 'Rumah', href: '/jual/rumah', desc: 'Rumah tapak siap huni' },
    { icon: Building2, label: 'Apartemen', href: '/jual/apartemen', desc: 'Unit apartemen & kondominium' },
    { icon: Trees, label: 'Tanah', href: '/jual/tanah', desc: 'Kavling & lahan investasi' },
    { icon: Store, label: 'Komersial', href: '/jual/komersial', desc: 'Ruko, gedung & kantor' },
    { icon: Hotel, label: 'Villa', href: '/jual/villa', desc: 'Villa & resort' },
    { icon: Warehouse, label: 'Gudang', href: '/jual/gudang', desc: 'Gudang & logistik' },
  ],
  cities: [
    { label: 'Jakarta', href: '/jual/jakarta' },
    { label: 'Surabaya', href: '/jual/surabaya' },
    { label: 'Bandung', href: '/jual/bandung' },
    { label: 'Bali', href: '/jual/bali' },
    { label: 'Yogyakarta', href: '/jual/yogyakarta' },
    { label: 'Semarang', href: '/jual/semarang' },
  ],
};

const SEWA_MENU = {
  types: [
    { icon: Home, label: 'Rumah', href: '/sewa/rumah', desc: 'Rumah sewa bulanan & tahunan' },
    { icon: Building2, label: 'Apartemen', href: '/sewa/apartemen', desc: 'Apartemen furnished & unfurnished' },
    { icon: Store, label: 'Komersial', href: '/sewa/komersial', desc: 'Ruko & ruang usaha' },
    { icon: Hotel, label: 'Villa', href: '/sewa/villa', desc: 'Villa harian & mingguan' },
    { icon: Warehouse, label: 'Gudang', href: '/sewa/gudang', desc: 'Gudang & cold storage' },
    { icon: Trees, label: 'Tanah', href: '/sewa/tanah', desc: 'Lahan sewa jangka panjang' },
  ],
  cities: [
    { label: 'Jakarta', href: '/sewa/jakarta' },
    { label: 'Surabaya', href: '/sewa/surabaya' },
    { label: 'Bandung', href: '/sewa/bandung' },
    { label: 'Bali', href: '/sewa/bali' },
    { label: 'Yogyakarta', href: '/sewa/yogyakarta' },
    { label: 'Semarang', href: '/sewa/semarang' },
  ],
};

function MegaMenuContent({ data, status }: { data: typeof JUAL_MENU; status: string }) {
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTypeEnter = (type: string) => {
    if (clearTimer.current) clearTimeout(clearTimer.current);
    setHoveredType(type);
  };

  const handleTypeLeave = () => {
    clearTimer.current = setTimeout(() => setHoveredType(null), 300);
  };

  const handleCityEnter = () => {
    if (clearTimer.current) clearTimeout(clearTimer.current);
  };

  return (
    <div className="w-[640px] p-6">
      <div className="grid grid-cols-2 gap-8">
        {/* Tipe Properti */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Tipe Properti
          </p>
          <div className="space-y-1">
            {data.types.map((item) => (
              <NavigationMenuLink asChild key={item.href}>
                <Link
                  href={item.href}
                  onMouseEnter={() => handleTypeEnter(item.href.split('/').pop() ?? '')}
                  onMouseLeave={handleTypeLeave}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-accent transition-colors group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </Link>
              </NavigationMenuLink>
            ))}
          </div>
        </div>

        {/* Kota Populer + CTA */}
        <div className="space-y-6" onMouseEnter={handleCityEnter} onMouseLeave={handleTypeLeave}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Kota Populer
            </p>
            {hoveredType ? (
              <>
                <p className="text-xs text-primary mb-3">
                  Filter: {data.types.find(t => t.href.endsWith(hoveredType))?.label}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {data.cities.map((city) => {
                    const citySlug = city.href.split('/').pop();
                    return (
                      <NavigationMenuLink asChild key={city.href}>
                        <Link
                          href={`/${status}/${citySlug}/${hoveredType}`}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                        >
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          {city.label}
                        </Link>
                      </NavigationMenuLink>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground mt-2">
                Hover tipe properti untuk filter per kota
              </p>
            )}
          </div>

          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              {status === 'jual' ? (
                <TrendingUp className="h-4 w-4 text-primary" />
              ) : (
                <Star className="h-4 w-4 text-primary" />
              )}
              <p className="text-sm font-semibold">
                {status === 'jual' ? 'Properti Unggulan' : 'Rekomendasi Sewa'}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {status === 'jual'
                ? 'Temukan properti terbaik dengan harga terjangkau'
                : 'Hunian nyaman sesuai budget kamu'}
            </p>
            <NavigationMenuLink asChild>
              <Link
                href={`/${status}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Lihat Semua <ChevronRight className="h-3 w-3" />
              </Link>
            </NavigationMenuLink>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileMegaSection({
  data, status, label, onNavigate,
}: { data: typeof JUAL_MENU; status: string; label: string; onNavigate: () => void }) {
  const [activeType, setActiveType] = useState<string | null>(null);

  const handleTypeClick = (e: React.MouseEvent, typeSlug: string, href: string) => {
    if (activeType === typeSlug) {
      // Second tap → navigate directly
      onNavigate();
      return;
    }
    e.preventDefault();
    setActiveType(typeSlug);
  };

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{label}</p>
      <div className="space-y-1">
        {data.types.map((item) => {
          const typeSlug = item.href.split('/').pop()!;
          const isActive = activeType === typeSlug;
          return (
            <div key={item.href}>
              {/* Type row */}
              <Link
                href={item.href}
                onClick={(e) => handleTypeClick(e, typeSlug, item.href)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                  isActive ? 'bg-accent' : 'hover:bg-accent',
                )}
              >
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg transition-colors flex-shrink-0',
                  isActive ? 'bg-primary/20' : 'bg-primary/10',
                )}>
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium flex-1">{item.label}</span>
                <ChevronRight className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform duration-200',
                  isActive && 'rotate-90',
                )} />
              </Link>

              {/* Cities expand */}
              {isActive && (
                <div className="ml-11 mt-1 mb-2 grid grid-cols-2 gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  {data.cities.map((city) => {
                    const citySlug = city.href.split('/').pop();
                    return (
                      <Link
                        key={city.href}
                        href={`/${status}/${citySlug}/${typeSlug}`}
                        onClick={onNavigate}
                        className="flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        {city.label}
                      </Link>
                    );
                  })}
                  {/* Lihat semua kota */}
                  <Link
                    href={`/${status}/${typeSlug}`}
                    onClick={onNavigate}
                    className="col-span-2 flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm text-primary hover:bg-primary/5 transition-colors font-medium"
                  >
                    <ChevronRight className="h-3 w-3" />
                    Semua kota
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [announcement, setAnnouncement] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Leads count badge — hanya tampil jika user punya leads baru (placeholder)
  const hasNotif = false;

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* Announcement Bar */}
      {announcement && (
        <div className="bg-primary text-primary-foreground text-xs py-2 px-4">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Megaphone className="h-3.5 w-3.5 flex-shrink-0" />
              <span>🎉 Pasang iklan properti <strong>GRATIS</strong> sekarang — jangkau ribuan calon pembeli!</span>
              <Link href="/register" className="underline underline-offset-2 font-semibold hover:no-underline hidden sm:inline">
                Daftar Sekarang →
              </Link>
            </div>
            <button onClick={() => setAnnouncement(false)} className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className={cn(
        'w-full transition-all duration-200',
        scrolled
          ? 'bg-background/98 backdrop-blur-md border-b shadow-sm'
          : 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b',
      )}>
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* Logo + Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Home className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg tracking-tight">PropertyHub</span>
              </Link>

              <NavigationMenu>
                <NavigationMenuList className="gap-1">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={cn('text-sm font-medium', pathname.startsWith('/jual') && 'text-primary')}>
                      Beli Properti
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <MegaMenuContent data={JUAL_MENU} status="jual" />
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={cn('text-sm font-medium', pathname.startsWith('/sewa') && 'text-primary')}>
                      Sewa Properti
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <MegaMenuContent data={SEWA_MENU} status="sewa" />
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/jual" className={cn(
                        'inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none',
                        pathname === '/jual' && 'text-primary',
                      )}>
                        Semua Properti
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Mobile Logo */}
            <Link href="/" className="flex lg:hidden items-center gap-2 flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Home className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg tracking-tight">PropertyHub</span>
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">

              {/* Search — desktop */}
              <div className="hidden lg:flex items-center">
                {searchOpen ? (
                  <SearchBar
                    autoFocus
                    onClose={() => { setSearchOpen(false); }}
                    className="w-80 animate-in fade-in slide-in-from-right-4 duration-200"
                  />
                ) : (
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setSearchOpen(true)}>
                    <Search className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Search mobile */}
              <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" asChild>
                <Link href="/jual"><Search className="h-4 w-4" /></Link>
              </Button>

              {user ? (
                <>
                  {/* Notification bell */}
                  <div className="hidden sm:block">
                    <NotificationBell />
                  </div>

                  <Link href="/dashboard/properties/new" className="hidden sm:block">
                    <Button size="sm" className="gap-1.5 font-medium">
                      <Plus className="h-4 w-4" />Pasang Iklan
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                        <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60">
                      <div className="flex items-center gap-3 p-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <p className="text-sm font-semibold truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/properties" className="cursor-pointer"><Home className="mr-2 h-4 w-4" />Properti Saya</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/favorites" className="cursor-pointer"><Heart className="mr-2 h-4 w-4" />Favorit</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/leads" className="cursor-pointer">
                          <Bell className="mr-2 h-4 w-4" />Leads Masuk
                          {hasNotif && <span className="ml-auto h-2 w-2 rounded-full bg-destructive" />}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/profile" className="cursor-pointer"><Settings className="mr-2 h-4 w-4" />Pengaturan</Link>
                      </DropdownMenuItem>
                      {user.role === 'ADMIN' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/admin" className="cursor-pointer">
                              <ShieldCheck className="mr-2 h-4 w-4 text-orange-500" />
                              <span className="text-orange-500 font-medium">Admin Panel</span>
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />Keluar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:block">
                    <Button variant="ghost" size="sm" className="font-medium">Masuk</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="font-medium">Daftar Gratis</Button>
                  </Link>
                </>
              )}

              {/* Mobile hamburger */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0" aria-describedby={undefined}>
                  <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 p-4 border-b">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <Home className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <span className="font-bold text-lg">PropertyHub</span>
                    </div>

                    {/* Mobile search */}
                    <div className="p-4 border-b">
                      <SearchBar onClose={() => setMobileOpen(false)} autoFocus={false} />
                    </div>

                    <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                      <MobileMegaSection data={JUAL_MENU} status="jual" label="Beli Properti" onNavigate={() => setMobileOpen(false)} />
                      <MobileMegaSection data={SEWA_MENU} status="sewa" label="Sewa Properti" onNavigate={() => setMobileOpen(false)} />
                    </nav>

                    <div className="p-4 border-t space-y-2">
                      {user ? (
                        <>
                          <Link href="/dashboard/properties/new" onClick={() => setMobileOpen(false)}>
                            <Button className="w-full gap-2"><Plus className="h-4 w-4" />Pasang Iklan</Button>
                          </Link>
                          <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                            <Button variant="outline" className="w-full">Dashboard</Button>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link href="/register" onClick={() => setMobileOpen(false)}>
                            <Button className="w-full">Daftar Gratis</Button>
                          </Link>
                          <Link href="/login" onClick={() => setMobileOpen(false)}>
                            <Button variant="outline" className="w-full">Masuk</Button>
                          </Link>
                        </>
                      )}
                      <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>Bantuan: 0800-1234-5678</span>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
