import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

interface Particle {
  x: number;
  y: number;
  z: number; // depth 0.3..1.0
  vx: number;
  vy: number;
  size: number;
  angle: number;
  spin: number;
  alpha: number;
  color: string;
  phase: number;
}

export const AmbientParticlesCanvas: React.FC = () => {
  const { activeSeasonalMeta } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mode = activeSeasonalMeta.particleMode;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const isMobile = width < 768;
    const baseCount =
      mode === 'snow'
        ? isMobile
          ? 42
          : 78
        : mode === 'petals'
        ? isMobile
          ? 24
          : 44
        : mode === 'ember-mist'
        ? isMobile
          ? 30
          : 52
        : mode === 'confetti'
        ? isMobile
          ? 34
          : 60
        : isMobile
        ? 16
        : 28;

    const count = prefersReduced ? Math.max(6, Math.round(baseCount * 0.25)) : baseCount;

    const palettes: Record<typeof mode, string[]> = {
      snow: ['#ffffff', '#e0f2fe', '#fce7f3'],
      'ember-mist': ['#fb923c', '#f97316', '#c084fc', '#fde047'],
      petals: ['#fb7185', '#f43f5e', '#f472b6', '#fda4af'],
      confetti: ['#fbbf24', '#f472b6', '#c084fc', '#38bdf8', '#fde68a'],
      fireflies: ['#f472b6', '#c084fc', '#e879f9'],
    };

    const createParticle = (initial = false): Particle => {
      const z = 0.35 + Math.random() * 0.65;
      const palette = palettes[mode];
      const color = palette[Math.floor(Math.random() * palette.length)];

      if (mode === 'ember-mist') {
        return {
          x: Math.random() * width,
          y: initial ? Math.random() * height : height + 20,
          z,
          vx: (Math.random() - 0.5) * 0.45 * z,
          vy: -(0.35 + Math.random() * 0.9) * z,
          size: (1.5 + Math.random() * 3.2) * z,
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.03,
          alpha: 0.35 + Math.random() * 0.55,
          color,
          phase: Math.random() * Math.PI * 2,
        };
      }

      if (mode === 'fireflies') {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          z,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.22,
          size: (1.2 + Math.random() * 2.2) * z,
          angle: Math.random() * Math.PI * 2,
          spin: 0.015,
          alpha: 0.2 + Math.random() * 0.55,
          color,
          phase: Math.random() * Math.PI * 2,
        };
      }

      return {
        x: Math.random() * width,
        y: initial ? Math.random() * height : -24 - Math.random() * 60,
        z,
        vx: (Math.random() - 0.5) * (mode === 'petals' ? 0.7 : 0.45) * z,
        vy:
          mode === 'snow'
            ? (0.55 + Math.random() * 1.15) * z
            : mode === 'petals'
            ? (0.7 + Math.random() * 1.0) * z
            : (0.9 + Math.random() * 1.5) * z,
        size:
          mode === 'snow'
            ? (1.6 + Math.random() * 3.6) * z
            : mode === 'petals'
            ? (5 + Math.random() * 6) * z
            : (2.8 + Math.random() * 3.8) * z,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.04,
        alpha: 0.38 + z * 0.52,
        color,
        phase: Math.random() * Math.PI * 2,
      };
    };

    const particles: Particle[] = Array.from({ length: count }, () => createParticle(true));
    let rafId = 0;
    let time = 0;

    const renderFrame = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      // Subtle drifting violet-amber mist wisps at bottom during Halloween
      if (mode === 'ember-mist') {
        const mistGrad = ctx.createLinearGradient(0, height * 0.72, 0, height);
        mistGrad.addColorStop(0, 'rgba(88, 28, 135, 0)');
        mistGrad.addColorStop(1, 'rgba(124, 45, 18, 0.16)');
        ctx.fillStyle = mistGrad;
        ctx.fillRect(0, height * 0.72, width, height * 0.28);
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const motionFactor = prefersReduced ? 0.25 : 1;

        p.phase += 0.02 * motionFactor;
        p.angle += p.spin * motionFactor;
        p.x += (p.vx + Math.sin(p.phase) * 0.35 * p.z) * motionFactor;
        p.y += p.vy * motionFactor;

        if (mode === 'ember-mist') {
          if (p.y < -20) {
            particles[i] = createParticle(false);
            continue;
          }
        } else if (mode === 'fireflies') {
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;
        } else {
          if (p.y > height + 24) {
            particles[i] = createParticle(false);
            continue;
          }
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.globalAlpha =
          mode === 'fireflies'
            ? p.alpha * (0.45 + 0.55 * Math.sin(time * 2 + p.phase))
            : p.alpha;

        if (mode === 'snow') {
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 1.9);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.55, p.color);
          grad.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 1.9, 0, Math.PI * 2);
          ctx.fill();
        } else if (mode === 'petals') {
          ctx.rotate(p.angle);
          ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.cos(p.phase)));
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.bezierCurveTo(p.size * 0.9, -p.size * 0.4, p.size * 0.85, p.size * 0.7, 0, p.size);
          ctx.bezierCurveTo(-p.size * 0.85, p.size * 0.7, -p.size * 0.9, -p.size * 0.4, 0, -p.size);
          ctx.fill();
        } else if (mode === 'confetti') {
          ctx.rotate(p.angle);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size * 0.6, -p.size * 0.35, p.size * 1.2, p.size * 0.7);
        } else {
          // ember-mist & fireflies
          const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2.5);
          glow.addColorStop(0, '#ffffff');
          glow.addColorStop(0.35, p.color);
          glow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      rafId = window.requestAnimationFrame(renderFrame);
    };

    rafId = window.requestAnimationFrame(renderFrame);
    window.addEventListener('resize', resize);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-20"
    />
  );
};
