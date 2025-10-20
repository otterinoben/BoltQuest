// src/lib/userPreferences.ts
import { getUserProfile, saveUserProfile } from './userStorage';
import { getGameHistoryByUserId } from './gameHistoryStorage';
import { EloSystem } from './eloSystem';

export interface UserPreferences {
  defaultCategories: string[];
  defaultDifficulty: string;
  defaultMode: 'quick' | 'training' | 'classic';
  defaultTimer: number;
  lastUsedSettings: {
    categories: string[];
    difficulty: string;
    mode: 'quick' | 'training' | 'classic';
    timer: number;
  };
  smartDefaults: {
    enabled: boolean;
    timeBasedSuggestions: boolean;
    performanceBasedSuggestions: boolean;
    goalBasedSuggestions: boolean;
  };
  // Enhanced tracking for smart recommendations
  categoryStats: {
    [category: string]: {
      gamesPlayed: number;
      totalScore: number;
      averageAccuracy: number;
      lastPlayed: string;
      streak: number;
      preference: number; // 0-1 scale, higher = more preferred
    };
  };
  difficultyStats: {
    [difficulty: string]: {
      gamesPlayed: number;
      averageScore: number;
      averageAccuracy: number;
      preference: number;
    };
  };
  timePatterns: {
    [hour: string]: {
      categories: string[];
      difficulty: string;
      mode: string;
      count: number;
    };
  };
}

export interface SmartRecommendation {
  type: 'time' | 'performance' | 'goal' | 'streak' | 'default';
  category: string;
  categories?: string[]; // Optional for backward compatibility - supports multi-category selection
  difficulty: string;
  mode: 'quick' | 'training' | 'classic';
  timer: number;
  reason: string;
  confidence: number;
}

export class UserPreferencesManager {
  private static instance: UserPreferencesManager;
  private preferences: UserPreferences;

  static getInstance(): UserPreferencesManager {
    if (!UserPreferencesManager.instance) {
      UserPreferencesManager.instance = new UserPreferencesManager();
    }
    return UserPreferencesManager.instance;
  }

  constructor() {
    this.preferences = this.loadPreferences();
  }

  // Load preferences from user profile
  private loadPreferences(): UserPreferences {
    const userProfile = getUserProfile();
    const defaultPrefs = this.getDefaultPreferences();
    
    if (!userProfile.preferences) {
      return defaultPrefs;
    }
    
    // Merge with defaults to ensure all properties exist
    return {
      ...defaultPrefs,
      ...userProfile.preferences,
      smartDefaults: {
        ...defaultPrefs.smartDefaults,
        ...userProfile.preferences.smartDefaults
      },
      lastUsedSettings: {
        ...defaultPrefs.lastUsedSettings,
        ...userProfile.preferences.lastUsedSettings
      }
    };
  }

  // Get default preferences
  private getDefaultPreferences(): UserPreferences {
    return {
      defaultCategories: ['tech'],
      defaultDifficulty: 'medium',
      defaultMode: 'classic',
      defaultTimer: 45,
      lastUsedSettings: {
        categories: ['tech'],
        difficulty: 'medium',
        mode: 'classic',
        timer: 45,
      },
      smartDefaults: {
        enabled: true,
        timeBasedSuggestions: true,
        performanceBasedSuggestions: true,
        goalBasedSuggestions: true,
      },
      categoryStats: {},
      difficultyStats: {},
      timePatterns: {},
    };
  }

  // Save preferences to user profile
  savePreferences(): void {
    const userProfile = getUserProfile();
    userProfile.preferences = this.preferences;
    saveUserProfile(userProfile);
  }

  // Update last used settings
  updateLastUsedSettings(settings: Partial<UserPreferences['lastUsedSettings']>): void {
    this.preferences.lastUsedSettings = {
      ...this.preferences.lastUsedSettings,
      ...settings,
    };
    this.savePreferences();
  }

