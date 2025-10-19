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
      return null;
  }
};
