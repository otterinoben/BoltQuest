import { Category, Difficulty } from './game';

// Import coin transaction type
export interface CoinTransaction {
  id: string;
  amount: number;
  type: 'earned' | 'spent';
  source: 'game' | 'daily_task' | 'achievement' | 'social' | 'referral' | 'login' | 'purchase' | 'mission';
  description: string;
  timestamp: number;
  metadata?: {
    gameId?: string;
    taskId?: string;
    achievementId?: string;
    socialPlatform?: string;
    referralCode?: string;
    itemId?: string;
    missionId?: string;
  };
}

/**
 * Storage Data Schemas
 * Defines TypeScript interfaces for all stored data with versioning
 */

export const STORAGE_VERSION = '1.0.0';

/**
 * Base storage item with metadata
 */
export interface StorageItem<T> {
  data: T;
  timestamp: number;
  version: string;
}

/**
 * User Authentication Schema
 */
export interface UserAuth {
  isAuthenticated: boolean;
  userId?: string;
  username?: string;
  loginTime?: number;
  sessionExpiry?: number;
}

/**
 * User Registration Data
 */
export interface UserRegistrationData {
  username: string;
  email?: string;
  avatar?: string;
}

/**
 * User Login Data
 */
export interface UserLoginData {
  username: string;
  rememberMe?: boolean;
}

/**
 * Authentication State
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * User Profile Schema
 */
export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  createdAt: number;
  lastActive: number;
  preferences: UserPreferences;
  statistics: UserStatistics;
  // XP and Leveling System
  level?: number;
  totalXp?: number;
  coins?: number;
  points?: number;
  streak?: number;
  achievements?: string[];
  // Coin System
  coinHistory?: CoinTransaction[];
  lifetimeCoins?: number;
  // Baseline Assessment
  baselineCompleted?: boolean;
  baselineResults?: {
    categoryRatings: Record<string, number>;
    overallRating: number;
    completedAt: number;
  };
  // ELO Rating System
  eloRating?: {
    currentRating: number;
    peakRating: number;
    gamesPlayed: number;
    wins: number;
    losses: number;
    winStreak: number;
    bestWinStreak: number;
    lastUpdated: Date;
    ratingHistory: Array<{
      rating: number;
      change: number;
      gameResult: 'win' | 'loss' | 'draw';
      category: string;
      difficulty: string;
      timestamp: Date;
      performance: number;
    }>;
    categoryRatings: Record<string, number>;
    overallRating?: number;
  };
}

/**
 * User Preferences Schema
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  musicEnabled: boolean;
  notificationsEnabled: boolean;
  defaultCategory: Category;
  defaultDifficulty: Difficulty;
  defaultTimer: number;
  autoPause: boolean;
  showHints: boolean;
  language: string;
  interests: Category[];
  customInterests: string[];
  timerDuration: number;
  hintsEnabled: boolean;
}

/**
 * User Statistics Schema
 */
export interface UserStatistics {
  totalGamesPlayed: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  totalTimeSpent: number;
  averageAccuracy: number;
  bestScore: number;
  longestCombo: number;
  totalSkips: number;
  totalPauseTime: number;
  categoryStats: CategoryStatistics;
  difficultyStats: DifficultyStatistics;
}

/**
 * Category Statistics Schema
 */
export type CategoryStatistics = {
  [key in Category]: {
    gamesPlayed: number;
    questionsAnswered: number;
    correctAnswers: number;
    bestScore: number;
    averageAccuracy: number;
    timeSpent: number;
  };
}

/**
 * Difficulty Statistics Schema
 */
export type DifficultyStatistics = {
  [key in Difficulty]: {
    gamesPlayed: number;
    questionsAnswered: number;
    correctAnswers: number;
    bestScore: number;
    averageAccuracy: number;
    timeSpent: number;
  };
}

/**
 * Game History Schema
 */
