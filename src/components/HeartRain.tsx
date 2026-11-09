import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Heart } from 'lucide-react';

export const HeartRain: React.FC = () => {
  const { heartRainTriggerCount } = useApp();
  const [hearts, setHearts] = useState<{ id: string; left: number; size: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    if (heartRainTriggerCount === 0) return;

    // Generate 30 hearts falling from the top
    const newHearts = Array.from({ length: 30 }).map((_, i) => ({
      id: `${heartRainTriggerCount}-${i}`,
      left: Math.random() * 100, // percentage
      size: Math.random() * 20 + 12, // 12 to 32px
      delay: Math.random() * 0.5, // 0 to 0.5s stagger
      duration: Math.random() * 1.5 + 2, // 2 to 3.5s falling
    }));

    setHearts(prev => [...prev, ...newHearts]);

    // Clean up hearts after they finish falling to prevent DOM bloating
    const timeout = setTimeout(() => {
      setHearts(prev => prev.filter(h => !newHearts.includes(h)));
    }, 4500);

    return () => clearTimeout(timeout);
  }, [heartRainTriggerCount]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {hearts.map(heart => (
          <motion.div
            key={heart.id}
            initial={{ y: -50, opacity: 1, rotate: 0 }}
            animate={{ 
              y: window.innerHeight + 100, 
              opacity: [1, 1, 0], 
              rotate: Math.random() * 360 - 180 
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: heart.duration,
              delay: heart.delay,
              ease: "easeIn"
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
              className={Math.random() > 0.5 ? "text-rose-500" : "text-pink-400"} 
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
