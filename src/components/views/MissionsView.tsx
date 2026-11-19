import React from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  CheckCircle2,
  Heart,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INTEGRATED_MISSIONS_CATALOG } from '../../data/initialData';
import { SEASONAL_THEMES } from '../../utils/seasonalEngine';
import {
  DiamondGemIcon,
  MissionCompassIcon,
  PumpkinCrestIcon,
  SnowflakeCrestIcon,
} from '../icons/CustomIcons';

export const MissionsView: React.FC = () => {
  const {
    missionsState,
    letters,
    coupleGoals,
    seasonalState,
    activeSeasonalEvent,
    activeSeasonalMeta,
    claimIntegratedMission,
    setExtendedView,
    isSpectator,
  } = useApp();

  const getProgressForMission = (missionId: string): number => {
    switch (missionId) {
      case 'mis-two-way-letter':
        return Math.max(missionsState.twoWayLettersSent, letters.length);
      case 'mis-wishlist-dream':
        return coupleGoals.length;
      case 'mis-house-decorator':
        return missionsState.houseVisits;
      case 'mis-aquarium-keeper':
        return missionsState.aquariumFeeds;
      case 'mis-virtual-photo':
        return missionsState.virtualSnapshotsTaken;
      case 'mis-christmas-spirit':
        return seasonalState.claimedProps.includes('santa-counter-topper') ||
          seasonalState.claimedProps.includes('santa-counter-gift')
          ? 1
          : 0;
      case 'mis-halloween-secret':
        return seasonalState.claimedProps.some((p) => p.startsWith('halloween-pumpkin')) ? 1 : 0;
      case 'mis-valentines-bloom':
        return seasonalState.claimedProps.some((p) => p.startsWith('valentines-rose')) ? 1 : 0;
      default:
        return 0;
    }
  };

  const navigateForMission = (missionId: string) => {
    switch (missionId) {
      case 'mis-two-way-letter':
        setExtendedView('cartas');
        break;
      case 'mis-wishlist-dream':
        setExtendedView('metas');
        break;
      case 'mis-house-decorator':
        setExtendedView('casa');
        break;
      case 'mis-aquarium-keeper':
        setExtendedView('aquario');
        break;
      case 'mis-virtual-photo':
        setExtendedView('casa');
        break;
      default:
        setExtendedView('inicio');
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5 pb-28 sm:pb-24 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="glass-card-glow rounded-3xl p-4 sm:p-5 border border-pink-400/25 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500/25 to-amber-500/25 border border-pink-400/35 flex items-center justify-center shrink-0">
            <MissionCompassIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-white truncate">
              Missões & Eventos Sazonais
            </h2>
            <p className="text-xs text-purple-200/75 truncate">
              Temporadas ativadas automaticamente pelo calendário real
            </p>
          </div>
        </div>
      </div>

      {/* Automatic Seasonal Calendar Status (No manual override) */}
      <div className={`glass-card-glow rounded-3xl p-4 sm:p-5 border ${activeSeasonalMeta.borderClass} space-y-2.5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-950/80 border border-white/15 flex items-center justify-center shrink-0">
              {activeSeasonalEvent === 'natal' ? (
                <SnowflakeCrestIcon className="w-6 h-6 text-sky-300" />
              ) : activeSeasonalEvent === 'halloween' ? (
                <PumpkinCrestIcon className="w-6 h-6 text-orange-400" />
              ) : (
                <Heart className="w-5 h-5 text-pink-400 fill-pink-400/30" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-white">{activeSeasonalMeta.label}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-400/35 text-emerald-200 inline-flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5" />
                  <span>Automático (Calendário Real)</span>
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-0.5">{activeSeasonalMeta.subtitle}</p>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-purple-300/75 leading-relaxed">
          Quando chegam Outubro (Halloween), Dezembro (Natal), Dia dos Namorados (12/06 &amp; 14/02) ou Aniversário de Namoro, os efeitos e personagens especiais aparecem sozinhos na tela inicial!
        </p>
      </div>

      {/* Integrated Missions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Missões Integradas ({missionsState.claimedIds.length}/{INTEGRATED_MISSIONS_CATALOG.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {INTEGRATED_MISSIONS_CATALOG.map((m) => {
            const current = Math.min(m.targetCount, getProgressForMission(m.id));
            const pct = Math.min(100, Math.round((current / m.targetCount) * 100));
            const claimed = missionsState.claimedIds.includes(m.id);
            const ready = !claimed && current >= m.targetCount;
            const seasonalLocked =
              Boolean(m.seasonalOnly) && activeSeasonalEvent !== m.seasonalOnly && !claimed && !ready;

            return (
              <div
                key={m.id}
                className={`glass-card-glow rounded-3xl p-4 border transition-all ${
                  claimed
                    ? 'border-emerald-400/35 bg-emerald-950/15'
                    : ready
                    ? 'border-pink-400/50 shadow-[0_0_24px_rgba(244,114,182,0.18)]'
                    : 'border-purple-500/25'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-white">{m.title}</span>
                      {m.seasonalOnly && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-200 border border-amber-400/35">
                          {SEASONAL_THEMES[m.seasonalOnly].label}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-purple-200/75 leading-relaxed">{m.description}</p>
                    {m.rewardUnlockLabel && (
                      <p className="text-[11px] text-pink-300 font-semibold">
                        Bônus: {m.rewardUnlockLabel}
                      </p>
                    )}

                    <div className="pt-1 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-purple-950/80 rounded-full overflow-hidden border border-purple-500/20">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            claimed
                              ? 'bg-emerald-400'
                              : 'bg-gradient-to-r from-pink-500 to-amber-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-purple-200 tabular-nums shrink-0">
                        {current}/{m.targetCount}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {claimed ? (
                      <span className="min-h-[42px] px-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Resgatada</span>
                      </span>
                    ) : ready ? (
                      <button
                        type="button"
                        disabled={isSpectator}
                        onClick={() => claimIntegratedMission(m.id)}
                        className="min-h-[42px] px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-pink-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer hover:brightness-110 disabled:opacity-50"
                      >
                        {isSpectator && <Lock className="w-3.5 h-3.5" />}
                        <span>{isSpectator ? 'Somente Samella' : `Resgatar +${m.rewardCoins}`}</span>
                        <DiamondGemIcon className="w-3.5 h-3.5" />
                      </button>
                    ) : seasonalLocked ? (
                      <span className="min-h-[42px] px-4 rounded-2xl bg-purple-950/70 border border-amber-400/25 text-amber-200/80 text-[11px] font-semibold inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Abre na temporada</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigateForMission(m.id)}
                        className="min-h-[42px] px-4 rounded-2xl bg-purple-950/70 border border-pink-400/35 text-pink-200 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Ir Fazer</span>
                        <span className="text-amber-300 font-mono">+{m.rewardCoins}</span>
                        <DiamondGemIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
