import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight, ArrowLeft, CheckCircle, Play, Target, BarChart3, Star, Settings } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to BoltQuest!',
    description: 'Learn business buzzwords and industry jargon through fun, interactive quizzes.',
    icon: <Star className="h-6 w-6 text-primary" />,
  },
  {
    id: 'quick-start',
    title: 'Quick Start',
    description: 'Choose a category and difficulty to begin playing immediately.',
    icon: <Play className="h-6 w-6 text-primary" />,
    target: '[data-tutorial="quick-start-section"]',
    position: 'bottom'
  },
  {
    id: 'categories',
    title: 'Choose Your Category',
    description: 'Select from Technology, Business, Marketing, Finance, or General topics.',
    icon: <Target className="h-6 w-6 text-primary" />,
    target: '[data-tutorial="category-buttons"]',
    position: 'bottom'
  },
  {
    id: 'difficulty',
    title: 'Pick Difficulty',
    description: 'Easy (2-3 min), Medium (3-5 min), or Hard (5-8 min) - choose your challenge level.',
    icon: <BarChart3 className="h-6 w-6 text-primary" />,
    target: '[data-tutorial="difficulty-buttons"]',
    position: 'bottom'
  },
  {
    id: 'start-game',
    title: 'Start Playing!',
    description: 'Click "Start Playing Now" to begin your first game with the selected settings.',
    icon: <Play className="h-6 w-6 text-primary" />,
    target: '[data-tutorial="start-game-button"]',
    position: 'top'
  },
  {
    id: 'customize',
    title: 'Customize Your Experience',
    description: 'Use "Customize Game" to set timers, save favorites, and fine-tune your experience.',
    icon: <Settings className="h-6 w-6 text-primary" />,
    target: '[data-tutorial="customize-button"]',
    position: 'top'
  }
];

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setCurrentStep(0);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isVisible) return null;

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Tutorial Card */}
      <Card className="relative w-full max-w-md mx-auto bg-card border-border shadow-elegant">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {step.icon}
              <h2 className="text-lg font-semibold text-foreground">
                {step.title}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip Tutorial
              </Button>
            </div>
            
            <Button
              onClick={handleNext}
              className="flex items-center gap-1"
            >
              {currentStep === tutorialSteps.length - 1 ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tutorial;




