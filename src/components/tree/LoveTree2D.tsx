import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Apple, Sparkles } from 'lucide-react';

interface LoveTree2DProps {
  level: number;
  isWatering?: boolean;
  isSunbathing?: boolean;
  isPruning?: boolean;
  hasSakuraTheme?: boolean;
  hasGoldenApples?: boolean;
  hasFairyLights?: boolean;
  ribbons?: { id: string; title: string; color: string }[];
  creatures?: string[];
  harvestedFruits?: number[];
  onHarvestFruit?: (index: number) => void;
  onTreeTap?: () => void;
}

export const LoveTree2D: React.FC<LoveTree2DProps> = ({
  level = 2,
  isWatering = false,
  isSunbathing = false,
  isPruning = false,
  hasSakuraTheme = true,
  hasGoldenApples = false,
  hasFairyLights = false,
  ribbons = [],
  creatures = [],
  harvestedFruits = [],
  onHarvestFruit,
  onTreeTap,
}) => {
  // Tree scale and fullness scales gracefully with level (1 to 10)
  const growthScale = useMemo(() => {
    return 0.75 + Math.min(level, 10) * 0.05; // 0.8 to 1.25
  }, [level]);

  // Foliage volume (number of blossom clusters) based on stage
  const foliageClusters = useMemo(() => {
    const count = Math.min(18, 6 + level * 2);
    const clusters = [];
    const basePositions = [
      { cx: 200, cy: 110, r: 42, delay: 0 },
      { cx: 160, cy: 130, r: 38, delay: 0.2 },
      { cx: 240, cy: 125, r: 40, delay: 0.4 },
      { cx: 130, cy: 160, r: 34, delay: 0.6 },
      { cx: 270, cy: 155, r: 36, delay: 0.3 },
      { cx: 195, cy: 75, r: 35, delay: 0.5 },
      { cx: 165, cy: 90, r: 32, delay: 0.1 },
      { cx: 230, cy: 85, r: 34, delay: 0.7 },
      { cx: 105, cy: 185, r: 28, delay: 0.4 },
      { cx: 295, cy: 180, r: 30, delay: 0.8 },
      { cx: 200, cy: 145, r: 36, delay: 0.2 },
      { cx: 140, cy: 115, r: 30, delay: 0.5 },
      { cx: 260, cy: 110, r: 32, delay: 0.9 },
      { cx: 85, cy: 205, r: 24, delay: 0.3 },
      { cx: 315, cy: 200, r: 26, delay: 0.6 },
      { cx: 175, cy: 60, r: 26, delay: 0.7 },
      { cx: 220, cy: 55, r: 26, delay: 0.4 },
      { cx: 200, cy: 45, r: 24, delay: 0.2 },
    ];
    for (let i = 0; i < count; i++) {
      clusters.push(basePositions[i % basePositions.length]);
    }
    return clusters;
  }, [level]);

  // Positions for sacred apples on branches
  const fruitPositions = [
    { x: 155, y: 150 },
    { x: 245, y: 140 },
    { x: 195, y: 100 },
    { x: 125, y: 185 },
    { x: 275, y: 175 },
  ];

  return (
    <div
      onClick={onTreeTap}
      className="relative w-full max-w-lg mx-auto aspect-[4/3.5] sm:aspect-[4/3] rounded-3xl overflow-hidden cursor-pointer select-none flex items-center justify-center p-2"
    >
      {/* Mystical Background Atmospheric Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 via-purple-950/25 to-[#0b0318]/90 pointer-events-none rounded-3xl border border-purple-500/20" />
      
      {/* Ambient Celestial Nebula or Starry Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-gradient-to-tr from-pink-500/15 via-purple-600/15 to-teal-400/10 blur-3xl pointer-events-none" />

      {/* Main Vector 2.5D SVG Canvas */}
      <svg
        viewBox="0 0 400 360"
        className="w-full h-full relative z-10 overflow-visible drop-shadow-[0_12px_30px_rgba(0,0,0,0.6)]"
      >
        <defs>
          {/* Trunk & Bark Gradient */}
          <linearGradient id="barkGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2e1408" />
            <stop offset="35%" stopColor="#542813" />
            <stop offset="70%" stopColor="#3d1b0b" />
            <stop offset="100%" stopColor="#1e0a03" />
          </linearGradient>

          {/* Island Rock Gradient */}
          <linearGradient id="islandRock" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1b0933" />
            <stop offset="60%" stopColor="#110522" />
            <stop offset="100%" stopColor="#080210" />
          </linearGradient>

          {/* Grass Island Top */}
          <linearGradient id="islandGrass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="30%" stopColor="#047857" />
            <stop offset="70%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#065f46" />
          </linearGradient>

          {/* Sakura Petals Gradients */}
          <radialGradient id="sakuraBlossom" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fdf2f8" />
            <stop offset="35%" stopColor="#fbcfe8" />
            <stop offset="75%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#db2777" />
          </radialGradient>

          <radialGradient id="emeraldLeaves" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#d1fae5" />
            <stop offset="40%" stopColor="#34d399" />
            <stop offset="85%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064e3b" />
          </radialGradient>

          <radialGradient id="goldenAppleGlow" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="40%" stopColor="#fde047" />
            <stop offset="80%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#a16207" />
          </radialGradient>

          {/* Fairy Light Filter Glow */}
          <filter id="fairyGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- 1. FLOATING ISLE PLATFORM --- */}
        <g id="floating-island">
          {/* Island Underbelly / Stalactite Rock */}
          <polygon
            points="100,285 300,285 270,330 215,350 200,356 175,340 130,315"
            fill="url(#islandRock)"
            stroke="#4c1d95"
            strokeWidth="0.8"
            opacity="0.9"
          />

          {/* Crystalline roots hanging underneath */}
          <path
            d="M 180,310 Q 185,335 188,348 M 220,310 Q 215,330 210,344 M 150,295 Q 155,315 152,328"
            stroke="#a855f7"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Top Grassy Mound Layer */}
          <ellipse cx="200" cy="285" rx="105" ry="24" fill="url(#islandGrass)" />
          <ellipse cx="200" cy="283" rx="100" ry="20" fill="#059669" opacity="0.6" />

          {/* Glowing Bioluminescent Crystals & Mushrooms */}
          <g id="island-decor">
            {/* Pink Crystal */}
            <polygon points="120,280 125,268 130,280 126,284" fill="#f43f5e" filter="url(#fairyGlow)" opacity="0.8" />
            {/* Teal Crystal */}
            <polygon points="275,282 280,266 286,282 282,286" fill="#2dd4bf" filter="url(#fairyGlow)" opacity="0.85" />
            {/* Small glowing flower */}
            <circle cx="140" cy="284" r="3" fill="#fbbf24" />
            <circle cx="260" cy="286" r="3" fill="#f472b6" />
            <circle cx="170" cy="292" r="2.5" fill="#a7f3d0" />
            <circle cx="230" cy="291" r="2.5" fill="#fbcfe8" />
          </g>
        </g>

        {/* --- 2. THE SACRED LIVING TRUNK & BRANCHES --- */}
        <g id="tree-trunk" style={{ transformOrigin: '200px 285px', transform: `scale(${growthScale})` }}>
          {/* Organic Roots Spread */}
          <path
            d="M 172,285 C 160,286 142,288 136,290 M 228,285 C 240,286 258,288 264,290"
            stroke="#3d1b0b"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Main Trunk Body with twisting curves */}
          <path
            d="M 176,286 
               C 178,255 182,230 186,200 
               C 188,180 180,165 174,150 
               C 168,135 155,125 140,118
               M 186,185 
               C 192,165 204,150 216,138
               C 226,128 245,120 262,112
               M 194,152 
               C 198,135 199,115 197,95
               M 185,215 
               C 175,200 160,192 145,185
               M 212,210 
               C 225,198 240,190 258,186
               M 224,286 
               C 222,255 218,230 214,200"
            stroke="url(#barkGrad)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Internal Trunk Fill Mass */}
          <path
            d="M 174,286 Q 186,220 188,190 Q 200,165 202,150 Q 212,220 226,286 Z"
            fill="url(#barkGrad)"
          />

          {/* Bark texture & heart carving details */}
          <path
            d="M 192,240 Q 196,230 194,220 M 204,245 Q 206,235 203,225"
            stroke="#230c04"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />
          {/* Subtle Couple Heart Carving on Trunk: G + S */}
          <g transform="translate(193, 235) scale(0.65)" opacity="0.85">
            <path
              d="M 10,6 C 10,0 2,0 2,6 C 2,12 10,18 10,18 C 10,18 18,12 18,6 C 18,0 10,0 10,6 Z"
              fill="#fb7185"
              stroke="#881337"
              strokeWidth="1"
            />
          </g>
        </g>

        {/* --- 3. VOLUMETRIC CANOPY BLOSSOMS (2.5D Animated Layers) --- */}
        <g id="foliage-canopy" style={{ transformOrigin: '200px 140px', transform: `scale(${growthScale})` }}>
          {foliageClusters.map((cluster, i) => {
            const isSakura = hasSakuraTheme || level >= 2;
            const fillType = isSakura ? 'url(#sakuraBlossom)' : 'url(#emeraldLeaves)';
            const swayDuration = 3.5 + (i % 4) * 0.4;

            return (
              <motion.g
                key={`blossom-${i}`}
                animate={{
                  y: [-2, 2.5, -2],
                  x: [i % 2 === 0 ? -1.5 : 1.5, i % 2 === 0 ? 1.5 : -1.5, i % 2 === 0 ? -1.5 : 1.5],
                  rotate: [i % 2 === 0 ? -1 : 1, i % 2 === 0 ? 1 : -1, i % 2 === 0 ? -1 : 1],
                }}
                transition={{
                  duration: swayDuration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: cluster.delay,
                }}
              >
                {/* Back subtle drop shadow circle */}
                <circle cx={cluster.cx} cy={cluster.cy + 3} r={cluster.r} fill="#1f0729" opacity="0.25" />
                {/* Main blossom cloud */}
                <circle
                  cx={cluster.cx}
                  cy={cluster.cy}
                  r={cluster.r}
                  fill={fillType}
                  stroke={isSakura ? '#fbcfe8' : '#6ee7b7'}
                  strokeWidth="0.8"
                  opacity={0.94}
                />
                {/* Inner petal highlights */}
                <circle
                  cx={cluster.cx - cluster.r * 0.25}
                  cy={cluster.cy - cluster.r * 0.25}
                  r={cluster.r * 0.4}
                  fill="#ffffff"
                  opacity="0.35"
                />
              </motion.g>
            );
          })}
        </g>

        {/* --- 4. FAIRY LIGHTS DECORATION (Unlocked from Store) --- */}
        {hasFairyLights && (
          <g id="fairy-lights-string">
            <path
              d="M 120,150 Q 160,170 200,165 Q 240,160 280,145 M 150,110 Q 200,135 250,115"
              fill="none"
              stroke="#fef08a"
              strokeWidth="0.8"
              strokeDasharray="2 6"
              opacity="0.7"
            />
            {[
              { cx: 135, cy: 156 },
              { cx: 165, cy: 167 },
              { cx: 200, cy: 165 },
              { cx: 235, cy: 158 },
              { cx: 265, cy: 149 },
              { cx: 165, cy: 118 },
              { cx: 200, cy: 128 },
              { cx: 235, cy: 120 },
            ].map((pt, idx) => (
              <motion.circle
                key={`fairy-light-${idx}`}
                cx={pt.cx}
                cy={pt.cy}
                r={2.8}
                fill="#fef08a"
                filter="url(#fairyGlow)"
                animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: idx * 0.2 }}
              />
            ))}
          </g>
        )}

        {/* --- 5. SACRED FRUITS ON TREE --- */}
        {(level >= 3 || hasGoldenApples) && (
          <g id="sacred-fruits">
            {fruitPositions.slice(0, Math.min(5, level - 1)).map((pt, index) => {
              const isHarvested = harvestedFruits.includes(index);
              return (
                <g
                  key={`fruit-${index}`}
                  transform={`translate(${pt.x}, ${pt.y})`}
                  className="cursor-pointer transition-transform hover:scale-125"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onHarvestFruit) onHarvestFruit(index);
                  }}
                >
                  {!isHarvested ? (
                    <motion.g
                      animate={{ y: [-1.5, 1.5, -1.5] }}
                      transition={{ duration: 2.2 + index * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {/* Fruit hanging stem */}
                      <line x1="0" y1="-8" x2="0" y2="0" stroke="#3d1b0b" strokeWidth="1.5" />
                      {/* Apple Body */}
                      <circle
                        cx="0"
                        cy="4"
                        r="9"
                        fill={hasGoldenApples ? 'url(#goldenAppleGlow)' : '#ef4444'}
                        stroke={hasGoldenApples ? '#fef08a' : '#fca5a5'}
                        strokeWidth="1"
                        filter="url(#fairyGlow)"
                      />
                      {/* Sparkle highlight on apple */}
                      <circle cx="-3" cy="2" r="2.5" fill="#ffffff" opacity="0.8" />
                    </motion.g>
                  ) : (
                    // Harvested flower bud placeholder
                    <circle cx="0" cy="2" r="3" fill="#a7f3d0" opacity="0.6" />
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* --- 6. PROMISE RIBBONS FLUTTERING --- */}
        {ribbons.length > 0 && (
          <g id="promise-ribbons">
            {ribbons.slice(0, 4).map((rib, idx) => {
              const coords = [
                { x: 130, y: 175, rot: -15 },
                { x: 260, y: 168, rot: 18 },
                { x: 170, y: 130, rot: -8 },
                { x: 230, y: 125, rot: 12 },
              ][idx % 4];

              return (
                <motion.g
                  key={`ribbon-${rib.id || idx}`}
                  transform={`translate(${coords.x}, ${coords.y}) rotate(${coords.rot})`}
                  animate={{ rotate: [coords.rot - 4, coords.rot + 6, coords.rot - 4] }}
                  transition={{ duration: 3.2 + idx * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {/* Tie knot */}
                  <circle cx="0" cy="0" r="3" fill={rib.color || '#ec4899'} />
                  {/* Ribbon tails fluttering */}
                  <path
                    d="M 0,0 C -3,10 4,18 2,26 L -2,25 C 0,16 -5,9 0,0 Z"
                    fill={rib.color || '#ec4899'}
                    opacity="0.9"
                  />
                  <path
                    d="M 0,0 C 3,9 8,16 6,24 L 3,24 C 5,15 1,8 0,0 Z"
                    fill={rib.color || '#f472b6'}
                    opacity="0.8"
                  />
                </motion.g>
              );
            })}
          </g>
        )}

        {/* --- 7. MAGICAL CREATURES (Butterflies & Songbirds) --- */}
        {creatures.includes('Borboleta Lilás') && (
          <motion.g
            animate={{
              x: [120, 180, 240, 160, 120],
              y: [120, 80, 110, 140, 120],
            }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Cute animated butterfly wings */}
            <motion.path
              d="M 0,0 C -8,-10 -14,-4 -6,4 C -12,8 -6,14 0,2 Z"
              fill="#c084fc"
              animate={{ scaleX: [1, 0.2, 1] }}
              transition={{ duration: 0.25, repeat: Infinity }}
            />
            <motion.path
              d="M 0,0 C 8,-10 14,-4 6,4 C 12,8 6,14 0,2 Z"
              fill="#e879f9"
              animate={{ scaleX: [1, 0.2, 1] }}
              transition={{ duration: 0.25, repeat: Infinity }}
            />
          </motion.g>
        )}

        {/* --- 8. FLOATING PETAL PARTICLES --- */}
        {[
          { x: 160, y: 150, delay: 0 },
          { x: 230, y: 130, delay: 1.2 },
          { x: 190, y: 110, delay: 2.4 },
          { x: 270, y: 180, delay: 3.1 },
        ].map((pt, i) => (
          <motion.ellipse
            key={`petal-fall-${i}`}
            cx={pt.x}
            cy={pt.y}
            rx="3.5"
            ry="2"
            fill="#fbcfe8"
            opacity={0.8}
            animate={{
              y: [pt.y, pt.y + 110],
              x: [pt.x, pt.x + (i % 2 === 0 ? 30 : -25)],
              rotate: [0, 360],
              opacity: [0, 0.9, 0],
            }}
            transition={{
              duration: 4.8,
              repeat: Infinity,
              delay: pt.delay,
              ease: 'linear',
            }}
          />
        ))}

        {/* --- 9. INTERACTION OVERLAYS: WATERING, SUNSHINE, PRUNING --- */}
        {/* A. Watering Droplets Shower */}
        {isWatering && (
          <g id="water-particles">
            {[150, 175, 200, 225, 250].map((xPos, idx) => (
              <motion.circle
                key={`water-drop-${idx}`}
                cx={xPos}
                cy={60}
                r={4}
                fill="#38bdf8"
                filter="url(#fairyGlow)"
                animate={{ y: [60, 280], opacity: [0, 1, 0], scale: [0.8, 1.2, 0.5] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: idx * 0.15 }}
              />
            ))}
          </g>
        )}

        {/* B. Sunbathing Rays Burst */}
        {isSunbathing && (
          <motion.g
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.3, 1.4] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            style={{ transformOrigin: '200px 140px' }}
          >
            <circle cx="200" cy="140" r="100" fill="url(#goldenAppleGlow)" opacity="0.25" />
            <line x1="200" y1="10" x2="200" y2="270" stroke="#fef08a" strokeWidth="2.5" strokeDasharray="6 8" opacity="0.7" />
            <line x1="70" y1="140" x2="330" y2="140" stroke="#fef08a" strokeWidth="2.5" strokeDasharray="6 8" opacity="0.7" />
          </motion.g>
        )}

        {/* C. Pruning Green Sparkles */}
        {isPruning && (
          <g id="prune-shears-fx">
            {[
              { x: 150, y: 160 },
              { x: 240, y: 150 },
              { x: 200, y: 110 },
            ].map((p, idx) => (
              <motion.g
                key={`prune-leaf-${idx}`}
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: [0, 1.4, 0], rotate: [0, 180], y: [0, 25] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: idx * 0.3 }}
                transform={`translate(${p.x}, ${p.y})`}
              >
                <circle cx="0" cy="0" r="5" fill="#34d399" filter="url(#fairyGlow)" />
                <path d="M -4,-4 L 4,4 M 4,-4 L -4,4" stroke="#ffffff" strokeWidth="1.5" />
              </motion.g>
            ))}
          </g>
        )}
      </svg>

      {/* Floating Bottom Hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-pink-200/90 pointer-events-none flex items-center gap-1.5 shadow-md">
        <Sparkles className="w-3 h-3 text-amber-300" />
        <span>Toque na árvore para carinho • Frutos nascem com cuidados</span>
      </div>
    </div>
  );
};
