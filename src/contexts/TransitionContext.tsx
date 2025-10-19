// Transition Context for Global Animation State
// Manages page transitions, loading states, and animation coordination

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ANIMATION_DURATIONS, getReducedMotion } from '@/lib/animations';

interface TransitionState {
  isTransitioning: boolean;
  isLoading: boolean;
  currentPage: string | null;
  previousPage: string | null;
  transitionDirection: 'forward' | 'backward' | 'none';
}

interface TransitionContextType {
  state: TransitionState;
  startTransition: (to: string, direction?: 'forward' | 'backward') => Promise<void>;
  setLoading: (loading: boolean) => void;
  completeTransition: () => void;
  resetTransition: () => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

interface TransitionProviderProps {
  children: ReactNode;
}

export const TransitionProvider: React.FC<TransitionProviderProps> = ({ children }) => {
  const [state, setState] = useState<TransitionState>({
    isTransitioning: false,
    isLoading: false,
    currentPage: null,
    previousPage: null,
    transitionDirection: 'none',
  });

  const startTransition = useCallback(async (to: string, direction: 'forward' | 'backward' = 'forward') => {
    if (getReducedMotion()) {
      // Skip animations for users who prefer reduced motion
      setState(prev => ({
        ...prev,
        currentPage: to,
        previousPage: prev.currentPage,
        transitionDirection: direction,
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isTransitioning: true,
      isLoading: true,
      previousPage: prev.currentPage,
      transitionDirection: direction,
    }));

    // Minimum transition duration to prevent flash
    const minDuration = ANIMATION_DURATIONS.normal;
    
    await new Promise(resolve => {
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          currentPage: to,
          isLoading: false,
        }));
        resolve(void 0);
      }, minDuration);
    });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading: loading,
    }));
  }, []);

  const completeTransition = useCallback(() => {
    setState(prev => ({
      ...prev,
      isTransitioning: false,
      isLoading: false,
    }));
  }, []);

  const resetTransition = useCallback(() => {
    setState({
      isTransitioning: false,
      isLoading: false,
      currentPage: null,
      previousPage: null,
      transitionDirection: 'none',
    });
  }, []);

  const value: TransitionContextType = {
    state,
    startTransition,
    setLoading,
    completeTransition,
    resetTransition,
  };

  return (
    <TransitionContext.Provider value={value}>
      {children}
    </TransitionContext.Provider>
  );
};

export const useTransition = (): TransitionContextType => {
  const context = useContext(TransitionContext);
  if (context === undefined) {
    throw new Error('useTransition must be used within a TransitionProvider');
  }
  return context;
};
