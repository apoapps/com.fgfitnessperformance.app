/**
 * Video URL parsing utilities for YouTube, Vimeo, and TikTok
 */

export type VideoProvider = 'youtube' | 'vimeo' | 'tiktok' | 'instagram' | 'unknown';

export interface VideoInfo {
  provider: VideoProvider;
  embedUrl: string | null;
  videoId: string | null;
}

/**
 * Extract YouTube video ID from various URL formats
 * Supports: youtube.com/watch?v=, youtu.be/, youtube.com/embed/
 */
export function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Get YouTube embed URL from a YouTube video URL
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  // Use youtube-nocookie for privacy and better embed compatibility
  return `https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1&showinfo=0`;
}

/**
 * Extract Vimeo video ID from URL
 * Supports: vimeo.com/123456789, player.vimeo.com/video/123456789
 */
export function getVimeoVideoId(url: string): string | null {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Get Vimeo embed URL from a Vimeo video URL
 */
export function getVimeoEmbedUrl(url: string): string | null {
  const videoId = getVimeoVideoId(url);
  if (!videoId) return null;
  return `https://player.vimeo.com/video/${videoId}?playsinline=1`;
}

/**
 * Extract TikTok video ID from URL
 * Supports: tiktok.com/@user/video/123456789
 */
export function getTikTokVideoId(url: string): string | null {
  const pattern = /tiktok\.com\/@[^/]+\/video\/(\d+)/;
  const match = url.match(pattern);
  return match ? match[1] : null;
}

/**
 * Get TikTok embed URL from a TikTok video URL
 */
export function getTikTokEmbedUrl(url: string): string | null {
  const videoId = getTikTokVideoId(url);
  if (!videoId) return null;
  return `https://www.tiktok.com/embed/v2/${videoId}`;
}

/**
 * Detect video provider from URL
 */
export function detectVideoProvider(url: string): VideoProvider {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.includes('vimeo.com')) {
    return 'vimeo';
  }
  if (url.includes('tiktok.com')) {
    return 'tiktok';
  }
  if (url.includes('instagram.com')) {
    return 'instagram';
  }
  return 'unknown';
}

/**
 * Get thumbnail URL for a video
 * YouTube provides direct thumbnail access, others return null
 */
export function getThumbnailUrl(url: string): string | null {
  const provider = detectVideoProvider(url);

  switch (provider) {
    case 'youtube': {
      const videoId = getYouTubeVideoId(url);
      if (videoId) {
        // Use maxresdefault for highest quality, falls back to hqdefault
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
      return null;
    }
    case 'vimeo':
      // Vimeo requires an API call for thumbnails, return null for now
      return null;
    case 'tiktok':
      // TikTok requires an API call for thumbnails, return null for now
      return null;
    case 'instagram':
      // Instagram requires an API call for thumbnails, return null for now
      return null;
    default:
      return null;
  }
}

/**
 * Get embed URL for any supported video provider
 * Returns null if URL is not supported or cannot be parsed
 */
export function getEmbedUrl(url: string): string | null {
  const provider = detectVideoProvider(url);

  switch (provider) {
    case 'youtube':
      return getYouTubeEmbedUrl(url);
    case 'vimeo':
      return getVimeoEmbedUrl(url);
    case 'tiktok':
      return getTikTokEmbedUrl(url);
    default:
      return null;
  }
}

/**
 * Get full video info including provider, embed URL, and video ID
 */
export function getVideoInfo(url: string): VideoInfo {
  const provider = detectVideoProvider(url);
  let videoId: string | null = null;
  let embedUrl: string | null = null;

  switch (provider) {
    case 'youtube':
      videoId = getYouTubeVideoId(url);
      embedUrl = getYouTubeEmbedUrl(url);
      break;
    case 'vimeo':
      videoId = getVimeoVideoId(url);
      embedUrl = getVimeoEmbedUrl(url);
      break;
    case 'tiktok':
      videoId = getTikTokVideoId(url);
      embedUrl = getTikTokEmbedUrl(url);
      break;
  }

  return { provider, embedUrl, videoId };
}
