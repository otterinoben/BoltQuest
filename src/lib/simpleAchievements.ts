/**
 * Simple Achievement System
 * Self-contained achievement management
 */

import { getGameHistoryByUserId } from './gameHistoryStorage';
import { awardCoinsForAchievement } from './coinSystem';

export interface SimpleAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number;
  requirement: number; // requirement value
  type: 'score' | 'consecutive' | 'streak' | 'mode' | 'category' | 'difficulty' | 'special' | 'stats'; // achievement type
  category?: string; // for category-specific achievements
  difficulty?: string; // for difficulty-specific achievements
  mode?: string; // for mode-specific achievements
}

const STORAGE_KEY = 'buzzbolt_simple_achievements';

// Default achievements
const DEFAULT_ACHIEVEMENTS: SimpleAchievement[] = [
  // Original Score-Based Achievements
  {
    id: 'first_score',
    name: 'First Steps',
    description: 'Score your first point',
    icon: '🎯',
    unlockedAt: 0,
    requirement: 1,
    type: 'score'
  },
  {
    id: 'getting_started',
    name: 'Getting Started',
    description: 'Score 5 points in a game',
    icon: '🚀',
    unlockedAt: 0,
    requirement: 5,
    type: 'score'
  },
  {
    id: 'on_fire',
    name: 'On Fire',
    description: 'Score 10 points in a game',
    icon: '🔥',
    unlockedAt: 0,
    requirement: 10,
    type: 'score'
  },
  {
    id: 'hot_streak',
    name: 'Hot Streak',
    description: 'Score 15 points in a game',
    icon: '⚡',
    unlockedAt: 0,
    requirement: 15,
    type: 'score'
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Score 20 points in a game',
    icon: '💪',
    unlockedAt: 0,
    requirement: 20,
    type: 'score'
  },
  {
    id: 'consistent_performer',
    name: 'Consistent Performer',
    description: 'Score 3+ points in 3 consecutive games',
    icon: '🎖️',
    unlockedAt: 0,
    requirement: 3,
    type: 'consecutive'
  },

  // New Score-Based Achievements
  {
    id: 'quick_learner',
    name: 'Quick Learner',
    description: 'Score 2+ points in your first game',
    icon: '🌱',
    unlockedAt: 0,
    requirement: 2,
    type: 'score'
  },
  {
    id: 'steady_progress',
    name: 'Steady Progress',
    description: 'Score 5+ points in 5 different games',
    icon: '📈',
    unlockedAt: 0,
    requirement: 5,
    type: 'score'
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Score 10+ points with 100% accuracy',
    icon: '⭐',
    unlockedAt: 0,
    requirement: 10,
    type: 'score'
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Score 8+ points in under 30 seconds',
    icon: '⚡',
    unlockedAt: 0,
    requirement: 8,
    type: 'score'
  },
  {
    id: 'legendary',
    name: 'Legendary',
    description: 'Score 25+ points in a single game',
    icon: '👑',
    unlockedAt: 0,
    requirement: 25,
    type: 'score'
  },

  // Streak Achievements
  {
    id: 'rising_star',
    name: 'Rising Star',
    description: 'Score 3+ points in 5 consecutive games',
    icon: '🌟',
    unlockedAt: 0,
    requirement: 5,
    type: 'streak'
  },
  {
    id: 'unbreakable',
    name: 'Unbreakable',
    description: 'Score 5+ points in 10 consecutive games',
    icon: '🛡️',
    unlockedAt: 0,
    requirement: 10,
    type: 'streak'
  },
  {
    id: 'comeback_king',
    name: 'Comeback King',
    description: 'Win a game after being 0-3 down',
    icon: '🔄',
    unlockedAt: 0,
    requirement: 1,
    type: 'streak'
  },

  // Game Mode Achievements
  {
    id: 'training_master',
    name: 'Training Master',
    description: 'Complete 10 training mode games',
    icon: '🎓',
    unlockedAt: 0,
    requirement: 10,
    type: 'mode',
    mode: 'training'
  },
  {
    id: 'quick_draw',
    name: 'Quick Draw',
    description: 'Complete 20 quick play games',
    icon: '🎯',
    unlockedAt: 0,
    requirement: 20,
    type: 'mode',
    mode: 'quick'
  },
  {
    id: 'time_master',
    name: 'Time Master',
    description: 'Complete a quick play game with 30+ seconds remaining',
    icon: '⏰',
    unlockedAt: 0,
    requirement: 30,
    type: 'mode',
    mode: 'quick'
  },
  {
    id: 'no_rush',
    name: 'No Rush',
    description: 'Complete a training mode game in under 2 minutes',
    icon: '🐌',
    unlockedAt: 0,
    requirement: 120,
    type: 'mode',
    mode: 'training'
  },

  // Category Achievements
  {
    id: 'tech_expert',
    name: 'Tech Expert',
    description: 'Score 15+ points in Technology category',
    icon: '💻',
    unlockedAt: 0,
    requirement: 15,
    type: 'category',
    category: 'tech'
  },
  {
    id: 'business_guru',
    name: 'Business Guru',
    description: 'Score 15+ points in Business category',
    icon: '💼',
    unlockedAt: 0,
    requirement: 15,
    type: 'category',
    category: 'business'
  },
  {
    id: 'marketing_pro',
    name: 'Marketing Pro',
    description: 'Score 15+ points in Marketing category',
    icon: '📢',
    unlockedAt: 0,
    requirement: 15,
    type: 'category',
    category: 'marketing'
  },
  {
    id: 'finance_wizard',
    name: 'Finance Wizard',
    description: 'Score 15+ points in Finance category',
    icon: '💰',
    unlockedAt: 0,
    requirement: 15,
    type: 'category',
    category: 'finance'
  },

  // Difficulty Achievements
  {
    id: 'hard_mode_hero',
    name: 'Hard Mode Hero',
    description: 'Score 10+ points on Hard difficulty',
    icon: '💪',
    unlockedAt: 0,
    requirement: 10,
    type: 'difficulty',
    difficulty: 'hard'
  },
  {
    id: 'category_master',
    name: 'Category Master',
    description: 'Score 10+ points in all 5 categories',
    icon: '🏆',
    unlockedAt: 0,
    requirement: 5,
    type: 'difficulty'
  },

  // Special/Fun Achievements
  {
    id: 'lucky_streak',
    name: 'Lucky Streak',
    description: 'Get 3 correct answers in a row by guessing',
    icon: '🍀',
    unlockedAt: 0,
    requirement: 3,
    type: 'special'
  },
  {
    id: 'skip_master',
    name: 'Skip Master',
    description: 'Skip 5 questions in a single game',
    icon: '⏭️',
    unlockedAt: 0,
    requirement: 5,
    type: 'special'
  },
  {
    id: 'pause_pro',
    name: 'Pause Pro',
    description: 'Pause 10 times in a single game',
    icon: '⏸️',
    unlockedAt: 0,
    requirement: 10,
    type: 'special'
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Play a game between 11 PM and 6 AM',
    icon: '🦉',
    unlockedAt: 0,
    requirement: 1,
    type: 'special'
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Play a game between 5 AM and 8 AM',
    icon: '🌅',
    unlockedAt: 0,
    requirement: 1,
    type: 'special'
  },

  // Statistics Achievements
  {
    id: 'accuracy_ace',
    name: 'Accuracy Ace',
    description: 'Achieve 90%+ accuracy in 5 games',
    icon: '🎯',
    unlockedAt: 0,
    requirement: 5,
    type: 'stats'
  },
  {
    id: 'combo_king',
    name: 'Combo King',
    description: 'Get a 10+ combo in any game',
    icon: '🔥',
    unlockedAt: 0,
    requirement: 10,
    type: 'stats'
  },
  {
    id: 'efficiency_expert',
    name: 'Efficiency Expert',
    description: 'Answer 20 questions in under 2 minutes',
    icon: '⚡',
    unlockedAt: 0,
    requirement: 20,
    type: 'stats'
  },
  {
    id: 'all_rounder',
    name: 'All-Rounder',
    description: 'Play at least 5 games in each difficulty level',
    icon: '🌐',
    unlockedAt: 0,
    requirement: 15,
    type: 'stats'
  }
];

