// Animation Constants & Configuration
// Centralized animation settings for consistent UX across BoltQuest

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
} as const;

export const ANIMATION_EASING = {
  easeOut: [0.0, 0.0, 0.2, 1],
  easeInOut: [0.4, 0.0, 0.2, 1],
  easeIn: [0.4, 0.0, 1, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  spring: { type: "spring", stiffness: 300, damping: 30 },
} as const;

export const STAGGER_DELAYS = {
  small: 50,
  medium: 100,
  large: 200,
  extraLarge: 300,
} as const;

export const TRANSITION_VARIANTS = {
  // Page transitions
  pageSlide: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: ANIMATION_DURATIONS.normal / 1000, ease: ANIMATION_EASING.easeOut },
  },
  
  pageFade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: ANIMATION_DURATIONS.normal / 1000 },
  },

  // Card animations
  cardHover: {
    scale: 1.02,
    transition: { duration: ANIMATION_DURATIONS.fast / 1000 },
  },
  
  cardTap: {
    scale: 0.98,
    transition: { duration: ANIMATION_DURATIONS.fast / 1000 },
  },

  // Question transitions
  questionSlideLeft: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
    transition: { duration: ANIMATION_DURATIONS.normal / 1000 },
  },

  questionSlideRight: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
    transition: { duration: ANIMATION_DURATIONS.normal / 1000 },
  },

  // Modal animations
  modalBackdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: ANIMATION_DURATIONS.normal / 1000 },
  },

  modalContent: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: ANIMATION_DURATIONS.normal / 1000, ease: ANIMATION_EASING.easeOut },
  },

  // Loading animations
  pulse: {
    animate: {
      opacity: [1, 0.5, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },

  spin: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      },
    },
  },

  // Stagger animations
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: STAGGER_DELAYS.medium / 1000,
      },
    },
  },

  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: ANIMATION_DURATIONS.normal / 1000 },
  },

  // Countdown animations
  countdownScale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.2, opacity: 0 },
    transition: { duration: ANIMATION_DURATIONS.fast / 1000, ease: ANIMATION_EASING.bounce },
  },

  // Success animations
  successCheckmark: {
    initial: { scale: 0, rotate: -45 },
    animate: { scale: 1, rotate: 0 },
    transition: { duration: ANIMATION_DURATIONS.normal / 1000, ease: ANIMATION_EASING.bounce },
  },

  // Error animations
  errorShake: {
    animate: {
      x: [-10, 10, -10, 10, 0],
      transition: { duration: 0.5 },
    },
  },
} as const;

// Utility functions
export const getReducedMotion = () => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
};

export const getAnimationDuration = (baseDuration: number) => {
  return getReducedMotion() ? 0 : baseDuration;
};

export const createStaggerDelay = (index: number, baseDelay: number = STAGGER_DELAYS.medium) => {
  return index * baseDelay;
};

// Spring configurations
export const SPRING_CONFIGS = {
  gentle: { type: "spring", stiffness: 200, damping: 25 },
  snappy: { type: "spring", stiffness: 400, damping: 30 },
  bouncy: { type: "spring", stiffness: 300, damping: 20 },
  smooth: { type: "spring", stiffness: 100, damping: 30 },
} as const;

// Layout animations
export const LAYOUT_ANIMATIONS = {
  smooth: {
    layout: true,
    transition: SPRING_CONFIGS.gentle,
  },
  snappy: {
    layout: true,
    transition: SPRING_CONFIGS.snappy,
  },
} as const;
