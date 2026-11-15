import React from 'react';
import { motion } from 'motion/react';
import { KittenState, PetType } from '../../types';

interface PetCharacterProps {
  kitten: KittenState;
  petType: PetType;
  onPetPart: (part: 'head' | 'belly' | 'paw') => void;
  onNoseClick: (e: React.MouseEvent) => void;
  hasCrown?: boolean;
  hasRibbon?: boolean;
  hasSunglasses?: boolean;
  hasBowtie?: boolean;
  hasAngelWings?: boolean;
}

export const PetCharacter: React.FC<PetCharacterProps> = ({
  kitten,
  petType,
  onPetPart,
  onNoseClick,
  hasCrown,
  hasRibbon,
  hasSunglasses,
  hasBowtie,
  hasAngelWings,
}) => {
  const isSleeping = kitten.isSleeping;
  const isPlayMode = kitten.isPlayMode;

  // Species theme palette
  const getColors = () => {
    switch (petType) {
      case 'dog':
        return {
          bodyGrad0: isSleeping ? '#e2e8f0' : '#fef3c7',
          bodyGrad1: isSleeping ? '#cbd5e1' : '#fde68a',
          bodyGrad2: isSleeping ? '#94a3b8' : '#f59e0b',
          stroke: '#d97706',
          ear: '#b45309',
          earInner: '#fcd34d',
          belly: '#fffbeb',
          cheeks: '#fbbf24',
          nose: '#451a03',
        };
      case 'bunny':
        return {
          bodyGrad0: isSleeping ? '#f1f5f9' : '#fdf2f8',
          bodyGrad1: isSleeping ? '#e2e8f0' : '#fce7f3',
          bodyGrad2: isSleeping ? '#cbd5e1' : '#f472b6',
          stroke: '#ec4899',
          ear: '#f472b6',
          earInner: '#fbcfe8',
          belly: '#ffffff',
          cheeks: '#f43f5e',
          nose: '#e11d48',
        };
      case 'fox':
        return {
          bodyGrad0: isSleeping ? '#e2e8f0' : '#ffedd5',
          bodyGrad1: isSleeping ? '#cbd5e1' : '#fed7aa',
          bodyGrad2: isSleeping ? '#94a3b8' : '#ea580c',
          stroke: '#c2410c',
          ear: '#9a3412',
          earInner: '#fed7aa',
          belly: '#fff7ed',
          cheeks: '#fb923c',
          nose: '#292524',
        };
      case 'panda':
        return {
          bodyGrad0: '#ffffff',
          bodyGrad1: '#f8fafc',
          bodyGrad2: '#e2e8f0',
          stroke: '#0f172a',
          ear: '#0f172a',
          earInner: '#334155',
          belly: '#f8fafc',
          cheeks: '#f472b6',
          nose: '#0f172a',
        };
      case 'koala':
        return {
          bodyGrad0: isSleeping ? '#e2e8f0' : '#f1f5f9',
          bodyGrad1: isSleeping ? '#cbd5e1' : '#e2e8f0',
          bodyGrad2: isSleeping ? '#94a3b8' : '#94a3b8',
          stroke: '#64748b',
          ear: '#475569',
          earInner: '#cbd5e1',
          belly: '#ffffff',
          cheeks: '#fb7185',
          nose: '#334155',
        };
      case 'penguin':
        return {
          bodyGrad0: isSleeping ? '#1e293b' : '#0f172a',
          bodyGrad1: isSleeping ? '#334155' : '#1e293b',
          bodyGrad2: isSleeping ? '#475569' : '#0f172a',
          stroke: '#020617',
          ear: '#0f172a',
          earInner: '#38bdf8',
          belly: '#ffffff',
          cheeks: '#f43f5e',
          nose: '#f59e0b',
        };
      case 'bear':
        return {
          bodyGrad0: isSleeping ? '#e2e8f0' : '#fef3c7',
          bodyGrad1: isSleeping ? '#d7a26c' : '#b45309',
          bodyGrad2: isSleeping ? '#8c5022' : '#78350f',
          stroke: '#451a03',
          ear: '#78350f',
          earInner: '#d97706',
          belly: '#fef3c7',
          cheeks: '#f59e0b',
          nose: '#292524',
        };
      case 'hamster':
        return {
          bodyGrad0: isSleeping ? '#f1f5f9' : '#fff7ed',
          bodyGrad1: isSleeping ? '#e2e8f0' : '#fed7aa',
          bodyGrad2: isSleeping ? '#cbd5e1' : '#f97316',
          stroke: '#c2410c',
          ear: '#ea580c',
          earInner: '#ffedd5',
          belly: '#ffffff',
          cheeks: '#fb7185',
          nose: '#be123c',
        };
      case 'pig':
        return {
          bodyGrad0: isSleeping ? '#f1f5f9' : '#fdf2f8',
          bodyGrad1: isSleeping ? '#e2e8f0' : '#fce7f3',
          bodyGrad2: isSleeping ? '#cbd5e1' : '#f472b6',
          stroke: '#db2777',
          ear: '#f472b6',
          earInner: '#fda4af',
          belly: '#fff1f2',
          cheeks: '#fb7185',
          nose: '#be185d',
        };
      case 'mouse':
        return {
          bodyGrad0: isSleeping ? '#f8fafc' : '#f1f5f9',
          bodyGrad1: isSleeping ? '#e2e8f0' : '#cbd5e1',
          bodyGrad2: isSleeping ? '#94a3b8' : '#64748b',
          stroke: '#475569',
          ear: '#94a3b8',
          earInner: '#fbcfe8',
          belly: '#ffffff',
          cheeks: '#fb7185',
          nose: '#e11d48',
        };
      case 'snake':
        return {
          bodyGrad0: isSleeping ? '#f0fdf4' : '#dcfce7',
          bodyGrad1: isSleeping ? '#bbf7d0' : '#86efac',
          bodyGrad2: isSleeping ? '#4ade80' : '#10b981',
          stroke: '#059669',
          ear: '#047857',
          earInner: '#a7f3d0',
          belly: '#ecfdf5',
          cheeks: '#34d399',
          nose: '#dc2626',
        };
      case 'shark':
        return {
          bodyGrad0: isSleeping ? '#f0f9ff' : '#e0f2fe',
          bodyGrad1: isSleeping ? '#bae6fd' : '#7dd3fc',
          bodyGrad2: isSleeping ? '#38bdf8' : '#0284c7',
          stroke: '#0369a1',
          ear: '#0284c7',
          earInner: '#bae6fd',
          belly: '#ffffff',
          cheeks: '#38bdf8',
          nose: '#075985',
        };
      case 'bee':
        return {
          bodyGrad0: isSleeping ? '#fefce8' : '#fef9c3',
          bodyGrad1: isSleeping ? '#fef08a' : '#fde047',
          bodyGrad2: isSleeping ? '#eab308' : '#ca8a04',
          stroke: '#854d0e',
          ear: '#1c1917',
          earInner: '#fde047',
          belly: '#fffbeb',
          cheeks: '#f59e0b',
          nose: '#1c1917',
        };
      case 'cat':
      default:
        return {
          bodyGrad0: isSleeping ? '#e0e7ff' : '#fdf2f8',
          bodyGrad1: isSleeping ? '#c7d2fe' : '#fbcfe8',
          bodyGrad2: isSleeping ? '#818cf8' : '#f472b6',
          stroke: '#f472b6',
          ear: '#f472b6',
          earInner: '#fda4af',
          belly: '#fff1f2',
          cheeks: '#fb7185',
          nose: '#e11d48',
        };
    }
  };

  const colors = getColors();

  return (
    <div className="relative w-64 h-64 my-1 flex items-center justify-center select-none">
      {/* Sleeping ZZZ effect */}
      {isSleeping && (
        <div className="absolute -top-2 right-10 z-30 flex flex-col items-center pointer-events-none">
          <motion.span
            animate={{ y: [-4, -26], opacity: [0, 1, 0], scale: [0.8, 1.25] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-indigo-300 font-black text-xl drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]"
          >
            Zzz...
          </motion.span>
        </div>
      )}

      {/* Accessories Rendering */}
      {(hasCrown || kitten.equippedHat === 'item-cat-crown') && (
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1 z-20 text-4xl drop-shadow-[0_0_15px_rgba(251,191,36,0.9)] pointer-events-none"
        >
          👑
        </motion.div>
      )}

      {(hasRibbon || kitten.equippedAccessory === 'item-cat-ribbon') && (
        <div className="absolute bottom-11 z-20 text-3xl drop-shadow-md pointer-events-none">
          🎀
        </div>
      )}

      {(hasSunglasses || kitten.equippedHat === 'item-cat-sunglasses') && (
        <div className="absolute top-20 z-20 text-3xl drop-shadow-lg pointer-events-none">
          🕶️
        </div>
      )}

      {(hasBowtie || kitten.equippedAccessory === 'item-cat-bowtie') && (
        <div className="absolute bottom-12 z-20 text-2xl drop-shadow-md pointer-events-none">
          👔
        </div>
      )}

      {(hasAngelWings || kitten.equippedOutfit === 'item-cat-angel-wings') && (
        <>
          <motion.div
            animate={{ rotate: [-14, -8, -14], scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -left-4 top-24 z-10 text-4xl transform pointer-events-none"
          >
            🪽
          </motion.div>
          <motion.div
            animate={{ rotate: [14, 8, 14], scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -right-4 top-24 z-10 text-4xl transform scale-x-[-1] pointer-events-none"
          >
            🪽
          </motion.div>
        </>
      )}

      {/* Main Interactive Character Motion Rig */}
      <motion.div
        animate={
          isSleeping
            ? { scale: [0.98, 1, 0.98], y: [0, 2, 0] }
            : isPlayMode
            ? { y: [0, -12, 0], rotate: [-2.5, 2.5, -2.5] }
            : { y: [0, -4, 0] }
        }
        transition={{ duration: isSleeping ? 3 : 1.2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-full h-full cursor-pointer flex items-center justify-center"
      >
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_25px_rgba(244,114,182,0.4)]">
          <defs>
            <radialGradient id={`petBodyGrad-${petType}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={colors.bodyGrad0} />
              <stop offset="65%" stopColor={colors.bodyGrad1} />
              <stop offset="100%" stopColor={colors.bodyGrad2} />
            </radialGradient>
          </defs>

          {/* Render Species-Specific Ears / Headgear */}
          {petType === 'cat' && (
            <>
              <polygon
                points="45,40 70,85 30,85"
                fill={colors.ear}
                stroke={colors.stroke}
                strokeWidth="2"
                onClick={() => onPetPart('head')}
              />
              <polygon points="50,52 65,82 38,82" fill={colors.earInner} />
              <polygon
                points="155,40 130,85 170,85"
                fill={colors.ear}
                stroke={colors.stroke}
                strokeWidth="2"
                onClick={() => onPetPart('head')}
              />
              <polygon points="150,52 135,82 162,82" fill={colors.earInner} />
            </>
          )}

          {petType === 'dog' && (
            <>
              {/* Floppy Dog Ears */}
              <ellipse
                cx="42"
                cy="92"
                rx="18"
                ry="36"
                transform="rotate(22 42 92)"
                fill={colors.ear}
                stroke={colors.stroke}
                strokeWidth="2"
                onClick={() => onPetPart('head')}
              />
              <ellipse
                cx="158"
                cy="92"
                rx="18"
                ry="36"
                transform="rotate(-22 158 92)"
                fill={colors.ear}
                stroke={colors.stroke}
                strokeWidth="2"
                onClick={() => onPetPart('head')}
              />
            </>
          )}

          {petType === 'bunny' && (
            <>
              {/* Long Bunny Ears */}
              <ellipse
                cx="65"
                cy="38"
                rx="15"
                ry="44"
                transform="rotate(-10 65 38)"
                fill={colors.ear}
                stroke={colors.stroke}
                strokeWidth="2"
                onClick={() => onPetPart('head')}
              />
              <ellipse
                cx="65"
                cy="38"
                rx="9"
                ry="36"
                transform="rotate(-10 65 38)"
                fill={colors.earInner}
              />
              <ellipse
                cx="135"
                cy="38"
                rx="15"
                ry="44"
                transform="rotate(10 135 38)"
                fill={colors.ear}
                stroke={colors.stroke}
                strokeWidth="2"
                onClick={() => onPetPart('head')}
              />
              <ellipse
                cx="135"
                cy="38"
                rx="9"
                ry="36"
                transform="rotate(10 135 38)"
                fill={colors.earInner}
              />
            </>
          )}

          {petType === 'fox' && (
            <>
              {/* Sharp Fox Ears */}
              <polygon
                points="42,32 72,82 24,82"
                fill={colors.ear}
                stroke={colors.stroke}
                strokeWidth="2"
                onClick={() => onPetPart('head')}
              />
              <polygon points="46,48 66,78 32,78" fill={colors.earInner} />
              <polygon
                points="158,32 128,82 176,82"
                fill={colors.ear}
                stroke={colors.stroke}
                strokeWidth="2"
                onClick={() => onPetPart('head')}
              />
              <polygon points="154,48 134,78 168,78" fill={colors.earInner} />
            </>
          )}

          {(petType === 'panda' || petType === 'bear' || petType === 'koala') && (
            <>
              {/* Round Ears */}
              <circle
                cx="52"
                cy="60"
                r="22"
                fill={colors.ear}
                stroke={colors.stroke}
                strokeWidth="2"
                onClick={() => onPetPart('head')}
              />
              <circle cx="54" cy="62" r="13" fill={colors.earInner} />
              <circle
                cx="148"
                cy="60"
                r="22"
                fill={colors.ear}
                stroke={colors.stroke}
                strokeWidth="2"
                onClick={() => onPetPart('head')}
              />
              <circle cx="146" cy="62" r="13" fill={colors.earInner} />
            </>
          )}

          {petType === 'penguin' && (
            <>
              {/* Penguin Tuft */}
              <path d="M96,44 Q100,32 104,44" stroke="#f59e0b" strokeWidth="4" fill="none" strokeLinecap="round" />
            </>
          )}

          {petType === 'pig' && (
            <>
              {/* Cute Folded Pig Ears */}
              <polygon
                points="42,50 72,72 48,88"
                fill={colors.ear}
                stroke={colors.stroke}
                strokeWidth="2"
                onClick={() => onPetPart('head')}
              />
              <polygon points="46,56 68,72 52,82" fill={colors.earInner} />
              <polygon
                points="158,50 128,72 152,88"
                fill={colors.ear}
                stroke={colors.stroke}
                strokeWidth="2"
                onClick={() => onPetPart('head')}
              />
              <polygon points="154,56 132,72 148,82" fill={colors.earInner} />
            </>
          )}

          {petType === 'mouse' && (
            <>
              {/* Large Round Mouse Ears */}
              <circle
                cx="46"
                cy="54"
                r="28"
                fill={colors.ear}
                stroke={colors.stroke}
                strokeWidth="2"
                onClick={() => onPetPart('head')}
              />
              <circle cx="48" cy="56" r="18" fill={colors.earInner} />
              <circle
                cx="154"
                cy="54"
                r="28"
                fill={colors.ear}
                stroke={colors.stroke}
                strokeWidth="2"
                onClick={() => onPetPart('head')}
              />
              <circle cx="152" cy="56" r="18" fill={colors.earInner} />
            </>
          )}

          {petType === 'shark' && (
            <>
              {/* Shark Dorsal Fin on Head & Pectoral Fins */}
              <polygon
                points="100,16 118,52 82,52"
                fill={colors.ear}
                stroke={colors.stroke}
                strokeWidth="2"
                onClick={() => onPetPart('head')}
              />
              <polygon points="26,145 48,126 50,158" fill={colors.ear} stroke={colors.stroke} strokeWidth="1.5" />
              <polygon points="174,145 152,126 150,158" fill={colors.ear} stroke={colors.stroke} strokeWidth="1.5" />
            </>
          )}

          {petType === 'bee' && (
            <>
              {/* Cute Bee Antennae with Glow */}
              <path d="M 85,50 Q 75,28 66,32" stroke="#1c1917" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <circle cx="66" cy="32" r="5" fill="#facc15" />
              <path d="M 115,50 Q 125,28 134,32" stroke="#1c1917" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <circle cx="134" cy="32" r="5" fill="#facc15" />
              {/* Fluttering Wings */}
              <ellipse cx="44" cy="115" rx="20" ry="11" transform="rotate(-25 44 115)" fill="#e0f2fe" opacity="0.85" stroke="#38bdf8" strokeWidth="1.5" />
              <ellipse cx="156" cy="115" rx="20" ry="11" transform="rotate(25 156 115)" fill="#e0f2fe" opacity="0.85" stroke="#38bdf8" strokeWidth="1.5" />
            </>
          )}

          {/* Pet Body */}
          <ellipse
            cx="100"
            cy="140"
            rx="62"
            ry="46"
            fill={`url(#petBodyGrad-${petType})`}
            stroke={colors.stroke}
            strokeWidth="1.5"
            onClick={() => onPetPart('belly')}
          />

          {/* White Belly Patch */}
          <ellipse
            cx="100"
            cy="145"
            rx="38"
            ry="28"
            fill={colors.belly}
            opacity="0.85"
            onClick={() => onPetPart('belly')}
          />

          {/* Panda Eye Patches */}
          {petType === 'panda' && (
            <>
              <ellipse cx="78" cy="94" rx="16" ry="14" transform="rotate(-15 78 94)" fill="#0f172a" />
              <ellipse cx="122" cy="94" rx="16" ry="14" transform="rotate(15 122 94)" fill="#0f172a" />
            </>
          )}

          {/* Pet Head */}
          <circle
            cx="100"
            cy="95"
            r="52"
            fill={`url(#petBodyGrad-${petType})`}
            stroke={colors.stroke}
            strokeWidth="1.5"
            onClick={() => onPetPart('head')}
          />

          {/* Rosy Cheeks */}
          <ellipse cx="66" cy="108" rx="9" ry="5" fill={colors.cheeks} opacity="0.65" />
          <ellipse cx="134" cy="108" rx="9" ry="5" fill={colors.cheeks} opacity="0.65" />

          {/* Eyes with Emotion & Blink */}
          {isSleeping ? (
            <>
              <path d="M70,95 Q82,105 94,95" fill="none" stroke="#312e81" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M106,95 Q118,105 130,95" fill="none" stroke="#312e81" strokeWidth="3.5" strokeLinecap="round" />
            </>
          ) : isPlayMode ? (
            <>
              <circle cx="82" cy="92" r="7.5" fill={petType === 'panda' ? '#ffffff' : '#3b0764'} />
              <circle cx="80" cy="90" r="2.5" fill={petType === 'panda' ? '#0f172a' : '#ffffff'} />
              <circle cx="118" cy="92" r="7.5" fill={petType === 'panda' ? '#ffffff' : '#3b0764'} />
              <circle cx="116" cy="90" r="2.5" fill={petType === 'panda' ? '#0f172a' : '#ffffff'} />
            </>
          ) : (
            <>
              <path d="M72,92 Q82,82 92,92" fill="none" stroke={petType === 'panda' ? '#ffffff' : '#4c0519'} strokeWidth="3.5" strokeLinecap="round" />
              <path d="M108,92 Q118,82 128,92" fill="none" stroke={petType === 'panda' ? '#ffffff' : '#4c0519'} strokeWidth="3.5" strokeLinecap="round" />
            </>
          )}

          {/* Species-Specific Nose & Mouth */}
          {petType === 'pig' ? (
            <g onClick={onNoseClick} className="cursor-pointer">
              <ellipse cx="100" cy="106" rx="16" ry="11" fill="#f472b6" stroke="#db2777" strokeWidth="1.5" />
              <ellipse cx="94" cy="106" rx="3" ry="4" fill="#831843" />
              <ellipse cx="106" cy="106" rx="3" ry="4" fill="#831843" />
            </g>
          ) : petType === 'snake' ? (
            <g onClick={onNoseClick} className="cursor-pointer">
              <circle cx="100" cy="102" r="3.5" fill={colors.nose} />
              {/* Flicking forked tongue */}
              <motion.path
                d="M 100,108 L 100,122 L 95,128 M 100,122 L 105,128"
                stroke="#ef4444"
                strokeWidth="2.2"
                strokeLinecap="round"
                animate={{ scaleY: [0.8, 1.3, 0.8] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            </g>
          ) : (
            <>
              {/* Standard Nose (Touch reactive + Easter Egg) */}
              <polygon
                points="100,105 93,98 107,98"
                fill={colors.nose}
                onClick={onNoseClick}
                className="cursor-pointer hover:scale-125 transition-transform"
              />

              {/* Cute Mouth */}
              <path
                d="M100,105 Q95,114 90,110 M100,105 Q105,114 110,110"
                fill="none"
                stroke="#4c0519"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </>
          )}

          {/* Bee Body Stripes */}
          {petType === 'bee' && (
            <g opacity="0.85">
              <path d="M 55,130 Q 100,140 145,130" stroke="#1c1917" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M 60,150 Q 100,160 140,150" stroke="#1c1917" strokeWidth="6" fill="none" strokeLinecap="round" />
            </g>
          )}

          {/* Whiskers (Cat, Bunny, Mouse) */}
          {(petType === 'cat' || petType === 'bunny' || petType === 'mouse') && (
            <>
              <line x1="45" y1="102" x2="18" y2="98" stroke={colors.stroke} strokeWidth="2" strokeLinecap="round" />
              <line x1="45" y1="110" x2="18" y2="115" stroke={colors.stroke} strokeWidth="2" strokeLinecap="round" />
              <line x1="155" y1="102" x2="182" y2="98" stroke={colors.stroke} strokeWidth="2" strokeLinecap="round" />
              <line x1="155" y1="110" x2="182" y2="115" stroke={colors.stroke} strokeWidth="2" strokeLinecap="round" />
            </>
          )}

          {/* Paws (Bottom touch zones) */}
          <ellipse
            cx="74"
            cy="172"
            rx="14"
            ry="10"
            fill={colors.belly}
            stroke={colors.stroke}
            strokeWidth="1.5"
            onClick={() => onPetPart('paw')}
          />
          <ellipse
            cx="126"
            cy="172"
            rx="14"
            ry="10"
            fill={colors.belly}
            stroke={colors.stroke}
            strokeWidth="1.5"
            onClick={() => onPetPart('paw')}
          />
        </svg>
      </motion.div>
    </div>
  );
};