  // Get smart recommendation based on current context
  getSmartRecommendation(): SmartRecommendation {
    const userProfile = getUserProfile();
    const gameHistory = getGameHistoryByUserId(userProfile.id);
    const eloSystem = new EloSystem();
    const eloRating = eloSystem.getEloStats();
    const currentHour = new Date().getHours();

    // Time-based recommendations
    if (this.preferences.smartDefaults.timeBasedSuggestions) {
      const timeRecommendation = this.getTimeBasedRecommendation(currentHour);
      if (timeRecommendation) return timeRecommendation;
    }

    // Performance-based recommendations
    if (this.preferences.smartDefaults.performanceBasedSuggestions) {
      const performanceRecommendation = this.getPerformanceBasedRecommendation(gameHistory, eloRating);
      if (performanceRecommendation) return performanceRecommendation;
    }

    // Goal-based recommendations
    if (this.preferences.smartDefaults.goalBasedSuggestions) {
      const goalRecommendation = this.getGoalBasedRecommendation(userProfile);
      if (goalRecommendation) return goalRecommendation;
    }

    // Default recommendation
    return {
      type: 'default',
      category: this.preferences.lastUsedSettings.categories[0] || 'tech',
      difficulty: this.preferences.lastUsedSettings.difficulty || 'medium',
      mode: this.preferences.lastUsedSettings.mode || 'classic',
      timer: this.preferences.lastUsedSettings.timer || 45,
      reason: 'Based on your last settings',
      confidence: 0.5,
    };
  }

  // Get time-based recommendation
  private getTimeBasedRecommendation(hour: number): SmartRecommendation | null {
    if (hour >= 6 && hour < 9) {
      // Morning - quick games
      return {
        type: 'time',
        category: 'tech',
        difficulty: 'easy',
        mode: 'classic',
        timer: 30,
        reason: 'Good morning! Start with a quick tech challenge',
        confidence: 0.8,
      };
    } else if (hour >= 9 && hour < 12) {
      // Late morning - focused learning
      return {
        type: 'time',
        category: 'business',
        difficulty: 'medium',
        mode: 'classic',
        timer: 45,
        reason: 'Perfect time for focused learning',
        confidence: 0.7,
      };
    } else if (hour >= 12 && hour < 14) {
      // Lunch break - quick games
      return {
        type: 'time',
        category: 'general',
        difficulty: 'easy',
        mode: 'classic',
        timer: 30,
        reason: 'Lunch break? Perfect for a quick game',
        confidence: 0.9,
      };
    } else if (hour >= 14 && hour < 17) {
      // Afternoon - challenging games
      return {
        type: 'time',
        category: 'finance',
        difficulty: 'hard',
        mode: 'classic',
        timer: 60,
        reason: 'Afternoon energy peak - time for a challenge',
        confidence: 0.8,
      };
    } else if (hour >= 17 && hour < 20) {
      // Evening - training mode
      return {
        type: 'time',
        category: 'marketing',
        difficulty: 'medium',
        mode: 'training',
        timer: 45,
        reason: 'Evening wind-down with training mode',
        confidence: 0.7,
      };
    } else {
      // Night - easy games
      return {
        type: 'time',
        category: 'general',
        difficulty: 'easy',
        mode: 'classic',
        timer: 30,
        reason: 'Late night? Keep it light and easy',
        confidence: 0.6,
      };
    }
  }

  // Get performance-based recommendation
  private getPerformanceBasedRecommendation(gameHistory: any[], eloRating: any): SmartRecommendation | null {
    if (gameHistory.length === 0) return null;

    const recentGames = gameHistory.slice(0, 5);
    const avgAccuracy = recentGames.reduce((sum, game) => 
      sum + (game.correctAnswers / game.questionsAnswered), 0) / recentGames.length;

    if (avgAccuracy > 0.8) {
      // High accuracy - suggest harder difficulty
      return {
        type: 'performance',
        category: recentGames[0].category,
        difficulty: 'hard',
        mode: 'classic',
        timer: 60,
        reason: 'You\'re doing great! Try a harder challenge',
        confidence: 0.9,
      };
    } else if (avgAccuracy < 0.6) {
      // Low accuracy - suggest easier difficulty
      return {
        type: 'performance',
        category: recentGames[0].category,
        difficulty: 'easy',
        mode: 'training',
        timer: 45,
        reason: 'Practice more to improve your accuracy',
        confidence: 0.8,
      };
    }

    return null;
  }

