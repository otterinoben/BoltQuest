import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Coins, Trophy, Zap, Target, Award, Flame } from 'lucide-react';
import { getUserProgress, getLevelProgress } from '@/lib/xpLevelSystem';
import { EloSystem, EloUtils } from '@/lib/eloSystem';
import { getAchievementStats } from '@/lib/simpleAchievements';
import { getDailyTaskStats } from '@/lib/dailyTaskManager';
import DynamicLevelIndicator from './DynamicLevelIndicator';
import XpProgressBar from './XpProgressBar';

interface LevelDisplayProps {
  variant?: 'compact' | 'detailed' | 'card' | 'mobile';
  showProgress?: boolean;
  showRewards?: boolean;
  className?: string;
}

export const LevelDisplay: React.FC<LevelDisplayProps> = ({
  variant = 'detailed',
  showProgress = true,
  showRewards = false,
  className = ''
}) => {
  const progress = getUserProgress();
  const levelProgress = getLevelProgress();
  const eloSystem = new EloSystem();
  const overallRating = eloSystem.getOverallRating();
  const eloCategory = eloSystem.getEloCategory(overallRating);

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <DynamicLevelIndicator 
          level={progress.level} 
          variant="compact" 
          showTierName={true}
          showProgress={false}
        />
        <div className="flex items-center gap-1">
          <Target className="h-4 w-4 text-blue-500" />
          <Badge variant="outline" className={`border-${eloCategory.color}-500 text-${eloCategory.color}-700 bg-${eloCategory.color}-50 text-xs`}>
            {eloCategory.label} {overallRating}
          </Badge>
        </div>
        {showProgress && (
          <XpProgressBar 
            variant="compact" 
            showLevel={false}
            showRewards={false}
            animate={true}
          />
        )}
      </div>
    );
  }

  if (variant === 'card') {
    const achievementStats = getAchievementStats();
    const dailyStats = getDailyTaskStats();
    
    return (
      <Card className={`border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 ${className}`}>
        <CardContent className="p-4">
          <DynamicLevelIndicator 
            level={progress.level} 
            variant="card" 
            showTierName={true}
            showProgress={false}
            className="mb-4"
          />
          
          {showProgress && (
            <XpProgressBar 
              variant="card" 
              showLevel={false}
              showRewards={false}
              animate={true}
              className="mb-4"
            />
          )}
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-gray-900" />
              <span>{progress.coins} coins</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-900" />
              <span>{eloCategory.label} {overallRating}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-gray-900" />
              <span>{achievementStats.unlocked} achievements</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-gray-900" />
              <span>{dailyStats.currentStreak} streak</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-gray-900" />
              <span>{progress.points} points</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-gray-900" />
              <span>{progress.totalXp} total XP</span>
            </div>
          </div>

          {showRewards && (
            <div className="mt-3 p-2 bg-green-50 rounded-lg">
              <p className="text-xs text-green-700 font-medium">
                Next Level Reward: {progress.level * 50} coins
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Mobile variant
  if (variant === 'mobile') {
    const achievementStats = getAchievementStats();
    const dailyStats = getDailyTaskStats();
    
    return (
      <Card className={`border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 ${className}`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="font-bold text-base">Level {progress.level}</h3>
                <p className="text-xs text-gray-600">
                  {levelProgress.currentXp} / {levelProgress.xpToNext + levelProgress.currentXp} XP
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
              {Math.floor(levelProgress.progress)}%
            </Badge>
          </div>
          
          {showProgress && (
            <XpProgressBar 
              variant="mobile" 
              showLevel={false}
              showRewards={false}
              animate={true}
              className="mb-2"
            />
          )}

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Coins className="h-3 w-3 text-gray-900" />
              <span>{progress.coins}</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-gray-900" />
              <span>{eloCategory.label} {overallRating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3 text-gray-900" />
              <span>{achievementStats.unlocked}</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-gray-900" />
              <span>{dailyStats.currentStreak}</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-3 w-3 text-gray-900" />
              <span>{progress.points}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-gray-900" />
              <span>{progress.totalXp}</span>
            </div>
          </div>

          {showRewards && (
            <div className="mt-2 p-2 bg-green-50 rounded-lg">
              <p className="text-xs text-green-700 font-medium">
                Next: {progress.level * 50} coins
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Detailed variant (default)
  const achievementStats = getAchievementStats();
  const dailyStats = getDailyTaskStats();
  
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          <h3 className="font-semibold text-lg">Level {progress.level}</h3>
        </div>
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          {Math.floor(levelProgress.progress)}% complete
        </Badge>
      </div>

      {showProgress && (
        <XpProgressBar 
          variant="detailed" 
          showLevel={false}
          showRewards={false}
          animate={true}
        />
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-gray-900" />
          <span className="font-medium">{progress.coins}</span>
          <span className="text-gray-500">coins</span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-gray-900" />
          <span className="font-medium">{eloCategory.label} {overallRating}</span>
          <span className="text-gray-500">rating</span>
        </div>
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-gray-900" />
          <span className="font-medium">{achievementStats.unlocked}</span>
          <span className="text-gray-500">achievements</span>
        </div>
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-gray-900" />
          <span className="font-medium">{dailyStats.currentStreak}</span>
          <span className="text-gray-500">streak</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-gray-900" />
          <span className="font-medium">{progress.points}</span>
          <span className="text-gray-500">points</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-gray-900" />
          <span className="font-medium">{progress.totalXp}</span>
          <span className="text-gray-500">total XP</span>
        </div>
      </div>
    </div>
  );
};

export default LevelDisplay;
