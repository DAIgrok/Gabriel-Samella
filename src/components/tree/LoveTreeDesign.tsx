import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Plus, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { formatCooldownMs } from '../../context/AppContext';

export interface LoveTreeRibbonItem {
  id: string;
  title: string;
  message: string;
  color: string;
}

export interface LoveTreeDesignProps {
  coins: number;
  level: number;
  xp: number;
  maxXp: number;
  stageLabel: string;
  waterCount: number;
  sunCount: number;
  fruitsHarvested: number;
  ribbons: LoveTreeRibbonItem[];
  hasSakuraTheme: boolean;
  hasGoldenApples: boolean;
  hasFairyLights: boolean;
  hasSwing: boolean;
  hasLanterns: boolean;
  hasCrystals: boolean;
  hasButterfly: boolean;
  hasSongbird: boolean;
  isWatering: boolean;
  isSunbathing: boolean;
  isPruning: boolean;
  cdWater: number;
  cdSun: number;
  cdPrune: number;
  cdFruit: number;
  cdRibbon: number;
  onWater: () => void;
  onSun: () => void;
  onPrune: () => void;
  onHarvestFruit: () => void;
  onPlantSeed: () => void;
  onTreeTap: () => void;
  onSelectRibbon: (ribbon: LoveTreeRibbonItem) => void;
  onOpenAddRibbon: () => void;
}

const STAR_POSITIONS = [
  { top: '12%', left: '14%', size: 2, delay: '0s' },
  { top: '20%', left: '28%', size: 3, delay: '0.6s' },
  { top: '10%', left: '50%', size: 2, delay: '1.1s' },
  { top: '18%', left: '72%', size: 3, delay: '0.3s' },
  { top: '13%', left: '86%', size: 2, delay: '1.4s' },
  { top: '34%', left: '18%', size: 2, delay: '0.9s' },
  { top: '32%', left: '82%', size: 2, delay: '0.4s' },
  { top: '46%', left: '10%', size: 2, delay: '1.7s' },
  { top: '44%', left: '90%', size: 3, delay: '0.8s' },
];