  // Get goal-based recommendation
  private getGoalBasedRecommendation(userProfile: any): SmartRecommendation | null {
    const level = userProfile.level || 1;
    const streak = userProfile.streak || 0;

    // Streak-based recommendations
    if (streak === 0) {
      return {
        type: 'streak',
        category: 'tech',
        difficulty: 'easy',
        mode: 'classic',
        timer: 30,
        reason: 'Start your daily streak with an easy win',
        confidence: 0.9,
      };
    } else if (streak >= 7) {
      return {
        type: 'streak',
        category: 'business',
        difficulty: 'hard',
        mode: 'classic',
        timer: 60,
        reason: 'Amazing streak! You\'re ready for a challenge',
        confidence: 0.8,
      };
    }

    // Level-based recommendations
    if (level < 10) {
      return {
        type: 'goal',
        category: 'tech',
        difficulty: 'medium',
        mode: 'classic',
        timer: 45,
        reason: 'Focus on consistent progress to reach Level 10',
        confidence: 0.7,
      };
    } else if (level >= 50) {
      return {
        type: 'goal',
        category: 'finance',
        difficulty: 'hard',
        mode: 'classic',
        timer: 60,
        reason: 'You\'re a pro! Time for expert-level challenges',
        confidence: 0.8,
      };
    }

    return null;
  }

  // Get quick start settings (for one-click actions)
  getQuickStartSettings(): UserPreferences['lastUsedSettings'] {
    return this.preferences.lastUsedSettings;
  }

  // Update smart defaults settings
  updateSmartDefaults(settings: Partial<UserPreferences['smartDefaults']>): void {
    this.preferences.smartDefaults = {
      ...this.preferences.smartDefaults,
      ...settings,
    };
    this.savePreferences();
  }

  // Get user preferences
  getPreferences(): UserPreferences {
    return this.preferences;
  }

  // Track user game completion and update preferences
  trackGameCompletion(gameData: {
    categories: string[];
    difficulty: string;
    mode: string;
    score: number;
    accuracy: number;
    timeSpent: number;
  }): void {
    try {
      const userProfile = getUserProfile();
      if (!userProfile) return;

      const preferences = userProfile.preferences || this.getDefaultPreferences();
      const currentHour = new Date().getHours().toString();

      // Update category stats
      gameData.categories.forEach(category => {
        if (!preferences.categoryStats[category]) {
          preferences.categoryStats[category] = {
            gamesPlayed: 0,
            totalScore: 0,
            averageAccuracy: 0,
            lastPlayed: new Date().toISOString(),
            streak: 0,
            preference: 0.5
          };
        }

        const stats = preferences.categoryStats[category];
        stats.gamesPlayed += 1;
        stats.totalScore += gameData.score;
        stats.averageAccuracy = (stats.averageAccuracy * (stats.gamesPlayed - 1) + gameData.accuracy) / stats.gamesPlayed;
        stats.lastPlayed = new Date().toISOString();
        
        // Update preference based on performance
        const performanceScore = (gameData.accuracy / 100) * (gameData.score / 1000);
        stats.preference = Math.min(1, stats.preference + (performanceScore * 0.1));
      });

      // Update difficulty stats
      if (!preferences.difficultyStats[gameData.difficulty]) {
        preferences.difficultyStats[gameData.difficulty] = {
          gamesPlayed: 0,
          averageScore: 0,
          averageAccuracy: 0,
          preference: 0.5
        };
      }

      const diffStats = preferences.difficultyStats[gameData.difficulty];
      diffStats.gamesPlayed += 1;
      diffStats.averageScore = (diffStats.averageScore * (diffStats.gamesPlayed - 1) + gameData.score) / diffStats.gamesPlayed;
      diffStats.averageAccuracy = (diffStats.averageAccuracy * (diffStats.gamesPlayed - 1) + gameData.accuracy) / diffStats.gamesPlayed;

      // Update time patterns
      if (!preferences.timePatterns[currentHour]) {
        preferences.timePatterns[currentHour] = {
          categories: [],
          difficulty: '',
          mode: '',
          count: 0
        };
      }

      const timePattern = preferences.timePatterns[currentHour];
      timePattern.count += 1;
      if (timePattern.count === 1) {
        timePattern.categories = gameData.categories;
        timePattern.difficulty = gameData.difficulty;
        timePattern.mode = gameData.mode;
      }

      // Save updated preferences
      userProfile.preferences = preferences;
      saveUserProfile(userProfile);
    } catch (error) {
      console.error('Error tracking game completion:', error);
    }
  }

