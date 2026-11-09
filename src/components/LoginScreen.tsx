import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Lock, KeyRound, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { soundEngine } from '../utils/audioSynth';

export const LoginScreen: React.FC = () => {
  const { setIsLoggedIn, config, triggerHeartExplosion } = useApp();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUnlock = (overridePass?: string) => {
    const input = overridePass !== undefined ? overridePass : passcode;
    setIsSubmitting(true);
    setError(false);

    setTimeout(() => {
      // Accept passcode (e.g. 1206) or direct button unlock for Samella!
      if (!input || input === config.passcode || input === '1206' || input === '12/06') {
        soundEngine.playSparkle();
        triggerHeartExplosion(0.5, 0.5);
        setIsLoggedIn(true);
      } else {
        soundEngine.playHeartPop();
        setError(true);
        setIsSubmitting(false);
      }
    }, 400);
  };

  const handleKeyPress = (num: string) => {
    soundEngine.playHeartPop();
    if (passcode.length < 4) {
      const next = passcode + num;
      setPasscode(next);
      if (next.length === 4) {
        handleUnlock(next);
      }
    }
  };

  const handleDelete = () => {
    setPasscode((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div
      id="login-screen"
      className="fixed inset-0 z-40 flex items-center justify-center px-4 py-8 select-none bg-[#080214] overflow-y-auto"
    >
      {/* Background romantic glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-pink-600/15 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-sm glass-card-glow rounded-3xl p-6 md:p-8 text-center border border-purple-400/25 relative z-10 my-auto shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
      >
        {/* Glowing Heart Emblem */}
        <div className="mx-auto w-16 h-16 rounded-2xl glass-panel flex items-center justify-center mb-4 border border-pink-400/30 shadow-[0_0_25px_rgba(244,114,182,0.3)]">
          <Heart className="w-8 h-8 text-pink-400 fill-pink-500/60 neon-glow-pink animate-pulse" />
        </div>

        {/* Title */}
        <h1 className="font-romantic text-4xl text-pink-200 neon-title-glow mb-1">
          Nosso Mundo <span className="text-pink-400">♡</span>
        </h1>
        <p className="text-xs text-purple-300/80 mb-6">
          Bem-vinda, minha princesa <strong className="text-pink-300">{config.partnerName}</strong>
        </p>

        {/* Passcode Circles */}
        <div className="flex justify-center items-center gap-3 mb-6">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = passcode.length > idx;
            return (
              <motion.div
                key={idx}
                animate={
                  error
                    ? { x: [-10, 10, -8, 8, -4, 4, 0] }
                    : { scale: isFilled ? [1, 1.25, 1] : 1 }
                }
                transition={{ duration: 0.3 }}
                className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                  isFilled
                    ? 'bg-pink-400 border-pink-300 shadow-[0_0_12px_rgba(244,114,182,0.9)]'
                    : 'bg-purple-950/60 border-purple-400/30'
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-rose-300 mb-4 bg-rose-950/50 py-1.5 px-3 rounded-lg border border-rose-500/30"
            >
              Senha incorreta! Dica: 1206 (data do nosso namoro)
            </motion.p>
          )}
        </AnimatePresence>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 mb-6 max-w-[240px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              id={`keypad-${num}`}
              onClick={() => handleKeyPress(num)}
              className="h-12 rounded-2xl glass-panel-interactive flex items-center justify-center text-lg font-medium text-white/90 active:scale-95 transition-transform border border-purple-500/20"
            >
              {num}
            </button>
          ))}
          <button
            id="keypad-clear"
            onClick={handleDelete}
            className="h-12 rounded-2xl glass-panel-interactive flex items-center justify-center text-xs text-purple-300 active:scale-95 transition-transform"
          >
            Apagar
          </button>
          <button
            id="keypad-0"
            onClick={() => handleKeyPress('0')}
            className="h-12 rounded-2xl glass-panel-interactive flex items-center justify-center text-lg font-medium text-white/90 active:scale-95 transition-transform border border-purple-500/20"
          >
            0
          </button>
          <button
            id="keypad-date-quick"
            onClick={() => handleUnlock('1206')}
            title="Preencher data do namoro (12/06)"
            className="h-12 rounded-2xl glass-panel-interactive flex items-center justify-center text-xs text-pink-300 active:scale-95 transition-transform border border-pink-500/30"
          >
            12/06
          </button>
        </div>

        {/* Direct One-Click Button for Samella */}
        <button
          id="btn-direct-login"
          onClick={() => handleUnlock('1206')}
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(236,72,153,0.4)] active:scale-[0.98] transition-all hover:brightness-110"
        >
          <Sparkles className="w-4 h-4 text-pink-200" />
          <span>Entrar no Nosso Mundo</span>
          <ArrowRight className="w-4 h-4 text-white/80" />
        </button>

        <p className="text-[11px] text-purple-300/50 mt-4 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3 text-pink-400/70" />
          Acesso seguro e exclusivo para Samella & Gabriel
        </p>
      </motion.div>
    </div>
  );
};
