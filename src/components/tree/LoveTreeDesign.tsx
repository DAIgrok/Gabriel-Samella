import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Trees,
  Droplets,
  Sun,
  Scissors,
  Apple,
  Heart,
  Sparkles,
  Sprout,
  Lock,
} from 'lucide-react';
import { formatCooldownMs } from '../../context/AppContext';
import { DiamondGemIcon } from '../icons/CustomIcons';

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
  isSpectator?: boolean;
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
  isSpectator = false,
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
  const canHarvestFruit = !isSpectator && (safeLevel >= 3 || hasGoldenApples) && cdFruit <= 0;

  return (
    <div className="space-y-3.5 text-white text-left">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white truncate flex items-center gap-2">
            <Trees className="w-5 h-5 text-emerald-300 shrink-0" />
            <span className="truncate">Nossa Árvore do Amor</span>
          </h2>
          <p className="text-[11px] text-purple-200/75 truncate">{stageLabel}</p>
        </div>

        <div className="bg-white/10 border border-white/15 px-3 py-1.5 rounded-full font-bold text-xs text-white flex items-center gap-1.5 tabular-nums shrink-0 shadow-sm">
          <DiamondGemIcon className="w-3.5 h-3.5" />
          <span>{coins}</span>
        </div>
      </div>

      {/* Cosmic Starry Emerald Scene */}
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

        {/* Watering / Sun / Pruning visual feedback */}
        {isWatering && (
          <div className="absolute inset-x-0 top-10 flex justify-center gap-4 pointer-events-none z-20 animate-bounce text-cyan-300">
            <Droplets className="w-5 h-5" />
            <Droplets className="w-5 h-5" />
            <Droplets className="w-5 h-5" />
          </div>
        )}
        {isSunbathing && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full bg-amber-300/20 blur-xl pointer-events-none z-10" />
        )}
        {isPruning && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 text-emerald-300 pointer-events-none z-20 animate-pulse">
            <Sparkles className="w-5 h-5" />
            <Sprout className="w-5 h-5" />
            <Sparkles className="w-5 h-5" />
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
          disabled={isSpectator || (!canHarvestFruit && (safeLevel >= 3 || hasGoldenApples))}
          className={`absolute top-3.5 right-4 z-20 px-3 py-1 rounded-full border text-xs font-bold tabular-nums backdrop-blur-sm transition flex items-center gap-1.5 ${
            canHarvestFruit
              ? 'bg-rose-500/80 border-rose-300/60 text-white shadow-lg hover:brightness-110 cursor-pointer'
              : 'bg-black/50 border-white/15 text-white/90 cursor-default'
          }`}
          title={
            isSpectator
              ? 'Modo Espectador ativo'
              : safeLevel < 3 && !hasGoldenApples
              ? 'Frutos amadurecem a partir do Nível 3'
              : cdFruit > 0
              ? `Próximo fruto em ${formatCooldownMs(cdFruit)}`
              : 'Toque para colher um Fruto do Amor!'
          }
        >
          <Apple
            className={`w-3.5 h-3.5 ${
              hasGoldenApples ? 'text-amber-300 fill-amber-300' : 'text-rose-300 fill-rose-400'
            }`}
          />
          <span>{fruitsHarvested || 0}</span>
          {canHarvestFruit && <span className="ml-0.5 text-[10px] text-amber-200">Colher!</span>}
        </button>

        {/* Emerald Ground Mound */}
        <div
          className="absolute bottom-0 inset-x-0 h-[108px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at top, #1f5c3a, #0b1c14 70%)',
          }}
        />

        {/* Crystals / Lanterns / Swing / Butterfly / Songbird SVG Ornaments */}
        {hasCrystals && (
          <svg viewBox="0 0 28 28" className="w-7 h-7 absolute bottom-[56px] left-[24%] pointer-events-none z-10 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]">
            <polygon points="10,24 6,12 12,4 16,13 14,24" fill="#f472b6" />
            <polygon points="16,24 14,14 20,7 24,16 20,24" fill="#38bdf8" />
          </svg>
        )}
        {hasLanterns && (
          <svg viewBox="0 0 20 28" className="w-5 h-7 absolute bottom-[132px] left-[29%] pointer-events-none z-10 animate-pulse">
            <line x1="10" y1="0" x2="10" y2="6" stroke="#78350f" strokeWidth="2" />
            <rect x="4" y="6" width="12" height="16" rx="4" fill="#fef08a" stroke="#f59e0b" strokeWidth="1.5" />
          </svg>
        )}
        {hasSwing && (
          <svg viewBox="0 0 36 48" className="w-9 h-12 absolute bottom-[92px] right-[28%] pointer-events-none z-10">
            <line x1="8" y1="0" x2="8" y2="38" stroke="#fde68a" strokeWidth="1.6" />
            <line x1="28" y1="0" x2="28" y2="38" stroke="#fde68a" strokeWidth="1.6" />
            <rect x="4" y="36" width="28" height="5" rx="2.5" fill="#92400e" stroke="#f59e0b" strokeWidth="1" />
          </svg>
        )}
        {hasButterfly && (
          <motion.svg
            viewBox="0 0 28 22"
            animate={prefersReducedMotion ? undefined : { x: [0, 14, -8, 0], y: [0, -10, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-6 h-5 absolute top-[115px] right-[26%] pointer-events-none z-20"
          >
            <path d="M14,11 C6,1 0,6 7,13 C2,17 8,22 14,13 Z" fill="#c084fc" />
            <path d="M14,11 C22,1 28,6 21,13 C26,17 20,22 14,13 Z" fill="#f472b6" />
          </motion.svg>
        )}
        {hasSongbird && (
          <svg viewBox="0 0 24 20" className="w-5 h-4 absolute top-[102px] left-[28%] pointer-events-none z-20">
            <ellipse cx="10" cy="11" rx="7" ry="5" fill="#38bdf8" />
            <circle cx="15" cy="7" r="4" fill="#7dd3fc" />
            <polygon points="18,6 22,8 18,9" fill="#facc15" />
          </svg>
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
                <span className="absolute top-[28%] left-[25%] w-2.5 h-2.5 rounded-full bg-amber-200 shadow-[0_0_8px_#fde047] animate-pulse" />
                <span className="absolute top-[42%] right-[24%] w-2.5 h-2.5 rounded-full bg-pink-200 shadow-[0_0_8px_#f472b6] animate-pulse" />
                <span className="absolute bottom-[25%] left-[48%] w-2.5 h-2.5 rounded-full bg-amber-200 shadow-[0_0_8px_#fde047] animate-pulse" />
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
                <span
                  className="absolute top-[36%] left-[32%] w-4 h-4 rounded-full shadow-md border border-white/40"
                  style={{
                    background: hasGoldenApples
                      ? 'radial-gradient(circle at 30% 30%, #fef08a, #ca8a04)'
                      : 'radial-gradient(circle at 30% 30%, #fda4af, #e11d48)',
                  }}
                />
                <span
                  className="absolute top-[52%] right-[30%] w-4 h-4 rounded-full shadow-md border border-white/40"
                  style={{
                    background: hasGoldenApples
                      ? 'radial-gradient(circle at 30% 30%, #fef08a, #ca8a04)'
                      : 'radial-gradient(circle at 30% 30%, #fda4af, #e11d48)',
                  }}
                />
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

      {isSpectator && (
        <div className="px-3.5 py-2.5 rounded-2xl bg-purple-950/70 border border-purple-400/30 text-[11px] text-purple-200 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-pink-300 shrink-0" />
          <span>Modo Espectador ativo: apenas a Samella pode cuidar da Árvore do Amor ou amarrar fitas.</span>
        </div>
      )}

      {/* Growth Card */}
      <div className="bg-white/[0.06] border border-white/10 rounded-[18px] p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
          <span>Crescimento da Árvore</span>
          <span className="font-mono text-pink-200 tabular-nums">
            {safeLevel >= 10 ? 'Plenitude ♡' : `${xp || 0} / ${maxXp || 100} XP`}
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
            <span className="inline-flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-300" />
              <span>Hidratação ({waterCount || 0})</span>
            </span>
            <span className="font-bold text-cyan-200">{hydrationPercent}%</span>
          </div>
          <div className="px-2.5 py-1.5 rounded-xl bg-black/25 border border-white/10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-300" />
              <span>Luz solar ({sunCount || 0})</span>
            </span>
            <span className="font-bold text-amber-200">{sunlightPercent}%</span>
          </div>
        </div>
      </div>

      {/* 4-Column Care & Harvest Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={onWater}
          disabled={isSpectator || isWatering || cdWater > 0}
          className="min-h-[54px] px-1.5 py-2.5 rounded-[14px] bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 text-white text-[11px] sm:text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition disabled:opacity-55 tabular-nums"
        >
          <Droplets className="w-4 h-4 text-cyan-300" />
          <span>{cdWater > 0 ? formatCooldownMs(cdWater) : 'Regar'}</span>
        </button>

        <button
          type="button"
          onClick={onSun}
          disabled={isSpectator || isSunbathing || cdSun > 0}
          className="min-h-[54px] px-1.5 py-2.5 rounded-[14px] bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 text-white text-[11px] sm:text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition disabled:opacity-55 tabular-nums"
        >
          <Sun className="w-4 h-4 text-amber-300" />
          <span>{cdSun > 0 ? formatCooldownMs(cdSun) : 'Luz solar'}</span>
        </button>

        <button
          type="button"
          onClick={onPrune}
          disabled={isSpectator || isPruning || cdPrune > 0}
          className="min-h-[54px] px-1.5 py-2.5 rounded-[14px] bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 text-white text-[11px] sm:text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition disabled:opacity-55 tabular-nums"
        >
          <Scissors className="w-4 h-4 text-emerald-300" />
          <span>{cdPrune > 0 ? formatCooldownMs(cdPrune) : 'Podar'}</span>
        </button>

        <button
          type="button"
          onClick={onHarvestFruit}
          disabled={isSpectator || cdFruit > 0 || (safeLevel < 3 && !hasGoldenApples)}
          className="min-h-[54px] px-1.5 py-2.5 rounded-[14px] bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 text-white text-[11px] sm:text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition disabled:opacity-55 tabular-nums"
        >
          <Apple
            className={`w-4 h-4 ${
              hasGoldenApples ? 'text-amber-300 fill-amber-300' : 'text-rose-300 fill-rose-400'
            }`}
          />
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
            <Heart className="w-4 h-4 text-pink-400 fill-pink-400/30 shrink-0" />
            <span>Jardim de Promessas ({ribbons.length})</span>
            {promisesOpen ? (
              <ChevronUp className="w-4 h-4 text-purple-200/75" />
            ) : (
              <ChevronDown className="w-4 h-4 text-purple-200/75" />
            )}
          </button>

          {!isSpectator && (
            <button
              type="button"
              onClick={onOpenAddRibbon}
              className="px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/40 text-pink-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition shrink-0 tabular-nums"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{cdRibbon > 0 ? formatCooldownMs(cdRibbon) : 'Nova Fita'}</span>
            </button>
          )}
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
        disabled={isSpectator || safeLevel >= 10}
        className="w-full min-h-[48px] px-4 py-3 rounded-[16px] font-bold text-sm text-white shadow-[0_8px_24px_rgba(255,95,162,0.3)] transition cursor-pointer hover:brightness-110 active:scale-[0.99] disabled:opacity-55 tabular-nums flex items-center justify-center gap-2"
        style={{
          background: 'linear-gradient(135deg, #ff5fa2, #9d4edd)',
        }}
      >
        <Sprout className="w-4 h-4 shrink-0" />
        <span>
          {safeLevel >= 10
            ? 'Árvore na Plenitude Máxima (Nível 10)'
            : 'Plantar nova semente (+50 XP) — 100 diamantes'}
        </span>
      </button>
    </div>
  );
};
