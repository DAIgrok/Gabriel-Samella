import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { KittenState, PetType } from '../../types';
import type { PetDanceMove } from '../3d/PetCanvas3D';

interface PetCharacterProps {
  kitten: KittenState;
  petType: PetType;
  danceMove?: PetDanceMove;
  paintMode?: boolean;
  onPaintPart?: (partKey: string) => void;
  onPetPart: (part: 'head' | 'belly' | 'paw') => void;
  onNoseClick: (e: React.MouseEvent) => void;
  hasSoapFoam?: boolean;
  isShowering?: boolean;
  hasCrown?: boolean;
  hasRibbon?: boolean;
  hasSunglasses?: boolean;
  hasBowtie?: boolean;
  hasAngelWings?: boolean;
}

function adjustHexBrightness(hex: string, factor: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return hex;
  const r = Math.max(0, Math.min(255, Math.round(((num >> 16) & 0xff) * factor)));
  const g = Math.max(0, Math.min(255, Math.round(((num >> 8) & 0xff) * factor)));
  const b = Math.max(0, Math.min(255, Math.round((num & 0xff) * factor)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

interface SpeciesPalette {
  light: string;
  mid: string;
  dark: string;
  stroke: string;
  earOuter: string;
  earInner: string;
  belly: string;
  cheeks: string;
  nose: string;
  glow: string;
}

function getPalette(petType: PetType, isSleeping: boolean): SpeciesPalette {
  const sleepTint = (normal: SpeciesPalette): SpeciesPalette =>
    isSleeping
      ? {
          ...normal,
          glow: 'rgba(129, 140, 248, 0.35)',
        }
      : normal;

  switch (petType) {
    case 'dog':
      return sleepTint({
        light: '#fef3c7',
        mid: '#fcd34d',
        dark: '#d97706',
        stroke: '#92400e',
        earOuter: '#b45309',
        earInner: '#fde68a',
        belly: '#fffbeb',
        cheeks: '#fb7185',
        nose: '#451a03',
        glow: 'rgba(251, 191, 36, 0.35)',
      });
    case 'bunny':
      return sleepTint({
        light: '#fff5f8',
        mid: '#fbcfe8',
        dark: '#f472b6',
        stroke: '#be185d',
        earOuter: '#f9a8d4',
        earInner: '#fdf2f8',
        belly: '#ffffff',
        cheeks: '#fb7185',
        nose: '#e11d48',
        glow: 'rgba(244, 114, 182, 0.42)',
      });
    case 'pig':
      return sleepTint({
        light: '#ffe4e6',
        mid: '#fda4af',
        dark: '#f43f5e',
        stroke: '#be123c',
        earOuter: '#fb7185',
        earInner: '#fecdd3',
        belly: '#fff1f2',
        cheeks: '#f43f5e',
        nose: '#9f1239',
        glow: 'rgba(251, 113, 133, 0.4)',
      });
    case 'mouse':
      return sleepTint({
        light: '#f8fafc',
        mid: '#cbd5e1',
        dark: '#64748b',
        stroke: '#334155',
        earOuter: '#94a3b8',
        earInner: '#fbcfe8',
        belly: '#ffffff',
        cheeks: '#fb7185',
        nose: '#e11d48',
        glow: 'rgba(148, 163, 184, 0.35)',
      });
    case 'snake':
      return sleepTint({
        light: '#dcfce7',
        mid: '#4ade80',
        dark: '#15803d',
        stroke: '#14532d',
        earOuter: '#16a34a',
        earInner: '#bbf7d0',
        belly: '#fef9c3',
        cheeks: '#34d399',
        nose: '#dc2626',
        glow: 'rgba(74, 222, 128, 0.35)',
      });
    case 'shark':
      return sleepTint({
        light: '#e0f2fe',
        mid: '#38bdf8',
        dark: '#0369a1',
        stroke: '#0c4a6e',
        earOuter: '#0284c7',
        earInner: '#bae6fd',
        belly: '#f8fafc',
        cheeks: '#f472b6',
        nose: '#075985',
        glow: 'rgba(56, 189, 248, 0.4)',
      });
    case 'dolphin':
      return sleepTint({
        light: '#ecfeff',
        mid: '#22d3ee',
        dark: '#0e7490',
        stroke: '#164e63',
        earOuter: '#06b6d4',
        earInner: '#cffafe',
        belly: '#ffffff',
        cheeks: '#f472b6',
        nose: '#0e7490',
        glow: 'rgba(34, 211, 238, 0.4)',
      });
    case 'whale':
      return sleepTint({
        light: '#e0e7ff',
        mid: '#60a5fa',
        dark: '#1d4ed8',
        stroke: '#1e3a8a',
        earOuter: '#3b82f6',
        earInner: '#bfdbfe',
        belly: '#f8fafc',
        cheeks: '#f472b6',
        nose: '#1e40af',
        glow: 'rgba(96, 165, 250, 0.42)',
      });
    case 'bee':
      return sleepTint({
        light: '#fef9c3',
        mid: '#facc15',
        dark: '#ca8a04',
        stroke: '#713f12',
        earOuter: '#292524',
        earInner: '#fde047',
        belly: '#fefce8',
        cheeks: '#fb7185',
        nose: '#292524',
        glow: 'rgba(250, 204, 21, 0.4)',
      });
    case 'fox':
      return sleepTint({
        light: '#ffedd5',
        mid: '#fb923c',
        dark: '#c2410c',
        stroke: '#7c2d12',
        earOuter: '#9a3412',
        earInner: '#fed7aa',
        belly: '#fff7ed',
        cheeks: '#fb7185',
        nose: '#1c1917',
        glow: 'rgba(251, 146, 60, 0.4)',
      });
    case 'panda':
      return sleepTint({
        light: '#ffffff',
        mid: '#f1f5f9',
        dark: '#cbd5e1',
        stroke: '#0f172a',
        earOuter: '#0f172a',
        earInner: '#334155',
        belly: '#ffffff',
        cheeks: '#fb7185',
        nose: '#0f172a',
        glow: 'rgba(226, 232, 240, 0.35)',
      });
    case 'koala':
      return sleepTint({
        light: '#f1f5f9',
        mid: '#cbd5e1',
        dark: '#64748b',
        stroke: '#334155',
        earOuter: '#64748b',
        earInner: '#fce7f3',
        belly: '#ffffff',
        cheeks: '#fb7185',
        nose: '#1e293b',
        glow: 'rgba(148, 163, 184, 0.35)',
      });
    case 'penguin':
      return sleepTint({
        light: '#334155',
        mid: '#1e293b',
        dark: '#020617',
        stroke: '#020617',
        earOuter: '#0f172a',
        earInner: '#38bdf8',
        belly: '#ffffff',
        cheeks: '#fb7185',
        nose: '#f59e0b',
        glow: 'rgba(56, 189, 248, 0.35)',
      });
    case 'bear':
      return sleepTint({
        light: '#fde68a',
        mid: '#d97706',
        dark: '#78350f',
        stroke: '#451a03',
        earOuter: '#92400e',
        earInner: '#fde68a',
        belly: '#fef3c7',
        cheeks: '#fb7185',
        nose: '#292524',
        glow: 'rgba(217, 119, 6, 0.35)',
      });
    case 'hamster':
      return sleepTint({
        light: '#fff7ed',
        mid: '#fdba74',
        dark: '#ea580c',
        stroke: '#9a3412',
        earOuter: '#c2410c',
        earInner: '#ffedd5',
        belly: '#ffffff',
        cheeks: '#fb7185',
        nose: '#e11d48',
        glow: 'rgba(253, 186, 116, 0.4)',
      });
    case 'lion':
      return sleepTint({
        light: '#fef3c7',
        mid: '#fbbf24',
        dark: '#d97706',
        stroke: '#78350f',
        earOuter: '#b45309',
        earInner: '#fde68a',
        belly: '#fffbeb',
        cheeks: '#fb7185',
        nose: '#78350f',
        glow: 'rgba(251, 191, 36, 0.42)',
      });
    case 'tiger':
      return sleepTint({
        light: '#ffedd5',
        mid: '#f97316',
        dark: '#c2410c',
        stroke: '#7c2d12',
        earOuter: '#ea580c',
        earInner: '#fed7aa',
        belly: '#fffbeb',
        cheeks: '#fb7185',
        nose: '#be123c',
        glow: 'rgba(249, 115, 22, 0.4)',
      });
    case 'frog':
      return sleepTint({
        light: '#ecfccb',
        mid: '#84cc16',
        dark: '#4d7c0f',
        stroke: '#365314',
        earOuter: '#65a30d',
        earInner: '#d9f99d',
        belly: '#fef9c3',
        cheeks: '#fb7185',
        nose: '#365314',
        glow: 'rgba(132, 204, 22, 0.4)',
      });
    case 'hedgehog':
      return sleepTint({
        light: '#fef3c7',
        mid: '#d6d3d1',
        dark: '#78716c',
        stroke: '#44403c',
        earOuter: '#a8a29e',
        earInner: '#fecdd3',
        belly: '#fffbeb',
        cheeks: '#fb7185',
        nose: '#292524',
        glow: 'rgba(214, 211, 209, 0.35)',
      });
    case 'parrot':
      return sleepTint({
        light: '#fecdd3',
        mid: '#f43f5e',
        dark: '#be123c',
        stroke: '#881337',
        earOuter: '#10b981',
        earInner: '#facc15',
        belly: '#fde047',
        cheeks: '#fb7185',
        nose: '#f59e0b',
        glow: 'rgba(244, 63, 94, 0.4)',
      });
    case 'turtle':
      return sleepTint({
        light: '#d9f99d',
        mid: '#4ade80',
        dark: '#15803d',
        stroke: '#14532d',
        earOuter: '#854d0e',
        earInner: '#ca8a04',
        belly: '#fef08a',
        cheeks: '#fb7185',
        nose: '#14532d',
        glow: 'rgba(74, 222, 128, 0.38)',
      });
    case 'cat':
    default:
      return sleepTint({
        light: '#fde8c8',
        mid: '#e69f58',
        dark: '#b46224',
        stroke: '#78350f',
        earOuter: '#c26e2a',
        earInner: '#fbcfe8',
        belly: '#fff9f2',
        cheeks: '#fda4af',
        nose: '#f472b6',
        glow: 'rgba(230, 159, 88, 0.42)',
      });
  }
}

export const PetCharacter: React.FC<PetCharacterProps> = ({
  kitten,
  petType,
  danceMove = 'idle',
  paintMode = false,
  onPaintPart,
  onPetPart,
  onNoseClick,
  hasSoapFoam = false,
  isShowering = false,
  hasCrown,
  hasRibbon,
  hasSunglasses,
  hasBowtie,
  hasAngelWings,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const isSleeping = Boolean(kitten.isSleeping);
  const isPlayMode = Boolean(kitten.isPlayMode);
  const isEating = Boolean(kitten.isEating);
  const isDrinking = Boolean(kitten.isDrinking);
  const isBathing = Boolean(kitten.isBathing) || hasSoapFoam;
  const isDirty = (kitten.hygiene ?? 80) < 45;
  const isTired = (kitten.energy ?? 80) < 35 && !isSleeping;
  const isSad = (kitten.hunger ?? 80) < 30 || (kitten.thirst ?? 80) < 30 || (kitten.fun ?? 80) < 30;

  const partColors = kitten.petPartColors?.[petType];

  const colors = useMemo(() => {
    const base = getPalette(petType, isSleeping);
    const customHex = kitten.petColors?.[petType];
    const headBase = partColors?.head || partColors?.body || customHex;
    const bodyBase = partColors?.body || customHex;
    return {
      ...base,
      headLight: headBase ? adjustHexBrightness(headBase, 1.15) : base.light,
      headMid: headBase || base.mid,
      headDark: headBase ? adjustHexBrightness(headBase, 0.8) : base.dark,
      light: bodyBase ? adjustHexBrightness(bodyBase, 1.15) : base.light,
      mid: bodyBase || base.mid,
      dark: bodyBase ? adjustHexBrightness(bodyBase, 0.8) : base.dark,
      earOuter: partColors?.ears || customHex || base.earOuter,
      earInner: partColors?.earInner || base.earInner,
      belly: partColors?.belly || base.belly,
      paws: partColors?.paws || partColors?.belly || base.belly,
      arms: partColors?.paws || partColors?.body || customHex || base.mid,
      tail: partColors?.tail || partColors?.body || customHex || base.dark,
      cheeks: partColors?.cheeks || base.cheeks,
      nose: partColors?.nose || base.nose,
    };
  }, [petType, isSleeping, kitten.petColors, partColors]);

  const handleSvgPartClick = (
    e: React.MouseEvent,
    paintKey: string,
    normalPart: 'head' | 'belly' | 'paw'
  ) => {
    e.stopPropagation();
    if (paintMode && onPaintPart) {
      onPaintPart(paintKey);
      return;
    }
    onPetPart(normalPart);
  };

  const hatId = kitten.equippedHat || (hasCrown ? 'item-cat-crown' : hasRibbon ? 'item-cat-ribbon' : '');
  const glassesId = kitten.equippedGlasses || (hasSunglasses ? 'item-cat-sunglasses' : '');
  const collarId = kitten.equippedCollar || (hasBowtie ? 'item-cat-bowtie' : '');
  const outfitId = kitten.equippedOutfit || '';
  const accId = kitten.equippedAccessory || (hasAngelWings ? 'item-cat-angel-wings' : '');

  const showWings = accId === 'item-cat-angel-wings';
  const showCape = accId === 'item-pet-cape';
  const showBackpack = accId === 'item-pet-heart-backpack';
  const showHeadphones = accId === 'item-pet-headphones';

  const isBeakSpecies = petType === 'penguin' || petType === 'parrot';
  const isAquatic = petType === 'shark' || petType === 'dolphin' || petType === 'whale';
  const isLegless = petType === 'snake' || isAquatic;

  const bodyMotion = prefersReducedMotion
    ? {}
    : isSleeping
    ? { scaleY: [0.98, 1.02, 0.98], y: [0, 2, 0] }
    : danceMove === 'spin'
    ? { rotateY: [0, 360], y: [0, -18, 0] }
    : danceMove === 'dance'
    ? { y: [0, -14, 0, -10, 0], rotate: [-8, 8, -8, 8, -8], scale: [1, 1.05, 0.98, 1.05, 1] }
    : danceMove === 'jump'
    ? { y: [0, -32, 0], scaleY: [0.94, 1.08, 0.94], scaleX: [1.05, 0.94, 1.05] }
    : danceMove === 'wave'
    ? { rotate: [0, -6, 6, -6, 0], y: [0, -6, 0] }
    : danceMove === 'kiss'
    ? { scale: [1, 1.12, 1], y: [0, -6, 0] }
    : isPlayMode
    ? { y: [0, -14, 0], rotate: [-3, 3, -3] }
    : isEating
    ? { scaleY: [1, 1.04, 0.98, 1], y: [0, -4, 0] }
    : { y: [0, -5, 0], scaleY: [1, 1.015, 1] };

  const eyeFill = petType === 'panda' ? '#ffffff' : '#2e1065';
  const irisColor =
    partColors?.eyes ||
    (petType === 'cat'
      ? '#10b981'
      : petType === 'shark' || petType === 'dolphin' || petType === 'whale'
      ? '#0284c7'
      : petType === 'snake' || petType === 'frog' || petType === 'turtle'
      ? '#16a34a'
      : '#6d28d9');

  return (
    <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center select-none">
      {/* Ground Soft Shadow */}
      <motion.div
        animate={
          prefersReducedMotion
            ? undefined
            : { scaleX: isPlayMode ? [1, 0.82, 1] : [1, 0.94, 1], opacity: [0.45, 0.35, 0.45] }
        }
        transition={{ duration: isPlayMode ? 0.7 : 2.6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-3 w-40 h-6 rounded-full bg-black/55 blur-md pointer-events-none"
      />

      {/* Sleeping Zzz */}
      {isSleeping && (
        <div className="absolute -top-1 right-10 z-30 pointer-events-none">
          <motion.span
            animate={prefersReducedMotion ? undefined : { y: [-2, -26], opacity: [0, 1, 0], scale: [0.85, 1.25] }}
            transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block text-indigo-300 font-black text-xl drop-shadow-[0_0_10px_rgba(129,140,248,0.9)]"
          >
            Zzz...
          </motion.span>
        </div>
      )}

      {/* Shower Water Stream */}
      {isShowering && (
        <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-full">
          {[18, 32, 46, 60, 74].map((leftPct, i) => (
            <motion.div
              key={leftPct}
              initial={{ y: -20, opacity: 0 }}
              animate={prefersReducedMotion ? { opacity: 0.7 } : { y: [0, 210], opacity: [0, 0.9, 0] }}
              transition={{ duration: 0.75, delay: i * 0.12, repeat: Infinity, ease: 'linear' }}
              className="absolute top-0 w-1.5 h-8 rounded-full bg-gradient-to-b from-cyan-200 to-sky-400/80 shadow-[0_0_8px_rgba(56,189,248,0.7)]"
              style={{ left: `${leftPct}%` }}
            />
          ))}
        </div>
      )}

      {/* Main Pou / Talking Tom Styled Character SVG */}
      <motion.div
        animate={bodyMotion}
        transition={{
          duration: isSleeping ? 3.2 : isPlayMode ? 0.85 : isEating ? 0.55 : 2.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative w-full h-full flex items-center justify-center"
      >
        <svg
          viewBox="0 0 240 240"
          className="w-full h-full overflow-visible"
          style={{ filter: `drop-shadow(0 12px 24px ${colors.glow})` }}
        >
          <defs>
            <radialGradient id={`bodyGrad-${petType}`} cx="42%" cy="32%" r="68%">
              <stop offset="0%" stopColor={colors.light} />
              <stop offset="52%" stopColor={colors.mid} />
              <stop offset="100%" stopColor={colors.dark} />
            </radialGradient>
            <radialGradient id={`headGrad-${petType}`} cx="42%" cy="30%" r="68%">
              <stop offset="0%" stopColor={colors.headLight} />
              <stop offset="55%" stopColor={colors.headMid} />
              <stop offset="100%" stopColor={colors.headDark} />
            </radialGradient>
            <linearGradient id={`hoodieGrad-${petType}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <radialGradient id={`soapBubble-${petType}`} cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#bae6fd" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.85" />
            </radialGradient>
          </defs>

          {/* ANGEL WINGS (Behind Body) */}
          {showWings && (
            <g className="pointer-events-none">
              <motion.g
                animate={prefersReducedMotion ? undefined : { rotate: [-6, 6, -6] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ originX: '75px', originY: '145px' }}
              >
                <path
                  d="M78,150 C34,116 14,132 24,158 C18,172 34,186 58,178 C66,184 78,174 82,162 Z"
                  fill="#ffffff"
                  fillOpacity="0.92"
                  stroke="#e0f2fe"
                  strokeWidth="2.5"
                />
                <path d="M40,146 Q56,154 70,156" stroke="#bae6fd" strokeWidth="2" fill="none" strokeLinecap="round" />
              </motion.g>
              <motion.g
                animate={prefersReducedMotion ? undefined : { rotate: [6, -6, 6] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ originX: '165px', originY: '145px' }}
              >
                <path
                  d="M162,150 C206,116 226,132 216,158 C222,172 206,186 182,178 C174,184 162,174 158,162 Z"
                  fill="#ffffff"
                  fillOpacity="0.92"
                  stroke="#e0f2fe"
                  strokeWidth="2.5"
                />
                <path d="M200,146 Q184,154 170,156" stroke="#bae6fd" strokeWidth="2" fill="none" strokeLinecap="round" />
              </motion.g>
            </g>
          )}

          {/* ROYAL CAPE (Behind Body) */}
          {showCape && (
            <path
              d="M66,144 L44,210 Q120,224 196,210 L174,144 Z"
              fill="#e11d48"
              stroke="#fbbf24"
              strokeWidth="2.5"
              className="pointer-events-none"
            />
          )}

          {/* HEART BACKPACK STRAPS / BAG SIDE */}
          {showBackpack && (
            <g className="pointer-events-none">
              <ellipse cx="170" cy="166" rx="18" ry="22" fill="#f43f5e" stroke="#9f1239" strokeWidth="2.5" />
              <path d="M170,162 C166,156 159,158 160,164 C161,170 170,175 170,175 C170,175 179,170 180,164 C181,158 174,156 170,162 Z" fill="#ffe4e6" />
            </g>
          )}

          {/* TAILS BEHIND BODY */}
          {petType === 'cat' || petType === 'tiger' ? (
            <motion.path
              d="M168,186 C206,184 214,142 192,138 C182,136 182,154 192,156"
              fill="none"
              stroke={colors.tail}
              strokeWidth="12"
              strokeLinecap="round"
              className="cursor-pointer"
              onClick={(e) => handleSvgPartClick(e, 'tail', 'paw')}
              animate={prefersReducedMotion ? undefined : { rotate: [-4, 7, -4] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ originX: '168px', originY: '186px' }}
            />
          ) : petType === 'dog' ? (
            <motion.path
              d="M168,182 Q204,162 198,136"
              fill="none"
              stroke={colors.tail}
              strokeWidth="12"
              strokeLinecap="round"
              className="cursor-pointer"
              onClick={(e) => handleSvgPartClick(e, 'tail', 'paw')}
              animate={prefersReducedMotion ? undefined : { rotate: [-12, 16, -12] }}
              transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
              style={{ originX: '168px', originY: '182px' }}
            />
          ) : petType === 'fox' ? (
            <motion.g
              className="cursor-pointer"
              onClick={(e) => handleSvgPartClick(e, 'tail', 'paw')}
              animate={prefersReducedMotion ? undefined : { rotate: [-5, 6, -5] }}
              transition={{ duration: 2.0, repeat: Infinity, ease: 'easeInOut' }}
              style={{ originX: '164px', originY: '182px' }}
            >
              <path d="M160,188 C210,192 222,134 188,128 C168,125 160,160 160,188 Z" fill={colors.tail} stroke={colors.stroke} strokeWidth="2.5" />
              <path d="M196,130 C210,136 208,154 192,158 C185,148 184,136 196,130 Z" fill="#ffffff" />
            </motion.g>
          ) : petType === 'pig' ? (
            <path d="M168,180 C186,180 190,164 180,162 C172,160 174,174 186,174 C196,174 202,162 196,156" fill="none" stroke={partColors?.tail || colors.stroke} strokeWidth="4" strokeLinecap="round" className="cursor-pointer" onClick={(e) => handleSvgPartClick(e, 'tail', 'paw')} />
          ) : isAquatic ? (
            <motion.path
              d="M165,184 C196,188 214,170 218,150 C202,156 196,166 196,170 C206,174 212,184 214,196 C198,194 182,188 165,184 Z"
              fill={colors.tail}
              stroke={colors.stroke}
              strokeWidth="2.5"
              className="cursor-pointer"
              onClick={(e) => handleSvgPartClick(e, 'tail', 'paw')}
              animate={prefersReducedMotion ? undefined : { rotate: [-6, 6, -6] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ originX: '165px', originY: '184px' }}
            />
          ) : petType === 'snake' ? (
            <path
              d="M158,194 C202,202 216,172 192,160 C176,152 178,136 194,134"
              fill="none"
              stroke={colors.tail}
              strokeWidth="16"
              strokeLinecap="round"
              className="cursor-pointer"
              onClick={(e) => handleSvgPartClick(e, 'tail', 'paw')}
            />
          ) : petType === 'bee' ? (
            <g opacity="0.92" className="cursor-pointer" onClick={(e) => handleSvgPartClick(e, 'tail', 'paw')}>
              <ellipse cx="52" cy="136" rx="26" ry="15" transform="rotate(-24 52 136)" fill={partColors?.tail || '#e0f2fe'} stroke="#38bdf8" strokeWidth="2.5" />
              <ellipse cx="188" cy="136" rx="26" ry="15" transform="rotate(24 188 136)" fill={partColors?.tail || '#e0f2fe'} stroke="#38bdf8" strokeWidth="2.5" />
            </g>
          ) : null}

          {/* SPECIAL BEHIND-HEAD ELEMENTS: LION MANE / HEDGEHOG SPINES / TURTLE SHELL */}
          {petType === 'lion' && (
            <path
              d="M120,30 C138,24 152,36 164,44 C180,48 188,64 186,82 C196,98 188,118 176,128 C178,144 162,156 144,152 C132,162 108,162 96,152 C78,156 62,144 64,128 C52,118 44,98 54,82 C52,64 60,48 76,44 C88,36 102,24 120,30 Z"
              fill="#b45309"
              stroke="#78350f"
              strokeWidth="3"
            />
          )}

          {petType === 'hedgehog' && (
            <path
              d="M120,34 L138,44 L158,38 L168,56 L186,58 L182,78 L194,94 L182,110 L186,130 L166,136 L74,136 L54,130 L58,110 L46,94 L58,78 L54,58 L72,56 L82,38 L102,44 Z"
              fill="#57534e"
              stroke="#292524"
              strokeWidth="2.5"
            />
          )}

          {petType === 'turtle' && (
            <ellipse
              cx="120"
              cy="170"
              rx="68"
              ry="48"
              fill="#854d0e"
              stroke="#422006"
              strokeWidth="3"
            />
          )}

          {/* EARS / HORNS / DORSAL FIN / ANTENNAE (Behind Head Circle) */}
          {(petType === 'cat' || petType === 'tiger') && (
            <g className="cursor-pointer">
              <path d="M56,92 L48,36 Q48,28 58,34 L96,62 Z" fill={colors.earOuter} stroke={colors.stroke} strokeWidth="2.5" strokeLinejoin="round" onClick={(e) => handleSvgPartClick(e, 'ears', 'head')} />
              <path d="M60,82 L55,46 L86,65 Z" fill={colors.earInner} onClick={(e) => handleSvgPartClick(e, 'earInner', 'head')} />
              <path d="M184,92 L192,36 Q192,28 182,34 L144,62 Z" fill={colors.earOuter} stroke={colors.stroke} strokeWidth="2.5" strokeLinejoin="round" onClick={(e) => handleSvgPartClick(e, 'ears', 'head')} />
              <path d="M180,82 L185,46 L154,65 Z" fill={colors.earInner} onClick={(e) => handleSvgPartClick(e, 'earInner', 'head')} />
            </g>
          )}

          {petType === 'fox' && (
            <g className="cursor-pointer">
              <path d="M52,92 L40,26 Q42,18 52,25 L98,60 Z" fill={colors.earOuter} stroke={colors.stroke} strokeWidth="2.5" strokeLinejoin="round" onClick={(e) => handleSvgPartClick(e, 'ears', 'head')} />
              <path d="M56,82 L49,38 L86,62 Z" fill={colors.earInner} onClick={(e) => handleSvgPartClick(e, 'earInner', 'head')} />
              <path d="M188,92 L200,26 Q198,18 188,25 L142,60 Z" fill={colors.earOuter} stroke={colors.stroke} strokeWidth="2.5" strokeLinejoin="round" onClick={(e) => handleSvgPartClick(e, 'ears', 'head')} />
              <path d="M184,82 L191,38 L154,62 Z" fill={colors.earInner} onClick={(e) => handleSvgPartClick(e, 'earInner', 'head')} />
            </g>
          )}

          {petType === 'bunny' && (
            <g className="cursor-pointer">
              <ellipse cx="82" cy="40" rx="16" ry="44" transform="rotate(-12 82 40)" fill={colors.earOuter} stroke={colors.stroke} strokeWidth="2.5" onClick={(e) => handleSvgPartClick(e, 'ears', 'head')} />
              <ellipse cx="83" cy="42" rx="9" ry="34" transform="rotate(-12 83 42)" fill={colors.earInner} onClick={(e) => handleSvgPartClick(e, 'earInner', 'head')} />
              <ellipse cx="158" cy="40" rx="16" ry="44" transform="rotate(12 158 40)" fill={colors.earOuter} stroke={colors.stroke} strokeWidth="2.5" onClick={(e) => handleSvgPartClick(e, 'ears', 'head')} />
              <ellipse cx="157" cy="42" rx="9" ry="34" transform="rotate(12 157 42)" fill={colors.earInner} onClick={(e) => handleSvgPartClick(e, 'earInner', 'head')} />
            </g>
          )}

          {petType === 'dog' && (
            <g className="cursor-pointer" onClick={(e) => handleSvgPartClick(e, 'ears', 'head')}>
              <ellipse cx="52" cy="108" rx="18" ry="38" transform="rotate(18 52 108)" fill={colors.earOuter} stroke={colors.stroke} strokeWidth="2.5" />
              <ellipse cx="188" cy="108" rx="18" ry="38" transform="rotate(-18 188 108)" fill={colors.earOuter} stroke={colors.stroke} strokeWidth="2.5" />
            </g>
          )}

          {petType === 'pig' && (
            <g className="cursor-pointer" onClick={(e) => handleSvgPartClick(e, 'ears', 'head')}>
              <path d="M56,74 C44,44 64,34 86,58 Z" fill={colors.earOuter} stroke={colors.stroke} strokeWidth="2.5" />
              <path d="M184,74 C196,44 176,34 154,58 Z" fill={colors.earOuter} stroke={colors.stroke} strokeWidth="2.5" />
            </g>
          )}

          {(petType === 'panda' || petType === 'bear' || petType === 'hamster' || petType === 'lion' || petType === 'hedgehog') && (
            <g className="cursor-pointer">
              <circle cx="68" cy="60" r="21" fill={colors.earOuter} stroke={colors.stroke} strokeWidth="2.5" onClick={(e) => handleSvgPartClick(e, 'ears', 'head')} />
              <circle cx="69" cy="61" r="11" fill={colors.earInner} onClick={(e) => handleSvgPartClick(e, 'earInner', 'head')} />
              <circle cx="172" cy="60" r="21" fill={colors.earOuter} stroke={colors.stroke} strokeWidth="2.5" onClick={(e) => handleSvgPartClick(e, 'ears', 'head')} />
              <circle cx="171" cy="61" r="11" fill={colors.earInner} onClick={(e) => handleSvgPartClick(e, 'earInner', 'head')} />
            </g>
          )}

          {(petType === 'koala' || petType === 'mouse') && (
            <g className="cursor-pointer">
              <circle cx="54" cy="70" r="29" fill={colors.earOuter} stroke={colors.stroke} strokeWidth="2.5" onClick={(e) => handleSvgPartClick(e, 'ears', 'head')} />
              <circle cx="56" cy="72" r="18" fill={colors.earInner} onClick={(e) => handleSvgPartClick(e, 'earInner', 'head')} />
              <circle cx="186" cy="70" r="29" fill={colors.earOuter} stroke={colors.stroke} strokeWidth="2.5" onClick={(e) => handleSvgPartClick(e, 'ears', 'head')} />
              <circle cx="184" cy="72" r="18" fill={colors.earInner} onClick={(e) => handleSvgPartClick(e, 'earInner', 'head')} />
            </g>
          )}

          {(petType === 'shark' || petType === 'dolphin') && (
            <g className="cursor-pointer" onClick={(e) => handleSvgPartClick(e, 'ears', 'head')}>
              <path
                d="M116,18 C134,28 138,48 136,60 L98,60 C100,42 104,26 116,18 Z"
                fill={colors.earOuter}
                stroke={colors.stroke}
                strokeWidth="2.5"
              />
            </g>
          )}

          {petType === 'whale' && (
            <g className="pointer-events-none">
              {/* Heart water spout */}
              <path d="M120,52 Q112,34 102,32 Q94,30 98,22 Q104,16 114,26" fill="none" stroke="#bae6fd" strokeWidth="4" strokeLinecap="round" />
              <path d="M120,52 Q128,34 138,32 Q146,30 142,22 Q136,16 126,26" fill="none" stroke="#bae6fd" strokeWidth="4" strokeLinecap="round" />
            </g>
          )}

          {petType === 'bee' && (
            <g className="cursor-pointer" onClick={(e) => handleSvgPartClick(e, 'ears', 'head')}>
              <path d="M100,52 Q88,26 76,30" stroke="#292524" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <circle cx="75" cy="30" r="6" fill={colors.earOuter} stroke="#713f12" strokeWidth="2" />
              <path d="M140,52 Q152,26 164,30" stroke="#292524" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <circle cx="165" cy="30" r="6" fill={colors.earOuter} stroke="#713f12" strokeWidth="2" />
            </g>
          )}

          {petType === 'frog' && (
            <g className="cursor-pointer" onClick={(e) => handleSvgPartClick(e, 'ears', 'head')}>
              <circle cx="88" cy="64" r="22" fill={colors.earOuter} stroke={colors.stroke} strokeWidth="2.5" />
              <circle cx="152" cy="64" r="22" fill={colors.earOuter} stroke={colors.stroke} strokeWidth="2.5" />
            </g>
          )}

          {petType === 'parrot' && (
            <g className="cursor-pointer" onClick={(e) => handleSvgPartClick(e, 'ears', 'head')}>
              <path d="M114,48 C104,26 118,22 124,42 C132,20 144,28 130,48 Z" fill={colors.earOuter} stroke="#ca8a04" strokeWidth="2" />
            </g>
          )}

          {/* MAIN PLUMP POU / TALKING TOM BODY */}
          <ellipse
            cx="120"
            cy="168"
            rx={isAquatic ? 60 : 54}
            ry={44}
            fill={`url(#bodyGrad-${petType})`}
            stroke={colors.stroke}
            strokeWidth="2.5"
            className="cursor-pointer"
            onClick={(e) => handleSvgPartClick(e, 'body', 'belly')}
          />

          {/* Soft Belly Patch */}
          <ellipse
            cx="120"
            cy="172"
            rx="36"
            ry="30"
            fill={colors.belly}
            opacity="0.92"
            className="cursor-pointer"
            onClick={(e) => handleSvgPartClick(e, 'belly', 'belly')}
          />

          {/* Bee / Tiger Belly Stripes */}
          {petType === 'bee' && (
            <g opacity="0.88" className="pointer-events-none">
              <path d="M72,162 Q120,174 168,162" stroke="#1c1917" strokeWidth="8" fill="none" strokeLinecap="round" />
              <path d="M76,182 Q120,194 164,182" stroke="#1c1917" strokeWidth="8" fill="none" strokeLinecap="round" />
            </g>
          )}

          {/* WARDROBE OUTFITS ON TORSO */}
          {outfitId === 'item-pet-hoodie' && (
            <g className="pointer-events-none">
              <path d="M70,150 Q120,162 170,150 L174,195 Q120,214 66,195 Z" fill={`url(#hoodieGrad-${petType})`} stroke="#fdf2f8" strokeWidth="2.5" />
              <path d="M96,178 L144,178 L138,198 Q120,203 102,198 Z" fill="#581c87" opacity="0.55" />
              <text x="120" y="172" textAnchor="middle" fill="#fce7f3" fontSize="12" fontWeight="bold">G♡S</text>
            </g>
          )}
          {outfitId === 'item-pet-dress' && (
            <g className="pointer-events-none">
              <path d="M76,148 Q120,160 164,148 L184,202 Q120,220 56,202 Z" fill="#ec4899" stroke="#fbcfe8" strokeWidth="2.5" />
              <path d="M72,165 Q120,176 168,165" fill="none" stroke="#fdf2f8" strokeWidth="3" />
            </g>
          )}
          {outfitId === 'item-pet-tuxedo' && (
            <g className="pointer-events-none">
              <path d="M72,150 Q120,162 168,150 L172,196 Q120,212 68,196 Z" fill="#0f172a" stroke="#475569" strokeWidth="2" />
              <polygon points="104,154 136,154 120,194" fill="#ffffff" />
              <circle cx="120" cy="176" r="2.5" fill="#fbbf24" />
              <circle cx="120" cy="188" r="2.5" fill="#fbbf24" />
            </g>
          )}
          {outfitId === 'item-pet-pajamas' && (
            <g className="pointer-events-none">
              <path d="M72,150 Q120,162 168,150 L172,196 Q120,212 68,196 Z" fill="#312e81" stroke="#818cf8" strokeWidth="2" />
              <polygon points="98,167 100,171 104,171 101,174 102,178 98,176 94,178 95,174 92,171 96,171" fill="#fef08a" />
              <polygon points="138,173 140,177 144,177 141,180 142,184 138,182 134,184 135,180 132,177 136,177" fill="#fef08a" />
              <polygon points="118,185 119.5,188.5 123,188.5 120.5,191 121.5,194.5 118,192.5 114.5,194.5 115.5,191 113,188.5 116.5,188.5" fill="#fef08a" />
            </g>
          )}
          {outfitId === 'item-pet-jacket' && (
            <g className="pointer-events-none">
              <path d="M70,150 Q120,162 170,150 L174,195 Q120,212 66,195 Z" fill="#6d28d9" stroke="#f472b6" strokeWidth="2.5" />
              <line x1="120" y1="158" x2="120" y2="202" stroke="#fbbf24" strokeWidth="2.5" />
            </g>
          )}
          {outfitId === 'item-pet-sweater' && (
            <g className="pointer-events-none">
              <path d="M70,150 Q120,162 170,150 L174,195 Q120,212 66,195 Z" fill="#fef3c7" stroke="#f43f5e" strokeWidth="2.5" />
              <text x="120" y="182" textAnchor="middle" fontSize="14" fill="#f43f5e">♡ ♡</text>
            </g>
          )}
          {outfitId === 'item-pet-tshirt' && (
            <g className="pointer-events-none">
              <path d="M72,150 Q120,162 168,150 L170,192 Q120,208 70,192 Z" fill="#f9a8d4" stroke="#ffffff" strokeWidth="2" />
              <text x="120" y="178" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#831843">12/06</text>
            </g>
          )}

          {/* SIDE ARMS / FLIPPERS / FINS */}
          {isAquatic ? (
            <g className="cursor-pointer" onClick={(e) => handleSvgPartClick(e, 'paws', 'paw')}>
              <ellipse cx="62" cy="170" rx="18" ry="10" transform="rotate(-25 62 170)" fill={colors.arms} stroke={colors.stroke} strokeWidth="2.2" />
              <ellipse cx="178" cy="170" rx="18" ry="10" transform="rotate(25 178 170)" fill={colors.arms} stroke={colors.stroke} strokeWidth="2.2" />
            </g>
          ) : petType === 'penguin' || petType === 'parrot' ? (
            <g className="cursor-pointer" onClick={(e) => handleSvgPartClick(e, 'paws', 'paw')}>
              <ellipse cx="64" cy="166" rx="14" ry="28" transform="rotate(20 64 166)" fill={colors.arms} stroke={colors.stroke} strokeWidth="2.2" />
              <ellipse cx="176" cy="166" rx="14" ry="28" transform="rotate(-20 176 166)" fill={colors.arms} stroke={colors.stroke} strokeWidth="2.2" />
            </g>
          ) : petType !== 'snake' ? (
            <g className="cursor-pointer" onClick={(e) => handleSvgPartClick(e, 'paws', 'paw')}>
              <ellipse cx="68" cy="165" rx="13" ry="20" transform="rotate(22 68 165)" fill={outfitId ? '#a855f7' : colors.arms} stroke={colors.stroke} strokeWidth="2.2" />
              <ellipse cx="172" cy="165" rx="13" ry="20" transform="rotate(-22 172 165)" fill={outfitId ? '#a855f7' : colors.arms} stroke={colors.stroke} strokeWidth="2.2" />
            </g>
          ) : null}

          {/* HEAD SPHERE WITH GLOSSY HIGHLIGHT */}
          <ellipse
            cx="120"
            cy="106"
            rx="62"
            ry="54"
            fill={`url(#headGrad-${petType})`}
            stroke={colors.stroke}
            strokeWidth="2.5"
            className="cursor-pointer"
            onClick={(e) => handleSvgPartClick(e, 'head', 'head')}
          />

          {/* Top Glossy Shine */}
          <ellipse
            cx="102"
            cy="72"
            rx="26"
            ry="11"
            transform="rotate(-14 102 72)"
            fill="#ffffff"
            opacity="0.34"
            className="pointer-events-none"
          />

          {/* Panda Eye Patches */}
          {petType === 'panda' && (
            <>
              <ellipse cx="94" cy="102" rx="17" ry="15" transform="rotate(-14 94 102)" fill="#0f172a" />
              <ellipse cx="146" cy="102" rx="17" ry="15" transform="rotate(14 146 102)" fill="#0f172a" />
            </>
          )}

          {/* Penguin / Parrot Face Mask */}
          {petType === 'penguin' && (
            <path
              d="M72,110 C72,78 96,70 120,86 C144,70 168,78 168,110 C168,142 146,154 120,154 C94,154 72,142 72,110 Z"
              fill="#ffffff"
              className="pointer-events-none"
            />
          )}

          {/* Cat / Tiger Forehead Tabby Stripes */}
          {(petType === 'cat' || petType === 'tiger') && (
            <g stroke={petType === 'cat' ? '#9a4a12' : '#7c2d12'} strokeWidth="3.5" strokeLinecap="round" opacity={petType === 'cat' ? 0.65 : 1} className="pointer-events-none">
              <path d="M120,56 L120,69" />
              <path d="M108,60 L112,71" />
              <path d="M132,60 L128,71" />
            </g>
          )}

          {/* DIRTY SMUDGES WHEN HYGIENE LOW */}
          {isDirty && (
            <g opacity="0.6" className="pointer-events-none">
              <ellipse cx="82" cy="128" rx="9" ry="5" fill="#78350f" />
              <circle cx="155" cy="124" r="6" fill="#78350f" />
              <ellipse cx="116" cy="182" rx="12" ry="6" fill="#78350f" />
            </g>
          )}

          {/* ROSY BLUSH CHEEKS */}
          <ellipse cx="78" cy="120" rx="11" ry="6.5" fill={colors.cheeks} opacity="0.68" className="cursor-pointer" onClick={(e) => handleSvgPartClick(e, 'cheeks', 'head')} />
          <ellipse cx="162" cy="120" rx="11" ry="6.5" fill={colors.cheeks} opacity="0.68" className="cursor-pointer" onClick={(e) => handleSvgPartClick(e, 'cheeks', 'head')} />

          {/* EXPRESSIVE POU / TALKING TOM EYES */}
          {isSleeping ? (
            <g className="pointer-events-none">
              <path d="M80,104 Q94,116 108,104" fill="none" stroke={petType === 'panda' ? '#f8fafc' : '#312e81'} strokeWidth="4" strokeLinecap="round" />
              <path d="M132,104 Q146,116 160,104" fill="none" stroke={petType === 'panda' ? '#f8fafc' : '#312e81'} strokeWidth="4" strokeLinecap="round" />
            </g>
          ) : isEating || isPlayMode ? (
            // Happy shiny Pou eyes with stars
            <g
              className={paintMode ? 'cursor-pointer' : 'pointer-events-none'}
              onClick={paintMode ? (e) => handleSvgPartClick(e, 'eyes', 'head') : undefined}
            >
              <circle cx="94" cy="100" r="13.5" fill="#ffffff" stroke={colors.stroke} strokeWidth="1.5" />
              <circle cx="94" cy="101" r="9.5" fill={irisColor} />
              <circle cx="94" cy="101" r="6" fill="#0f0720" />
              <circle cx="90" cy="96" r="3.4" fill="#ffffff" />
              <circle cx="98" cy="105" r="1.6" fill="#ffffff" />

              <circle cx="146" cy="100" r="13.5" fill="#ffffff" stroke={colors.stroke} strokeWidth="1.5" />
              <circle cx="146" cy="101" r="9.5" fill={irisColor} />
              <circle cx="146" cy="101" r="6" fill="#0f0720" />
              <circle cx="142" cy="96" r="3.4" fill="#ffffff" />
              <circle cx="150" cy="105" r="1.6" fill="#ffffff" />
            </g>
          ) : (
            <g
              className={paintMode ? 'cursor-pointer' : 'pointer-events-none'}
              onClick={paintMode ? (e) => handleSvgPartClick(e, 'eyes', 'head') : undefined}
            >
              {/* Left Eye */}
              <ellipse cx="94" cy="102" rx="13" ry={isTired ? 8 : 13.5} fill="#ffffff" stroke={colors.stroke} strokeWidth="1.5" />
              <circle cx="95" cy="103" r={isTired ? 6 : 9} fill={irisColor} />
              <circle cx="95" cy="103" r={isTired ? 4 : 5.5} fill="#0f0720" />
              <circle cx="91" cy="98" r="3.2" fill="#ffffff" />
              <circle cx="99" cy="106" r="1.4" fill="#ffffff" />

              {/* Right Eye */}
              <ellipse cx="146" cy="102" rx="13" ry={isTired ? 8 : 13.5} fill="#ffffff" stroke={colors.stroke} strokeWidth="1.5" />
              <circle cx="145" cy="103" r={isTired ? 6 : 9} fill={irisColor} />
              <circle cx="145" cy="103" r={isTired ? 4 : 5.5} fill="#0f0720" />
              <circle cx="141" cy="98" r="3.2" fill="#ffffff" />
              <circle cx="149" cy="106" r="1.4" fill="#ffffff" />

              {/* Sleepy eyelids if tired */}
              {isTired && (
                <>
                  <path d="M80,96 Q94,102 108,96" fill={colors.mid} stroke={colors.stroke} strokeWidth="2" />
                  <path d="M132,96 Q146,102 160,96" fill={colors.mid} stroke={colors.stroke} strokeWidth="2" />
                </>
              )}

              {/* Worried eyebrows if hungry/thirsty/sad */}
              {isSad && (
                <>
                  <path d="M82,84 Q92,82 102,88" stroke={eyeFill} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M158,84 Q148,82 138,88" stroke={eyeFill} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </>
              )}
            </g>
          )}

          {/* GLASSES (Aviator, Pink Heart, Gold Round) */}
          {glassesId && !isSleeping && (
            <g className="pointer-events-none">
              {glassesId === 'item-pet-heart-glasses' ? (
                <>
                  <circle cx="94" cy="100" r="15" fill="#ec4899" fillOpacity="0.45" stroke="#f472b6" strokeWidth="3" />
                  <circle cx="146" cy="100" r="15" fill="#ec4899" fillOpacity="0.45" stroke="#f472b6" strokeWidth="3" />
                  <line x1="109" y1="100" x2="131" y2="100" stroke="#f472b6" strokeWidth="3" />
                </>
              ) : glassesId === 'item-pet-round-glasses' ? (
                <>
                  <circle cx="94" cy="101" r="15" fill="#bae6fd" fillOpacity="0.22" stroke="#fbbf24" strokeWidth="2.8" />
                  <circle cx="146" cy="101" r="15" fill="#bae6fd" fillOpacity="0.22" stroke="#fbbf24" strokeWidth="2.8" />
                  <line x1="109" y1="101" x2="131" y2="101" stroke="#fbbf24" strokeWidth="2.5" />
                </>
              ) : (
                <>
                  <rect x="74" y="88" width="40" height="26" rx="8" fill="#090314" fillOpacity="0.92" stroke="#f59e0b" strokeWidth="2.5" />
                  <rect x="126" y="88" width="40" height="26" rx="8" fill="#090314" fillOpacity="0.92" stroke="#f59e0b" strokeWidth="2.5" />
                  <line x1="114" y1="98" x2="126" y2="98" stroke="#f59e0b" strokeWidth="3" />
                  <line x1="80" y1="95" x2="94" y2="108" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
                  <line x1="132" y1="95" x2="146" y2="108" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
                </>
              )}
            </g>
          )}

          {/* MUZZLE / SNOUT / BEAK / NOSE + MOUTH */}
          {petType === 'pig' ? (
            <g
              onClick={(e) => {
                if (paintMode && onPaintPart) {
                  e.stopPropagation();
                  onPaintPart('nose');
                } else {
                  onNoseClick(e);
                }
              }}
              className="cursor-pointer"
            >
              <ellipse cx="120" cy="122" rx="19" ry="13" fill={partColors?.nose || '#f472b6'} stroke="#be185d" strokeWidth="2" />
              <ellipse cx="113" cy="122" rx="3.5" ry="5" fill="#831843" />
              <ellipse cx="127" cy="122" rx="3.5" ry="5" fill="#831843" />
            </g>
          ) : isBeakSpecies ? (
            <g
              onClick={(e) => {
                if (paintMode && onPaintPart) {
                  e.stopPropagation();
                  onPaintPart('nose');
                } else {
                  onNoseClick(e);
                }
              }}
              className="cursor-pointer"
            >
              <polygon points="120,128 106,112 134,112" fill={partColors?.nose || '#f59e0b'} stroke="#b45309" strokeWidth="2" strokeLinejoin="round" />
            </g>
          ) : petType === 'koala' ? (
            <g
              onClick={(e) => {
                if (paintMode && onPaintPart) {
                  e.stopPropagation();
                  onPaintPart('nose');
                } else {
                  onNoseClick(e);
                }
              }}
              className="cursor-pointer"
            >
              <ellipse cx="120" cy="116" rx="11" ry="15" fill={colors.nose} />
            </g>
          ) : (
            <g
              onClick={(e) => {
                if (paintMode && onPaintPart) {
                  e.stopPropagation();
                  onPaintPart('nose');
                } else {
                  onNoseClick(e);
                }
              }}
              className="cursor-pointer"
            >
              {/* Soft muzzle pad for cats/dogs/bears/lions/bunnies */}
              {(petType === 'cat' || petType === 'dog' || petType === 'bear' || petType === 'lion' || petType === 'tiger' || petType === 'bunny') && (
                <ellipse cx="120" cy="125" rx="22" ry="14" fill="#fffaf3" fillOpacity="0.82" />
              )}
              <path d="M112,113 Q120,111 128,113 Q125,123 120,124 Q115,123 112,113 Z" fill={colors.nose} />
            </g>
          )}

          {/* MOUTH EXPRESSION */}
          {isEating ? (
            <ellipse cx="120" cy="134" rx="10" ry="8" fill="#9f1239" stroke="#4c0519" strokeWidth="2" />
          ) : isDrinking ? (
            <circle cx="120" cy="133" r="6" fill="#fb7185" stroke="#4c0519" strokeWidth="2" />
          ) : isSad ? (
            <path d="M110,136 Q120,128 130,136" fill="none" stroke="#4c0519" strokeWidth="2.8" strokeLinecap="round" />
          ) : (
            <g>
              <path d="M120,124 Q113,134 106,130 M120,124 Q127,134 134,130" fill="none" stroke="#4c0519" strokeWidth="2.8" strokeLinecap="round" />
              {isPlayMode && <path d="M115,131 Q120,141 125,131 Z" fill="#fb7185" />}
            </g>
          )}

          {/* Snake Forked Tongue */}
          {petType === 'snake' && !isSleeping && (
            <motion.path
              d="M120,132 L120,148 L114,155 M120,148 L126,155"
              stroke="#ef4444"
              strokeWidth="2.6"
              strokeLinecap="round"
              animate={prefersReducedMotion ? undefined : { scaleY: [0.8, 1.25, 0.8] }}
              transition={{ duration: 0.7, repeat: Infinity }}
              style={{ originX: '120px', originY: '132px' }}
            />
          )}

          {/* WHISKERS */}
          {(petType === 'cat' || petType === 'bunny' || petType === 'mouse' || petType === 'hamster' || petType === 'tiger') && (
            <g stroke={colors.stroke} strokeWidth="2" strokeLinecap="round" opacity="0.7" className="pointer-events-none">
              <line x1="66" y1="115" x2="36" y2="110" />
              <line x1="66" y1="124" x2="36" y2="128" />
              <line x1="174" y1="115" x2="204" y2="110" />
              <line x1="174" y1="124" x2="204" y2="128" />
            </g>
          )}

          {/* BOTTOM PAWS (Touch target) */}
          {!isLegless && (
            <g className="cursor-pointer" onClick={(e) => handleSvgPartClick(e, 'paws', 'paw')}>
              <ellipse cx="88" cy="208" rx="17" ry="12" fill={colors.paws} stroke={colors.stroke} strokeWidth="2.5" />
              <circle cx="83" cy="208" r="3" fill={colors.cheeks} opacity="0.55" />
              <circle cx="93" cy="208" r="3" fill={colors.cheeks} opacity="0.55" />
              <ellipse cx="152" cy="208" rx="17" ry="12" fill={colors.paws} stroke={colors.stroke} strokeWidth="2.5" />
              <circle cx="147" cy="208" r="3" fill={colors.cheeks} opacity="0.55" />
              <circle cx="157" cy="208" r="3" fill={colors.cheeks} opacity="0.55" />
            </g>
          )}

          {/* NECK COLLARS & TIES */}
          {collarId === 'item-cat-bowtie' && (
            <g className="pointer-events-none">
              <polygon points="120,152 100,142 100,162" fill="#9333ea" stroke="#fdf4ff" strokeWidth="1.5" />
              <polygon points="120,152 140,142 140,162" fill="#9333ea" stroke="#fdf4ff" strokeWidth="1.5" />
              <circle cx="120" cy="152" r="5" fill="#ec4899" stroke="#fdf4ff" strokeWidth="1.5" />
            </g>
          )}
          {collarId === 'item-pet-necktie' && (
            <g className="pointer-events-none">
              <polygon points="113,150 127,150 123,160 117,160" fill="#be123c" stroke="#ffe4e6" strokeWidth="1.2" />
              <polygon points="117,160 123,160 128,192 120,202 112,192" fill="#e11d48" stroke="#ffe4e6" strokeWidth="1.2" />
            </g>
          )}
          {collarId === 'item-pet-heart-collar' && (
            <g className="pointer-events-none">
              <path d="M84,148 Q120,162 156,148" fill="none" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" />
              <circle cx="120" cy="160" r="6" fill="#fbbf24" stroke="#92400e" strokeWidth="1.4" />
            </g>
          )}
          {collarId === 'item-pet-scarf' && (
            <g className="pointer-events-none">
              <path d="M80,148 Q120,164 160,148" fill="none" stroke="#f472b6" strokeWidth="12" strokeLinecap="round" />
              <rect x="132" y="152" width="12" height="30" rx="5" fill="#ec4899" stroke="#fbcfe8" strokeWidth="1.5" />
            </g>
          )}
          {collarId === 'item-pet-pearls' && (
            <g className="pointer-events-none">
              {[86, 98, 110, 120, 130, 142, 154].map((px, i) => (
                <circle key={i} cx={px} cy={150 + Math.sin((i / 6) * Math.PI) * 8} r="4.5" fill="#fffbeb" stroke="#e2e8f0" strokeWidth="1" />
              ))}
            </g>
          )}

          {/* HEADPHONES ACCESSORY */}
          {showHeadphones && (
            <g className="pointer-events-none">
              <path d="M60,98 C60,42 180,42 180,98" fill="none" stroke="#a855f7" strokeWidth="7" strokeLinecap="round" />
              <rect x="52" y="88" width="14" height="28" rx="6" fill="#ec4899" stroke="#fbcfe8" strokeWidth="2" />
              <rect x="174" y="88" width="14" height="28" rx="6" fill="#ec4899" stroke="#fbcfe8" strokeWidth="2" />
            </g>
          )}

          {/* HATS */}
          {hatId === 'item-cat-ribbon' && (
            <g className="pointer-events-none">
              <polygon points="154,66 138,54 146,74" fill="#ec4899" stroke="#fff1f2" strokeWidth="1.5" />
              <polygon points="154,66 172,62 162,78" fill="#ec4899" stroke="#fff1f2" strokeWidth="1.5" />
              <circle cx="154" cy="66" r="4.5" fill="#fbcfe8" stroke="#db2777" strokeWidth="1.5" />
            </g>
          )}

          {hatId === 'item-pet-flower-crown' && (
            <g className="pointer-events-none">
              <path d="M74,64 Q120,44 166,64" fill="none" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" />
              {[
                { x: 82, y: 58, c: '#f472b6' },
                { x: 100, y: 52, c: '#fde047' },
                { x: 120, y: 49, c: '#fb7185' },
                { x: 140, y: 52, c: '#c084fc' },
                { x: 158, y: 58, c: '#f472b6' },
              ].map((fl, i) => (
                <g key={i}>
                  <circle cx={fl.x} cy={fl.y} r="7" fill={fl.c} stroke="#ffffff" strokeWidth="1.2" />
                  <circle cx={fl.x} cy={fl.y} r="2.5" fill="#fef08a" />
                </g>
              ))}
            </g>
          )}

          {hatId === 'item-cat-crown' && (
            <motion.g
              animate={prefersReducedMotion ? undefined : { y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none"
            >
              <path d="M94,54 L98,28 L110,42 L120,22 L130,42 L142,28 L146,54 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="2.5" strokeLinejoin="round" />
              <circle cx="120" cy="40" r="3.5" fill="#ec4899" />
              <circle cx="105" cy="45" r="2.5" fill="#38bdf8" />
              <circle cx="135" cy="45" r="2.5" fill="#38bdf8" />
            </motion.g>
          )}

          {hatId === 'item-pet-cap' && (
            <g className="pointer-events-none">
              <path d="M78,64 C84,34 156,34 162,64 Z" fill="#9333ea" stroke="#e9d5ff" strokeWidth="2" />
              <path d="M116,58 L178,64 Q162,72 116,66 Z" fill="#ec4899" stroke="#fbcfe8" strokeWidth="1.5" />
            </g>
          )}

          {hatId === 'item-pet-beret' && (
            <g className="pointer-events-none">
              <ellipse cx="124" cy="52" rx="44" ry="15" transform="rotate(-10 124 52)" fill="#e11d48" stroke="#fecdd3" strokeWidth="2" />
              <line x1="126" y1="36" x2="128" y2="30" stroke="#881337" strokeWidth="3" strokeLinecap="round" />
            </g>
          )}

          {hatId === 'item-pet-party-hat' && (
            <g className="pointer-events-none">
              <polygon points="100,56 120,16 140,56" fill="#ec4899" stroke="#fbcfe8" strokeWidth="2" />
              <circle cx="120" cy="14" r="6" fill="#fde047" />
            </g>
          )}

          {hatId === 'item-pet-cowboy-hat' && (
            <g className="pointer-events-none">
              <path d="M68,58 Q120,66 172,58 Q154,50 144,52 L138,32 Q120,28 102,32 L96,52 Q86,50 68,58 Z" fill="#78350f" stroke="#d97706" strokeWidth="2" />
              <line x1="98" y1="48" x2="142" y2="48" stroke="#ec4899" strokeWidth="3.5" />
            </g>
          )}

          {hatId === 'item-pet-beanie' && (
            <g className="pointer-events-none">
              <path d="M78,62 C82,30 158,30 162,62 Z" fill="#f43f5e" stroke="#ffe4e6" strokeWidth="2" />
              <rect x="76" y="54" width="88" height="11" rx="5" fill="#be123c" />
              <circle cx="120" cy="24" r="8" fill="#fff1f2" />
            </g>
          )}

          {hatId === 'item-pet-wizard-hat' && (
            <g className="pointer-events-none">
              <ellipse cx="120" cy="56" rx="52" ry="9" fill="#4c1d95" stroke="#c084fc" strokeWidth="2" />
              <polygon points="94,54 126,12 146,54" fill="#5b21b6" stroke="#c084fc" strokeWidth="2" />
              <polygon points="122,31 124,36 129,36 125,39 126.5,44 122,41 117.5,44 119,39 115,36 120,36" fill="#facc15" />
            </g>
          )}

          {/* SOAP FOAM OVERLAY WHILE BATHING */}
          {isBathing && (
            <g className="pointer-events-none">
              {[
                { cx: 88, cy: 86, r: 11 },
                { cx: 102, cy: 78, r: 14 },
                { cx: 118, cy: 82, r: 10 },
                { cx: 148, cy: 138, r: 12 },
                { cx: 92, cy: 158, r: 13 },
                { cx: 122, cy: 168, r: 15 },
                { cx: 138, cy: 160, r: 11 },
              ].map((b, idx) => (
                <circle
                  key={idx}
                  cx={b.cx}
                  cy={b.cy}
                  r={b.r}
                  fill={`url(#soapBubble-${petType})`}
                  stroke="#e0f2fe"
                  strokeWidth="1.5"
                />
              ))}
            </g>
          )}
        </svg>
      </motion.div>
    </div>
  );
};
