// src/components/dashboard/RecommendationWidget.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Play, Target, TrendingUp } from 'lucide-react';
import { DashboardWidget } from '@/lib/dashboardWidgets';

interface RecommendationWidgetProps {
  widget: DashboardWidget;
  onAction: (action: string, data?: any) => void;
}

export const RecommendationWidget: React.FC<RecommendationWidgetProps> = ({ widget, onAction }) => {
  const { data } = widget;
  const { type, message, action, category, difficulty } = data;

  const handleRecommendationAction = () => {
    if (action === 'play_game') {
      onAction('play_game', { category, difficulty });
    } else {
      onAction(action, data);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'xp': return <Target className="h-4 w-4" />;
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'xp': return 'text-blue-600';
      case 'performance': return 'text-green-600';
      default: return 'text-purple-600';
    }
  };

  return (
    <Card className="border-info/50 bg-gradient-info shadow-elegant hover:shadow-glow transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-info-foreground">
          <Lightbulb className="h-5 w-5" />
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`mt-1 ${getColor()}`}>
            {getIcon()}
          </div>
          <p className="text-sm text-info-foreground/80 flex-1">
            {message}
          </p>
        </div>

        {action === 'play_game' && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-info-foreground/30 text-info-foreground">
              {category}
            </Badge>
            <Badge variant="outline" className="text-xs border-info-foreground/30 text-info-foreground">
              {difficulty}
            </Badge>
          </div>
        )}

        <Button 
          onClick={handleRecommendationAction}
          size="sm"
          className="bg-info-foreground/20 hover:bg-info-foreground/30 text-info-foreground border-info-foreground/30"
        >
          <Play className="mr-2 h-4 w-4" />
          {action === 'play_game' ? 'Start Game' : 'Learn More'}
        </Button>
      </CardContent>
    </Card>
  );
};
