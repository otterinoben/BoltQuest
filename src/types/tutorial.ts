/**
 * Tutorial System Type Definitions
 * Comprehensive types for the BoltQuest tutorial system
 */

export interface TutorialState {
  isActive: boolean;
  currentStep: number;
  completedSteps: number[];
  skippedSteps: number[];
  startTime: Date;
  completionTime?: Date;
  userPreferences: TutorialPreferences;
  tutorialId: string;
  version: string;
}

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'scroll' | 'wait' | 'form' | 'navigation';
  validation?: () => boolean;
  nextStep?: string;
  skipAllowed: boolean;
  estimatedTime: number; // in seconds
  category: TutorialCategory;
  page: string;
  order: number;
  content?: TutorialContent;
}

export interface TutorialContent {
  text: string;
  image?: string;
  video?: string;
  animation?: string;
  interactive?: boolean;
  helpText?: string;
  successMessage?: string;
  errorMessage?: string;
}

export interface TutorialConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  steps: TutorialStep[];
  settings: TutorialSettings;
  metadata: TutorialMetadata;
}

export interface TutorialSettings {
  autoAdvance: boolean;
  showProgress: boolean;
  allowSkip: boolean;
  pauseOnBlur: boolean;
  soundEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  theme: 'light' | 'dark' | 'auto';
}

export interface TutorialMetadata {
  created: Date;
  updated: Date;
  author: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // in minutes
  prerequisites: string[];
}

export interface TutorialPreferences {
  skipAnimations: boolean;
  showHints: boolean;
  autoAdvance: boolean;
  soundEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
}

export interface TutorialEvent {
  type: 'start' | 'step_complete' | 'step_skip' | 'pause' | 'resume' | 'complete' | 'abandon' | 'error';
  stepId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

export interface TutorialValidation {
  isValid: boolean;
  message: string;
  nextAction?: string;
  retryCount?: number;
  maxRetries?: number;
}

export interface TutorialAnalytics {
  tutorialId: string;
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  completedSteps: number[];
  skippedSteps: number[];
  totalTime: number; // in seconds
  completionRate: number; // percentage
  errors: TutorialError[];
  userFeedback?: TutorialFeedback;
}

export interface TutorialError {
  stepId: string;
  errorType: string;
  message: string;
  timestamp: Date;
  stack?: string;
  userAgent?: string;
}

export interface TutorialFeedback {
  rating: number; // 1-5
  comments?: string;
  suggestions?: string;
  completed: boolean;
  helpful: boolean;
  timestamp: Date;
}

export type TutorialCategory = 
  | 'welcome'
  | 'onboarding'
  | 'gameplay'
  | 'profile'
  | 'leaderboards'
  | 'analytics'
  | 'help'
  | 'advanced'
  | 'completion';

export interface TutorialProgress {
  tutorialId: string;
  userId: string;
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  skippedSteps: number[];
  startTime: Date;
  lastActive: Date;
  completionPercentage: number;
  estimatedTimeRemaining: number; // in seconds
}

export interface TutorialStepResult {
  stepId: string;
  completed: boolean;
  skipped: boolean;
  timeSpent: number; // in seconds
  attempts: number;
  errors: number;
  userFeedback?: string;
  timestamp: Date;
}

export interface TutorialNavigation {
  canGoNext: boolean;
  canGoPrevious: boolean;
  canSkip: boolean;
  canPause: boolean;
  canResume: boolean;
  canClose: boolean;
  nextStepId?: string;
  previousStepId?: string;
  currentStepIndex: number;
  totalSteps: number;
}

export interface TutorialOverlayProps {
  step: TutorialStep;
  isVisible: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onClose: () => void;
  onPause: () => void;
  onResume: () => void;
  position: TutorialStep['position'];
  targetElement?: HTMLElement;
  navigation: TutorialNavigation;
  progress: TutorialProgress;
}

export interface TutorialContextType {
  tutorialState: TutorialState | null;
  currentStep: TutorialStep | null;
  progress: TutorialProgress | null;
  navigation: TutorialNavigation | null;
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  startTutorial: (tutorialId: string) => Promise<void>;
  nextStep: () => void;
  previousStep: () => void;
  skipStep: () => void;
  skipTutorial: () => void;
  pauseTutorial: () => void;
  resumeTutorial: () => void;
  completeTutorial: () => void;
  closeTutorial: () => void;
  updatePreferences: (preferences: Partial<TutorialPreferences>) => void;
  resetTutorial: () => void;
  
  // Validation
  validateStep: (stepId: string) => TutorialValidation;
  canProceed: () => boolean;
  canGoBack: () => boolean;
  
  // Analytics
  trackEvent: (event: TutorialEvent) => void;
  getAnalytics: () => TutorialAnalytics | null;
}

export interface TutorialStorage {
  saveProgress: (progress: TutorialProgress) => Promise<void>;
  loadProgress: (tutorialId: string, userId: string) => Promise<TutorialProgress | null>;
  savePreferences: (preferences: TutorialPreferences) => Promise<void>;
  loadPreferences: () => Promise<TutorialPreferences | null>;
  saveAnalytics: (analytics: TutorialAnalytics) => Promise<void>;
  loadAnalytics: (tutorialId: string, userId: string) => Promise<TutorialAnalytics | null>;
  clearData: () => Promise<void>;
  exportData: () => Promise<string>;
  importData: (data: string) => Promise<void>;
}

export interface TutorialStepDefinition {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  position: TutorialStep['position'];
  action?: TutorialStep['action'];
  validation?: () => boolean;
  nextStep?: string;
  skipAllowed: boolean;
  estimatedTime: number;
  category: TutorialCategory;
  page: string;
  order: number;
  content?: TutorialContent;
  prerequisites?: string[];
  dependencies?: string[];
  triggers?: string[];
  conditions?: () => boolean;
}

export interface TutorialPageConfig {
  pageId: string;
  pageName: string;
  steps: TutorialStepDefinition[];
  settings: {
    autoStart: boolean;
    showProgress: boolean;
    allowSkip: boolean;
    pauseOnBlur: boolean;
  };
  metadata: {
    description: string;
    estimatedDuration: number;
    difficulty: TutorialMetadata['difficulty'];
    prerequisites: string[];
  };
}

export interface TutorialSystemConfig {
  version: string;
  tutorials: TutorialPageConfig[];
  globalSettings: TutorialSettings;
  analytics: {
    enabled: boolean;
    trackingId?: string;
    endpoint?: string;
  };
  storage: {
    provider: 'localStorage' | 'indexedDB' | 'api';
    options?: Record<string, any>;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    animations: boolean;
    sound: boolean;
    accessibility: boolean;
  };
}



