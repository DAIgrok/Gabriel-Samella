import React, { useState } from 'react';
import { Image as ImageIcon, Heart, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion } from 'motion/react';
import { MemoryPhoto } from '../../types';
import { soundEngine } from '../../utils/audioSynth';
import { SmartPhoto } from '../SmartPhoto';

export const PhotosView: React.FC = () => {
  const {
    photos,
    selectedPhoto,
    setSelectedPhoto,
    toggleFavoritePhoto,
    unlockAchievement,
    showToast,
  } = useApp();

  const [filter, setFilter] = useState<'todas' | 'favoritas'>('todas');

  const filteredPhotos = photos.filter((p) => {
    if (filter === 'favoritas') return p.isFavorite;
    return true;
  });

  const handleOpenPhoto = (photo: MemoryPhoto) => {
    soundEngine.playHeartPop();
    setSelectedPhoto(photo);
    unlockAchievement('ach-first-memory');
  };

  const handleStartSlideshow = () => {
    soundEngine.playSparkle();
    if (!selectedPhoto && photos.length > 0) {
      setSelectedPhoto(photos[0]);
    }
    showToast('Modo Cinema Iniciado! ✨');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 pb-32 sm:pb-24 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-xs font-semibold text-purple-300 mb-1">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Álbum de Memórias do Casal</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
          Nossa História em Imagens ♡
        </h2>
        <p className="text-xs md:text-sm text-purple-200/70">
          Cada sorriso e instante eternizados para nós dois ✨
        </p>
      </div>

      {/* Filter and Cinema Mode Controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel border border-purple-500/20">
          <button
            onClick={() => setFilter('todas')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              filter === 'todas'
                ? 'bg-white text-purple-900 shadow-md'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            Todas ({photos.length})
          </button>
          <button
            onClick={() => setFilter('favoritas')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              filter === 'favoritas'
                ? 'bg-white text-purple-900 shadow-md'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            Favoritas ⭐
          </button>
        </div>

        <button
          onClick={handleStartSlideshow}
          className="flex items-center gap-1.5 px-4 min-h-[40px] py-2 rounded-2xl bg-white text-purple-900 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Slideshow</span>
        </button>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3">
        {filteredPhotos.map((photo, i) => (
          <motion.div
            key={photo.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (i % 6) * 0.06 }}
            className="group relative overflow-hidden bg-slate-900/50 aspect-square cursor-pointer rounded-[24px] shadow-sm border border-white/5"
            onClick={() => handleOpenPhoto(photo)}
          >
            <SmartPhoto
              photo={photo}
              alt={photo.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Favorite Button Overlay */}
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavoritePhoto(photo.id);
                }}
                className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white/90 hover:text-pink-400 transition-colors cursor-pointer"
                title="Favoritar"
              >
                <Heart
                  className={`w-4 h-4 ${
                    photo.isFavorite ? 'text-pink-400 fill-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]' : ''
                  }`}
                />
              </button>
            </div>

            {/* Title Scrim */}
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs font-bold text-white truncate">{photo.title}</p>
              <p className="text-[10px] text-purple-200/80 truncate">{photo.date}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
