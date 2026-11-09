import React from 'react';
import {
  Menu,
  Home,
  Cat,
  Trees,
  ShoppingBag,
  Mail,
  Gamepad2,
  Trophy,
  MessageCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ExtendedView } from '../types';

export const Sidebar: React.FC = () => {
  const { extendedView, setExtendedView, isDrawerOpen, setIsDrawerOpen } = useApp();

  const navItems: { id: ExtendedView; label: string; icon: React.ElementType }[] = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'gatinho', label: 'Meu Pet', icon: Cat },
    { id: 'arvore', label: 'Nossa Árvore', icon: Trees },
    { id: 'loja', label: 'Loja', icon: ShoppingBag },
    { id: 'cartas', label: 'Cartas', icon: Mail },
    { id: 'jogos', label: 'Jogos', icon: Gamepad2 },
    { id: 'conquistas', label: 'Conquistas', icon: Trophy },
    { id: 'conversas', label: 'Conversas', icon: MessageCircle },
  ];

  return (
    <aside
      className="hidden md:flex flex-col items-center justify-between w-24 flex-shrink-0 min-h-screen py-5 border-r border-purple-500/20 bg-[#090314]/90 backdrop-blur-2xl z-30 select-none sticky top-0"
      style={{ maxHeight: '100vh' }}
    >
      {/* Top: Hamburger Menu */}
      <div className="w-full flex justify-center pb-3">
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-pink-300 hover:text-white hover:bg-purple-900/40 border border-purple-500/20 transition-all cursor-pointer"
          title="Abrir Menu Completo"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Center: Nav Items List */}
      <nav className="flex flex-col items-center gap-2.5 w-full px-2 my-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            extendedView === item.id ||
            (item.id === 'inicio' && ['inicio', 'fotos', 'musica', 'perfil'].includes(extendedView) && extendedView === 'inicio');

          return (
            <button
              key={item.id}
              onClick={() => setExtendedView(item.id)}
              className={`w-full py-2 px-1 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-[#6b21a8] to-[#9333ea] border border-pink-400/40 shadow-[0_0_15px_rgba(236,72,153,0.35)] text-white'
                  : 'text-purple-300/60 hover:text-white hover:bg-purple-900/30'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive
                    ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                    : 'text-purple-300/70'
                }`}
              />
              <span className="text-[10px] font-medium leading-tight text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom: Romantic Vertical Handwritten Script matching photo */}
      <div className="pt-4 flex flex-col items-center text-center">
        <div className="font-romantic text-base text-pink-300/80 leading-tight space-y-0.5 select-none drop-shadow-[0_0_8px_rgba(244,114,182,0.4)]">
          <div>Você</div>
          <div>é o meu</div>
          <div>lugar</div>
          <div>favorito</div>
          <div className="text-pink-400 text-sm">♡</div>
        </div>
      </div>
    </aside>
  );
};
