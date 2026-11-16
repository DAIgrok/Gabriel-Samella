import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Heart } from 'lucide-react';

interface FallingHeart {
  id: string;
  batchId: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  rotate: number;
  isRose: boolean;
}

export const HeartRain: React.FC = () => {
  const { heartRainTriggerCount } = useApp();
  const prefersReducedMotion = useReducedMotion();
  const [hearts, setHearts] = useState<FallingHeart[]>([]);
  const batchCounterRef = useRef(0);
  const lastHandledTriggerRef = useRef(0);
  const timersRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId));
      timers.clear();
    };
  }, []);

  useEffect(() => {
    if (
      heartRainTriggerCount === 0 ||
      heartRainTriggerCount === lastHandledTriggerRef.current
    ) {
      return;
    }
    lastHandledTriggerRef.current = heartRainTriggerCount;

    const batchId = ++batchCounterRef.current;
    const count = prefersReducedMotion ? 10 : 24;

    const newHearts: FallingHeart[] = Array.from({ length: count }).map((_, i) => ({
      id: `heart-${batchId}-${Date.now()}-${i}`,
      batchId,
      left: Math.random() * 96 + 2,
      size: Math.random() * 18 + 13,
      delay: Math.random() * 0.45,
      duration: Math.random() * 1.4 + 2.0,
      rotate: Math.random() * 320 - 160,
      isRose: i % 2 === 0,
    }));

    setHearts((prev) => [...prev.slice(-60), ...newHearts]);

    const timeoutId = window.setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.batchId !== batchId));
      timersRef.current.delete(timeoutId);
    }, 4500);

    timersRef.current.add(timeoutId);
  }, [heartRainTriggerCount, prefersReducedMotion]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {hearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ y: -40, opacity: 1, rotate: 0 }}
            animate={
              prefersReducedMotion
                ? { opacity: [1, 0] }
                : {
                    y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 80,
                    opacity: [1, 1, 0],
                    rotate: heart.rotate,
                  }
            }
            exit={{ opacity: 0 }}
            transition={{
              duration: heart.duration,
              delay: heart.delay,
              ease: 'easeIn',
            }}
            style={{
              position: 'absolute',
              left: `${heart.left}%`,
            }}
            className="text-pink-400 drop-shadow-md"
          >
            <Heart
              width={heart.size}
              height={heart.size}
              fill="currentColor"
              className={heart.isRose ? 'text-rose-500' : 'text-pink-400'}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
