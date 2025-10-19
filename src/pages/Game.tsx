import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Category, Difficulty, GameState } from "@/types/game";
import { getUserProfile } from "@/lib/userStorage";
import { mockQuestions } from "@/data/mockData";
import { Clock, Flame, Trophy, CheckCircle2, XCircle, SkipForward, Pause, Play, X, Target, RotateCcw, Zap } from "lucide-react";
import { toast } from "sonner";
import { checkAchievements, getUnlockedAchievements, getConsecutiveGameStats } from "@/lib/simpleAchievements";
import { updateGameStatistics } from "@/lib/userStorage";
import { addGameToHistory } from "@/lib/gameHistoryStorage";
import { addHighScore } from "@/lib/highScoreStorage";
import { updateTaskProgress, getCurrentDailyTasks } from "@/lib/dailyTaskManager";
import { LevelUpPopup } from '@/components/LevelUpPopup';
import FlowFeedback from '@/components/FlowFeedback';
import { addXp, getUserLevelProgress, getLevelData, calculateXpReward } from '@/lib/xpLevelSystem';
import { 
  awardCoinsForGamePlayed, 
  awardCoinsForCorrectAnswer, 
  awardCoinsForStreakMilestone, 
  awardCoinsForPersonalBest 
} from '@/lib/coinSystem';
import { quickShare } from '@/lib/socialSharing';
import { useAudio } from '@/contexts/AudioContext';
import { useAutoSave } from '@/lib/autoSave';
import { useTesting } from '@/contexts/TestingContext';
import {
  createQuestionPool,
  RandomizedQuestion,
  DEFAULT_RANDOMIZATION_CONFIG,
  getRandomizationAnalytics,
  validateRandomization
} from '@/lib/questionRandomizer';
import { AdaptiveDifficultyManager, DifficultyUtils } from '@/lib/adaptiveDifficulty';
import { MicroSessionManager, SessionType, SessionUtils } from '@/lib/microSessions';
import { EloSystem } from '@/lib/eloSystem';
import { EnhancedProgressIndicators } from '@/components/game/EnhancedProgressIndicators';
import { SmartPauseManager } from '@/components/game/SmartPauseManager';
import { smartPauseSystem } from '@/lib/smartPauseSystem';
import { HelpTrigger } from '@/components/help/HelpTrigger';
import { CountdownTimer } from '@/components/loading/CountdownTimer';
import { GameOverScreen } from '@/components/game/GameOverScreen';
import { TrueFalseGame } from '@/components/game/TrueFalseGame';
import { motion, AnimatePresence } from 'framer-motion';
import { TRANSITION_VARIANTS } from '@/lib/animations';

