// src/components/ui/EnhancedCard.tsx
import React, { forwardRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { microInteractionManager, MicroInteractionManager } from '@/lib/microInteractions';
import { cn } from '@/lib/utils';

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  microInteraction?: keyof typeof MicroInteractionManager.INTERACTIONS;
  hoverable?: boolean;
  clickable?: boolean;
  glowOnHover?: boolean;
  pulseOnFocus?: boolean;
}

export const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ 
    className, 
    children, 
    microInteraction,
    hoverable = false,
    clickable = false,
    glowOnHover = false,
    pulseOnFocus = false,
    onClick,
    ...props 
  }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (clickable && microInteraction) {
        const interaction = MicroInteractionManager.INTERACTIONS[microInteraction];
        microInteractionManager.triggerInteraction(interaction);
      }

      if (onClick) {
        onClick(e);
      }
    };

    const handleMouseEnter = () => {
      if (hoverable) {
        const hoverInteraction = MicroInteractionManager.INTERACTIONS.BUTTON_HOVER;
        microInteractionManager.triggerInteraction(hoverInteraction);
      }
    };

    const handleFocus = () => {
      if (pulseOnFocus) {
        const pulseInteraction = MicroInteractionManager.INTERACTIONS.PULSE_ATTENTION;
        microInteractionManager.triggerInteraction(pulseInteraction);
      }
    };

    return (
      <Card
        ref={ref}
        className={cn(
          'transition-all duration-300 ease-in-out',
          hoverable && 'hover:scale-105 hover:shadow-xl',
          clickable && 'cursor-pointer active:scale-95',
          glowOnHover && 'hover:shadow-glow hover:border-primary/50',
          pulseOnFocus && 'focus:ring-2 focus:ring-primary focus:ring-offset-2',
          className
        )}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onFocus={handleFocus}
        data-micro-interaction={microInteraction}
        tabIndex={clickable ? 0 : undefined}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

EnhancedCard.displayName = 'EnhancedCard';

// Enhanced Card sub-components
export const EnhancedCardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <CardHeader
      ref={ref}
      className={cn('transition-all duration-200', className)}
      {...props}
    />
  )
);

EnhancedCardHeader.displayName = 'EnhancedCardHeader';

export const EnhancedCardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <CardTitle
      ref={ref}
      className={cn('transition-all duration-200', className)}
      {...props}
    />
  )
);

EnhancedCardTitle.displayName = 'EnhancedCardTitle';

export const EnhancedCardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <CardDescription
      ref={ref}
      className={cn('transition-all duration-200', className)}
      {...props}
    />
  )
);

EnhancedCardDescription.displayName = 'EnhancedCardDescription';

export const EnhancedCardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <CardContent
      ref={ref}
      className={cn('transition-all duration-200', className)}
      {...props}
    />
  )
);

EnhancedCardContent.displayName = 'EnhancedCardContent';
