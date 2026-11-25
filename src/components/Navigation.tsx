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
  ChevronRight,
  Target,
  CalendarDays,
  Bell,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveTab, ExtendedView } from '../types';
import { PET_SPECIES_CATALOG } from '../data/initialData';
import { getCouplePhotoUrl, REAL_PHOTO_SLOTS } from '../data/mediaAssets';
import { SmartPhoto } from './SmartPhoto';
import {
  AquariumCoralIcon,
  DiamondGemIcon,
  DreamHouseCrestIcon,
  MissionCompassIcon,
} from './icons/CustomIcons';

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
    photos,
    unreadChatCount,
    isSpectator,
    setIsPermissionsModalOpen,
    lockApp,
  } = useApp();

  const currentSpecies = PET_SPECIES_CATALOG.find((s) => s.type === (kitten.petType || 'cat')) || PET_SPECIES_CATALOG[0];
  const petDisplayName = kitten.name?.trim() || currentSpecies.name;

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'cartas', label: 'Cartas', icon: Mail },
    { id: 'fotos', label: 'Fotos', icon: ImageIcon },
    { id: 'conversas', label: 'Chat', icon: MessageCircle, badge: unreadChatCount },
    { id: 'musica', label: 'Música', icon: Music },
    { id: 'perfil', label: 'Perfil', icon: User },
  ];

  const allDrawerItems: { id: ExtendedView; label: string; icon: React.ElementType; color: string; badge?: string }[] = [
    { id: 'inicio', label: 'Página Inicial', icon: Home, color: 'text-pink-400' },
    { id: 'conversas', label: 'Chat do Casal', icon: MessageCircle, color: 'text-pink-300', badge: unreadChatCount > 0 ? String(unreadChatCount) : undefined },
    { id: 'casa', label: 'Casa dos Sonhos 3D', icon: DreamHouseCrestIcon, color: 'text-pink-300', badge: '3D' },
    { id: 'aquario', label: 'Aquário Mágico 3D', icon: AquariumCoralIcon, color: 'text-cyan-300', badge: '3D' },
    { id: 'missoes', label: 'Missões & Sazonal', icon: MissionCompassIcon, color: 'text-amber-300' },
    { id: 'cartas', label: 'Cartas de Amor', icon: Mail, color: 'text-pink-400' },
    { id: 'fotos', label: 'Galeria de Fotos', icon: ImageIcon, color: 'text-purple-400' },
    { id: 'musica', label: 'Nosso Player de Música', icon: Music, color: 'text-indigo-400' },
    { id: 'arvore', label: 'Árvore do Amor', icon: Trees, color: 'text-teal-300' },
    { id: 'conquistas', label: 'Conquistas & Selos', icon: Trophy, color: 'text-amber-300' },
    { id: 'metas', label: 'Sonhos & Lista de Desejos', icon: Target, color: 'text-pink-300' },
    { id: 'calendario', label: 'Calendário do Casal', icon: CalendarDays, color: 'text-pink-300' },
    { id: 'jogos', label: '25 Jogos do Casal', icon: Gamepad2, color: 'text-indigo-400' },
    { id: 'gatinho', label: `Mascote (${petDisplayName})`, icon: Cat, color: 'text-pink-300', badge: kitten.hunger < 35 ? 'Fome!' : undefined },
    { id: 'loja', label: 'Loja do Amor', icon: ShoppingBag, color: 'text-rose-400', badge: `${coins}` },
    { id: 'frases', label: '50+ Frases Românticas', icon: BookHeart, color: 'text-pink-300' },
    { id: 'config', label: 'Configurações (Criador)', icon: Settings, color: 'text-slate-300' },
  ];

  const drawerSections = [
    {
      title: 'NOSSO ESPAÇO',
      subtitle: 'Os lugares que fazem parte da nossa história',
      items: allDrawerItems.filter((item) => ['inicio', 'casa', 'aquario', 'arvore', 'gatinho'].includes(item.id)),
    },
    {
      title: 'CONEXÃO & MEMÓRIAS',
      subtitle: 'Momentos, conversas e lembranças',
      items: allDrawerItems.filter((item) => ['conversas', 'cartas', 'fotos', 'musica', 'frases'].includes(item.id)),
    },
    {
      title: 'EXPERIÊNCIAS DO CASAL',
      subtitle: 'Jogos, sonhos e conquistas compartilhadas',
      items: allDrawerItems.filter((item) => ['missoes', 'jogos', 'conquistas', 'metas', 'calendario'].includes(item.id)),
    },
    {
      title: 'PERSONALIZAÇÃO',
      subtitle: 'Cuide e personalize nosso mundo',
      items: allDrawerItems.filter((item) => ['loja', 'config'].includes(item.id)),
    },
  ];

  return (
    <>
      {/* Bottom Floating Navigation Bar (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-auto select-none md:hidden">
        <div className="max-w-lg mx-auto px-3 pb-safe pb-2 pt-1">
          <div className="relative glass rounded-[28px] px-2 py-2 border border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
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
                const isActive =
                  activeTab === item.id &&
                  ['inicio', 'cartas', 'fotos', 'conversas', 'musica', 'perfil'].includes(extendedView);

                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-300 relative cursor-pointer ${
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

                    <div className="relative">
                      <Icon
                        className={`w-5 h-5 mb-0.5 relative z-10 ${
                          isActive ? 'neon-glow-purple fill-purple-400/20 stroke-[2.2]' : 'stroke-[1.8]'
                        }`}
                      />
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-pink-500 text-white text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(236,72,153,0.9)]">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </div>

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
                  <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-400 shadow-[0_0_15px_rgba(244,114,182,0.5)] overflow-hidden">
                    <SmartPhoto
                      photo={photos[3]}
                      photoIndex={4}
                      src={getCouplePhotoUrl(photos, 3, REAL_PHOTO_SLOTS.drawerAvatar)}
                      alt="Gabriel e Samella"
                      className="w-full h-full rounded-full"
                      hideDetails
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
                  <DiamondGemIcon className="w-5 h-5 text-pink-300" />
                  <div>
                    <span className="text-[10px] text-white/40 block uppercase tracking-wider">
                      Saldo de Amor
                    </span>
                    <span className="text-sm font-semibold text-white tabular-nums">{coins} Diamantes</span>
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
                {drawerSections.map((section) => (
                  <section key={section.title} className="pt-3 first:pt-1">
                    <div className="px-2 pb-2">
                      <h3 className="text-[10px] font-extrabold tracking-[0.2em] text-pink-200/80">
                        {section.title}
                      </h3>
                      <p className="mt-0.5 text-[10px] leading-relaxed text-violet-200/45">
                        {section.subtitle}
                      </p>
                    </div>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isSelected = extendedView === item.id;

                        return (
                          <button
                            key={item.id}
                            id={`drawer-item-${item.id}`}
                            onClick={() => {
                              setExtendedView(item.id);
                              setIsDrawerOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-3 rounded-2xl transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-r from-fuchsia-500/15 to-violet-500/15 border border-pink-300/30 text-white shadow-[0_8px_24px_rgba(168,85,247,0.12)]'
                                : 'border border-transparent text-white/70 hover:bg-white/[0.045] hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center bg-white/[0.045] border border-white/[0.06] ${item.color}`}>
                                <Icon className="w-[18px] h-[18px]" />
                              </span>
                              <span className="text-[13px] font-semibold tracking-[0.01em] text-left leading-tight">
                                {item.label}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 pl-2">
                              {item.badge && (
                                <span className="text-[9px] font-bold bg-purple-500/15 text-purple-100/80 px-2 py-1 rounded-full border border-purple-300/15">
                                  {item.badge}
                                </span>
                              )}
                              <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-pink-200' : 'text-white/25'}`} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ))}
                <div className="pt-2 space-y-1.5 border-t border-white/10 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      setIsPermissionsModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl text-pink-200 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-pink-300" />
                      <span className="text-sm font-medium">Permissões do Aparelho</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/30" />
                  </button>

                  <button
                    type="button"
                    onClick={lockApp}
                    className="w-full flex items-center justify-between p-3 rounded-2xl text-purple-200/80 hover:bg-rose-500/10 hover:text-rose-200 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-purple-300" />
                      <span className="text-sm font-medium">
                        {isSpectator ? 'Trocar Conta / Bloquear' : 'Bloquear / Trocar Conta'}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/30" />
                  </button>
                </div>
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
