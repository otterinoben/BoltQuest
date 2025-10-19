import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LevelTierSystem, LevelTierUtils, LevelIndicator } from '@/lib/levelTierSystem';

interface DynamicLevelIndicatorProps {
  level: number;
  variant?: 'compact' | 'detailed' | 'sidebar' | 'card';
  showProgress?: boolean;
  showTierName?: boolean;
  showIcon?: boolean;
  className?: string;
}

const DynamicLevelIndicator: React.FC<DynamicLevelIndicatorProps> = ({
  level,
  variant = 'compact',
  showProgress = true,
  showTierName = true,
  showIcon = true,
  className = ''
}) => {
  const tierSystem = new LevelTierSystem();
  const indicator: LevelIndicator = tierSystem.getLevelIndicator(level);
  const { tier } = indicator;

  // Get dynamic circle color based on tier
  const getCircleColor = () => {
    if (level <= 20) return 'bg-white border-gray-200'; // Novice - White
    if (level <= 40) return 'bg-blue-400 border-blue-300'; // Apprentice - Blue
    if (level <= 60) return 'bg-green-400 border-green-300'; // Skilled - Green
    if (level <= 80) return 'bg-yellow-400 border-yellow-300'; // Expert - Yellow
    if (level <= 100) return 'bg-red-400 border-red-300'; // Master - Red
    if (level <= 120) return 'bg-purple-400 border-purple-300'; // Elite - Purple
    if (level <= 140) return 'bg-pink-400 border-pink-300'; // Legend - Pink
    if (level <= 160) return 'bg-cyan-400 border-cyan-300'; // Mythic - Cyan
    if (level <= 180) return 'bg-gray-400 border-gray-300'; // Divine - Silver
    if (level <= 200) return 'bg-gradient-to-r from-yellow-300 via-purple-400 to-pink-400 border-purple-300'; // Transcendent - Rainbow
    // For levels above 200, cycle through transcendent colors
    return 'bg-gradient-to-r from-yellow-300 via-purple-400 to-pink-400 border-purple-300'; // Transcendent+ - Rainbow
  };

  // Get tier badge styling
  const getTierBadgeStyle = () => {
    return tierSystem.getTierBadgeStyle(level);
  };

  // Get glow effect
  const getGlowStyle = () => {
    return tierSystem.getTierGlowStyle(level);
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`w-3 h-3 rounded-full border-2 ${getCircleColor()} ${getGlowStyle()}`}></div>
        <span className="text-sm font-semibold">Level {level}</span>
        {showTierName && (
          <Badge variant="outline" className={`text-xs ${getTierBadgeStyle()}`}>
            {showIcon && tier.icon} {tier.name}
          </Badge>
        )}
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full border ${getCircleColor()} ${getGlowStyle()}`}></div>
        <span className="text-xs font-semibold">Level {level}</span>
        {showTierName && (
          <Badge variant="outline" className={`text-xs px-1 py-0 ${getTierBadgeStyle()}`}>
            {tier.name}
          </Badge>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full border-2 ${getCircleColor()} ${getGlowStyle()} flex items-center justify-center`}>
              <span className="text-xs">{tier.icon}</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">Level {level}</h3>
              <p className="text-sm text-gray-600">{tier.name}</p>
            </div>
          </div>
          <Badge variant="outline" className={getTierBadgeStyle()}>
            {tier.name}
          </Badge>
        </div>
        
        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress in {tier.name}</span>
              <span className="font-semibold">{Math.round(indicator.progressInTier)}%</span>
            </div>
            <Progress 
              value={indicator.progressInTier} 
              className="h-2"
              indicatorColor={`bg-gradient-to-r ${tier.gradient}`}
            />
            {!indicator.isMaxTier && indicator.nextTier && (
              <div className="text-xs text-gray-500 text-center">
                {indicator.nextTier.minLevel - level} levels until {indicator.nextTier.name}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Detailed variant (default)
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full border-2 ${getCircleColor()} ${getGlowStyle()} flex items-center justify-center`}>
            <span className="text-sm">{tier.icon}</span>
          </div>
          <div>
            <h3 className="font-bold text-xl">Level {level}</h3>
            <p className="text-sm text-gray-600">{tier.description}</p>
          </div>
        </div>
        <Badge variant="outline" className={`text-sm ${getTierBadgeStyle()}`}>
          {tier.icon} {tier.name}
        </Badge>
      </div>

      {showProgress && (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress in {tier.name}</span>
              <span className="font-semibold">{Math.round(indicator.progressInTier)}%</span>
            </div>
            <Progress 
              value={indicator.progressInTier} 
              className="h-3"
              indicatorColor={`bg-gradient-to-r ${tier.gradient}`}
            />
          </div>

          {!indicator.isMaxTier && indicator.nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress to {indicator.nextTier.name}</span>
                <span className="font-semibold">{Math.round(indicator.totalProgress)}%</span>
              </div>
              <Progress 
                value={indicator.totalProgress} 
                className="h-2"
                indicatorColor={`bg-gradient-to-r ${indicator.nextTier.gradient}`}
              />
              <div className="text-xs text-gray-500 text-center">
                {indicator.nextTier.minLevel - level} levels until {indicator.nextTier.name}
              </div>
            </div>
          )}

          {indicator.isMaxTier && (
            <div className="text-center p-3 bg-gradient-to-r from-yellow-100 via-purple-100 to-pink-100 rounded-lg">
              <p className="text-sm font-semibold text-gray-800">
                🌈 Transcendent Level - Maximum Achievement!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DynamicLevelIndicator;
