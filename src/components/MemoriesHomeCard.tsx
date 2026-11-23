import React from 'react';
import { Camera, ChevronRight, Heart, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { SmartPhoto } from './SmartPhoto';

export const MemoriesHomeCard: React.FC = () => {
  const { setExtendedView, setSelectedPhoto, photos } = useApp();

  const previewPhotos = photos.slice(0, 4);

  return (
    <div className="rounded-3xl p-5 bg-gradient-to-br from-[#160a2c]/90 via-[#0e051c]/90 to-[#070210]/95 border border-purple-500/25 shadow-[0_10px_35px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-xl flex flex-col justify-between min-h-[220px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-pink-300" />
          <h3 className="text-sm font-semibold text-white tracking-wide">
            Galeria do Casal
          </h3>
        </div>

        <button
          onClick={() => setExtendedView('fotos')}
          className="min-h-[36px] px-2 text-xs text-purple-300 hover:text-pink-300 flex items-center gap-1 transition-colors cursor-pointer group"
        >
          <span>Ver todas</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {previewPhotos.length > 0 ? (
        <div className="grid grid-cols-4 gap-2.5 my-auto">
          {previewPhotos.map((item, idx) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelectedPhoto(item)}
              className="aspect-[3/4] rounded-2xl overflow-hidden relative cursor-pointer group border border-purple-500/30 shadow-md bg-purple-950/40"
            >
              <SmartPhoto
                photo={item}
                photoIndex={idx + 1}
                src={item.url}
                alt="Foto do casal"
                hideDetails
                className="w-full h-full rounded-none"
              />

              <div className="absolute bottom-1.5 right-1.5 p-1 rounded-full bg-black/40 backdrop-blur-sm pointer-events-none z-10">
                <Heart className="w-3 h-3 text-pink-400 stroke-[2.2] drop-shadow-[0_0_6px_rgba(244,114,182,0.8)]" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="my-auto py-4 text-center space-y-2">
          <p className="text-xs text-purple-200/75">
            Nenhuma foto adicionada ainda. Envie fotos reais ou um pacote .zip na galeria ♡
          </p>
          <button
            type="button"
            onClick={() => setExtendedView('fotos')}
            className="inline-flex items-center gap-1.5 px-3.5 min-h-[38px] rounded-xl bg-pink-500/20 border border-pink-400/35 text-xs font-bold text-pink-200 hover:text-white cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Foto</span>
          </button>
        </div>
      )}
    </div>
  );
};
