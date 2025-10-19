import { 
  GameHistory, 
  GameQuestion, 
  STORAGE_KEYS,
  validateGameHistory
} from '@/types/storage';
import { 
  saveDataWithFeedback, 
  loadDataWithFeedback, 
  getDataWithFallback,
  hasData,
  removeData
} from '@/lib/storage';
import { Category, Difficulty } from '@/types/game';

/**
 * Game History Storage Functions
 * Handles all game history data persistence operations
 */

/**
 * Generate a unique game history ID
 */
export const generateGameHistoryId = (): string => {
  return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create a new game history entry
 */
export const createGameHistory = (gameData: {
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
}): GameHistory => {
  const gameId = generateGameHistoryId();
  
  return {
    id: gameId,
    userId: gameData.userId,
    category: gameData.category,
    difficulty: gameData.difficulty,
    mode: gameData.mode,
    score: gameData.score,
    questionsAnswered: gameData.questionsAnswered,
    correctAnswers: gameData.correctAnswers,
    accuracy: gameData.accuracy,
    timeSpent: gameData.timeSpent,
    bestCombo: gameData.bestCombo,
    questionsSkipped: gameData.questionsSkipped,
    skipPenalty: gameData.skipPenalty,
    skipEfficiency: gameData.skipEfficiency,
    totalPauseTime: gameData.totalPauseTime,
    startTime: gameData.startTime,
    endTime: gameData.endTime,
    questions: gameData.questions,
  };
};

/**
 * Save game history to storage
 */
export const saveGameHistory = (gameHistory: GameHistory): boolean => {
  try {
    // Validate game history before saving
    if (!validateGameHistory(gameHistory)) {
      throw new Error('Invalid game history data');
    }
    
    return saveDataWithFeedback(STORAGE_KEYS.GAME_HISTORY, gameHistory);
  } catch (error) {
    console.error('Failed to save game history:', error);
    return false;
  }
};

/**
 * Load game history from storage
 */
export const loadGameHistory = (): GameHistory[] => {
  try {
    const history = loadDataWithFeedback<GameHistory[]>(STORAGE_KEYS.GAME_HISTORY);
    
    if (Array.isArray(history)) {
      // Validate each game history entry
      const validHistory = history.filter(entry => validateGameHistory(entry));
      return validHistory;
    }
    
    return [];
  } catch (error) {
    console.error('Failed to load game history:', error);
    return [];
  }
};

/**
 * Get game history with fallback
 */
export const getGameHistory = (): GameHistory[] => {
  return getDataWithFallback<GameHistory[]>(STORAGE_KEYS.GAME_HISTORY, []);
};

/**
 * Check if game history exists
 */
export const hasGameHistory = (): boolean => {
  return hasData(STORAGE_KEYS.GAME_HISTORY);
};

/**
 * Add a new game to history
 */
export const addGameToHistory = (gameData: {
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
}): boolean => {
  try {
    const currentHistory = getGameHistory();
    const newGameHistory = createGameHistory(gameData);
    
    // Add new game to history (most recent first)
    const updatedHistory = [newGameHistory, ...currentHistory];
    
    // Keep only last 100 games to prevent storage bloat
    const trimmedHistory = updatedHistory.slice(0, 100);
    
    return saveDataWithFeedback(STORAGE_KEYS.GAME_HISTORY, trimmedHistory);
  } catch (error) {
    console.error('Failed to add game to history:', error);
    return false;
  }
};

/**
 * Get game history by user ID
 */
export const getGameHistoryByUserId = (userId: string): GameHistory[] => {
  const allHistory = getGameHistory();
  return allHistory.filter(game => game.userId === userId);
};

/**
 * Get game history by category
 */
export const getGameHistoryByCategory = (category: Category): GameHistory[] => {
  const allHistory = getGameHistory();
  return allHistory.filter(game => game.category === category);
};

/**
 * Get game history by difficulty
 */
export const getGameHistoryByDifficulty = (difficulty: Difficulty): GameHistory[] => {
  const allHistory = getGameHistory();
  return allHistory.filter(game => game.difficulty === difficulty);
};

/**
 * Get game history by mode
 */
export const getGameHistoryByMode = (mode: 'quick' | 'training'): GameHistory[] => {
  const allHistory = getGameHistory();
  return allHistory.filter(game => game.mode === mode);
};

/**
 * Get recent games (last N games)
 */
export const getRecentGames = (limit: number = 10): GameHistory[] => {
  const allHistory = getGameHistory();
  return allHistory.slice(0, limit);
};

/**
 * Get best games by score
 */
export const getBestGamesByScore = (limit: number = 10): GameHistory[] => {
  const allHistory = getGameHistory();
  return allHistory
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

/**
 * Get best games by accuracy
 */
export const getBestGamesByAccuracy = (limit: number = 10): GameHistory[] => {
  const allHistory = getGameHistory();
  return allHistory
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, limit);
};

/**
 * Get best games by combo
 */
export const getBestGamesByCombo = (limit: number = 10): GameHistory[] => {
  const allHistory = getGameHistory();
  return allHistory
    .sort((a, b) => b.bestCombo - a.bestCombo)
    .slice(0, limit);
};

/**
 * Get game history statistics
 */
export const getGameHistoryStatistics = () => {
  const allHistory = getGameHistory();
  
  if (allHistory.length === 0) {
    return {
      totalGames: 0,
      totalScore: 0,
      averageScore: 0,
      totalAccuracy: 0,
      averageAccuracy: 0,
      totalTimeSpent: 0,
      averageTimeSpent: 0,
      bestScore: 0,
      bestAccuracy: 0,
      bestCombo: 0,
      totalQuestionsAnswered: 0,
      totalCorrectAnswers: 0,
      totalSkips: 0,
      totalPauseTime: 0,
      categoryBreakdown: {},
      difficultyBreakdown: {},
      modeBreakdown: {},
    };
  }
  
  const totalGames = allHistory.length;
  const totalScore = allHistory.reduce((sum, game) => sum + game.score, 0);
  const averageScore = totalScore / totalGames;
  const totalAccuracy = allHistory.reduce((sum, game) => sum + game.accuracy, 0);
  const averageAccuracy = totalAccuracy / totalGames;
  const totalTimeSpent = allHistory.reduce((sum, game) => sum + game.timeSpent, 0);
  const averageTimeSpent = totalTimeSpent / totalGames;
  const bestScore = Math.max(...allHistory.map(game => game.score));
  const bestAccuracy = Math.max(...allHistory.map(game => game.accuracy));
  const bestCombo = Math.max(...allHistory.map(game => game.bestCombo));
  const totalQuestionsAnswered = allHistory.reduce((sum, game) => sum + game.questionsAnswered, 0);
  const totalCorrectAnswers = allHistory.reduce((sum, game) => sum + game.correctAnswers, 0);
  const totalSkips = allHistory.reduce((sum, game) => sum + game.questionsSkipped, 0);
  const totalPauseTime = allHistory.reduce((sum, game) => sum + game.totalPauseTime, 0);
  
  // Category breakdown
  const categoryBreakdown = allHistory.reduce((acc, game) => {
    acc[game.category] = (acc[game.category] || 0) + 1;
    return acc;
  }, {} as Record<Category, number>);
  
  // Difficulty breakdown
  const difficultyBreakdown = allHistory.reduce((acc, game) => {
    acc[game.difficulty] = (acc[game.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<Difficulty, number>);
  
  // Mode breakdown
  const modeBreakdown = allHistory.reduce((acc, game) => {
    acc[game.mode] = (acc[game.mode] || 0) + 1;
    return acc;
  }, {} as Record<'quick' | 'training', number>);
  
  return {
    totalGames,
    totalScore,
    averageScore: Math.round(averageScore * 100) / 100,
    totalAccuracy,
    averageAccuracy: Math.round(averageAccuracy * 100) / 100,
    totalTimeSpent,
    averageTimeSpent: Math.round(averageTimeSpent * 100) / 100,
    bestScore,
    bestAccuracy: Math.round(bestAccuracy * 100) / 100,
    bestCombo,
    totalQuestionsAnswered,
    totalCorrectAnswers,
    totalSkips,
    totalPauseTime,
    categoryBreakdown,
    difficultyBreakdown,
    modeBreakdown,
  };
};

/**
 * Get game history by date range
 */
export const getGameHistoryByDateRange = (startDate: number, endDate: number): GameHistory[] => {
  const allHistory = getGameHistory();
  return allHistory.filter(game => 
    game.startTime >= startDate && game.startTime <= endDate
  );
};

/**
 * Get game history by score range
 */
export const getGameHistoryByScoreRange = (minScore: number, maxScore: number): GameHistory[] => {
  const allHistory = getGameHistory();
  return allHistory.filter(game => 
    game.score >= minScore && game.score <= maxScore
  );
};

/**
 * Delete game history
 */
export const deleteGameHistory = (): boolean => {
  try {
    removeData(STORAGE_KEYS.GAME_HISTORY);
    return true;
  } catch (error) {
    console.error('Failed to delete game history:', error);
    return false;
  }
};

/**
 * Delete specific game from history
 */
export const deleteGameFromHistory = (gameId: string): boolean => {
  try {
    const currentHistory = getGameHistory();
    const updatedHistory = currentHistory.filter(game => game.id !== gameId);
    
    return saveDataWithFeedback(STORAGE_KEYS.GAME_HISTORY, updatedHistory);
  } catch (error) {
    console.error('Failed to delete game from history:', error);
    return false;
  }
};

/**
 * Clear old game history (older than specified days)
 */
export const clearOldGameHistory = (daysOld: number = 30): boolean => {
  try {
    const currentHistory = getGameHistory();
    const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    
    const updatedHistory = currentHistory.filter(game => game.startTime >= cutoffDate);
    
    return saveDataWithFeedback(STORAGE_KEYS.GAME_HISTORY, updatedHistory);
  } catch (error) {
    console.error('Failed to clear old game history:', error);
    return false;
  }
};

/**
 * Export game history
 */
export const exportGameHistory = (): string => {
  const history = getGameHistory();
  return JSON.stringify(history, null, 2);
};

/**
 * Import game history
 */
export const importGameHistory = (jsonData: string): boolean => {
  try {
    const importedHistory = JSON.parse(jsonData);
    
    if (Array.isArray(importedHistory)) {
      // Validate each game history entry
      const validHistory = importedHistory.filter(entry => validateGameHistory(entry));
      
      if (validHistory.length > 0) {
        return saveDataWithFeedback(STORAGE_KEYS.GAME_HISTORY, validHistory);
      }
    }
    
    return false;
  } catch (error) {
    console.error('Failed to import game history:', error);
    return false;
  }
};

/**
 * Clear all game history
 */
export const clearGameHistory = (): boolean => {
  try {
    return saveDataWithFeedback(STORAGE_KEYS.GAME_HISTORY, []);
  } catch (error) {
    console.error('Failed to clear game history:', error);
    return false;
  }
};

