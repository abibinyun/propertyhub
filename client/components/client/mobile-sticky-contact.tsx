'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, MessageCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/context/auth-context';

interface Props {
  phone?: string;
  name?: string;
  price: string;
  propertyTitle?: string;
}

export function MobileStickyContact({ phone, name, price, propertyTitle }: Props) {
  const { user } = useAuth();
  const pathname = usePathname();
  const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border/60 px-4 py-3 flex items-center gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{name ?? 'Agen Properti'}</p>
        <p className="text-sm font-bold text-primary truncate">{price}</p>
      </div>

      {user ? (
        <>
          {phone && (
            <a href={`tel:${phone}`}>
              <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 flex-shrink-0">
                <Phone className="h-4 w-4" />
              </Button>
            </a>
          )}
          {phone && (
            <a href={`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Halo, saya tertarik dengan properti "${propertyTitle ?? 'ini'}". Mohon info lebih lanjut.`)}`} target="_blank" rel="noopener noreferrer">
              <Button className="gap-2 rounded-xl font-semibold flex-shrink-0">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            </a>
          )}
        </>
      ) : (
        <Button asChild className="gap-2 rounded-xl font-semibold flex-shrink-0">
          <Link href={loginUrl}>
            <Lock className="h-4 w-4" />
            Login untuk Kontak
          </Link>
        </Button>
      )}
    </div>
  );
}