export interface GameHistory {
  id: string;
  userId: string;
  category: Category;
  difficulty: Difficulty;
  mode: 'quick' | 'training';
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  timeSpent: number;
  bestCombo: number;
  questionsSkipped: number;
  skipPenalty: number;
  skipEfficiency: number;
  totalPauseTime: number;
  startTime: number;
  endTime: number;
  questions: GameQuestion[];
}

/**
 * Game Question Schema
 */
export interface GameQuestion {
  questionId: string;
  buzzword: string;
  definition: string;
  options: string[];
  correctAnswer: number;
  userAnswer?: number;
  isCorrect: boolean;
  responseTime: number;
  wasSkipped: boolean;
}

/**
 * High Score Schema
 */
export interface HighScore {
  id: string;
  userId: string;
  category: Category;
  difficulty: Difficulty;
  mode: 'quick' | 'training';
  score: number;
  accuracy: number;
  timeSpent: number;
  questionsAnswered: number;
  bestCombo: number;
  questionsSkipped: number;
  skipEfficiency: number;
  achievedAt: number;
  gameId: string;
}

/**
 * Leaderboard Entry Schema
 */
export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  category: Category;
  difficulty: Difficulty;
  mode: 'quick' | 'training';
  score: number;
  accuracy: number;
  timeSpent: number;
  questionsAnswered: number;
  bestCombo: number;
  questionsSkipped: number;
  skipEfficiency: number;
  achievedAt: number;
  rank: number;
  gameId: string;
}

/**
 * Leaderboard Schema
 */
export interface Leaderboard {
  category: Category;
  difficulty: Difficulty;
  mode: 'quick' | 'training';
  entries: LeaderboardEntry[];
  lastUpdated: number;
  totalEntries: number;
}

/**
 * Game State Schema (for saving current game)
 */
export interface SavedGameState {
  id: string;
  userId: string;
  category: Category;
  difficulty: Difficulty;
  mode: 'quick' | 'training';
  gameState: {
    currentQuestion: number;
    score: number;
    combo: number;
    timeRemaining: number;
    answers: number[];
    startTime: number;
    questionsAnswered: number;
    isPaused: boolean;
    pauseStartTime?: number;
    totalPauseTime: number;
    questionsSkipped: number;
    skipPenalty: number;
  };
  questions: GameQuestion[];
  savedAt: number;
  expiresAt: number;
}

/**
 * Storage Keys Schema
 */
export const STORAGE_KEYS = {
  USER_PROFILE: 'buzzbolt_user_profile',
  USER_PREFERENCES: 'buzzbolt_user_preferences',
  USER_STATISTICS: 'buzzbolt_user_statistics',
  USER_AUTH: 'buzzbolt_user_auth',
  USER_SESSIONS: 'buzzbolt_user_sessions',
  GAME_HISTORY: 'buzzbolt_game_history',
  HIGH_SCORES: 'buzzbolt_high_scores',
  LEADERBOARDS: 'buzzbolt_leaderboards',
  SAVED_GAME: 'buzzbolt_saved_game',
  STORAGE_VERSION: 'buzzbolt_storage_version',
  STORAGE_HEALTH: 'buzzbolt_storage_health',
} as const;

/**
 * Migration Schema
 */
export interface Migration {
  version: string;
  description: string;
  migrate: (data: any) => any;
  rollback?: (data: any) => any;
}

/**
 * Storage Health Schema
 */
export interface StorageHealth {
  version: string;
  lastChecked: number;
  isHealthy: boolean;
  issues: string[];
  recommendations: string[];
  storageSize: number;
  maxStorageSize: number;
  usagePercentage: number;
}

/**
 * Backup Schema
 */
export interface Backup {
  id: string;
  createdAt: number;
  version: string;
  data: {
    userProfile?: UserProfile;
    userPreferences?: UserPreferences;
    userStatistics?: UserStatistics;
    gameHistory?: GameHistory[];
    highScores?: HighScore[];
    leaderboards?: Leaderboard[];
  };
  size: number;
  checksum: string;
}

/**
 * Default Values
 */
