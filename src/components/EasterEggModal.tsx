import React from 'react';
import { createPortal } from 'react-dom';
import { Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';

export const EasterEggModal: React.FC = () => {
  const { recentEasterEgg, closeEasterEggModal } = useApp();

  if (!recentEasterEgg) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeEasterEggModal}
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
            {recentEasterEgg.justDiscovered === false
              ? 'Segredo Já Descoberto ♡'
              : 'Segredo Especial Descoberto! ✨'}
          </span>
          <h3 className="text-xl font-bold text-white font-display">
            {recentEasterEgg.title}
          </h3>
        </div>

        <p className="text-xs text-purple-200/90 leading-relaxed font-light">
          {recentEasterEgg.description}
        </p>

        <div
          className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
            recentEasterEgg.justDiscovered === false
              ? 'bg-purple-950/50 border-purple-500/30 text-purple-200/80'
              : 'bg-purple-950/70 border-pink-400/30 text-pink-300'
          }`}
        >
          <span>💎</span>
          <span>
            {recentEasterEgg.justDiscovered === false
              ? `Recompensa única (+${recentEasterEgg.rewardCoins} 💎) já resgatada anteriormente.`
              : `+${recentEasterEgg.rewardCoins} Diamantes adicionados ao seu saldo!`}
          </span>
        </div>

        <button
          onClick={closeEasterEggModal}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs shadow-md active:scale-95 transition-transform cursor-pointer"
        >
          Guardar com Carinho ♡
        </button>
      </motion.div>
    </div>,
    document.body
  );
};
