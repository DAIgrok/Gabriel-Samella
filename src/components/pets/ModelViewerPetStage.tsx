import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Heart, Palette, Play, Sparkles, Utensils } from 'lucide-react';
import type { ModelViewerElement } from '../../types/model-viewer';
import { formatCooldownMs } from '../../context/AppContext';

export const DEFAULT_SKETCHFAB_CAT_URL = 'https://skfb.ly/pQwNL';

export interface ModelViewerPetStageProps {
  src?: string;
  alt: string;
  colorHex: string;
  isSpectator?: boolean;
  cdPet?: number;
  cdFeed?: number;
  onColorChange?: (hex: string) => void;
  onPetTap?: () => void;
  onFeedPet?: () => void;
  fallback: React.ReactNode;
}

interface HeartParticle {
  id: number;
  x: number;
  y: number;
  driftX: number;
  scale: number;
}

const TALKING_TOM_SWATCHES = [
  { hex: '#ffffff', label: 'Branco Neve' },
  { hex: '#f9a8d4', label: 'Rosa Algodão' },
  { hex: '#c084fc', label: 'Lilás Mágico' },
  { hex: '#fbbf24', label: 'Caramelo Dourado' },
  { hex: '#7dd3fc', label: 'Azul Celeste' },
  { hex: '#334155', label: 'Meia-Noite' },
];

function hexToRgbaFactor(hex: string): [number, number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return [1, 1, 1, 1];
  }
  return [r, g, b, 1];
}

function applyMaterialColor(mv: ModelViewerElement | null, hex: string) {
  if (!mv?.model?.materials) return;
  const factor = hexToRgbaFactor(hex);
  for (const material of mv.model.materials) {
    if (material.pbrMetallicRoughness?.setBaseColorFactor) {
      material.pbrMetallicRoughness.setBaseColorFactor(factor);
    }
  }
}

