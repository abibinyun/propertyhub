'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/context/auth-context';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGate({ children, fallback }: Props) {
  const { user } = useAuth();
  const pathname = usePathname();
  const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
  const registerUrl = `/register?redirect=${encodeURIComponent(pathname)}`;

  if (user) return <>{children}</>;
  if (fallback) return <>{fallback}</>;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-border/60">
        <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <p className="text-sm text-muted-foreground">Login untuk melihat kontak agen</p>
      </div>
      <div className="flex gap-2">
        <Button asChild className="flex-1 rounded-xl">
          <Link href={loginUrl}>Login</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1 rounded-xl">
          <Link href={registerUrl}>Daftar</Link>
        </Button>
      </div>
    </div>
  );
}
