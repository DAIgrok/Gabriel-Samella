import React, { useState, useEffect } from 'react';
import { Calendar, Heart, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VISUAL_ASSETS } from '../data/visualAssets';
import { PumpkinCrestIcon, SnowflakeCrestIcon } from './icons/CustomIcons';

interface DetailedTimeDiff {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  nextAnnivPercent: number;
}

function calculateDetailedElapsed(startIso: string): DetailedTimeDiff {
  const start = new Date(startIso || '2023-06-12T00:00:00');
  const now = new Date();

  if (now.getTime() <= start.getTime()) {
    return {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalDays: 0,
      nextAnnivPercent: 0,
    };
  }

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  let hours = now.getHours() - start.getHours();
  let minutes = now.getMinutes() - start.getMinutes();
  let seconds = now.getSeconds() - start.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes -= 1;
  }
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }
  if (hours < 0) {
    hours += 24;
    days -= 1;
  }
  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const diffMs = now.getTime() - start.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Progress within current relationship year toward next anniversary
  const lastAnniv = new Date(start);
  lastAnniv.setFullYear(start.getFullYear() + Math.max(0, years));
  const nextAnniv = new Date(lastAnniv);
  nextAnniv.setFullYear(lastAnniv.getFullYear() + 1);
  const yearSpan = Math.max(1, nextAnniv.getTime() - lastAnniv.getTime());
  const nextAnnivPercent = Math.min(
    100,
    Math.max(5, Math.round(((now.getTime() - lastAnniv.getTime()) / yearSpan) * 100))
  );

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
    totalDays,
    nextAnnivPercent,
  };
}

