import React from 'react';
import { Camera, ChevronRight, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';

export const MemoriesHomeCard: React.FC = () => {
  const { setExtendedView, setSelectedPhoto, photos } = useApp();

  const previewPhotos = [
    {
      id: 'photo-1',
      url: '/assets/img/real/photo_1.jpg',
      title: 'Nosso Momento',
      date: '12 de Junho de 2023',
    },
    {
      id: 'photo-2',
      url: '/assets/img/real/photo_2.jpg',
      title: 'Pôr do Sol Mágico',
      date: 'Nosso Amor',
    },
    {
      id: 'photo-3',
      url: '/assets/img/real/photo_3.jpg',
      title: 'Sempre Juntos',
      date: 'Carinho Puro',
    },
    {
      id: 'photo-4',
      url: '/assets/img/real/photo_4.jpg',
      title: 'Noite Romântica',
      date: 'Eternidade',
    },
  ];

  const handleOpenPhoto = (item: typeof previewPhotos[0], index: number) => {
    const memory = photos[index] || {
      id: item.id,
      index: index + 1,
      title: item.title,
      subtitle: item.date,
      date: item.date,
      url: item.url,
      localPath: item.url,
      aspect: 'portrait',
      isFavorite: true,
      caption: item.title,
    };
    setSelectedPhoto(memory);
  };

  return (
    <div className="rounded-3xl p-5 bg-gradient-to-br from-[#160a2c]/90 via-[#0e051c]/90 to-[#070210]/95 border border-purple-500/25 shadow-[0_10px_35px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-xl flex flex-col justify-between min-h-[220px]">
      {/* Header: Camera + "Memórias" ... "Ver todas →" matching screenshot */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-pink-300" />
          <h3 className="text-sm font-semibold text-white tracking-wide">
            Memórias
          </h3>
        </div>

        <button
          onClick={() => setExtendedView('fotos')}
          className="text-xs text-purple-300 hover:text-pink-300 flex items-center gap-1 transition-colors cursor-pointer group"
        >
          <span>Ver todas</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 4 Photo Cards Grid matching screenshot */}
      <div className="grid grid-cols-4 gap-2.5 my-auto">
        {previewPhotos.map((item, idx) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleOpenPhoto(item, idx)}
            className="aspect-[3/4] rounded-2xl overflow-hidden relative cursor-pointer group border border-purple-500/30 shadow-md bg-purple-950/40"
          >
            <img
              src={item.url}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `/assets/img/${idx + 1}.jpg`;
              }}
            />

            {/* Bottom-right glowing heart badge matching screenshot */}
            <div className="absolute bottom-1.5 right-1.5 p-1 rounded-full bg-black/40 backdrop-blur-sm pointer-events-none">
              <Heart className="w-3 h-3 text-pink-400 stroke-[2.2] drop-shadow-[0_0_6px_rgba(244,114,182,0.8)]" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
