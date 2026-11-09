import React from 'react';
import {
  Home,
  Mail,
  Image as ImageIcon,
  Music,
  User,
  Trees,
  Trophy,
  Gamepad2,
  Cat,
  ShoppingBag,
  MessageCircle,
  BookHeart,
  Settings,
  X,
  Heart,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveTab, ExtendedView } from '../types';

export const Navigation: React.FC = () => {
  const {
    activeTab,
    extendedView,
    setActiveTab,
    setExtendedView,
    isDrawerOpen,
    setIsDrawerOpen,
    coins,
    config,
    kitten,
    triggerHeartExplosion,
  } = useApp();

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'cartas', label: 'Cartas', icon: Mail },
    { id: 'fotos', label: 'Fotos', icon: ImageIcon },
    { id: 'musica', label: 'Música', icon: Music },
    { id: 'perfil', label: 'Perfil', icon: User },
  ];

  const drawerItems: { id: ExtendedView; label: string; icon: React.ElementType; color: string; badge?: string }[] = [
    { id: 'inicio', label: 'Página Inicial', icon: Home, color: 'text-pink-400' },
    { id: 'cartas', label: 'Cartas de Amor', icon: Mail, color: 'text-pink-400' },
    { id: 'fotos', label: 'Galeria de Fotos', icon: ImageIcon, color: 'text-purple-400' },
    { id: 'musica', label: 'Nosso Player de Música', icon: Music, color: 'text-indigo-400' },
    { id: 'arvore', label: 'Árvore do Amor', icon: Trees, color: 'text-teal-300' },
    { id: 'conquistas', label: 'Conquistas & Selos', icon: Trophy, color: 'text-amber-300' },
    { id: 'jogos', label: 'Jogos do Casal', icon: Gamepad2, color: 'text-indigo-400' },
    { id: 'gatinho', label: 'Nosso Gatinho (Mimi)', icon: Cat, color: 'text-pink-300', badge: kitten.mood === 'com-fome' ? 'Fome!' : undefined },
    { id: 'loja', label: 'Loja do Amor', icon: ShoppingBag, color: 'text-rose-400', badge: `${coins} 💎` },
    { id: 'conversas', label: 'Conversas & Recados', icon: MessageCircle, color: 'text-purple-300' },
    { id: 'frases', label: '50+ Frases Românticas', icon: BookHeart, color: 'text-pink-300' },
    { id: 'config', label: 'Configurações & Conteúdo', icon: Settings, color: 'text-slate-300' },
  ];

  return (
    <>
      {/* Bottom Floating Navigation Bar (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-auto select-none md:hidden">
        <div className="max-w-lg mx-auto px-4 pb-safe pb-2 pt-1">
          <div className="relative glass rounded-[28px] px-3 py-2 border border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
            {/* Top Floating Glow Heart indicator */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 pointer-events-none">
              <motion.div
                animate={{
                  y: [-2, 2, -2],
                  scale: [1, 1.08, 1],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-400 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.8)] border border-white/60"
              >
                <Heart className="w-3.5 h-3.5 text-white fill-white" />
              </motion.div>
            </div>

            {/* Nav icons row */}
            <div className="flex items-center justify-around relative z-10 pt-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id && ['inicio', 'cartas', 'fotos', 'musica', 'perfil'].includes(extendedView);

                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-300 relative cursor-pointer ${
                      isActive
                        ? 'text-purple-300 scale-105'
                        : 'text-white/40 hover:text-white active:scale-95'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavBubble"
                        className="absolute inset-0 bg-white/10 rounded-2xl border border-white/10 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}

                    <Icon
                      className={`w-5 h-5 mb-0.5 relative z-10 ${
                        isActive ? 'neon-glow-purple fill-purple-400/20 stroke-[2.2]' : 'stroke-[1.8]'
                      }`}
                    />

                    <span
                      className={`text-[10px] font-medium tracking-tight relative z-10 ${
                        isActive ? 'text-white font-semibold' : 'text-white/50'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Side Drawer Menu Modal */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Drawer Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-[#050208] border-r border-white/10 shadow-2xl flex flex-col p-5 z-10 overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-400 shadow-[0_0_15px_rgba(244,114,182,0.5)]">
                    <img
                      src="/assets/img/real/photo_1.jpg"
                      alt="Gabriel e Samella"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <h2 className="font-romantic text-2xl text-pink-200 neon-title-glow tracking-wide flex items-center gap-1">
                      Nosso Mundo <span className="text-pink-400 font-sans text-base">♡</span>
                    </h2>
                    <p className="text-xs text-purple-300/70 font-medium">
                      {config.partnerName} & {config.myName}
                    </p>
                  </div>
                </div>

                <button
                  id="btn-close-drawer"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-purple-200 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Balance Box */}
              <div className="my-4 p-3.5 rounded-2xl glass border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">💎</span>
                  <div>
                    <span className="text-[10px] text-white/40 block uppercase tracking-wider">
                      Saldo de Amor
                    </span>
                    <span className="text-sm font-semibold text-white">{coins} Diamantes</span>
                  </div>
                </div>

                <button
                  onClick={() => setExtendedView('loja')}
                  className="px-3 py-1 rounded-xl glass hover:bg-white/10 border border-white/10 text-xs font-semibold text-purple-300 cursor-pointer"
                >
                  Loja
                </button>
              </div>

              {/* Navigation List */}
              <div className="space-y-1.5 flex-1 py-1">
                {drawerItems.map((item) => {
                  const Icon = item.icon;
                  const isSelected = extendedView === item.id;

                  return (
                    <button
                      key={item.id}
                      id={`drawer-item-${item.id}`}
                      onClick={() => setExtendedView(item.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                        isSelected
                          ? 'glass border border-purple-500/40 text-white shadow-md'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${item.color}`} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span className="text-[10px] bg-purple-500/20 text-purple-200 px-2 py-0.5 rounded-full border border-purple-400/30">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-white/30" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Drawer Footer with romantic quote */}
              <div className="pt-4 border-t border-white/10 text-center">
                <p className="text-xs text-white/40 italic font-serif leading-relaxed">
                  "O amor não se mede em dias, mas na intensidade de cada segundo ao seu lado."
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
