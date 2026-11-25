import React from 'react';
import { motion } from 'motion/react';
import { DreamHouseCrestIcon } from '../icons/CustomIcons';

const MODELS = [
  {
    id: 'forest-home',
    eyebrow: 'NOSSO REFÚGIO',
    title: 'Nossa casa',
    subtitle: 'Forest-sided · A peaceful place to live',
    description: 'Um pequeno refúgio cercado pela natureza, com detalhes para explorar em cada ângulo.',
    modelId: '01bde51946244b9db917bf9370ef605b',
    source: 'https://sketchfab.com/3d-models/forest-sided-a-peaceful-place-to-live-diorama-01bde51946244b9db917bf9370ef605b',
    creator: 'Cleuza Costa',
    license: 'Creative Commons Attribution (CC BY)',
  },
  {
    id: 'love-tree',
    eyebrow: 'NOSSO SÍMBOLO',
    title: 'Nossa árvore',
    subtitle: 'Stylized Tree Diorama',
    description: 'Uma árvore em 3D para completar esse cantinho que representa o nosso mundo.',
    modelId: 'bf809101703b402ca12e5c3591febeb4',
    source: 'https://sketchfab.com/3d-models/stylized-tree-diorama-bf809101703b402ca12e5c3591febeb4',
    creator: null,
    license: null,
  },
];

export const DreamHouseView: React.FC = () => {
  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="relative mx-auto w-full max-w-6xl space-y-6 overflow-hidden px-1 pb-28 sm:space-y-8 sm:pb-24"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-12 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-72 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl" />

      <header className="glass-card-glow relative overflow-hidden rounded-[2rem] border border-fuchsia-300/20 bg-gradient-to-br from-[#211039]/95 via-[#160d2b]/95 to-[#0c1024]/95 p-5 shadow-2xl shadow-purple-950/30 sm:p-7">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full border border-fuchsia-200/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-2 -top-8 h-32 w-32 rounded-full border border-violet-200/10" />
        <div className="relative flex items-start gap-3 sm:items-center sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-pink-300/30 bg-gradient-to-br from-pink-400/20 to-violet-500/25 shadow-lg shadow-pink-950/20 sm:h-14 sm:w-14">
            <DreamHouseCrestIcon className="h-6 w-6 text-pink-200 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.28em] text-pink-200/75 sm:text-[10px]">Nosso pequeno universo</p>
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Casa dos Sonhos</h2>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-violet-100/70 sm:text-sm">
              Dois cenários em 3D escolhidos para fazer parte do nosso cantinho.
            </p>
          </div>
        </div>
        <div className="relative mt-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/15 px-3 py-2.5 text-[11px] text-violet-100/70 sm:mt-6 sm:text-xs">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.7)]" />
          Arraste para girar e use os controles do visualizador para aproximar e explorar em 360°.
        </div>
      </header>

      <section className="relative grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6" aria-label="Modelos 3D do nosso mundo">
        {MODELS.map((model, index) => (
          <motion.article
            key={model.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
            className="group min-w-0 overflow-hidden rounded-[1.7rem] border border-violet-300/20 bg-gradient-to-b from-[#1a1030]/95 to-[#0d091a]/95 shadow-xl shadow-purple-950/30 transition duration-300 hover:border-pink-300/35 hover:shadow-2xl hover:shadow-purple-950/40"
          >
            <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
              <div className="min-w-0">
                <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.24em] text-pink-200/65">{model.eyebrow}</p>
                <h3 className="text-base font-bold text-white sm:text-lg">{model.title}</h3>
                <p className="mt-0.5 text-[10px] text-violet-200/60 sm:text-xs">{model.subtitle}</p>
              </div>
              <a
                href={model.source}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-full border border-pink-200/25 bg-pink-400/10 px-3 py-2 text-[10px] font-semibold text-pink-100 transition hover:border-pink-200/50 hover:bg-pink-400/20 focus:outline-none focus:ring-2 focus:ring-pink-300/60"
                aria-label={`Abrir ${model.title} no Sketchfab`}
              >
                Ver modelo ↗
              </a>
            </div>

            <div className="relative mx-3 overflow-hidden rounded-2xl border border-white/10 bg-[#080611] shadow-inner shadow-black/40 sm:mx-4">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(111,70,160,0.13),transparent_68%)]" />
              <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
                <iframe
                  title={`${model.title} — visualização 3D`}
                  src={`https://sketchfab.com/models/${model.modelId}/embed?autostart=1&ui_theme=dark&ui_infos=1&ui_hint=1&preload=1`}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="autoplay; fullscreen; xr-spatial-tracking"
                  allowFullScreen
                  loading={index === 0 ? 'eager' : 'lazy'}
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            </div>

            <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
              <p className="text-[11px] leading-relaxed text-violet-100/65 sm:text-xs">{model.description}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-3">
                <span className="text-[9px] text-violet-200/45">Visualização 3D interativa · Sketchfab</span>
                {model.creator && (
                  <a
                    href={model.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] text-violet-200/65 underline decoration-violet-300/30 underline-offset-2 hover:text-pink-100"
                  >
                    {model.creator} · {model.license}
                  </a>
                )}
                {!model.creator && (
                  <a
                    href={model.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] text-violet-200/65 underline decoration-violet-300/30 underline-offset-2 hover:text-pink-100"
                  >
                    Créditos e licença
                  </a>
                )}
              </div>
            </div>
          </motion.article>
        ))}
      </section>
    </motion.main>
  );
};
