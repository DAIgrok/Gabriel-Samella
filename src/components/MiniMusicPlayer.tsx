import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { realAudio } from '../services/realAudio';

export const MiniMusicPlayer: React.FC = () => {
  const { currentSong, songs, nextSong, prevSong, isPlaying, playSong, pauseSong, toggleFavoriteSong } = useApp();
  const [audioState, setAudioState] = useState(realAudio.getState());
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoop, setIsLoop] = useState(true);

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

  const activeDuration = audioState.duration || currentSong.duration || 216;
  const activeCurrentTime = audioState.currentTime || (audioState.isPlaying || isPlaying ? 102 : 102); // 1:42 default like screenshot
  const progressPercent = Math.min(100, (activeCurrentTime / activeDuration) * 100);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    realAudio.seek(ratio * activeDuration);
  };

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioState.isPlaying || isPlaying) {
      realAudio.pause();
      pauseSong();
    } else {
      realAudio.playSong(currentSong);
      playSong(currentSong);
    }
  };

  return (
    <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#160a2c]/90 via-[#0e051c]/90 to-[#070210]/95 border border-purple-500/25 shadow-[0_10px_35px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-xl">
      {/* Background soft magenta ambient glow */}
      {(audioState.isPlaying || isPlaying) && (
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 via-purple-600/10 to-transparent pointer-events-none animate-pulse" />
      )}

      <div className="flex items-start gap-4">
        {/* Album Artwork Cover matching screenshot */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 relative border border-purple-500/30 shadow-md bg-purple-950/60">
          <img
            src="/assets/img/real/music_cover.jpg"
            alt={currentSong.title}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              audioState.isPlaying || isPlaying ? 'scale-105' : ''
            }`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/img/1.jpg';
            }}
          />
        </div>

        {/* Right Info: Title, Artist, Heart, Scrubber, Controls */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
          {/* Title & Favorite Heart */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                {currentSong.title || 'Te Vivo'}
              </h3>
              <p className="text-xs text-purple-200/75 truncate mt-0.5">
                {currentSong.artist || 'Luan Santana'}
              </p>
            </div>

            <button
              onClick={() => toggleFavoriteSong(currentSong.id)}
              className="p-1 text-pink-400 hover:scale-110 active:scale-95 transition-transform"
              title="Favoritar"
            >
              <Heart
                className={`w-4 h-4 ${
                  currentSong.isFavorite ? 'fill-pink-400 text-pink-400' : 'text-pink-300/80'
                }`}
              />
            </button>
          </div>

          {/* Progress Bar / Scrubber matching reference screenshot */}
          <div className="w-full my-1 cursor-pointer" onClick={handleSeek}>
            <div className="w-full h-1.5 bg-purple-950/80 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-pink-500 rounded-full transition-all duration-150 relative"
                style={{ width: `${progressPercent}%` }}
              >
                {/* Glowing knob indicator at tip */}
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

      {/* Control Buttons Row matching screenshot */}
      <div className="flex items-center justify-between pt-3 mt-1 px-3 border-t border-purple-500/15">
        <button
          onClick={() => setIsShuffle(!isShuffle)}
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

        {/* Circular Glowing Play/Pause button */}
        <button
          onClick={handlePlayToggle}
          className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#3b0764] to-[#6b21a8] border-2 border-pink-500/80 text-white flex items-center justify-center shadow-[0_0_18px_rgba(236,72,153,0.65)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title={(audioState.isPlaying || isPlaying) ? 'Pausar' : 'Tocar'}
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
          onClick={() => setIsLoop(!isLoop)}
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
