// src/components/ui/EnhancedButton.tsx
import React, { forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { microInteractionManager, MicroInteractionManager } from '@/lib/microInteractions';
import { cn } from '@/lib/utils';

interface EnhancedButtonProps extends ButtonProps {
  microInteraction?: keyof typeof MicroInteractionManager.INTERACTIONS;
  successFeedback?: boolean;
  errorFeedback?: boolean;
  loadingFeedback?: boolean;
  hapticFeedback?: boolean;
  soundFeedback?: boolean;
}

export const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    children, 
    microInteraction,
    successFeedback = false,
    errorFeedback = false,
    loadingFeedback = false,
    hapticFeedback = false,
    soundFeedback = false,
    onClick,
    ...props 
  }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Trigger micro-interaction
      if (microInteraction) {
        const interaction = MicroInteractionManager.INTERACTIONS[microInteraction];
        microInteractionManager.triggerInteraction(interaction);
      }

      // Trigger success feedback
      if (successFeedback) {
        const successInteraction = MicroInteractionManager.INTERACTIONS.SUCCESS_FEEDBACK;
        microInteractionManager.triggerInteraction(successInteraction);
      }

      // Trigger error feedback
      if (errorFeedback) {
        const errorInteraction = MicroInteractionManager.INTERACTIONS.ERROR_FEEDBACK;
        microInteractionManager.triggerInteraction(errorInteraction);
      }

      // Trigger loading feedback
      if (loadingFeedback) {
        const loadingInteraction = MicroInteractionManager.INTERACTIONS.LOADING_SPINNER;
        microInteractionManager.triggerInteraction(loadingInteraction);
      }

      // Call original onClick
      if (onClick) {
        onClick(e);
      }
    };

    const handleMouseEnter = () => {
      if (microInteraction) {
        const hoverInteraction = MicroInteractionManager.INTERACTIONS.BUTTON_HOVER;
        microInteractionManager.triggerInteraction(hoverInteraction);
      }
    };

    return (
      <Button
        ref={ref}
        className={cn(
          'transition-all duration-200 ease-in-out',
          'hover:scale-105 hover:shadow-lg',
          'active:scale-95 active:shadow-sm',
          'focus:ring-2 focus:ring-offset-2 focus:ring-primary',
          className
        )}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        data-micro-interaction={microInteraction}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';
