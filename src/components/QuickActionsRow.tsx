import React from 'react';
import { Heart, Image as ImageIcon, Trees, Trophy, Gamepad2, Cat } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { ExtendedView } from '../types';

interface ActionItem {
  id: ExtendedView;
  label: string;
  icon: React.ElementType;
  glowClass: string;
  borderHover: string;
  iconColor: string;
  badge?: string;
}

export const QuickActionsRow: React.FC = () => {
  const { setExtendedView, kitten } = useApp();

  const actions: ActionItem[] = [
    {
      id: 'cartas',
      label: 'Cartas',
      icon: Heart,
      glowClass: 'neon-glow-pink',
      borderHover: 'hover:border-pink-400/50',
      iconColor: 'text-pink-400',
    },
    {
      id: 'fotos',
      label: 'Fotos',
      icon: ImageIcon,
      glowClass: 'neon-glow-purple',
      borderHover: 'hover:border-purple-400/50',
      iconColor: 'text-purple-400',
    },
    {
      id: 'arvore',
      label: 'Árvore',
      icon: Trees,
      glowClass: 'neon-glow-cyan',
      borderHover: 'hover:border-teal-400/50',
      iconColor: 'text-cyan-300',
    },
    {
      id: 'conquistas',
      label: 'Conquistas',
      icon: Trophy,
      glowClass: 'neon-glow-gold',
      borderHover: 'hover:border-amber-400/50',
      iconColor: 'text-amber-300',
    },
    {
      id: 'jogos',
      label: 'Jogos',
      icon: Gamepad2,
      glowClass: 'neon-glow-purple',
      borderHover: 'hover:border-purple-400/50',
      iconColor: 'text-purple-300',
    },
    {
      id: 'gatinho',
      label: 'Nosso Gatinho',
      icon: Cat,
      glowClass: 'neon-glow-pink',
      borderHover: 'hover:border-pink-400/50',
      iconColor: 'text-pink-300',
      badge: kitten.mood === 'com-fome' ? '🐟' : undefined,
    },
  ];

  return (
    <div className="w-full">
      {/* 6-Card Grid matching the reference screenshot */}
      <div className="grid grid-cols-6 gap-1.5 sm:gap-2.5">
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              id={`quick-action-${item.id}`}
              onClick={() => setExtendedView(item.id)}
              whileHover={{ y: -3, scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              className="h-[84px] sm:h-[90px] rounded-[22px] glass-panel flex flex-col items-center justify-center p-1.5 sm:p-2 border border-purple-400/20 shadow-md hover:border-purple-300/40 hover:bg-purple-950/40 transition-all relative group cursor-pointer"
            >
              {/* Badge if any */}
              {item.badge && (
                <span className="absolute -top-1 -right-1 text-xs animate-bounce">
                  {item.badge}
                </span>
              )}

              {/* Icon Container with glowing effect */}
              <div className="mb-1 flex items-center justify-center">
                <Icon
                  className={`w-6 h-6 sm:w-7 sm:h-7 ${item.iconColor} ${item.glowClass} transition-transform group-hover:scale-110`}
                  strokeWidth={1.8}
                />
              </div>

              {/* Label */}
              <span className="text-[10px] sm:text-[11px] font-medium text-purple-100 truncate w-full text-center tracking-tight leading-tight">
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
