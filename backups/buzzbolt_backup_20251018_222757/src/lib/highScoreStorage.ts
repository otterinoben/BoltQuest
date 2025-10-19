import { 
  HighScore, 
  STORAGE_KEYS,
  validateHighScore
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
 * High Scores Storage Functions
 * Handles all high score data persistence operations
 */

/**
 * Generate a unique high score ID
 */
export const generateHighScoreId = (): string => {
  return `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create a new high score entry
 */
export const createHighScore = (scoreData: {
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
}): HighScore => {
  const scoreId = generateHighScoreId();
  
  return {
    id: scoreId,
    userId: scoreData.userId,
    category: scoreData.category,
    difficulty: scoreData.difficulty,
    mode: scoreData.mode,
    score: scoreData.score,
    accuracy: scoreData.accuracy,
    timeSpent: scoreData.timeSpent,
    questionsAnswered: scoreData.questionsAnswered,
    bestCombo: scoreData.bestCombo,
    questionsSkipped: scoreData.questionsSkipped,
    skipEfficiency: scoreData.skipEfficiency,
    achievedAt: scoreData.achievedAt,
    gameId: scoreData.gameId,
  };
};

/**
 * Save high scores to storage
 */
export const saveHighScores = (highScores: HighScore[]): boolean => {
  try {
    // Validate each high score before saving
    const validScores = highScores.filter(score => validateHighScore(score));
    
    return saveDataWithFeedback(STORAGE_KEYS.HIGH_SCORES, validScores);
  } catch (error) {
    console.error('Failed to save high scores:', error);
    return false;
  }
};

/**
 * Load high scores from storage
 */
export const loadHighScores = (): HighScore[] => {
  try {
    const scores = loadDataWithFeedback<HighScore[]>(STORAGE_KEYS.HIGH_SCORES);
    
    if (Array.isArray(scores)) {
      // Validate each high score entry
      const validScores = scores.filter(score => validateHighScore(score));
      return validScores;
    }
    
    return [];
  } catch (error) {
    console.error('Failed to load high scores:', error);
    return [];
  }
};

/**
 * Get high scores with fallback
 */
export const getHighScores = (): HighScore[] => {
  return getDataWithFallback<HighScore[]>(STORAGE_KEYS.HIGH_SCORES, []);
};

/**
 * Check if high scores exist
 */
export const hasHighScores = (): boolean => {
  return hasData(STORAGE_KEYS.HIGH_SCORES);
};

/**
 * Add a new high score
 */
export const addHighScore = (scoreData: {
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
}): boolean => {
  try {
    const currentScores = getHighScores();
    const newHighScore = createHighScore(scoreData);
    
    // Add new score to list
    const updatedScores = [...currentScores, newHighScore];
    
    // Sort by score (highest first)
    updatedScores.sort((a, b) => b.score - a.score);
    
    // Keep only top 100 scores to prevent storage bloat
    const trimmedScores = updatedScores.slice(0, 100);
    
    return saveHighScores(trimmedScores);
  } catch (error) {
    console.error('Failed to add high score:', error);
    return false;
  }
};

/**
 * Get high scores by user ID
 */
export const getHighScoresByUserId = (userId: string): HighScore[] => {
  const allScores = getHighScores();
  return allScores.filter(score => score.userId === userId);
};

/**
 * Get high scores by category
 */
export const getHighScoresByCategory = (category: Category): HighScore[] => {
  const allScores = getHighScores();
  return allScores.filter(score => score.category === category);
};

/**
 * Get high scores by difficulty
 */
export const getHighScoresByDifficulty = (difficulty: Difficulty): HighScore[] => {
  const allScores = getHighScores();
  return allScores.filter(score => score.difficulty === difficulty);
};

/**
 * Get high scores by mode
 */
export const getHighScoresByMode = (mode: 'quick' | 'training'): HighScore[] => {
  const allScores = getHighScores();
  return allScores.filter(score => score.mode === mode);
};

/**
 * Get top N high scores
 */
export const getTopHighScores = (limit: number = 10): HighScore[] => {
  const allScores = getHighScores();
  return allScores.slice(0, limit);
};

/**
 * Get top N high scores by category
 */
export const getTopHighScoresByCategory = (category: Category, limit: number = 10): HighScore[] => {
  const categoryScores = getHighScoresByCategory(category);
  return categoryScores.slice(0, limit);
};

/**
 * Get top N high scores by difficulty
 */
export const getTopHighScoresByDifficulty = (difficulty: Difficulty, limit: number = 10): HighScore[] => {
  const difficultyScores = getHighScoresByDifficulty(difficulty);
  return difficultyScores.slice(0, limit);
};

/**
 * Get top N high scores by mode
 */
export const getTopHighScoresByMode = (mode: 'quick' | 'training', limit: number = 10): HighScore[] => {
  const modeScores = getHighScoresByMode(mode);
  return modeScores.slice(0, limit);
};

/**
 * Get personal best score
 */
export const getPersonalBestScore = (userId: string): HighScore | null => {
  const userScores = getHighScoresByUserId(userId);
  return userScores.length > 0 ? userScores[0] : null;
};

/**
 * Get personal best score by category
 */
export const getPersonalBestScoreByCategory = (userId: string, category: Category): HighScore | null => {
  const userScores = getHighScoresByUserId(userId);
  const categoryScores = userScores.filter(score => score.category === category);
  return categoryScores.length > 0 ? categoryScores[0] : null;
};

/**
 * Get personal best score by difficulty
 */
export const getPersonalBestScoreByDifficulty = (userId: string, difficulty: Difficulty): HighScore | null => {
  const userScores = getHighScoresByUserId(userId);
  const difficultyScores = userScores.filter(score => score.difficulty === difficulty);
  return difficultyScores.length > 0 ? difficultyScores[0] : null;
};

/**
 * Get personal best score by mode
 */
export const getPersonalBestScoreByMode = (userId: string, mode: 'quick' | 'training'): HighScore | null => {
  const userScores = getHighScoresByUserId(userId);
  const modeScores = userScores.filter(score => score.mode === mode);
  return modeScores.length > 0 ? modeScores[0] : null;
};

/**
 * Check if score is a personal best
 */
export const isPersonalBest = (userId: string, score: number, category: Category, difficulty: Difficulty, mode: 'quick' | 'training'): boolean => {
  const userScores = getHighScoresByUserId(userId);
  
  // Find existing high score for this specific combination
  const existingScore = userScores.find(score => 
    score.category === category && 
    score.difficulty === difficulty && 
    score.mode === mode
  );
  
  if (!existingScore) {
    return true; // First score for this combination is always a personal best
  }
  
  return score > existingScore.score;
};

/**
 * Get high score statistics
 */
export const getHighScoreStatistics = () => {
  const allScores = getHighScores();
  
  if (allScores.length === 0) {
    return {
      totalScores: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      totalUsers: 0,
      categoryBreakdown: {},
      difficultyBreakdown: {},
      modeBreakdown: {},
    };
  }
  
  const totalScores = allScores.length;
  const totalScore = allScores.reduce((sum, score) => sum + score.score, 0);
  const averageScore = totalScore / totalScores;
  const highestScore = Math.max(...allScores.map(score => score.score));
  const lowestScore = Math.min(...allScores.map(score => score.score));
  
  // Count unique users
  const uniqueUsers = new Set(allScores.map(score => score.userId));
  const totalUsers = uniqueUsers.size;
  
  // Category breakdown
  const categoryBreakdown = allScores.reduce((acc, score) => {
    acc[score.category] = (acc[score.category] || 0) + 1;
    return acc;
  }, {} as Record<Category, number>);
  
  // Difficulty breakdown
  const difficultyBreakdown = allScores.reduce((acc, score) => {
    acc[score.difficulty] = (acc[score.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<Difficulty, number>);
  
  // Mode breakdown
  const modeBreakdown = allScores.reduce((acc, score) => {
    acc[score.mode] = (acc[score.mode] || 0) + 1;
    return acc;
  }, {} as Record<'quick' | 'training', number>);
  
  return {
    totalScores,
    averageScore: Math.round(averageScore * 100) / 100,
    highestScore,
    lowestScore,
    totalUsers,
    categoryBreakdown,
    difficultyBreakdown,
    modeBreakdown,
  };
};

/**
 * Get high scores by date range
 */
export const getHighScoresByDateRange = (startDate: number, endDate: number): HighScore[] => {
  const allScores = getHighScores();
  return allScores.filter(score => 
    score.achievedAt >= startDate && score.achievedAt <= endDate
  );
};

/**
 * Get high scores by score range
 */
export const getHighScoresByScoreRange = (minScore: number, maxScore: number): HighScore[] => {
  const allScores = getHighScores();
  return allScores.filter(score => 
    score.score >= minScore && score.score <= maxScore
  );
};

/**
 * Delete high scores
 */
export const deleteHighScores = (): boolean => {
  try {
    removeData(STORAGE_KEYS.HIGH_SCORES);
    return true;
  } catch (error) {
    console.error('Failed to delete high scores:', error);
    return false;
  }
};

/**
 * Delete specific high score
 */
export const deleteHighScore = (scoreId: string): boolean => {
  try {
    const currentScores = getHighScores();
    const updatedScores = currentScores.filter(score => score.id !== scoreId);
    
    return saveHighScores(updatedScores);
  } catch (error) {
    console.error('Failed to delete high score:', error);
    return false;
  }
};

/**
 * Clear old high scores (older than specified days)
 */
export const clearOldHighScores = (daysOld: number = 90): boolean => {
  try {
    const currentScores = getHighScores();
    const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    
    const updatedScores = currentScores.filter(score => score.achievedAt >= cutoffDate);
    
    return saveHighScores(updatedScores);
  } catch (error) {
    console.error('Failed to clear old high scores:', error);
    return false;
  }
};

/**
 * Clear all high scores
 */
export const clearAllHighScores = (): boolean => {
  try {
    return saveHighScores([]);
  } catch (error) {
    console.error('Failed to clear all high scores:', error);
    return false;
  }
};

/**
 * Export high scores
 */
export const exportHighScores = (): string => {
  const scores = getHighScores();
  return JSON.stringify(scores, null, 2);
};

/**
 * Import high scores
 */
export const importHighScores = (jsonData: string): boolean => {
  try {
    const importedScores = JSON.parse(jsonData);
    
    if (Array.isArray(importedScores)) {
      // Validate each high score entry
      const validScores = importedScores.filter(score => validateHighScore(score));
      
      if (validScores.length > 0) {
        return saveHighScores(validScores);
      }
    }
    
    return false;
  } catch (error) {
    console.error('Failed to import high scores:', error);
    return false;
  }
};

/**
 * Update high score rank
 */
export const updateHighScoreRank = (): boolean => {
  try {
    const currentScores = getHighScores();
    
    // Sort by score (highest first) and update ranks
    const sortedScores = currentScores.sort((a, b) => b.score - a.score);
    const rankedScores = sortedScores.map((score, index) => ({
      ...score,
      rank: index + 1,
    }));
    
    return saveHighScores(rankedScores);
  } catch (error) {
    console.error('Failed to update high score rank:', error);
    return false;
  }
};
