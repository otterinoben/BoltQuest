// Page Transition Wrapper Component
// Provides smooth transitions between pages with Framer Motion

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { TRANSITION_VARIANTS, ANIMATION_DURATIONS, getReducedMotion } from '@/lib/animations';
import { useTransition } from '@/contexts/TransitionContext';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className = '' 
}) => {
  const location = useLocation();
  const { state, completeTransition } = useTransition();

  useEffect(() => {
    // Complete transition when location changes
    if (state.isTransitioning) {
      const timer = setTimeout(() => {
        completeTransition();
      }, ANIMATION_DURATIONS.normal);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, state.isTransitioning, completeTransition]);

  // Skip animations if user prefers reduced motion
  if (getReducedMotion()) {
    return <div className={className}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" onExitComplete={completeTransition}>
      <motion.div
        key={location.pathname}
        variants={TRANSITION_VARIANTS.pageSlide}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
        style={{ 
          width: '100%',
          minHeight: '100vh',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Fade Transition Variant
export const FadeTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className = '' 
}) => {
  const location = useLocation();
  const { completeTransition } = useTransition();

  useEffect(() => {
    const timer = setTimeout(() => {
      completeTransition();
    }, ANIMATION_DURATIONS.normal);

    return () => clearTimeout(timer);
  }, [location.pathname, completeTransition]);

  if (getReducedMotion()) {
    return <div className={className}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" onExitComplete={completeTransition}>
      <motion.div
        key={location.pathname}
        variants={TRANSITION_VARIANTS.pageFade}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
        style={{ 
          width: '100%',
          minHeight: '100vh',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Slide Transition Variant
export const SlideTransition: React.FC<PageTransitionProps & {
  direction?: 'left' | 'right' | 'up' | 'down';
}> = ({ 
  children, 
  className = '',
  direction = 'right'
}) => {
  const location = useLocation();
  const { completeTransition } = useTransition();

  useEffect(() => {
    const timer = setTimeout(() => {
      completeTransition();
    }, ANIMATION_DURATIONS.normal);

    return () => clearTimeout(timer);
  }, [location.pathname, completeTransition]);

  if (getReducedMotion()) {
    return <div className={className}>{children}</div>;
  }

  const slideVariants = {
    initial: { 
      opacity: 0, 
      x: direction === 'left' ? -50 : direction === 'right' ? 50 : 0,
      y: direction === 'up' ? -50 : direction === 'down' ? 50 : 0,
    },
    animate: { 
      opacity: 1, 
      x: 0, 
      y: 0,
      transition: { duration: ANIMATION_DURATIONS.normal / 1000 }
    },
    exit: { 
      opacity: 0, 
      x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0,
      y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
      transition: { duration: ANIMATION_DURATIONS.normal / 1000 }
    },
  };

  return (
    <AnimatePresence mode="wait" onExitComplete={completeTransition}>
      <motion.div
        key={location.pathname}
        variants={slideVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
        style={{ 
          width: '100%',
          minHeight: '100vh',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
