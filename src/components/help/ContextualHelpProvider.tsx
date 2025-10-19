// src/components/help/ContextualHelpProvider.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { contextualHelpManager, HelpTooltip, HelpPreferences } from '@/lib/contextualHelp';

interface ContextualHelpContextType {
  showTooltip: (tooltip: HelpTooltip) => void;
  hideTooltip: (tooltipId: string) => void;
  dismissTooltip: (tooltipId: string) => void;
  getContextualTooltips: () => HelpTooltip[];
  updatePreferences: (preferences: Partial<HelpPreferences>) => void;
  getPreferences: () => HelpPreferences;
  resetTooltips: () => void;
}

const ContextualHelpContext = createContext<ContextualHelpContextType | undefined>(undefined);

interface ContextualHelpProviderProps {
  children: ReactNode;
}

export const ContextualHelpProvider: React.FC<ContextualHelpProviderProps> = ({ children }) => {
  const [activeTooltips, setActiveTooltips] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Initialize contextual help
    contextualHelpManager.checkForContextualHelp();
  }, []);

  const showTooltip = (tooltip: HelpTooltip) => {
    contextualHelpManager.showTooltip(tooltip);
    setActiveTooltips(prev => new Set([...prev, tooltip.id]));
  };

  const hideTooltip = (tooltipId: string) => {
    setActiveTooltips(prev => {
      const newSet = new Set(prev);
      newSet.delete(tooltipId);
      return newSet;
    });
  };

  const dismissTooltip = (tooltipId: string) => {
    contextualHelpManager.dismissTooltip(tooltipId);
    setActiveTooltips(prev => {
      const newSet = new Set(prev);
      newSet.delete(tooltipId);
      return newSet;
    });
  };

  const getContextualTooltips = () => {
    return contextualHelpManager.getContextualTooltips();
  };

  const updatePreferences = (preferences: Partial<HelpPreferences>) => {
    contextualHelpManager.updatePreferences(preferences);
  };

  const getPreferences = () => {
    return contextualHelpManager.getPreferences();
  };

  const resetTooltips = () => {
    contextualHelpManager.resetTooltips();
    setActiveTooltips(new Set());
  };

  const contextValue: ContextualHelpContextType = {
    showTooltip,
    hideTooltip,
    dismissTooltip,
    getContextualTooltips,
    updatePreferences,
    getPreferences,
    resetTooltips,
  };

  return (
    <ContextualHelpContext.Provider value={contextValue}>
      {children}
      
      {/* Contextual Help Styles */}
      <style jsx global>{`
        .contextual-help-tooltip {
          position: fixed;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          max-width: 300px;
          z-index: 9999;
          opacity: 1;
          transform: scale(1);
          transition: all 0.2s ease-in-out;
        }

        .contextual-help-tooltip::before {
          content: '';
          position: absolute;
          width: 0;
          height: 0;
          border: 8px solid transparent;
        }

        .contextual-help-tooltip[data-position="top"]::before {
          bottom: -16px;
          left: 50%;
          transform: translateX(-50%);
          border-top-color: #e5e7eb;
        }

        .contextual-help-tooltip[data-position="bottom"]::before {
          top: -16px;
          left: 50%;
          transform: translateX(-50%);
          border-bottom-color: #e5e7eb;
        }

        .contextual-help-tooltip[data-position="left"]::before {
          right: -16px;
          top: 50%;
          transform: translateY(-50%);
          border-left-color: #e5e7eb;
        }

        .contextual-help-tooltip[data-position="right"]::before {
          left: -16px;
          top: 50%;
          transform: translateY(-50%);
          border-right-color: #e5e7eb;
        }

        .tooltip-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px 8px;
          border-bottom: 1px solid #f3f4f6;
        }

        .tooltip-title {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .tooltip-close {
          background: none;
          border: none;
          font-size: 18px;
          color: #6b7280;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tooltip-close:hover {
          color: #374151;
        }

        .tooltip-content {
          padding: 8px 16px;
        }

        .tooltip-content p {
          font-size: 13px;
          color: #4b5563;
          margin: 0;
          line-height: 1.4;
        }

        .tooltip-footer {
          padding: 8px 16px 12px;
          border-top: 1px solid #f3f4f6;
        }

        .tooltip-dismiss {
          background: none;
          border: none;
          font-size: 12px;
          color: #6b7280;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .tooltip-dismiss:hover {
          background: #f3f4f6;
          color: #374151;
        }
      `}</style>
    </ContextualHelpContext.Provider>
  );
};

export const useContextualHelp = (): ContextualHelpContextType => {
  const context = useContext(ContextualHelpContext);
  if (context === undefined) {
    throw new Error('useContextualHelp must be used within a ContextualHelpProvider');
  }
  return context;
};
