import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Crown, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AchievementHighlightProps {
  newAchievements?: Array<{
    id: string;
    name: string;
    description: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    icon: string;
  }>;
  progressAchievements?: Array<{
    id: string;
    name: string;
    progress: number;
    maxProgress: number;
    description: string;
  }>;
  className?: string;
}

export const AchievementHighlight: React.FC<AchievementHighlightProps> = ({
  newAchievements = [],
  progressAchievements = [],
  className = ""
}) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      case 'epic': return 'from-purple-500 to-purple-700';
      case 'rare': return 'from-blue-500 to-blue-700';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return <Crown className="h-4 w-4" />;
      case 'epic': return <Star className="h-4 w-4" />;
      case 'rare': return <Zap className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.4, duration: 0.5 }}
      className={`space-y-3 ${className}`}
    >
      {/* New Achievements */}
      {newAchievements.length > 0 && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <h3 className="text-sm font-semibold text-yellow-900">
              Achievement Unlocked! 🎉
            </h3>
          </div>
          
          {newAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.6 + (index * 0.2), duration: 0.4 }}
              className="flex items-center gap-3 p-2 bg-white/50 rounded border border-yellow-200"
            >
              <div className={`p-2 rounded-full bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white`}>
                {getRarityIcon(achievement.rarity)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">
                  {achievement.name}
                </div>
                <div className="text-xs text-gray-600">
                  {achievement.description}
                </div>
              </div>
              <Badge 
                variant="secondary" 
                className={`text-xs ${
                  achievement.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                  achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                  achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                {achievement.rarity.toUpperCase()}
              </Badge>
            </motion.div>
          ))}
        </div>
      )}

      {/* Progress Achievements */}
      {progressAchievements.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-blue-900">
              Almost There!
            </h3>
          </div>
          
          {progressAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2.8 + (index * 0.1), duration: 0.4 }}
              className="space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-700">{achievement.name}</span>
                <span className="text-gray-500">
                  {achievement.progress}/{achievement.maxProgress}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                  transition={{ delay: 3.0 + (index * 0.1), duration: 0.6 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                />
              </div>
              <div className="text-xs text-gray-600">
                {achievement.description}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* No achievements state */}
      {newAchievements.length === 0 && progressAchievements.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6, duration: 0.4 }}
          className="text-center py-4"
        >
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-sm text-gray-600">
            Keep playing to unlock achievements!
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
