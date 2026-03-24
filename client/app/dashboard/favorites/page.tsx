import { redirect } from 'next/navigation';
import { serverApi } from '@/lib/server/api';
import { getToken } from '@/lib/server/auth';
import { FavoriteList } from '@/components/client/favorite-list';
import { Heart } from 'lucide-react';

export default async function FavoritesPage() {
  const token = await getToken();
  if (!token) redirect('/login');

  const favorites = await serverApi.getFavorites();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Favorit Saya</h1>
        <span className="text-muted-foreground">({favorites.length})</span>
      </div>
      <FavoriteList initialFavorites={favorites} />
    </div>
  );
}
