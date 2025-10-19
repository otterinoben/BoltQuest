// src/components/ui/EnhancedProgress.tsx
import React, { forwardRef, useEffect, useState } from 'react';
import { Progress, ProgressProps } from '@/components/ui/progress';
import { microInteractionManager, MicroInteractionManager } from '@/lib/microInteractions';
import { cn } from '@/lib/utils';

interface EnhancedProgressProps extends ProgressProps {
  animated?: boolean;
  showMilestones?: boolean;
  milestones?: number[];
  onMilestoneReached?: (milestone: number) => void;
  successThreshold?: number;
  warningThreshold?: number;
  microInteraction?: keyof typeof MicroInteractionManager.INTERACTIONS;
}

export const EnhancedProgress = forwardRef<HTMLDivElement, EnhancedProgressProps>(
  ({ 
    className, 
    value = 0,
    animated = true,
    showMilestones = false,
    milestones = [25, 50, 75, 100],
    onMilestoneReached,
    successThreshold = 80,
    warningThreshold = 50,
    microInteraction,
    ...props 
  }, ref) => {
    const [animatedValue, setAnimatedValue] = useState(0);
    const [reachedMilestones, setReachedMilestones] = useState<Set<number>>(new Set());

    // Animate progress changes
    useEffect(() => {
      if (!animated) {
        setAnimatedValue(value);
        return;
      }

      const duration = 1000; // 1 second animation
      const steps = 60; // 60 FPS
      const stepDuration = duration / steps;
      const increment = (value - animatedValue) / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        setAnimatedValue(prev => {
          const next = prev + increment;
          if (currentStep >= steps) {
            clearInterval(timer);
            return value;
          }
          return next;
        });
      }, stepDuration);
      
      return () => clearInterval(timer);
    }, [value, animated, animatedValue]);

    // Check for milestone achievements
    useEffect(() => {
      milestones.forEach(milestone => {
        if (animatedValue >= milestone && !reachedMilestones.has(milestone)) {
          setReachedMilestones(prev => new Set([...prev, milestone]));
          
          // Trigger milestone interaction
          if (microInteraction) {
            const interaction = MicroInteractionManager.INTERACTIONS[microInteraction];
            microInteractionManager.triggerInteraction(interaction);
          }

          // Call milestone callback
          if (onMilestoneReached) {
            onMilestoneReached(milestone);
          }
        }
      });
    }, [animatedValue, milestones, reachedMilestones, microInteraction, onMilestoneReached]);

    const getProgressColor = () => {
      if (animatedValue >= successThreshold) return 'bg-green-500';
      if (animatedValue >= warningThreshold) return 'bg-yellow-500';
      return 'bg-blue-500';
    };

    const getProgressGlow = () => {
      if (animatedValue >= successThreshold) return 'shadow-green-500/50';
      if (animatedValue >= warningThreshold) return 'shadow-yellow-500/50';
      return 'shadow-blue-500/50';
    };

    return (
      <div ref={ref} className={cn('relative', className)}>
        <Progress
          value={animatedValue}
          className={cn(
            'transition-all duration-300 ease-out',
            'h-2 bg-gray-200',
            animatedValue > 0 && 'shadow-lg',
            getProgressGlow()
          )}
          style={{
            background: `linear-gradient(to right, ${getProgressColor()} 0%, ${getProgressColor()} ${animatedValue}%, #e5e7eb ${animatedValue}%, #e5e7eb 100%)`,
          }}
          {...props}
        />
        
        {/* Milestone markers */}
        {showMilestones && (
          <div className="absolute inset-0 flex justify-between items-center pointer-events-none">
            {milestones.map((milestone) => (
              <div
                key={milestone}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  animatedValue >= milestone 
                    ? 'bg-white shadow-lg scale-125' 
                    : 'bg-gray-300'
                )}
                style={{ left: `${milestone}%` }}
              />
            ))}
          </div>
        )}

        {/* Progress value display */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xs font-semibold text-white drop-shadow-sm">
            {Math.round(animatedValue)}%
          </span>
        </div>
      </div>
    );
  }
);

EnhancedProgress.displayName = 'EnhancedProgress';
