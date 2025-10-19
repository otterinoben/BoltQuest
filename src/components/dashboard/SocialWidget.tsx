// src/components/dashboard/SocialWidget.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, TrendingUp } from 'lucide-react';
import { DashboardWidget } from '@/lib/dashboardWidgets';

interface SocialWidgetProps {
  widget: DashboardWidget;
  onAction: (action: string, data?: any) => void;
}

export const SocialWidget: React.FC<SocialWidgetProps> = ({ widget, onAction }) => {
  const { data } = widget;
  const { recentActivity, eloRating } = data;

  const handleViewLeaderboards = () => {
    onAction('view_leaderboards');
  };

  const handleViewCommunity = () => {
    onAction('view_community');
  };

  return (
    <Card className="border-secondary/50 bg-gradient-secondary shadow-elegant hover:shadow-glow transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-secondary-foreground">
          <Users className="h-5 w-5" />
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-secondary-foreground/80">
          {widget.description}
        </p>

        {/* ELO Rating */}
        {eloRating && (
          <div className="p-3 rounded-lg bg-secondary-foreground/10 border border-secondary-foreground/20">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-secondary-foreground" />
              <span className="text-sm font-semibold text-secondary-foreground">
                Overall Rating: {eloRating.rating}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-secondary-foreground/30 text-secondary-foreground">
                {eloRating.category}
              </Badge>
              <span className="text-xs text-secondary-foreground/80">
                {eloRating.trend === 'up' ? '↗️ Rising' : 
                 eloRating.trend === 'down' ? '↘️ Falling' : '→ Stable'}
              </span>
            </div>
          </div>
        )}

        {/* Activity Type Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-secondary-foreground/30 text-secondary-foreground">
            {recentActivity.type}
          </Badge>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleViewLeaderboards}
            className="text-xs text-secondary-foreground/80 hover:text-secondary-foreground underline"
          >
            View Leaderboards
          </button>
          <button 
            onClick={handleViewCommunity}
            className="text-xs text-secondary-foreground/80 hover:text-secondary-foreground underline"
          >
            Community
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
