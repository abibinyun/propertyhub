'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { reviewsApi } from '@/lib/api/reviews';
import { cn } from '@/lib/utils';

interface Props {
  agentId: string;
  onSuccess: () => void;
}

export function ReviewForm({ agentId, onSuccess }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!rating) return;
    setLoading(true);
    setError('');
    try {
      await reviewsApi.create(agentId, { rating, comment: comment.trim() || undefined });
      onSuccess();
    } catch (e: any) {
      setError(e?.message || 'Gagal mengirim review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRating(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
          >
            <Star className={cn('h-7 w-7 transition-colors', (hover || rating) >= s ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground')} />
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Tulis ulasan (opsional)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="text-sm resize-none"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button size="sm" disabled={!rating || loading} onClick={submit}>
        {loading ? 'Mengirim...' : 'Kirim Ulasan'}
      </Button>
    </div>
  );
}
