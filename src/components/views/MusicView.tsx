import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Plus,
  X,
  Link as LinkIcon,
  Loader2,
  Youtube,
  Shuffle,
  Repeat,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Song } from '../../types';
import {
  extractYouTubeId,
  fetchYouTubeMetadata,
  getYouTubeThumbnailUrl,
  realAudio,
} from '../../services/realAudio';
import { soundEngine } from '../../utils/audioSynth';
import { useResolvedMediaUrl } from '../../services/localMediaStore';
import { REAL_PHOTO_SLOTS } from '../../data/mediaAssets';

export const MusicView: React.FC = () => {
  const {
    config,
    songs,
    currentSong,
    isPlaying,
    isShuffle,
    isLoop,
    playbackTime,
    playSong,
    togglePlay,
    nextSong,
    prevSong,
    toggleShuffle,
    toggleLoop,
    toggleFavoriteSong,
    addSong,
    triggerEasterEgg,
    triggerHeartExplosion,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'player' | 'letras' | 'playlist'>('player');
  const [audioState, setAudioState] = useState(realAudio.getState());
  const [visualizerBars, setVisualizerBars] = useState<number[]>(new Array(16).fill(12));
  const resolvedCover = useResolvedMediaUrl(currentSong?.coverUrl || '/assets/img/1.jpg');

  // Add Song Modal State (open to both Gabriel & Samella!)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [songUrlInput, setSongUrlInput] = useState('');
  const [songTitleInput, setSongTitleInput] = useState('');
  const [songArtistInput, setSongArtistInput] = useState('');
  const [songCoverPreview, setSongCoverPreview] = useState('');
  const [songLyricsInput, setSongLyricsInput] = useState('');
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [detectedYtId, setDetectedYtId] = useState<string | null>(null);

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

  // Auto-detect YouTube links & fetch title/cover
  useEffect(() => {
    const ytId = extractYouTubeId(songUrlInput);
    setDetectedYtId(ytId);
    if (!ytId) {
      setSongCoverPreview('');
      return;
    }

    let active = true;
    setSongCoverPreview(getYouTubeThumbnailUrl(ytId));
    setIsFetchingMeta(true);
    fetchYouTubeMetadata(songUrlInput)
      .then((meta) => {
        if (!active || !meta) return;
        setSongTitleInput((prev) => prev.trim() || meta.title);
        setSongArtistInput((prev) => prev.trim() || meta.artist);
        setSongCoverPreview(meta.coverUrl);
      })
      .finally(() => {
        if (active) setIsFetchingMeta(false);
      });

    return () => {
      active = false;
    };
  }, [songUrlInput]);

  const activeDuration = audioState.duration || currentSong?.duration || 210;
  const activeCurrentTime = audioState.isFileAvailable
    ? audioState.currentTime
    : audioState.currentTime || playbackTime || 0;
  const progressPercent = Math.min(100, (activeCurrentTime / Math.max(1, activeDuration)) * 100);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentSong) return;
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

  const handleCreateSong = (e: React.FormEvent) => {
    e.preventDefault();
    const rawUrl = songUrlInput.trim();
    if (!rawUrl) {
      showToast('Cole o link do YouTube ou link direto de áudio!', '⚠️');
      return;
    }

    const ytId = extractYouTubeId(rawUrl);
    const newSongPayload: Omit<Song, 'id'> = {
      title: songTitleInput.trim() || (ytId ? 'Nossa Música do YouTube' : 'Nossa Canção ♡'),
      artist: songArtistInput.trim() || `${config.myName} & ${config.partnerName}`,
      duration: 210,
      durationFormatted: '3:30',
      audioUrl: rawUrl,
      youtubeId: ytId || undefined,
      sourceType: ytId ? 'youtube' : 'audio',
      coverUrl: songCoverPreview || (ytId ? getYouTubeThumbnailUrl(ytId) : REAL_PHOTO_SLOTS.musicCovers[0]),
      lyrics: songLyricsInput.trim()
        ? songLyricsInput.split('\n').map((l) => l.trim())
        : ['Trilha guardada com amor para o Nosso Mundo ♡'],
    };

    addSong(newSongPayload);
    setSongUrlInput('');
    setSongTitleInput('');
    setSongArtistInput('');
    setSongCoverPreview('');
    setSongLyricsInput('');
    setIsAddModalOpen(false);
  };

  const emptyStateCard = (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card-glow rounded-[2.2rem] p-8 border-2 border-purple-500/25 shadow-2xl text-center space-y-4 bg-gradient-to-b from-[#1c0836]/90 to-[#0a0512]/95"
    >
      <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-tr from-purple-700/40 to-pink-600/40 border border-pink-400/40 flex items-center justify-center shadow-lg">
        <Youtube className="w-9 h-9 text-pink-300" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-xl font-bold text-white font-display">
          Nenhuma música adicionada ainda ♡
        </h3>
        <p className="text-xs text-purple-200/80 max-w-sm mx-auto leading-relaxed">
          Cole um link do YouTube ou YouTube Music abaixo — a música fica salva na nuvem para vocês dois ouvirem em todos os players do app!
        </p>
      </div>
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-[0_0_24px_rgba(236,72,153,0.45)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Adicionar Música do YouTube</span>
      </button>
    </motion.div>
  );

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
          Adicione links do YouTube e ouça juntos em qualquer tela 🎶
        </p>
      </div>

      {/* Mode Switcher + Add Music Action */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-1 p-1 rounded-2xl glass-panel border border-purple-500/20">
          {[
            { id: 'player', label: 'Tocar', icon: Play },
            { id: 'letras', label: 'Letras', icon: FileText },
            { id: 'playlist', label: `Lista (${songs.length})`, icon: ListMusic },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'player' | 'letras' | 'playlist')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
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

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Adicionar Música</span>
        </button>
      </div>

      {/* Main Player View */}
      {activeTab === 'player' &&
        (!currentSong ? (
          emptyStateCard
        ) : (
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
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full border-4 border-black/80"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/img/1.jpg';
                  }}
                />
                <div className="absolute w-12 h-12 rounded-full bg-[#080214] border-2 border-white/60 flex items-center justify-center shadow-lg">
                  <Heart className="w-5 h-5 text-pink-400 fill-pink-400 animate-pulse" />
                </div>
              </motion.div>
            </div>

            {audioState.fileNotFoundNotice && (
              <p className="text-[11px] text-amber-300/90 mb-1">{audioState.fileNotFoundNotice}</p>
            )}

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
                <div className="flex items-center gap-2">
                  <h3 className="text-lg md:text-xl font-bold text-white truncate font-display">
                    {currentSong.title}
                  </h3>
                  {(currentSong.youtubeId || extractYouTubeId(currentSong.audioUrl)) && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/25 border border-rose-400/40 text-[10px] font-bold text-rose-200 shrink-0">
                      YouTube
                    </span>
                  )}
                </div>
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
            <div className="flex items-center justify-center gap-4 my-2">
              <button
                onClick={toggleShuffle}
                aria-label="Aleatório"
                className={`p-2.5 rounded-full glass-panel transition-all cursor-pointer ${
                  isShuffle ? 'text-pink-400 border border-pink-400/40' : 'text-purple-300/70 hover:text-white'
                }`}
              >
                <Shuffle className="w-4 h-4" />
              </button>

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

              <button
                onClick={toggleLoop}
                aria-label="Repetir"
                className={`p-2.5 rounded-full glass-panel transition-all cursor-pointer ${
                  isLoop ? 'text-pink-400 border border-pink-400/40' : 'text-purple-300/70 hover:text-white'
                }`}
              >
                <Repeat className="w-4 h-4" />
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
        ))}

      {/* Lyrics Tab */}
      {activeTab === 'letras' &&
        (!currentSong ? (
          emptyStateCard
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card-glow rounded-3xl p-6 border border-purple-400/30 shadow-2xl space-y-4 max-h-[500px] overflow-y-auto text-center"
          >
            <div className="border-b border-purple-500/20 pb-3">
              <h3 className="text-lg font-bold text-white font-display">{currentSong.title}</h3>
              <p className="text-xs text-pink-300 font-medium">{currentSong.artist}</p>
            </div>

            <div className="space-y-3 py-2">
              {currentSong.lyrics && currentSong.lyrics.length > 0 ? (
                currentSong.lyrics.map((line, idx) => (
                  <p
                    key={idx}
                    className={`text-sm md:text-base leading-relaxed transition-all ${
                      line === '' ? 'py-1' : 'text-purple-100/90 font-light hover:text-pink-300'
                    }`}
                  >
                    {line}
                  </p>
                ))
              ) : (
                <p className="text-xs text-purple-300/70 italic">
                  Melodia especial guardada para você ♡
                </p>
              )}
            </div>
          </motion.div>
        ))}

      {/* Playlist Tab */}
      {activeTab === 'playlist' &&
        (songs.length === 0 ? (
          emptyStateCard
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card-glow rounded-3xl p-4 md:p-6 border border-purple-400/30 shadow-2xl space-y-3"
          >
            <div className="pb-2 border-b border-purple-500/20 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Trilhas do Nosso Amor ♡
                </h3>
                <p className="text-xs text-purple-300/70">
                  {songs.length} {songs.length === 1 ? 'música salva' : 'músicas salvas'} na nuvem
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-pink-600/80 hover:bg-pink-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova</span>
              </button>
            </div>

            {songs.map((song, index) => {
              const isThis = currentSong?.id === song.id;
              const isYt = Boolean(song.youtubeId || extractYouTubeId(song.audioUrl));
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
                    <div className="w-9 h-9 rounded-xl bg-purple-950 flex items-center justify-center text-xs font-bold text-purple-300 flex-shrink-0 overflow-hidden border border-purple-500/25">
                      {isThis && (audioState.isPlaying || isPlaying) ? (
                        <Sparkles className="w-4 h-4 text-pink-300 animate-spin" />
                      ) : song.coverUrl ? (
                        <img
                          src={song.coverUrl}
                          alt={song.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
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
                        {isYt && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-[9px] font-bold text-rose-200 shrink-0">
                            YT
                          </span>
                        )}
                      </div>
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
        ))}

      {/* Add Music Modal (YouTube & Audio Links — available for both Samella & Gabriel) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isAddModalOpen && (
              <div
                className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
                onClick={() => setIsAddModalOpen(false)}
              >
                <motion.form
                  onSubmit={handleCreateSong}
                  initial={{ scale: 0.94, opacity: 0, y: 12 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.94, opacity: 0, y: 12 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-md bg-[#110526] border border-pink-400/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                    <div className="flex items-center gap-2">
                      <Youtube className="w-5 h-5 text-pink-400" />
                      <h3 className="text-base font-bold text-white font-display">
                        Adicionar Música ♡
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="p-1.5 rounded-full text-purple-300 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-purple-200/80 leading-relaxed">
                    Cole o link de qualquer música do <strong>YouTube</strong> ou <strong>YouTube Music</strong> (ou link MP3 direto). A música fica salva para vocês dois em todos os players!
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-pink-200 block mb-1">
                        Link do YouTube ou Áudio *
                      </label>
                      <div className="relative">
                        <LinkIcon className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          autoFocus
                          value={songUrlInput}
                          onChange={(e) => setSongUrlInput(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-white text-xs font-mono focus:outline-none focus:border-pink-400"
                        />
                      </div>
                    </div>

                    {(detectedYtId || isFetchingMeta) && (
                      <div className="p-2.5 rounded-2xl bg-purple-950/60 border border-pink-400/30 flex items-center gap-3">
                        {songCoverPreview && (
                          <img
                            src={songCoverPreview}
                            alt="Capa YouTube"
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/15"
                          />
                        )}
                        <div className="min-w-0 flex-1 text-xs">
                          {isFetchingMeta ? (
                            <span className="flex items-center gap-1.5 text-pink-300">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Buscando nome da música...
                            </span>
                          ) : (
                            <span className="text-emerald-300 font-semibold">
                              ✓ Link do YouTube reconhecido!
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-xs text-purple-300 block mb-1">Nome da Música</label>
                        <input
                          type="text"
                          value={songTitleInput}
                          onChange={(e) => setSongTitleInput(e.target.value)}
                          placeholder="Ex: Te Vivo"
                          className="w-full px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs focus:outline-none focus:border-pink-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-purple-300 block mb-1">Cantor / Artista</label>
                        <input
                          type="text"
                          value={songArtistInput}
                          onChange={(e) => setSongArtistInput(e.target.value)}
                          placeholder="Ex: Luan Santana"
                          className="w-full px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs focus:outline-none focus:border-pink-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-purple-300 block mb-1">
                        Letra / Dedicatória (opcional)
                      </label>
                      <textarea
                        rows={2}
                        value={songLyricsInput}
                        onChange={(e) => setSongLyricsInput(e.target.value)}
                        placeholder="Escreva a letra ou uma dedicatória..."
                        className="w-full px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs focus:outline-none focus:border-pink-400"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl glass-panel text-xs font-semibold text-purple-200 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-lg cursor-pointer"
                    >
                      Salvar na Playlist ♡
                    </button>
                  </div>
                </motion.form>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </motion.div>
  );
};
