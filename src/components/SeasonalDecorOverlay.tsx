import React from 'react';
import { useApp } from '../context/AppContext';
import { VISUAL_ASSETS } from '../data/visualAssets';
import { Sparkles, Heart } from 'lucide-react';
import { DiamondGemIcon } from './icons/CustomIcons';

export const SeasonalDecorOverlay: React.FC = () => {
  const {
    activeSeasonalEvent,
    seasonalState,
    claimSeasonalProp,
    setExtendedView,
    isSpectator,
  } = useApp();

  const halloweenClaimed = seasonalState.claimedProps.includes('halloween-pumpkin-2026');
  const valentinesClaimed = seasonalState.claimedProps.includes('valentines-rose-2026');

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {/* Halloween corner glowing pumpkins */}
      {activeSeasonalEvent === 'halloween' && (
        <>
          <button
            type="button"
            onClick={() =>
              claimSeasonalProp(
                'halloween-pumpkin-2026',
                5,
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
            {!halloweenClaimed && !isSpectator && (
              <span className="pr-2 text-[11px] font-bold text-orange-200 inline-flex items-center gap-1">
                <span>Toque (+5</span>
                <DiamondGemIcon className="w-3 h-3" />
                <span>)</span>
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
              6,
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
            <span className="text-[10px] text-rose-300/90 inline-flex items-center gap-1">
              {valentinesClaimed || isSpectator ? (
                'Mimo especial'
              ) : (
                <>
                  <span>Resgatar +6</span>
                  <DiamondGemIcon className="w-3 h-3" />
                </>
              )}
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
