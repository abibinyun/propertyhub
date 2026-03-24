'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  currentPage: number;
  totalPages: number;
}

export function PaginationControls({ currentPage, totalPages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navigate = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2">
      <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => navigate(currentPage - 1)}>
        <ChevronLeft className="h-4 w-4 mr-1" />
        Sebelumnya
      </Button>
      <div className="flex items-center gap-1">
        {pages.map((p) => (
          <Button
            key={p}
            variant={currentPage === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => navigate(p)}
          >
            {p}
          </Button>
        ))}
      </div>
      <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => navigate(currentPage + 1)}>
        Selanjutnya
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
