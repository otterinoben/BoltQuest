// src/components/dashboard/AchievementWidget.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Target } from 'lucide-react';
import { DashboardWidget } from '@/lib/dashboardWidgets';

interface AchievementWidgetProps {
  widget: DashboardWidget;
  onAction: (action: string, data?: any) => void;
}

export const AchievementWidget: React.FC<AchievementWidgetProps> = ({ widget, onAction }) => {
  const { data } = widget;
  const { unlockedCount, nextAchievement, totalCount } = data;

  const handleViewAchievements = () => {
    onAction('view_achievements');
  };

  const handleAchievementHunt = () => {
    onAction('achievement_hunt', { achievement: nextAchievement });
  };

  const completionRate = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <Card className="border-warning/50 bg-gradient-warning shadow-elegant hover:shadow-glow transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-warning-foreground">
          <Trophy className="h-5 w-5" />
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-warning-foreground/80">
          {widget.description}
        </p>

        {/* Achievement Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-warning-foreground/80">Progress</span>
            <span className="text-warning-foreground font-semibold">
              {unlockedCount}/{totalCount} unlocked
            </span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {/* Next Achievement */}
        {nextAchievement && (
          <div className="p-3 rounded-lg bg-warning-foreground/10 border border-warning-foreground/20">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-warning-foreground" />
              <span className="text-sm font-semibold text-warning-foreground">
                Next: {nextAchievement.name}
              </span>
            </div>
            <p className="text-xs text-warning-foreground/80 mb-2">
              {nextAchievement.description}
            </p>
            <Badge variant="outline" className="text-xs border-warning-foreground/30 text-warning-foreground">
              {nextAchievement.category}
            </Badge>
          </div>
        )}

        <div className="flex gap-2">
          <button 
            onClick={handleViewAchievements}
            className="text-xs text-warning-foreground/80 hover:text-warning-foreground underline"
          >
            View All Achievements
          </button>
          {nextAchievement && (
            <button 
              onClick={handleAchievementHunt}
              className="text-xs text-warning-foreground/80 hover:text-warning-foreground underline"
            >
              Achievement Hunt
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
