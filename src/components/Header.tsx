import React, { useState } from 'react';
import { Menu, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DiamondGemIcon } from './icons/CustomIcons';

export const Header: React.FC = () => {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    setIsSettingsOpen,
    coins,
    setExtendedView,
    triggerEasterEgg,
    triggerHeartExplosion,
    config,
  } = useApp();
  const [logoTapCount, setLogoTapCount] = useState(0);

  const handleLogoClick = () => {
    triggerHeartExplosion();
    const nextCount = logoTapCount + 1;
    setLogoTapCount(nextCount);
    if (nextCount >= 5) {
      triggerEasterEgg('egg-konami-love');
      setLogoTapCount(0);
    }
  };

  return (
    <header className="w-full flex items-center justify-between py-2 px-1 select-none gap-2">
      {/* Mobile Menu trigger & Left Title Info */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="md:hidden min-w-[44px] min-h-[44px] rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-pink-300 hover:text-white cursor-pointer shrink-0"
          title="Abrir Menu"
          aria-label="Abrir Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div onClick={handleLogoClick} className="cursor-pointer group min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="font-romantic text-3xl md:text-4xl text-pink-100 neon-title-glow tracking-wide truncate">
              Nosso Mundo
            </h1>
            <span className="text-pink-300 text-2xl font-light drop-shadow-[0_0_10px_rgba(244,114,182,0.8)] shrink-0">
              ♡
            </span>
          </div>
          <p className="text-xs md:text-sm text-purple-200/80 font-sans tracking-wider flex items-center gap-1.5 mt-0.5">
            <span>{config.myName || 'Gabriel'}</span>
            <span className="text-pink-400 text-xs">♡</span>
            <span>{config.partnerName || 'Samella'}</span>
          </p>
        </div>
      </div>

      {/* Right Side: Diamonds & Single Settings Gear */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={() => setExtendedView('loja')}
          title="Loja — Seus Diamantes"
          className="flex items-center gap-2 px-3 min-h-[44px] rounded-full bg-[#170a2c]/80 hover:bg-[#230f44] border border-purple-500/40 text-xs font-semibold text-pink-200 shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-all cursor-pointer group"
        >
          <DiamondGemIcon className="w-4 h-4 text-pink-300 group-hover:scale-110 transition-transform" />
          <span className="font-mono text-sm tabular-nums">{coins}</span>
          <span className="w-4 h-4 rounded-full bg-purple-800/80 flex items-center justify-center text-[10px] text-pink-300 ml-0.5">
            +
          </span>
        </button>

        <button
          onClick={() => setIsSettingsOpen(true)}
          title="Configurações"
          aria-label="Configurações"
          className="min-w-[44px] min-h-[44px] rounded-full bg-[#170a2c]/60 hover:bg-purple-900/60 border border-purple-500/30 flex items-center justify-center text-purple-300 hover:text-white transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