/**
 * Get achievements from localStorage
 */
export const getAchievements = (): SimpleAchievement[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const storedAchievements = JSON.parse(stored);
      
      // Check if we need to merge with new achievements
      if (storedAchievements.length < DEFAULT_ACHIEVEMENTS.length) {
        // Merge stored achievements with new ones, preserving unlock status
        const mergedAchievements = DEFAULT_ACHIEVEMENTS.map(defaultAchievement => {
          const storedAchievement = storedAchievements.find((sa: SimpleAchievement) => sa.id === defaultAchievement.id);
          return storedAchievement ? storedAchievement : defaultAchievement;
        });
        
        // Save the merged achievements
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedAchievements));
        return mergedAchievements;
      }
      
      return storedAchievements;
    }
    // Initialize with defaults
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ACHIEVEMENTS));
    return DEFAULT_ACHIEVEMENTS;
  } catch (error) {
    console.error('Error loading achievements:', error);
    return DEFAULT_ACHIEVEMENTS;
  }
};

/**
 * Save achievements to localStorage
 */
export const saveAchievements = (achievements: SimpleAchievement[]): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
    return true;
  } catch (error) {
    console.error('Error saving achievements:', error);
    return false;
  }
};

/**
 * Force refresh achievements with latest defaults
 */
export const refreshAchievements = (): SimpleAchievement[] => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ACHIEVEMENTS));
    return DEFAULT_ACHIEVEMENTS;
  } catch (error) {
    console.error('Error refreshing achievements:', error);
    return DEFAULT_ACHIEVEMENTS;
  }
};

