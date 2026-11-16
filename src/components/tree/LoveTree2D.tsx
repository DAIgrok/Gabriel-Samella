import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface LoveTree2DProps {
  level: number;
  isWatering?: boolean;
  isSunbathing?: boolean;
  isPruning?: boolean;
  hasSakuraTheme?: boolean;
  hasGoldenApples?: boolean;
  hasFairyLights?: boolean;
  hasSwing?: boolean;
  hasLanterns?: boolean;
  hasCrystals?: boolean;
  ribbons?: { id: string; title: string; color: string }[];
  creatures?: string[];
  harvestedFruits?: number[];
  onHarvestFruit?: (index: number) => void;
  onTreeTap?: () => void;
}

const FOLIAGE_CLOUD_PATH =
  'M -42,6 C -50,-10 -32,-26 -16,-22 C -8,-38 16,-38 24,-22 C 42,-26 52,-6 40,10 C 46,24 24,34 8,26 C -6,36 -30,30 -34,16 C -46,18 -46,12 -42,6 Z';

const LEAF_SPRAY_PATH =
  'M 0,0 C -14,-8 -20,-24 -6,-32 C 2,-24 6,-12 0,0 Z M 0,0 C 12,-10 24,-18 32,-6 C 22,4 10,4 0,0 Z M 0,0 C -4,-18 4,-34 16,-28 C 16,-14 8,-4 0,0 Z';

interface CanopyBunch {
  x: number;
  y: number;
  scale: number;
  rot: number;
  layer: 'back' | 'mid' | 'front';
  delay: number;
}

const CANOPY_L3: CanopyBunch[] = [
  { x: 162, y: 158, scale: 0.72, rot: -12, layer: 'back', delay: 0.1 },
  { x: 238, y: 155, scale: 0.74, rot: 14, layer: 'back', delay: 0.3 },
  { x: 200, y: 128, scale: 0.85, rot: 0, layer: 'mid', delay: 0.2 },
  { x: 170, y: 148, scale: 0.68, rot: -8, layer: 'front', delay: 0.4 },
  { x: 230, y: 145, scale: 0.68, rot: 8, layer: 'front', delay: 0.5 },
];

const CANOPY_L6: CanopyBunch[] = [
  { x: 132, y: 168, scale: 0.85, rot: -18, layer: 'back', delay: 0.2 },
  { x: 268, y: 164, scale: 0.88, rot: 16, layer: 'back', delay: 0.4 },
  { x: 168, y: 120, scale: 0.95, rot: -8, layer: 'back', delay: 0.1 },
  { x: 234, y: 118, scale: 0.95, rot: 8, layer: 'back', delay: 0.5 },
  { x: 200, y: 94, scale: 1.0, rot: 0, layer: 'mid', delay: 0.3 },
  { x: 148, y: 148, scale: 0.86, rot: -10, layer: 'mid', delay: 0.6 },
  { x: 252, y: 146, scale: 0.88, rot: 10, layer: 'mid', delay: 0.2 },
  { x: 200, y: 132, scale: 0.92, rot: 3, layer: 'front', delay: 0.4 },
  { x: 176, y: 105, scale: 0.76, rot: -5, layer: 'front', delay: 0.7 },
  { x: 224, y: 106, scale: 0.76, rot: 6, layer: 'front', delay: 0.15 },
];

const CANOPY_L10: CanopyBunch[] = [
  ...CANOPY_L6,
  { x: 104, y: 184, scale: 0.78, rot: -22, layer: 'back', delay: 0.3 },
  { x: 296, y: 180, scale: 0.78, rot: 22, layer: 'back', delay: 0.55 },
  { x: 122, y: 134, scale: 0.82, rot: -14, layer: 'mid', delay: 0.25 },
  { x: 278, y: 132, scale: 0.82, rot: 14, layer: 'mid', delay: 0.65 },
  { x: 200, y: 74, scale: 0.84, rot: 0, layer: 'front', delay: 0.35 },
  { x: 156, y: 162, scale: 0.72, rot: -6, layer: 'front', delay: 0.45 },
  { x: 244, y: 160, scale: 0.72, rot: 6, layer: 'front', delay: 0.75 },
];

