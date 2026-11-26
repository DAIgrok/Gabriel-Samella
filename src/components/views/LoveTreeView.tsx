import React from 'react';
import { useApp } from '../../context/AppContext';
import { FantasyTreeCanvas } from '../3d/FantasyTreeCanvas';

export const LoveTreeView: React.FC = () => {
  const { treeState, setExtendedView } = useApp();

  return (
    <main className="fixed inset-0 z-[70] overflow-hidden bg-[#070b12]">
      <div className="absolute inset-0">
        <FantasyTreeCanvas level={treeState.level || 1} />
      </div>
      <button
        type="button"
        onClick={() => setExtendedView('inicio')}
        aria-label="Voltar ao início"
        className="absolute left-4 top-4 z-[80] grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/45 text-white/90 shadow-lg backdrop-blur-xl transition hover:bg-black/65"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <div className="pointer-events-none absolute bottom-5 left-1/2 z-[80] -translate-x-1/2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-[11px] tracking-wide text-white/65 backdrop-blur-lg">
        Arraste para girar · Pinça para aproximar
      </div>
    </main>
  );
};
