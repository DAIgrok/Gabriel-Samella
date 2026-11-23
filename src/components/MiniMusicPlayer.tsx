import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  Music,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { realAudio } from '../services/realAudio';
import { getCouplePhotoUrl, REAL_PHOTO_SLOTS } from '../data/mediaAssets';
import { useResolvedMediaUrl } from '../services/localMediaStore';

export const MiniMusicPlayer: React.FC = () => {
  const {
    currentSong,
    songs,
    photos,
    playbackTime,
    nextSong,
    prevSong,
    isPlaying,
    isShuffle,
    isLoop,
    toggleShuffle,
    toggleLoop,
    togglePlay,
    toggleFavoriteSong,
    setExtendedView,
  } = useApp();
  const [audioState, setAudioState] = useState(realAudio.getState());
  const resolvedCoverUrl = useResolvedMediaUrl(
    currentSong?.coverUrl || getCouplePhotoUrl(photos, 0)
  );

  useEffect(() => {
    const unsubscribe = realAudio.subscribe(() => {
      setAudioState(realAudio.getState());
    });
    return unsubscribe;
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentSong || songs.length === 0) {
    return (
      <div
        onClick={() => setExtendedView('musica')}
        role="button"
        tabIndex={0}
        className="rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#160a2c]/90 via-[#0e051c]/90 to-[#070210]/95 border border-purple-500/25 shadow-[0_10px_35px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-xl cursor-pointer group hover:border-pink-400/45 transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-purple-900/70 to-pink-700/40 border border-pink-400/30 flex items-center justify-center flex-shrink-0 shadow-inner">
            <Music className="w-7 h-7 text-pink-300" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Nossa Trilha Sonora ♡
            </h3>
            <p className="text-xs text-purple-200/75 mt-0.5 line-clamp-2">
              Adicione músicas pelo link do YouTube ou MP3 para tocar aqui e em todo o app.
            </p>
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-md group-hover:scale-105 transition-transform">
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Música</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeDuration = audioState.duration || currentSong.duration || 210;
  const activeCurrentTime = audioState.currentTime || playbackTime || 0;
  const progressPercent = activeDuration > 0 ? Math.min(100, (activeCurrentTime / activeDuration) * 100) : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    realAudio.seek(ratio * activeDuration);
  };

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlay();
  };

  return (
    <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#160a2c]/90 via-[#0e051c]/90 to-[#070210]/95 border border-purple-500/25 shadow-[0_10px_35px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-xl">
      {/* Background soft magenta ambient glow */}
      {(audioState.isPlaying || isPlaying) && (
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 via-purple-600/10 to-transparent pointer-events-none animate-pulse" />
      )}

      <div className="flex items-start gap-4">
        {/* Album Artwork Cover */}
        <div
          onClick={() => setExtendedView('musica')}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 relative border border-purple-500/30 shadow-md bg-gradient-to-tr from-purple-900/80 to-pink-700/40 flex items-center justify-center cursor-pointer"
        >
          {resolvedCoverUrl ? (
            <img
              src={resolvedCoverUrl}
              alt={currentSong.title}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-transform duration-500 ${
                audioState.isPlaying || isPlaying ? 'scale-105' : ''
              }`}
            />
          ) : (
            <Music className="w-8 h-8 text-pink-300" />
          )}
        </div>

        {/* Right Info: Title, Artist, Heart, Scrubber */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div
              onClick={() => setExtendedView('musica')}
              className="min-w-0 flex-1 cursor-pointer"
            >
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                {currentSong.title}
              </h3>
              <p className="text-xs text-purple-200/75 truncate mt-0.5">
                {currentSong.artist}
              </p>
            </div>

            <button
              onClick={() => toggleFavoriteSong(currentSong.id)}
              className="p-1 text-pink-400 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              title="Favoritar"
            >
              <Heart
                className={`w-4 h-4 ${
                  currentSong.isFavorite ? 'fill-pink-400 text-pink-400' : 'text-pink-300/80'
                }`}
              />
            </button>
          </div>

          {/* Progress Bar / Scrubber */}
          <div className="w-full my-1 cursor-pointer" onClick={handleSeek}>
            <div className="w-full h-1.5 bg-purple-950/80 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-pink-500 rounded-full transition-all duration-150 relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_6px_rgba(244,114,182,1)]" />
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-purple-200/60 font-mono mt-1">
              <span>{formatTime(activeCurrentTime)}</span>
              <span>{formatTime(activeDuration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons Row */}
      <div className="flex items-center justify-between pt-3 mt-1 px-3 border-t border-purple-500/15">
        <button
          onClick={toggleShuffle}
          className={`p-1.5 transition-colors cursor-pointer ${
            isShuffle ? 'text-pink-400' : 'text-purple-300/70 hover:text-white'
          }`}
          title="Aleatório"
        >
          <Shuffle className="w-4 h-4" />
        </button>

        <button
          onClick={prevSong}
          className="p-1.5 text-white/90 hover:text-pink-300 transition-colors cursor-pointer"
          title="Anterior"
        >
          <SkipBack className="w-4 h-4 fill-current" />
        </button>

        <button
          onClick={handlePlayToggle}
          className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#3b0764] to-[#6b21a8] border-2 border-pink-500/80 text-white flex items-center justify-center shadow-[0_0_18px_rgba(236,72,153,0.65)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title={audioState.isPlaying || isPlaying ? 'Pausar' : 'Tocar'}
        >
          {audioState.isPlaying || isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        <button
          onClick={nextSong}
          className="p-1.5 text-white/90 hover:text-pink-300 transition-colors cursor-pointer"
          title="Próxima"
        >
          <SkipForward className="w-4 h-4 fill-current" />
        </button>

        <button
          onClick={toggleLoop}
          className={`p-1.5 transition-colors cursor-pointer ${
            isLoop ? 'text-pink-400' : 'text-purple-300/70 hover:text-white'
          }`}
          title="Repetir"
        >
          <Repeat className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
