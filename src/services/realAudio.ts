import { Song } from '../types';

export type AudioEventListener = () => void;

class RealAudioService {
  private audio: HTMLAudioElement | null = null;
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
        if (this.audio) {
          this.currentTime = this.audio.currentTime;
          this.notify();
        }
      });

      this.audio.addEventListener('loadedmetadata', () => {
        if (this.audio) {
          this.duration = this.audio.duration || 0;
          this.isFileAvailable = true;
          this.fileNotFoundNotice = '';
          this.notify();
        }
      });

      this.audio.addEventListener('durationchange', () => {
        if (this.audio) {
          this.duration = this.audio.duration || 0;
          this.notify();
        }
      });

      this.audio.addEventListener('play', () => {
        this.isPlaying = true;
        this.notify();
      });

      this.audio.addEventListener('pause', () => {
        this.isPlaying = false;
        this.notify();
      });

      this.audio.addEventListener('ended', () => {
        this.isPlaying = false;
        this.notify();
        // Dispatch next track event if configured
        window.dispatchEvent(new CustomEvent('realaudio:ended'));
      });

      this.audio.addEventListener('error', (e) => {
        console.warn('RealAudio: Could not load audio source.', e);
        this.isPlaying = false;
        this.isFileAvailable = false;
        if (this.currentSong) {
          this.fileNotFoundNotice = `Arquivo de áudio '${this.currentSong.audioUrl || 'Te-Vivo.mp3'}' não encontrado em 'assets/audio/'. Coloque o arquivo .mp3 na pasta 'public/assets/audio/'.`;
        }
        this.notify();
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

  public async playSong(song: Song) {
    if (!this.audio) return;
    this.currentSong = song;
    const targetUrl = song.audioUrl || `/assets/audio/${song.title.replace(/\s+/g, '-')}.mp3`;
    
    // Check if url already loaded
    if (this.audio.src !== targetUrl && !this.audio.src.endsWith(targetUrl)) {
      this.audio.src = targetUrl;
      this.currentTime = 0;
    }

    try {
      await this.audio.play();
      this.isPlaying = true;
      this.isFileAvailable = true;
      this.fileNotFoundNotice = '';
    } catch (err) {
      console.log('RealAudio Playback waiting or file unavailable', err);
      this.isPlaying = false;
      this.isFileAvailable = false;
      this.fileNotFoundNotice = `Coloque '${song.title}.mp3' em 'assets/audio/' para tocar a faixa real!`;
    }
    this.notify();
  }

  public async play() {
    if (!this.audio) return;
    try {
      await this.audio.play();
      this.isPlaying = true;
    } catch (err) {
      console.warn('Playback error', err);
    }
    this.notify();
  }

  public pause() {
    if (!this.audio) return;
    this.audio.pause();
    this.isPlaying = false;
    this.notify();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public seek(seconds: number) {
    if (!this.audio) return;
    const target = Math.max(0, Math.min(seconds, this.duration || 9999));
    this.audio.currentTime = target;
    this.currentTime = target;
    this.notify();
  }

  public setVolume(val: number) {
    if (!this.audio) return;
    const safeVal = Math.max(0, Math.min(1, val));
    this.volume = safeVal;
    this.audio.volume = safeVal;
    if (safeVal > 0 && this.isMuted) {
      this.isMuted = false;
      this.audio.muted = false;
    }
    this.notify();
  }

  public toggleMute() {
    if (!this.audio) return;
    this.isMuted = !this.isMuted;
    this.audio.muted = this.isMuted;
    this.notify();
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration || this.currentSong?.duration || 212,
      volume: this.volume,
      isMuted: this.isMuted,
      currentSong: this.currentSong,
      isFileAvailable: this.isFileAvailable,
      fileNotFoundNotice: this.fileNotFoundNotice,
    };
  }
}

export const realAudio = new RealAudioService();
