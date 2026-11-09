import React, { useState, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  ListMusic,
  FileText,
  Volume2,
  VolumeX,
  Sparkles,
  Link2,
  Upload,
  Disc3,
  Flame,
  Info,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Song } from '../../types';
import { realAudio } from '../../services/realAudio';
import { soundEngine } from '../../utils/audioSynth';

export const MusicView: React.FC = () => {
  const {
    songs,
    currentSong,
    isPlaying,
    playSong,
    pauseSong,
    togglePlay,
    nextSong,
    prevSong,
    toggleFavoriteSong,
    triggerEasterEgg,
    triggerHeartExplosion,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'player' | 'letras' | 'playlist'>('player');
  const [customAudioUrl, setCustomAudioUrl] = useState('');
  const [isCustomAudioOpen, setIsCustomAudioOpen] = useState(false);
  const [audioState, setAudioState] = useState(realAudio.getState());
  const [visualizerBars, setVisualizerBars] = useState<number[]>(new Array(16).fill(15));

  useEffect(() => {
    const unsubscribe = realAudio.subscribe(() => {
      setAudioState(realAudio.getState());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let interval: number;
    if (audioState.isPlaying || isPlaying) {
      interval = window.setInterval(() => {
        setVisualizerBars(
          Array.from({ length: 16 }, () => Math.floor(Math.random() * 24) + 6)
        );
      }, 120);
    } else {
      setVisualizerBars(new Array(16).fill(6));
    }
    return () => clearInterval(interval);
  }, [audioState.isPlaying, isPlaying]);

  const activeDuration = audioState.duration || currentSong.duration || 212;
  const activeCurrentTime = audioState.currentTime || 0;
  const progressPercent = Math.min(100, (activeCurrentTime / activeDuration) * 100);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    realAudio.seek(ratio * activeDuration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    realAudio.setVolume(val);
  };

  const handleToggleMute = () => {
    realAudio.toggleMute();
  };

  const handlePlaySong = (song: Song) => {
    playSong(song);
    realAudio.playSong(song);
  };

  const handleTogglePlay = () => {
    if (audioState.isPlaying || isPlaying) {
      realAudio.pause();
      pauseSong();
    } else {
      realAudio.playSong(currentSong);
      playSong(currentSong);
    }
  };

  const handleVinylClick = () => {
    soundEngine.playSparkle();
    triggerHeartExplosion(0.5, 0.4);
    triggerEasterEgg('egg-vinyl-spin');
    showToast('✨ O amor de Gabriel & Samella gira infinito!');
  };

  const handleApplyCustomAudio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAudioUrl.trim()) return;
    const customSong: Song = {
      id: `custom-${Date.now()}`,
      title: 'Música Especial do Casal',
      artist: 'Gabriel & Samella',
      duration: 210,
      durationFormatted: '3:30',
      audioUrl: customAudioUrl.trim(),
      coverUrl: '/assets/img/1.jpg',
      isFavorite: true,
    };
    handlePlaySong(customSong);
    showToast('Áudio personalizado iniciado com sucesso! 🎵');
    setIsCustomAudioOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 pb-24 max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-semibold text-indigo-300 mb-1">
          <Music className="w-3.5 h-3.5" />
          <span>Nossa Trilha Sonora Real</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
          Músicas Que Falam de Nós ♡
        </h2>
        <p className="text-xs md:text-sm text-purple-200/70">
          Tocando as trilhas sonoras do nosso amor... 🎶
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center">
        <div className="flex items-center gap-1 p-1 rounded-2xl glass-panel border border-purple-500/20">
          {[
            { id: 'player', label: 'Tocar', icon: Play },
            { id: 'letras', label: 'Letras', icon: FileText },
            { id: 'playlist', label: 'Lista', icon: ListMusic },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-pink-500/30 text-pink-200 shadow-md border border-pink-400/30'
                    : 'text-purple-300/70 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Player View */}
      {activeTab === 'player' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card-glow rounded-[2.5rem] p-6 md:p-8 border-2 border-purple-500/20 shadow-[0_20px_50px_-12px_rgba(236,72,153,0.25)] relative overflow-hidden flex flex-col items-center text-center bg-gradient-to-b from-[#1c0836]/90 to-[#0a0512]/95"
        >
          {/* Glowing Ambient Background */}
          {(audioState.isPlaying || isPlaying) && (
            <div className="absolute inset-0 bg-gradient-to-t from-pink-600/20 via-purple-600/10 to-transparent pointer-events-none animate-pulse" />
          )}

          {/* Floating Music Notes Animation */}
          <AnimatePresence>
            {(audioState.isPlaying || isPlaying) && (
              <>
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 100, x: -50 + Math.random() * 100 }}
                    animate={{ opacity: [0, 0.8, 0], y: -100 - Math.random() * 50, x: -50 + Math.random() * 100 }}
                    transition={{ duration: 2.5 + Math.random(), repeat: Infinity, ease: 'easeOut', delay: i * 0.8 }}
                    className="absolute text-pink-400/40 text-2xl z-0"
                    style={{ left: '50%' }}
                  >
                    ♪
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Large Spinning Vinyl Album Cover with Interactive Easter Egg */}
          <div className="relative my-6 cursor-pointer group z-10" onClick={handleVinylClick}>
            <motion.div
              animate={{ rotate: (audioState.isPlaying || isPlaying) ? 360 : 0 }}
              transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
              className="w-48 h-48 md:w-56 md:h-56 rounded-full p-2 bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-400 shadow-[0_0_40px_rgba(244,114,182,0.4)] flex items-center justify-center relative group-hover:scale-105 transition-transform"
            >
              <img
                src={currentSong.coverUrl || '/assets/img/1.jpg'}
                alt={currentSong.title}
                className="w-full h-full object-cover rounded-full border-4 border-black/80"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              {/* Vinyl Center Spindle */}
              <div className="absolute w-12 h-12 rounded-full bg-[#080214] border-2 border-white/60 flex items-center justify-center shadow-lg">
                <Heart className="w-5 h-5 text-pink-400 fill-pink-400 animate-pulse" />
              </div>
            </motion.div>
          </div>

          {/* Real-time Audio Waveform Visualizer */}
          <div className="flex items-end justify-center gap-1.5 h-8 my-2">
            {visualizerBars.map((height, i) => (
              <motion.div
                key={i}
                className="w-1.5 rounded-full bg-gradient-to-t from-purple-500 to-pink-400 shadow-[0_0_8px_#f472b6]"
                style={{ height: `${Math.max(4, height)}px` }}
                transition={{ duration: 0.1 }}
              />
            ))}
          </div>

          {/* Song Title & Artist */}
          <div className="w-full mt-2 flex items-center justify-between">
            <div className="text-left flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-bold text-white truncate font-display">
                  {currentSong.title}
                </h3>
                {currentSong.id === 's1' && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                    MP3 Ativo
                  </span>
                )}
              </div>
              <p className="text-xs text-purple-300/80">{currentSong.artist}</p>
            </div>

            <button
              onClick={() => toggleFavoriteSong(currentSong.id)}
              className="p-2 text-purple-300 hover:text-pink-400 transition-colors"
            >
              <Heart
                className={`w-6 h-6 ${
                  currentSong.isFavorite
                    ? 'text-pink-400 fill-pink-400 neon-glow-pink'
                    : 'text-purple-400'
                }`}
              />
            </button>
          </div>

          {/* Scrubber Bar */}
          <div className="w-full my-3">
            <div
              onClick={handleSeek}
              className="h-2 w-full bg-purple-950 rounded-full overflow-hidden cursor-pointer relative group border border-purple-500/20"
            >
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 rounded-full transition-all duration-150 shadow-[0_0_12px_rgba(244,114,182,0.9)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-purple-300/70 font-mono mt-1.5">
              <span>{formatTime(activeCurrentTime)}</span>
              <span>{formatTime(activeDuration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-6 my-2">
            <button
              onClick={() => {
                prevSong();
                const curIdx = songs.findIndex((s) => s.id === currentSong.id);
                const prevItem = songs[(curIdx - 1 + songs.length) % songs.length];
                handlePlaySong(prevItem);
              }}
              aria-label="Música anterior"
              className="p-3 rounded-full glass-panel text-purple-200 hover:text-pink-300 active:scale-90 transition-all cursor-pointer"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={handleTogglePlay}
              aria-label={(audioState.isPlaying || isPlaying) ? 'Pausar' : 'Tocar'}
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-500 flex items-center justify-center text-white shadow-[0_0_30px_rgba(236,72,153,0.6)] active:scale-95 hover:brightness-110 transition-all cursor-pointer"
            >
              {(audioState.isPlaying || isPlaying) ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={() => {
                nextSong();
                const curIdx = songs.findIndex((s) => s.id === currentSong.id);
                const nextItem = songs[(curIdx + 1) % songs.length];
                handlePlaySong(nextItem);
              }}
              aria-label="Próxima música"
              className="p-3 rounded-full glass-panel text-purple-200 hover:text-pink-300 active:scale-90 transition-all cursor-pointer"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="w-full max-w-xs flex items-center gap-3 mt-3 pt-3 border-t border-purple-500/15">
            <button
              onClick={handleToggleMute}
              className="text-purple-300 hover:text-white"
              title={audioState.isMuted ? 'Desmutar' : 'Mutar'}
            >
              {audioState.isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioState.isMuted ? 0 : audioState.volume}
              onChange={handleVolumeChange}
              className="w-full accent-pink-500 cursor-pointer h-1.5 bg-purple-950 rounded-lg"
            />
            <span className="text-[10px] text-purple-300 font-mono w-8">
              {audioState.isMuted ? '0%' : `${Math.round(audioState.volume * 100)}%`}
            </span>
          </div>

          {/* Custom Music Options: File Upload & URL */}
          <div className="mt-4 pt-3 border-t border-purple-500/15 flex flex-wrap items-center justify-center gap-2">
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 text-[11px] text-pink-200 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-pink-400" />
              <span>Tocar MP3 do Dispositivo</span>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const objectUrl = URL.createObjectURL(file);
                  const uploadedSong: Song = {
                    id: `uploaded-${Date.now()}`,
                    title: file.name.replace(/\.[^/.]+$/, ''),
                    artist: 'Gabriel & Samella',
                    duration: 210,
                    durationFormatted: 'Local',
                    audioUrl: objectUrl,
                    coverUrl: '/assets/img/real/music_cover.jpg',
                    isFavorite: true,
                  };
                  handlePlaySong(uploadedSong);
                  showToast(`Reproduzindo: ${file.name} 🎵`);
                }}
              />
            </label>

            <button
              onClick={() => setIsCustomAudioOpen(!isCustomAudioOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 text-[11px] text-purple-300 hover:text-white transition-colors cursor-pointer"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Link URL</span>
            </button>
          </div>

          {/* Audio Folder Instructions Box */}
          <div className="w-full mt-4 p-3 rounded-2xl bg-[#0c0418]/90 border border-purple-500/25 text-left text-xs text-purple-300/80 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-pink-200">
              <Info className="w-3.5 h-3.5 text-pink-400" />
              <span>Pasta de Áudios: public/assets/audio/</span>
            </div>
            <p className="text-[11px] text-purple-300/70 leading-relaxed">
              Para as faixas tocarem direto do app, adicione seus arquivos .mp3 na pasta com estes nomes:
            </p>
            <div className="font-mono text-[10px] space-y-0.5 text-purple-200/90 bg-black/40 p-2 rounded-xl border border-purple-500/20">
              <div>1. tudo-o-que-voce-quiser.mp3</div>
              <div>2. leal.mp3</div>
              <div>3. te-vivo.mp3</div>
              <div>4. amar-nao-e-pecado.mp3</div>
              <div>5. cuida-bem-dela.mp3</div>
            </div>
          </div>

          {/* Custom Audio URL Modal */}
          <AnimatePresence>
            {isCustomAudioOpen && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleApplyCustomAudio}
                className="w-full mt-3 p-3 rounded-2xl bg-purple-950/60 border border-purple-500/30 space-y-2 text-left"
              >
                <label className="text-[11px] text-purple-200 font-medium block">
                  Link direto de arquivo MP3 ou áudio:
                </label>
                <input
                  type="url"
                  value={customAudioUrl}
                  onChange={(e) => setCustomAudioUrl(e.target.value)}
                  placeholder="https://exemplo.com/nossa-musica.mp3"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/30 text-xs text-white focus:outline-none focus:border-pink-400"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomAudioOpen(false)}
                    className="px-3 py-1.5 rounded-lg glass-panel text-[11px] text-purple-300 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-[11px] font-bold shadow-md cursor-pointer"
                  >
                    Tocar Áudio
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Lyrics Tab */}
      {activeTab === 'letras' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card-glow rounded-3xl p-6 border border-purple-400/30 shadow-2xl space-y-4 max-h-[500px] overflow-y-auto text-center"
        >
          <div className="border-b border-purple-500/20 pb-3">
            <h3 className="text-lg font-bold text-white font-display">
              {currentSong.title}
            </h3>
            <p className="text-xs text-pink-300 font-medium">{currentSong.artist}</p>
          </div>

          <div className="space-y-3 py-2">
            {currentSong.lyrics && currentSong.lyrics.length > 0 ? (
              currentSong.lyrics.map((line, idx) => (
                <p
                  key={idx}
                  className={`text-sm md:text-base leading-relaxed transition-all ${
                    line === ''
                      ? 'py-1'
                      : 'text-purple-100/90 font-light hover:text-pink-300 hover:scale-105'
                  }`}
                >
                  {line}
                </p>
              ))
            ) : (
              <p className="text-xs text-purple-300/70 italic">
                Letra instrumental relaxante criada com amor para você.
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Playlist Tab */}
      {activeTab === 'playlist' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card-glow rounded-3xl p-4 md:p-6 border border-purple-400/30 shadow-2xl space-y-2.5"
        >
          {songs.map((song, index) => {
            const isThis = currentSong.id === song.id;
            return (
              <div
                key={song.id}
                onClick={() => handlePlaySong(song)}
                className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                  isThis
                    ? 'bg-pink-500/20 border border-pink-400/40 shadow-md'
                    : 'glass-panel hover:bg-purple-900/30 border border-purple-500/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-purple-950 flex items-center justify-center text-xs font-bold text-purple-300">
                    {isThis && (audioState.isPlaying || isPlaying) ? (
                      <Sparkles className="w-4 h-4 text-pink-300 animate-spin" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          isThis ? 'text-pink-200 font-bold' : 'text-white'
                        }`}
                      >
                        {song.title}
                      </h4>
                      {song.id === 's1' && (
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-semibold">
                          MP3
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-purple-300/70">{song.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-purple-300/70 font-mono">
                    {song.durationFormatted}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoriteSong(song.id);
                    }}
                    className="p-1 text-purple-400 hover:text-pink-400"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        song.isFavorite ? 'text-pink-400 fill-pink-400' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
};
