import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, Building2, Calendar, Star, Phone, Mail, MessageCircle, Share2 } from 'lucide-react';
import { PropertyCard } from '@/components/property/property-card';
import { AgentReviews } from '@/components/client/agent-reviews';
import { ShareButton } from '@/components/client/share-button';
import { serverApi } from '@/lib/server/api';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface Props { params: Promise<{ handle: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  try {
    const { user } = await serverApi.getAgentProfile(handle);
    return {
      title: `${user.name} — Agen Properti`,
      description: user.bio || `${user.name} memiliki ${user._count?.properties ?? 0} listing properti aktif.`,
      openGraph: {
        title: user.name,
        description: user.bio || '',
        images: user.avatar ? [user.avatar] : [],
      },
      alternates: { canonical: `${BASE_URL}/agen/${user.username ?? user.id}` },
    };
  } catch {
    return { title: 'Agen tidak ditemukan' };
  }
}

export default async function AgentProfilePage({ params }: Props) {
  const { handle } = await params;
  let data: any;
  let reviewData: any = { reviews: [], avgRating: null, totalReviews: 0 };

  try { data = await serverApi.getAgentProfile(handle); } catch { notFound(); }
  try { reviewData = await serverApi.getAgentReviews(data.user.id); } catch {}

  const { user, properties } = data;
  const profileUrl = `${BASE_URL}/agen/${user.username ?? user.id}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">

        {/* Agent card */}
        <div className="bg-white rounded-2xl border border-border/60 p-6 mb-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name} width={80} height={80} className="h-20 w-20 rounded-full object-cover ring-2 ring-border" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl ring-2 ring-border">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold">{user.name}</h1>
                    {user.verified && (
                      <span className="flex items-center gap-1 text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                        <BadgeCheck className="h-3.5 w-3.5" />Terverifikasi
                      </span>
                    )}
                  </div>
                  {user.username && <p className="text-xs text-muted-foreground mt-0.5">@{user.username}</p>}
                  {user.company && <p className="text-sm text-muted-foreground mt-0.5">{user.company}</p>}
                  {user.license && <p className="text-xs text-muted-foreground">Lisensi: {user.license}</p>}
                </div>

                {/* Share */}
                <ShareButton url={profileUrl} title={`Profil Agen ${user.name}`} />
              </div>

              {/* Bio */}
              {user.bio && <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{user.bio}</p>}

              {/* Stats */}
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

              {/* Kontak */}
              {(user.phone || user.email) && (
                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  {user.phone && (
                    <a href={`https://wa.me/${user.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors font-medium">
                      <MessageCircle className="h-4 w-4" />WhatsApp
                    </a>
                  )}
                  {user.phone && (
                    <a href={`tel:${user.phone}`}
                      className="flex items-center gap-1.5 text-sm bg-slate-50 text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
                      <Phone className="h-4 w-4" />{user.phone}
                    </a>
                  )}
                  {user.email && (
                    <a href={`mailto:${user.email}`}
                      className="flex items-center gap-1.5 text-sm bg-slate-50 text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
                      <Mail className="h-4 w-4" />{user.email}
                    </a>
                  )}
                </div>
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
              agentId={user.id}
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
