'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { timeAgo, cn } from '@/lib/utils';
import { ReviewForm } from './review-form';
import { Button } from '@/components/ui/button';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  author: { name: string; avatar?: string };
}

interface Props {
  agentId: string;
  initialReviews: Review[];
  avgRating: number | null;
  totalReviews: number;
}

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'h-5 w-5' : 'h-3.5 w-3.5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn(cls, rating >= s ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')} />
      ))}
    </div>
  );
}

export function AgentReviews({ agentId, initialReviews, avgRating, totalReviews }: Props) {
  const [reviews, setReviews] = useState(initialReviews);
  const [avg, setAvg] = useState(avgRating);
  const [total, setTotal] = useState(totalReviews);
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = async () => {
    setShowForm(false);
    // Refetch reviews
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/reviews/agent/${agentId}`);
    const data = await res.json();
    setReviews(data.reviews);
    setAvg(data.avgRating);
    setTotal(data.totalReviews);
  };

  return (
    <div className="bg-white rounded-2xl border border-border/60 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-semibold text-base">Ulasan</h2>
          {avg && (
            <div className="flex items-center gap-2 mt-1">
              <Stars rating={Math.round(avg)} size="md" />
              <span className="font-bold text-lg">{avg}</span>
              <span className="text-sm text-muted-foreground">({total} ulasan)</span>
            </div>
          )}
        </div>
        {!showForm && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
            Tulis Ulasan
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-5 p-4 bg-slate-50 rounded-xl">
          <ReviewForm agentId={agentId} onSuccess={handleSuccess} />
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">Belum ada ulasan</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="flex gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                {r.author.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{r.author.name}</span>
                  <Stars rating={r.rating} />
                  <span className="text-xs text-muted-foreground ml-auto">{timeAgo(r.createdAt)}</span>
                </div>
                {r.comment && <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
