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
  Copy,
  Calendar,
  TrendingUp,
  TrendingDown,
  Award
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getUnlockedAchievements } from "@/lib/simpleAchievements";
import { quickShare } from "@/lib/socialSharing";
import { userPreferencesManager } from "@/lib/userPreferences";
import { eloRewardsSystem, EloPerformanceData } from "@/lib/eloRewardsSystem";
import { EloRankSystem } from "@/lib/eloRankSystem";
import { EloSystem } from "@/lib/eloSystem";
import { CompetitiveEloSystem, GameOutcome } from "@/lib/competitiveEloSystem";
import { EloRankCard } from "./EloRankCard";

interface GameOverScreenProps {
  gameOverPhase: 'game-over' | 'complete';
  gameState: any;
  mode: string;
  category: string;
  difficulty: string;
  accuracy: number;
  correctAnswers: number;
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
  correctAnswers,
  longestCombo,
  consecutiveStats,
  totalTime,
  onAutoReplay
}) => {
  const navigate = useNavigate();
  const [autoReplayEnabled, setAutoReplayEnabled] = React.useState(userPreferencesManager.getAutoReplayEnabled());
  const [autoReplayCountdown, setAutoReplayCountdown] = React.useState(0);
  const [autoReplayInterval, setAutoReplayInterval] = React.useState<NodeJS.Timeout | null>(null);
  const onAutoReplayRef = React.useRef(onAutoReplay);

  // Update ref when onAutoReplay changes
  React.useEffect(() => {
    onAutoReplayRef.current = onAutoReplay;
  }, [onAutoReplay]);

  // Get current ELO rating from user profile (like Dashboard and AppSidebar do)
  const eloSystem = new EloSystem();
  eloSystem.initializeForExistingUser();
  const currentEloRating = eloSystem.getOverallRating();

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
    mode,
    score: gameState.score
  };

  const eloRewards = eloRewardsSystem.calculateEloRewards(eloPerformanceData);
  
  // Calculate game outcome for competitive display
  const gameOutcome: GameOutcome = CompetitiveEloSystem.determineGameOutcome({
    accuracy,
    questionsAnswered: gameState.questionsAnswered,
    correctAnswers: correctAnswers, // Use the actual correct answers count
    difficulty,
    timeSpent: timeUsed,
    totalTime,
    currentElo: currentEloRating,
    winStreak: 0, // TODO: Get from user data
    lossStreak: 0 // TODO: Get from user data
  });
  
  // Calculate ELO breakdown for display
  const calculateEloBreakdown = () => {
    // Helper functions for volume-based system
    const calculateCorrectAnswers = (acc: number, questions: number): number => {
      return Math.round((acc / 100) * questions);
    };

    const calculateAccuracyMultiplier = (acc: number): number => {
      if (acc >= 100) return 1.5;
      if (acc >= 90) return 1.3;
      if (acc >= 85) return 1.2;
      if (acc >= 75) return 1.0;  // Baseline
      if (acc >= 65) return 0.9;
      if (acc >= 55) return 0.8;   // More forgiving
      if (acc >= 45) return 0.7;   // More forgiving
      if (acc >= 35) return 0.6;   // More forgiving
      if (acc >= 25) return 0.5;   // More forgiving
      if (acc >= 15) return 0.3;   // Still get something
      return 0.1; // Even very low accuracy gets something
    };

    const calculateVolumeBonus = (questions: number): number => {
      if (questions >= 20) return 0.10; // +10%
      if (questions >= 15) return 0.05; // +5%
      return 0;
    };

    const calculateRankMultiplier = (currentElo: number): number => {
      // Only ranks below Gold (4160 ELO) get bonuses
      // The further below Gold, the bigger the bonus
      
      if (currentElo >= 4160) {
        // Gold and above: No multiplier (1.0x baseline)
        return 1.0;
      }
      
      // Below Gold: Calculate bonus based on distance from Gold
      // Gold starts at 4160 ELO
      const distanceFromGold = 4160 - currentElo;
      
      // Every 200 ELO below Gold = +10% bonus
      // Max bonus at Iron (0 ELO) = ~208% bonus (3.08x multiplier)
      const bonusMultiplier = 1.0 + (distanceFromGold / 200) * 0.10;
      
      // Cap maximum bonus at 3.5x (don't want it too crazy)
      return Math.min(3.5, bonusMultiplier);
    };

    const calculateTimeModifier = (timeSpent: number, totalTime: number): number => {
      const timeRatio = timeSpent / totalTime;
      if (timeRatio < 0.6) return 0.05; // Fast: +5%
      else if (timeRatio > 0.8) return -0.05; // Slow: -5%
      else return 0; // Average
    };

    const getDifficultyMultiplier = (diff: string): number => {
      switch (diff.toLowerCase()) {
        case 'easy': return 0.7;  // -30%
        case 'medium': return 1.0; // ±0%
        case 'hard': return 1.3;   // +30%
        default: return 1.0;
      }
    };

    // correctAnswers is passed as prop and already calculated correctly in Game.tsx
    const POINTS_PER_CORRECT = 4.0; // Increased from 2.5 to make LP gains more rewarding
    const baseElo = correctAnswers * POINTS_PER_CORRECT;
    const accuracyMultiplier = calculateAccuracyMultiplier(accuracy);
    const volumeBonus = calculateVolumeBonus(gameState.questionsAnswered);
    const timeModifier = calculateTimeModifier(timeUsed, totalTime);
    const difficultyMultiplier = getDifficultyMultiplier(difficulty);
    
    // Get current ELO for rank multiplier
    const currentElo = eloSystem.getOverallRating();
    const rankMultiplier = calculateRankMultiplier(currentElo);

    return {
      correctAnswers,
      pointsPerCorrect: POINTS_PER_CORRECT,
      baseElo: Math.round(baseElo),
      accuracyMultiplier: accuracyMultiplier,
      volumeBonus: Math.round(volumeBonus * 100),
      timeModifier: Math.round(timeModifier * 100),
      difficultyMultiplier: difficultyMultiplier,
      rankMultiplier: rankMultiplier,
      currentElo: currentElo,
      finalElo: eloRewards.eloChange
    };
  };

  const eloBreakdown = calculateEloBreakdown();
  
  // Calculate ELO rank display with actual current ELO
  const eloRankDisplay = EloRankSystem.getEloRankDisplay(
    currentEloRating, 
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

  // Auto-replay countdown logic - only start after game over screen has fully left
  React.useEffect(() => {
    if (gameOverPhase === 'complete' && autoReplayEnabled && autoReplayCountdown > 0) {
      console.log('🔄 Auto-replay countdown starting in 1 second...');
      
      // Wait for the game over screen to fully transition out before starting countdown
      const startCountdownDelay = setTimeout(() => {
        console.log('⏰ Starting auto-replay countdown:', autoReplayCountdown, 'seconds');
        
        const interval = setInterval(() => {
          setAutoReplayCountdown(prev => {
            console.log('⏰ Countdown:', prev);
            if (prev <= 1) {
              console.log('🚀 Auto-replay triggering!');
              // Time's up, trigger auto-replay using setTimeout to avoid setState during render
              setTimeout(() => {
                if (onAutoReplayRef.current) {
                  onAutoReplayRef.current();
                }
              }, 0);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        setAutoReplayInterval(interval);
      }, 1000); // Wait 1 second after game over screen completes before starting countdown

      return () => {
        clearTimeout(startCountdownDelay);
        if (autoReplayInterval) {
          clearInterval(autoReplayInterval);
        }
      };
    }
  }, [gameOverPhase, autoReplayEnabled, autoReplayCountdown]);

  // Auto-start countdown if auto-replay is enabled when game completes
  React.useEffect(() => {
    if (gameOverPhase === 'complete' && autoReplayEnabled && autoReplayCountdown === 0) {
      const countdownSeconds = 5; // Set to 5 seconds as requested
      setAutoReplayCountdown(countdownSeconds);
      toast.info("Auto-replay enabled", {
        description: `New game will start in ${countdownSeconds} seconds. Click to cancel.`
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
      const countdownSeconds = 5; // Set to 5 seconds as requested
      setAutoReplayCountdown(countdownSeconds);
      toast.info("Auto-replay enabled", {
        description: `New game will start in ${countdownSeconds} seconds. Click to cancel.`
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
    <div className="min-h-screen bg-white flex flex-col p-1 sm:p-2">
      <div className="flex-1 flex items-center justify-center py-2 sm:py-4">
        <Card className="w-full max-w-sm border-accent/50 shadow-elegant">
          <CardContent className="p-3 space-y-2">
          
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
              className="space-y-1 sm:space-y-2"
            >
              {/* Compact ELO Rank Card */}
              {eloRankDisplay && eloRankDisplay.currentRank && (
                <EloRankCard eloRankDisplay={eloRankDisplay} />
              )}
              
              {/* Game Outcome Display */}
              {mode === 'classic' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="text-center space-y-2"
                >
                  <div className={`text-lg font-bold ${CompetitiveEloSystem.getResultDisplay(gameOutcome.result).color}`}>
                    {CompetitiveEloSystem.getResultDisplay(gameOutcome.result).emoji} {CompetitiveEloSystem.getResultDisplay(gameOutcome.result).text}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Performance: {gameOutcome.performanceScore.toFixed(1)}/100
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {CompetitiveEloSystem.getPerformanceDescription(gameOutcome.performanceScore)}
                  </div>
                </motion.div>
              )}
              
              {/* Performance Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
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
                
                {/* ELO Breakdown */}
                {mode === 'classic' && (
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="font-medium">ELO Breakdown:</div>
                    <div>{eloBreakdown.correctAnswers} correct × {eloBreakdown.pointsPerCorrect} = {eloBreakdown.baseElo} base</div>
                    <div>{accuracy}% accuracy → {eloBreakdown.accuracyMultiplier}x multiplier</div>
                    <div>{difficulty} ({eloBreakdown.difficultyMultiplier}x)</div>
                    <div className="text-blue-600">Rank bonus: {eloBreakdown.rankMultiplier}x ({eloBreakdown.currentElo} ELO)</div>
                    {eloBreakdown.volumeBonus !== 0 && (
                      <div>Volume: +{eloBreakdown.volumeBonus}%</div>
                    )}
                    {eloBreakdown.timeModifier !== 0 && (
                      <div>Time: {eloBreakdown.timeModifier > 0 ? '+' : ''}{eloBreakdown.timeModifier}%</div>
                    )}
                    <div className="font-semibold">Final: +{eloBreakdown.finalElo} ELO</div>
                  </div>
                )}
                
                {mode !== 'classic' && (
                  <div className="text-xs text-gray-500">
                    ⚠️ ELO only awarded in Classic mode
                  </div>
                )}
              </motion.div>

              {/* Context Bar - Essential Info (20% of visual space) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="mb-3"
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
              {/* Game Stats Cards - 4 Key Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="mb-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  {/* Game Score */}
                  <Card className="border-gray-200 bg-white">
                    <CardContent className="p-3 text-center">
                      <Trophy className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                      <div className="text-lg font-bold text-gray-900 mb-1">{gameState.score}</div>
                      <p className="text-xs text-gray-600 font-medium">Game Score</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {gameState.score >= 10 ? "Excellent!" : gameState.score >= 5 ? "Good job!" : "Keep trying!"}
                      </p>
                    </CardContent>
                  </Card>
                  
                  {/* Best Streak */}
                  <Card className="border-gray-200 bg-white">
                    <CardContent className="p-3 text-center">
                      <Flame className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                      <div className="text-lg font-bold text-gray-900 mb-1">{longestCombo}</div>
                      <p className="text-xs text-gray-600 font-medium">Best Streak</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {longestCombo >= 5 ? "On Fire!" : "Build momentum!"}
                      </p>
                    </CardContent>
                  </Card>
                  
                  {/* Accuracy */}
                  <Card className="border-gray-200 bg-white">
                    <CardContent className="p-3 text-center">
                      <Target className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                      <div className="text-lg font-bold text-gray-900 mb-1">{accuracy}%</div>
                      <p className="text-xs text-gray-600 font-medium">Accuracy</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {accuracy >= 90 ? "Precision!" : accuracy >= 75 ? "Solid!" : "Room to improve!"}
                      </p>
                    </CardContent>
                  </Card>
                  
                  {/* ELO Gained */}
                  <Card className="border-gray-200 bg-white">
                    <CardContent className="p-3 text-center">
                      {eloRewards.eloChange > 0 ? (
                        <TrendingUp className="h-5 w-5 mx-auto mb-2 text-green-600" />
                      ) : eloRewards.eloChange < 0 ? (
                        <TrendingDown className="h-5 w-5 mx-auto mb-2 text-red-600" />
                      ) : (
                        <Award className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                      )}
                      <div className={`text-lg font-bold mb-1 ${
                        eloRewards.eloChange > 0 ? "text-green-600" : 
                        eloRewards.eloChange < 0 ? "text-red-600" : 
                        "text-gray-900"
                      }`}>
                        {eloRewards.eloChange > 0 ? `+${eloRewards.eloChange}` : eloRewards.eloChange}
                      </div>
                      <p className="text-xs text-gray-600 font-medium">ELO Gained</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {eloRewards.eloChange > 0 ? "Rising up!" : eloRewards.eloChange < 0 ? "Learning!" : "Steady!"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>

              {/* Action Buttons - Clear Next Steps (20% of visual space) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="space-y-2 sm:space-y-3"
              >
                {/* Primary Action: Replay - Large & Prominent */}
                <Button
                  size="lg"
                  onClick={() => window.location.reload()}
                  className="w-full min-h-[40px] sm:h-12 bg-black hover:bg-gray-800 text-white text-base sm:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
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
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="flex items-center justify-center"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleToggleAutoReplay}
                    className={`min-h-[36px] sm:h-10 px-4 sm:px-6 transition-all duration-200 font-medium ${
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
                    <p className="text-xs text-gray-600 mb-2">Share your score and earn coins!</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const result = quickShare({
                          score: gameState.score,
                          category,
                          difficulty,
                          accuracy,
                          gameMode: mode as 'quick' | 'training'
                        }, 'twitter');
                        if (result.success) {
                          toast.success("Shared on Twitter!", { duration: 2000 });
                        } else {
                          toast.error("Failed to share", { duration: 2000 });
                        }
                      }}
                      className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 text-xs sm:text-sm"
                    >
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const shareText = `🎯 Just scored ${gameState.score} points on BuzzBolt! 
📊 Category: ${category} | Difficulty: ${difficulty} | Accuracy: ${accuracy}%
🚀 Test your knowledge at buzzbolt.app #BuzzBolt #QuizGame`;
                          
                          await navigator.clipboard.writeText(shareText);
                          toast.success("Copied to clipboard!", { duration: 2000 });
                        } catch (error) {
                          console.error('Failed to copy to clipboard:', error);
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

              {/* Achievements Unlocked - Moved to bottom to avoid cutting off important info */}
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
                        transition={{ delay: 1.5, duration: 0.5 }}
                        className="space-y-2 mt-4"
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
                              transition={{ delay: 1.5 + (index * 0.05), duration: 0.4 }}
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
            </motion.div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};
