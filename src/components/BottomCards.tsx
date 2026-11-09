import React from 'react';
import { Play, Pause, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';

export const BottomCards: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    playbackTime,
    toggleFavoriteSong,
    triggerEasterEgg,
    triggerHeartExplosion,
    setExtendedView,
  } = useApp();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = Math.min(100, (playbackTime / currentSong.duration) * 100);

  const handleForYouHeartClick = () => {
    triggerHeartExplosion(0.8, 0.85);
    triggerEasterEgg('egg-for-you-card');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full">
      {/* Left Card: "Nossa música" */}
      <div
        id="card-nossa-musica"
        className="glass-panel rounded-[26px] p-4 sm:p-5 border border-purple-400/20 shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-purple-200">Nossa música</span>
          <button
            onClick={() => toggleFavoriteSong(currentSong.id)}
            className="p-1 text-purple-300/70 hover:text-pink-400 transition-colors cursor-pointer"
            title="Favoritar música"
          >
            <Heart
              className={`w-4 h-4 ${
                currentSong.isFavorite
                  ? 'text-pink-400 fill-pink-400 neon-glow-pink'
                  : 'text-purple-300/60'
              }`}
            />
          </button>
        </div>

        {/* Content with Circular Play Button and Track details */}
        <div className="flex items-center gap-3 my-1">
          <button
            id="btn-bottom-play-pause"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pausar música' : 'Tocar nossa música'}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => setExtendedView('musica')}
            role="button"
            tabIndex={0}
          >
            <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
              {currentSong.title} — <span className="text-purple-200/70 font-normal">{currentSong.artist}</span>
            </h4>

            {/* Linear waveform progress */}
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-purple-200/60 font-sans mt-1">
              <span>{formatTime(playbackTime)}</span>
              <span>{currentSong.durationFormatted}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Card: "Para você" with Glittering Neon Heart */}
      <div
        id="card-para-voce"
        className="glass-panel rounded-[26px] p-4 sm:p-5 border border-purple-400/20 shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3 relative overflow-hidden group"
      >
        {/* Ambient background glow */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-pink-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-purple-200 mb-1 flex items-center gap-1">
            <span>Para você</span>
          </h4>
          <p className="text-xs sm:text-[13px] text-purple-100/90 leading-relaxed">
            Tudo aqui foi feito com amor, só para te ver sorrir.
          </p>
        </div>

        {/* Glittering Neon Stardust Heart Graphic matching screenshot */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 4 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleForYouHeartClick}
          className="relative w-14 h-14 flex-shrink-0 cursor-pointer flex items-center justify-center select-none"
          title="Toque no coração de amor"
        >
          <div className="absolute inset-0 rounded-full bg-pink-500/20 blur-md animate-pulse" />
          <Heart className="w-9 h-9 text-pink-400 fill-pink-400/80 drop-shadow-[0_0_12px_rgba(244,114,182,0.9)]" />
        </motion.div>
      </div>
    </div>
  );
};
