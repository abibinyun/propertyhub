import { redirect } from 'next/navigation';
import { serverApi } from '@/lib/server/api';
import { getToken } from '@/lib/server/auth';
import { FavoriteList } from '@/components/client/favorite-list';
import { Heart } from 'lucide-react';

export default async function FavoritesPage() {
  const token = await getToken();
  if (!token) redirect('/login?redirect=/dashboard/favorites');

  const favorites = await serverApi.getFavorites().catch(() => []);

  return (
    <div className="py-2 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center">
          <Heart className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Favorit Saya</h1>
          <p className="text-sm text-muted-foreground">{favorites.length} properti tersimpan</p>
        </div>
      </div>
      <FavoriteList initialFavorites={favorites} />
    </div>
  );
}
