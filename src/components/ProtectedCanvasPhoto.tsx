import React, { useEffect, useRef, useState } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';
import { isIdbMediaUrl, resolveMediaUrl } from '../services/localMediaStore';

interface ProtectedCanvasPhotoProps {
  src: string;
  alt?: string;
  className?: string;
  watermarkText?: string;
  maxWidth?: number;
  maxHeight?: number;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const ProtectedCanvasPhoto: React.FC<ProtectedCanvasPhotoProps> = ({
  src,
  alt = 'Fotografia protegida',
  className = '',
  watermarkText = 'Gabriel & Samella ♡ Privado',
  maxWidth = 1080,
  maxHeight = 1080,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [resolvedSrc, setResolvedSrc] = useState<string>('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let active = true;
    setStatus('loading');

    if (!src) {
      setResolvedSrc('');
      setStatus('error');
      return;
    }

    if (!isIdbMediaUrl(src)) {
      setResolvedSrc(src);
      return;
    }

    resolveMediaUrl(src)
      .then((url) => {
        if (!active) return;
        if (url) {
          setResolvedSrc(url);
        } else {
          setStatus('error');
        }
      })
      .catch(() => {
        if (active) setStatus('error');
      });

    return () => {
      active = false;
    };
  }, [src]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !resolvedSrc) return;

    let cancelled = false;
    let triedWithoutCors = false;
    const img = new Image();

    const drawToCanvas = () => {
      if (cancelled || !canvas) return;
      const naturalW = Math.max(1, img.naturalWidth || 640);
      const naturalH = Math.max(1, img.naturalHeight || 480);

      const scale = Math.min(1, maxWidth / naturalW, maxHeight / naturalH);
      const cssW = Math.max(1, Math.round(naturalW * scale));
      const cssH = Math.max(1, Math.round(naturalH * scale));
      const dpr = Math.min(2, window.devicePixelRatio || 1);

      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setStatus('error');
        return;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.drawImage(img, 0, 0, cssW, cssH);

      // Subtle anti-capture watermark over rendered pixels
      if (watermarkText) {
        ctx.save();
        ctx.translate(cssW / 2, cssH / 2);
        ctx.rotate(-Math.PI / 7);
        ctx.font = `600 ${Math.max(12, Math.round(Math.min(cssW, cssH) * 0.036))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.strokeStyle = 'rgba(10, 2, 22, 0.25)';
        ctx.lineWidth = 2;

        const stepX = Math.max(220, Math.round(cssW * 0.55));
        const stepY = Math.max(110, Math.round(cssH * 0.28));
        for (let y = -cssH; y <= cssH; y += stepY) {
          for (let x = -cssW; x <= cssW; x += stepX) {
            ctx.strokeText(watermarkText, x, y);
            ctx.fillText(watermarkText, x, y);
          }
        }
        ctx.restore();
      }

      ctx.restore();
      setStatus('ready');
    };

    img.onload = drawToCanvas;
    img.onerror = () => {
      if (cancelled) return;
      if (!triedWithoutCors && !resolvedSrc.startsWith('data:')) {
        triedWithoutCors = true;
        img.removeAttribute('crossorigin');
        img.src = resolvedSrc;
      } else {
        setStatus('error');
      }
    };

    if (!resolvedSrc.startsWith('data:') && !resolvedSrc.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.src = resolvedSrc;

    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [resolvedSrc, watermarkText, maxWidth, maxHeight]);

  return (
    <div
      role="img"
      aria-label={alt}
      onClick={onClick}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      className={`relative select-none flex items-center justify-center overflow-hidden ${className}`}
    >
      <canvas
        ref={canvasRef}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        className={`protected-media-canvas max-w-full max-h-full w-auto h-auto object-contain rounded-2xl transition-opacity duration-200 ${
          status === 'ready' ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Transparent shield over canvas preventing long-press browser actions */}
      <div
        aria-hidden="true"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        className="absolute inset-0 z-10 bg-transparent"
      />

      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0f0520]/80">
          <Loader2 className="w-6 h-6 text-pink-300 animate-spin" />
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0f0520]/90 text-purple-200/80 p-4 text-center">
          <ShieldAlert className="w-6 h-6 text-pink-400" />
          <span className="text-xs">Imagem protegida indisponível</span>
        </div>
      )}
    </div>
  );
};
