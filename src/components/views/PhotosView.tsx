import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Heart,
  Play,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion } from 'motion/react';
import { MemoryPhoto } from '../../types';
import { soundEngine } from '../../utils/audioSynth';
import { SmartPhoto } from '../SmartPhoto';
import { PhotoVisualizerModal } from '../PhotoVisualizerModal';

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
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
          Gabriel & Samella • Fotos salvas na pasta <code className="text-pink-300 font-mono">public/assets/photos/</code>
        </p>
      </div>

      {/* Filter and Cinema Mode Controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel border border-purple-500/20">
          <button
            onClick={() => setFilter('todas')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === 'todas'
                ? 'bg-white text-purple-900 shadow-md'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            Todas ({photos.length})
          </button>
          <button
            onClick={() => setFilter('favoritas')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
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
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white text-purple-900 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Slideshow</span>
        </button>
      </div>

      {/* Photos Grid Premium iPhone Style */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2">
        {filteredPhotos.map((photo, i) => (
          <motion.div
            key={photo.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (i % 6) * 0.1 }}
            className="group relative overflow-hidden bg-slate-900/50 aspect-square cursor-pointer rounded-[24px] shadow-sm border border-white/5"
            onClick={() => handleOpenPhoto(photo)}
          >
            <SmartPhoto
              photo={photo}
              alt={photo.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Favorite Button Overlay (iOS Style) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavoritePhoto(photo.id);
              }}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md text-white/90 hover:text-pink-400 transition-colors z-10"
              title="Favoritar"
            >
              <Heart
                className={`w-4 h-4 ${
                  photo.isFavorite ? 'text-pink-400 fill-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]' : ''
                }`}
              />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Fullscreen Photo Visualizer Modal */}
      <PhotoVisualizerModal
        photo={selectedPhoto}
        photos={filteredPhotos}
        onClose={() => setSelectedPhoto(null)}
        onSelectPhoto={(p) => setSelectedPhoto(p)}
      />
    </motion.div>
  );
};
