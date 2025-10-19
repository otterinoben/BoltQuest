/**
 * Tutorial Navigation Component
 * Navigation controls for tutorial progression
 */

import React from 'react';
import { TutorialNavigation as TutorialNavigationType } from '@/types/tutorial';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  SkipForward, 
  Pause, 
  Play, 
  X,
  RotateCcw,
  Settings
} from 'lucide-react';

interface TutorialNavigationProps {
  navigation: TutorialNavigationType;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onPause: () => void;
  onResume: () => void;
  onClose: () => void;
  onReset: () => void;
  onSettings: () => void;
  currentStepIndex: number;
  totalSteps: number;
  isVisible?: boolean;
  className?: string;
}

const TutorialNavigation: React.FC<TutorialNavigationProps> = ({
  navigation,
  onNext,
  onPrevious,
  onSkip,
  onPause,
  onResume,
  onClose,
  onReset,
  onSettings,
  currentStepIndex,
  totalSteps,
  isVisible = true,
  className = ''
}) => {
  if (!isVisible) return null;

  const progressPercentage = totalSteps > 0 ? (currentStepIndex / totalSteps) * 100 : 0;

  return (
    <div className={`tutorial-navigation ${className}`}>
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Tutorial Progress
          </span>
          <Badge variant="outline" className="text-xs">
            {currentStepIndex + 1} of {totalSteps}
          </Badge>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        {/* Left Controls */}
        <div className="flex items-center gap-2">
          {navigation.canGoPrevious && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevious}
              className="h-9"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
          )}

          {navigation.canPause && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPause}
              className="h-9"
              title="Pause tutorial (Space)"
            >
              <Pause className="h-4 w-4" />
            </Button>
          )}

          {navigation.canResume && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResume}
              className="h-9"
              title="Resume tutorial (Space)"
            >
              <Play className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 text-muted-foreground"
            title="Reset tutorial"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Center Controls */}
        <div className="flex items-center gap-2">
          {navigation.canSkip && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="h-9 text-muted-foreground"
              title="Skip current step (S)"
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Skip
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onSettings}
            className="h-9 text-muted-foreground"
            title="Tutorial settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {navigation.canGoNext && (
            <Button
              size="sm"
              onClick={onNext}
              className="h-9"
              title="Next step (Enter or →)"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}

          {navigation.canClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 text-muted-foreground"
              title="Close tutorial (Esc)"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd>
            or
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">→</kbd>
            Next
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">←</kbd>
            Previous
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Space</kbd>
            Pause/Resume
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">S</kbd>
            Skip
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
};

export default TutorialNavigation;



