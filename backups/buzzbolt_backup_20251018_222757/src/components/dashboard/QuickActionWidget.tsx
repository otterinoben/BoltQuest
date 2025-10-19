// src/components/dashboard/QuickActionWidget.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, Zap } from 'lucide-react';
import { DashboardWidget } from '@/lib/dashboardWidgets';

interface QuickActionWidgetProps {
  widget: DashboardWidget;
  onAction: (action: string, data?: any) => void;
}

export const QuickActionWidget: React.FC<QuickActionWidgetProps> = ({ widget, onAction }) => {
  const { data } = widget;
  const { lastGame, hasIncompleteGame } = data;

  const handleQuickPlay = () => {
    onAction('quick_play', { useLastSettings: true });
  };

  const handleContinueGame = () => {
    onAction('continue_game', { gameId: lastGame.id });
  };

  const handleDailyChallenge = () => {
    onAction('daily_challenge');
  };

  return (
    <Card className="border-primary/50 bg-gradient-primary shadow-elegant hover:shadow-glow transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary-foreground">
          <Zap className="h-5 w-5" />
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-primary-foreground/80">
          {widget.description}
        </p>
        
        <div className="flex flex-col gap-2">
          {hasIncompleteGame ? (
            <Button 
              onClick={handleContinueGame}
              className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-primary-foreground/30"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Continue Game
            </Button>
          ) : (
            <Button 
              onClick={handleQuickPlay}
              className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-primary-foreground/30"
            >
              <Play className="mr-2 h-4 w-4" />
              Quick Play
            </Button>
          )}
          
          <Button 
            onClick={handleDailyChallenge}
            variant="outline"
            size="sm"
            className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
          >
            Daily Challenge
          </Button>
        </div>

        {lastGame && (
          <div className="text-xs text-primary-foreground/60">
            Last game: {lastGame.category} • {lastGame.difficulty} • {lastGame.score} points
          </div>
        )}
      </CardContent>
    </Card>
  );
};
