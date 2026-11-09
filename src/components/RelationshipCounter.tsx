import React, { useState, useEffect } from 'react';
import { Calendar, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RelationshipCounter: React.FC = () => {
  const { config, triggerEasterEgg, triggerHeartExplosion } = useApp();

  // Time state matching live calculation or starting from 12 de junho de 2023
  const [timeDiff, setTimeDiff] = useState({
    days: 878,
    hours: 16,
    minutes: 22,
    seconds: 13,
  });

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(config.anniversaryDate || '2023-06-12T00:00:00').getTime();
      const now = new Date().getTime();
      const diffMs = Math.max(0, now - start);

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
      const seconds = Math.floor((diffMs / 1000) % 60);

      setTimeDiff({
        days,
        hours,
        minutes,
        seconds,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [config.anniversaryDate]);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHeartExplosion();
    triggerEasterEgg('egg-counter-heart');
  };

  // Heart indicator position along the love bar (e.g. 78%)
  const progressPercent = 75;

  return (
    <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#160a2c]/90 via-[#0e051c]/90 to-[#070210]/95 border border-purple-500/25 shadow-[0_10px_35px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-xl flex flex-col justify-between">
      {/* Top Header: "Nosso tempo" with pink heart outline matching screenshot */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-pink-400 stroke-[2.2]" />
          <h3 className="text-sm font-semibold text-white tracking-wide">
            Nosso tempo
          </h3>
        </div>

        <button
          onClick={handleHeartClick}
          className="text-pink-400/60 hover:text-pink-300 transition-colors cursor-pointer"
        >
          <Heart className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Big Numbers Row matching screenshot: 878 dias / 16 horas / 22 min / 13 seg */}
      <div className="grid grid-cols-4 gap-2 text-center my-2">
        <div>
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display block">
            {timeDiff.days}
          </span>
          <span className="text-[11px] text-purple-200/70 font-medium">
            dias
          </span>
        </div>

        <div>
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display block">
            {timeDiff.hours}
          </span>
          <span className="text-[11px] text-purple-200/70 font-medium">
            horas
          </span>
        </div>

        <div>
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display block">
            {timeDiff.minutes}
          </span>
          <span className="text-[11px] text-purple-200/70 font-medium">
            min
          </span>
        </div>

        <div>
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display block">
            {timeDiff.seconds}
          </span>
          <span className="text-[11px] text-purple-200/70 font-medium">
            seg
          </span>
        </div>
      </div>

      {/* Since date: "Desde 12 de junho de 2023" */}
      <div className="flex items-center gap-2 text-xs text-purple-200/80 mt-1 mb-2">
        <Calendar className="w-3.5 h-3.5 text-purple-300" />
        <span>Desde 12 de junho de 2023</span>
      </div>

      {/* Progress track with sliding pink Heart matching screenshot */}
      <div className="relative w-full my-2 flex items-center">
        <div className="w-full h-1.5 bg-purple-950/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-400 to-pink-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {/* Heart Marker */}
        <div
          className="absolute -top-1.5 text-pink-400 transition-all pointer-events-none drop-shadow-[0_0_8px_rgba(244,114,182,0.9)]"
          style={{ left: `${progressPercent}%`, transform: 'translateX(-50%)' }}
        >
          <Heart className="w-4 h-4 fill-pink-400" />
        </div>
      </div>

      {/* Romantic cursive quote matching screenshot at bottom right */}
      <div className="text-right pt-1">
        <span className="font-romantic text-base sm:text-lg text-pink-300/90 drop-shadow-[0_0_8px_rgba(244,114,182,0.4)]">
          E que venham muitos mais.... ♡
        </span>
      </div>
    </div>
  );
};
