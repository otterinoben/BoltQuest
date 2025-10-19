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
}

export interface SmartRecommendation {
  type: 'time' | 'performance' | 'goal' | 'streak' | 'default';
  category: string;
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
        mode: 'quick',
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
        mode: 'quick',
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
        mode: 'quick',
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
        mode: 'quick',
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
}

// Export singleton instance
export const userPreferencesManager = UserPreferencesManager.getInstance();
