import Link from 'next/link';
import { serverApi } from '@/lib/server/api';
import { Bookmark, Search } from 'lucide-react';
import { DeleteSavedSearchButton } from '@/components/client/delete-saved-search-button';

export const metadata = { title: 'Pencarian Tersimpan — Dashboard' };

export default async function SavedSearchesPage() {
  let searches: any[] = [];
  try { searches = await serverApi.getSavedSearches(); } catch {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2"><Bookmark className="h-5 w-5" />Pencarian Tersimpan</h1>
        <p className="text-sm text-muted-foreground mt-1">Akses cepat ke pencarian favorit Anda</p>
      </div>

      {searches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/60 py-16 text-center">
          <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold">Belum ada pencarian tersimpan</p>
          <p className="text-sm text-muted-foreground mt-1">Klik "Simpan Pencarian" saat browsing listing</p>
          <Link href="/jual" className="text-sm text-primary hover:underline mt-3 inline-block">Mulai cari properti →</Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {searches.map((s: any) => (
            <div key={s.id} className="bg-white rounded-xl border border-border/60 px-4 py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground truncate">{s.url}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href={s.url} className="text-xs text-primary hover:underline font-medium">Lihat →</Link>
                <DeleteSavedSearchButton id={s.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
