'use client';

import { useState } from 'react';
import { Play, X, Video as VideoIcon } from 'lucide-react';

export interface VideoItem {
  id: string;
  url?: string | null;
  storagePath?: string | null;
  thumbnailUrl?: string | null;
  title: string;
  description?: string | null;
  type: string;
  featured?: boolean;
}

/**
 * Convert any video URL into a YouTube/Vimeo embed URL.
 * Supports:
 *   - https://www.youtube.com/watch?v=ID
 *   - https://youtu.be/ID
 *   - https://www.youtube.com/embed/ID
 *   - https://vimeo.com/ID
 *   - https://player.vimeo.com/video/ID
 */
function toEmbedUrl(rawUrl: string): { embedUrl: string; provider: string } | null {
  try {
    const u = new URL(rawUrl);
    // YouTube
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.slice(1);
      return { embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`, provider: 'youtube' };
    }
    if (u.hostname.endsWith('youtube.com')) {
      if (u.pathname === '/watch') {
        const id = u.searchParams.get('v');
        if (id) return { embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`, provider: 'youtube' };
      }
      if (u.pathname.startsWith('/embed/')) {
        return { embedUrl: rawUrl, provider: 'youtube' };
      }
    }
    // Vimeo
    if (u.hostname === 'vimeo.com') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id) return { embedUrl: `https://player.vimeo.com/video/${id}`, provider: 'vimeo' };
    }
    if (u.hostname.endsWith('player.vimeo.com')) {
      return { embedUrl: rawUrl, provider: 'vimeo' };
    }
    // Fallback — return as-is (may not play in iframe)
    return { embedUrl: rawUrl, provider: 'external' };
  } catch {
    return null;
  }
}

export function VideoPlayer({ video }: { video: VideoItem }) {
  const [playing, setPlaying] = useState(false);

  // For uploaded files, just render a <video> tag
  if (video.storagePath && !video.url) {
    return (
      <div className="rounded-xl overflow-hidden bg-black aspect-video relative">
        <video
          src={video.storagePath}
          poster={video.thumbnailUrl ?? undefined}
          controls
          className="w-full h-full object-contain"
          preload="metadata"
        />
      </div>
    );
  }

  // For external URLs (YouTube/Vimeo), render thumbnail + click to play
  if (video.url) {
    const embed = toEmbedUrl(video.url);
    if (!embed) return null;

    if (playing && embed) {
      return (
        <div className="rounded-xl overflow-hidden bg-black aspect-video relative">
          <iframe
            src={embed.embedUrl}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className="block w-full rounded-xl overflow-hidden bg-black aspect-video relative group focus:outline-none focus:ring-2 focus:ring-forest"
        aria-label={`Lire la vidéo: ${video.title}`}
      >
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-charcoal to-forest" />
        )}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-14 h-14 rounded-full bg-forest flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="h-6 w-6 text-white ml-0.5" fill="white" />
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3 text-left">
          <p className="text-white text-sm font-semibold drop-shadow">{video.title}</p>
          {video.description && (
            <p className="text-white/80 text-xs mt-0.5 line-clamp-1 drop-shadow">{video.description}</p>
          )}
        </div>
      </button>
    );
  }

  return null;
}

/**
 * VideoSection - renders a list of videos for a project or apartment.
 * If empty, returns null (no UI clutter).
 */
export function VideoSection({ videos, title = 'Vidéo' }: { videos: VideoItem[]; title?: string }) {
  if (!videos.length) return null;
  const featured = videos.filter((v) => v.featured);
  const others = videos.filter((v) => !v.featured);
  const main = featured[0] ?? videos[0];
  const rest = [...videos.filter((v) => v.id !== main.id)];

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-charcoal flex items-center gap-2">
        <VideoIcon className="h-5 w-5 text-forest" /> {title}
      </h2>
      <div className="space-y-4">
        <VideoPlayer video={main} />
        {rest.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {rest.map((v) => (
              <div key={v.id} className="space-y-1">
                <VideoPlayer video={v} />
                <p className="text-xs text-muted-foreground truncate">{v.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
