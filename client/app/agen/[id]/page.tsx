import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BadgeCheck, Building2, Calendar, Star } from 'lucide-react';
import { PropertyCard } from '@/components/property/property-card';
import { AgentReviews } from '@/components/client/agent-reviews';
import { serverApi } from '@/lib/server/api';

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const { user } = await serverApi.getAgentProfile(id);
    return { title: `${user.name} — Agen PropertyHub`, robots: { index: true } };
  } catch {
    return { title: 'Agen tidak ditemukan' };
  }
}

export default async function AgentProfilePage({ params }: Props) {
  const { id } = await params;
  let data: any;
  let reviewData: any = { reviews: [], avgRating: null, totalReviews: 0 };

  try { data = await serverApi.getAgentProfile(id); } catch { notFound(); }
  try { reviewData = await serverApi.getAgentReviews(id); } catch {}

  const { user, properties } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Agent card */}
        <div className="bg-white rounded-2xl border border-border/60 p-6 mb-8 flex items-start gap-5">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl flex-shrink-0">
            {user.avatar
              ? <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-full object-cover" />
              : user.name.charAt(0).toUpperCase()
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{user.name}</h1>
              {user.verified && (
                <span className="flex items-center gap-1 text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                  <BadgeCheck className="h-3.5 w-3.5" />Terverifikasi
                </span>
              )}
            </div>
            {user.company && <p className="text-sm text-muted-foreground mt-0.5">{user.company}</p>}
            {user.license && <p className="text-xs text-muted-foreground mt-0.5">Lisensi: {user.license}</p>}
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {properties.length} listing aktif
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Bergabung {new Date(user.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </span>
              {reviewData.avgRating && (
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {reviewData.avgRating} ({reviewData.totalReviews} ulasan)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Listings */}
          <div className="lg:col-span-2">
            <h2 className="font-semibold mb-4">Listing Aktif ({properties.length})</h2>
            {properties.length === 0 ? (
              <div className="bg-white rounded-2xl border border-border/60 py-12 text-center text-muted-foreground text-sm">
                Belum ada listing aktif
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {properties.map((p: any) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div>
            <AgentReviews
              agentId={id}
              initialReviews={reviewData.reviews}
              avgRating={reviewData.avgRating}
              totalReviews={reviewData.totalReviews}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