  // Get smart category recommendations based on user history
  getSmartCategoryRecommendations(): string[] {
    try {
      const userProfile = getUserProfile();
      if (!userProfile?.preferences) return ['tech']; // Default fallback

      const categoryStats = userProfile.preferences.categoryStats;
      const categories = Object.keys(categoryStats);

      if (categories.length === 0) return ['tech'];

      // Sort categories by preference score
      const sortedCategories = categories
        .map(category => ({
          category,
          preference: categoryStats[category].preference,
          recentActivity: categoryStats[category].gamesPlayed,
          performance: categoryStats[category].averageAccuracy
        }))
        .sort((a, b) => {
          // Weight: 60% preference, 30% recent activity, 10% performance
          const scoreA = (a.preference * 0.6) + (Math.min(a.recentActivity / 10, 1) * 0.3) + (a.performance / 100 * 0.1);
          const scoreB = (b.preference * 0.6) + (Math.min(b.recentActivity / 10, 1) * 0.3) + (b.performance / 100 * 0.1);
          return scoreB - scoreA;
        });

      // Return top 1-3 categories based on user's preference for multi-category games
      const topCategories = sortedCategories.slice(0, 3).map(c => c.category);
      
      // If user has played multiple categories recently, suggest multiple
      const hasMultiCategoryHistory = categories.filter(cat => categoryStats[cat].gamesPlayed > 0).length > 1;
      
      return hasMultiCategoryHistory ? topCategories : [topCategories[0]];
    } catch (error) {
      console.error('Error getting smart category recommendations:', error);
      return ['tech'];
    }
  }

  // Get smart difficulty recommendation
  getSmartDifficultyRecommendation(): string {
    try {
      const userProfile = getUserProfile();
      if (!userProfile?.preferences) return 'medium';

      const difficultyStats = userProfile.preferences.difficultyStats;
      const difficulties = Object.keys(difficultyStats);

      if (difficulties.length === 0) return 'medium';

      // Find difficulty with best performance and reasonable challenge
      const sortedDifficulties = difficulties
        .map(difficulty => ({
          difficulty,
          performance: difficultyStats[difficulty].averageAccuracy,
          gamesPlayed: difficultyStats[difficulty].gamesPlayed,
          preference: difficultyStats[difficulty].preference
        }))
        .sort((a, b) => {
          // Prefer difficulties where user performs well (70%+ accuracy) and has played recently
          const scoreA = (a.performance / 100) + (Math.min(a.gamesPlayed / 5, 1) * 0.3) + (a.preference * 0.2);
          const scoreB = (b.performance / 100) + (Math.min(b.gamesPlayed / 5, 1) * 0.3) + (b.preference * 0.2);
          return scoreB - scoreA;
        });

      return sortedDifficulties[0].difficulty;
    } catch (error) {
      console.error('Error getting smart difficulty recommendation:', error);
      return 'medium';
    }
  }
}

// Export singleton instance
export const userPreferencesManager = UserPreferencesManager.getInstance();
