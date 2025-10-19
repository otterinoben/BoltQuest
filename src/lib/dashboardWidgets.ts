// src/lib/dashboardWidgets.ts
import { getUserProfile } from './userStorage';
import { getCurrentDailyTasks, getDailyTaskStats } from './dailyTaskManager';
import { getGameHistoryByUserId } from './gameHistoryStorage';
import { getAchievements } from './simpleAchievements';
import { EloSystem } from './eloSystem';
import { calculateLevelFromXp } from './xpLevelSystem';

export interface DashboardWidget {
  id: string;
  type: 'quick-action' | 'progress' | 'achievement' | 'social' | 'recommendation';
  title: string;
  description: string;
  priority: number;
  personalized: boolean;
  data: any;
  action?: () => void;
  icon: string;
  color: string;
}

export interface WidgetData {
  userProfile: any;
  dailyTasks: any;
  dailyStats: any;
  recentGames: any[];
  achievements: any[];
  eloRating: any;
}

export class DashboardWidgetManager {
  private static instance: DashboardWidgetManager;
  private widgets: DashboardWidget[] = [];
  private userPreferences: any = {};

  static getInstance(): DashboardWidgetManager {
    if (!DashboardWidgetManager.instance) {
      DashboardWidgetManager.instance = new DashboardWidgetManager();
    }
    return DashboardWidgetManager.instance;
  }

  // Generate all available widgets
  generateWidgets(): DashboardWidget[] {
    const data = this.getWidgetData();
    
    this.widgets = [
      this.createQuickActionWidget(data),
      this.createProgressWidget(data),
      this.createAchievementWidget(data),
      this.createRecommendationWidget(data),
      this.createSocialWidget(data),
    ];

    // Sort by priority and user preferences
    return this.sortWidgetsByPriority();
  }

  // Get all data needed for widgets
  private getWidgetData(): WidgetData {
    const userProfile = getUserProfile();
    const eloSystem = new EloSystem();
    return {
      userProfile,
      dailyTasks: getCurrentDailyTasks(),
      dailyStats: getDailyTaskStats(),
      recentGames: getGameHistoryByUserId(userProfile.id).slice(0, 5),
      achievements: getAchievements(),
      eloRating: eloSystem.getEloStats(),
    };
  }

  // Create Quick Action Widget
  private createQuickActionWidget(data: WidgetData): DashboardWidget {
    const lastGame = data.recentGames[0];
    const hasIncompleteGame = lastGame && !lastGame.completed;
    
    return {
      id: 'quick-action',
      type: 'quick-action',
      title: hasIncompleteGame ? 'Continue Last Game' : 'Quick Play',
      description: hasIncompleteGame 
        ? `Resume your ${lastGame.category} game` 
        : 'Start playing with your last settings',
      priority: 10,
      personalized: true,
      data: { lastGame, hasIncompleteGame },
      icon: '⚡',
      color: 'primary',
    };
  }

  // Create Progress Widget
  private createProgressWidget(data: WidgetData): DashboardWidget {
    const { userProfile, dailyStats } = data;
    const levelProgress = this.calculateLevelProgress(userProfile);
    const streakDays = dailyStats.currentStreak || 0;
    
    return {
      id: 'progress',
      type: 'progress',
      title: 'Your Progress',
      description: streakDays > 0 
        ? `${streakDays} day streak! Keep it going!`
        : 'Complete daily tasks to build your streak',
      priority: 9,
      personalized: true,
      data: { levelProgress, streakDays, dailyStats },
      icon: '📈',
      color: 'success',
    };
  }

  // Create Achievement Widget
  private createAchievementWidget(data: WidgetData): DashboardWidget {
    const achievements = data.achievements;
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const nextAchievement = achievements.find(a => !a.unlocked);
    
    return {
      id: 'achievement',
      type: 'achievement',
      title: 'Achievements',
      description: nextAchievement 
        ? `Next: ${nextAchievement.name}`
        : `You've unlocked ${unlockedCount} achievements!`,
      priority: 8,
      personalized: true,
      data: { unlockedCount, nextAchievement, totalCount: achievements.length },
      icon: '🏆',
      color: 'warning',
    };
  }

