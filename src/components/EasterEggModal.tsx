import React from 'react';
import { Sparkles, Heart, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';

export const EasterEggModal: React.FC = () => {
  const { activeEasterEgg, closeEasterEgg } = useApp();

  if (!activeEasterEgg) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeEasterEgg}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.8, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 30, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="relative z-10 w-full max-w-sm bg-gradient-to-b from-[#1c0836] to-[#0d031c] border border-pink-400/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(244,114,182,0.4)] text-center space-y-4"
      >
        <div className="w-16 h-16 rounded-full mx-auto bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-lg border-2 border-white/60">
          <Heart className="w-8 h-8 text-white fill-white animate-pulse" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold text-pink-300 uppercase tracking-widest block">
            Segredo Especial Descoberto! ✨
          </span>
          <h3 className="text-xl font-bold text-white font-display">
            {activeEasterEgg.title}
          </h3>
        </div>

        <p className="text-xs text-purple-200/90 leading-relaxed font-light">
          {activeEasterEgg.description}
        </p>

        <div className="p-3 rounded-2xl bg-purple-950/70 border border-pink-400/30 text-xs font-semibold text-pink-300 flex items-center justify-center gap-1.5">
          <span>💎</span>
          <span>+{activeEasterEgg.rewardCoins} Diamantes adicionados ao seu saldo!</span>
        </div>

        <button
          onClick={closeEasterEgg}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs shadow-md active:scale-95 transition-transform"
        >
          Guardar com Carinho ♡
        </button>
      </motion.div>
    </div>
  );
};
