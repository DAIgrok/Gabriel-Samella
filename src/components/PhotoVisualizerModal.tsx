import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  Download,
  Share2,
  Music,
  Maximize2,
  Minimize2,
  Info,
  Check,
} from 'lucide-react';
import { MemoryPhoto } from '../types';
import { SmartPhoto } from './SmartPhoto';
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
  const { toggleFavoritePhoto, triggerHeartExplosion, isPlaying, togglePlay, currentSong, showToast } = useApp();
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const currentIndex = photo ? photos.findIndex((p) => p.id === photo.id) : -1;

  // Keyboard navigation
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

  // Slideshow auto-advance
  useEffect(() => {
    let timer: number;
    if (isSlideshow && photo) {
      timer = window.setInterval(() => {
        handleNext();
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isSlideshow, photo, photos, currentIndex]);

  // Auto scroll thumbnail bar to active photo
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
    soundEngine.playHeartPop();
    const nextIdx = (currentIndex + 1) % photos.length;
    onSelectPhoto(photos[nextIdx]);
    setZoom(1);
    setRotation(0);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    showToast('Link do nosso álbum copiado com amor! 💌');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoritePhoto(photo.id);
    triggerHeartExplosion(0.5, 0.5);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between select-none overflow-hidden"
        onClick={() => {
          if (!isSlideshow) onClose();
        }}
      >
        {/* Ambient Blurred Glow Backdrop */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-600/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl" />
        </div>

        {/* --- TOP BAR --- */}
        <header
          className="relative z-30 px-4 py-3 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left: Index badge & Slideshow pill */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono font-medium text-purple-200 backdrop-blur-md">
              Foto {currentIndex + 1} de {photos.length}
            </span>

            <button
              onClick={() => setIsSlideshow((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                isSlideshow
                  ? 'bg-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.6)]'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
              }`}
            >
              {isSlideshow ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isSlideshow ? 'Pausar' : 'Cinema'}</span>
            </button>
          </div>

          {/* Center Title (Desktop) */}
          <div className="hidden md:flex flex-col items-center text-center">
            <h3 className="text-sm font-bold text-white tracking-wide font-display">{photo.title}</h3>
            <span className="text-[11px] text-purple-300/80 font-mono">assets/photos/{photo.index}.jpg</span>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white transition-all disabled:opacity-30"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= 2.5}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white transition-all disabled:opacity-30"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={handleRotate}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white transition-all"
              title="Girar 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleFavorite}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 hover:text-pink-400 transition-all"
              title="Favoritar"
            >
              <Heart
                className={`w-4 h-4 ${
                  photo.isFavorite ? 'text-pink-500 fill-pink-500 neon-glow-pink' : ''
                }`}
              />
            </button>

            <button
              onClick={() => setShowInfo((prev) => !prev)}
              className={`p-2 rounded-xl transition-all ${
                showInfo ? 'bg-purple-600 text-white' : 'bg-white/10 text-purple-200 hover:bg-white/20'
              }`}
              title="Detalhes da Memória"
            >
              <Info className="w-4 h-4" />
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

        {/* --- MAIN STAGE & NAVIGATION ARROWS --- */}
        <main
          className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Previous Arrow Button */}
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 z-30 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-pink-600 text-white/90 hover:text-white border border-white/15 backdrop-blur-xl transition-all duration-200 shadow-2xl active:scale-90 cursor-pointer"
            aria-label="Foto Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Arrow Button */}
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-6 z-30 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-pink-600 text-white/90 hover:text-white border border-white/15 backdrop-blur-xl transition-all duration-200 shadow-2xl active:scale-90 cursor-pointer"
            aria-label="Próxima Foto"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Active Photo Container */}
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-full max-h-[65vh] sm:max-h-[72vh] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-purple-500/30 flex items-center justify-center bg-black/50"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.25s ease-out',
            }}
          >
            <SmartPhoto
              photo={photo}
              alt={photo.title}
              className="w-auto h-auto max-w-full max-h-[65vh] sm:max-h-[72vh] object-contain rounded-2xl select-none pointer-events-auto"
            />
          </motion.div>

          {/* Slide-in Details Drawer */}
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="absolute right-4 top-4 bottom-4 w-80 rounded-2xl glass-card-glow border border-purple-400/30 p-5 z-40 flex flex-col justify-between shadow-2xl backdrop-blur-2xl text-left overflow-y-auto"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-pink-300 font-semibold uppercase">
                      Detalhes da Memória
                    </span>
                    <button
                      onClick={() => setShowInfo(false)}
                      className="p-1 rounded-lg text-purple-300 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-white font-display">{photo.title}</h4>
                    <p className="text-xs text-purple-200/80 mt-1">{photo.subtitle}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/20 text-xs space-y-1.5">
                    <div className="flex justify-between text-purple-300/70">
                      <span>Arquivo Local:</span>
                      <span className="font-mono text-white font-medium">assets/img/{photo.index}.jpg</span>
                    </div>
                    <div className="flex justify-between text-purple-300/70">
                      <span>Orientação:</span>
                      <span className="capitalize text-white">{photo.aspect}</span>
                    </div>
                    <div className="flex justify-between text-purple-300/70">
                      <span>Status:</span>
                      <span className="text-pink-400 font-medium">{photo.isFavorite ? '⭐ Favorita' : 'Normal'}</span>
                    </div>
                  </div>

                  {photo.caption && (
                    <div className="p-3 rounded-xl bg-pink-950/40 border border-pink-500/20 text-xs text-pink-200 leading-relaxed italic">
                      "{photo.caption}"
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-purple-500/20 flex gap-2">
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-600/60 hover:bg-purple-600 text-white text-xs font-semibold transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Compartilhar'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* --- BOTTOM SECTION: Caption, Integrated Audio & Thumbnails --- */}
        <footer
          className="relative z-30 px-4 py-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent backdrop-blur-xl border-t border-purple-500/20 flex flex-col gap-2.5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Integrated Mini Music Player Bar & Caption */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-4xl mx-auto w-full">
            <div className="text-center sm:text-left min-w-0 flex-1">
              <h4 className="text-sm font-bold text-white truncate font-display">{photo.title}</h4>
              <p className="text-xs text-purple-200/70 truncate">{photo.subtitle}</p>
            </div>

            {/* Quick Soundtrack Player */}
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-purple-400/30 backdrop-blur-md">
              <Music className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              <span className="text-xs text-white truncate max-w-[140px] font-medium">
                {currentSong.title}
              </span>
              <button
                onClick={togglePlay}
                className="p-1 rounded-full bg-pink-600 text-white hover:bg-pink-500 transition-transform active:scale-95"
                title="Tocar Trilha Sonora"
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
              </button>
            </div>
          </div>

          {/* Quick-switch Thumbnails Strip */}
          <div
            ref={thumbnailsRef}
            className="flex items-center gap-2 overflow-x-auto py-1 px-2 no-scrollbar max-w-4xl mx-auto w-full"
          >
            {photos.map((p, idx) => {
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
                    alt={p.title}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  <span className="absolute bottom-0.5 right-1 text-[9px] font-mono text-white/90 drop-shadow">
                    #{p.index}
                  </span>
                </button>
              );
            })}
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
};
