import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, TrendingUp, TrendingDown, Minus, Target, Zap } from 'lucide-react';
import { EloSystem, EloUtils, ELO_CATEGORIES } from '@/lib/eloSystem';

interface EloDisplayProps {
  variant?: 'compact' | 'detailed' | 'card';
  category?: string;
  showProgress?: boolean;
  showTrend?: boolean;
}

const EloDisplay: React.FC<EloDisplayProps> = ({ 
  variant = 'compact', 
  category = 'overall',
  showProgress = true,
  showTrend = true 
}) => {
  const eloSystem = new EloSystem();
  const eloStats = eloSystem.getEloStats();
  
  const rating = category === 'overall' 
    ? eloSystem.getOverallRating() 
    : eloSystem.getCategoryRating(category);
  
  const categoryInfo = eloSystem.getEloCategory(rating);
  const progressInfo = eloSystem.getProgressToNextCategory(rating);
  const trendInfo = eloSystem.getPerformanceTrend(7);
  
  const getTrendIcon = () => {
    switch (trendInfo.trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };
  
  const getTrendColor = () => {
    switch (trendInfo.trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <Badge 
          variant="outline" 
          className={`border-${categoryInfo.color}-500 text-${categoryInfo.color}-700 bg-${categoryInfo.color}-50`}
        >
          <Trophy className="w-3 h-3 mr-1" />
          {categoryInfo.label}
        </Badge>
        <span className="text-sm font-mono font-semibold">
          {EloUtils.formatRating(rating)}
        </span>
        {showTrend && (
          <div className={`flex items-center gap-1 text-xs ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{Math.abs(trendInfo.change)}</span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">
              {category === 'overall' ? 'Overall Rating' : `${category.charAt(0).toUpperCase() + category.slice(1)} Rating`}
            </CardTitle>
            <Badge 
              variant="outline" 
              className={`border-${categoryInfo.color}-500 text-${categoryInfo.color}-700 bg-${categoryInfo.color}-50`}
            >
              <Trophy className="w-4 h-4 mr-1" />
              {categoryInfo.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {EloUtils.formatRating(rating)}
            </div>
            <div className="text-sm text-gray-600">
              Peak: {EloUtils.formatRating(eloStats.peakRating)}
            </div>
          </div>
          
          {showProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress to {progressInfo.nextCategory}</span>
                <span className="font-semibold text-gray-800">
                  {progressInfo.pointsNeeded > 0 ? `${progressInfo.pointsNeeded} points` : 'Maxed!'}
                </span>
              </div>
              <Progress 
                value={progressInfo.progress} 
                className="h-2"
              />
            </div>
          )}
          
          {showTrend && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">7-day trend:</span>
              <div className={`flex items-center gap-1 ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="font-semibold">
                  {trendInfo.change > 0 ? '+' : ''}{trendInfo.change}
                </span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-800">{eloStats.gamesPlayed}</div>
              <div className="text-gray-600">Games</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-800">
                {EloUtils.calculateWinRate(eloStats.wins, eloStats.losses)}%
              </div>
              <div className="text-gray-600">Win Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'card') {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg bg-${categoryInfo.color}-100`}>
                <Trophy className={`w-5 h-5 text-${categoryInfo.color}-600`} />
              </div>
              <div>
                <div className="font-semibold text-gray-800">{categoryInfo.label}</div>
                <div className="text-sm text-gray-600">
                  {category === 'overall' ? 'Overall' : category.charAt(0).toUpperCase() + category.slice(1)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">
                {EloUtils.formatRating(rating)}
              </div>
              {showTrend && (
                <div className={`flex items-center gap-1 text-xs ${getTrendColor()}`}>
                  {getTrendIcon()}
                  <span>{trendInfo.change > 0 ? '+' : ''}{trendInfo.change}</span>
                </div>
              )}
            </div>
          </div>
          
          {showProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">To {progressInfo.nextCategory}</span>
                <span className="text-gray-600">{progressInfo.pointsNeeded} pts</span>
              </div>
              <Progress 
                value={progressInfo.progress} 
                className="h-1.5"
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default EloDisplay;
