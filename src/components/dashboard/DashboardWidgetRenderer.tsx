// src/components/dashboard/DashboardWidgetRenderer.tsx
import React from 'react';
import { DashboardWidget } from '@/lib/dashboardWidgets';
import { QuickActionWidget } from './QuickActionWidget';
import { ProgressWidget } from './ProgressWidget';
import { AchievementWidget } from './AchievementWidget';
import { RecommendationWidget } from './RecommendationWidget';
import { SocialWidget } from './SocialWidget';

interface DashboardWidgetRendererProps {
  widget: DashboardWidget;
  onAction: (action: string, data?: any) => void;
}

export const DashboardWidgetRenderer: React.FC<DashboardWidgetRendererProps> = ({ widget, onAction }) => {
  if (!widget) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-red-600 text-sm">Error: No widget data</p>
      </div>
    );
  }

  try {
    switch (widget.type) {
      case 'quick-action':
        return <QuickActionWidget widget={widget} onAction={onAction} />;
      case 'progress':
        return <ProgressWidget widget={widget} onAction={onAction} />;
      case 'achievement':
        return <AchievementWidget widget={widget} onAction={onAction} />;
      case 'recommendation':
        return <RecommendationWidget widget={widget} onAction={onAction} />;
      case 'social':
        return <SocialWidget widget={widget} onAction={onAction} />;
      default:
        return (
          <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
            <p className="text-yellow-600 text-sm">Unknown widget type: {widget.type}</p>
          </div>
        );
    }
  } catch (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-red-600 text-sm">Error rendering widget: {widget.id}</p>
        <p className="text-red-500 text-xs mt-1">{error.message}</p>
      </div>
    );
  }
};
