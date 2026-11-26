import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Music,
} from 'lucide-react';
import { MemoryPhoto } from '../types';
import { SmartPhoto } from './SmartPhoto';
import { ProtectedCanvasPhoto } from './ProtectedCanvasPhoto';
import { useApp } from '../context/AppContext';
import { soundEngine } from '../utils/audioSynth';

interface PhotoVisualizerModalProps {
  photo: MemoryPhoto | null;
  photos: MemoryPhoto[];
  onClose: () => void;
  onSelectPhoto: (photo: MemoryPhoto) => void;
}

export const PhotoVisualizerModal: React.FC<PhotoVisualizerModalProps> = ({
  photo,
  photos,
  onClose,
  onSelectPhoto,
}) => {
  const { toggleFavoritePhoto, triggerHeartExplosion, isPlaying, togglePlay, currentSong } = useApp();
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const currentIndex = photo ? photos.findIndex((p) => p.id === photo.id) : -1;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!photo) return;
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsSlideshow((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photo, photos, currentIndex]);

  useEffect(() => {
    let timer: number;
    if (isSlideshow && photo && photos.length > 1) {
      timer = window.setInterval(() => {
        handleNext();
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isSlideshow, photo, photos, currentIndex]);

  useEffect(() => {
    if (thumbnailsRef.current && currentIndex >= 0) {
      const activeThumb = thumbnailsRef.current.children[currentIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentIndex]);

  if (!photo) return null;

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (photos.length === 0) return;
    soundEngine.playHeartPop();
    const nextIdx = (currentIndex + 1) % photos.length;
    onSelectPhoto(photos[nextIdx]);
    setZoom(1);
    setRotation(0);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (photos.length === 0) return;
    soundEngine.playHeartPop();
    const prevIdx = (currentIndex - 1 + photos.length) % photos.length;
    onSelectPhoto(photos[prevIdx]);
    setZoom(1);
    setRotation(0);
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((z) => Math.min(2.5, z + 0.3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((z) => Math.max(1, z - 0.3));
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRotation((r) => (r + 90) % 360);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoritePhoto(photo.id);
    triggerHeartExplosion(0.5, 0.5);
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-2xl flex flex-col justify-between select-none overflow-hidden"
        onClick={() => {
          if (!isSlideshow) onClose();
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-600/30 rounded-full blur-3xl animate-pulse" />
        </div>

        {/* Barra Superior Limpa (sem título, subtítulo, data ou descrição) */}
        <header
          className="relative z-30 px-4 py-3 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono font-medium text-purple-200 backdrop-blur-md tabular-nums">
              {currentIndex + 1} / {photos.length}
            </span>

            {photos.length > 1 && (
              <button
                onClick={() => setIsSlideshow((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isSlideshow
                    ? 'bg-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.6)]'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
                }`}
              >
                {isSlideshow ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isSlideshow ? 'Pausar' : 'Cinema'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white transition-all disabled:opacity-30 cursor-pointer"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= 2.5}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white transition-all disabled:opacity-30 cursor-pointer"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={handleRotate}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white transition-all cursor-pointer"
              title="Girar 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleFavorite}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 hover:text-pink-400 transition-all cursor-pointer"
              title="Favoritar"
            >
              <Heart
                className={`w-4 h-4 ${
                  photo.isFavorite ? 'text-pink-500 fill-pink-500 neon-glow-pink' : ''
                }`}
              />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-pink-600/80 hover:bg-pink-500 text-white transition-all ml-1 shadow-lg cursor-pointer"
              title="Fechar Visualizador (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Palco Principal */}
        <main
          className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden touch-pan-y"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => {
            if (e.touches.length === 1 && zoom <= 1.05) {
              touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            } else {
              touchStartRef.current = null;
            }
          }}
          onTouchEnd={(e) => {
            if (!touchStartRef.current || e.changedTouches.length === 0) return;
            const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
            const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
            touchStartRef.current = null;
            if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.25) {
              if (dx < 0) handleNext();
              else handlePrev();
            } else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) {
              onClose();
            }
          }}
        >
          {photos.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 sm:left-6 z-30 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-pink-600 text-white/90 hover:text-white border border-white/15 backdrop-blur-xl transition-all duration-200 shadow-2xl active:scale-90 cursor-pointer"
                aria-label="Foto Anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-2 sm:right-6 z-30 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-pink-600 text-white/90 hover:text-white border border-white/15 backdrop-blur-xl transition-all duration-200 shadow-2xl active:scale-90 cursor-pointer"
                aria-label="Próxima Foto"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="relative max-w-full max-h-[68vh] sm:max-h-[75vh] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-purple-500/30 flex items-center justify-center bg-black/50"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.25s ease-out',
            }}
          >
            <ProtectedCanvasPhoto
              src={photo.url}
              alt="Foto do Casal"
              watermarkText="Gabriel & Samella ♡"
              className="max-w-[92vw] max-h-[68vh] sm:max-h-[75vh] rounded-2xl"
            />
          </motion.div>
        </main>

        {/* Rodapé limpo apenas com player rápido e miniaturas */}
        <footer
          className="relative z-30 px-4 py-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent backdrop-blur-xl border-t border-purple-500/20 flex flex-col gap-2.5"
          onClick={(e) => e.stopPropagation()}
        >
          {currentSong && (
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-purple-400/30 backdrop-blur-md">
                <Music className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                <span className="text-xs text-white truncate max-w-[180px] font-medium">
                  {currentSong.title}
                </span>
                <button
                  onClick={togglePlay}
                  className="p-1 rounded-full bg-pink-600 text-white hover:bg-pink-500 transition-transform active:scale-95 cursor-pointer"
                  title="Tocar Trilha Sonora"
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                </button>
              </div>
            </div>
          )}

          <div
            ref={thumbnailsRef}
            className="flex items-center gap-2 overflow-x-auto py-1 px-2 no-scrollbar max-w-4xl mx-auto w-full"
          >
            {photos.map((p) => {
              const isActive = p.id === photo.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    soundEngine.playHeartPop();
                    onSelectPhoto(p);
                    setZoom(1);
                    setRotation(0);
                  }}
                  className={`relative flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'border-pink-500 scale-110 shadow-[0_0_12px_rgba(236,72,153,0.8)] z-10'
                      : 'border-white/20 opacity-50 hover:opacity-100 hover:border-purple-400'
                  }`}
                >
                  <SmartPhoto
                    photo={p}
                    alt="Miniatura"
                    className="w-full h-full object-cover pointer-events-none"
                    hideDetails
                  />
                </button>
              );
            })}
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