export const ModelViewerPetStage: React.FC<ModelViewerPetStageProps> = ({
  src = DEFAULT_SKETCHFAB_CAT_URL,
  alt,
  colorHex,
  isSpectator = false,
  cdPet = 0,
  cdFeed = 0,
  onColorChange,
  onPetTap,
  onFeedPet,
  fallback,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const mvRef = useRef<ModelViewerElement | null>(null);
  const animCursorRef = useRef(0);
  const jumpTimerRef = useRef<number | null>(null);

  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [animations, setAnimations] = useState<string[]>([]);
  const [activeAnim, setActiveAnim] = useState<string>('');
  const [localColor, setLocalColor] = useState<string>(colorHex || '#ffffff');
  const [isJumping, setIsJumping] = useState(false);
  const [particles, setParticles] = useState<HeartParticle[]>([]);

  useEffect(() => {
    setLocalColor(colorHex || '#ffffff');
  }, [colorHex]);

  useEffect(() => {
    return () => {
      if (jumpTimerRef.current) {
        window.clearTimeout(jumpTimerRef.current);
      }
    };
  }, []);

  // Verify local GLB files (Vite SPA serves text/html for missing local paths); remote URLs pass straight to <model-viewer>
  useEffect(() => {
    let active = true;
    setHasError(false);
    setIsLoaded(false);
    setAnimations([]);

    const checkAsset = async () => {
      if (!src) {
        if (active) setHasError(true);
        return;
      }
      if (src.startsWith('http://') || src.startsWith('https://')) {
        return;
      }
      try {
        const res = await fetch(src, { method: 'GET', headers: { Range: 'bytes=0-15' } });
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || contentType.includes('text/html')) {
          if (active) setHasError(true);
          return;
        }
        const buf = await res.arrayBuffer();
        const bytes = new Uint8Array(buf);
        const isGlb =
          bytes.length >= 4 &&
          bytes[0] === 0x67 &&
          bytes[1] === 0x6c &&
          bytes[2] === 0x54 &&
          bytes[3] === 0x46;
        const isGltfJson = bytes.length >= 1 && bytes[0] === 0x7b;
        if (!isGlb && !isGltfJson) {
          if (active) setHasError(true);
        }
      } catch {
        if (active) setHasError(true);
      }
    };

    checkAsset();
    return () => {
      active = false;
    };
  }, [src]);

  // Listen to <model-viewer> load & error events
  useEffect(() => {
    const mv = mvRef.current;
    if (!mv || hasError) return;

    const handleLoad = () => {
      setIsLoaded(true);
      const list = Array.isArray(mv.availableAnimations) ? mv.availableAnimations : [];
      setAnimations(list);
      if (list.length > 0 && !activeAnim) {
        setActiveAnim(list[0]);
      }
      applyMaterialColor(mv, localColor);
    };

    const handleError = () => {
      setHasError(true);
    };

    mv.addEventListener('load', handleLoad);
    mv.addEventListener('error', handleError);

    if (mv.model) {
      handleLoad();
    }

    return () => {
      mv.removeEventListener('load', handleLoad);
      mv.removeEventListener('error', handleError);
    };
  }, [hasError, src]);

  // Apply color in real time whenever localColor changes after load
  useEffect(() => {
    if (!isLoaded || hasError) return;
    applyMaterialColor(mvRef.current, localColor);
  }, [localColor, isLoaded, hasError]);

  const spawnHeartsBurst = (count = 6) => {
    const batch: HeartParticle[] = Array.from({ length: count }, (_, idx) => ({
      id: Date.now() + Math.random() + idx,
      x: 30 + Math.random() * 40,
      y: 35 + Math.random() * 25,
      driftX: (Math.random() - 0.5) * 64,
      scale: 0.75 + Math.random() * 0.55,
    }));
    setParticles((prev) => [...prev.slice(-14), ...batch]);
    window.setTimeout(() => {
      const ids = new Set(batch.map((p) => p.id));
      setParticles((prev) => prev.filter((p) => !ids.has(p.id)));
    }, 950);
  };

  const triggerJoyJump = () => {
    if (prefersReducedMotion) return;
    if (jumpTimerRef.current) {
      window.clearTimeout(jumpTimerRef.current);
    }
    setIsJumping(true);
    jumpTimerRef.current = window.setTimeout(() => {
      setIsJumping(false);
    }, 620);
  };

  const switchAnimationByKeywords = (keywords: RegExp) => {
    const mv = mvRef.current;
    const avail = Array.isArray(mv?.availableAnimations) ? mv.availableAnimations : animations;
    if (!mv || !avail || avail.length === 0) return;

    const matched = avail.find((name) => keywords.test(name));
    let nextAnim = matched;
    if (!nextAnim || (nextAnim === activeAnim && avail.length > 1)) {
      animCursorRef.current = (animCursorRef.current + 1) % avail.length;
      nextAnim = avail[animCursorRef.current];
    }
    if (nextAnim) {
      setActiveAnim(nextAnim);
      mv.animationName = nextAnim;
      mv.play?.();
    }
  };

  const applyColorHex = (hex: string) => {
    setLocalColor(hex);
    applyMaterialColor(mvRef.current, hex);
    if (!isSpectator) {
      onColorChange?.(hex);
    }
  };

  const handleColorInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyColorHex(e.target.value);
  };

  const handlePlayAnimation = (animName: string) => {
    const mv = mvRef.current;
    if (!mv) return;
    setActiveAnim(animName);
    mv.animationName = animName;
    mv.play?.();
  };

  const handlePetAction = () => {
    spawnHeartsBurst(6);
    triggerJoyJump();
    switchAnimationByKeywords(/pet|love|happy|jump|purr|idle|sit/i);
    onPetTap?.();
  };

  const handleFeedAction = () => {
    spawnHeartsBurst(5);
    triggerJoyJump();
    switchAnimationByKeywords(/eat|feed|food|chomp|happy|walk|run/i);
    onFeedPet?.();
  };

  return (
    <div className="w-full space-y-3 text-center">
      {/* Stage com degradê fofo e moderno */}
      <div
        onClick={handlePetAction}
        className="relative w-full rounded-[26px] overflow-hidden border border-pink-300/35 shadow-[0_14px_38px_rgba(236,72,153,0.24)] cursor-pointer select-none"
        style={{
          background:
            'linear-gradient(155deg, rgba(244,114,182,0.34) 0%, rgba(168,85,247,0.28) 46%, rgba(19,6,36,0.94) 100%)',
        }}
      >
        {/* Soft ambient stage glow */}
        <div
          className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full blur-3xl opacity-50"
          style={{ background: localColor === '#ffffff' ? '#f472b6' : localColor }}
        />

        {/* Floating Heart Particles */}
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0.95, y: 0, x: 0, scale: 0.5 }}
              animate={{ opacity: 0, y: -78, x: p.driftX, scale: p.scale }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.88, ease: 'easeOut' }}
              className="pointer-events-none absolute z-30"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <Heart className="w-5 h-5 fill-pink-400 text-pink-200 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Joyful Jump Wrapper */}
        <motion.div
          animate={
            isJumping && !prefersReducedMotion
              ? { y: [0, -24, 0, -10, 0], scale: [1, 1.05, 0.97, 1.02, 1] }
              : { y: 0, scale: 1 }
          }
          transition={{ duration: 0.58, ease: 'easeOut' }}
          className="relative z-10 w-full"
        >
          {!hasError ? (
            <model-viewer
              id="gatinhoPet"
              ref={mvRef}
              src={src}
              alt={alt}
              autoplay
              camera-controls
              shadow-intensity="1.2"
              exposure="1.1"
              interaction-prompt="auto"
              touch-action="pan-y"
              style={{
                width: '100%',
                height: '320px',
                background: 'transparent',
                display: 'block',
              }}
            />
          ) : (
            <div className="py-4 px-2 flex flex-col items-center justify-center min-h-[250px]">
              {fallback}
            </div>
          )}
        </motion.div>
      </div>

      {/* Seletor de Cor Estilo Talking Tom */}
      {!isSpectator && (
        <div className="rounded-2xl bg-black/40 border border-pink-400/25 px-3.5 py-3 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="seletorCor"
              className="text-xs font-bold text-pink-100 flex items-center gap-2 cursor-pointer"
            >
              <span
                className="w-5 h-5 rounded-full border border-white/40 shadow-inner shrink-0"
                style={{ backgroundColor: localColor }}
              />
              <Palette className="w-4 h-4 text-pink-300 shrink-0" />
              <span>Cor do Gatinho</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase text-purple-200/80">
                {localColor}
              </span>
              <input
                type="color"
                id="seletorCor"
                value={localColor}
                onChange={handleColorInput}
                className="w-11 h-8 rounded-xl border border-pink-400/50 bg-transparent cursor-pointer"
                aria-label="Escolha a cor do gatinho"
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {TALKING_TOM_SWATCHES.map((swatch) => {
              const selected = localColor.toLowerCase() === swatch.hex.toLowerCase();
              return (
                <button
                  key={swatch.hex}
                  type="button"
                  onClick={() => applyColorHex(swatch.hex)}
                  title={swatch.label}
                  aria-label={`Aplicar cor ${swatch.label}`}
                  className={`w-7 h-7 rounded-full border-2 transition cursor-pointer active:scale-90 ${
                    selected
                      ? 'border-pink-400 scale-110 shadow-[0_0_12px_rgba(244,114,182,0.85)]'
                      : 'border-white/30 hover:scale-105'
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Botões Estilizados de Carinho & Comida */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={handlePetAction}
          className="min-h-[46px] px-3 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500/85 to-rose-500/85 hover:brightness-110 border border-pink-300/45 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(236,72,153,0.3)] cursor-pointer transition active:scale-95"
        >
          <Heart className="w-4 h-4 fill-current" />
          <span>{cdPet > 0 ? `Carinho (${formatCooldownMs(cdPet)})` : 'Fazer Carinho'}</span>
        </button>

        <button
          type="button"
          onClick={handleFeedAction}
          disabled={isSpectator || cdFeed > 0}
          className="min-h-[46px] px-3 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600/85 to-fuchsia-600/85 hover:brightness-110 border border-purple-300/40 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(168,85,247,0.3)] cursor-pointer transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Utensils className="w-4 h-4" />
          <span>{cdFeed > 0 ? formatCooldownMs(cdFeed) : 'Dar Comida'}</span>
        </button>
      </div>

      {/* Lista dinâmica de animações disponíveis no GLB */}
      {animations.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200/75 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-pink-300" />
            Animações:
          </span>
          {animations.map((anim) => {
            const isActive = activeAnim === anim;
            return (
              <button
                key={anim}
                type="button"
                onClick={() => handlePlayAnimation(anim)}
                className={`min-h-[36px] px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 border transition cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-300 shadow'
                    : 'bg-black/45 border-white/15 text-purple-100 hover:bg-white/10'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{anim}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
