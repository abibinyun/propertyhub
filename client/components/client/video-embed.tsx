'use client';

interface Props {
  url: string;
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function VideoEmbed({ url }: Props) {
  const ytId = getYouTubeId(url);

  if (ytId) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${ytId}`}
          title="Video Properti"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  // Generic video URL (mp4, etc)
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
      <video src={url} controls className="w-full h-full" />
    </div>
  );
}
