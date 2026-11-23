import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Maximize2, Image as ImageIcon, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SmartPhoto } from './SmartPhoto';
import { useReducedMotion } from 'motion/react';

export const HomePhotoLoopCard: React.FC = () => {
  const { photos, setSelectedPhoto, setExtendedView } = useApp();
  const prefersReducedMotion = useReducedMotion();

  const loopPhotos = useMemo(() => {
    const flagged = photos.filter((p) => p.inHomeLoop !== false);
    if (flagged.length > 0) return flagged;
    return photos;
  }, [photos]);

  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const safeIndex = loopPhotos.length > 0 ? index % loopPhotos.length : 0;
  const activePhoto = loopPhotos[safeIndex];

  useEffect(() => {
    if (isPaused || prefersReducedMotion || loopPhotos.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % loopPhotos.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [isPaused, prefersReducedMotion, loopPhotos.length]);

  if (!activePhoto) {
    return (
      <section className="rounded-3xl p-5 bg-gradient-to-br from-[#180932]/90 via-[#100424]/95 to-[#080214] border border-purple-500/25 shadow-lg flex flex-col items-center justify-center text-center gap-3 min-h-[210px]">
        <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-400/35 flex items-center justify-center text-pink-300">
          <ImageIcon className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h3 className="text-sm sm:text-base font-bold text-white">Quadro de Fotos em Loop</h3>
          <p className="text-xs text-purple-200/70">
            Envie suas fotos reais ou um arquivo .zip na Galeria para elas aparecerem aqui e ao fundo do app ♡
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExtendedView('fotos')}
          className="inline-flex items-center gap-1.5 min-h-[40px] px-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-xs font-bold text-white shadow cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ir para Galeria</span>
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#180932]/90 via-[#100424]/95 to-[#080214] border border-purple-500/25 shadow-lg space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-pink-300" />
            <span>Nossas Fotos em Loop</span>
          </h3>
          <p className="text-[11px] text-purple-200/70 tabular-nums">
            {safeIndex + 1} de {loopPhotos.length} {loopPhotos.length === 1 ? 'foto salva' : 'fotos salvas'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            title={isPaused ? 'Retomar loop' : 'Pausar loop'}
            aria-label={isPaused ? 'Retomar loop' : 'Pausar loop'}
            className="min-w-[40px] min-h-[40px] rounded-xl bg-purple-900/50 border border-purple-400/30 text-purple-100 hover:text-white flex items-center justify-center cursor-pointer"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setExtendedView('fotos')}
            className="min-h-[40px] px-3 rounded-xl bg-pink-500/20 border border-pink-400/35 text-xs font-semibold text-pink-200 hover:text-white cursor-pointer"
          >
            Galeria
          </button>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 bg-black/50 aspect-[16/10] sm:aspect-[16/9]">
        <SmartPhoto
          key={activePhoto.id}
          photo={activePhoto}
          photoIndex={activePhoto.index}
          onClick={() => setSelectedPhoto(activePhoto)}
          className="w-full h-full rounded-none"
          hideDetails
        />

        {loopPhotos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIndex((prev) => (prev - 1 + loopPhotos.length) % loopPhotos.length)}
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] rounded-full bg-black/55 hover:bg-black/75 border border-white/15 text-white flex items-center justify-center cursor-pointer backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((prev) => (prev + 1) % loopPhotos.length)}
              aria-label="Próxima foto"
              className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] rounded-full bg-black/55 hover:bg-black/75 border border-white/15 text-white flex items-center justify-center cursor-pointer backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setSelectedPhoto(activePhoto)}
          aria-label="Ampliar foto"
          className="absolute top-2.5 right-2.5 min-w-[40px] min-h-[40px] rounded-xl bg-black/55 hover:bg-black/75 border border-white/15 text-white flex items-center justify-center cursor-pointer backdrop-blur-sm"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
