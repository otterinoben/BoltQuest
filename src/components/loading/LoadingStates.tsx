// Loading States Library
// Comprehensive collection of loading components for different use cases

import React from 'react';
import { motion } from 'framer-motion';
import { TRANSITION_VARIANTS, STAGGER_DELAYS } from '@/lib/animations';

// Base skeleton component with shimmer effect
const SkeletonBase: React.FC<{ className?: string; children?: React.ReactNode }> = ({ 
  className = '', 
  children 
}) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`}>
    {children}
  </div>
);

// Text skeleton loader
export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
  width?: string;
}> = ({ lines = 1, className = '', width = '100%' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonBase
        key={index}
        className="h-4 rounded"
        style={{ width: index === lines - 1 ? '75%' : width }}
      />
    ))}
  </div>
);

// Card skeleton loader
export const SkeletonCard: React.FC<{
  className?: string;
  showAvatar?: boolean;
  lines?: number;
}> = ({ className = '', showAvatar = false, lines = 3 }) => (
  <div className={`p-6 border rounded-lg ${className}`}>
    <div className="flex items-start space-x-4">
      {showAvatar && (
        <SkeletonBase className="w-12 h-12 rounded-full flex-shrink-0" />
      )}
      <div className="flex-1 space-y-3">
        <SkeletonText lines={lines} />
      </div>
    </div>
  </div>
);

// Avatar skeleton loader
export const SkeletonAvatar: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <SkeletonBase 
      className={`rounded-full ${sizeClasses[size]} ${className}`} 
    />
  );
};

// Table skeleton loader
export const SkeletonTable: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, index) => (
        <SkeletonBase key={index} className="h-4 flex-1 rounded" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <SkeletonBase key={colIndex} className="h-4 flex-1 rounded" />
        ))}
      </div>
    ))}
  </div>
);

// Button skeleton loader
export const SkeletonButton: React.FC<{
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32',
  };

  return (
    <SkeletonBase 
      className={`rounded ${sizeClasses[size]} ${className}`} 
    />
  );
};

// Pulsing dots loader
export const PulsingDots: React.FC<{
  className?: string;
  color?: string;
}> = ({ className = '', color = 'text-primary' }) => (
  <div className={`flex space-x-1 ${className}`}>
    {[0, 1, 2].map((index) => (
      <motion.div
        key={index}
        className={`w-2 h-2 rounded-full bg-current ${color}`}
        variants={TRANSITION_VARIANTS.pulse}
        animate="animate"
        transition={{
          delay: index * 0.1,
          duration: 0.6,
          repeat: Infinity,
        }}
      />
    ))}
  </div>
);

// Enhanced spinner with branding
export const SpinnerLoader: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}> = ({ size = 'md', className = '', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-2 border-gray-300 border-t-primary rounded-full`}
        variants={TRANSITION_VARIANTS.spin}
        animate="animate"
      />
      {text && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>
      )}
    </div>
  );
};

// Loading overlay
export const LoadingOverlay: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
  text?: string;
}> = ({ 
  isLoading, 
  children, 
  className = '', 
  spinnerSize = 'md',
  text = 'Loading...'
}) => (
  <div className={`relative ${className}`}>
    {children}
    {isLoading && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <SpinnerLoader size={spinnerSize} text={text} />
      </motion.div>
    )}
  </div>
);

// Staggered skeleton cards
export const SkeletonCardGrid: React.FC<{
  count?: number;
  className?: string;
  showAvatar?: boolean;
}> = ({ count = 3, className = '', showAvatar = false }) => (
  <motion.div
    variants={TRANSITION_VARIANTS.staggerContainer}
    initial="initial"
    animate="animate"
    className={`grid gap-4 ${className}`}
  >
    {Array.from({ length: count }).map((_, index) => (
      <motion.div
        key={index}
        variants={TRANSITION_VARIANTS.staggerItem}
      >
        <SkeletonCard showAvatar={showAvatar} />
      </motion.div>
    ))}
  </motion.div>
);

// Progress bar skeleton
export const SkeletonProgress: React.FC<{
  className?: string;
  height?: string;
}> = ({ className = '', height = 'h-2' }) => (
  <SkeletonBase className={`${height} rounded-full ${className}`} />
);

// List skeleton
export const SkeletonList: React.FC<{
  items?: number;
  className?: string;
  showAvatars?: boolean;
}> = ({ items = 5, className = '', showAvatars = false }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <motion.div
        key={index}
        variants={TRANSITION_VARIANTS.staggerItem}
        initial="initial"
        animate="animate"
        transition={{ delay: index * STAGGER_DELAYS.small / 1000 }}
        className="flex items-center space-x-3"
      >
        {showAvatars && <SkeletonAvatar size="sm" />}
        <div className="flex-1">
          <SkeletonText lines={2} />
        </div>
      </motion.div>
    ))}
  </div>
);
