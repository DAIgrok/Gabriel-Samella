import React from 'react';
import { Heart, Sparkles, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

export const DailyMessageCard: React.FC = () => {
  const { dailyMessages, currentDailyIndex, nextDailyMessage } = useApp();
  const currentMsg = dailyMessages[currentDailyIndex] || {
    id: '1',
    text: 'Você é a prova de que Deus ainda escreve histórias lindas para quem tem fé.',
    author: 'Para você',
  };

  return (
    <div className="rounded-3xl p-5 bg-gradient-to-br from-[#160a2c]/90 via-[#0e051c]/90 to-[#070210]/95 border border-purple-500/25 shadow-[0_10px_35px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-xl flex flex-col justify-between min-h-[220px]">
      {/* Background floral / cosmic aesthetic glow */}
      <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header: Heart + "Mensagem do dia" + Sparkles matching screenshot */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-pink-400 stroke-[2.2]" />
          <h3 className="text-sm font-semibold text-white tracking-wide">
            Mensagem do dia
          </h3>
        </div>
        <Sparkles className="w-4 h-4 text-purple-300" />
      </div>

      {/* Quote in Center */}
      <div className="my-auto py-3 text-center px-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentDailyIndex}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="text-xs sm:text-sm text-purple-100 font-normal leading-relaxed italic"
          >
            “{currentMsg.text || 'Você é a prova de que Deus ainda escreve histórias lindas para quem tem fé.'}”
          </motion.p>
        </AnimatePresence>
      </div>

      {/* "Outra mensagem" pill button matching screenshot */}
      <div className="flex justify-center pt-2">
        <button
          onClick={nextDailyMessage}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1b0c36]/90 hover:bg-[#2b1354] border border-purple-500/35 text-xs text-purple-200 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <span>Outra mensagem</span>
          <RotateCcw className="w-3 h-3 text-purple-300" />
        </button>
      </div>
    </div>
  );
};
