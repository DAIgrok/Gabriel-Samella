/**
 * Web Audio API Synthesizer & Sound Engine for "Nosso Mundo" (Gabriel & Samella)
 * Creates authentic polyphonic romantic acoustic music, guitar & piano melodies,
 * ambient sounds (rain, fireplace, night stars), and interactive sound effects.
 */

export interface SongTrackData {
  id: string;
  tempo: number; // BPM
  bassType: OscillatorType;
  leadType: OscillatorType;
  chords: number[][]; // chord note frequencies in Hz
  melody: { note: number; dur: number }[]; // melody notes with durations
}

// Frequency constants
const C3 = 130.81, D3 = 146.83, E3 = 164.81, F3 = 174.61, G3 = 196.00, A3 = 220.00, B3 = 246.94;
const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88;
const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.00, B5 = 987.77;
const C6 = 1046.50, E6 = 1318.51;

// Curated romantic song themes in acoustic piano & guitar
const SONG_THEMES: Record<string, SongTrackData> = {
  // 1. "Te Vivo" - Luan Santana (D - A - Bm - G progression)
  s1: {
    id: 's1',
    tempo: 78,
    bassType: 'triangle',
    leadType: 'sine',
    chords: [
      [D3, A3, D4, F4 * 1.06], // D major
      [A3, C4 * 1.06, E4, A4], // A major
      [B3, D4, F4 * 1.06, B4], // B minor
      [G3, B3, D4, G4],        // G major
    ],
    melody: [
      { note: F4 * 1.06, dur: 1 }, { note: E4, dur: 1 }, { note: D4, dur: 2 },
      { note: E4, dur: 1 }, { note: F4 * 1.06, dur: 1 }, { note: A4, dur: 2 },
      { note: F4 * 1.06, dur: 1 }, { note: E4, dur: 1 }, { note: D4, dur: 1 }, { note: B3, dur: 1 },
      { note: D4, dur: 2 }, { note: E4, dur: 2 },
      { note: F4 * 1.06, dur: 2 }, { note: A4, dur: 2 },
      { note: B4, dur: 2 }, { note: A4, dur: 2 },
      { note: G4, dur: 2 }, { note: F4 * 1.06, dur: 2 },
      { note: E4, dur: 4 },
    ],
  },
  // 2. "É Só Você Fazer Assim (Eu Volto)" - Luan Santana & Dilsinho (C - G - Am - F)
  s2: {
    id: 's2',
    tempo: 84,
    bassType: 'triangle',
    leadType: 'sine',
    chords: [
      [C3, E3, G3, C4], // C
      [G3, B3, D4, G4], // G
      [A3, C4, E4, A4], // Am
      [F3, A3, C4, F4], // F
    ],
    melody: [
      { note: G4, dur: 1 }, { note: A4, dur: 1 }, { note: C5, dur: 2 },
      { note: B4, dur: 1 }, { note: A4, dur: 1 }, { note: G4, dur: 2 },
      { note: E4, dur: 1 }, { note: G4, dur: 1 }, { note: A4, dur: 2 },
      { note: G4, dur: 1 }, { note: F4, dur: 1 }, { note: E4, dur: 1 }, { note: D4, dur: 1 },
      { note: C4, dur: 2 }, { note: E4, dur: 1 }, { note: G4, dur: 1 },
      { note: A4, dur: 2 }, { note: C5, dur: 2 },
      { note: D5, dur: 2 }, { note: C5, dur: 2 },
      { note: C5, dur: 4 },
    ],
  },
  // 3. "Cuida Bem Dela" - Henrique & Juliano (G - D - Em - C)
  s3: {
    id: 's3',
    tempo: 74,
    bassType: 'sine',
    leadType: 'triangle',
    chords: [
      [G3, B3, D4, G4], // G
      [D3, F4 * 1.06, A4, D5], // D
      [E3, G3, B3, E4], // Em
      [C3, E3, G3, C4], // C
    ],
    melody: [
      { note: B4, dur: 1 }, { note: A4, dur: 1 }, { note: G4, dur: 2 },
      { note: A4, dur: 1 }, { note: B4, dur: 1 }, { note: D5, dur: 2 },
      { note: G4, dur: 1 }, { note: A4, dur: 1 }, { note: B4, dur: 2 },
      { note: A4, dur: 1 }, { note: G4, dur: 1 }, { note: E4, dur: 2 },
      { note: G4, dur: 2 }, { note: A4, dur: 1 }, { note: B4, dur: 1 },
      { note: C5, dur: 2 }, { note: B4, dur: 1 }, { note: A4, dur: 1 },
      { note: G4, dur: 4 },
    ],
  },
  // 4. "Photograph" - Ed Sheeran (E - C#m - B - A)
  s4: {
    id: 's4',
    tempo: 80,
    bassType: 'sine',
    leadType: 'sine',
    chords: [
      [E3, G3 * 1.06, B3, E4],
      [C3 * 1.06, E3, G3 * 1.06, C4 * 1.06],
      [B3, D4 * 1.06, F4 * 1.06, B4],
      [A3, C4 * 1.06, E4, A4],
    ],
    melody: [
      { note: E4, dur: 1 }, { note: G4 * 1.06, dur: 1 }, { note: B4, dur: 2 },
      { note: A4, dur: 1 }, { note: G4 * 1.06, dur: 1 }, { note: E4, dur: 2 },
      { note: F4 * 1.06, dur: 2 }, { note: E4, dur: 2 },
      { note: B3, dur: 4 },
    ],
  },
  // 5. "De Janeiro a Janeiro"
  s5: {
    id: 's5',
    tempo: 76,
    bassType: 'triangle',
    leadType: 'sine',
    chords: [
      [C3, E3, G3, C4],
      [F3, A3, C4, F4],
      [A3, C4, E4, A4],
      [G3, B3, D4, G4],
    ],
    melody: [
      { note: E4, dur: 1 }, { note: F4, dur: 1 }, { note: G4, dur: 2 },
      { note: A4, dur: 1 }, { note: G4, dur: 1 }, { note: F4, dur: 2 },
      { note: E4, dur: 1 }, { note: D4, dur: 1 }, { note: C4, dur: 2 },
      { note: D4, dur: 2 }, { note: C4, dur: 2 },
    ],
  },
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMusicPlaying = false;
  private musicInterval: number | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private activeSongId: string = 's1';
  private masterGain: GainNode | null = null;
  private volume: number = 0.8;
  private isMuted: boolean = false;

  // Ambient sound generators
  private ambientGain: GainNode | null = null;
  private activeAmbient: 'rain' | 'fireplace' | 'night' | 'none' = 'none';
  private ambientTimer: number | null = null;

  public visualizerData: number[] = new Array(16).fill(10);
  private visualizerInterval: number | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setVolume(newVol: number) {
    this.volume = Math.max(0, Math.min(1, newVol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    if (this.currentAudioElement) {
      this.currentAudioElement.volume = this.isMuted ? 0 : this.volume;
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    if (this.currentAudioElement) {
      this.currentAudioElement.volume = this.isMuted ? 0 : this.volume;
    }
    return this.isMuted;
  }

  // --- Sound Effects ---

  // Sparkle chime for diamonds and achievements
  playSparkle() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const freqs = [C5, E5, G5, C6, E6];

      freqs.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.07);

        gain.gain.setValueAtTime(0.0001, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.6);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.7);
      });
    } catch {
      // ignore
    }
  }

  // Diamond / Coin sound
  playCoin() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(987.77, now);
      osc1.frequency.setValueAtTime(1318.51, now + 0.08);
      osc2.frequency.setValueAtTime(1975.53, now + 0.08);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch {
      // ignore
    }
  }

  // Heart pop sound
  playHeartPop() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // ignore
    }
  }

  // Water droplet sound for Love Tree
  playWaterDrop() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.32);
    } catch {
      // ignore
    }
  }

  // Celestial Fruit Harvest Chime
  playFruitHarvest() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const notes = [F4 * 1.06, A4, C5, E5, A5];

      notes.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.09);

        gain.gain.setValueAtTime(0.001, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.09 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.8);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.85);
      });
    } catch {
      // ignore
    }
  }

  // Envelope Unseal Sound
  playEnvelopeOpen() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const freqs = [G4, C5, E5, G5];

      freqs.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.1);

        gain.gain.setValueAtTime(0.001, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.15, now + i * 0.1 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.8);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.85);
      });
    } catch {
      // ignore
    }
  }

  // Kitten sounds
  playPurr() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.14);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.35);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.16, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {}
  }

  playMeowHappy() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.linearRampToValueAtTime(820, now + 0.18);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.45);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.55);
    } catch {}
  }

  playEat() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      [0, 0.12, 0.24].forEach((delay) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now + delay);
        osc.frequency.exponentialRampToValueAtTime(140, now + delay + 0.08);

        gain.gain.setValueAtTime(0.15, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + delay);
        osc.stop(now + delay + 0.12);
      });
    } catch {}
  }

  playDrink() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      [0, 0.14, 0.28].forEach((delay, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600 + i * 80, now + delay);
        osc.frequency.exponentialRampToValueAtTime(950 + i * 80, now + delay + 0.07);

        gain.gain.setValueAtTime(0.18, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + delay);
        osc.stop(now + delay + 0.12);
      });
    } catch {}
  }

  playBathSplash() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.24);
    } catch {}
  }

  playSleepSnore() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.4);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.9);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 1.0);
    } catch {}
  }

  playToyBoing() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.15);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  playBark() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  playChirp() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(2400, now + 0.07);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.14);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  playFoxSound() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.2);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  playSqueak() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.06);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  // --- Real Acoustic Polyphonic Music Player ---

  startSongMelody(songId: string) {
    this.stopMelodyLoop();
    this.initCtx();
    this.isMusicPlaying = true;
    this.activeSongId = songId;

    const track = SONG_THEMES[songId] || SONG_THEMES['s1'];
    const stepDurationMs = (60 / track.tempo) * 500; // eighth note speed

    let chordIdx = 0;
    let melodyIdx = 0;
    let step = 0;

    const playStep = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.masterGain) return;

      try {
        const now = this.ctx.currentTime;
        const currentChord = track.chords[chordIdx % track.chords.length];

        // 1. Play Soft Guitar/Piano Arpeggio Note
        const chordNote = currentChord[step % currentChord.length];
        const oscChord = this.ctx.createOscillator();
        const gainChord = this.ctx.createGain();

        oscChord.type = track.bassType;
        oscChord.frequency.setValueAtTime(chordNote, now);

        gainChord.gain.setValueAtTime(0.001, now);
        gainChord.gain.exponentialRampToValueAtTime(0.1, now + 0.03);
        gainChord.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

        oscChord.connect(gainChord);
        gainChord.connect(this.masterGain);

        oscChord.start(now);
        oscChord.stop(now + 0.75);

        // 2. Play Melodic Voice Line
        const melItem = track.melody[melodyIdx % track.melody.length];
        if (step % melItem.dur === 0) {
          const oscLead = this.ctx.createOscillator();
          const gainLead = this.ctx.createGain();

          oscLead.type = track.leadType;
          oscLead.frequency.setValueAtTime(melItem.note, now);

          gainLead.gain.setValueAtTime(0.001, now);
          gainLead.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
          gainLead.gain.exponentialRampToValueAtTime(0.0001, now + (melItem.dur * stepDurationMs) / 1000 + 0.2);

          oscLead.connect(gainLead);
          gainLead.connect(this.masterGain);

          oscLead.start(now);
          oscLead.stop(now + (melItem.dur * stepDurationMs) / 1000 + 0.3);

          melodyIdx++;
        }

        // Animate visualizer bars
        this.updateVisualizer();

        step++;
        if (step >= 8) {
          step = 0;
          chordIdx++;
        }
      } catch {
        // ignore
      }
    };

    playStep();
    this.musicInterval = window.setInterval(playStep, stepDurationMs);
  }

  private updateVisualizer() {
    this.visualizerData = this.visualizerData.map(() => Math.floor(Math.random() * 85) + 15);
  }

  startMelodyLoop() {
    this.startSongMelody(this.activeSongId);
  }

  stopMelodyLoop() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.visualizerData = new Array(16).fill(8);
  }

  playCustomAudio(url: string, onFallback?: () => void) {
    try {
      this.initCtx();
      if (this.currentAudioElement) {
        this.currentAudioElement.pause();
        this.currentAudioElement = null;
      }
      this.currentAudioElement = new Audio(url);
      this.currentAudioElement.volume = this.isMuted ? 0 : this.volume;
      this.currentAudioElement.play().catch(() => {
        if (onFallback) onFallback();
        this.startMelodyLoop();
      });
    } catch {
      this.startMelodyLoop();
    }
  }

  pauseCustomAudio() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
    }
    this.stopMelodyLoop();
  }
}

export const soundEngine = new SoundEngine();
