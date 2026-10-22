export type VideoProvider = 'youtube' | 'vimeo';
export interface ParsedVideo {
  provider: VideoProvider;
  id: string;
}

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set(['youtube.com', 'youtube-nocookie.com', 'music.youtube.com']);

/** Accepts any YouTube or Vimeo link Glenn might paste; returns null for anything else. */
export function parseVideoUrl(input: string): ParsedVideo | null {
  const raw = input.trim();
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m)\./, '');

  if (host === 'youtu.be') {
    const id = url.pathname.split('/')[1] ?? '';
    return YOUTUBE_ID.test(id) ? { provider: 'youtube', id } : null;
  }
  if (YOUTUBE_HOSTS.has(host)) {
    const v = url.searchParams.get('v');
    if (v && YOUTUBE_ID.test(v)) return { provider: 'youtube', id: v };
    const match = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})(?:\/|$)/);
    return match ? { provider: 'youtube', id: match[1] } : null;
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const match = url.pathname.match(/(?:^|\/)(\d{6,})(?:\/|$)/);
    return match ? { provider: 'vimeo', id: match[1] } : null;
  }
  return null;
}

/** The player URL loaded into the iframe after a click. */
export function embedUrl(video: ParsedVideo, start = 0): string {
  const seconds = Math.floor(start);
  if (video.provider === 'youtube') {
    const params = new URLSearchParams({ autoplay: '1', rel: '0' });
    if (seconds > 0) params.set('start', String(seconds));
    return `https://www.youtube-nocookie.com/embed/${video.id}?${params}`;
  }
  const params = new URLSearchParams({ autoplay: '1', dnt: '1' });
  return `https://player.vimeo.com/video/${video.id}?${params}${seconds > 0 ? `#t=${seconds}s` : ''}`;
}

/** The normal watch page: the fallback link when JavaScript is off. */
export function watchUrl(video: ParsedVideo, start = 0): string {
  const seconds = Math.floor(start);
  if (video.provider === 'youtube') {
    return `https://www.youtube.com/watch?v=${video.id}${seconds > 0 ? `&t=${seconds}s` : ''}`;
  }
  return `https://vimeo.com/${video.id}${seconds > 0 ? `#t=${seconds}s` : ''}`;
}

export function youtubeThumbnail(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