export const LoveTreeDesign: React.FC<LoveTreeDesignProps> = ({
  coins,
  level,
  xp,
  maxXp,
  stageLabel,
  waterCount,
  sunCount,
  fruitsHarvested,
  ribbons,
  hasSakuraTheme,
  hasGoldenApples,
  hasFairyLights,
  hasSwing,
  hasLanterns,
  hasCrystals,
  hasButterfly,
  hasSongbird,
  isWatering,
  isSunbathing,
  isPruning,
  cdWater,
  cdSun,
  cdPrune,
  cdFruit,
  cdRibbon,
  onWater,
  onSun,
  onPrune,
  onHarvestFruit,
  onPlantSeed,
  onTreeTap,
  onSelectRibbon,
  onOpenAddRibbon,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [promisesOpen, setPromisesOpen] = useState(false);

  const safeLevel = Math.max(1, level || 1);
  const crownSize = Math.min(165, 68 + safeLevel * 9);
  const trunkHeight = Math.min(185, 70 + safeLevel * 11);
  const xpPercent = safeLevel >= 10 ? 100 : Math.min(100, Math.round(((xp || 0) / (maxXp || 100)) * 100));

  const hydrationPercent = Math.min(100, 35 + (waterCount || 0) * 10);
  const sunlightPercent = Math.min(100, 35 + (sunCount || 0) * 10);
  const canHarvestFruit = (safeLevel >= 3 || hasGoldenApples) && cdFruit <= 0;

  return (
    <div className="space-y-3.5 text-white text-left">
      {/* Header matching ChatGPT LoveTree */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white truncate">
            🌳 Nossa Árvore do Amor
          </h2>
          <p className="text-[11px] text-purple-200/75 truncate">{stageLabel}</p>
        </div>

        <div className="bg-white/10 border border-white/15 px-3 py-1.5 rounded-full font-bold text-xs text-white flex items-center gap-1.5 tabular-nums shrink-0 shadow-sm">
          <span>💎</span>
          <span>{coins}</span>
        </div>
      </div>

      {/* Cosmic Starry Emerald Scene matching ChatGPT tree-scene */}
      <div
        onClick={onTreeTap}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onTreeTap();
          }
        }}
        className="relative h-[340px] rounded-[24px] overflow-hidden border border-white/15 shadow-[0_14px_40px_rgba(0,0,0,0.55)] cursor-pointer select-none"
        style={{
          background: isSunbathing
            ? 'radial-gradient(circle at 50% 20%, #5e4422, #10142c 55%, #070913 85%)'
            : isWatering
            ? 'radial-gradient(circle at 50% 25%, #194b5e, #0c1428 60%, #070913 85%)'
            : 'radial-gradient(circle at 50% 25%, #202c52, #070913 75%)',
        }}
      >
        {/* Starry Sky Dots */}
        {STAR_POSITIONS.map((star, idx) => (
          <span
            key={idx}
            className={`absolute rounded-full bg-white/80 pointer-events-none ${
              prefersReducedMotion ? '' : 'animate-pulse'
            }`}
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: star.delay,
            }}
          />
        ))}

        {/* Watering / Sun / Pruning subtle visual feedback */}
        {isWatering && (
          <div className="absolute inset-x-0 top-10 flex justify-center gap-4 text-xl pointer-events-none z-20 animate-bounce">
            <span>💧</span>
            <span>💧</span>
            <span>💧</span>
          </div>
        )}
        {isSunbathing && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full bg-amber-300/20 blur-xl pointer-events-none z-10" />
        )}
        {isPruning && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 text-xl pointer-events-none z-20 animate-pulse">
            ✨🌿✨
          </div>
        )}

        {/* Corner Overlays: Nível & Frutos */}
        <div className="absolute top-3.5 left-4 z-20 px-3 py-1 rounded-full bg-black/50 border border-white/15 text-xs font-bold text-white tabular-nums backdrop-blur-sm">
          Nível {safeLevel}/10
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onHarvestFruit();
          }}
          disabled={!canHarvestFruit && (safeLevel >= 3 || hasGoldenApples)}
          className={`absolute top-3.5 right-4 z-20 px-3 py-1 rounded-full border text-xs font-bold tabular-nums backdrop-blur-sm transition ${
            canHarvestFruit
              ? 'bg-rose-500/80 border-rose-300/60 text-white shadow-lg hover:brightness-110 cursor-pointer'
              : 'bg-black/50 border-white/15 text-white/90 cursor-default'
          }`}
          title={
            safeLevel < 3 && !hasGoldenApples
              ? 'Frutos amadurecem a partir do Nível 3'
              : cdFruit > 0
              ? `Próximo fruto em ${formatCooldownMs(cdFruit)}`
              : 'Toque para colher um Fruto do Amor!'
          }
        >
          {hasGoldenApples ? '🍏' : '🍎'} {fruitsHarvested || 0}
          {canHarvestFruit && <span className="ml-1 text-[10px] text-amber-200">Colher!</span>}
        </button>

        {/* Emerald Ground Mound */}
        <div
          className="absolute bottom-0 inset-x-0 h-[108px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at top, #1f5c3a, #0b1c14 70%)',
          }}
        />

        {/* Crystals / Swing / Store ornaments */}
        {hasCrystals && (
          <div className="absolute bottom-[58px] left-[24%] text-lg pointer-events-none z-10 drop-shadow">
            🔮
          </div>
        )}
        {hasLanterns && (
          <div className="absolute bottom-[132px] left-[29%] text-base pointer-events-none z-10 animate-pulse">
            🏮
          </div>
        )}
        {hasSwing && (
          <div className="absolute bottom-[105px] right-[29%] text-base pointer-events-none z-10">
            🪵
          </div>
        )}
        {hasButterfly && (
          <motion.span
            animate={prefersReducedMotion ? undefined : { x: [0, 14, -8, 0], y: [0, -10, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[115px] right-[26%] text-lg pointer-events-none z-20"
          >
            🦋
          </motion.span>
        )}
        {hasSongbird && (
          <span className="absolute top-[102px] left-[28%] text-base pointer-events-none z-20">
            🐦
          </span>
        )}

        {/* Tree Silhouette + Dynamic Level-Scaled Crown & Trunk */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-[66px] flex flex-col items-center pointer-events-none"
          aria-hidden="true"
        >
          {/* Canopy Crown */}
          <motion.div
            animate={prefersReducedMotion ? undefined : { scale: [1, 1.03, 1] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative rounded-full transition-all duration-500"
            style={{
              width: `${crownSize * 2}px`,
              height: `${crownSize * 1.4}px`,
              marginBottom: '-24px',
              background: hasSakuraTheme
                ? 'radial-gradient(circle at 30% 30%, #ff85c0, #9d174d 72%)'
                : 'radial-gradient(circle at 30% 30%, #44c77b, #145a32 72%)',
              boxShadow: hasSakuraTheme
                ? '0 0 60px rgba(255, 133, 192, 0.38)'
                : '0 0 60px rgba(68, 199, 123, 0.35)',
            }}
          >
            {/* Fairy Lights */}
            {hasFairyLights && (
              <>
                <span className="absolute top-[28%] left-[25%] text-xs animate-pulse">✨</span>
                <span className="absolute top-[42%] right-[24%] text-xs animate-pulse">✨</span>
                <span className="absolute bottom-[25%] left-[48%] text-xs animate-pulse">✨</span>
              </>
            )}

            {/* Hanging Promise Ribbon Dots */}
            {ribbons.slice(0, 4).map((r, i) => (
              <span
                key={r.id}
                className="absolute w-2.5 h-3.5 rounded-b-full shadow"
                style={{
                  backgroundColor: r.color,
                  bottom: `${14 + (i % 2) * 14}px`,
                  left: `${24 + i * 16}%`,
                }}
              />
            ))}

            {/* Visible Fruits when Level >= 3 or Golden Apples unlocked */}
            {(safeLevel >= 3 || hasGoldenApples) && (
              <>
                <span className="absolute top-[36%] left-[32%] text-sm drop-shadow">
                  {hasGoldenApples ? '🍏' : '🍎'}
                </span>
                <span className="absolute top-[52%] right-[30%] text-sm drop-shadow">
                  {hasGoldenApples ? '🍏' : '🍎'}
                </span>
              </>
            )}
          </motion.div>

          {/* Trunk */}
          <div
            className="w-7 rounded-t-xl rounded-b-md transition-all duration-500 shadow-lg"
            style={{
              height: `${trunkHeight}px`,
              background: 'linear-gradient(180deg, #6d472c, #442b1a)',
            }}
          />
        </div>
      </div>

      {/* Growth Card matching ChatGPT design */}
      <div className="bg-white/[0.06] border border-white/10 rounded-[18px] p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
          <span>Crescimento da Árvore</span>
          <span className="font-mono text-pink-200 tabular-nums">
            {safeLevel >= 10 ? 'Plenitude ✨' : `${xp || 0} / ${maxXp || 100} XP`}
          </span>
        </div>

        <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${xpPercent}%`,
              background: 'linear-gradient(90deg, #ff5fa2, #ffb86b)',
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-purple-200/85 tabular-nums">
          <div className="px-2.5 py-1.5 rounded-xl bg-black/25 border border-white/10 flex items-center justify-between">
            <span>💧 Hidratação ({waterCount || 0})</span>
            <span className="font-bold text-cyan-200">{hydrationPercent}%</span>
          </div>
          <div className="px-2.5 py-1.5 rounded-xl bg-black/25 border border-white/10 flex items-center justify-between">
            <span>☀️ Luz solar ({sunCount || 0})</span>
            <span className="font-bold text-amber-200">{sunlightPercent}%</span>
          </div>
        </div>
      </div>

      {/* 4-Column Care & Harvest Buttons matching ChatGPT */}
      <div className="grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={onWater}
          disabled={isWatering || cdWater > 0}
          className="min-h-[54px] px-1.5 py-2.5 rounded-[14px] bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 text-white text-[11px] sm:text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition disabled:opacity-55 tabular-nums"
        >
          <span className="text-base">💧</span>
          <span>{cdWater > 0 ? formatCooldownMs(cdWater) : 'Regar'}</span>
        </button>

        <button
          type="button"
          onClick={onSun}
          disabled={isSunbathing || cdSun > 0}
          className="min-h-[54px] px-1.5 py-2.5 rounded-[14px] bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 text-white text-[11px] sm:text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition disabled:opacity-55 tabular-nums"
        >
          <span className="text-base">☀️</span>
          <span>{cdSun > 0 ? formatCooldownMs(cdSun) : 'Luz solar'}</span>
        </button>

        <button
          type="button"
          onClick={onPrune}
          disabled={isPruning || cdPrune > 0}
          className="min-h-[54px] px-1.5 py-2.5 rounded-[14px] bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 text-white text-[11px] sm:text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition disabled:opacity-55 tabular-nums"
        >
          <span className="text-base">✂️</span>
          <span>{cdPrune > 0 ? formatCooldownMs(cdPrune) : 'Podar'}</span>
        </button>

        <button
          type="button"
          onClick={onHarvestFruit}
          disabled={cdFruit > 0 || (safeLevel < 3 && !hasGoldenApples)}
          className="min-h-[54px] px-1.5 py-2.5 rounded-[14px] bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 text-white text-[11px] sm:text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition disabled:opacity-55 tabular-nums"
        >
          <span className="text-base">{hasGoldenApples ? '🍏' : '🍎'}</span>
          <span>
            {safeLevel < 3 && !hasGoldenApples
              ? 'Nv. 3+'
              : cdFruit > 0
              ? formatCooldownMs(cdFruit)
              : 'Colher'}
          </span>
        </button>
      </div>

      {/* Collapsible Promise Garden Card */}
      <div className="bg-white/[0.06] border border-white/10 rounded-[18px] overflow-hidden">
        <div className="w-full p-3.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setPromisesOpen((prev) => !prev)}
            className="flex-1 flex items-center gap-2 text-left text-xs sm:text-sm font-bold text-white cursor-pointer"
          >
            <span>💗 Jardim de Promessas ({ribbons.length})</span>
            {promisesOpen ? (
              <ChevronUp className="w-4 h-4 text-purple-200/75" />
            ) : (
              <ChevronDown className="w-4 h-4 text-purple-200/75" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenAddRibbon}
            className="px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/40 text-pink-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition shrink-0 tabular-nums"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{cdRibbon > 0 ? formatCooldownMs(cdRibbon) : 'Nova Fita'}</span>
          </button>
        </div>

        {promisesOpen && (
          <div className="px-3.5 pb-3.5 pt-1 space-y-2 border-t border-white/10">
            {ribbons.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelectRibbon(r)}
                className="w-full p-2.5 rounded-xl bg-black/30 hover:bg-black/45 border border-white/10 flex items-center justify-between gap-2 text-left cursor-pointer transition"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: r.color }}
                  />
                  <span className="text-xs font-semibold text-purple-100 truncate">
                    {r.title}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-300/70 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Plant New Seed CTA Button */}
      <button
        type="button"
        onClick={onPlantSeed}
        disabled={safeLevel >= 10}
        className="w-full min-h-[48px] px-4 py-3 rounded-[16px] font-bold text-sm text-white shadow-[0_8px_24px_rgba(255,95,162,0.3)] transition cursor-pointer hover:brightness-110 active:scale-[0.99] disabled:opacity-55 tabular-nums"
        style={{
          background: 'linear-gradient(135deg, #ff5fa2, #9d4edd)',
        }}
      >
        {safeLevel >= 10
          ? '🌌 Árvore na Plenitude Máxima (Nível 10)'
          : '🌱 Plantar nova semente (+50 XP) — 100 💎'}
      </button>
    </div>
  );
};
