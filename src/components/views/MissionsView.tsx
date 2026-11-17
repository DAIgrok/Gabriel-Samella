import React from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Eye,
  Heart,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INTEGRATED_MISSIONS_CATALOG } from '../../data/initialData';
import { SEASONAL_THEMES } from '../../utils/seasonalEngine';
import { SeasonalEventId } from '../../types';
import {
  DiamondGemIcon,
  MissionCompassIcon,
  PumpkinCrestIcon,
  SnowflakeCrestIcon,
} from '../icons/CustomIcons';

const SEASONAL_OPTIONS: { id: SeasonalEventId; label: string; desc: string }[] = [
  { id: 'natal', label: 'Natal Encantado', desc: 'Neve realista + Papai Noel no contador' },
  { id: 'halloween', label: 'Halloween Místico', desc: 'Névoa violeta + abóboras iluminadas' },
  { id: 'namorados', label: 'Dia dos Namorados', desc: 'Pétalas de rosa flutuantes' },
  { id: 'aniversario', label: 'Aniversário 12/06', desc: 'Faíscas douradas celebrando nossa data' },
  { id: 'normal', label: 'Céu de Veludo', desc: 'Vagalumes violeta e rosa-magenta' },
];

export const MissionsView: React.FC = () => {
  const {
    missionsState,
    letters,
    coupleGoals,
    seasonalState,
    activeSeasonalEvent,
    activeSeasonalMeta,
    isSeasonalPreview,
    setSeasonalMode,
    claimIntegratedMission,
    setExtendedView,
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
        return seasonalState.claimedProps.includes('santa-counter-gift') ? 1 : 0;
      case 'mis-halloween-secret':
        return seasonalState.claimedProps.some((p) => p.startsWith('halloween-pumpkin')) ? 1 : 0;
      case 'mis-valentines-bloom':
        return seasonalState.claimedProps.includes('valentines-rose-gift') ? 1 : 0;
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
              Missões conectadas entre Casa 3D, Aquário, Cartas, Desejos e Sazonal
            </p>
          </div>
        </div>
      </div>

      {/* Seasonal Engine Status + Preview Switcher */}
      <div className={`glass-card-glow rounded-3xl p-4 sm:p-5 border ${activeSeasonalMeta.borderClass} space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-950/80 border border-white/15 flex items-center justify-center shrink-0">
              {activeSeasonalEvent === 'natal' ? (
                <SnowflakeCrestIcon className="w-6 h-6" />
              ) : activeSeasonalEvent === 'halloween' ? (
                <PumpkinCrestIcon className="w-6 h-6" />
              ) : (
                <Heart className="w-5 h-5 text-pink-400 fill-pink-400/30" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{activeSeasonalMeta.label}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-pink-200">
                  {isSeasonalPreview ? 'Modo Prévia' : 'Automático (Data Real)'}
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-0.5">{activeSeasonalMeta.subtitle}</p>
            </div>
          </div>

          {isSeasonalPreview && (
            <button
              type="button"
              onClick={() => setSeasonalMode('auto')}
              className="min-h-[40px] px-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Voltar ao Automático</span>
            </button>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-300/75 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-pink-400" />
            Testar / Visualizar Temporadas e Arquivo Sazonal
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {SEASONAL_OPTIONS.map((opt) => {
              const selected = isSeasonalPreview && seasonalState.previewEvent === opt.id;
              const isCurrentAuto = !isSeasonalPreview && activeSeasonalEvent === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSeasonalMode('preview', opt.id)}
                  className={`min-h-[54px] p-3 rounded-2xl border text-left transition cursor-pointer ${
                    selected || isCurrentAuto
                      ? 'bg-pink-500/20 border-pink-400 text-white shadow-md'
                      : 'bg-purple-950/50 border-purple-500/20 text-purple-200 hover:border-pink-400/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold">{opt.label}</span>
                    {isCurrentAuto && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-200">
                        Hoje
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-purple-200/70 mt-0.5 line-clamp-1">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
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
                        onClick={() => claimIntegratedMission(m.id)}
                        className="min-h-[42px] px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-pink-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer hover:brightness-110"
                      >
                        <span>Resgatar +{m.rewardCoins}</span>
                        <DiamondGemIcon className="w-3.5 h-3.5" />
                      </button>
                    ) : seasonalLocked ? (
                      <button
                        type="button"
                        onClick={() => setSeasonalMode('preview', m.seasonalOnly)}
                        className="min-h-[42px] px-4 rounded-2xl bg-purple-950/70 border border-amber-400/35 text-amber-200 text-xs font-bold cursor-pointer"
                      >
                        Ativar Prévia
                      </button>
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
