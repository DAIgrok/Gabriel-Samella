import React from 'react';
import { Trophy, CheckCircle2, Lock, Sparkles, Star, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion } from 'motion/react';

export const AchievementsView: React.FC = () => {
  const { achievements, unlockAchievement } = useApp();

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCoinsEarnable = achievements.reduce((acc, a) => acc + a.rewardCoins, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 pb-32 sm:pb-24 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-xs font-semibold text-amber-300 mb-1">
          <Trophy className="w-3.5 h-3.5" />
          <span>Conquistas do Casal</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
          Nossos Marcos & Selos ♡
        </h2>
        <p className="text-xs md:text-sm text-purple-200/70">
          Comemorando cada momento e memória juntos em nossa caminhada.
        </p>
      </div>

      {/* Overview Progress Card */}
      <div className="glass-card-glow rounded-3xl p-5 border border-amber-400/30 shadow-lg flex items-center justify-between gap-4">
        <div>
          <span className="text-xs text-purple-300 block">Progresso Geral</span>
          <h3 className="text-xl font-bold text-amber-300 font-display">
            {unlockedCount} de {achievements.length} Conquistas
          </h3>
          <span className="text-xs text-purple-200/80">
            Total de {totalCoinsEarnable} 💎 disponíveis
          </span>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
          🏆
        </div>
      </div>

      {/* Achievements List */}
      <div className="space-y-3">
        {achievements.map((ach) => (
          <motion.div
            key={ach.id}
            layout
            className={`p-4 rounded-3xl glass-panel border transition-all flex items-center justify-between gap-4 ${
              ach.unlocked
                ? 'border-amber-400/40 bg-purple-950/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                : 'border-purple-500/20 opacity-70'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                  ach.unlocked
                    ? 'bg-amber-500/30 border border-amber-400/40 shadow-md'
                    : 'bg-purple-950/70 border border-purple-500/30 text-purple-500'
                }`}
              >
                {ach.unlocked ? ach.icon : '🔒'}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white truncate">{ach.title}</h4>
                  {ach.unlocked && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Desbloqueada
                    </span>
                  )}
                </div>
                <p className="text-xs text-purple-200/70 leading-relaxed mt-0.5">
                  {ach.description}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end flex-shrink-0">
              <span className="text-xs font-bold text-pink-300 bg-pink-500/20 px-2.5 py-1 rounded-full border border-pink-400/30 flex items-center gap-1">
                <span>💎</span>
                <span>+{ach.rewardCoins}</span>
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
