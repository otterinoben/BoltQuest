/**
 * Tutorial Manager Component
 * Main component that manages tutorial state and renders the overlay
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useTutorial } from '@/contexts/TutorialContext';
import { TutorialStepDefinition, TutorialCategory } from '@/types/tutorial';
import { tutorialSteps, getStepsByPage, getNextStep, getPreviousStep } from '@/data/tutorialSteps';
import { validateStep } from '@/lib/tutorialValidation';
import TutorialOverlay from './TutorialOverlay';
import TutorialNavigation from './TutorialNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Settings, 
  HelpCircle, 
  X, 
  RotateCcw,
  BookOpen,
  Target,
  Clock
} from 'lucide-react';

interface TutorialManagerProps {
  pageId: string;
  onTutorialComplete?: () => void;
  onTutorialSkip?: () => void;
  className?: string;
}

const TutorialManager: React.FC<TutorialManagerProps> = ({
  pageId,
  onTutorialComplete,
  onTutorialSkip,
  className = ''
}) => {
  const {
    tutorialState,
    currentStep,
    progress,
    navigation,
    isActive,
    isLoading,
    error,
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
    validateStep: validateCurrentStep,
    canProceed,
    canGoBack,
    trackEvent
  } = useTutorial();

  const [showTutorialMenu, setShowTutorialMenu] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [pageSteps, setPageSteps] = useState<TutorialStepDefinition[]>([]);

  // Load page-specific steps
  useEffect(() => {
    const steps = getStepsByPage(pageId);
    setPageSteps(steps);
  }, [pageId]);

  // Find target element when step changes
  useEffect(() => {
    if (currentStep?.targetElement) {
      const element = document.querySelector(currentStep.targetElement) as HTMLElement;
      setTargetElement(element);
    } else {
      setTargetElement(null);
    }
  }, [currentStep]);

  // Handle step validation
  const handleStepValidation = useCallback(() => {
    if (!currentStep) return;

    const validation = validateStep(currentStep);
    if (!validation.isValid) {
      console.warn('Step validation failed:', validation.message);
      // Could show error message to user
    }
  }, [currentStep]);

  // Handle next step
  const handleNextStep = useCallback(() => {
    if (!currentStep) return;

    // Validate current step
    handleStepValidation();

    // Track completion
    trackEvent({
      type: 'step_complete',
      stepId: currentStep.id,
      timestamp: new Date()
    });

    // Move to next step
    const nextStepDef = getNextStep(currentStep.id);
    if (nextStepDef) {
      nextStep();
    } else {
      // No more steps, complete tutorial
      completeTutorial();
      onTutorialComplete?.();
    }
  }, [currentStep, handleStepValidation, trackEvent, nextStep, completeTutorial, onTutorialComplete]);

  // Handle previous step
  const handlePreviousStep = useCallback(() => {
    if (!currentStep) return;

    const prevStepDef = getPreviousStep(currentStep.id);
    if (prevStepDef) {
      previousStep();
    }
  }, [currentStep, previousStep]);

  // Handle skip step
  const handleSkipStep = useCallback(() => {
    if (!currentStep) return;

    // Track skip
    trackEvent({
      type: 'step_skip',
      stepId: currentStep.id,
      timestamp: new Date()
    });

    skipStep();
  }, [currentStep, trackEvent, skipStep]);

  // Handle skip tutorial
  const handleSkipTutorial = useCallback(() => {
    trackEvent({
      type: 'abandon',
      stepId: currentStep?.id || '',
      timestamp: new Date()
    });

    skipTutorial();
    onTutorialSkip?.();
  }, [currentStep, trackEvent, skipTutorial, onTutorialSkip]);

  // Handle pause tutorial
  const handlePauseTutorial = useCallback(() => {
    trackEvent({
      type: 'pause',
      stepId: currentStep?.id || '',
      timestamp: new Date()
    });

    pauseTutorial();
  }, [currentStep, trackEvent, pauseTutorial]);

  // Handle resume tutorial
  const handleResumeTutorial = useCallback(() => {
    trackEvent({
      type: 'resume',
      stepId: currentStep?.id || '',
      timestamp: new Date()
    });

    resumeTutorial();
  }, [currentStep, trackEvent, resumeTutorial]);

  // Handle close tutorial
  const handleCloseTutorial = useCallback(() => {
    closeTutorial();
  }, [closeTutorial]);

  // Handle reset tutorial
  const handleResetTutorial = useCallback(() => {
    resetTutorial();
  }, [resetTutorial]);

  // Start tutorial
  const handleStartTutorial = useCallback(async () => {
    try {
      await startTutorial(`tutorial-${pageId}`);
      setShowTutorialMenu(false);
    } catch (error) {
      console.error('Failed to start tutorial:', error);
    }
  }, [startTutorial, pageId]);

  // Get step position
  const getStepPosition = (step: TutorialStepDefinition) => {
    if (step.position === 'center') return 'center';
    if (targetElement) return step.position;
    return 'center';
  };

  // Render tutorial menu
  const renderTutorialMenu = () => {
    if (!showTutorialMenu) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9997] flex items-center justify-center">
        <Card className="w-96 max-w-[90vw] shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Tutorial Menu
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTutorialMenu(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                <span>{pageSteps.length} steps available</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>~{Math.ceil(pageSteps.reduce((total, step) => total + step.estimatedTime, 0) / 60)} minutes</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleStartTutorial}
                className="w-full"
                disabled={isLoading}
              >
                <Play className="h-4 w-4 mr-2" />
                {isLoading ? 'Starting...' : 'Start Tutorial'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  // Open settings
                  setShowTutorialMenu(false);
                }}
                className="w-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                Tutorial Settings
              </Button>
            </div>

            {pageSteps.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Tutorial Steps:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {pageSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-xs"
                    >
                      <Badge variant="outline" className="text-xs">
                        {index + 1}
                      </Badge>
                      <span className="flex-1 truncate">{step.title}</span>
                      <Badge
                        variant="secondary"
                        className="text-xs"
                      >
                        {step.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render error state
  if (error) {
    return (
      <div className={`tutorial-error ${className}`}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <X className="h-4 w-4" />
              <span className="text-sm font-medium">Tutorial Error</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetTutorial}
              className="mt-2"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset Tutorial
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`tutorial-manager ${className}`}>
      {/* Tutorial Menu Button - Removed to avoid overlap with Customize button */}

      {/* Tutorial Menu */}
      {renderTutorialMenu()}

      {/* Tutorial Overlay */}
      {isActive && currentStep && (
        <TutorialOverlay
          step={currentStep}
          isVisible={isActive}
          onNext={handleNextStep}
          onPrevious={handlePreviousStep}
          onSkip={handleSkipStep}
          onClose={handleCloseTutorial}
          onPause={handlePauseTutorial}
          onResume={handleResumeTutorial}
          position={getStepPosition(currentStep)}
          targetElement={targetElement}
          navigation={navigation || {
            canGoNext: canProceed(),
            canGoPrevious: canGoBack(),
            canSkip: currentStep.skipAllowed,
            canPause: isActive,
            canResume: !isActive && !!tutorialState,
            canClose: true,
            currentStepIndex: tutorialState?.currentStep || 0,
            totalSteps: pageSteps.length
          }}
          progress={progress}
        />
      )}

      {/* Tutorial Navigation (if needed) */}
      {isActive && (
        <div className="fixed bottom-4 left-4 z-[9995]">
          <TutorialNavigation
            navigation={navigation || {
              canGoNext: canProceed(),
              canGoPrevious: canGoBack(),
              canSkip: currentStep?.skipAllowed || false,
              canPause: isActive,
              canResume: !isActive && !!tutorialState,
              canClose: true,
              currentStepIndex: tutorialState?.currentStep || 0,
              totalSteps: pageSteps.length
            }}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
            onSkip={handleSkipStep}
            onPause={handlePauseTutorial}
            onResume={handleResumeTutorial}
            onClose={handleCloseTutorial}
            onReset={handleResetTutorial}
            onSettings={() => setShowTutorialMenu(true)}
            currentStepIndex={tutorialState?.currentStep || 0}
            totalSteps={pageSteps.length}
            isVisible={isActive}
          />
        </div>
      )}
    </div>
  );
};

export default TutorialManager;