/**
 * Check consecutive games with 3+ score
 */
export const checkConsecutiveGames = (userId: string): number => {
  try {
    // Import game history functions
    const userGames = getGameHistoryByUserId(userId);
    
    if (userGames.length < 3) {
      return 0;
    }
    
    // Get the 3 most recent games
    const recentGames = userGames.slice(0, 3);
    
    // Check if all 3 games have 3+ score
    const allHaveThreePlus = recentGames.every(game => game.score >= 3);
    
    return allHaveThreePlus ? 3 : 0;
  } catch (error) {
    console.error('Error checking consecutive games:', error);
    return 0;
  }
};

/**
 * Check streak achievements (consecutive games with certain scores)
 */
export const checkStreakAchievements = (userId: string, minScore: number, requiredGames: number): boolean => {
  try {
    const userGames = getGameHistoryByUserId(userId);
    
    if (userGames.length < requiredGames) {
      return false;
    }
    
    // Get the most recent games
    const recentGames = userGames.slice(0, requiredGames);
    
    // Check if all games have the minimum score
    return recentGames.every(game => game.score >= minScore);
  } catch (error) {
    console.error('Error checking streak achievements:', error);
    return false;
  }
};

/**
 * Check mode-specific achievements
 */
export const checkModeAchievements = (userId: string, mode: string, requirement: number): boolean => {
  try {
    const userGames = getGameHistoryByUserId(userId);
    
    if (mode === 'quick') {
      // For quick mode, check if any game was completed with time remaining
      return userGames.some(game => 
        game.mode === 'quick' && 
        game.timeRemaining && 
        game.timeRemaining >= requirement
      );
    } else if (mode === 'training') {
      // For training mode, check if any game was completed quickly
      return userGames.some(game => 
        game.mode === 'training' && 
        game.duration && 
        game.duration <= requirement
      );
    }
    
    return false;
  } catch (error) {
    console.error('Error checking mode achievements:', error);
    return false;
  }
};

/**
 * Check category-specific achievements
 */
export const checkCategoryAchievements = (userId: string, category: string, minScore: number): boolean => {
  try {
    const userGames = getGameHistoryByUserId(userId);
    
    return userGames.some(game => 
      game.category === category && 
      game.score >= minScore
    );
  } catch (error) {
    console.error('Error checking category achievements:', error);
    return false;
  }
};

