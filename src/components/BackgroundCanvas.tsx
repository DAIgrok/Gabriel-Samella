import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface BackgroundCanvasProps {
  intensity?: 'normal' | 'soft' | 'romantic';
}

export const BackgroundCanvas: React.FC<BackgroundCanvasProps> = () => {
  // Generate romantic floating golden & pink embers/particles
  const particles = useMemo(() => {
    return Array.from({ length: 38 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 6 + 4,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.7 + 0.3,
      isGold: i % 3 === 0,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#080214]">
      {/* 1. Photographic sunset sky & ocean glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c041d] via-[#1a0730] to-[#080214]" />

      {/* Atmospheric sunset horizon glow with rich orange & rose & purple hues */}
      <div
        className="absolute top-[28%] md:top-[22%] left-0 right-0 h-[50vh] opacity-60 blur-3xl pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 90% 55% at 55% 45%, rgba(249, 115, 22, 0.45) 0%, rgba(236, 72, 153, 0.35) 40%, rgba(147, 51, 234, 0.25) 70%, transparent 100%)',
        }}
      />

      {/* 2. Sunset & Couple Silhouette SVG scene matching reference image */}
      <div className="absolute inset-0 flex items-start justify-center pointer-events-none opacity-85">
        <svg
          viewBox="0 0 1000 1200"
          className="w-full h-full object-cover object-top"
          preserveAspectRatio="xMidYMin slice"
        >
          <defs>
            {/* Setting Sun Glow */}
            <radialGradient id="sunGlowRef" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="25%" stopColor="#fed7aa" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#fb923c" stopOpacity="0.8" />
              <stop offset="85%" stopColor="#e11d48" stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            {/* Sea Horizon Gradient */}
            <linearGradient id="seaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e0b36" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#120524" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#080214" stopOpacity="1" />
            </linearGradient>

            {/* Sky Twilight Gradient */}
            <linearGradient id="twilightSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#090214" stopOpacity="0.9" />
              <stop offset="25%" stopColor="#18072e" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#3b074a" stopOpacity="0.65" />
              <stop offset="70%" stopColor="#831843" stopOpacity="0.6" />
              <stop offset="85%" stopColor="#c2410c" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#090214" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* Setting Sun positioned on the horizon */}
          <circle cx="550" cy="350" r="16" fill="url(#sunGlowRef)" />
          <ellipse cx="550" cy="380" rx="90" ry="10" fill="#f97316" opacity="0.45" filter="blur(6px)" />

          {/* Sea Line & subtle ocean shimmer */}
          <path d="M0,360 L1000,360 L1000,1200 L0,1200 Z" fill="url(#seaGrad)" opacity="0.92" />
          <path
            d="M250,362 Q550,372 850,362"
            stroke="rgba(251, 146, 60, 0.5)"
            strokeWidth="3"
            fill="none"
            filter="blur(1.5px)"
          />

          {/* Realistic Silhouette of the Couple Sitting at Sunset (right side) */}
          <g transform="translate(470, 240) scale(1.15)" opacity="0.98">
            {/* Woman sitting close, head leaning slightly */}
            <path
              d="M105,65 C100,55 90,52 82,60 C72,70 70,95 72,120 C65,135 55,160 50,195 C45,230 40,280 40,330 L160,330 C160,280 150,220 135,170 C128,140 120,115 118,90 C118,75 112,68 105,65 Z"
              fill="#06010f"
            />
            {/* Woman Hair Flow */}
            <path
              d="M85,55 C70,65 65,85 68,115 C72,145 80,165 85,175 C82,150 78,125 76,95 C76,75 80,60 85,55 Z"
              fill="#05010c"
            />

            {/* Man sitting next to her with arm around her */}
            <path
              d="M165,45 C155,42 145,48 140,58 C135,68 135,80 138,92 C125,105 110,125 105,145 C98,170 95,210 95,330 L250,330 C250,270 240,200 220,150 C210,120 195,95 185,80 C182,65 178,50 165,45 Z"
              fill="#06010f"
            />
          </g>
        </svg>
      </div>

      {/* 3. Floating Glowing Neon Outline Hearts (Matching reference image position) */}
      <div className="absolute top-[23%] sm:top-[20%] right-[18%] sm:right-[26%] z-0 pointer-events-none">
        {/* Lower Heart */}
        <motion.div
          animate={{
            y: [-3, 5, -3],
            rotate: [-4, 2, -4],
            scale: [0.98, 1.05, 0.98],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          <svg
            width="46"
            height="46"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="neon-glow-pink opacity-90 transform -rotate-12"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </motion.div>

        {/* Upper Heart floating slightly higher */}
        <motion.div
          animate={{
            y: [3, -7, 3],
            rotate: [6, -2, 6],
            opacity: [0.75, 1, 0.75],
          }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          className="absolute -top-9 left-7"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(244, 114, 182, 0.95)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="neon-glow-pink"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </motion.div>
      </div>

      {/* 4. Floating Bokeh & Embers particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.isGold ? '#fde047' : '#f472b6',
            boxShadow: p.isGold
              ? '0 0 8px 1px rgba(250, 204, 21, 0.85)'
              : '0 0 8px 1px rgba(244, 114, 182, 0.85)',
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, (p.id % 2 === 0 ? 1 : -1) * 12, 0],
            opacity: [p.opacity * 0.4, p.opacity, p.opacity * 0.4],
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* 5. Subtle ambient dark vignette for perfect readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080214] via-transparent to-[#080214]/50 pointer-events-none" />
    </div>
  );
};
