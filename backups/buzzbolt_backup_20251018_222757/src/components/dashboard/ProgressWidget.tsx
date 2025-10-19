// src/components/dashboard/ProgressWidget.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Flame, Target } from 'lucide-react';
import { DashboardWidget } from '@/lib/dashboardWidgets';

interface ProgressWidgetProps {
  widget: DashboardWidget;
  onAction: (action: string, data?: any) => void;
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({ widget, onAction }) => {
  const { data } = widget;
  const { levelProgress, streakDays, dailyStats } = data;

  const handleViewProgress = () => {
    onAction('view_progress');
  };

  const handleViewDailyTasks = () => {
    onAction('view_daily_tasks');
  };

  return (
    <Card className="border-success/50 bg-gradient-success shadow-elegant hover:shadow-glow transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-success-foreground">
          <TrendingUp className="h-5 w-5" />
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-success-foreground/80">
          {widget.description}
        </p>

        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-success-foreground/80">Level Progress</span>
            <span className="text-success-foreground font-semibold">
              {levelProgress.currentXp}/{levelProgress.xpToNext + levelProgress.currentXp} XP
            </span>
          </div>
          <Progress 
            value={(levelProgress.currentXp / (levelProgress.xpToNext + levelProgress.currentXp)) * 100} 
            className="h-2"
          />
        </div>

        {/* Streak Display */}
        {streakDays > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-success-foreground/20 text-success-foreground">
              <Flame className="h-3 w-3 mr-1" />
              {streakDays} day streak
            </Badge>
          </div>
        )}

        {/* Daily Tasks Progress */}
        {dailyStats && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-success-foreground/80">Daily Tasks</span>
              <span className="text-success-foreground font-semibold">
                {dailyStats.completedToday || 0} completed
              </span>
            </div>
            <Progress 
              value={dailyStats.completionRate || 0} 
              className="h-2"
            />
          </div>
        )}

        <div className="flex gap-2">
          <button 
            onClick={handleViewProgress}
            className="text-xs text-success-foreground/80 hover:text-success-foreground underline"
          >
            View Full Progress
          </button>
          <button 
            onClick={handleViewDailyTasks}
            className="text-xs text-success-foreground/80 hover:text-success-foreground underline"
          >
            Daily Tasks
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
