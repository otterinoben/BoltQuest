/**
 * Tutorial Context
 * React context for managing tutorial state and actions
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { 
  TutorialContextType, 
  TutorialState, 
  TutorialStep, 
  TutorialProgress, 
  TutorialNavigation,
  TutorialEvent,
  TutorialValidation,
  TutorialAnalytics,
  TutorialPreferences
} from '@/types/tutorial';
import { tutorialStorage } from '@/lib/tutorialStorage';

// Action types
type TutorialAction =
  | { type: 'START_TUTORIAL'; payload: { tutorialId: string; step: TutorialStep } }
  | { type: 'NEXT_STEP'; payload: { step: TutorialStep } }
  | { type: 'PREVIOUS_STEP'; payload: { step: TutorialStep } }
  | { type: 'SKIP_STEP'; payload: { stepId: string } }
  | { type: 'SKIP_TUTORIAL' }
  | { type: 'PAUSE_TUTORIAL' }
  | { type: 'RESUME_TUTORIAL' }
  | { type: 'COMPLETE_TUTORIAL' }
  | { type: 'CLOSE_TUTORIAL' }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<TutorialPreferences> }
  | { type: 'RESET_TUTORIAL' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_STATE'; payload: TutorialState };

// Initial state
const initialState: TutorialContextType = {
  tutorialState: null,
  currentStep: null,
  progress: null,
  navigation: null,
  isActive: false,
  isLoading: false,
  error: null,
  
  // Actions (will be set by the provider)
  startTutorial: async () => {},
  nextStep: () => {},
  previousStep: () => {},
  skipStep: () => {},
  skipTutorial: () => {},
  pauseTutorial: () => {},
  resumeTutorial: () => {},
  completeTutorial: () => {},
  closeTutorial: () => {},
  updatePreferences: () => {},
  resetTutorial: () => {},
  
  // Validation
  validateStep: () => ({ isValid: false, message: '' }),
  canProceed: () => false,
  canGoBack: () => false,
  
  // Analytics
  trackEvent: () => {},
  getAnalytics: () => null
};

// Reducer
function tutorialReducer(state: TutorialContextType, action: TutorialAction): TutorialContextType {
  switch (action.type) {
    case 'START_TUTORIAL':
      return {
        ...state,
        tutorialState: {
          isActive: true,
          currentStep: 0,
          completedSteps: [],
          skippedSteps: [],
          startTime: new Date(),
          userPreferences: state.tutorialState?.userPreferences || {
            skipAnimations: false,
            showHints: true,
            autoAdvance: false,
            soundEnabled: true,
            theme: 'auto',
            language: 'en',
            fontSize: 'medium',
            reducedMotion: false
          },
          tutorialId: action.payload.tutorialId,
          version: '1.0.0'
        },
        currentStep: action.payload.step,
        isActive: true,
        error: null
      };

    case 'NEXT_STEP':
      if (!state.tutorialState) return state;
      
      const nextCompletedSteps = [...state.tutorialState.completedSteps, state.tutorialState.currentStep];
      return {
        ...state,
        tutorialState: {
          ...state.tutorialState,
          currentStep: state.tutorialState.currentStep + 1,
          completedSteps: nextCompletedSteps
        },
        currentStep: action.payload.step
      };

    case 'PREVIOUS_STEP':
      if (!state.tutorialState || state.tutorialState.currentStep <= 0) return state;
      
      return {
        ...state,
        tutorialState: {
          ...state.tutorialState,
          currentStep: state.tutorialState.currentStep - 1
        },
        currentStep: action.payload.step
      };

    case 'SKIP_STEP':
      if (!state.tutorialState) return state;
      
      const nextSkippedSteps = [...state.tutorialState.skippedSteps, action.payload.stepId];
      return {
        ...state,
        tutorialState: {
          ...state.tutorialState,
          currentStep: state.tutorialState.currentStep + 1,
          skippedSteps: nextSkippedSteps
        }
      };

    case 'SKIP_TUTORIAL':
      if (!state.tutorialState) return state;
      
      return {
        ...state,
        tutorialState: {
          ...state.tutorialState,
          isActive: false,
          completionTime: new Date()
        },
        isActive: false
      };

    case 'PAUSE_TUTORIAL':
      if (!state.tutorialState) return state;
      
      return {
        ...state,
        tutorialState: {
          ...state.tutorialState,
          isActive: false
        },
        isActive: false
      };

    case 'RESUME_TUTORIAL':
      if (!state.tutorialState) return state;
      
      return {
        ...state,
        tutorialState: {
          ...state.tutorialState,
          isActive: true
        },
        isActive: true
      };

    case 'COMPLETE_TUTORIAL':
      if (!state.tutorialState) return state;
      
      return {
        ...state,
        tutorialState: {
          ...state.tutorialState,
          isActive: false,
          completionTime: new Date()
        },
        isActive: false
      };

    case 'CLOSE_TUTORIAL':
      return {
        ...state,
        tutorialState: null,
        currentStep: null,
        progress: null,
        navigation: null,
        isActive: false
      };

    case 'UPDATE_PREFERENCES':
      if (!state.tutorialState) return state;
      
      return {
        ...state,
        tutorialState: {
          ...state.tutorialState,
          userPreferences: {
            ...state.tutorialState.userPreferences,
            ...action.payload
          }
        }
      };

    case 'RESET_TUTORIAL':
      return {
        ...state,
        tutorialState: null,
        currentStep: null,
        progress: null,
        navigation: null,
        isActive: false,
        error: null
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case 'LOAD_STATE':
      return {
        ...state,
        tutorialState: action.payload,
        isActive: action.payload.isActive,
        error: null
      };

    default:
      return state;
  }
}

// Context
const TutorialContext = createContext<TutorialContextType>(initialState);

// Provider component
export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(tutorialReducer, initialState);

  // Load tutorial state on mount
  useEffect(() => {
    const loadTutorialState = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Load user preferences
        const preferences = await tutorialStorage.loadPreferences();
        if (preferences) {
          dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('Error loading tutorial state:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load tutorial state' });
      }
    };

    loadTutorialState();
  }, []);

  // Save preferences when they change
  useEffect(() => {
    if (state.tutorialState?.userPreferences) {
      tutorialStorage.savePreferences(state.tutorialState.userPreferences);
    }
  }, [state.tutorialState?.userPreferences]);

  // Action implementations
  const startTutorial = useCallback(async (tutorialId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Load tutorial configuration
      const tutorialConfig = await loadTutorialConfig(tutorialId);
      if (!tutorialConfig) {
        throw new Error('Tutorial not found');
      }
      
      const firstStep = tutorialConfig.steps[0];
      if (!firstStep) {
        throw new Error('Tutorial has no steps');
      }
      
      dispatch({ type: 'START_TUTORIAL', payload: { tutorialId, step: firstStep } });
      
      // Track analytics
      trackEvent({
        type: 'start',
        stepId: firstStep.id,
        timestamp: new Date()
      });
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Error starting tutorial:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to start tutorial' });
    }
  }, []);

  const nextStep = useCallback(() => {
    if (!state.tutorialState) return;
    
    try {
      // Load next step
      const nextStep = loadNextStep(state.tutorialState.tutorialId, state.tutorialState.currentStep);
      if (nextStep) {
        dispatch({ type: 'NEXT_STEP', payload: { step: nextStep } });
        
        // Track analytics
        trackEvent({
          type: 'step_complete',
          stepId: state.currentStep?.id || '',
          timestamp: new Date()
        });
      } else {
        // No more steps, complete tutorial
        completeTutorial();
      }
    } catch (error) {
      console.error('Error moving to next step:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to move to next step' });
    }
  }, [state.tutorialState, state.currentStep]);

  const previousStep = useCallback(() => {
    if (!state.tutorialState || state.tutorialState.currentStep <= 0) return;
    
    try {
      const prevStep = loadPreviousStep(state.tutorialState.tutorialId, state.tutorialState.currentStep);
      if (prevStep) {
        dispatch({ type: 'PREVIOUS_STEP', payload: { step: prevStep } });
      }
    } catch (error) {
      console.error('Error moving to previous step:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to move to previous step' });
    }
  }, [state.tutorialState]);

  const skipStep = useCallback(() => {
    if (!state.tutorialState || !state.currentStep) return;
    
    try {
      dispatch({ type: 'SKIP_STEP', payload: { stepId: state.currentStep.id } });
      
      // Track analytics
      trackEvent({
        type: 'step_skip',
        stepId: state.currentStep.id,
        timestamp: new Date()
      });
      
      // Move to next step
      nextStep();
    } catch (error) {
      console.error('Error skipping step:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to skip step' });
    }
  }, [state.tutorialState, state.currentStep, nextStep]);

  const skipTutorial = useCallback(() => {
    if (!state.tutorialState) return;
    
    try {
      dispatch({ type: 'SKIP_TUTORIAL' });
      
      // Track analytics
      trackEvent({
        type: 'abandon',
        stepId: state.currentStep?.id || '',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error skipping tutorial:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to skip tutorial' });
    }
  }, [state.tutorialState, state.currentStep]);

  const pauseTutorial = useCallback(() => {
    if (!state.tutorialState) return;
    
    try {
      dispatch({ type: 'PAUSE_TUTORIAL' });
      
      // Track analytics
      trackEvent({
        type: 'pause',
        stepId: state.currentStep?.id || '',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error pausing tutorial:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to pause tutorial' });
    }
  }, [state.tutorialState, state.currentStep]);

  const resumeTutorial = useCallback(() => {
    if (!state.tutorialState) return;
    
    try {
      dispatch({ type: 'RESUME_TUTORIAL' });
      
      // Track analytics
      trackEvent({
        type: 'resume',
        stepId: state.currentStep?.id || '',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error resuming tutorial:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to resume tutorial' });
    }
  }, [state.tutorialState, state.currentStep]);

  const completeTutorial = useCallback(() => {
    if (!state.tutorialState) return;
    
    try {
      dispatch({ type: 'COMPLETE_TUTORIAL' });
      
      // Track analytics
      trackEvent({
        type: 'complete',
        stepId: state.currentStep?.id || '',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error completing tutorial:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to complete tutorial' });
    }
  }, [state.tutorialState, state.currentStep]);

  const closeTutorial = useCallback(() => {
    try {
      dispatch({ type: 'CLOSE_TUTORIAL' });
    } catch (error) {
      console.error('Error closing tutorial:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to close tutorial' });
    }
  }, []);

  const updatePreferences = useCallback((preferences: Partial<TutorialPreferences>) => {
    try {
      dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
    } catch (error) {
      console.error('Error updating preferences:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update preferences' });
    }
  }, []);

  const resetTutorial = useCallback(() => {
    try {
      dispatch({ type: 'RESET_TUTORIAL' });
    } catch (error) {
      console.error('Error resetting tutorial:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reset tutorial' });
    }
  }, []);

  const validateStep = useCallback((stepId: string): TutorialValidation => {
    // Implementation for step validation
    return { isValid: true, message: '' };
  }, []);

  const canProceed = useCallback((): boolean => {
    if (!state.tutorialState || !state.currentStep) return false;
    
    // Check if current step is valid
    const validation = validateStep(state.currentStep.id);
    return validation.isValid;
  }, [state.tutorialState, state.currentStep, validateStep]);

  const canGoBack = useCallback((): boolean => {
    if (!state.tutorialState) return false;
    return state.tutorialState.currentStep > 0;
  }, [state.tutorialState]);

  const trackEvent = useCallback((event: TutorialEvent) => {
    try {
      // Implementation for event tracking
      console.log('Tutorial event:', event);
    } catch (error) {
      console.error('Error tracking tutorial event:', error);
    }
  }, []);

  const getAnalytics = useCallback((): TutorialAnalytics | null => {
    // Implementation for getting analytics
    return null;
  }, []);

  // Calculate navigation state
  const navigation: TutorialNavigation = {
    canGoNext: canProceed(),
    canGoPrevious: canGoBack(),
    canSkip: state.currentStep?.skipAllowed || false,
    canPause: state.isActive,
    canResume: !state.isActive && !!state.tutorialState,
    canClose: true,
    currentStepIndex: state.tutorialState?.currentStep || 0,
    totalSteps: 0 // Will be set when tutorial is loaded
  };

  // Calculate progress
  const progress: TutorialProgress | null = state.tutorialState ? {
    tutorialId: state.tutorialState.tutorialId,
    userId: 'current-user', // Will be replaced with actual user ID
    currentStep: state.tutorialState.currentStep,
    totalSteps: 0, // Will be set when tutorial is loaded
    completedSteps: state.tutorialState.completedSteps,
    skippedSteps: state.tutorialState.skippedSteps,
    startTime: state.tutorialState.startTime,
    lastActive: new Date(),
    completionPercentage: 0, // Will be calculated
    estimatedTimeRemaining: 0 // Will be calculated
  } : null;

  const contextValue: TutorialContextType = {
    ...state,
    progress,
    navigation,
    startTutorial,
    nextStep,
    previousStep,
    skipStep,
    skipTutorial,
    pauseTutorial,
    resumeTutorial,
    completeTutorial,
    closeTutorial,
    updatePreferences,
    resetTutorial,
    validateStep,
    canProceed,
    canGoBack,
    trackEvent,
    getAnalytics
  };

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}
    </TutorialContext.Provider>
  );
}

// Hook to use tutorial context
export function useTutorial(): TutorialContextType {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}

// Helper functions (these would be implemented based on your tutorial configuration)
async function loadTutorialConfig(tutorialId: string): Promise<{ steps: TutorialStep[] } | null> {
  // Implementation for loading tutorial configuration
  return null;
}

function loadNextStep(tutorialId: string, currentStepIndex: number): TutorialStep | null {
  // Implementation for loading next step
  return null;
}

function loadPreviousStep(tutorialId: string, currentStepIndex: number): TutorialStep | null {
  // Implementation for loading previous step
  return null;
}

export default TutorialContext;




