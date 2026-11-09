import React, { useState } from 'react';
import { Menu, Settings, Gem, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';

export const Header: React.FC = () => {
  const { isDrawerOpen, setIsDrawerOpen, coins, setExtendedView, triggerEasterEgg, triggerHeartExplosion, config } = useApp();
  const [logoTapCount, setLogoTapCount] = useState(0);

  const handleLogoClick = () => {
    triggerHeartExplosion();
    const nextCount = logoTapCount + 1;
    setLogoTapCount(nextCount);
    if (nextCount >= 5) {
      triggerEasterEgg('egg-logo-taps');
      setLogoTapCount(0);
    }
  };

  return (
    <header className="w-full flex items-center justify-between py-2 px-1 select-none">
      {/* Mobile Menu trigger & Left Title Info matching screenshot */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="md:hidden w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-pink-300 hover:text-white"
          title="Abrir Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div onClick={handleLogoClick} className="cursor-pointer group">
          <div className="flex items-center gap-1.5">
            <h1 className="font-romantic text-3xl md:text-4xl text-pink-100 neon-title-glow tracking-wide">
              Nosso Mundo
            </h1>
            <span className="text-pink-300 text-2xl font-light drop-shadow-[0_0_10px_rgba(244,114,182,0.8)]">
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

      {/* Right Side: Diamonds & Settings Gear matching screenshot */}
      <div className="flex items-center gap-3">
        {/* Diamond Counter Badge */}
        <button
          onClick={() => setExtendedView('loja')}
          title="Loja — Seus Diamantes"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#170a2c]/80 hover:bg-[#230f44] border border-purple-500/40 text-xs font-semibold text-pink-200 shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-all cursor-pointer group"
        >
          <Gem className="w-3.5 h-3.5 text-pink-400 fill-pink-400/40 group-hover:scale-110 transition-transform" />
          <span className="font-mono text-sm">{coins}</span>
          <span className="w-4 h-4 rounded-full bg-purple-800/80 flex items-center justify-center text-[10px] text-pink-300 ml-0.5">
            +
          </span>
        </button>

        {/* Settings Gear Button */}
        <button
          onClick={() => setExtendedView('config')}
          title="Configurações & Perfil"
          className="w-9 h-9 rounded-full bg-[#170a2c]/60 hover:bg-purple-900/60 border border-purple-500/30 flex items-center justify-center text-purple-300 hover:text-white transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
