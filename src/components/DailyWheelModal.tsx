import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Gift, Clock, Heart, Lock, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COOLDOWN_MS } from '../data/initialData';
import { soundEngine } from '../utils/audioSynth';

interface WheelSlice {
  label: string;
  shortLabel: string;
  coins: number;
  color: string;
}

const WHEEL_SLICES: WheelSlice[] = [
  { label: '+2 Diamantes', shortLabel: '+2', coins: 2, color: '#6b21a8' },
  { label: '+4 Diamantes', shortLabel: '+4', coins: 4, color: '#be185d' },
  { label: '+3 Diamantes', shortLabel: '+3', coins: 3, color: '#4c1d95' },
  { label: '+6 Diamantes', shortLabel: '+6', coins: 6, color: '#db2777' },
  { label: '+2 Diamantes', shortLabel: '+2', coins: 2, color: '#581c87' },
  { label: '+5 Diamantes', shortLabel: '+5', coins: 5, color: '#9d174d' },
  { label: 'Vale Beijo & +4 Diamantes', shortLabel: 'Beijo ♡', coins: 4, color: '#7e22ce' },
  { label: '+8 Diamantes!', shortLabel: '+8', coins: 8, color: '#ec4899' },
];

export function formatWheelRemaining(ms: number): string {
  if (ms <= 0) return '';
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}h ${m < 10 ? '0' : ''}${m}m ${s < 10 ? '0' : ''}${s}s`;
}

export const DailyWheelModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { dailyWheel, spinDailyWheel, isSpectator } = useApp();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [wonSlice, setWonSlice] = useState<WheelSlice | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const spinTimerRef = React.useRef<number | null>(null);

  useEffect(() => {
    const t = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => {
      window.clearInterval(t);
      if (spinTimerRef.current) {
        window.clearTimeout(spinTimerRef.current);
      }
    };
  }, []);

  const remainingMs = dailyWheel.lastSpinAt
    ? Math.max(0, dailyWheel.lastSpinAt + COOLDOWN_MS.wheel_spin - nowMs)
    : 0;
  const canSpin = !isSpectator && remainingMs === 0 && !spinning;

  const sliceAngle = 360 / WHEEL_SLICES.length;
  const conicStops = WHEEL_SLICES.map(
    (s, idx) => `${s.color} ${idx * sliceAngle}deg ${(idx + 1) * sliceAngle}deg`
  ).join(', ');

  const handleSpin = () => {
    if (!canSpin) return;
    soundEngine.playHeartPop();
    const targetIdx = Math.floor(Math.random() * WHEEL_SLICES.length);
    const chosen = WHEEL_SLICES[targetIdx];

    // Pointer sits at top (0 deg). Center of slice i is at (i + 0.5) * sliceAngle.
    const centerDeg = (targetIdx + 0.5) * sliceAngle;
    const jitter = (Math.random() - 0.5) * (sliceAngle * 0.45);
    const fullSpins = 5 * 360;
    const nextAngle = rotation + fullSpins + (360 - (rotation % 360)) + (360 - centerDeg) + jitter;

    setSpinning(true);
    setWonSlice(null);
    setRotation(nextAngle);

    if (spinTimerRef.current) {
      window.clearTimeout(spinTimerRef.current);
    }
    spinTimerRef.current = window.setTimeout(() => {
      spinTimerRef.current = null;
      setSpinning(false);
      const ok = spinDailyWheel(chosen.label, chosen.coins);
      if (ok) {
        setWonSlice(chosen);
      }
    }, 4100);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#1b0933] via-[#100424] to-[#080214] border border-pink-400/35 shadow-2xl space-y-5 relative text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar Roleta"
          className="absolute top-4 right-4 min-w-[40px] min-h-[40px] rounded-full bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <span className="text-xs font-semibold text-pink-300 inline-flex items-center gap-1">
            <Gift className="w-3.5 h-3.5" /> Roleta Diária do Amor
          </span>
          <h3 className="text-xl font-bold text-white font-display">Gire e Ganhe Surpresas ♡</h3>
          <p className="text-xs text-purple-200/75">1 giro especial a cada 24 horas</p>
        </div>

        {/* Wheel Visual */}
        <div className="relative w-64 h-64 mx-auto">
          {/* Top Pointer */}
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-amber-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />

          <div
            style={{
              background: `conic-gradient(${conicStops})`,
              transform: `rotate(${rotation}deg)`,
              transition: 'transform 4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="w-full h-full rounded-full border-4 border-pink-300/70 shadow-[0_0_30px_rgba(236,72,153,0.45)] relative overflow-hidden"
          >
            {WHEEL_SLICES.map((s, idx) => {
              const midDeg = (idx + 0.5) * sliceAngle;
              return (
                <div
                  key={idx}
                  style={{ transform: `rotate(${midDeg}deg)` }}
                  className="absolute inset-0 flex items-start justify-center pt-4 pointer-events-none"
                >
                  <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] tabular-nums">
                    {s.shortLabel}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#120426] border-2 border-pink-300 flex items-center justify-center shadow-lg z-10">
            <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
          </div>
        </div>

        {isSpectator && (
          <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-xs text-purple-200 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-pink-300 shrink-0" />
            <span>Modo Espectador ativo: apenas a Samella pode girar e resgatar diamantes.</span>
          </div>
        )}

        {wonSlice && (
          <div className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-400/40 text-sm font-bold text-emerald-200 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>Parabéns! Você ganhou: {wonSlice.label}!</span>
          </div>
        )}

        {!isSpectator && remainingMs > 0 && !wonSlice && (
          <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-xs text-purple-200 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-pink-300" />
            <span>
              Próximo giro em <strong className="font-mono text-pink-200">{formatWheelRemaining(remainingMs)}</strong>
            </span>
          </div>
        )}

        <button
          type="button"
          disabled={!canSpin}
          onClick={handleSpin}
          className="w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold shadow-lg disabled:opacity-45 cursor-pointer active:scale-95 transition"
        >
          {isSpectator
            ? 'Bloqueado no Modo Espectador'
            : spinning
            ? 'Girando a Roleta...'
            : canSpin
            ? 'Girar Roleta Agora!'
            : 'Já girada hoje'}
        </button>
      </div>
    </div>,
    document.body
  );
};