/**
 * Check difficulty-specific achievements
 */
export const checkDifficultyAchievements = (userId: string, difficulty: string, minScore: number): boolean => {
  try {
    const userGames = getGameHistoryByUserId(userId);
    
    return userGames.some(game => 
      game.difficulty === difficulty && 
      game.score >= minScore
    );
  } catch (error) {
    console.error('Error checking difficulty achievements:', error);
    return false;
  }
};

/**
 * Check special achievements (time-based, skip count, etc.)
 */
export const checkSpecialAchievements = (achievementId: string, gameData: any): boolean => {
  try {
    switch (achievementId) {
      case 'night_owl':
      case 'early_bird':
        const hour = new Date().getHours();
        if (achievementId === 'night_owl') {
          return hour >= 23 || hour < 6; // 11 PM to 6 AM
        } else {
          return hour >= 5 && hour < 8; // 5 AM to 8 AM
        }
      
      case 'skip_master':
        return gameData.skipCount >= 5;
      
      case 'pause_pro':
        return gameData.pauseCount >= 10;
      
      case 'lucky_streak':
        return gameData.luckyStreak >= 3;
      
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking special achievements:', error);
    return false;
  }
};

/**
 * Check statistics achievements
 */
export const checkStatsAchievements = (userId: string, achievementId: string): boolean => {
  try {
    const userGames = getGameHistoryByUserId(userId);
    
    switch (achievementId) {
      case 'accuracy_ace':
        const highAccuracyGames = userGames.filter(game => 
          game.accuracy && game.accuracy >= 90
        );
        return highAccuracyGames.length >= 5;
      
      case 'combo_king':
        return userGames.some(game => 
          game.maxCombo && game.maxCombo >= 10
        );
      
      case 'efficiency_expert':
        return userGames.some(game => 
          game.questionsAnswered >= 20 && 
          game.duration && 
          game.duration <= 120
        );
      
      case 'all_rounder':
        const easyGames = userGames.filter(g => g.difficulty === 'easy').length;
        const mediumGames = userGames.filter(g => g.difficulty === 'medium').length;
        const hardGames = userGames.filter(g => g.difficulty === 'hard').length;
        return easyGames >= 5 && mediumGames >= 5 && hardGames >= 5;
      
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking stats achievements:', error);
    return false;
  }
};

/**
 * Check and unlock achievements based on game data
 */
export const checkAchievements = (
  score: number, 
  userId?: string, 
  gameData?: {
    category?: string;
    difficulty?: string;
    mode?: string;
    accuracy?: number;
    timeRemaining?: number;
    duration?: number;
    skipCount?: number;
    pauseCount?: number;
    luckyStreak?: number;
    maxCombo?: number;
    questionsAnswered?: number;
  }
): SimpleAchievement[] => {
  const achievements = getAchievements();
  const newlyUnlocked: SimpleAchievement[] = [];

  for (const achievement of achievements) {
    if (achievement.unlockedAt === 0) {
      let shouldUnlock = false;
      
      switch (achievement.type) {
        case 'score':
          if (score >= achievement.requirement) {
            shouldUnlock = true;
          }
          break;
          
        case 'consecutive':
          if (userId) {
            const consecutiveCount = checkConsecutiveGames(userId);
            if (consecutiveCount >= achievement.requirement) {
              shouldUnlock = true;
            }
          }
          break;
          
        case 'streak':
          if (userId && achievement.id === 'rising_star') {
            shouldUnlock = checkStreakAchievements(userId, 3, 5);
          } else if (userId && achievement.id === 'unbreakable') {
            shouldUnlock = checkStreakAchievements(userId, 5, 10);
          } else if (achievement.id === 'comeback_king' && gameData) {
            // This would need to be tracked during the game
            shouldUnlock = false; // Placeholder
          }
          break;
          
        case 'mode':
          if (userId && achievement.mode && gameData) {
            shouldUnlock = checkModeAchievements(userId, achievement.mode, achievement.requirement);
          }
          break;
          
        case 'category':
          if (userId && achievement.category) {
            shouldUnlock = checkCategoryAchievements(userId, achievement.category, achievement.requirement);
          }
          break;
          
        case 'difficulty':
          if (userId && achievement.difficulty) {
            shouldUnlock = checkDifficultyAchievements(userId, achievement.difficulty, achievement.requirement);
          } else if (achievement.id === 'category_master') {
            // Check if user has scored 10+ in all categories
            const categories = ['tech', 'business', 'marketing', 'finance', 'general'];
            shouldUnlock = categories.every(cat => 
              checkCategoryAchievements(userId!, cat, 10)
            );
          }
          break;
          
        case 'special':
          if (gameData) {
            shouldUnlock = checkSpecialAchievements(achievement.id, gameData);
          }
          break;
          
        case 'stats':
          if (userId) {
            shouldUnlock = checkStatsAchievements(userId, achievement.id);
          }
          break;
      }
      
      if (shouldUnlock) {
        achievement.unlockedAt = Date.now();
        
        // Award coins for achievement unlock
        const difficulty = achievement.id.includes('easy') ? 'easy' : 
                          achievement.id.includes('hard') ? 'hard' : 'medium';
        awardCoinsForAchievement(achievement.id, difficulty);
        
        newlyUnlocked.push(achievement);
      }
    }
  }

  if (newlyUnlocked.length > 0) {
    saveAchievements(achievements);
  }

  return newlyUnlocked;
};

/**
 * Get achievement progress for a specific achievement
 */
export const getAchievementProgress = (achievement: SimpleAchievement, userId?: string): { current: number; total: number; percentage: number } => {
  if (achievement.unlockedAt > 0) {
    return { current: achievement.requirement, total: achievement.requirement, percentage: 100 };
  }

  if (!userId) {
    return { current: 0, total: achievement.requirement, percentage: 0 };
  }

  try {
    const userGames = getGameHistoryByUserId(userId);

    switch (achievement.type) {
      case 'score':
        // For score achievements, find the highest score achieved
        const maxScore = Math.max(...userGames.map(game => game.score), 0);
        return {
          current: Math.min(maxScore, achievement.requirement),
          total: achievement.requirement,
          percentage: Math.round((Math.min(maxScore, achievement.requirement) / achievement.requirement) * 100)
        };

      case 'consecutive':
        const consecutiveCount = checkConsecutiveGames(userId);
        return {
          current: Math.min(consecutiveCount, achievement.requirement),
          total: achievement.requirement,
          percentage: Math.round((Math.min(consecutiveCount, achievement.requirement) / achievement.requirement) * 100)
        };

      case 'streak':
        if (achievement.id === 'rising_star') {
          const risingStarProgress = checkStreakAchievements(userId, 3, 5) ? 5 : 0;
          return {
            current: risingStarProgress,
            total: achievement.requirement,
            percentage: Math.round((risingStarProgress / achievement.requirement) * 100)
          };
        } else if (achievement.id === 'unbreakable') {
          const unbreakableProgress = checkStreakAchievements(userId, 5, 10) ? 10 : 0;
          return {
            current: unbreakableProgress,
            total: achievement.requirement,
            percentage: Math.round((unbreakableProgress / achievement.requirement) * 100)
          };
        }
        break;

      case 'mode':
        if (achievement.mode === 'quick') {
          const quickGames = userGames.filter(game => game.mode === 'quick').length;
          return {
            current: Math.min(quickGames, achievement.requirement),
            total: achievement.requirement,
            percentage: Math.round((Math.min(quickGames, achievement.requirement) / achievement.requirement) * 100)
          };
        } else if (achievement.mode === 'training') {
          const trainingGames = userGames.filter(game => game.mode === 'training').length;
          return {
            current: Math.min(trainingGames, achievement.requirement),
            total: achievement.requirement,
            percentage: Math.round((Math.min(trainingGames, achievement.requirement) / achievement.requirement) * 100)
          };
        }
        break;

      case 'category':
        if (achievement.category) {
          const categoryGames = userGames.filter(game => game.category === achievement.category);
          const maxCategoryScore = Math.max(...categoryGames.map(game => game.score), 0);
          return {
            current: Math.min(maxCategoryScore, achievement.requirement),
            total: achievement.requirement,
            percentage: Math.round((Math.min(maxCategoryScore, achievement.requirement) / achievement.requirement) * 100)
          };
        }
        break;

      case 'difficulty':
        if (achievement.difficulty) {
          const difficultyGames = userGames.filter(game => game.difficulty === achievement.difficulty);
          const maxDifficultyScore = Math.max(...difficultyGames.map(game => game.score), 0);
          return {
            current: Math.min(maxDifficultyScore, achievement.requirement),
            total: achievement.requirement,
            percentage: Math.round((Math.min(maxDifficultyScore, achievement.requirement) / achievement.requirement) * 100)
          };
        } else if (achievement.id === 'category_master') {
          const categories = ['tech', 'business', 'marketing', 'finance', 'general'];
          const masteredCategories = categories.filter(cat => 
            checkCategoryAchievements(userId, cat, 10)
          ).length;
          return {
            current: masteredCategories,
            total: achievement.requirement,
            percentage: Math.round((masteredCategories / achievement.requirement) * 100)
          };
        }
        break;

      case 'stats':
        if (achievement.id === 'accuracy_ace') {
          const highAccuracyGames = userGames.filter(game => 
            game.accuracy && game.accuracy >= 90
          ).length;
          return {
            current: Math.min(highAccuracyGames, achievement.requirement),
            total: achievement.requirement,
            percentage: Math.round((Math.min(highAccuracyGames, achievement.requirement) / achievement.requirement) * 100)
          };
        } else if (achievement.id === 'all_rounder') {
          const easyGames = userGames.filter(g => g.difficulty === 'easy').length;
          const mediumGames = userGames.filter(g => g.difficulty === 'medium').length;
          const hardGames = userGames.filter(g => g.difficulty === 'hard').length;
          const completedDifficulties = [easyGames >= 5, mediumGames >= 5, hardGames >= 5].filter(Boolean).length;
          return {
            current: completedDifficulties * 5, // Each difficulty counts as 5
            total: achievement.requirement,
            percentage: Math.round((completedDifficulties / 3) * 100)
          };
        }
        break;
    }

    return { current: 0, total: achievement.requirement, percentage: 0 };
  } catch (error) {
    console.error('Error getting achievement progress:', error);
    return { current: 0, total: achievement.requirement, percentage: 0 };
  }
};

/**
 * Get achievement stats
 */
export const getAchievementStats = () => {
  const achievements = getAchievements();
  const unlocked = achievements.filter(a => a.unlockedAt > 0);
  
  return {
    total: achievements.length,
    unlocked: unlocked.length,
    locked: achievements.length - unlocked.length,
    progressPercentage: Math.round((unlocked.length / achievements.length) * 100)
  };
};

/**
 * Get unlocked achievements
 */
export const getUnlockedAchievements = (): SimpleAchievement[] => {
  return getAchievements().filter(a => a.unlockedAt > 0);
};

/**
 * Get locked achievements
 */
export const getLockedAchievements = (): SimpleAchievement[] => {
  return getAchievements().filter(a => a.unlockedAt === 0);
};

/**
 * Get consecutive game stats for a user
 */
export const getConsecutiveGameStats = (userId: string) => {
  try {
    const userGames = getGameHistoryByUserId(userId);
    
    if (userGames.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        gamesWithThreePlus: 0,
        totalGames: 0
      };
    }
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let gamesWithThreePlus = 0;
    
    // Count games with 3+ score
    userGames.forEach(game => {
      if (game.score >= 3) {
        gamesWithThreePlus++;
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });
    
    // Calculate current streak (from most recent games)
    for (let i = 0; i < userGames.length; i++) {
      if (userGames[i].score >= 3) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return {
      currentStreak,
      longestStreak,
      gamesWithThreePlus,
      totalGames: userGames.length
    };
  } catch (error) {
    console.error('Error getting consecutive game stats:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      gamesWithThreePlus: 0,
      totalGames: 0
    };
  }
};
