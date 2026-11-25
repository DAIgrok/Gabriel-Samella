import React from 'react';
import { motion } from 'motion/react';
import { DreamHouseCrestIcon } from '../icons/CustomIcons';

const MODELS = [
  {
    id: 'forest-home',
    title: 'Nossa casa',
    subtitle: 'Forest-sided · A peaceful place to live',
    modelId: '01bde51946244b9db917bf9370ef605b',
    source: 'https://sketchfab.com/3d-models/forest-sided-a-peaceful-place-to-live-diorama-01bde51946244b9db917bf9370ef605b',
  },
  {
    id: 'love-tree',
    title: 'Nossa árvore',
    subtitle: 'Stylized Tree Diorama',
    modelId: 'bf809101703b402ca12e5c3591febeb4',
    source: 'https://sketchfab.com/3d-models/stylized-tree-diorama-bf809101703b402ca12e5c3591febeb4',
  },
];

export const DreamHouseView: React.FC = () => {
  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mx-auto w-full max-w-5xl space-y-5 px-1 pb-28 sm:pb-24"
    >
      <header className="glass-card-glow flex items-center gap-3 rounded-3xl border border-pink-400/25 p-4 sm:p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-pink-400/35 bg-gradient-to-br from-pink-500/25 to-purple-600/35">
          <DreamHouseCrestIcon className="h-6 w-6 text-pink-300" />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-white sm:text-xl">Casa dos Sonhos</h2>
          <p className="text-xs text-purple-200/75">Um cantinho nosso em 3D</p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-5">
        {MODELS.map((model) => (
          <article
            key={model.id}
            className="overflow-hidden rounded-3xl border border-purple-400/25 bg-[#100820]/75 shadow-xl shadow-purple-950/25"
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white sm:text-base">{model.title}</h3>
                <p className="truncate text-[11px] text-purple-200/65 sm:text-xs">{model.subtitle}</p>
              </div>
              <a
                href={model.source}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-full border border-pink-300/25 bg-pink-500/10 px-3 py-2 text-[10px] font-semibold text-pink-100 transition hover:bg-pink-500/20"
              >
                Sketchfab ↗
              </a>
            </div>
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#090511] sm:aspect-[16/9]">
              <iframe
                title={model.title}
                src={`https://sketchfab.com/models/${model.modelId}/embed?autostart=1&ui_theme=dark&ui_infos=0&ui_watermark=0&ui_watermark_link=0&ui_hint=2&preload=1`}
                className="absolute inset-0 h-full w-full border-0"
                allow="autoplay; fullscreen; xr-spatial-tracking"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </article>
        ))}
      </section>
    </motion.main>
  );
};