const BLOSSOM_POINTS = [
  { x: 185, y: 92, s: 1.0 },
  { x: 218, y: 88, s: 0.9 },
  { x: 152, y: 128, s: 0.95 },
  { x: 248, y: 126, s: 0.95 },
  { x: 130, y: 158, s: 0.85 },
  { x: 270, y: 154, s: 0.85 },
  { x: 202, y: 124, s: 1.05 },
  { x: 174, y: 146, s: 0.85 },
  { x: 226, y: 144, s: 0.9 },
  { x: 108, y: 178, s: 0.8 },
  { x: 292, y: 174, s: 0.8 },
];

const FRUIT_POSITIONS = [
  { x: 152, y: 158 },
  { x: 246, y: 152 },
  { x: 198, y: 112 },
  { x: 122, y: 182 },
  { x: 278, y: 178 },
];

export const LoveTree2D: React.FC<LoveTree2DProps> = ({
  level = 1,
  isWatering = false,
  isSunbathing = false,
  isPruning = false,
  hasSakuraTheme = false,
  hasGoldenApples = false,
  hasFairyLights = false,
  hasSwing = false,
  hasLanterns = false,
  hasCrystals = false,
  ribbons = [],
  creatures = [],
  harvestedFruits = [],
  onHarvestFruit,
  onTreeTap,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const isSprout = level === 1;
  const isSapling = level >= 2 && level <= 3;
  const isYoungTree = level >= 4 && level <= 6;
  const isMatureTree = level >= 7;
  const isCosmicTree = level >= 10;

  const showSakura = hasSakuraTheme || level >= 3;
  const canopyList = isSprout
    ? []
    : isSapling
    ? CANOPY_L3
    : isYoungTree
    ? CANOPY_L6
    : CANOPY_L10;

  return (
    <div
      onClick={onTreeTap}
      className="relative w-full max-w-lg mx-auto aspect-[4/3.5] sm:aspect-[4/3] rounded-3xl overflow-hidden cursor-pointer select-none flex items-center justify-center p-2"
    >
      {/* Night Sanctuary Sky Backdrop */}
      <div
        className={`absolute inset-0 transition-colors duration-700 pointer-events-none rounded-3xl border border-purple-500/20 ${
          isCosmicTree
            ? 'bg-[radial-gradient(ellipse_at_top,_rgba(168,85,247,0.35),_rgba(15,6,34,0.95)_70%)]'
            : 'bg-gradient-to-b from-[#170933]/90 via-[#110424]/85 to-[#070210]/95'
        }`}
      />

      {/* Aurora Halo behind Cosmic / Mature Tree */}
      {level >= 5 && (
        <div
          className={`absolute top-6 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
            isCosmicTree
              ? 'bg-gradient-to-tr from-fuchsia-500/30 via-teal-400/20 to-amber-300/25 opacity-95'
              : 'bg-gradient-to-tr from-pink-500/20 via-purple-600/20 to-teal-400/10 opacity-75'
          }`}
        />
      )}

      {/* Botanical 2.5D Illustration SVG */}
      <svg
        viewBox="0 0 400 360"
        className="w-full h-full relative z-10 overflow-visible drop-shadow-[0_14px_30px_rgba(0,0,0,0.65)]"
      >
        <defs>
          <linearGradient id="botanicalBark" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#261009" />
            <stop offset="32%" stopColor="#5c2d1b" />
            <stop offset="68%" stopColor="#3d1b10" />
            <stop offset="100%" stopColor="#1b0905" />
          </linearGradient>

          <linearGradient id="sproutStemGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="60%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>

          <linearGradient id="islandStone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#240b42" />
            <stop offset="55%" stopColor="#140529" />
            <stop offset="100%" stopColor="#070210" />
          </linearGradient>

          <linearGradient id="mossTop" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="35%" stopColor="#059669" />
            <stop offset="70%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#065f46" />
          </linearGradient>

          <radialGradient id="sakuraShadow" cx="45%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#be185d" />
            <stop offset="100%" stopColor="#581c87" />
          </radialGradient>

          <radialGradient id="sakuraMid" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fbcfe8" />
            <stop offset="55%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#be185d" />
          </radialGradient>

          <radialGradient id="sakuraFront" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#fff1f2" />
            <stop offset="45%" stopColor="#fbcfe8" />
            <stop offset="100%" stopColor="#ec4899" />
          </radialGradient>

          <radialGradient id="leafShadow" cx="45%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="100%" stopColor="#022c22" />
          </radialGradient>

          <radialGradient id="leafMid" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="55%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </radialGradient>

          <radialGradient id="leafFront" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#d1fae5" />
            <stop offset="50%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </radialGradient>

          <radialGradient id="goldenFruitGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="45%" stopColor="#facc15" />
            <stop offset="85%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#854d0e" />
          </radialGradient>

          <radialGradient id="rubyFruitGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffe4e6" />
            <stop offset="35%" stopColor="#fb7185" />
            <stop offset="80%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#881337" />
          </radialGradient>

          <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- 0. BACKGROUND TWILIGHT STARS --- */}
        <g opacity="0.7">
          {[
            { cx: 56, cy: 52, r: 1.5 },
            { cx: 112, cy: 36, r: 1.2 },
            { cx: 310, cy: 48, r: 1.6 },
            { cx: 348, cy: 84, r: 1.1 },
            { cx: 68, cy: 138, r: 1.3 },
            { cx: 332, cy: 150, r: 1.4 },
          ].map((star, idx) => (
            <circle key={idx} cx={star.cx} cy={star.cy} r={star.r} fill="#fbcfe8" />
          ))}
        </g>

        {/* --- 1. FLOATING SANCTUARY ISLAND --- */}
        <g id="sanctuary-island">
          {/* Sculpted rocky underbelly */}
          <path
            d="M 88,284 Q 145,296 200,296 Q 255,296 312,284 L 278,324 Q 240,348 202,354 Q 162,346 122,322 Z"
            fill="url(#islandStone)"
            stroke="#5b21b6"
            strokeWidth="0.9"
          />

          {/* Glowing arcane root veins underneath */}
          <path
            d="M 164,306 Q 170,328 164,340 M 202,308 Q 204,334 200,350 M 238,306 Q 232,328 236,338"
            fill="none"
            stroke={isCosmicTree ? '#38bdf8' : '#c084fc'}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.65"
          />

          {/* Mossy grass cap */}
          <ellipse cx="200" cy="284" rx="112" ry="23" fill="url(#mossTop)" />
          <ellipse cx="200" cy="281" rx="102" ry="17" fill="#34d399" opacity="0.22" />

          {/* Rich dark soil mound at base */}
          <ellipse cx="200" cy="282" rx="34" ry="9" fill="#2e130b" opacity="0.85" />

          {/* Ground grass blades & wildflowers */}
          <path
            d="M 118,282 Q 114,270 110,275 M 122,283 Q 124,268 128,274 M 278,283 Q 274,269 270,275 M 284,282 Q 288,269 292,276"
            stroke="#6ee7b7"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Bioluminescent crystals (brighter with store unlock or tree maturity) */}
          <polygon
            points="110,282 116,266 123,282 117,286"
            fill="#f43f5e"
            filter="url(#softGlow)"
            opacity={hasCrystals || level >= 3 ? 0.95 : 0.45}
          />
          <polygon
            points="280,283 287,264 294,283 287,287"
            fill="#2dd4bf"
            filter="url(#softGlow)"
            opacity={hasCrystals || level >= 2 ? 0.95 : 0.45}
          />
          {hasCrystals && (
            <g filter="url(#softGlow)">
              <polygon points="100,284 106,258 113,284 106,288" fill="#f472b6" />
              <polygon points="270,285 276,260 282,285 276,288" fill="#e879f9" />
            </g>
          )}

          {/* Tiny wildflowers along the rim */}
          {level >= 2 && (
            <g>
              <circle cx="144" cy="285" r="3" fill="#fbcfe8" />
              <circle cx="144" cy="285" r="1.2" fill="#facc15" />
              <circle cx="256" cy="285" r="3" fill="#fde047" />
              <circle cx="256" cy="285" r="1.2" fill="#f43f5e" />
            </g>
          )}
          {level >= 5 && (
            <g>
              <circle cx="164" cy="292" r="2.8" fill="#a7f3d0" />
              <circle cx="236" cy="291" r="2.8" fill="#f9a8d4" />
            </g>
          )}
        </g>

        {/* --- 2. STAGE-DRIVEN TRUNK / SPROUT STRUCTURE --- */}
        {isSprout ? (
          /* LEVEL 1: Tender Botanical Sprout with Heart-Shaped Leaves */
          <motion.g
            animate={prefersReducedMotion ? undefined : { rotate: [-1.5, 1.5, -1.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '200px 282px' }}
          >
            {/* Curved stem */}
            <path
              d="M 200,282 C 198,262 204,244 200,224"
              fill="none"
              stroke="url(#sproutStemGrad)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Left sculpted leaf */}
            <path
              d="M 199,246 C 176,242 166,222 178,214 C 188,208 197,226 199,246 Z"
              fill="url(#leafMid)"
              stroke="#6ee7b7"
              strokeWidth="0.9"
            />
            <path d="M 198,244 Q 186,230 179,220" stroke="#a7f3d0" strokeWidth="1" fill="none" />
            {/* Right sculpted leaf */}
            <path
              d="M 201,238 C 224,234 236,214 222,206 C 212,200 203,218 201,238 Z"
              fill="url(#leafFront)"
              stroke="#6ee7b7"
              strokeWidth="0.9"
            />
            <path d="M 202,236 Q 214,222 221,212" stroke="#ecfdf5" strokeWidth="1" fill="none" />
            {/* Glowing pink blossom bud at tip */}
            <circle cx="200" cy="218" r="5.5" fill="#f472b6" filter="url(#softGlow)" />
            <circle cx="198.5" cy="216.5" r="2" fill="#fff1f2" opacity="0.85" />
          </motion.g>
        ) : isSapling ? (
          /* LEVEL 2-3: Graceful Sapling Trunk & Forked Young Branches */
          <g id="sapling-trunk">
            {/* Base roots */}
            <path
              d="M 188,283 Q 178,286 168,287 M 212,283 Q 222,286 232,287"
              stroke="#3d1b10"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Tapered curved trunk */}
            <path
              d="M 188,284 C 192,248 194,218 192,188 L 208,188 C 206,218 208,248 212,284 Z"
              fill="url(#botanicalBark)"
            />
            {/* Young forked branches */}
            <path
              d="M 197,202 C 186,184 174,172 162,162 M 203,196 C 214,178 228,168 238,158 M 200,192 C 200,170 200,152 200,136"
              fill="none"
              stroke="url(#botanicalBark)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            {/* Subtle heart mark on bark */}
            <path
              d="M 200,248 C 200,244 195,244 195,248 C 195,252 200,256 200,256 C 200,256 205,252 205,248 C 205,244 200,244 200,248 Z"
              fill="#fb7185"
              opacity="0.85"
            />
          </g>
        ) : (
          /* LEVEL 4-10: Majestic Sculpted Botanical Trunk, Roots & Spreading Boughs */
          <g id="mature-trunk">
            {/* Ground roots spread */}
            <path
              d="M 176,282 C 160,285 144,289 132,291 M 224,282 C 240,285 256,289 268,291 M 192,283 Q 186,289 178,293 M 208,283 Q 214,289 222,293"
              stroke="#2e1309"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            {/* Sculpted flared trunk mass */}
            <path
              d="M 174,284 C 182,250 185,220 184,186 C 170,162 152,148 134,138 L 142,130 C 162,142 180,156 192,174 C 196,154 197,130 194,106 L 206,106 C 204,132 205,156 210,174 C 224,154 242,140 264,128 L 270,136 C 250,148 232,162 218,186 C 216,220 218,250 226,284 Z"
              fill="url(#botanicalBark)"
            />
            {/* Secondary sweeping boughs */}
            <path
              d="M 186,204 C 164,192 142,184 118,178 M 214,200 C 236,188 258,180 282,174 M 194,154 C 180,138 166,124 152,114 M 206,152 C 220,136 234,122 250,112"
              fill="none"
              stroke="url(#botanicalBark)"
              strokeWidth={isMatureTree ? 10 : 8}
              strokeLinecap="round"
            />
            {/* Bark grain highlights */}
            <path
              d="M 190,256 Q 194,234 190,210 M 208,262 Q 204,238 209,215"
              stroke="#1b0905"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
              opacity="0.7"
            />
            {/* Carved G ♥ S Heart Emblem */}
            <g transform="translate(192, 232) scale(0.78)">
              <path
                d="M 10,6 C 10,0 2,0 2,6 C 2,12 10,18 10,18 C 10,18 18,12 18,6 C 18,0 10,0 10,6 Z"
                fill="#fb7185"
                stroke="#881337"
                strokeWidth="1.2"
              />
            </g>
          </g>
        )}

        {/* --- 3. SCULPTED BOTANICAL CANOPY (BACK -> MID -> FRONT) --- */}
        {!isSprout && (
          <g id="botanical-canopy">
            {(['back', 'mid', 'front'] as const).map((layerName) =>
              canopyList
                .filter((b) => b.layer === layerName)
                .map((bunch, idx) => {
                  const fillUrl = showSakura
                    ? layerName === 'back'
                      ? 'url(#sakuraShadow)'
                      : layerName === 'mid'
                      ? 'url(#sakuraMid)'
                      : 'url(#sakuraFront)'
                    : layerName === 'back'
                    ? 'url(#leafShadow)'
                    : layerName === 'mid'
                    ? 'url(#leafMid)'
                    : 'url(#leafFront)';

                  const strokeColor = showSakura
                    ? layerName === 'front'
                      ? '#fbcfe8'
                      : '#f472b6'
                    : layerName === 'front'
                    ? '#a7f3d0'
                    : '#10b981';

                  return (
                    <motion.g
                      key={`${layerName}-${idx}`}
                      transform={`translate(${bunch.x}, ${bunch.y}) scale(${bunch.scale}) rotate(${bunch.rot})`}
                      animate={
                        prefersReducedMotion
                          ? undefined
                          : {
                              y: [-1.5, 2, -1.5],
                              rotate: [bunch.rot - 1.2, bunch.rot + 1.2, bunch.rot - 1.2],
                            }
                      }
                      transition={{
                        duration: 4 + (idx % 3) * 0.6,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: bunch.delay,
                      }}
                    >
                      {/* Botanical scalloped foliage cloud */}
                      <path
                        d={FOLIAGE_CLOUD_PATH}
                        fill={fillUrl}
                        stroke={strokeColor}
                        strokeWidth="0.8"
                        opacity={layerName === 'back' ? 0.88 : layerName === 'mid' ? 0.94 : 0.96}
                      />
                      {/* Delicate inner leaf spray accents on mid/front clusters */}
                      {layerName !== 'back' && (
                        <path
                          d={LEAF_SPRAY_PATH}
                          transform="translate(-4, 8) scale(0.55)"
                          fill="#ffffff"
                          opacity="0.18"
                        />
                      )}
                    </motion.g>
                  );
                })
            )}

            {/* 5-Petal Sakura Blossoms dotting the Canopy */}
            {showSakura &&
              BLOSSOM_POINTS.slice(0, isSapling ? 4 : isYoungTree ? 8 : 11).map((bp, i) => (
                <g
                  key={`sakura-flower-${i}`}
                  transform={`translate(${bp.x}, ${bp.y}) scale(${bp.s})`}
                  opacity="0.95"
                >
                  {[0, 72, 144, 216, 288].map((deg) => (
                    <ellipse
                      key={deg}
                      cx="0"
                      cy="-4.2"
                      rx="2.3"
                      ry="3.8"
                      fill="#fff1f2"
                      transform={`rotate(${deg})`}
                    />
                  ))}
                  <circle cx="0" cy="0" r="1.8" fill="#fde047" />
                </g>
              ))}
          </g>
        )}

        {/* --- 4. FAIRY LIGHT GARLANDS (Unlocked via Store or Level >= 7) --- */}
        {(hasFairyLights || level >= 7) && (
          <g id="fairy-lights">
            <path
              d="M 122,162 Q 165,184 200,174 Q 238,166 278,152 M 148,120 Q 200,144 252,122"
              fill="none"
              stroke="#fef08a"
              strokeWidth="0.9"
              strokeDasharray="2 5"
              opacity="0.7"
            />
            {[
              { cx: 136, cy: 168 },
              { cx: 168, cy: 179 },
              { cx: 200, cy: 174 },
              { cx: 234, cy: 167 },
              { cx: 264, cy: 157 },
              { cx: 164, cy: 129 },
              { cx: 200, cy: 137 },
              { cx: 236, cy: 129 },
            ].map((pt, idx) => (
              <motion.circle
                key={`fairy-${idx}`}
                cx={pt.cx}
                cy={pt.cy}
                r={2.8}
                fill="#fef08a"
                filter="url(#softGlow)"
                animate={prefersReducedMotion ? undefined : { opacity: [0.45, 1, 0.45] }}
                transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
              />
            ))}
          </g>
        )}

        {/* --- 5. SACRED FRUITS HANGING ON BOUGHS --- */}
        {(level >= 3 || hasGoldenApples) && (
          <g id="sacred-fruits">
            {FRUIT_POSITIONS.slice(0, Math.min(5, Math.max(2, level - 1))).map((pt, index) => {
              const isHarvested = harvestedFruits.includes(index);
              return (
                <g
                  key={`fruit-${index}`}
                  transform={`translate(${pt.x}, ${pt.y})`}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onHarvestFruit?.(index);
                  }}
                >
                  {!isHarvested ? (
                    <motion.g
                      animate={prefersReducedMotion ? undefined : { y: [-1.5, 1.5, -1.5] }}
                      transition={{ duration: 2.4 + index * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <line x1="0" y1="-9" x2="0" y2="0" stroke="#451a03" strokeWidth="1.6" />
                      <path d="M 0,-7 Q 6,-11 8,-6 Q 3,-3 0,-7 Z" fill="#34d399" />
                      <circle
                        cx="0"
                        cy="5"
                        r="8.5"
                        fill={hasGoldenApples ? 'url(#goldenFruitGrad)' : 'url(#rubyFruitGrad)'}
                        stroke={hasGoldenApples ? '#fef08a' : '#fda4af'}
                        strokeWidth="0.9"
                        filter="url(#softGlow)"
                      />
                      <circle cx="-2.8" cy="2" r="2.2" fill="#ffffff" opacity="0.85" />
                    </motion.g>
                  ) : (
                    <circle cx="0" cy="2" r="3" fill="#fbcfe8" opacity="0.65" />
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* --- 6. FLUTTERING PROMISE RIBBONS --- */}
        {ribbons.length > 0 && level >= 2 && (
          <g id="promise-ribbons">
            {ribbons.slice(0, 4).map((rib, idx) => {
              const coords = [
                { x: 138, y: 180, rot: -14 },
                { x: 262, y: 174, rot: 16 },
                { x: 174, y: 144, rot: -8 },
                { x: 228, y: 140, rot: 10 },
              ][idx % 4];

              return (
                <motion.g
                  key={`ribbon-${rib.id || idx}`}
                  transform={`translate(${coords.x}, ${coords.y}) rotate(${coords.rot})`}
                  animate={
                    prefersReducedMotion
                      ? undefined
                      : { rotate: [coords.rot - 4, coords.rot + 5, coords.rot - 4] }
                  }
                  transition={{ duration: 3.4 + idx * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <circle cx="0" cy="0" r="3" fill={rib.color || '#ec4899'} />
                  <path
                    d="M 0,0 C -3,10 4,18 2,26 L -2,25 C 0,16 -5,9 0,0 Z"
                    fill={rib.color || '#ec4899'}
                    opacity="0.9"
                  />
                  <path
                    d="M 0,0 C 3,9 8,16 6,24 L 3,24 C 5,15 1,8 0,0 Z"
                    fill={rib.color || '#f472b6'}
                    opacity="0.82"
                  />
                </motion.g>
              );
            })}
          </g>
        )}

        {/* --- 6B. ROMANTIC BRANCH SWING --- */}
        {hasSwing && !isSprout && (
          <motion.g
            animate={prefersReducedMotion ? undefined : { rotate: [-4, 4, -4] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '262px 176px' }}
          >
            <line x1="252" y1="176" x2="252" y2="236" stroke="#fde68a" strokeWidth="1.6" />
            <line x1="272" y1="176" x2="272" y2="236" stroke="#fde68a" strokeWidth="1.6" />
            <circle cx="252" cy="202" r="2.8" fill="#f472b6" />
            <circle cx="272" cy="212" r="2.8" fill="#f472b6" />
            <rect x="244" y="234" width="36" height="6" rx="2.5" fill="#7c2d12" stroke="#d97706" strokeWidth="0.9" />
          </motion.g>
        )}

        {/* --- 6C. MAGIC FLOATING LANTERNS --- */}
        {hasLanterns && (
          <g id="magic-lanterns">
            {[
              { x: 118, y: 186, d: 0 },
              { x: 284, y: 184, d: 0.9 },
            ].map((ln, idx) => (
              <motion.g
                key={`lantern-${idx}`}
                transform={`translate(${ln.x}, ${ln.y})`}
                animate={prefersReducedMotion ? undefined : { y: [-3, 3, -3] }}
                transition={{ duration: 2.8, repeat: Infinity, delay: ln.d, ease: 'easeInOut' }}
              >
                <line x1="0" y1="-10" x2="0" y2="0" stroke="#78350f" strokeWidth="1.2" />
                <rect x="-6" y="0" width="12" height="16" rx="4" fill="#fef08a" stroke="#f59e0b" strokeWidth="1.2" filter="url(#softGlow)" />
                <rect x="-7" y="-1" width="14" height="3" rx="1" fill="#451a03" />
                <rect x="-7" y="14" width="14" height="3" rx="1" fill="#451a03" />
              </motion.g>
            ))}
          </g>
        )}

        {/* --- 7. MAGICAL CREATURES (Butterfly & Perched Songbird) --- */}
        {(creatures.includes('Borboleta Lilás') || level >= 6) && (
          <motion.g
            animate={
              prefersReducedMotion
                ? { x: 140, y: 120 }
                : {
                    x: [120, 185, 250, 165, 120],
                    y: [115, 78, 108, 142, 115],
                  }
            }
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M 0,0 C -8,-10 -14,-4 -6,4 C -12,8 -6,14 0,2 Z" fill="#c084fc" />
            <path d="M 0,0 C 8,-10 14,-4 6,4 C 12,8 6,14 0,2 Z" fill="#e879f9" />
          </motion.g>
        )}

        {(creatures.includes('Passarinho Cantor') || level >= 8) && (
          <g transform="translate(268, 166)">
            <ellipse cx="0" cy="0" rx="7" ry="5" fill="#38bdf8" />
            <circle cx="5" cy="-4" r="4" fill="#7dd3fc" />
            <polygon points="8,-5 12,-3 8,-2" fill="#facc15" />
            <circle cx="6.2" cy="-4.6" r="0.9" fill="#0f172a" />
          </g>
        )}

        {/* --- 8. FALLING SAKURA PETALS --- */}
        {level >= 2 &&
          !prefersReducedMotion &&
          [
            { x: 155, y: 150, delay: 0 },
            { x: 232, y: 128, delay: 1.4 },
            { x: 192, y: 106, delay: 2.6 },
          ].map((pt, i) => (
            <motion.ellipse
              key={`petal-fall-${i}`}
              cx={pt.x}
              cy={pt.y}
              rx="3.5"
              ry="2"
              fill="#fbcfe8"
              animate={{
                y: [pt.y, pt.y + 115],
                x: [pt.x, pt.x + (i % 2 === 0 ? 28 : -24)],
                rotate: [0, 320],
                opacity: [0, 0.85, 0],
              }}
              transition={{
                duration: 5.2,
                repeat: Infinity,
                delay: pt.delay,
                ease: 'linear',
              }}
            />
          ))}

        {/* --- 9. CARE FEEDBACK FX: WATERING, SUNSHINE, PRUNING --- */}
        {isWatering && (
          <g id="water-fx">
            {[155, 178, 200, 222, 245].map((xPos, idx) => (
              <motion.path
                key={`drop-${idx}`}
                d={`M ${xPos},55 Q ${xPos - 4},64 ${xPos},68 Q ${xPos + 4},64 ${xPos},55 Z`}
                fill="#38bdf8"
                filter="url(#softGlow)"
                animate={{ y: [0, 210], opacity: [0, 1, 0] }}
                transition={{ duration: 0.85, repeat: Infinity, delay: idx * 0.14 }}
              />
            ))}
          </g>
        )}

        {isSunbathing && (
          <motion.g
            animate={{ opacity: [0.3, 0.85, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          >
            <circle cx="200" cy="145" r="105" fill="url(#goldenFruitGrad)" opacity="0.18" />
            <line x1="200" y1="12" x2="200" y2="275" stroke="#fef08a" strokeWidth="2.5" strokeDasharray="6 8" opacity="0.65" />
            <line x1="95" y1="65" x2="305" y2="235" stroke="#fef08a" strokeWidth="2" strokeDasharray="6 8" opacity="0.5" />
            <line x1="305" y1="65" x2="95" y2="235" stroke="#fef08a" strokeWidth="2" strokeDasharray="6 8" opacity="0.5" />
          </motion.g>
        )}

        {isPruning && (
          <g id="prune-fx">
            {[
              { x: 152, y: 156 },
              { x: 242, y: 148 },
              { x: 200, y: 108 },
            ].map((p, idx) => (
              <motion.g
                key={`prune-${idx}`}
                animate={{ scale: [0.5, 1.35, 0.5], opacity: [0, 1, 0], y: [0, 22] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: idx * 0.25 }}
                transform={`translate(${p.x}, ${p.y})`}
              >
                <circle cx="0" cy="0" r="5" fill="#34d399" filter="url(#softGlow)" />
              </motion.g>
            ))}
          </g>
        )}
      </svg>

      {/* Bottom Interactive Hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-pink-200/90 pointer-events-none flex items-center gap-1.5 shadow-md whitespace-nowrap">
        <Sparkles className="w-3 h-3 text-amber-300" />
        <span>
          {isSprout
            ? 'Regue e cuide para nossa semente brotar ♡'
            : level < 3
            ? 'Continue cuidando para desbloquear flores e frutos'
            : 'Toque na árvore ou colha um fruto'}
        </span>
      </div>
    </div>
  );
};
