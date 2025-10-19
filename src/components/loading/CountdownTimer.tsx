// Countdown Timer Component
// Simple, elegant countdown for game starts

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '@/contexts/AudioContext';
import { Zap } from 'lucide-react';

interface CountdownTimerProps {
  onComplete: () => void;
  duration?: number;
  className?: string;
  showGo?: boolean;
  text?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  onComplete,
  duration = 3,
  className = '',
  showGo = true,
  text = 'Get Ready!',
}) => {
  const [count, setCount] = useState(duration);
  const [showGoText, setShowGoText] = useState(false);
  const { playSound } = useAudio();

  useEffect(() => {
    if (count > 0) {
      // Play countdown sound
      playSound('countdown_tick');
      
      // Simple 1-second timer
      const timer = setTimeout(() => {
        setCount(count - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (showGo) {
      // Play GO sound
      playSound('countdown_go');
      setShowGoText(true);
      
      // Show GO for 600ms then complete
      const goTimer = setTimeout(() => {
        onComplete();
      }, 600);

      return () => clearTimeout(goTimer);
    } else {
      onComplete();
    }
  }, [count, onComplete, showGo, playSound]);

  return (
    <div className={`fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-[100] ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        className="text-center max-w-4xl w-full px-6"
      >
        {/* Initial text - only show on first render */}
        {count === duration && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{text}</h2>
          </motion.div>
        )}

        {/* Countdown numbers */}
        <AnimatePresence mode="wait">
          {count > 0 && (
            <motion.div
              key={count}
              initial={{ 
                scale: 0.3, 
                opacity: 0
              }}
              animate={{ 
                scale: 1, 
                opacity: 1
              }}
              exit={{ 
                scale: 2, 
                opacity: 0
              }}
              transition={{ 
                duration: 0.2,
                ease: "easeOut"
              }}
              className="text-8xl sm:text-9xl font-black text-primary mb-8"
              style={{
                textShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
              }}
            >
              {count}
            </motion.div>
          )}
        </AnimatePresence>

        {/* GO! text */}
        <AnimatePresence>
          {showGoText && (
            <motion.div
              initial={{ 
                scale: 0, 
                opacity: 0,
                rotate: -10
              }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                rotate: 0
              }}
              exit={{ 
                scale: 1.2, 
                opacity: 0,
                rotate: 10
              }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 20,
                duration: 0.3
              }}
              className="text-6xl sm:text-7xl font-black text-primary flex items-center justify-center gap-4"
              style={{
                textShadow: '0 0 30px rgba(59, 130, 246, 0.5)'
              }}
            >
              <Zap className="h-16 w-16 sm:h-20 sm:w-20" />
              GO!
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Simple countdown hook
export const useCountdown = (initialCount: number, onComplete?: () => void) => {
  const [count, setCount] = useState(initialCount);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActive && count > 0) {
      const timer = setTimeout(() => {
        setCount(count - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (count === 0 && isActive) {
      setIsActive(false);
      onComplete?.();
    }
  }, [count, isActive, onComplete]);

  const start = () => {
    setCount(initialCount);
    setIsActive(true);
  };

  const stop = () => {
    setIsActive(false);
  };

  const reset = () => {
    setCount(initialCount);
    setIsActive(false);
  };

  return { count, isActive, start, stop, reset };
};
