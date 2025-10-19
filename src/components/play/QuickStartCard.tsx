// src/components/play/QuickStartCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, Target, TrendingUp, Lightbulb } from 'lucide-react';
import { SmartRecommendation } from '@/lib/userPreferences';

interface QuickStartCardProps {
  recommendation: SmartRecommendation;
  onQuickStart: (settings: any) => void;
  onCustomize: () => void;
}

export const QuickStartCard: React.FC<QuickStartCardProps> = ({ 
  recommendation, 
  onQuickStart, 
  onCustomize 
}) => {
  const getIcon = () => {
    switch (recommendation.type) {
      case 'time': return <Clock className="h-5 w-5" />;
      case 'performance': return <TrendingUp className="h-5 w-5" />;
      case 'goal': return <Target className="h-5 w-5" />;
      case 'streak': return <Zap className="h-5 w-5" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getColor = () => {
    switch (recommendation.type) {
      case 'time': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'performance': return 'text-green-600 bg-green-50 border-green-200';
      case 'goal': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'streak': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleQuickStart = () => {
    onQuickStart({
      categories: [recommendation.category],
      difficulty: recommendation.difficulty,
      mode: recommendation.mode,
      timer: recommendation.timer,
    });
  };

  return (
    <Card className={`border-2 ${getColor()} shadow-elegant hover:shadow-glow transition-all duration-300`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          {getIcon()}
          Smart Start
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-700">
          {recommendation.reason}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {recommendation.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {recommendation.difficulty}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {recommendation.mode}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {recommendation.timer}s
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleQuickStart}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <Zap className="mr-2 h-4 w-4" />
            Start Playing
          </Button>
          <Button 
            onClick={onCustomize}
            variant="outline"
            size="sm"
          >
            Customize
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Confidence: {Math.round(recommendation.confidence * 100)}%
        </div>
      </CardContent>
    </Card>
  );
};
