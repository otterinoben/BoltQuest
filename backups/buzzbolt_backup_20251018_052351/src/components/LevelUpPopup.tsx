import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Zap, 
  Shield, 
  Crown,
  X,
  Coins,
  Gift
} from 'lucide-react';

interface LevelUpPopupProps {
  isOpen: boolean;
  onClose: () => void;
  levelData: {
    level: number;
    name: string;
    icon: string;
    color: string;
    rewards: {
      points: number;
      streakProtection?: boolean;
      bonusMultiplier?: number;
      specialTitle?: string;
    };
  };
  nextLevelProgress?: {
    currentXp: number;
    nextLevelXp: number;
    progressToNextLevel: number;
  };
}

export const LevelUpPopup: React.FC<LevelUpPopupProps> = ({
  isOpen,
  onClose,
  levelData,
  nextLevelProgress
}) => {
  if (!isOpen) return null;

  const getRewardIcon = (reward: string) => {
    if (reward.includes('points')) return <Coins className="h-4 w-4 text-yellow-500" />;
    if (reward.includes('Streak protection')) return <Shield className="h-4 w-4 text-blue-500" />;
    if (reward.includes('bonus')) return <Zap className="h-4 w-4 text-purple-500" />;
    if (reward.includes('title')) return <Crown className="h-4 w-4 text-yellow-600" />;
    return <Gift className="h-4 w-4 text-green-500" />;
  };

  const rewards = [];
  if (levelData.rewards.points > 0) {
    rewards.push(`${levelData.rewards.points} bonus points`);
  }
  if (levelData.rewards.streakProtection) {
    rewards.push("Streak protection enabled");
  }
  if (levelData.rewards.bonusMultiplier && levelData.rewards.bonusMultiplier > 1) {
    rewards.push(`${Math.round((levelData.rewards.bonusMultiplier - 1) * 100)}% XP bonus`);
  }
  if (levelData.rewards.specialTitle) {
    rewards.push(`Special title: ${levelData.rewards.specialTitle}`);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="text-6xl mb-2">{levelData.icon}</div>
              <CardTitle className="text-2xl font-bold text-yellow-700 mb-2">
                Level Up!
              </CardTitle>
              <div className="text-xl font-semibold text-yellow-600">
                Level {levelData.level}: {levelData.name}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Rewards Section */}
          <div className="bg-white/50 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-700 mb-3 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Rewards Unlocked
            </h3>
            <div className="space-y-2">
              {rewards.map((reward, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {getRewardIcon(reward)}
                  <span className="text-yellow-600">{reward}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next Level Progress */}
          {nextLevelProgress && (
            <div className="bg-white/50 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                <Star className="h-5 w-5" />
                Next Level Progress
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-yellow-600">
                  <span>Progress to Level {levelData.level + 1}</span>
                  <span>{nextLevelProgress.currentXp}/{nextLevelProgress.nextLevelXp} XP</span>
                </div>
                <Progress 
                  value={nextLevelProgress.progressToNextLevel} 
                  className="h-2"
                />
                <div className="text-xs text-yellow-500 text-center">
                  {Math.round(nextLevelProgress.progressToNextLevel)}% complete
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3"
          >
            <Trophy className="h-5 w-5 mr-2" />
            Continue Your Journey
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};


