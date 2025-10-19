// src/components/game/EnhancedProgressIndicators.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, Clock, Target, Zap, TrendingUp } from 'lucide-react';

interface EnhancedProgressIndicatorsProps {
  score: number;
  combo: number;
  timeRemaining: number;
  questionsAnswered: number;
  accuracy: number;
  mode: string;
  isPaused: boolean;
  streakMilestone?: number;
  personalBest?: number;
}

export const EnhancedProgressIndicators: React.FC<EnhancedProgressIndicatorsProps> = ({
  score,
  combo,
  timeRemaining,
  questionsAnswered,
  accuracy,
  mode,
  isPaused,
  streakMilestone,
  personalBest,
}) => {
  const [animatedScore, setAnimatedScore] = useState(score);
  const [animatedCombo, setAnimatedCombo] = useState(combo);
  const [showScoreBoost, setShowScoreBoost] = useState(false);
  const [showComboBoost, setShowComboBoost] = useState(false);
  const [accuracyTrend, setAccuracyTrend] = useState<'up' | 'down' | 'stable'>('stable');

  // Animate score changes
  useEffect(() => {
    if (score !== animatedScore) {
      const difference = score - animatedScore;
      setShowScoreBoost(difference > 0);
      
      // Animate score change
      const duration = 500;
      const steps = 20;
      const stepDuration = duration / steps;
      const increment = difference / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        setAnimatedScore(prev => {
          const next = prev + increment;
          if (currentStep >= steps) {
            clearInterval(timer);
            setShowScoreBoost(false);
            return score;
          }
          return next;
        });
      }, stepDuration);
      
      return () => clearInterval(timer);
    }
  }, [score, animatedScore]);

  // Animate combo changes
  useEffect(() => {
    if (combo !== animatedCombo) {
      const difference = combo - animatedCombo;
      setShowComboBoost(difference > 0);
      
      // Animate combo change
      const duration = 300;
      const steps = 15;
      const stepDuration = duration / steps;
      const increment = difference / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        setAnimatedCombo(prev => {
          const next = prev + increment;
          if (currentStep >= steps) {
            clearInterval(timer);
            setShowComboBoost(false);
            return combo;
          }
          return next;
        });
      }, stepDuration);
      
      return () => clearInterval(timer);
    }
  }, [combo, animatedCombo]);

  // Calculate accuracy trend
  useEffect(() => {
    // This would typically compare with previous accuracy
    // For now, we'll simulate based on current accuracy
    if (accuracy >= 80) {
      setAccuracyTrend('up');
    } else if (accuracy < 60) {
      setAccuracyTrend('down');
    } else {
      setAccuracyTrend('stable');
    }
  }, [accuracy]);

  const getTimeColor = () => {
    if (timeRemaining <= 5) return 'text-red-500';
    if (timeRemaining <= 10) return 'text-orange-500';
    return 'text-black';
  };

  const getTimeAnimation = () => {
    if (timeRemaining <= 5) return 'animate-pulse';
    if (timeRemaining <= 10) return 'animate-bounce';
    return '';
  };

  const getComboColor = () => {
    if (combo >= 10) return 'text-red-500';
    if (combo >= 5) return 'text-orange-500';
    return 'text-orange-400';
  };

  const getComboAnimation = () => {
    if (combo >= 10) return 'animate-pulse';
    if (combo >= 5) return 'animate-bounce';
    return '';
  };

  const getAccuracyColor = () => {
    if (accuracy >= 80) return 'text-green-500';
    if (accuracy >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getAccuracyIcon = () => {
    if (accuracyTrend === 'up') return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (accuracyTrend === 'down') return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
    return <Target className="h-3 w-3 text-gray-500" />;
  };

  return (
    <div className="space-y-4">
      {/* Top Row: Score and Combo */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 max-w-sm sm:max-w-md mx-auto">
        {/* Score Card with Animation */}
        <Card className={`border-gray-200 bg-white shadow-sm transition-all duration-300 ${
          showScoreBoost ? 'shadow-lg scale-105 border-green-300' : ''
        }`}>
          <CardContent className="p-3 sm:p-4 text-center relative overflow-hidden">
            {showScoreBoost && (
              <div className="absolute inset-0 bg-green-100 opacity-50 animate-pulse" />
            )}
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-gray-600" />
            <div className={`text-lg sm:text-xl font-bold transition-all duration-300 ${
              showScoreBoost ? 'text-green-600 scale-110' : 'text-gray-900'
            }`}>
              {Math.round(animatedScore)}
            </div>
            <p className="text-xs text-gray-500">Score</p>
            {personalBest && score >= personalBest && (
              <Badge variant="secondary" className="text-xs mt-1 bg-yellow-100 text-yellow-800">
                🏆 PB!
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Combo Card with Animation */}
        <Card className={`border-gray-200 bg-white shadow-sm transition-all duration-300 ${
          showComboBoost ? 'shadow-lg scale-105 border-orange-300' : ''
        }`}>
          <CardContent className="p-3 sm:p-4 text-center relative overflow-hidden">
            {showComboBoost && (
              <div className="absolute inset-0 bg-orange-100 opacity-50 animate-pulse" />
            )}
            <Flame className={`h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 ${getComboColor()} ${getComboAnimation()}`} />
            <div className={`text-lg sm:text-xl font-bold transition-all duration-300 ${
              showComboBoost ? 'text-orange-600 scale-110' : getComboColor()
            }`}>
              {Math.round(animatedCombo)}x
            </div>
            <p className="text-xs text-gray-500">Combo</p>
            {streakMilestone && combo >= streakMilestone && (
              <Badge variant="secondary" className="text-xs mt-1 bg-orange-100 text-orange-800">
                🔥 Hot!
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Questions and Accuracy Row */}
      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
        {/* Questions Answered */}
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardContent className="p-3 text-center">
            <Target className="h-4 w-4 mx-auto mb-1 text-blue-500" />
            <div className="text-lg font-bold text-gray-900">{questionsAnswered}</div>
            <p className="text-xs text-gray-500">Questions</p>
          </CardContent>
        </Card>

        {/* Accuracy with Trend */}
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              {getAccuracyIcon()}
              <span className={`text-lg font-bold ${getAccuracyColor()}`}>
                {accuracy}%
              </span>
            </div>
            <p className="text-xs text-gray-500">Accuracy</p>
            <div className="mt-1">
              <Progress 
                value={accuracy} 
                className="h-1"
                style={{
                  background: `linear-gradient(to right, ${
                    accuracy >= 80 ? '#10b981' :
                    accuracy >= 60 ? '#f59e0b' : '#ef4444'
                  } 0%, ${
                    accuracy >= 80 ? '#10b981' :
                    accuracy >= 60 ? '#f59e0b' : '#ef4444'
                  } ${accuracy}%, #e5e7eb ${accuracy}%, #e5e7eb 100%)`
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Timer Display - Now positioned above answers */}
      <div className="text-center">
        <div className={`text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black tracking-tight transition-all duration-300 ${getTimeColor()} ${getTimeAnimation()}`}>
          {Math.floor(timeRemaining / 60)}:
          {(timeRemaining % 60).toString().padStart(2, "0")}
        </div>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 mt-1 sm:mt-2 font-medium">
          {(mode === "quick" || mode === "classic") ? "Time Left" : "Time Elapsed"}
        </p>
        
        {/* Circular Progress Ring */}
        <div className="relative w-24 h-24 mx-auto mt-4">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - (timeRemaining / (mode === "quick" || mode === "classic" ? 45 : 60)))}`}
              className={`transition-all duration-1000 ${
                timeRemaining <= 5 ? 'text-red-500' :
                timeRemaining <= 10 ? 'text-orange-500' : 'text-blue-500'
              }`}
              style={{
                strokeLinecap: 'round',
                filter: 'drop-shadow(0 0 8px currentColor)',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Clock className={`h-6 w-6 ${getTimeColor()}`} />
          </div>
        </div>
      </div>

      {/* Pause Indicator */}
      {isPaused && (
        <div className="text-center">
          <Card className="border-yellow-300 bg-yellow-50 shadow-sm max-w-sm mx-auto">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-pulse">
                  <Zap className="h-4 w-4 text-yellow-600" />
                </div>
                <span className="text-sm font-medium text-yellow-800">Game Paused</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