const Game = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { playSound } = useAudio();
  const { performAutoSave } = useAutoSave();
  const testing = useTesting();
  const category = (searchParams.get("category") as Category) || "tech";
  const difficulty = (searchParams.get("difficulty") as Difficulty) || "medium";
  const mode = searchParams.get("mode") || "classic";
  const timerPreset = parseInt(searchParams.get("timer") || "45");
  const taskId = searchParams.get("taskId");
  const taskTitle = searchParams.get("taskTitle");

  // Validate parameters and provide fallbacks
  const validCategory = mode === 'truefalse' ? 'general' : (mockQuestions[category] ? category : "tech");
  const validDifficulty = mode === 'truefalse' ? 'medium' : (mockQuestions[validCategory]?.[difficulty] ? difficulty : "medium");

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
  const [penaltyAnimations, setPenaltyAnimations] = useState<Array<{
    id: string, 
    type: 'time' | 'score', 
    value: number, 
    timestamp: number,
    position: { x: number, y: number },
    index: number,
    delay: number
  }>>([]);

  // Streak popup state
  const [streakPopups, setStreakPopups] = useState<Array<{
    id: string,
    type: 'milestone' | 'pb',
    message: string,
    timestamp: number,
    position: { x: number, y: number },
    index: number,
    delay: number
  }>>([]);
  
  const [unpauseCountdown, setUnpauseCountdown] = useState<number | null>(null);

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
  const [gameOverPhase, setGameOverPhase] = useState<'game-over' | 'complete'>('game-over');
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

  // Countdown state
  const [showCountdown, setShowCountdown] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  // Countdown completion handler
  const handleCountdownComplete = () => {
    setShowCountdown(false);
    setGameStarted(true);
    // Reset start time when game actually begins
    setGameState(prev => ({
      ...prev,
      startTime: new Date()
    }));
  };

  // Adaptive Difficulty System
  const [adaptiveManager] = useState(() => new AdaptiveDifficultyManager());
  const [microSessionManager] = useState(() => new MicroSessionManager());
  const [eloSystem] = useState(() => new EloSystem());
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [flowState, setFlowState] = useState<any>(null);
  const [showFlowFeedback, setShowFlowFeedback] = useState(false);

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

  const questions = mode === 'truefalse' ? [] : mockQuestions[validCategory][validDifficulty];
  const totalQuestions = mode === 'truefalse' ? 20 : questions.length;

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

  // Show penalty animation - 5 different rain patterns that alternate
  const showPenaltyAnimation = (type: 'time' | 'score', value: number) => {
    // 5 different rain patterns for variety
    const rainPatterns = [
      // Pattern 1: Wide spread, high-low-high
      [
        { x: -80, y: -15 },   // Left side, slightly up
        { x: 0, y: 5 },       // Center, slightly down
        { x: 70, y: -10 }     // Right side, slightly up
      ],
      // Pattern 2: Tight cluster, all slightly different heights
      [
        { x: -40, y: -5 },    // Left, slightly up
        { x: 0, y: 0 },       // Center, neutral
        { x: 40, y: 5 }       // Right, slightly down
      ],
      // Pattern 3: Scattered wide, varied heights
      [
        { x: -90, y: 10 },    // Far left, down
        { x: 20, y: -20 },    // Right-center, up
        { x: 80, y: 5 }       // Far right, slightly down
      ],
      // Pattern 4: Arc pattern, curved spread
      [
        { x: -60, y: -25 },   // Left, high
        { x: 0, y: 0 },       // Center, neutral
        { x: 60, y: -25 }     // Right, high (arc shape)
      ],
      // Pattern 5: Diagonal line, sloping down
      [
        { x: -70, y: -20 },   // Left, high
        { x: -20, y: -5 },    // Left-center, medium
        { x: 50, y: 15 }      // Right, low (diagonal)
      ]
    ];

    // Randomly select one of the 5 patterns
    const selectedPattern = rainPatterns[Math.floor(Math.random() * rainPatterns.length)];

    // Create all 3 instances with the selected pattern
    const animations = selectedPattern.map((position, index) => ({
      id: Math.random().toString(36).substr(2, 9) + `_${index}`,
      type,
      value,
      timestamp: Date.now(),
      position,
      index,
      delay: index * 120 // Slightly longer delay for rain effect
    }));

    // Add all animations at once
    setPenaltyAnimations(prev => [...prev, ...animations]);
    
    // Remove all animations after 3 seconds
    setTimeout(() => {
      setPenaltyAnimations(prev => prev.filter(anim => 
        !animations.some(a => a.id === anim.id)
      ));
    }, 3000);
  };

  // Show streak popup - subtle like penalty animations
  const showStreakPopup = (type: 'milestone' | 'pb', message: string) => {
    // Different popup counts based on type
    const popupCount = type === 'pb' ? 2 : 1;
    
    // Different positions for streak popups to avoid overlap with penalties
    const positions = [
      { x: -60, y: 0 },
      { x: 0, y: 0 },
      { x: 60, y: 0 }
    ].slice(0, popupCount); // Only use the number of positions we need

    // Create popups based on type
    const popups = positions.map((position, index) => ({
      id: Math.random().toString(36).substr(2, 9) + `_${index}`,
      type,
      message,
      timestamp: Date.now(),
      position,
      index,
      delay: index * 100
    }));

    // Add all popups at once
    setStreakPopups(prev => [...prev, ...popups]);
    
    // Remove all popups after 3 seconds
    setTimeout(() => {
      setStreakPopups(prev => prev.filter(popup => 
        !popups.some(p => p.id === popup.id)
      ));
    }, 3000);
  };

  // Reset hint state for new question
  const resetHintState = () => {
    setShowHint(false);
    setHintUsed(false);
  };

  // Initialize question pool with randomization (skip for True/False mode)
  const [questionPool] = useState(() => 
    mode === 'truefalse' ? null : createQuestionPool(questions, DEFAULT_RANDOMIZATION_CONFIG)
  );
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
      if (mode === 'truefalse' || !questionPool) {
        // Skip initialization for True/False mode
        return;
      }
      
      const randomized = [];
      for (let i = 0; i < Math.min(totalQuestions, 20); i++) {
        randomized.push(questionPool.getNextQuestion());
      }
      setRandomizedQuestions(randomized);
      setCurrentRandomizedQuestion(randomized[0] || null);
    };

    initializeQuestions();
  }, [questionPool, totalQuestions, mode]);

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

  // Auto-save on game state changes (but not during countdown)
  useEffect(() => {
    if (!showGameOver && !gameState.isPaused && !showCountdown) {
      performAutoSave();
    }
  }, [gameState.score, gameState.combo, gameState.questionsAnswered, showGameOver, gameState.isPaused, showCountdown, performAutoSave]);

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
    if (gameState.isPaused) {
          handleUnpause();
    } else {
          handlePause();
        }
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
    if ((mode === "quick" || mode === "classic") && !showGameOver && !gameState.isPaused && gameStarted) {
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
  }, [mode, showGameOver, gameState.isPaused, gameStarted]);

  const currentQuestion = mode === 'truefalse' ? null : (currentRandomizedQuestion || questions[gameState.currentQuestion % questions.length]);

  const handleAnswer = (answerIndex: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Simple scoring: 1 point per correct answer
    const scoreGain = correct ? 1 : 0;

    const newCombo = correct ? gameState.combo + 1 : 0;
    
    // Calculate time adjustment
    const timeAdjustment = (mode === "quick" || mode === "classic") ? (correct ? 3 : -5) : 0;
    
    // Adaptive Difficulty: Track performance metrics
    const responseTime = Date.now() - (gameState.startTime.getTime() + (totalTime - gameState.timeRemaining) * 1000);
    const performanceMetrics = {
      accuracy: correct ? 1 : 0,
      responseTime: responseTime,
      streak: newCombo,
      questionsAnswered: gameState.questionsAnswered + 1,
      timestamp: new Date()
    };

    // Update adaptive difficulty system
    const difficultyAdjustment = adaptiveManager.updatePerformance(performanceMetrics);
    const newFlowState = adaptiveManager.getFlowState();
    setFlowState(newFlowState);

    // Show flow feedback if user is not in optimal zone
    if (!newFlowState.isInFlow && gameState.questionsAnswered > 3) {
      setShowFlowFeedback(true);
      setTimeout(() => setShowFlowFeedback(false), 3000);
    }
    
    // Show penalty animations with sounds
    if (timeAdjustment > 0) {
      showPenaltyAnimation('time', timeAdjustment);
      playSound('correct'); // Satisfying sound for time bonus
    } else if (timeAdjustment < 0) {
      showPenaltyAnimation('time', timeAdjustment);
      playSound('incorrect'); // Penalty sound for time loss
    }
    
    setGameState((prev) => {
        const newTime = Math.max(0, prev.timeRemaining + timeAdjustment);
      
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
      
      // Check for PB streak milestone with unique sound
      if (newCombo >= 5) {
        showStreakPopup('pb', 'NEW PB!');
        awardCoinsForPersonalBest();
        playSound('notification'); // Unique notification sound for PB achievement
      }
    }

    // Check for streak milestones with unique sounds (only 1 at a time)
    if (correct && newCombo > 0) {
      // Clear any existing streak popups first
      setStreakPopups([]);
      
      if (newCombo === 5) {
        showStreakPopup('milestone', 'HOT!');
        awardCoinsForStreakMilestone(newCombo);
        playSound('achievement'); // Unique achievement sound for HOT!
      } else if (newCombo === 10) {
        showStreakPopup('milestone', 'ON FIRE!');
        awardCoinsForStreakMilestone(newCombo);
        playSound('achievement'); // Unique achievement sound for ON FIRE!
      } else if (newCombo === 15) {
        showStreakPopup('milestone', 'UNSTOPPABLE!');
        awardCoinsForStreakMilestone(newCombo);
        playSound('achievement'); // Unique achievement sound for UNSTOPPABLE!
      } else if (newCombo === 20) {
        showStreakPopup('milestone', 'LEGENDARY!');
        awardCoinsForStreakMilestone(newCombo);
        playSound('achievement'); // Unique achievement sound for LEGENDARY!
      } else if (newCombo === 25) {
        showStreakPopup('milestone', 'GODLIKE!');
        awardCoinsForStreakMilestone(newCombo);
        playSound('achievement'); // Unique achievement sound for GODLIKE!
      }
    }

    if (correct) {
      // Award coins for correct answer
      awardCoinsForCorrectAnswer(difficulty);
      
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
    
    // Show single penalty animation (prioritize time penalty if both exist)
    if (timePenalty > 0) {
      showPenaltyAnimation('time', -timePenalty);
    } else if (skipPenalty > 0) {
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

  const handleUnpause = () => {
    if (!gameState.isPaused) return;
    
    // Start countdown
    setUnpauseCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setUnpauseCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          setGameState(prev => ({ ...prev, isPaused: false }));
          setUnpauseCountdown(null);
          playSound('correct'); // Satisfying unpause sound
          toast.success("Game Resumed!", { duration: 1000 });
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Testing functions for the testing panel
  const handleTestingAddTime = (seconds: number) => {
    if (showGameOver || gameState.isPaused) return;
    
    setGameState(prev => ({
      ...prev,
      timeRemaining: Math.max(0, prev.timeRemaining + seconds)
    }));
    
    // Show penalty animation for visual feedback
    if (seconds > 0) {
      showPenaltyAnimation('time', seconds);
      playSound('correct');
    } else if (seconds < 0) {
      showPenaltyAnimation('time', seconds);
      playSound('incorrect');
    }
  };

  const handleTestingAddScore = (points: number) => {
    if (showGameOver) return;
    
    setGameState(prev => ({
          ...prev,
      score: Math.max(0, prev.score + points)
    }));
    
    // Show penalty animation for visual feedback
    if (points > 0) {
      showPenaltyAnimation('score', points);
      playSound('correct');
    } else if (points < 0) {
      showPenaltyAnimation('score', points);
      playSound('incorrect');
    }
  };

  const handleTestingAddCoins = (coins: number) => {
    // This would integrate with a coin system if implemented
    console.log(`Testing: Adding ${coins} coins`);
    toast.success(`Added ${coins} coins!`, { duration: 1000 });
  };

  const handleTestingTriggerPopup = (type: 'penalty' | 'streak', value?: number) => {
    if (type === 'penalty' && value !== undefined) {
      showPenaltyAnimation('time', value);
      if (value > 0) {
        playSound('correct');
      } else {
      playSound('incorrect');
      }
    } else if (type === 'streak') {
      const messages = ['HOT!', 'ON FIRE!', 'UNSTOPPABLE!', 'LEGENDARY!', 'GODLIKE!', 'NEW PB!'];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      const randomType = randomMessage === 'NEW PB!' ? 'pb' : 'milestone';
      
      showStreakPopup(randomType as 'milestone' | 'pb', randomMessage);
      playSound('achievement');
    }
  };

  const handleTestingPauseToggle = () => {
    if (gameState.isPaused) {
      handleUnpause();
    } else {
      handlePause();
    }
  };

  const handleTestingResetData = () => {
    if (window.confirm('⚠️ Are you sure you want to reset ALL game data? This cannot be undone!')) {
      localStorage.clear();
      toast.success('All data reset!', { duration: 2000 });
      window.location.reload();
    }
  };

  // Update testing context with current game state
  useEffect(() => {
    if (testing) {
      // Override the testing context functions with game-specific implementations
      testing.addTime = handleTestingAddTime;
      testing.addScore = handleTestingAddScore;
      testing.addCoins = handleTestingAddCoins;
      testing.triggerPenaltyPopup = (value) => handleTestingTriggerPopup('penalty', value);
      testing.triggerStreakPopup = (type) => handleTestingTriggerPopup('streak');
      testing.pauseToggle = handleTestingPauseToggle;
      testing.resetAllData = handleTestingResetData;
    }
  }, [testing, gameState, showGameOver]);

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
    // Phase 1: Show "GAME OVER" immediately
    setShowGameOver(true);
    setGameOverPhase('game-over');
    playSound('game_over');
    
    // Phase 2: After 2 seconds, show "Game Complete" with results
    setTimeout(() => {
      setGameOverPhase('complete');
      calculateAndSaveResults();
    }, 2000);
  };

  const calculateAndSaveResults = () => {
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
        bestCombo: longestCombo,
        questionsSkipped: gameState.questionsSkipped,
        skipPenalty: gameState.questionsSkipped * 2, // Assuming 2 points penalty per skip
        skipEfficiency: gameState.questionsSkipped > 0 ? (gameState.questionsAnswered / (gameState.questionsAnswered + gameState.questionsSkipped)) * 100 : 100,
        totalPauseTime: finalPauseTime,
        startTime: Date.now() - totalTimeSpent * 1000,
        endTime: Date.now(),
        questions: [], // Empty array for now, could be populated with actual questions
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
        accuracy,
        timeSpent: totalTimeSpent,
        bestCombo: longestCombo,
        questionsSkipped: gameState.questionsSkipped,
        skipEfficiency: gameState.questionsSkipped > 0 ? (gameState.questionsAnswered / (gameState.questionsAnswered + gameState.questionsSkipped)) * 100 : 100,
        achievedAt: Date.now(),
        gameId: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
    
    // Award coins for game completion
    awardCoinsForGamePlayed(difficulty);
    
    // Update ELO rating based on performance
    try {
      const performance = (correctAnswers / gameState.questionsAnswered) * 100;
      const eloCalculation = eloSystem.updateElo(
        performance,
        validCategory,
        mode,
        gameState.questionsAnswered,
        totalTimeSpent
      );
      
      console.log('🎯 ELO Update:', {
        category: validCategory,
        performance: Math.round(performance),
        ratingChange: eloCalculation.ratingChange,
        newRating: eloCalculation.newRating,
        expectedScore: eloCalculation.expectedScore?.toFixed(2) || '0.00',
        actualScore: eloCalculation.actualScore?.toFixed(2) || '0.00'
      });
      
      // Show ELO change in toast
      if (eloCalculation.ratingChange > 0) {
        toast.success(`Rating increased by ${eloCalculation.ratingChange}!`, {
          description: `New ${validCategory} rating: ${eloCalculation.newRating}`,
          duration: 4000,
        });
      } else if (eloCalculation.ratingChange < 0) {
        toast.warning(`Rating decreased by ${Math.abs(eloCalculation.ratingChange)}`, {
          description: `New ${validCategory} rating: ${eloCalculation.newRating}`,
          duration: 4000,
        });
      } else {
        toast.info(`Rating unchanged`, {
          description: `${validCategory} rating: ${eloCalculation.newRating}`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error updating ELO:', error);
    }
  };

  const handleGameOverContinue = () => {
    navigate("/", { replace: true });
  };

  const handleAutoReplay = () => {
    // Reset game state and start a new game
    setShowGameOver(false);
    setGameOverPhase('game-over');
    setShowCountdown(true);
    setGameStarted(false);
    
    // Reset game state
    setGameState({
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

    // Reset other states
    setSelectedAnswer(null);
    setShowFeedback(false);
    setHintUsed(false);
    setShowHint(false);
    setLongestCombo(0);

    toast.success("Starting new game!", {
      description: "Get ready for another round!"
    });
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
      <GameOverScreen
        gameOverPhase={gameOverPhase}
        gameState={gameState}
        mode={mode}
        category={validCategory}
        difficulty={validDifficulty}
        accuracy={accuracy}
        longestCombo={longestCombo}
        consecutiveStats={consecutiveStats}
        totalTime={totalTime}
        onAutoReplay={handleAutoReplay}
      />
    );
  }

  // Handle True/False mode
  if (mode === 'truefalse') {
    // Get selected categories from URL params or use default
    const categoriesParam = searchParams.get('categories');
    const selectedCategories = categoriesParam ? categoriesParam.split(',') : ['general'];
    
    return (
      <TrueFalseGame
        selectedCategories={selectedCategories}
        onComplete={(results) => {
          // Convert True/False results to game state format
          const correctAnswers = results.filter(r => r.isCorrect).length;
          const totalPoints = results.reduce((sum, r) => sum + r.pointsEarned, 0);
          
          // Set game over state
          setGameState(prev => ({
            ...prev,
            score: totalPoints,
            questionsAnswered: results.length,
            correctAnswers: correctAnswers
          }));
          setShowGameOver(true);
        }}
        onQuit={() => navigate('/play')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Countdown Timer */}
      <AnimatePresence>
        {showCountdown && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <CountdownTimer
              onComplete={handleCountdownComplete}
              duration={3}
              text="Get Ready!"
              showGo={true}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Game Content - Viewport Optimized */}
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: gameStarted ? 1 : 0, scale: gameStarted ? 1 : 0.95 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col max-w-4xl mx-auto w-full"
      >
        {/* Task Context Banner - Compact */}
        {taskId && taskTitle && (
          <div className="flex-shrink-0 mb-3">
            <Card className="border-primary/50 bg-gradient-primary shadow-elegant">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary-foreground" />
                    <div>
                      <h3 className="text-sm font-semibold text-primary-foreground">Daily Task</h3>
                      <p className="text-xs text-primary-foreground/80">{taskTitle}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground text-xs">
                    +50 XP
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Game Header - Compact */}
        <div className="flex-shrink-0 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm px-3 py-1">
              {validCategory}
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {validDifficulty}
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {mode}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePause}
              className="flex items-center gap-1 text-xs px-2 py-1"
            >
              {gameState.isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              {gameState.isPaused ? 'Resume' : 'Pause'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleQuit}
              className="flex items-center gap-1 text-red-600 hover:text-red-700 text-xs px-2 py-1"
            >
              <X className="h-3 w-3" />
              Quit
            </Button>
          </div>
        </div>

        {/* Enhanced Progress Indicators - Compact */}
        <div className="flex-shrink-0 mb-4">
          <EnhancedProgressIndicators
            score={gameState.score}
            combo={gameState.combo}
            timeRemaining={gameState.timeRemaining}
            questionsAnswered={gameState.questionsAnswered}
            accuracy={Math.round(((gameState.score || 0) / Math.max(gameState.questionsAnswered, 1)) * 100)}
            mode={mode}
            isPaused={gameState.isPaused}
            streakMilestone={5}
            personalBest={10}
          />
        </div>

        {/* Rain Effect Penalty Animation */}
        {penaltyAnimations.map((anim) => (
          <div
            key={anim.id}
            className={`fixed pointer-events-none z-50 ${
              anim.type === 'time' 
                ? (anim.value > 0 ? 'text-green-600' : 'text-red-600')
                : 'text-yellow-600'
            }`}
            style={{
              top: `calc(50% + 10px + ${anim.position.y}px)`,
              left: `calc(50% + 40px + ${anim.position.x}px)`,
              fontSize: '1.2rem',
              fontWeight: '900',
              textShadow: '0 0 15px rgba(0,0,0,0.6)',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              animation: anim.value > 0 ? 'rainFallUp 3s ease-out forwards' : 'rainFallDown 3s ease-out forwards',
              animationDelay: `${anim.delay}ms`,
              transform: 'translateX(-50%)',
            }}
          >
            {anim.value > 0 ? `+${anim.value}` : anim.value}
            {anim.type === 'time' ? 's' : 'pt'}
            </div>
        ))}

        {/* Subtle Streak Popups - Positioned Above Penalties */}
        {streakPopups.map((popup) => (
          <div
            key={popup.id}
            className={`fixed pointer-events-none z-50 ${
              popup.type === 'pb' ? 'text-yellow-500' : 'text-orange-500'
            }`}
            style={{
              top: `calc(50% - 10px + ${popup.position.y}px)`,
              left: `calc(50% + 40px + ${popup.position.x}px)`,
              fontSize: '1.1rem',
              fontWeight: '800',
              textShadow: '0 0 15px rgba(0,0,0,0.6)',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              animation: 'rainFallUp 3s ease-out forwards',
              animationDelay: `${popup.delay}ms`,
              transform: 'translateX(-50%)',
            }}
          >
            {popup.message}
          </div>
        ))}


        {/* Question Card - Compact */}
        <div className="flex-1 flex flex-col justify-center">
          <Card className={`border-border shadow-elegant animate-scale-in relative ${
            gameState.isPaused ? 'opacity-50' : ''
          }`}>
            <CardContent className="p-4 sm:p-6">
        {/* Pause Overlay */}
        {gameState.isPaused && (
              <div 
                className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg cursor-pointer"
                onClick={handleUnpause}
              >
                <div className="text-center space-y-3 sm:space-y-4 p-4">
                  <Pause className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground" />
                  <h3 className="text-xl sm:text-2xl font-bold text-muted-foreground">GAME PAUSED</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Press Space or click anywhere to resume</p>
                  
                  {/* Countdown Display */}
                  {unpauseCountdown !== null && (
                    <div className="space-y-2">
                      <div className="text-3xl sm:text-4xl font-bold text-green-500 animate-pulse">
                        {unpauseCountdown}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Resuming in...</p>
                    </div>
                  )}
                </div>
          </div>
        )}

            <div className="mb-4">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2">
                {currentQuestion.buzzword}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                What does this buzzword mean?
              </p>
            </div>

            {/* Hint Section - Compact */}
            {userPreferences.hintsEnabled && (
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleHint}
                    disabled={hintUsed || showFeedback}
                    className="h-7 px-2 bg-black border-black text-white hover:bg-gray-800 hover:border-gray-800 transition-all duration-200 font-medium text-xs"
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

            {/* Compact Timer Display */}
            <div className="mb-3 text-center">
              <div className={`text-xl sm:text-2xl font-black tracking-tight transition-all duration-300 ${
                gameState.timeRemaining <= 5 ? 'text-red-500 animate-pulse' :
                gameState.timeRemaining <= 10 ? 'text-orange-500 animate-bounce' : 'text-gray-800'
              }`}>
                {Math.floor(gameState.timeRemaining / 60)}:
                {(gameState.timeRemaining % 60).toString().padStart(2, "0")}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {(mode === "quick" || mode === "classic") ? "Time Left" : "Time Elapsed"}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectAnswer = index === currentQuestion.correctAnswer;
                const showCorrect = showFeedback && isCorrectAnswer;
                const showWrong = showFeedback && isSelected && !isCorrectAnswer;
                
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAnswer(index)}
                    disabled={showFeedback || gameState.isPaused}
                    className={`min-h-[40px] px-3 text-left justify-start font-medium transition-all duration-200 ${
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
                      <CheckCircle2 className="h-4 w-4 text-white ml-2 flex-shrink-0" />
                    )}
                    {showWrong && (
                      <XCircle className="h-4 w-4 text-white ml-2 flex-shrink-0" />
                    )}
                  </Button>
                );
              })}
            </div>

            {/* Game Control Buttons - Compact */}
            <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
          <Button
            variant="outline"
                size="sm"
            onClick={handleSkip}
                disabled={showFeedback || gameState.isPaused}
                className="min-h-[44px] px-4 bg-black border-black text-white hover:bg-gray-800 hover:border-gray-800 transition-all duration-200 font-medium text-sm"
          >
                <SkipForward className="h-4 w-4 mr-2" />
                Skip
          </Button>
              
          {/* Smart Pause Manager */}
          <div className="flex justify-center">
            <SmartPauseManager
              gameId={`game_${Date.now()}`}
              gameState={gameState}
              isPaused={gameState.isPaused}
              onPause={handlePause}
              onResume={handleUnpause}
              onShowPauseHistory={() => {
                // This would navigate to a pause history page
                console.log('Show pause history');
              }}
            />
          </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuit}
                disabled={showGameOver}
                className="min-h-[44px] px-4 bg-red-600 border-red-600 text-white hover:bg-red-700 hover:border-red-700 transition-all duration-200 font-medium text-sm"
              >
                <X className="h-4 w-4 mr-2" />
                Quit
              </Button>
              
              {/* Test Button for Weighted Random Popups */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Weighted popup system - some are more likely than others
                  const weightedPopups = [
                    { type: 'milestone' as const, message: 'HOT!', weight: 40 },           // 40% chance
                    { type: 'milestone' as const, message: 'ON FIRE!', weight: 25 },       // 25% chance
                    { type: 'milestone' as const, message: 'UNSTOPPABLE!', weight: 15 },  // 15% chance
                    { type: 'milestone' as const, message: 'LEGENDARY!', weight: 10 },    // 10% chance
                    { type: 'milestone' as const, message: 'GODLIKE!', weight: 5 },       // 5% chance
                    { type: 'pb' as const, message: 'NEW PB!', weight: 5 }                // 5% chance
                  ];
                  
                  // Calculate total weight
                  const totalWeight = weightedPopups.reduce((sum, popup) => sum + popup.weight, 0);
                  
                  // Generate random number and select weighted popup
                  let randomNum = Math.random() * totalWeight;
                  let selectedPopup = weightedPopups[0];
                  
                  for (const popup of weightedPopups) {
                    randomNum -= popup.weight;
                    if (randomNum <= 0) {
                      selectedPopup = popup;
                      break;
                    }
                  }
                  
                  // Clear any existing streak popups first (only 1 at a time)
                  setStreakPopups([]);
                  
                  // Create single test popup
                  const testPopup = {
                    id: Math.random().toString(36).substr(2, 9),
                    type: selectedPopup.type,
                    message: selectedPopup.message,
                    timestamp: Date.now(),
                    position: { x: 0, y: 0 },
                    index: 0,
                    delay: 0
                  };
                  
                  setStreakPopups([testPopup]);
                  
                  // Play unique sound for test popup
                  playSound('notification');
                  
                  // Remove after 3 seconds
                  setTimeout(() => {
                    setStreakPopups(prev => prev.filter(popup => popup.id !== testPopup.id));
                  }, 3000);
                }}
                className="h-9 px-4 bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 transition-all duration-200 font-medium text-sm"
              >
                <Target className="h-4 w-4 mr-2" />
                Test
              </Button>
              
              {/* Test Button for Penalty Animations */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const testTypes = ['time', 'score'];
                  const testValues = [3, -5, 10, -2, 7];
                  const randomType = testTypes[Math.floor(Math.random() * testTypes.length)];
                  const randomValue = testValues[Math.floor(Math.random() * testValues.length)];
                  showPenaltyAnimation(randomType as 'time' | 'score', randomValue);
                  
                  // Play unique sound for penalty test
                  playSound('skip'); // Unique skip sound for penalty test button
                }}
                className="h-9 px-4 bg-green-600 border-green-600 text-white hover:bg-green-700 hover:border-green-700 transition-all duration-200 font-medium text-sm"
              >
                <Zap className="h-4 w-4 mr-2" />
                Penalty
          </Button>
        </div>
          </CardContent>
        </Card>
        </div>

        {/* Game Info */}
        <div className="flex flex-col items-center gap-3">
          <Badge variant="outline" className="px-4 py-2">
            Difficulty: <span className="ml-1 capitalize font-semibold">{difficulty}</span>
          </Badge>
          
          <div className="text-center text-xs text-gray-500">
            <p>Keyboard shortcuts: <span className="font-medium text-gray-700">S</span> to skip • <span className="font-medium text-gray-700">Space</span> to pause • <span className="font-medium text-gray-700">Esc</span> to quit</p>
          </div>
        </div>
      </motion.div>
      
      {/* Level Up Popup */}
      <LevelUpPopup
        isOpen={showLevelUp}
        onClose={() => setShowLevelUp(false)}
        levelData={levelUpData}
        nextLevelProgress={levelUpData ? {
          currentXp: getUserLevelProgress().currentXp,
          nextLevelXp: getUserLevelProgress().xpToNext + getUserLevelProgress().currentXp,
          progressToNextLevel: getUserLevelProgress().progress
        } : undefined}
      />

      {/* Flow Feedback */}
      <FlowFeedback
        flowState={flowState}
        difficultyAdjustment={null}
        isVisible={showFlowFeedback}
        onClose={() => setShowFlowFeedback(false)}
      />

    </div>
    </div>
  );
};

export default Game;
