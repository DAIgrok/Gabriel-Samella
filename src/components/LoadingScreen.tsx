import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoadingScreen: React.FC = () => {
  const { setIsLoadingDone, config } = useApp();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsLoadingDone(true);
          }, 400);
          return 100;
        }
        return prev + 4;
      });
    }, 45);

    return () => clearInterval(timer);
  }, [setIsLoadingDone]);

  return (
    <motion.div
      id="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070112] px-6 text-center select-none overflow-hidden"
    >
      {/* Background radial glow */}
      <div className="absolute w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-72 h-72 rounded-full bg-pink-500/15 blur-2xl pointer-events-none" />

      {/* Floating glowing heart with pulse */}
      <div className="relative mb-8">
        <motion.div
          animate={{
            scale: [1, 1.18, 1],
            rotate: [0, -3, 3, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative z-10 w-24 h-24 rounded-3xl glass-card-glow flex items-center justify-center border border-pink-400/40 shadow-[0_0_40px_rgba(244,114,182,0.4)]"
        >
          <Heart className="w-12 h-12 text-pink-400 fill-pink-500/80 neon-glow-pink drop-shadow-[0_0_15px_rgba(244,114,182,0.9)]" />
        </motion.div>

        {/* Ambient aura rings */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-0 rounded-3xl border border-pink-400/30"
        />
      </div>

      {/* App Logo & Title matching reference handwriting style */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-romantic text-5xl md:text-6xl text-pink-300 neon-title-glow tracking-wide mb-2"
      >
        Nosso Mundo <span className="text-pink-400">♡</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-purple-200/80 text-sm md:text-base font-light max-w-xs mb-8"
      >
        Um universo particular feito especialmente para {config.partnerName} & {config.myName}
      </motion.p>

      {/* Progress Bar Container */}
      <div className="w-64 max-w-full">
        <div className="h-1.5 w-full bg-purple-950/80 rounded-full overflow-hidden border border-purple-500/20 p-0.5">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 rounded-full shadow-[0_0_12px_rgba(244,114,182,0.7)]"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut' }}
          />
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-purple-300/60 font-mono">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-pink-400 animate-spin" />
            Carregando memórias...
          </span>
          <span>{progress}%</span>
        </div>
      </div>
    </motion.div>
  );
};