  // Create Recommendation Widget
  private createRecommendationWidget(data: WidgetData): DashboardWidget {
    const { userProfile, recentGames } = data;
    const recommendation = this.generateRecommendation(userProfile, recentGames);
    
    return {
      id: 'recommendation',
      type: 'recommendation',
      title: 'Recommended for You',
      description: recommendation.message,
      priority: 7,
      personalized: true,
      data: recommendation,
      icon: '💡',
      color: 'info',
    };
  }

  // Create Social Widget
  private createSocialWidget(data: WidgetData): DashboardWidget {
    const { userProfile, eloRating } = data;
    const recentActivity = this.getRecentActivity(userProfile);
    
    return {
      id: 'social',
      type: 'social',
      title: 'Community',
      description: recentActivity.message,
      priority: 6,
      personalized: true,
      data: { recentActivity, eloRating },
      icon: '👥',
      color: 'secondary',
    };
  }

  // Generate smart recommendations
  private generateRecommendation(userProfile: any, recentGames: any[]): any {
    const level = userProfile.level;
    const totalXp = userProfile.totalXp;
    const levelProgress = this.calculateLevelProgress(userProfile);
    
    // XP-based recommendations
    if (levelProgress.xpToNext <= 50) {
      return {
        type: 'xp',
        message: `You're ${levelProgress.xpToNext} XP away from Level ${level + 1}!`,
        action: 'play_game',
        category: 'any',
        difficulty: 'medium',
      };
    }
    
    // Performance-based recommendations
    if (recentGames.length > 0) {
      const avgAccuracy = recentGames.reduce((sum, game) => 
        sum + (game.correctAnswers / game.questionsAnswered), 0) / recentGames.length;
      
      if (avgAccuracy > 0.8) {
        return {
          type: 'performance',
          message: 'You\'re doing great! Try a harder difficulty',
          action: 'play_game',
          category: 'any',
          difficulty: 'hard',
        };
      } else if (avgAccuracy < 0.6) {
        return {
          type: 'performance',
          message: 'Practice more to improve your accuracy',
          action: 'play_game',
          category: 'any',
          difficulty: 'easy',
        };
      }
    }
    
    // Default recommendation
    return {
      type: 'default',
      message: 'Ready for a new challenge?',
      action: 'play_game',
      category: 'any',
      difficulty: 'medium',
    };
  }

  // Calculate level progress
  private calculateLevelProgress(userProfile: any): any {
    return calculateLevelFromXp(userProfile.totalXp || 0);
  }

  // Get recent activity for social widget
  private getRecentActivity(userProfile: any): any {
    const totalGames = userProfile.statistics.totalGamesPlayed;
    
    if (totalGames === 0) {
      return {
        type: 'welcome',
        message: 'Welcome to BoltQuest! Start playing to join the community',
      };
    } else if (totalGames < 5) {
      return {
        type: 'new_player',
        message: 'You\'re just getting started! Keep playing to improve',
      };
    } else {
      return {
        type: 'active_player',
        message: `You've played ${totalGames} games! You're becoming a pro`,
      };
    }
  }

  // Sort widgets by priority and user preferences
  private sortWidgetsByPriority(): DashboardWidget[] {
    return this.widgets.sort((a, b) => {
      // First by priority (higher first)
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      
      // Then by personalization (personalized first)
      if (a.personalized !== b.personalized) {
        return a.personalized ? -1 : 1;
      }
      
      return 0;
    });
  }

  // Update user preferences
  updateUserPreferences(preferences: any): void {
    this.userPreferences = { ...this.userPreferences, ...preferences };
  }

  // Get widget by ID
  getWidget(id: string): DashboardWidget | undefined {
    return this.widgets.find(widget => widget.id === id);
  }

  // Refresh all widgets
  refreshWidgets(): DashboardWidget[] {
    return this.generateWidgets();
  }
}

// Export singleton instance
export const dashboardWidgetManager = DashboardWidgetManager.getInstance();
