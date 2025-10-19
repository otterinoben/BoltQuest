import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Target, 
  Flame, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  XCircle, 
  Twitter,
  Facebook,
  Copy
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getUnlockedAchievements } from "@/lib/simpleAchievements";
import { quickShare } from "@/lib/socialSharing";
import { userPreferencesManager } from "@/lib/userPreferences";
import { eloRewardsSystem, EloPerformanceData } from "@/lib/eloRewardsSystem";
import { EloRankSystem } from "@/lib/eloRankSystem";
import { EloRankCard } from "./EloRankCard";
import { PersonalizedInsights } from "./PersonalizedInsights";

interface GameOverScreenProps {
  gameOverPhase: 'game-over' | 'complete';
  gameState: any;
  mode: string;
  category: string;
  difficulty: string;
  accuracy: number;
  longestCombo: number;
  consecutiveStats: any;
  totalTime: number;
  onAutoReplay?: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  gameOverPhase,
  gameState,
  mode,
  category,
  difficulty,
  accuracy,
  longestCombo,
  consecutiveStats,
  totalTime,
  onAutoReplay
}) => {
  const navigate = useNavigate();
  const [autoReplayEnabled, setAutoReplayEnabled] = React.useState(() => 
    userPreferencesManager.getAutoReplayEnabled()
  );
  const [autoReplayCountdown, setAutoReplayCountdown] = React.useState(0);
  const [autoReplayInterval, setAutoReplayInterval] = React.useState<NodeJS.Timeout | null>(null);

  // Calculate safe values to prevent division by zero
  const timeUsed = totalTime - gameState.timeRemaining;
  const avgTimePerQuestion = gameState.questionsAnswered > 0 
    ? Math.round(timeUsed / gameState.questionsAnswered * 10) / 10 
    : 0;

  // Calculate ELO rewards
  const eloPerformanceData: EloPerformanceData = {
    accuracy,
    questionsAnswered: gameState.questionsAnswered,
    timeSpent: timeUsed,
    totalTime,
    longestCombo,
    category,
    difficulty,
    mode
  };

  const eloRewards = eloRewardsSystem.calculateEloRewards(eloPerformanceData);
  
  // Calculate ELO rank display with error handling
  const eloRankDisplay = EloRankSystem.getEloRankDisplay(
    eloRewards.newElo || 1000, 
    eloRewards.eloChange || 0
  );

  // Dynamic primary stat based on performance
  const getPrimaryStat = () => {
    // Prioritize ELO changes for competitive feel
    if (Math.abs(eloRewards.eloChange) >= 25) {
      return { 
        type: 'elo', 
        value: eloRewards.eloChange, 
        icon: Trophy,
        displayValue: eloRewardsSystem.getEloChangeText(eloRewards.eloChange)
      };
    }
    if (gameState.score >= 100) return { type: 'score', value: gameState.score, icon: Trophy, displayValue: gameState.score };
    if (accuracy >= 80) return { type: 'accuracy', value: accuracy, icon: Target, displayValue: `${accuracy}%` };
    if (gameState.questionsAnswered >= 10) return { type: 'questions', value: gameState.questionsAnswered, icon: CheckCircle2, displayValue: gameState.questionsAnswered };
    return { type: 'score', value: gameState.score, icon: Trophy, displayValue: gameState.score };
  };

  // Emotional messaging based on performance
  const getCelebrationMessage = () => {
    // ELO-based celebrations take priority
    if (eloRewards.eloChange >= 50) return "ELO Master!";
    if (eloRewards.eloChange >= 25) return "ELO Rising!";
    if (eloRewards.eloChange >= 10) return "ELO Gaining!";
    if (eloRewards.eloChange > 0) return "ELO Positive!";
    if (eloRewards.eloChange < 0) return "ELO Learning!";
    
    if (gameState.score >= 100) return "Outstanding performance!";
    if (accuracy >= 80) return "Excellent accuracy!";
    if (gameState.score >= 50) return "Great job!";
    if (gameState.questionsAnswered >= 5) return "Good effort!";
    return "Keep practicing!";
  };

  const getSecondaryMessage = () => {
    // ELO-based secondary messages
    if (eloRewards.eloChange >= 50) return "You're unstoppable! 🚀";
    if (eloRewards.eloChange >= 25) return "Rising through the ranks! 📈";
    if (eloRewards.eloChange >= 10) return "Getting stronger! 💪";
    if (eloRewards.eloChange > 0) return "Every point counts! ⬆️";
    if (eloRewards.eloChange < 0) return "Learning from experience! 📚";
    
    if (gameState.score >= 100) return "You're on fire! 🔥";
    if (accuracy >= 80) return "Sharpshooter! 🎯";
    if (gameState.score >= 50) return "Nice work! 💪";
    return "Every question counts! 📚";
  };

  const primaryStat = getPrimaryStat();
  const celebrationMessage = getCelebrationMessage();
  const secondaryMessage = getSecondaryMessage();

  // Auto-replay countdown logic
  React.useEffect(() => {
    if (gameOverPhase === 'complete' && autoReplayEnabled && autoReplayCountdown > 0) {
      const interval = setInterval(() => {
        setAutoReplayCountdown(prev => {
          if (prev <= 1) {
            // Time's up, trigger auto-replay
            if (onAutoReplay) {
              onAutoReplay();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setAutoReplayInterval(interval);
      return () => clearInterval(interval);
    }
  }, [gameOverPhase, autoReplayEnabled, autoReplayCountdown, onAutoReplay]);

  // Auto-start countdown if auto-replay is enabled when game completes
  React.useEffect(() => {
    if (gameOverPhase === 'complete' && autoReplayEnabled && autoReplayCountdown === 0) {
      setAutoReplayCountdown(5); // Start 5 second countdown
      toast.info("Auto-replay enabled", {
        description: "New game will start in 5 seconds. Click to cancel."
      });
    }
  }, [gameOverPhase, autoReplayEnabled]);

  // Clean up interval on unmount
  React.useEffect(() => {
    return () => {
      if (autoReplayInterval) {
        clearInterval(autoReplayInterval);
      }
    };
  }, [autoReplayInterval]);

  const handleToggleAutoReplay = () => {
    if (!autoReplayEnabled) {
      setAutoReplayEnabled(true);
      userPreferencesManager.setAutoReplayEnabled(true);
      setAutoReplayCountdown(5); // 5 second countdown
      toast.info("Auto-replay enabled", {
        description: "New game will start in 5 seconds. Click to cancel."
      });
    } else {
      setAutoReplayEnabled(false);
      userPreferencesManager.setAutoReplayEnabled(false);
      setAutoReplayCountdown(0);
      if (autoReplayInterval) {
        clearInterval(autoReplayInterval);
        setAutoReplayInterval(null);
      }
      toast.info("Auto-replay cancelled");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-2 sm:p-4 overflow-hidden">
      <div className="flex-1 flex items-center justify-center py-2">
        <Card className="w-full max-w-md sm:max-w-lg border-accent/50 shadow-elegant">
          <CardContent className="p-2 sm:p-3 space-y-2 sm:space-y-3">
          
          {/* Phase 1: GAME OVER - Compact */}
          {gameOverPhase === 'game-over' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center space-y-3"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6, ease: "backOut" }}
              >
                <XCircle className="h-12 w-12 mx-auto text-red-500" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-2xl sm:text-3xl font-black text-red-600"
                style={{ textShadow: '0 0 20px rgba(239, 68, 68, 0.3)' }}
              >
                GAME OVER
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-sm text-muted-foreground"
              >
                Time's up! Let's see how you did...
              </motion.p>
            </motion.div>
          )}

          {/* Phase 2: Game Complete with League-style ELO Rank */}
          {gameOverPhase === 'complete' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-2 sm:space-y-3"
            >
              {/* Compact ELO Rank Card */}
              {eloRankDisplay && eloRankDisplay.currentRank && (
                <EloRankCard eloRankDisplay={eloRankDisplay} />
              )}
              
              {/* Performance Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2, duration: 0.4 }}
                className="text-center space-y-1"
              >
                <div className="text-xs font-semibold text-accent">
                  {celebrationMessage}
                </div>
                <div className="text-xs text-muted-foreground">
                  {secondaryMessage}
                </div>
                <div className="text-xs text-muted-foreground">
                  {mode === "quick" ? "Time Trial" : mode === "classic" ? "Classic" : "Training"} • {category} • {difficulty}
                </div>
              </motion.div>

              {/* Context Bar - Essential Info (20% of visual space) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="mb-6"
              >
                <Card className="border-gray-200 bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-gray-700">Questions: <span className="font-bold text-gray-900">{gameState.questionsAnswered}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-gray-700">Time: <span className="font-bold text-gray-900">{Math.floor(timeUsed / 60)}m {timeUsed % 60}s</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-gray-700">Streak: <span className="font-bold text-gray-900">{consecutiveStats.currentStreak}</span></span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              {/* Personalized Learning Insights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.6, duration: 0.5 }}
                className="mb-6"
              >
                <PersonalizedInsights 
                  insights={{
                    strongestCategory: category,
                    improvementArea: category === 'general' ? 'specific topics' : 'general knowledge',
                    recommendedDifficulty: difficulty === 'easy' ? 'medium' : difficulty === 'medium' ? 'hard' : 'medium',
                    learningVelocity: Math.max(0, Math.min(100, (accuracy - 50) * 2)),
                    accuracyTrend: accuracy > 70 ? 'up' : accuracy < 40 ? 'down' : 'stable',
                    nextMilestone: `Reach ${Math.ceil(accuracy / 10) * 10}% accuracy`
                  }}
                  onRecommendationClick={(recommendation) => {
                    // Navigate to play page with recommendation
                    navigate('/play', { 
                      state: { 
                        recommendedSettings: recommendation,
                        fromGameOver: true 
                      } 
                    });
                  }}
                />
              </motion.div>
              {/* Secondary Stats - Supporting Details (20% of visual space) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="mb-6"
              >
                <div className="grid grid-cols-2 gap-3">
                  <Card className="border-gray-200 bg-white">
                    <CardContent className="p-3 text-center">
                      <Flame className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                      <div className="text-lg font-bold text-gray-900 mb-1">{longestCombo}x</div>
                      <p className="text-xs text-gray-600 font-medium">Best Combo</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {longestCombo >= 5 ? "On Fire!" : "Build momentum!"}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-gray-200 bg-white">
                    <CardContent className="p-3 text-center">
                      <Clock className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                      <div className="text-lg font-bold text-gray-900 mb-1">{avgTimePerQuestion}s</div>
                      <p className="text-xs text-gray-600 font-medium">Avg/Question</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {avgTimePerQuestion <= 3 ? "Lightning Fast!" : "Speed up!"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
              
              {/* Achievements Unlocked */}

              {/* Achievements */}
              {(() => {
                try {
                  const unlockedAchievements = getUnlockedAchievements();
                  const recentAchievements = unlockedAchievements.filter(a => 
                    Date.now() - a.unlockedAt < 60000 // Show achievements unlocked in last minute
                  );
                  
                  if (recentAchievements.length > 0) {
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.7, duration: 0.5 }}
                        className="space-y-3"
                      >
                        <h3 className="text-lg font-semibold text-foreground text-center">
                          🏆 Achievements Unlocked!
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {recentAchievements.map((achievement, index) => (
                            <motion.div
                              key={achievement.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 1.8 + (index * 0.1), duration: 0.4 }}
                              className="flex items-center gap-3 p-3 bg-gradient-primary rounded-lg border border-accent/50"
                            >
                              <div className="text-2xl">{achievement.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-primary-foreground text-sm">
                                  {achievement.name}
                                </div>
                                <div className="text-xs text-primary-foreground/80">
                                  {achievement.description}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  }
                } catch (error) {
                  console.error('Error displaying achievements:', error);
                }
                return null;
              })()}

              {/* Action Buttons - Clear Next Steps (20% of visual space) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="space-y-3 sm:space-y-4"
              >
                {/* Primary Action: Replay - Large & Prominent */}
                <Button
                  size="lg"
                  onClick={() => window.location.reload()}
                  className="w-full min-h-[48px] sm:h-16 bg-black hover:bg-gray-800 text-white text-lg sm:text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-700 rounded-full flex items-center justify-center">
                      <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <span>Replay</span>
                  </div>
                </Button>

                {/* Auto-Replay Toggle */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.9, duration: 0.5 }}
                  className="flex items-center justify-center"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleToggleAutoReplay}
                    className={`min-h-[44px] sm:h-12 px-6 transition-all duration-200 font-medium ${
                      autoReplayEnabled 
                        ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100 hover:border-green-400' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${
                        autoReplayEnabled ? 'bg-green-200' : 'bg-gray-100'
                      }`}>
                        {autoReplayEnabled ? (
                          <span className="text-xs font-bold text-green-600">
                            {autoReplayCountdown > 0 ? autoReplayCountdown : '✓'}
                          </span>
                        ) : (
                          <span className="text-xs font-bold">🔄</span>
                        )}
                      </div>
                      <span>
                        {autoReplayEnabled 
                          ? (autoReplayCountdown > 0 ? `Auto-replay in ${autoReplayCountdown}s` : 'Auto-replay enabled')
                          : 'Enable Auto-Replay'
                        }
                      </span>
                    </div>
                  </Button>
                </motion.div>

                {/* Secondary Actions Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/play")}
                    className="min-h-[44px] sm:h-12 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">🔄</span>
                      </div>
                      <span>New Game</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/")}
                    className="min-h-[44px] sm:h-12 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">🏠</span>
                      </div>
                      <span>Home</span>
                    </div>
                  </Button>
                </div>

                {/* Social Sharing Row */}
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">Share your score and earn coins!</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const result = quickShare({
                          score: gameState.score,
                          category,
                          difficulty,
                          accuracy,
                          mode: mode as 'quick' | 'training'
                        });
                        if (result.success) {
                          toast.success("Shared on Twitter!", { duration: 2000 });
                        } else {
                          toast.error("Failed to share", { duration: 2000 });
                        }
                      }}
                      className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                    >
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const result = quickShare({
                          score: gameState.score,
                          category,
                          difficulty,
                          accuracy,
                          mode: mode as 'quick' | 'training'
                        });
                        if (result.success) {
                          toast.success("Shared on Facebook!", { duration: 2000 });
                        } else {
                          toast.error("Failed to share", { duration: 2000 });
                        }
                      }}
                      className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                    >
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const result = quickShare({
                          score: gameState.score,
                          category,
                          difficulty,
                          accuracy,
                          mode: mode as 'quick' | 'training'
                        });
                        if (result.success) {
                          toast.success("Copied to clipboard!", { duration: 2000 });
                        } else {
                          toast.error("Failed to copy", { duration: 2000 });
                        }
                      }}
                      className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};
