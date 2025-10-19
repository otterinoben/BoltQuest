// Simple Countdown Timer Component (No Sound)
// Debug version to test basic functionality

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

interface SimpleCountdownTimerProps {
  onComplete: () => void;
  duration?: number;
  className?: string;
  showGo?: boolean;
  text?: string;
}

export const SimpleCountdownTimer: React.FC<SimpleCountdownTimerProps> = ({
  onComplete,
  duration = 3,
  className = '',
  showGo = true,
  text = 'Get Ready!',
}) => {
  const [count, setCount] = useState(duration);
  const [showGoText, setShowGoText] = useState(false);

  console.log('SimpleCountdownTimer render:', { count, showGoText, duration });

  useEffect(() => {
    console.log('useEffect triggered:', { count, showGo });
    
    if (count > 0) {
      console.log('Setting timer for count:', count);
      
      const timer = setTimeout(() => {
        console.log('Timer fired, decrementing count from', count, 'to', count - 1);
        setCount(count - 1);
      }, 1000);

      return () => {
        console.log('Cleaning up timer for count:', count);
        clearTimeout(timer);
      };
    } else if (showGo) {
      console.log('Count reached 0, showing GO');
      setShowGoText(true);
      
      const goTimer = setTimeout(() => {
        console.log('GO timer fired, calling onComplete');
        onComplete();
      }, 600);

      return () => {
        console.log('Cleaning up GO timer');
        clearTimeout(goTimer);
      };
    } else {
      console.log('Count reached 0, no GO, calling onComplete immediately');
      onComplete();
    }
  }, [count, onComplete, showGo]);

  return (
    <div className={`fixed inset-0 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center z-[100] ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        className="text-center"
      >
        {/* Initial text - only show on first render */}
        {count === duration && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
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
              className="text-8xl sm:text-9xl font-black text-primary"
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
              className="text-7xl sm:text-8xl font-black text-primary flex items-center gap-4"
              style={{
                textShadow: '0 0 30px rgba(59, 130, 246, 0.5)'
              }}
            >
              <Zap className="h-20 w-20 sm:h-24 sm:w-24" />
              GO!
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
