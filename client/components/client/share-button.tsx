'use client';

import { useState } from 'react';
import { Share2, Check, Copy, MessageCircle, Twitter, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="flex-shrink-0 rounded-xl h-9 w-9">
          <Share2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="end">
        <div className="space-y-1">
          <a href={waUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 text-sm transition-colors w-full">
            <MessageCircle className="h-4 w-4 text-emerald-500" /> WhatsApp
          </a>
          <a href={twitterUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 text-sm transition-colors w-full">
            <Twitter className="h-4 w-4 text-sky-500" /> Twitter / X
          </a>
          <a href={fbUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 text-sm transition-colors w-full">
            <Facebook className="h-4 w-4 text-blue-600" /> Facebook
          </a>
          <button onClick={copyLink}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 text-sm transition-colors w-full">
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
            {copied ? 'Tersalin!' : 'Salin Link'}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
