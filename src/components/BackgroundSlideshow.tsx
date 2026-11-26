import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { useResolvedMediaUrl } from '../services/localMediaStore';

export const BackgroundSlideshow: React.FC = () => {
  const { photos } = useApp();
  const prefersReducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);

  const validPhotos = useMemo(() => {
    const allValid = photos.filter(
      (p) =>
        p.url &&
        !p.url.startsWith('/assets/img/') &&
        (p.url.startsWith('http') || p.url.startsWith('data:') || p.url.startsWith('idb://'))
    );
    const loopMarked = allValid.filter((p) => p.inHomeLoop !== false);
    return loopMarked.length > 0 ? loopMarked : allValid;
  }, [photos]);

  useEffect(() => {
    if (validPhotos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validPhotos.length);
    }, 8500);

    return () => clearInterval(interval);
  }, [validPhotos.length]);

  const activePhoto = validPhotos[currentIndex % Math.max(1, validPhotos.length)];
  const resolvedUrl = useResolvedMediaUrl(activePhoto?.url);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#0a0512]">
      <AnimatePresence mode="sync">
        {activePhoto && resolvedUrl ? (
          <motion.div
            key={activePhoto.id}
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 2.4, ease: 'easeInOut' },
              scale: { duration: 18, ease: 'linear' },
            }}
            className="absolute inset-0"
          >
            <img
              src={resolvedUrl}
              alt="Foto do casal ao fundo"
              draggable={false}
              className="w-full h-full object-cover object-center opacity-50 pointer-events-none select-none"
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1c0836] via-[#2d0a4e] to-[#4c0d5a] opacity-55" />
        )}
      </AnimatePresence>

      {/* Vinheta suave equilibrada mantendo legibilidade da UI e destaque das fotos reais */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/48 to-black/70" />

      {/* Brilho magenta romântico sutil */}
      <div
        className="absolute inset-0 mix-blend-overlay opacity-25"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(236, 72, 153, 0.5) 0%, transparent 100%)',
        }}
      />
    </div>
  );
};
