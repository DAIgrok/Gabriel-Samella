import { Song } from '../types';
import { resolveMediaUrl } from './localMediaStore';

export type AudioEventListener = () => void;

interface YTPlayerInstance {
  loadVideoById: (videoId: string) => void;
  cueVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

interface YTNamespace {
  Player: new (
    elementId: string | HTMLElement,
    options: {
      height?: string | number;
      width?: string | number;
      videoId?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: { target: YTPlayerInstance }) => void;
        onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void;
        onError?: (event: { data: number }) => void;
      };
    }
  ) => YTPlayerInstance;
  PlayerState?: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export function extractYouTubeId(rawUrl?: string): string | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  // Bare 11-char ID support
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const u = new URL(normalized);
    const host = u.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'music.youtube.com' ||
      host === 'youtube-nocookie.com'
    ) {
      const vParam = u.searchParams.get('v');
      if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) {
        return vParam;
      }
      const parts = u.pathname.split('/').filter(Boolean);
      const embedIdx = parts.findIndex((p) => p === 'shorts' || p === 'embed' || p === 'live' || p === 'v');
      if (embedIdx !== -1 && parts[embedIdx + 1] && /^[a-zA-Z0-9_-]{11}$/.test(parts[embedIdx + 1])) {
        return parts[embedIdx + 1];
      }
    }
  } catch {
    // Fallback regex
    const match = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function getYouTubeThumbnailUrl(youtubeId: string): string {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

export async function fetchYouTubeMetadata(
  rawUrl: string
): Promise<{ youtubeId: string; title: string; artist: string; coverUrl: string } | null> {
  const youtubeId = extractYouTubeId(rawUrl);
  if (!youtubeId) return null;

  const fallbackCover = getYouTubeThumbnailUrl(youtubeId);
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 5000);
    const res = await fetch(
      `https://noembed.com/embed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${youtubeId}`)}`,
      { signal: controller.signal }
    );
    window.clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      const rawTitle = typeof data.title === 'string' ? data.title.trim() : '';
      const rawAuthor = typeof data.author_name === 'string' ? data.author_name.replace(/\s*-\s*Topic$/i, '').trim() : '';
      if (rawTitle) {
        // Parse "Artist - Song" if present
        const dashSplit = rawTitle.split(/\s+[-–—]\s+/);
        let parsedArtist = rawAuthor || 'YouTube';
        let parsedTitle = rawTitle;
        if (dashSplit.length >= 2) {
          parsedArtist = dashSplit[0].trim();
          parsedTitle = dashSplit.slice(1).join(' - ').trim();
        }
        return {
          youtubeId,
          title: parsedTitle,
          artist: parsedArtist,
          coverUrl: typeof data.thumbnail_url === 'string' && data.thumbnail_url ? data.thumbnail_url : fallbackCover,
        };
      }
    }
  } catch {
    // Use fallback metadata if offline or CORS/timeout
  }

  return {
    youtubeId,
    title: 'Música do YouTube',
    artist: 'Gabriel & Samella',
    coverUrl: fallbackCover,
  };
}

class RealAudioService {
  private audio: HTMLAudioElement | null = null;
  private ytPlayer: YTPlayerInstance | null = null;
  private ytApiPromise: Promise<YTNamespace | null> | null = null;
  private ytPlayerReadyPromise: Promise<YTPlayerInstance | null> | null = null;
  private ytContainerId = 'nossomundo-yt-hidden-player';
  private ytPollInterval: number | null = null;
  private activeEngine: 'none' | 'html5' | 'youtube' = 'none';
  private pendingYtVideoId: string | null = null;
  private pendingYtAutoPlay: boolean = false;

  private currentSong: Song | null = null;
  private isPlaying: boolean = false;
  private currentTime: number = 0;
  private duration: number = 0;
  private volume: number = 0.85;
  private isMuted: boolean = false;
  private isFileAvailable: boolean = true;
  private fileNotFoundNotice: string = '';
  private listeners: Set<AudioEventListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.preload = 'metadata';
      this.audio.volume = this.volume;

      this.audio.addEventListener('timeupdate', () => {
        if (this.activeEngine === 'html5' && this.audio) {
          this.currentTime = this.audio.currentTime;
          this.notify();
        }
      });

      this.audio.addEventListener('loadedmetadata', () => {
        if (this.activeEngine === 'html5' && this.audio) {
          this.duration = this.audio.duration || 0;
          this.isFileAvailable = true;
          this.fileNotFoundNotice = '';
          this.notify();
        }
      });

      this.audio.addEventListener('durationchange', () => {
        if (this.activeEngine === 'html5' && this.audio) {
          this.duration = this.audio.duration || 0;
          this.notify();
        }
      });

      this.audio.addEventListener('play', () => {
        if (this.activeEngine === 'html5') {
          this.isPlaying = true;
          this.notify();
        }
      });

      this.audio.addEventListener('pause', () => {
        if (this.activeEngine === 'html5') {
          this.isPlaying = false;
          this.notify();
        }
      });

      this.audio.addEventListener('ended', () => {
        if (this.activeEngine === 'html5') {
          this.isPlaying = false;
          this.notify();
          window.dispatchEvent(new CustomEvent('realaudio:ended'));
        }
      });

      this.audio.addEventListener('error', () => {
        if (this.activeEngine === 'html5') {
          this.isPlaying = false;
          this.isFileAvailable = false;
          const failedSong = this.currentSong;
          this.fileNotFoundNotice = 'Áudio indisponível — pulando faixa...';
          this.notify();
          if (failedSong) {
            window.dispatchEvent(new CustomEvent('realaudio:invalid', { detail: { songId: failedSong.id } }));
          }
        }
      });
    }
  }

  public subscribe(listener: AudioEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Audio subscriber error', err);
      }
    });
  }

  private ensureYouTubeContainer(): HTMLElement | null {
    if (typeof document === 'undefined') return null;
    let wrapper = document.getElementById('nossomundo-yt-wrapper');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.id = 'nossomundo-yt-wrapper';
      wrapper.setAttribute('aria-hidden', 'true');
      wrapper.style.position = 'fixed';
      wrapper.style.left = '-9999px';
      wrapper.style.top = '-9999px';
      wrapper.style.width = '2px';
      wrapper.style.height = '2px';
      wrapper.style.opacity = '0.001';
      wrapper.style.pointerEvents = 'none';
      const inner = document.createElement('div');
      inner.id = this.ytContainerId;
      wrapper.appendChild(inner);
      document.body.appendChild(wrapper);
    }
    return wrapper;
  }

  private loadYouTubeApi(): Promise<YTNamespace | null> {
    if (typeof window === 'undefined') return Promise.resolve(null);
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (this.ytApiPromise) return this.ytApiPromise;

    this.ytApiPromise = new Promise((resolve) => {
      const existingPrev = window.onYouTubeIframeAPIReady;
      const timeout = window.setTimeout(() => {
        resolve(window.YT?.Player ? window.YT : null);
      }, 9000);

      window.onYouTubeIframeAPIReady = () => {
        window.clearTimeout(timeout);
        if (typeof existingPrev === 'function') {
          try {
            existingPrev();
          } catch {
            // ignore
          }
        }
        resolve(window.YT || null);
      };

      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        tag.onerror = () => {
          window.clearTimeout(timeout);
          resolve(null);
        };
        document.head.appendChild(tag);
      }
    });

    return this.ytApiPromise;
  }

  private startYtPolling() {
    this.stopYtPolling();
    if (typeof window === 'undefined') return;
    this.ytPollInterval = window.setInterval(() => {
      if (this.activeEngine === 'youtube' && this.ytPlayer) {
        try {
          const cur = this.ytPlayer.getCurrentTime();
          const dur = this.ytPlayer.getDuration();
          let changed = false;
          if (Number.isFinite(cur) && Math.abs(cur - this.currentTime) > 0.15) {
            this.currentTime = cur;
            changed = true;
          }
          if (Number.isFinite(dur) && dur > 0 && Math.abs(dur - this.duration) > 0.5) {
            this.duration = dur;
            changed = true;
          }
          if (changed) this.notify();
        } catch {
          // player not ready
        }
      }
    }, 250);
  }

  private stopYtPolling() {
    if (this.ytPollInterval !== null && typeof window !== 'undefined') {
      window.clearInterval(this.ytPollInterval);
      this.ytPollInterval = null;
    }
  }

  private async ensureYouTubePlayer(initialVideoId: string): Promise<YTPlayerInstance | null> {
    if (this.ytPlayer) return this.ytPlayer;
    if (this.ytPlayerReadyPromise) return this.ytPlayerReadyPromise;

    this.ytPlayerReadyPromise = (async () => {
      this.ensureYouTubeContainer();
      const YT = await this.loadYouTubeApi();
      if (!YT || !YT.Player) return null;

      return await new Promise<YTPlayerInstance | null>((resolve) => {
        const timeout = window.setTimeout(() => resolve(null), 9000);
        try {
          const player = new YT.Player(this.ytContainerId, {
            height: 2,
            width: 2,
            videoId: initialVideoId,
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              playsinline: 1,
              rel: 0,
              origin: window.location.origin,
            },
            events: {
              onReady: (e) => {
                window.clearTimeout(timeout);
                this.ytPlayer = e.target;
                try {
                  e.target.setVolume(Math.round(this.volume * 100));
                  if (this.isMuted) e.target.mute();
                  else e.target.unMute();
                } catch {
                  // ignore
                }
                resolve(e.target);
              },
              onStateChange: (e) => {
                if (this.activeEngine !== 'youtube') return;
                // YT states: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
                if (e.data === 1) {
                  this.isPlaying = true;
                  this.isFileAvailable = true;
                  this.fileNotFoundNotice = '';
                  try {
                    const dur = e.target.getDuration();
                    if (Number.isFinite(dur) && dur > 0) this.duration = dur;
                  } catch {
                    // ignore
                  }
                  this.startYtPolling();
                  this.notify();
                } else if (e.data === 2) {
                  this.isPlaying = false;
                  this.stopYtPolling();
                  this.notify();
                } else if (e.data === 0) {
                  this.isPlaying = false;
                  this.stopYtPolling();
                  this.notify();
                  window.dispatchEvent(new CustomEvent('realaudio:ended'));
                }
              },
              onError: () => {
                if (this.activeEngine !== 'youtube') return;
                this.isPlaying = false;
                this.isFileAvailable = false;
                this.stopYtPolling();
                this.fileNotFoundNotice = 'Vídeo do YouTube indisponível para reprodução — pulando...';
                this.notify();
                const failedSong = this.currentSong;
                if (failedSong) {
                  window.dispatchEvent(new CustomEvent('realaudio:invalid', { detail: { songId: failedSong.id } }));
                }
              },
            },
          });
        } catch {
          window.clearTimeout(timeout);
          resolve(null);
        }
      });
    })();

    const res = await this.ytPlayerReadyPromise;
    if (!res) this.ytPlayerReadyPromise = null;
    return res;
  }

  public stopAll() {
    this.stopYtPolling();
    if (this.audio) {
      this.audio.pause();
    }
    if (this.ytPlayer) {
      try {
        this.ytPlayer.pauseVideo();
      } catch {
        // ignore
      }
    }
    this.isPlaying = false;
    this.activeEngine = 'none';
    this.currentTime = 0;
    this.duration = 0;
    this.currentSong = null;
    this.notify();
  }

  public async playSong(song: Song, autoPlay: boolean = true) {
    this.currentSong = song;
    this.currentTime = 0;
    this.duration = song.duration || 0;

    const ytId = song.youtubeId || extractYouTubeId(song.audioUrl);

    if (ytId) {
      // Switch away from HTML5 audio cleanly
      if (this.audio) {
        this.audio.pause();
      }
      this.activeEngine = 'youtube';
      this.isFileAvailable = true;
      this.fileNotFoundNotice = autoPlay ? 'Carregando música do YouTube...' : '';
      this.pendingYtVideoId = ytId;
      this.pendingYtAutoPlay = autoPlay;
      this.notify();

      const player = await this.ensureYouTubePlayer(ytId);
      // Bail if user already switched songs while API was loading
      if (this.currentSong?.id !== song.id || this.activeEngine !== 'youtube') return;

      if (!player) {
        this.isPlaying = false;
        this.isFileAvailable = false;
        this.fileNotFoundNotice = 'Player do YouTube indisponível — pulando...';
        this.notify();
        window.dispatchEvent(new CustomEvent('realaudio:invalid', { detail: { songId: song.id } }));
        return;
      }

      try {
        if (this.pendingYtAutoPlay) {
          player.loadVideoById(ytId);
          player.playVideo();
          this.isPlaying = true;
          this.startYtPolling();
        } else {
          player.cueVideoById(ytId);
          this.isPlaying = false;
        }
        this.isFileAvailable = true;
        this.fileNotFoundNotice = '';
      } catch {
        this.isPlaying = false;
        this.isFileAvailable = false;
        this.fileNotFoundNotice = 'Falha ao tocar YouTube — pulando...';
        window.dispatchEvent(new CustomEvent('realaudio:invalid', { detail: { songId: song.id } }));
      }
      this.notify();
      return;
    }

    // HTML5 <audio> path
    this.stopYtPolling();
    if (this.ytPlayer) {
      try {
        this.ytPlayer.pauseVideo();
      } catch {
        // ignore
      }
    }

    if (!this.audio) return;
    this.activeEngine = 'html5';

    const rawUrl = song.audioUrl || '';
    const targetUrl = await resolveMediaUrl(rawUrl);

    if (this.currentSong?.id !== song.id || this.activeEngine !== 'html5') return;

    if (!targetUrl) {
      this.isPlaying = false;
      this.isFileAvailable = false;
      this.fileNotFoundNotice = 'Arquivo de áudio não encontrado — pulando...';
      this.notify();
      window.dispatchEvent(new CustomEvent('realaudio:invalid', { detail: { songId: song.id } }));
      return;
    }

    if (this.audio.src !== targetUrl && !this.audio.src.endsWith(targetUrl)) {
      this.audio.src = targetUrl;
      this.currentTime = 0;
    }

    if (!autoPlay) {
      this.isPlaying = false;
      this.isFileAvailable = true;
      this.fileNotFoundNotice = '';
      this.notify();
      return;
    }

    try {
      await this.audio.play();
      this.isPlaying = true;
      this.isFileAvailable = true;
      this.fileNotFoundNotice = '';
    } catch {
      this.isPlaying = false;
      this.isFileAvailable = false;
      this.fileNotFoundNotice = 'Toque para iniciar o áudio ou verifique o arquivo';
      window.dispatchEvent(new CustomEvent('realaudio:invalid', { detail: { songId: song.id } }));
    }
    this.notify();
  }

  public async play() {
    if (!this.currentSong) return;

    if (this.activeEngine === 'youtube' || this.currentSong.youtubeId || extractYouTubeId(this.currentSong.audioUrl)) {
      if (this.ytPlayer && this.activeEngine === 'youtube') {
        try {
          this.ytPlayer.playVideo();
          this.isPlaying = true;
          this.startYtPolling();
          this.notify();
          return;
        } catch {
          // fallback to full playSong
        }
      }
      await this.playSong(this.currentSong, true);
      return;
    }

    if (!this.audio) return;
    if (!this.audio.src && this.currentSong.audioUrl) {
      await this.playSong(this.currentSong, true);
      return;
    }

    try {
      this.activeEngine = 'html5';
      await this.audio.play();
      this.isPlaying = true;
      this.isFileAvailable = true;
      this.fileNotFoundNotice = '';
    } catch {
      this.isPlaying = false;
      this.isFileAvailable = false;
      if (this.currentSong) {
        window.dispatchEvent(new CustomEvent('realaudio:invalid', { detail: { songId: this.currentSong.id } }));
      }
    }
    this.notify();
  }

  public pause() {
    this.stopYtPolling();
    if (this.activeEngine === 'youtube' && this.ytPlayer) {
      try {
        this.ytPlayer.pauseVideo();
      } catch {
        // ignore
      }
    }
    if (this.audio) {
      this.audio.pause();
    }
    this.isPlaying = false;
    this.notify();
  }

  public togglePlay() {
    if (!this.currentSong) return;
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public seek(seconds: number) {
    const target = Math.max(0, Math.min(seconds, this.duration || 9999));
    if (this.activeEngine === 'youtube' && this.ytPlayer) {
      try {
        this.ytPlayer.seekTo(target, true);
      } catch {
        // ignore
      }
    } else if (this.audio) {
      this.audio.currentTime = target;
    }
    this.currentTime = target;
    this.notify();
  }

  public setVolume(val: number) {
    const safeVal = Math.max(0, Math.min(1, val));
    this.volume = safeVal;
    if (this.audio) {
      this.audio.volume = safeVal;
    }
    if (this.ytPlayer) {
      try {
        this.ytPlayer.setVolume(Math.round(safeVal * 100));
      } catch {
        // ignore
      }
    }
    if (safeVal > 0 && this.isMuted) {
      this.isMuted = false;
      if (this.audio) this.audio.muted = false;
      if (this.ytPlayer) {
        try {
          this.ytPlayer.unMute();
        } catch {
          // ignore
        }
      }
    }
    this.notify();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.audio) {
      this.audio.muted = this.isMuted;
    }
    if (this.ytPlayer) {
      try {
        if (this.isMuted) this.ytPlayer.mute();
        else this.ytPlayer.unMute();
      } catch {
        // ignore
      }
    }
    this.notify();
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration || this.currentSong?.duration || 0,
      volume: this.volume,
      isMuted: this.isMuted,
      currentSong: this.currentSong,
      isFileAvailable: this.isFileAvailable,
      fileNotFoundNotice: this.fileNotFoundNotice,
      activeEngine: this.activeEngine,
    };
  }
}

export const realAudio = new RealAudioService();