export const RelationshipCounter: React.FC = () => {
  const {
    config,
    triggerEasterEgg,
    triggerHeartExplosion,
    activeSeasonalEvent,
    claimSeasonalProp,
  } = useApp();
  const startIso = config.anniversaryDate || '2023-06-12T00:00:00';

  const [timeDiff, setTimeDiff] = useState<DetailedTimeDiff>(() =>
    calculateDetailedElapsed(startIso)
  );

  useEffect(() => {
    const update = () => setTimeDiff(calculateDetailedElapsed(startIso));
    update();
    const interval = window.setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startIso]);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHeartExplosion();
    triggerEasterEgg('egg-time-heart');
  };

  const formattedStartDate = (() => {
    try {
      return new Date(startIso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return '12 de junho de 2023';
    }
  })();

  const pad = (n: number) => String(n).padStart(2, '0');

  const topUnits = [
    { value: timeDiff.years, label: timeDiff.years === 1 ? 'ano' : 'anos', accent: 'text-pink-200' },
    { value: timeDiff.months, label: timeDiff.months === 1 ? 'mês' : 'meses', accent: 'text-purple-100' },
    { value: timeDiff.days, label: timeDiff.days === 1 ? 'dia' : 'dias', accent: 'text-pink-200' },
  ];

  const liveUnits = [
    { value: pad(timeDiff.hours), label: 'horas' },
    { value: pad(timeDiff.minutes), label: 'minutos' },
    { value: pad(timeDiff.seconds), label: 'segundos' },
  ];

  const borderTheme =
    activeSeasonalEvent === 'natal'
      ? 'border-amber-400/45 shadow-[0_10px_40px_rgba(251,191,36,0.18)]'
      : activeSeasonalEvent === 'halloween'
      ? 'border-orange-500/45 shadow-[0_10px_40px_rgba(249,115,22,0.18)]'
      : activeSeasonalEvent === 'namorados'
      ? 'border-rose-400/45 shadow-[0_10px_40px_rgba(251,113,133,0.22)]'
      : 'border-purple-500/25 shadow-[0_10px_35px_rgba(0,0,0,0.6)]';

  return (
    <div className="relative pt-2">
      {/* Papai Noel ilustrado sentado no topo do contador durante a temporada de Natal */}
      {activeSeasonalEvent === 'natal' && (
        <button
          type="button"
          onClick={() =>
            claimSeasonalProp(
              'santa-counter-topper',
              12,
              'Presente do Papai Noel no Contador!'
            )
          }
          title="Toque no Papai Noel para receber um mimo de Natal"
          className="absolute -top-7 right-4 z-20 flex items-end gap-2 group cursor-pointer"
        >
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1a0a2e]/95 border border-amber-300/45 text-[10px] font-bold text-amber-200 shadow-lg">
            <SnowflakeCrestIcon className="w-3 h-3 text-sky-200" />
            <span>Natal Encantado</span>
          </span>
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-300/60 shadow-[0_6px_22px_rgba(251,191,36,0.45)] bg-[#140724] group-hover:scale-105 transition-transform">
            <img
              src={VISUAL_ASSETS.santaCounterTopper}
              alt="Papai Noel no contador"
              className="w-full h-full object-cover"
            />
          </div>
        </button>
      )}

      <div
        className={`rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#160a2c]/90 via-[#0e051c]/90 to-[#070210]/95 border ${borderTheme} relative overflow-hidden backdrop-blur-xl flex flex-col justify-between`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between mb-2.5 gap-2">
          <div className="flex items-center gap-2">
            {activeSeasonalEvent === 'halloween' ? (
              <PumpkinCrestIcon className="w-4 h-4 text-orange-400" />
            ) : activeSeasonalEvent === 'natal' ? (
              <SnowflakeCrestIcon className="w-4 h-4 text-sky-300" />
            ) : (
              <Heart className="w-4 h-4 text-pink-400 stroke-[2.2]" />
            )}
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Quanto tempo estamos juntos
            </h3>
          </div>

          <div
            className={`flex items-center gap-2 ${
              activeSeasonalEvent === 'natal' ? 'pr-16 sm:pr-20' : ''
            }`}
          >
            <span className="px-2 py-0.5 rounded-full bg-pink-500/15 border border-pink-400/30 text-[10px] font-bold text-pink-200 tabular-nums">
              {timeDiff.totalDays} dias no total
            </span>
            <button
              onClick={handleHeartClick}
              className="text-pink-400/70 hover:text-pink-300 transition-colors cursor-pointer"
              title="Surpresa do coração"
            >
              <Heart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      {/* Detailed Chronometer: Years / Months / Days + Hours / Minutes / Seconds */}
      <div className="space-y-2 my-1">
        <div className="grid grid-cols-3 gap-2">
          {topUnits.map((unit) => (
            <div
              key={unit.label}
              className="rounded-2xl py-2 px-1 bg-purple-950/55 border border-purple-500/25 text-center shadow-inner"
            >
              <span className={`text-xl sm:text-2xl font-bold tracking-tight font-display block tabular-nums ${unit.accent}`}>
                {unit.value}
              </span>
              <span className="text-[11px] text-purple-200/75 font-medium">
                {unit.label}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {liveUnits.map((unit) => (
            <div
              key={unit.label}
              className="rounded-2xl py-2 px-1 bg-black/35 border border-pink-500/20 text-center"
            >
              <span className="text-lg sm:text-xl font-bold text-white tracking-tight font-mono block tabular-nums">
                {unit.value}
              </span>
              <span className="text-[10px] text-pink-300/80 font-medium">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Exact Start Date */}
      <div className="flex items-center justify-between gap-2 text-[11px] text-purple-200/80 mt-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-purple-300 shrink-0" />
          <span>Desde {formattedStartDate}</span>
        </div>
        <div className="flex items-center gap-1 text-pink-300/80 font-mono text-[10px]">
          <Clock className="w-3 h-3" />
          <span>ao vivo</span>
        </div>
      </div>

      {/* Progress track toward next anniversary */}
      <div className="relative w-full my-1.5 flex items-center">
        <div className="w-full h-1.5 bg-purple-950/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-400 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${timeDiff.nextAnnivPercent}%` }}
          />
        </div>
        <div
          className="absolute -top-1.5 text-pink-400 transition-all pointer-events-none drop-shadow-[0_0_8px_rgba(244,114,182,0.9)]"
          style={{ left: `${timeDiff.nextAnnivPercent}%`, transform: 'translateX(-50%)' }}
        >
          <Heart className="w-4 h-4 fill-pink-400" />
        </div>
      </div>

      {/* Romantic cursive quote */}
      <div className="text-right pt-0.5">
        <span className="font-romantic text-base sm:text-lg text-pink-300/90 drop-shadow-[0_0_8px_rgba(244,114,182,0.4)]">
          E que venham muitos mais.... ♡
        </span>
      </div>
      </div>
    </div>
  );
};
