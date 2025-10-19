/**
 * Tutorial Overlay Component
 * Main overlay component for displaying tutorial steps
 */

import React, { useEffect, useRef, useState } from 'react';
import { TutorialOverlayProps } from '@/types/tutorial';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Pause, 
  Play, 
  SkipForward,
  HelpCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  step,
  isVisible,
  onNext,
  onPrevious,
  onSkip,
  onClose,
  onPause,
  onResume,
  position,
  targetElement,
  navigation,
  progress
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [arrowPosition, setArrowPosition] = useState<{ top: number; left: number; rotation: number }>({
    top: 0,
    left: 0,
    rotation: 0
  });
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate arrow position based on target element
  useEffect(() => {
    if (targetElement && overlayRef.current) {
      const targetRect = targetElement.getBoundingClientRect();
      const overlayRect = overlayRef.current.getBoundingClientRect();
      
      let arrowTop = 0;
      let arrowLeft = 0;
      let rotation = 0;

      switch (position) {
        case 'top':
          arrowTop = overlayRect.height;
          arrowLeft = overlayRect.width / 2;
          rotation = 180;
          break;
        case 'bottom':
          arrowTop = -10;
          arrowLeft = overlayRect.width / 2;
          rotation = 0;
          break;
        case 'left':
          arrowTop = overlayRect.height / 2;
          arrowLeft = overlayRect.width;
          rotation = 90;
          break;
        case 'right':
          arrowTop = overlayRect.height / 2;
          arrowLeft = -10;
          rotation = -90;
          break;
        case 'center':
          // No arrow for center position
          break;
      }

      setArrowPosition({ top: arrowTop, left: arrowLeft, rotation });
    }
  }, [targetElement, position]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isVisible) return;

      switch (event.key) {
        case 'ArrowRight':
        case 'Enter':
          if (navigation.canGoNext) {
            onNext();
          }
          break;
        case 'ArrowLeft':
          if (navigation.canGoPrevious) {
            onPrevious();
          }
          break;
        case 'Escape':
          onClose();
          break;
        case ' ':
          event.preventDefault();
          if (navigation.canPause) {
            onPause();
          } else if (navigation.canResume) {
            onResume();
          }
          break;
        case 's':
        case 'S':
          if (navigation.canSkip) {
            onSkip();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, navigation, onNext, onPrevious, onClose, onPause, onResume, onSkip]);

  // Handle animation
  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const getOverlayPosition = () => {
    if (!targetElement) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999
      };
    }

    const targetRect = targetElement.getBoundingClientRect();
    const overlayWidth = 400;
    const overlayHeight = 300;
    const margin = 20;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = targetRect.top - overlayHeight - margin;
        left = targetRect.left + (targetRect.width - overlayWidth) / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + margin;
        left = targetRect.left + (targetRect.width - overlayWidth) / 2;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height - overlayHeight) / 2;
        left = targetRect.left - overlayWidth - margin;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height - overlayHeight) / 2;
        left = targetRect.right + margin;
        break;
      case 'center':
        top = '50%';
        left = '50%';
        break;
    }

    // Ensure overlay stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < margin) left = margin;
    if (left + overlayWidth > viewportWidth - margin) {
      left = viewportWidth - overlayWidth - margin;
    }
    if (top < margin) top = margin;
    if (top + overlayHeight > viewportHeight - margin) {
      top = viewportHeight - overlayHeight - margin;
    }

    return {
      position: 'fixed' as const,
      top: typeof top === 'string' ? top : `${top}px`,
      left: typeof left === 'string' ? left : `${left}px`,
      zIndex: 9999
    };
  };

  const getStepIcon = () => {
    switch (step.action) {
      case 'click':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'hover':
        return <HelpCircle className="h-5 w-5 text-green-500" />;
      case 'form':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'scroll':
        return <ChevronRight className="h-5 w-5 text-purple-500" />;
      case 'wait':
        return <Pause className="h-5 w-5 text-gray-500" />;
      default:
        return <HelpCircle className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />
      
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={`fixed z-[9999] transition-all duration-300 ${
          isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={getOverlayPosition()}
      >
        <Card className="w-96 shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStepIcon()}
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {progress && (
                  <Badge variant="outline" className="text-xs">
                    {navigation.currentStepIndex + 1} of {navigation.totalSteps}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Step Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>

            {/* Content */}
            {step.content && (
              <div className="space-y-2">
                {step.content.text && (
                  <p className="text-sm font-medium text-foreground">
                    {step.content.text}
                  </p>
                )}
                
                {step.content.helpText && (
                  <p className="text-xs text-muted-foreground italic">
                    💡 {step.content.helpText}
                  </p>
                )}
                
                {step.content.successMessage && (
                  <p className="text-xs text-green-600 font-medium">
                    ✅ {step.content.successMessage}
                  </p>
                )}
                
                {step.content.errorMessage && (
                  <p className="text-xs text-red-600 font-medium">
                    ❌ {step.content.errorMessage}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {navigation.canGoPrevious && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onPrevious}
                    className="h-8"
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
                    className="h-8"
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                )}
                
                {navigation.canResume && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onResume}
                    className="h-8"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {navigation.canSkip && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSkip}
                    className="h-8 text-muted-foreground"
                  >
                    <SkipForward className="h-4 w-4 mr-1" />
                    Skip
                  </Button>
                )}
                
                {navigation.canGoNext && (
                  <Button
                    size="sm"
                    onClick={onNext}
                    className="h-8"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {progress && (
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(navigation.currentStepIndex / navigation.totalSteps) * 100}%`
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Arrow */}
        {position !== 'center' && (
          <div
            className="absolute w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-primary/20"
            style={{
              top: `${arrowPosition.top}px`,
              left: `${arrowPosition.left}px`,
              transform: `rotate(${arrowPosition.rotation}deg)`
            }}
          />
        )}
      </div>
    </>
  );
};

export default TutorialOverlay;



