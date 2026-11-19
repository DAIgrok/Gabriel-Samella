import React from 'react';
import { Trophy, Lock, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion } from 'motion/react';
import { DiamondGemIcon, VectorGlyphIcon } from '../icons/CustomIcons';

export const AchievementsView: React.FC = () => {
  const { achievements } = useApp();

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCoinsEarnable = achievements.reduce((acc, a) => acc + a.rewardCoins, 0);
  const overallPct =
    achievements.length > 0 ? Math.round((unlockedCount / achievements.length) * 100) : 0;

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
          28 marcos reais celebrando cada memória, cuidado e descoberta juntos.
        </p>
      </div>

      {/* Overview Progress Card */}
      <div className="glass-card-glow rounded-3xl p-5 border border-amber-400/30 shadow-lg space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-purple-300 block">Progresso Geral</span>
            <h3 className="text-xl font-bold text-amber-300 font-display tabular-nums">
              {unlockedCount} de {achievements.length} Conquistas ({overallPct}%)
            </h3>
            <span className="text-xs text-purple-200/80 inline-flex items-center gap-1 mt-0.5">
              <span>Total de {totalCoinsEarnable}</span>
              <DiamondGemIcon className="w-3.5 h-3.5" />
              <span>em marcos</span>
            </span>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] shrink-0">
            <Trophy className="w-7 h-7" />
          </div>
        </div>

        <div className="w-full h-2 bg-purple-950/80 rounded-full overflow-hidden border border-purple-500/20">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      {/* Achievements List */}
      <div className="space-y-3">
        {achievements.map((ach) => {
          const maxP = Math.max(1, ach.maxProgress || 1);
          const curP = Math.min(maxP, ach.unlocked ? maxP : ach.progress || 0);
          const pct = Math.round((curP / maxP) * 100);

          return (
            <motion.div
              key={ach.id}
              layout
              className={`p-4 rounded-3xl glass-panel border transition-all flex items-center justify-between gap-4 ${
                ach.unlocked
                  ? 'border-amber-400/40 bg-purple-950/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                  : 'border-purple-500/20 opacity-80'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    ach.unlocked
                      ? 'bg-amber-500/25 border border-amber-400/45 text-amber-200 shadow-md'
                      : 'bg-purple-950/70 border border-purple-500/30 text-purple-400'
                  }`}
                >
                  {ach.unlocked ? (
                    <VectorGlyphIcon name={ach.icon} className="w-5 h-5" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-white truncate">{ach.title}</h4>
                    {ach.unlocked && (
                      <span className="text-[10px] text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Desbloqueada</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-purple-200/75 leading-relaxed">
                    {ach.description}
                  </p>
                  {maxP > 1 && (
                    <div className="flex items-center gap-2 pt-0.5">
                      <div className="flex-1 h-1.5 bg-purple-950/80 rounded-full overflow-hidden border border-purple-500/20">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            ach.unlocked ? 'bg-amber-400' : 'bg-pink-500/80'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-purple-300/80 tabular-nums shrink-0">
                        {curP}/{maxP}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-xs font-bold text-pink-200 bg-pink-500/20 px-2.5 py-1 rounded-full border border-pink-400/30 flex items-center gap-1 tabular-nums">
                  <DiamondGemIcon className="w-3.5 h-3.5" />
                  <span>+{ach.rewardCoins}</span>
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