export const DEFAULT_USER_AUTH: UserAuth = {
  isAuthenticated: false,
  userId: undefined,
  username: undefined,
  loginTime: undefined,
  sessionExpiry: undefined,
};

export const DEFAULT_AUTH_STATE: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  soundEnabled: true,
  musicEnabled: true,
  notificationsEnabled: true,
  defaultCategory: 'tech',
  defaultDifficulty: 'medium',
  defaultTimer: 45,
  autoPause: false,
  showHints: true,
  language: 'en',
  interests: [],
  customInterests: [],
  timerDuration: 20,
  hintsEnabled: false,
};

export const DEFAULT_USER_STATISTICS: UserStatistics = {
  totalGamesPlayed: 0,
  totalQuestionsAnswered: 0,
  totalCorrectAnswers: 0,
  totalTimeSpent: 0,
  averageAccuracy: 0,
  bestScore: 0,
  longestCombo: 0,
  totalSkips: 0,
  totalPauseTime: 0,
  categoryStats: {
    tech: { gamesPlayed: 0, questionsAnswered: 0, correctAnswers: 0, bestScore: 0, averageAccuracy: 0, timeSpent: 0 },
    business: { gamesPlayed: 0, questionsAnswered: 0, correctAnswers: 0, bestScore: 0, averageAccuracy: 0, timeSpent: 0 },
    marketing: { gamesPlayed: 0, questionsAnswered: 0, correctAnswers: 0, bestScore: 0, averageAccuracy: 0, timeSpent: 0 },
    finance: { gamesPlayed: 0, questionsAnswered: 0, correctAnswers: 0, bestScore: 0, averageAccuracy: 0, timeSpent: 0 },
    general: { gamesPlayed: 0, questionsAnswered: 0, correctAnswers: 0, bestScore: 0, averageAccuracy: 0, timeSpent: 0 },
  },
  difficultyStats: {
    easy: { gamesPlayed: 0, questionsAnswered: 0, correctAnswers: 0, bestScore: 0, averageAccuracy: 0, timeSpent: 0 },
    medium: { gamesPlayed: 0, questionsAnswered: 0, correctAnswers: 0, bestScore: 0, averageAccuracy: 0, timeSpent: 0 },
    hard: { gamesPlayed: 0, questionsAnswered: 0, correctAnswers: 0, bestScore: 0, averageAccuracy: 0, timeSpent: 0 },
  },
};

/**
 * Validation Functions
 */
export const validateUserProfile = (profile: any): profile is UserProfile => {
  return (
    profile &&
    typeof profile.id === 'string' &&
    typeof profile.username === 'string' &&
    typeof profile.createdAt === 'number' &&
    typeof profile.lastActive === 'number' &&
    profile.preferences &&
    profile.statistics
  );
};

export const validateGameHistory = (history: any): history is GameHistory => {
  return (
    history &&
    typeof history.id === 'string' &&
    typeof history.userId === 'string' &&
    typeof history.category === 'string' &&
    typeof history.difficulty === 'string' &&
    typeof history.mode === 'string' &&
    typeof history.score === 'number' &&
    typeof history.questionsAnswered === 'number' &&
    typeof history.correctAnswers === 'number' &&
    typeof history.accuracy === 'number' &&
    typeof history.timeSpent === 'number' &&
    typeof history.startTime === 'number' &&
    typeof history.endTime === 'number' &&
    Array.isArray(history.questions)
  );
};

export const validateHighScore = (score: any): score is HighScore => {
  return (
    score &&
    typeof score.id === 'string' &&
    typeof score.userId === 'string' &&
    typeof score.category === 'string' &&
    typeof score.difficulty === 'string' &&
    typeof score.mode === 'string' &&
    typeof score.score === 'number' &&
    typeof score.accuracy === 'number' &&
    typeof score.timeSpent === 'number' &&
    typeof score.questionsAnswered === 'number' &&
    typeof score.bestCombo === 'number' &&
    typeof score.achievedAt === 'number'
  );
};
