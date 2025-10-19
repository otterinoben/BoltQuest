import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Category, Difficulty, GameState } from "@/types/game";
import { getUserProfile } from "@/lib/userStorage";
import { mockQuestions } from "@/data/mockData";
import { Clock, Flame, Trophy, CheckCircle2, XCircle, SkipForward, Pause, Play, X, Target, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { checkAchievements, getUnlockedAchievements, getConsecutiveGameStats } from "@/lib/simpleAchievements";
import { updateGameStatistics } from "@/lib/userStorage";
import { addGameToHistory } from "@/lib/gameHistoryStorage";
import { addHighScore } from "@/lib/highScoreStorage";
import { updateTaskProgress, getCurrentDailyTasks } from "@/lib/dailyTaskManager";
import { LevelUpPopup } from '@/components/LevelUpPopup';
import { addXp, getUserLevelProgress, getLevelData, calculateXpReward } from '@/lib/dailyTaskLeveling';
import { useAudio } from '@/contexts/AudioContext';
import { useAutoSave } from '@/lib/autoSave';
import {
  createQuestionPool,
  RandomizedQuestion,
  DEFAULT_RANDOMIZATION_CONFIG,
  getRandomizationAnalytics,
  validateRandomization
} from '@/lib/questionRandomizer';

const Game = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { playSound } = useAudio();
  const { performAutoSave } = useAutoSave();
  const category = (searchParams.get("category") as Category) || "tech";
  const difficulty = (searchParams.get("difficulty") as Difficulty) || "medium";
  const mode = searchParams.get("mode") || "quick";
  const timerPreset = parseInt(searchParams.get("timer") || "45");
  const taskId = searchParams.get("taskId");
  const taskTitle = searchParams.get("taskTitle");

  // Load user preferences for hints and auto-pause
  const [userPreferences, setUserPreferences] = useState({
    hintsEnabled: false,
    autoPause: false,
    timerDuration: 45
  });

  // Hint system state
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);

  // Penalty animation state
  const [penaltyAnimations, setPenaltyAnimations] = useState<Array<{id: string, type: 'time' | 'score', value: number, timestamp: number}>>([]);

  useEffect(() => {
    try {
      const userProfile = getUserProfile();
      if (userProfile?.preferences) {
        setUserPreferences({
          hintsEnabled: userProfile.preferences.hintsEnabled || false,
          autoPause: userProfile.preferences.autoPause || false,
          timerDuration: userProfile.preferences.timerDuration || 45
        });
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  }, []);

  // Calculate total time based on mode
  const totalTime = timerPreset;

  // Game state
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    score: 0,
    combo: 0,
    timeRemaining: totalTime,
    answers: [],
    startTime: new Date(),
    questionsAnswered: 0,
    isPaused: false,
    pauseStartTime: undefined,
    totalPauseTime: 0,
    questionsSkipped: 0,
    skipPenalty: 0,
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showGameOver || gameState.isPaused) return;
      
      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          handleSkip();
          break;
        case ' ':
          e.preventDefault();
          handlePause();
          break;
        case 'escape':
          e.preventDefault();
          handleQuit();
          break;
        case 'h':
          e.preventDefault();
          handleHint();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showGameOver, gameState.isPaused]);

  // Auto-pause when switching tabs
  useEffect(() => {
    if (!userPreferences.autoPause) return;

    const handleVisibilityChange = () => {
      if (document.hidden && !gameState.isPaused && !showGameOver) {
        setGameState(prev => ({ ...prev, isPaused: true }));
        toast.info("Game paused - switched to another tab");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [userPreferences.autoPause, gameState.isPaused, showGameOver]);

  const questions = mockQuestions[category][difficulty];
  const totalQuestions = questions.length;

  // Handle hint usage
  const handleHint = () => {
    if (!hintUsed && userPreferences.hintsEnabled) {
      setShowHint(true);
      setHintUsed(true);
      playSound('hint');
      toast.info("Hint revealed! Use it wisely.");
    }
  };

  // Generate hint for current question
  const generateHint = (question: any) => {
    const hints = [
      `Think about what "${question.buzzword}" might mean in ${category} context`,
      `Consider the length and complexity of each option`,
      `Look for technical terms or industry-specific language`,
      `Eliminate obviously incorrect options first`,
      `The answer relates to ${question.buzzword} in ${category}`
    ];
    return hints[Math.floor(Math.random() * hints.length)];
  };

  // Show penalty animation - single number
  const showPenaltyAnimation = (type: 'time' | 'score', value: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    setPenaltyAnimations(prev => [...prev, { id, type, value, timestamp: Date.now() }]);
    
    // Remove animation after 2.5 seconds
    setTimeout(() => {
      setPenaltyAnimations(prev => prev.filter(anim => anim.id !== id));
    }, 2500);
  };

  // Reset hint state for new question
  const resetHintState = () => {
    setShowHint(false);
    setHintUsed(false);
  };

  // Initialize question pool with randomization
  const [questionPool] = useState(() => createQuestionPool(questions, DEFAULT_RANDOMIZATION_CONFIG));
  const [randomizedQuestions, setRandomizedQuestions] = useState<RandomizedQuestion[]>([]);
  const [currentRandomizedQuestion, setCurrentRandomizedQuestion] = useState<RandomizedQuestion | null>(null);

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answerStartTime, setAnswerStartTime] = useState<number>(Date.now());
  const [longestCombo, setLongestCombo] = useState(0);
  const [consecutiveStats, setConsecutiveStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    gamesWithThreePlus: 0,
    totalGames: 0
  });
  const [skipCount, setSkipCount] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const [luckyStreak, setLuckyStreak] = useState(0);
  
  // Level-up popup state
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<any>(null);

  useEffect(() => {
    setAnswerStartTime(Date.now());
  }, [gameState.currentQuestion]);

  // Initialize randomized questions on component mount
  useEffect(() => {
    const initializeQuestions = () => {
      const randomized = [];
      for (let i = 0; i < Math.min(totalQuestions, 20); i++) {
        randomized.push(questionPool.getNextQuestion());
      }
      setRandomizedQuestions(randomized);
      setCurrentRandomizedQuestion(randomized[0] || null);
    };

    initializeQuestions();
  }, [questionPool, totalQuestions]);

  // Update current question when game state changes
  useEffect(() => {
    if (randomizedQuestions.length > 0) {
      const questionIndex = gameState.currentQuestion % randomizedQuestions.length;
      setCurrentRandomizedQuestion(randomizedQuestions[questionIndex]);
    }
  }, [gameState.currentQuestion, randomizedQuestions]);

  // Load consecutive stats on component mount
  useEffect(() => {
    try {
      const userProfile = getUserProfile();
      const stats = getConsecutiveGameStats(userProfile.id);
      setConsecutiveStats(stats);
    } catch (error) {
      console.error('Error loading consecutive stats:', error);
    }
  }, []);

  // Auto-save on game state changes
  useEffect(() => {
    if (gameState === 'playing' || gameState === 'paused') {
      performAutoSave();
    }
  }, [score, combo, questionsAnswered, gameState, performAutoSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields or when game is over
      if (showGameOver || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Skip question with 'S' key
      if (event.key.toLowerCase() === 's' && !showFeedback && !gameState.isPaused) {
        event.preventDefault();
        handleSkip();
      }

      // Pause/Resume with Space key
      if (event.key === ' ' && !showFeedback) {
        event.preventDefault();
        handlePause();
      }

      // Quit game with Escape key
      if (event.key === 'Escape' && !showGameOver) {
        event.preventDefault();
        handleQuit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showFeedback, gameState.isPaused, showGameOver]);

  useEffect(() => {
    if ((mode === "quick" || mode === "classic") && !showGameOver && !gameState.isPaused) {
      const timer = setInterval(() => {
        setGameState((prev) => {
          if (prev.timeRemaining <= 1) {
            endGame();
            return prev;
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [mode, showGameOver, gameState.isPaused]);

  const currentQuestion = currentRandomizedQuestion || questions[gameState.currentQuestion % questions.length];

  const handleAnswer = (answerIndex: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Simple scoring: 1 point per correct answer
    const scoreGain = correct ? 1 : 0;

    const newCombo = correct ? gameState.combo + 1 : 0;
    
    setGameState((prev) => {
      const timeAdjustment = (mode === "quick" || mode === "classic") ? (correct ? 3 : -5) : 0;
        const newTime = Math.max(0, prev.timeRemaining + timeAdjustment);
        
        // Show penalty animations
        if (timeAdjustment > 0) {
          showPenaltyAnimation('time', timeAdjustment);
        } else if (timeAdjustment < 0) {
          showPenaltyAnimation('time', timeAdjustment);
        }
        
        return {
          ...prev,
          score: prev.score + scoreGain,
          combo: newCombo,
        timeRemaining: newTime,
        answers: [...prev.answers, answerIndex],
          questionsAnswered: prev.questionsAnswered + 1,
        };
      });
      
    if (newCombo > longestCombo) {
      setLongestCombo(newCombo);
    }

    if (correct) {
      playSound('correct');
      toast.success(`Correct! +${scoreGain} point`, {
        description: newCombo > 0 ? `${newCombo}x Combo! ${(mode === "quick" || mode === "classic") ? "+3s" : ""}` : (mode === "quick" || mode === "classic") ? "+3 seconds" : undefined,
        style: {
          background: '#10b981', // Green background
          color: 'white',
          border: '1px solid #059669'
        }
      });
    } else {
      playSound('incorrect');
      toast.error("Incorrect", {
        description: (mode === "quick" || mode === "classic") ? "Combo reset • -5 seconds" : "Combo reset",
        style: {
          background: '#ef4444', // Red background
          color: 'white',
          border: '1px solid #dc2626'
        }
      });
    }

    setTimeout(() => {
      setGameState((prev) => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }));
      setSelectedAnswer(null);
      setShowFeedback(false);
      resetHintState(); // Reset hint state for new question
      
      // Add next randomized question if needed
      if (randomizedQuestions.length <= gameState.currentQuestion + 1 && gameState.currentQuestion < totalQuestions - 1) {
        const nextQuestion = questionPool.getNextQuestion();
        setRandomizedQuestions(prev => [...prev, nextQuestion]);
      }
    }, 1500);
  };

  const handleSkip = () => {
    if (showFeedback || gameState.isPaused) return;

    const skipPenalty = 1; // 1 point penalty for skipping
    const timePenalty = (mode === "quick" || mode === "classic") ? 5 : 0; // 5 seconds penalty in quick/classic mode
    
    setSkipCount(prev => prev + 1);
    playSound('skip');
    
    // Show penalty animations
    if (timePenalty > 0) {
      showPenaltyAnimation('time', -timePenalty);
    }
    if (skipPenalty > 0) {
      showPenaltyAnimation('score', -skipPenalty);
    }
    
    setGameState((prev) => ({
      ...prev,
      questionsSkipped: prev.questionsSkipped + 1,
      skipPenalty: prev.skipPenalty + skipPenalty,
      score: Math.max(0, prev.score - skipPenalty),
      timeRemaining: Math.max(0, prev.timeRemaining - timePenalty),
      currentQuestion: prev.currentQuestion + 1,
    }));

    toast.warning("Question Skipped", {
      description: `-${skipPenalty} point${timePenalty > 0 ? ` • -${timePenalty}s` : ''} • Counts as incorrect`,
      style: {
        background: '#f59e0b', // Amber background
        color: 'white',
        border: '1px solid #d97706'
      }
    });

    if (gameState.currentQuestion + 1 >= totalQuestions) {
      endGame();
    }
  };

  const handlePause = () => {
    if (showFeedback) return;

    setGameState((prev) => {
      if (prev.isPaused) {
        // Resume
        const pauseDuration = prev.pauseStartTime ? Date.now() - prev.pauseStartTime.getTime() : 0;
        return {
          ...prev,
          isPaused: false,
          pauseStartTime: undefined,
          totalPauseTime: prev.totalPauseTime + pauseDuration,
        };
      } else {
        // Pause
        setPauseCount(prev => prev + 1);
        return {
          ...prev,
          isPaused: true,
          pauseStartTime: new Date(),
        };
      }
    });
  };

  const handleQuit = () => {
    if (showGameOver) return;
    
    // Show confirmation dialog
    const confirmed = window.confirm("Are you sure you want to quit this game? Your progress will be lost.");
    
    if (confirmed) {
      toast.info("Game quit", {
        description: "Returning to game selection"
      });
      navigate("/play");
    }
  };

  const endGame = () => {
    // Calculate final statistics
    const correctAnswers = gameState.answers.filter((answer, index) => {
      const question = questions[index % questions.length];
      return answer === question.correctAnswer;
    }).length;
    
    const totalQuestionsAttempted = gameState.questionsAnswered + gameState.questionsSkipped;
    const accuracy = totalQuestionsAttempted > 0 
      ? Math.round((correctAnswers / totalQuestionsAttempted) * 100) 
      : 0;
    
    const totalTimeSpent = mode === "quick" 
      ? (totalTime - gameState.timeRemaining) * 1000 
      : Date.now() - gameState.startTime.getTime();
    
    const finalPauseTime = gameState.isPaused && gameState.pauseStartTime
      ? gameState.totalPauseTime + (Date.now() - gameState.pauseStartTime.getTime())
      : gameState.totalPauseTime;

    // Save game statistics
    try {
      updateGameStatistics({
        category,
        difficulty,
        score: gameState.score,
        questionsAnswered: gameState.questionsAnswered,
        correctAnswers,
        timeSpent: totalTimeSpent,
        bestCombo: longestCombo,
        questionsSkipped: gameState.questionsSkipped,
        totalPauseTime: finalPauseTime,
      });
    } catch (error) {
      console.error('Error updating game statistics:', error);
    }

    // Save game history
    try {
      const userProfile = getUserProfile();
      addGameToHistory({
        userId: userProfile.id,
        category,
        difficulty,
        mode: mode as 'quick' | 'training',
        score: gameState.score,
        questionsAnswered: gameState.questionsAnswered,
        correctAnswers,
        accuracy,
        timeSpent: totalTimeSpent,
        combo: longestCombo,
        questionsSkipped: gameState.questionsSkipped,
        totalPauseTime: finalPauseTime,
        date: new Date(),
      });
    } catch (error) {
      console.error('Error saving game history:', error);
    }

    // Save high score if it's a personal best
    try {
      const userProfile = getUserProfile();
      addHighScore({
        userId: userProfile.id,
        category,
        difficulty,
        mode: mode as 'quick' | 'training',
        score: gameState.score,
        questionsAnswered: gameState.questionsAnswered,
        correctAnswers,
        accuracy,
        timeSpent: totalTimeSpent,
        combo: longestCombo,
        date: new Date(),
      });
    } catch (error) {
      console.error('Error saving high score:', error);
    }

    // Check for achievements
    try {
      const userProfile = getUserProfile();
      const gameData = {
        category,
        difficulty,
        mode,
        accuracy,
        timeRemaining: gameState.timeRemaining,
        duration: Math.floor((Date.now() - gameState.startTime.getTime()) / 1000),
        skipCount: skipCount,
        pauseCount: pauseCount,
        luckyStreak: luckyStreak,
        maxCombo: longestCombo,
        questionsAnswered: gameState.questionsAnswered
      };
      
      const newlyUnlocked = checkAchievements(gameState.score, userProfile.id, gameData);
      newlyUnlocked.forEach(achievement => {
        toast.success(`Achievement Unlocked!`, {
          description: `${achievement.icon} ${achievement.name}`,
          duration: 4000,
        });
      });
    } catch (error) {
      console.error('Error checking achievements:', error);
    }

    // Update daily task progress
    try {
      const dailyTasks = getCurrentDailyTasks();
      if (dailyTasks) {
        // Update score-based tasks
        dailyTasks.tasks.forEach(task => {
          if (task.requirements.type === 'score' && !task.completed) {
            updateTaskProgress(task.id, gameState.score);
          } else if (task.requirements.type === 'games' && !task.completed) {
            updateTaskProgress(task.id, 1);
          } else if (task.requirements.type === 'accuracy' && !task.completed) {
            updateTaskProgress(task.id, accuracy);
          } else if (task.requirements.type === 'category' && task.requirements.category === category && !task.completed) {
            updateTaskProgress(task.id, gameState.score);
          } else if (task.requirements.type === 'mode' && task.requirements.mode === mode && !task.completed) {
            updateTaskProgress(task.id, 1);
          }
        });
        
        // Update completion task if all other tasks are done
        if (dailyTasks.completionTask && !dailyTasks.completionTask.completed) {
          const allTasksCompleted = dailyTasks.tasks.every(t => t.completed);
          if (allTasksCompleted) {
            updateTaskProgress(dailyTasks.completionTask.id, 1);
          }
        }
        
        // Check for level-up after completing tasks
        const completedTasks = dailyTasks.tasks.filter(t => t.completed).length;
        if (completedTasks > 0) {
          const xpReward = calculateXpReward(completedTasks, 1); // Basic multiplier for now
          const xpResult = addXp(xpReward);
          
          if (xpResult.leveledUp && xpResult.newLevel) {
            const levelData = getLevelData(xpResult.newLevel);
            if (levelData) {
              setLevelUpData({
                level: levelData.level,
                name: levelData.name,
                icon: levelData.icon,
                color: levelData.color,
                rewards: levelData.rewards
              });
        setShowLevelUp(true);
      }
    }
        }
      }
    } catch (error) {
      console.error('Error updating daily tasks:', error);
    }
    
    setShowGameOver(true);
  };

  const handleGameOverContinue = () => {
    navigate("/", { replace: true });
  };

  const timePercentage = mode === "quick" ? (gameState.timeRemaining / totalTime) * 100 : 100;
  const timeColor =
    timePercentage > 50
      ? "text-success"
      : timePercentage > 20
      ? "text-warning"
      : "text-destructive";

  const correctAnswers = gameState.answers.filter(
    (ans, idx) => ans === questions[idx]?.correctAnswer
  ).length;
  const totalQuestionsAttempted = gameState.answers.length + gameState.questionsSkipped;
  const accuracy = totalQuestionsAttempted > 0 
    ? Math.round((correctAnswers / totalQuestionsAttempted) * 100) 
    : 0;

  if (showGameOver) {
    return (
      <div className="min-h-screen p-6 md:p-8 flex items-center justify-center animate-fade-in">
        <Card className="w-full max-w-2xl border-accent/50 shadow-elegant">
          <CardContent className="p-8 space-y-6">
            <div className="text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-accent" />
              <h1 className="text-4xl font-bold text-foreground mb-2">Game Complete!</h1>
              <p className="text-lg text-muted-foreground">
                {mode === "quick" ? "Time Trial" : mode === "classic" ? "Classic" : "Training"} • {category} • {difficulty}
              </p>
                </div>

            {/* Psychologically Powerful Stats - 6 Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* 1. Personal Best vs Current Score - Achievement Gap */}
              <Card className="border-gray-200 bg-white">
                <CardContent className="p-4 text-center">
                  <Trophy className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {gameState.score}
                </div>
                  <p className="text-xs text-gray-600 font-medium">Your Score</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {gameState.score >= 10 ? "New Personal Best!" : "Beat your best!"}
                  </p>
                </CardContent>
              </Card>

              {/* 2. Accuracy with Motivation */}
              <Card className="border-gray-200 bg-white">
                <CardContent className="p-4 text-center">
                  <Target className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">{accuracy}%</div>
                  <p className="text-xs text-gray-600 font-medium">Accuracy</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {accuracy >= 80 ? "Excellent!" : accuracy >= 60 ? "Good!" : "Keep improving!"}
                  </p>
                </CardContent>
              </Card>

              {/* 3. Combo Streak - Momentum Builder */}
              <Card className="border-gray-200 bg-white">
                <CardContent className="p-4 text-center">
                  <Flame className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">{longestCombo}x</div>
                  <p className="text-xs text-gray-600 font-medium">Best Combo</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {longestCombo >= 5 ? "On Fire!" : "Build momentum!"}
                  </p>
                </CardContent>
              </Card>

              {/* 4. Questions Answered - Progress */}
              <Card className="border-gray-200 bg-white">
                <CardContent className="p-4 text-center">
                  <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {gameState.questionsAnswered}
                </div>
                  <p className="text-xs text-gray-600 font-medium">Questions</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {gameState.questionsAnswered >= 10 ? "Knowledge Master!" : "Keep learning!"}
                  </p>
                </CardContent>
              </Card>

              {/* 5. Time Performance - Speed Challenge */}
              <Card className="border-gray-200 bg-white">
                <CardContent className="p-4 text-center">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {Math.round((totalTime - gameState.timeRemaining) / gameState.questionsAnswered * 10) / 10}s
                </div>
                  <p className="text-xs text-gray-600 font-medium">Avg/Question</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((totalTime - gameState.timeRemaining) / gameState.questionsAnswered * 10) / 10 <= 3 ? "Lightning Fast!" : "Speed up!"}
                  </p>
                </CardContent>
              </Card>

              {/* 6. Streak Counter - Habit Formation */}
              <Card className="border-gray-200 bg-white">
                <CardContent className="p-4 text-center">
                  <Trophy className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {consecutiveStats.currentStreak}
              </div>
                  <p className="text-xs text-gray-600 font-medium">Game Streak</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {consecutiveStats.currentStreak >= 3 ? "Streak Master!" : "Build your streak!"}
                  </p>
          </CardContent>
        </Card>
            </div>
            
            {/* Stats Bar - Moved Down */}
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="capitalize bg-gray-100 text-gray-700 border-gray-200">
                      {category}
                    </Badge>
                    <span className="text-sm font-medium text-gray-600">
                      Questions Answered: <span className="text-gray-900 font-bold">{gameState.questionsAnswered}</span>
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                      Accuracy: <span className="text-gray-900 font-bold">{accuracy}%</span>
                    </span>
      </div>
            </div>
          </CardContent>
        </Card>
            {(() => {
              try {
                const unlockedAchievements = getUnlockedAchievements();
                const recentAchievements = unlockedAchievements.filter(a => 
                  Date.now() - a.unlockedAt < 60000 // Show achievements unlocked in last minute
                );
                
                if (recentAchievements.length > 0) {
    return (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-foreground text-center">
                        🏆 Achievements Unlocked!
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {recentAchievements.map((achievement) => (
                          <div 
                            key={achievement.id}
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
                          </div>
                        ))}
        </div>
      </div>
    );
  }
              } catch (error) {
                console.error('Error displaying achievements:', error);
              }
              return null;
            })()}

            {/* UX-Optimized Action Buttons */}
            <div className="space-y-4">
              {/* Primary Action: Replay - Large & Prominent */}
              <Button
                size="lg"
                onClick={() => window.location.reload()}
                className="w-full h-16 bg-black hover:bg-gray-800 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <RotateCcw className="h-5 w-5 text-white" />
        </div>
                  <span>Replay</span>
                </div>
              </Button>

              {/* Secondary Actions Row */}
              <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
                  size="lg"
              onClick={() => navigate("/play")}
                  className="h-12 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">🔄</span>
                    </div>
                    <span>New Game</span>
                  </div>
            </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/")}
                  className="h-12 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">🏠</span>
          </div>
                    <span>Home</span>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8 flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-4xl space-y-6">
        {/* Debug Panel - Randomization Analytics (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">🔧 Randomization Debug</h3>
              <div className="text-xs text-yellow-700 space-y-1">
                <div>Question Pool Stats: {questionPool.getStats().remainingQuestions} remaining</div>
                <div>Current Question Randomized: {currentRandomizedQuestion?.wasRandomized ? '✅' : '❌'}</div>
                <div>Original Position: {currentRandomizedQuestion?.originalCorrectAnswer}</div>
                <div>Current Position: {currentRandomizedQuestion?.correctAnswer}</div>
                {(() => {
                  const analytics = getRandomizationAnalytics();
                  return analytics ? (
                    <div>
                      <div>Analytics: {analytics.totalQuestions} questions tracked</div>
                      <div>Bias Detected: {analytics.biasDetected ? '⚠️' : '✅'}</div>
                      <div>Distribution: {analytics.answerPositionDistribution.position0}/{analytics.answerPositionDistribution.position1}/{analytics.answerPositionDistribution.position2}/{analytics.answerPositionDistribution.position3}</div>
            </div>
                  ) : null;
                })()}
            </div>
            </CardContent>
          </Card>
        )}
        {/* Task Context Banner */}
        {taskId && taskTitle && (
          <Card className="border-primary/50 bg-gradient-primary shadow-elegant">
            <CardContent className="pt-6">
        <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-primary-foreground" />
                  <div>
                    <h3 className="font-semibold text-primary-foreground">Daily Task Active</h3>
                    <p className="text-sm text-primary-foreground/80">{taskTitle}</p>
              </div>
          </div>
            <Button
              variant="outline"
              size="sm"
                  onClick={() => navigate('/daily-tasks')}
                  className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
            >
                  View Tasks
            </Button>
          </div>
            </CardContent>
          </Card>
        )}

        {/* Intense Header Design */}
        <div className="space-y-6">
          {/* Side Stats - Score and Combo First */}
          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardContent className="p-3 text-center">
                <Trophy className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                <div className="text-xl font-bold text-gray-900">
                {gameState.score}
            </div>
                <p className="text-xs text-gray-500">Score</p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white shadow-sm">
              <CardContent className="p-3 text-center">
                <Flame className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                <div className="text-xl font-bold text-orange-500">
                  {gameState.combo}x
              </div>
                <p className="text-xs text-gray-500">Combo</p>
              </CardContent>
            </Card>
        </div>

          {/* Big Time Display - Below Score and Combo */}
          <div className="text-center">
            <div className={`text-8xl font-black tracking-tight ${
              gameState.timeRemaining <= 10 
                ? 'text-red-500 animate-timer-urgent' 
                : 'text-black'
            }`}>
              {Math.floor(gameState.timeRemaining / 60)}:
              {(gameState.timeRemaining % 60).toString().padStart(2, "0")}
            </div>
            <p className="text-lg text-gray-600 mt-2 font-medium">
              {(mode === "quick" || mode === "classic") ? "Time Left" : "Time Elapsed"}
            </p>
              </div>
          </div>

        {/* Single Penalty Animation - Perfect Size & Position */}
        {penaltyAnimations.map((anim) => (
          <div
            key={anim.id}
            className={`fixed pointer-events-none z-50 ${
              anim.type === 'time' 
                ? (anim.value > 0 ? 'text-green-600' : 'text-red-600')
                : 'text-yellow-600'
            }`}
            style={{
              top: 'calc(50% + 20px)', // Same vertical position as timer
              left: 'calc(50% + 80px)', // Positioned to the right of timer
              fontSize: '2rem', // Perfect smaller size
              fontWeight: '900',
              textShadow: '0 0 15px rgba(0,0,0,0.6)',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              animation: anim.type === 'time' ? 'rainFallUp 2.5s ease-out forwards' : 'rainFallDown 2.5s ease-out forwards'
            }}
          >
            {anim.value > 0 ? `+${anim.value}` : anim.value}
            {anim.type === 'time' ? 's' : 'pt'}
            </div>
        ))}


        {/* Question Card */}
        <Card className={`border-border shadow-elegant animate-scale-in relative ${
          gameState.isPaused ? 'opacity-50' : ''
        }`}>
          <CardContent className="p-8">
        {/* Pause Overlay */}
        {gameState.isPaused && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                <div className="text-center space-y-4">
                  <Pause className="h-16 w-16 mx-auto text-muted-foreground" />
                  <h3 className="text-2xl font-bold text-muted-foreground">GAME PAUSED</h3>
                <p className="text-muted-foreground">Press Space or click Resume to continue</p>
                </div>
          </div>
        )}

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                {currentQuestion.buzzword}
              </h2>
              <p className="text-lg text-muted-foreground">
                What does this buzzword mean?
              </p>
            </div>

            {/* Hint Section */}
            {userPreferences.hintsEnabled && (
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleHint}
                    disabled={hintUsed || showFeedback}
                    className="h-8 px-3 bg-black border-black text-white hover:bg-gray-800 hover:border-gray-800 transition-all duration-200 font-medium text-xs"
                  >
                    <Target className="h-3 w-3 mr-1" />
                    {hintUsed ? "Hint Used" : "Get Hint"}
                    {!hintUsed && !showFeedback && (
                      <Badge variant="secondary" className="ml-1 bg-gray-700 text-white text-xs px-1 py-0.5">H</Badge>
                    )}
                  </Button>
                  {hintUsed && (
                    <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                      Hint Used
                    </Badge>
                  )}
                </div>
                {showHint && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">
                      💡 {generateHint(currentQuestion)}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectAnswer = index === currentQuestion.correctAnswer;
                const showCorrect = showFeedback && isCorrectAnswer;
                const showWrong = showFeedback && isSelected && !isCorrectAnswer;
                
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="lg"
                    onClick={() => handleAnswer(index)}
                    disabled={showFeedback || gameState.isPaused}
                    className={`h-12 px-4 text-left justify-start font-medium transition-all duration-200 ${
                      showCorrect
                        ? "bg-green-500 border-green-500 text-white hover:bg-green-500 animate-correct-answer"
                        : showWrong
                        ? "bg-red-500 border-red-500 text-white hover:bg-red-500 animate-incorrect-answer"
                        : gameState.isPaused
                        ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-200"
                        : "bg-white border-gray-300 text-gray-900 hover:bg-black hover:border-black hover:text-white"
                    }`}
                  >
                    <span className="flex-1 text-sm">{option}</span>
                    {showCorrect && (
                      <CheckCircle2 className="h-5 w-5 text-white ml-2 flex-shrink-0" />
                    )}
                    {showWrong && (
                      <XCircle className="h-5 w-5 text-white ml-2 flex-shrink-0" />
                    )}
                  </Button>
                );
              })}
            </div>

            {/* Game Control Buttons - Clean & Sleek */}
            <div className="flex gap-3 justify-center mt-8">
          <Button
            variant="outline"
                size="sm"
            onClick={handleSkip}
                disabled={showFeedback || gameState.isPaused}
                className="h-9 px-4 bg-black border-black text-white hover:bg-gray-800 hover:border-gray-800 transition-all duration-200 font-medium text-sm"
          >
                <SkipForward className="h-4 w-4 mr-2" />
                Skip
          </Button>
              
          <Button
            variant="outline"
                size="sm"
            onClick={handlePause}
                disabled={showFeedback}
                className="h-9 px-4 bg-black border-black text-white hover:bg-gray-800 hover:border-gray-800 transition-all duration-200 font-medium text-sm"
          >
            {gameState.isPaused ? (
              <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
              </>
            ) : (
              <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
              </>
            )}
          </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuit}
                disabled={showGameOver}
                className="h-9 px-4 bg-red-600 border-red-600 text-white hover:bg-red-700 hover:border-red-700 transition-all duration-200 font-medium text-sm"
              >
                <X className="h-4 w-4 mr-2" />
                Quit
          </Button>
        </div>
          </CardContent>
        </Card>

        {/* Game Info */}
        <div className="flex flex-col items-center gap-3">
          <Badge variant="outline" className="px-4 py-2">
            Difficulty: <span className="ml-1 capitalize font-semibold">{difficulty}</span>
          </Badge>
          
          <div className="text-center text-xs text-gray-500">
            <p>Keyboard shortcuts: <span className="font-medium text-gray-700">S</span> to skip • <span className="font-medium text-gray-700">Space</span> to pause • <span className="font-medium text-gray-700">Esc</span> to quit</p>
      </div>
        </div>
      </div>
      
      {/* Level Up Popup */}
      <LevelUpPopup
        isOpen={showLevelUp}
        onClose={() => setShowLevelUp(false)}
        levelData={levelUpData}
        nextLevelProgress={levelUpData ? getUserLevelProgress() : undefined}
      />
    </div>
  );
};

export default Game;