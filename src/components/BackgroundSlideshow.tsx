import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

export const BackgroundSlideshow: React.FC = () => {
  const { photos } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter only photos that have valid URLs (starts with http, data:image, or local assets)
  // Also we want to ensure we have actual photos from the memories
  const validPhotos = useMemo(() => {
    return photos.filter((p) => p.url && (p.url.startsWith('http') || p.url.startsWith('data:') || p.url.startsWith('/assets/')));
  }, [photos]);

  useEffect(() => {
    if (validPhotos.length <= 1) return;

    // Randomize the next photo to show
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        let nextIndex = prev;
        while (nextIndex === prev && validPhotos.length > 1) {
          nextIndex = Math.floor(Math.random() * validPhotos.length);
        }
        return nextIndex;
      });
    }, 10000); // 10 seconds per photo

    return () => clearInterval(interval);
  }, [validPhotos.length]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#0a0512]">
      <AnimatePresence>
        {validPhotos.length > 0 ? (
          <motion.div
            key={validPhotos[currentIndex].id}
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
              src={validPhotos[currentIndex].url}
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
