// Custom Hooks for Transitions and Loading States

import { useState, useEffect, useCallback } from 'react';
import { ANIMATION_DURATIONS } from '@/lib/animations';

// Hook for managing page transitions
export const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward' | 'none'>('none');

  const startTransition = useCallback(async (direction: 'forward' | 'backward' = 'forward') => {
    setIsTransitioning(true);
    setTransitionDirection(direction);
    
    // Minimum transition duration
    await new Promise(resolve => 
      setTimeout(resolve, ANIMATION_DURATIONS.normal)
    );
  }, []);

  const completeTransition = useCallback(() => {
    setIsTransitioning(false);
    setTransitionDirection('none');
  }, []);

  return {
    isTransitioning,
    transitionDirection,
    startTransition,
    completeTransition,
  };
};

// Hook for managing loading states with minimum duration
export const useLoadingState = (minDuration: number = ANIMATION_DURATIONS.normal) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    if (loading) {
      setIsLoading(true);
      setLoadingStartTime(Date.now());
    } else {
      const elapsed = loadingStartTime ? Date.now() - loadingStartTime : 0;
      const remainingTime = Math.max(0, minDuration - elapsed);
      
      setTimeout(() => {
        setIsLoading(false);
        setLoadingStartTime(null);
      }, remainingTime);
    }
  }, [minDuration, loadingStartTime]);

  const forceStopLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingStartTime(null);
  }, []);

  return {
    isLoading,
    setLoading,
    forceStopLoading,
  };
};

// Hook for staggered animations
export const useStaggeredAnimation = (itemCount: number, delay: number = 100) => {
  const [visibleItems, setVisibleItems] = useState(0);

  useEffect(() => {
    if (visibleItems < itemCount) {
      const timer = setTimeout(() => {
        setVisibleItems(prev => prev + 1);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [visibleItems, itemCount, delay]);

  const reset = useCallback(() => {
    setVisibleItems(0);
  }, []);

  return {
    visibleItems,
    reset,
    isComplete: visibleItems >= itemCount,
  };
};

// Hook for managing modal/dialog transitions
export const useModalTransition = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
    // Small delay to ensure DOM is ready
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);
    // Wait for exit animation before removing from DOM
    setTimeout(() => setIsOpen(false), ANIMATION_DURATIONS.normal);
  }, []);

  return {
    isOpen,
    isVisible,
    open,
    close,
  };
};

// Hook for managing toast notifications
export const useToastTransition = () => {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
  }>>([]);

  const addToast = useCallback((
    message: string, 
    type: 'success' | 'error' | 'info' = 'info',
    duration: number = 3000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
  };
};

// Hook for managing form submission states
export const useFormSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const startSubmission = useCallback(() => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);
  }, []);

  const completeSubmission = useCallback((success: boolean, error?: string) => {
    setIsSubmitting(false);
    if (success) {
      setSubmitSuccess(true);
      // Auto-reset success state
      setTimeout(() => setSubmitSuccess(false), 2000);
    } else {
      setSubmitError(error || 'An error occurred');
    }
  }, []);

  const resetSubmission = useCallback(() => {
    setIsSubmitting(false);
    setSubmitSuccess(false);
    setSubmitError(null);
  }, []);

  return {
    isSubmitting,
    submitSuccess,
    submitError,
    startSubmission,
    completeSubmission,
    resetSubmission,
  };
};

// Hook for managing data fetching with loading states
export const useDataFetching = <T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
};
