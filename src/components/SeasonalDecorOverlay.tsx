import React from 'react';
import { useApp } from '../context/AppContext';
import { VISUAL_ASSETS } from '../data/visualAssets';
import { PumpkinCrestIcon, SnowflakeCrestIcon } from './icons/CustomIcons';
import { Sparkles, Heart, RotateCcw } from 'lucide-react';

export const SeasonalDecorOverlay: React.FC = () => {
  const {
    activeSeasonalEvent,
    activeSeasonalMeta,
    isSeasonalPreview,
    seasonalState,
    claimSeasonalProp,
    setSeasonalMode,
    setExtendedView,
  } = useApp();

  const halloweenClaimed = seasonalState.claimedProps.includes('halloween-pumpkin-2026');
  const valentinesClaimed = seasonalState.claimedProps.includes('valentines-rose-2026');

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {/* Preview indicator bar at bottom-right above mobile nav */}
      {isSeasonalPreview && (
        <div className="pointer-events-auto fixed bottom-24 md:bottom-5 right-3 sm:right-5 flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#16072d]/95 border border-pink-400/40 shadow-[0_8px_25px_rgba(0,0,0,0.65)] backdrop-blur-md">
          <span className="text-pink-300">
            {activeSeasonalEvent === 'natal' ? (
              <SnowflakeCrestIcon className="w-4 h-4" />
            ) : activeSeasonalEvent === 'halloween' ? (
              <PumpkinCrestIcon className="w-4 h-4 text-orange-400" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </span>
          <span className="text-[11px] font-semibold text-white">
            Prévia: {activeSeasonalMeta.label}
          </span>
          <button
            type="button"
            onClick={() => setSeasonalMode('auto')}
            className="min-h-[32px] px-2.5 rounded-xl bg-purple-800/80 hover:bg-purple-700 text-[10px] font-semibold text-pink-200 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Automático</span>
          </button>
        </div>
      )}

      {/* Halloween corner glowing pumpkins */}
      {activeSeasonalEvent === 'halloween' && (
        <>
          <button
            type="button"
            onClick={() =>
              claimSeasonalProp(
                'halloween-pumpkin-2026',
                10,
                'Mimo de Halloween: Abóbora Mística encontrada!'
              )
            }
            aria-label="Abóbora Mística de Halloween"
            className="pointer-events-auto fixed bottom-24 md:bottom-6 left-3 md:left-28 group flex items-center gap-2 p-1.5 rounded-2xl bg-[#1a0a1f]/90 border border-orange-500/45 shadow-[0_0_24px_rgba(249,115,22,0.45)] hover:scale-105 transition-transform cursor-pointer"
          >
            <img
              src={VISUAL_ASSETS.halloweenPumpkinOrnament}
              alt="Abóbora de Halloween"
              className="w-11 h-11 rounded-xl object-cover border border-orange-400/40"
            />
            {!halloweenClaimed && (
              <span className="pr-2 text-[11px] font-bold text-orange-200">
                Toque (+10 💎)
              </span>
            )}
          </button>

          <img
            src={VISUAL_ASSETS.halloweenPumpkinOrnament}
            alt=""
            aria-hidden="true"
            className="hidden sm:block fixed top-4 right-5 w-10 h-10 rounded-xl object-cover opacity-80 border border-orange-400/30 shadow-[0_0_18px_rgba(249,115,22,0.35)]"
          />
        </>
      )}

      {/* Valentine's floating rose crest */}
      {activeSeasonalEvent === 'namorados' && (
        <button
          type="button"
          onClick={() =>
            claimSeasonalProp(
              'valentines-rose-2026',
              12,
              'Rosa Encantada do Dia dos Namorados!'
            )
          }
          aria-label="Rosa Encantada dos Namorados"
          className="pointer-events-auto fixed bottom-24 md:bottom-6 left-3 md:left-28 flex items-center gap-2 p-1.5 rounded-2xl bg-[#26071b]/90 border border-rose-400/50 shadow-[0_0_24px_rgba(251,113,133,0.45)] hover:scale-105 transition-transform cursor-pointer"
        >
          <img
            src={VISUAL_ASSETS.valentinesRoseCrest}
            alt="Rosa dos Namorados"
            className="w-11 h-11 rounded-xl object-cover border border-rose-300/40"
          />
          <div className="pr-2 text-left">
            <span className="text-[10px] font-bold text-rose-200 flex items-center gap-1">
              <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
              Namorados
            </span>
            <span className="text-[10px] text-rose-300/90 block">
              {valentinesClaimed ? 'Mimo coletado' : 'Resgatar +12 💎'}
            </span>
          </div>
        </button>
      )}

      {/* Anniversary celebration pill */}
      {activeSeasonalEvent === 'aniversario' && (
        <button
          type="button"
          onClick={() => setExtendedView('calendario')}
          className="pointer-events-auto fixed bottom-24 md:bottom-6 left-3 md:left-28 flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#241304]/90 border border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.35)] text-xs font-bold text-amber-200 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Hoje é Dia Especial Nosso!</span>
        </button>
      )}
    </div>
  );
};
