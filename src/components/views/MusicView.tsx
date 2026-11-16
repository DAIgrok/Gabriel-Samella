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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Song } from '../../types';
import { realAudio } from '../../services/realAudio';
import { soundEngine } from '../../utils/audioSynth';
import { useResolvedMediaUrl } from '../../services/localMediaStore';

export const MusicView: React.FC = () => {
  const {
    songs,
    currentSong,
    isPlaying,
    playbackTime,
    playSong,
    togglePlay,
    nextSong,
    prevSong,
    toggleFavoriteSong,
    triggerEasterEgg,
    triggerHeartExplosion,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'player' | 'letras' | 'playlist'>('player');
  const [audioState, setAudioState] = useState(realAudio.getState());
  const [visualizerBars, setVisualizerBars] = useState<number[]>(new Array(16).fill(12));
  const resolvedCover = useResolvedMediaUrl(currentSong.coverUrl || '/assets/img/1.jpg');

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
      }, 140);
    } else {
      setVisualizerBars(new Array(16).fill(6));
    }
    return () => clearInterval(interval);
  }, [audioState.isPlaying, isPlaying]);

  const activeDuration = audioState.duration || currentSong.duration || 212;
  const activeCurrentTime = audioState.isFileAvailable ? audioState.currentTime : (audioState.currentTime || playbackTime || 0);
  const progressPercent = Math.min(100, (activeCurrentTime / Math.max(1, activeDuration)) * 100);

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
    realAudio.setVolume(parseFloat(e.target.value));
  };

  const handleToggleMute = () => {
    realAudio.toggleMute();
  };

  const handlePlaySong = (song: Song) => {
    playSong(song);
  };

  const handleVinylClick = () => {
    soundEngine.playSparkle();
    triggerHeartExplosion(0.5, 0.4);
    triggerEasterEgg('egg-vinyl-spin');
    showToast('✨ O amor de Gabriel & Samella gira infinito!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 pb-28 max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-semibold text-indigo-300 mb-1">
          <Music className="w-3.5 h-3.5" />
          <span>Nossa Trilha Sonora</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
          Músicas Que Falam de Nós ♡
        </h2>
        <p className="text-xs md:text-sm text-purple-200/70">
          Cada melodia guarda um pedacinho da nossa história 🎶
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
                onClick={() => setActiveTab(tab.id as 'player' | 'letras' | 'playlist')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
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
                    initial={{ opacity: 0, y: 100, x: -40 + i * 30 }}
                    animate={{ opacity: [0, 0.8, 0], y: -110 - i * 15, x: -30 + i * 25 }}
                    transition={{ duration: 2.6 + i * 0.4, repeat: Infinity, ease: 'easeOut', delay: i * 0.7 }}
                    className="absolute text-pink-400/40 text-2xl z-0 pointer-events-none"
                    style={{ left: '50%' }}
                  >
                    ♪
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Spinning Vinyl Album Cover */}
          <div className="relative my-5 cursor-pointer group z-10" onClick={handleVinylClick}>
            <motion.div
              animate={{ rotate: audioState.isPlaying || isPlaying ? 360 : 0 }}
              transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
              className="w-48 h-48 md:w-56 md:h-56 rounded-full p-2 bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-400 shadow-[0_0_40px_rgba(244,114,182,0.4)] flex items-center justify-center relative group-hover:scale-105 transition-transform"
            >
              <img
                src={resolvedCover || '/assets/img/1.jpg'}
                alt={currentSong.title}
                className="w-full h-full object-cover rounded-full border-4 border-black/80"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute w-12 h-12 rounded-full bg-[#080214] border-2 border-white/60 flex items-center justify-center shadow-lg">
                <Heart className="w-5 h-5 text-pink-400 fill-pink-400 animate-pulse" />
              </div>
            </motion.div>
          </div>

          {/* Audio Waveform Visualizer */}
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
              <h3 className="text-lg md:text-xl font-bold text-white truncate font-display">
                {currentSong.title}
              </h3>
              <p className="text-xs text-purple-300/80 truncate">{currentSong.artist}</p>
            </div>

            <button
              onClick={() => toggleFavoriteSong(currentSong.id)}
              className="p-2 text-purple-300 hover:text-pink-400 transition-colors cursor-pointer"
              aria-label="Favoritar música"
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
              onClick={prevSong}
              aria-label="Música anterior"
              className="p-3 rounded-full glass-panel text-purple-200 hover:text-pink-300 active:scale-90 transition-all cursor-pointer"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              aria-label={audioState.isPlaying || isPlaying ? 'Pausar' : 'Tocar'}
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-500 flex items-center justify-center text-white shadow-[0_0_30px_rgba(236,72,153,0.6)] active:scale-95 hover:brightness-110 transition-all cursor-pointer"
            >
              {audioState.isPlaying || isPlaying ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={nextSong}
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
              className="text-purple-300 hover:text-white cursor-pointer"
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
                      : 'text-purple-100/90 font-light hover:text-pink-300'
                  }`}
                >
                  {line}
                </p>
              ))
            ) : (
              <p className="text-xs text-purple-300/70 italic">
                Melodia instrumental criada com carinho para você.
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
          className="glass-card-glow rounded-3xl p-4 md:p-6 border border-purple-400/30 shadow-2xl space-y-3"
        >
          <div className="pb-2 border-b border-purple-500/20">
            <h3 className="text-base font-bold text-white font-display">
              Trilhas do Nosso Amor ♡
            </h3>
            <p className="text-xs text-purple-300/70">
              {songs.length} músicas guardadas na nossa história
            </p>
          </div>

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
                  <div className="w-8 h-8 rounded-xl bg-purple-950 flex items-center justify-center text-xs font-bold text-purple-300 flex-shrink-0">
                    {isThis && (audioState.isPlaying || isPlaying) ? (
                      <Sparkles className="w-4 h-4 text-pink-300 animate-spin" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4
                      className={`text-sm font-semibold truncate ${
                        isThis ? 'text-pink-200 font-bold' : 'text-white'
                      }`}
                    >
                      {song.title}
                    </h4>
                    <p className="text-[11px] text-purple-300/70 truncate">{song.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className="text-xs text-purple-300/70 font-mono">
                    {song.durationFormatted}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoriteSong(song.id);
                    }}
                    title="Favoritar"
                    className="p-1.5 text-purple-400 hover:text-pink-400 transition-colors cursor-pointer"
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
