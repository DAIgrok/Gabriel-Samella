import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { useResolvedMediaUrl } from '../services/localMediaStore';

export const BackgroundSlideshow: React.FC = () => {
  const { photos } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);

  const validPhotos = useMemo(() => {
    const allValid = photos.filter(
      (p) => p.url && (p.url.startsWith('http') || p.url.startsWith('data:') || p.url.startsWith('/assets/') || p.url.startsWith('idb://'))
    );
    const loopMarked = allValid.filter((p) => p.inHomeLoop);
    return loopMarked.length > 0 ? loopMarked : allValid;
  }, [photos]);

  useEffect(() => {
    if (validPhotos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (validPhotos.length <= 1) return 0;
        let nextIndex = prev;
        while (nextIndex === prev) {
          nextIndex = Math.floor(Math.random() * validPhotos.length);
        }
        return nextIndex;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [validPhotos.length]);

  const activePhoto = validPhotos[currentIndex % Math.max(1, validPhotos.length)];
  const resolvedUrl = useResolvedMediaUrl(activePhoto?.url);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#0a0512]">
      <AnimatePresence>
        {activePhoto && resolvedUrl ? (
          <motion.div
            key={activePhoto.id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 3, ease: 'easeInOut' },
              scale: { duration: 25, ease: 'linear' },
            }}
            className="absolute inset-0"
          >
            <img
              src={resolvedUrl}
              alt="Memory"
              className="w-full h-full object-cover object-center opacity-40"
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1c0836] via-[#2d0a4e] to-[#4c0d5a] opacity-50" />
        )}
      </AnimatePresence>

      {/* Heavy dark gradient overlay to ensure UI elements remain visible and legible over bright photos */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/80" />

      {/* Atmospheric romantic glow overlay */}
      <div
        className="absolute inset-0 mix-blend-overlay opacity-30"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(236, 72, 153, 0.5) 0%, transparent 100%)',
        }}
      />
    </div>
  );
};
