import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { contextualHelpManager } from '@/lib/contextualHelp';

interface HelpTriggerProps {
  helpKey: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  children?: React.ReactNode;
}

export const HelpTrigger: React.FC<HelpTriggerProps> = ({
  helpKey,
  position = 'top',
  className = '',
  children
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const helpContent = contextualHelpManager.getHelpContent(helpKey);

  const calculateTooltipPosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 300; // max-width from CSS
    const tooltipHeight = 120; // estimated height
    const padding = 10;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        y = rect.top - tooltipHeight - padding;
        break;
      case 'bottom':
        x = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        y = rect.bottom + padding;
        break;
      case 'left':
        x = rect.left - tooltipWidth - padding;
        y = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        break;
      case 'right':
        x = rect.right + padding;
        y = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        break;
    }

    // Keep tooltip within viewport
    x = Math.max(padding, Math.min(x, window.innerWidth - tooltipWidth - padding));
    y = Math.max(padding, Math.min(y, window.innerHeight - tooltipHeight - padding));

    setTooltipPosition({ x, y });
  };

  const handleMouseEnter = () => {
    calculateTooltipPosition();
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleDismiss = () => {
    setShowTooltip(false);
    contextualHelpManager.dismissHelp(helpKey);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (showTooltip) {
        calculateTooltipPosition();
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [showTooltip, position]);

  if (!helpContent) return null;

  return (
    <>
      <div
        ref={triggerRef}
        className={`inline-flex items-center ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children || (
          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
        )}
      </div>

      {showTooltip && (
        <div
          ref={tooltipRef}
          className="contextual-help-tooltip"
          data-position={position}
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="tooltip-header">
            <h3 className="tooltip-title">{helpContent.title}</h3>
            <button
              className="tooltip-close"
              onClick={handleDismiss}
              aria-label="Close help"
            >
              ×
            </button>
          </div>
          <div className="tooltip-content">
            <p>{helpContent.content}</p>
          </div>
          <div className="tooltip-footer">
            <button
              className="tooltip-dismiss"
              onClick={handleDismiss}
            >
              Don't show again
            </button>
          </div>
        </div>
      )}
    </>
  );
};
