// src/lib/smartNotifications.ts
import { getUserProfile } from './userStorage';
import { getCurrentDailyTasks, getDailyTaskStats } from './dailyTaskManager';
import { getAchievements } from './simpleAchievements';
import { getGameHistoryByUserId } from './gameHistoryStorage';
import { EloSystem } from './eloSystem';

export interface SmartNotification {
  id: string;
  type: 'streak' | 'achievement' | 'social' | 'learning' | 'reminder' | 'milestone';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action?: {
    type: 'navigate' | 'play_game' | 'view_page';
    data: any;
  };
  icon: string;
  color: string;
  timestamp: Date;
  read: boolean;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  enabled: boolean;
  streakReminders: boolean;
  achievementAlerts: boolean;
  socialUpdates: boolean;
  learningInsights: boolean;
  milestoneCelebrations: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "08:00"
  };
}

export class SmartNotificationManager {
  private static instance: SmartNotificationManager;
  private notifications: SmartNotification[] = [];
  private preferences: NotificationPreferences;

  static getInstance(): SmartNotificationManager {
    if (!SmartNotificationManager.instance) {
      SmartNotificationManager.instance = new SmartNotificationManager();
    }
    return SmartNotificationManager.instance;
  }

  constructor() {
    this.preferences = this.loadPreferences();
    this.loadNotifications();
  }

  // Load notification preferences
  private loadPreferences(): NotificationPreferences {
    const userProfile = getUserProfile();
    return userProfile.notificationPreferences || this.getDefaultPreferences();
  }

  // Get default preferences
  private getDefaultPreferences(): NotificationPreferences {
    return {
      enabled: true,
      streakReminders: true,
      achievementAlerts: true,
      socialUpdates: true,
      learningInsights: true,
      milestoneCelebrations: true,
      quietHours: {
        enabled: true,
        start: "22:00",
        end: "08:00",
      },
    };
  }

  // Load notifications from localStorage
  private loadNotifications(): void {
    const saved = localStorage.getItem('boltquest_notifications');
    if (saved) {
      this.notifications = JSON.parse(saved).map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp),
        expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined,
      }));
    }
  }

  // Save notifications to localStorage
  private saveNotifications(): void {
    localStorage.setItem('boltquest_notifications', JSON.stringify(this.notifications));
  }

  // Generate smart notifications based on user data
  generateSmartNotifications(): SmartNotification[] {
    if (!this.preferences.enabled) return [];

    const userProfile = getUserProfile();
    const dailyTasks = getCurrentDailyTasks();
    const dailyStats = getDailyTaskStats();
    const achievements = getAchievements();
    const gameHistory = getGameHistoryByUserId(userProfile.id);
    const eloSystem = new EloSystem();
    const eloRating = eloSystem.getEloStats();

    const newNotifications: SmartNotification[] = [];

    // Streak notifications
    if (this.preferences.streakReminders) {
      const streakNotifications = this.generateStreakNotifications(dailyStats, userProfile);
      newNotifications.push(...streakNotifications);
    }

    // Achievement notifications
    if (this.preferences.achievementAlerts) {
      const achievementNotifications = this.generateAchievementNotifications(achievements, userProfile);
      newNotifications.push(...achievementNotifications);
    }

    // Learning insights
    if (this.preferences.learningInsights) {
      const learningNotifications = this.generateLearningNotifications(gameHistory, eloRating, userProfile);
      newNotifications.push(...learningNotifications);
    }

    // Milestone celebrations
    if (this.preferences.milestoneCelebrations) {
      const milestoneNotifications = this.generateMilestoneNotifications(userProfile, gameHistory);
      newNotifications.push(...milestoneNotifications);
    }

    // Social updates
    if (this.preferences.socialUpdates) {
      const socialNotifications = this.generateSocialNotifications(userProfile, eloRating);
      newNotifications.push(...socialNotifications);
    }

    // Add new notifications
    this.notifications.push(...newNotifications);
    
    // Clean up expired notifications
    this.cleanupExpiredNotifications();
    
    // Save notifications
    this.saveNotifications();

    return newNotifications;
  }

  // Generate streak-related notifications
  private generateStreakNotifications(dailyStats: any, userProfile: any): SmartNotification[] {
    const notifications: SmartNotification[] = [];
    const currentStreak = dailyStats.currentStreak || 0;
    const lastPlayDate = this.getLastPlayDate(userProfile);

    // Streak reminder
    if (currentStreak > 0 && this.isStreakAtRisk(lastPlayDate)) {
      notifications.push({
        id: `streak-reminder-${Date.now()}`,
        type: 'streak',
        title: 'Streak at Risk!',
        message: `Don't lose your ${currentStreak} day streak! Play a quick game to keep it alive.`,
        priority: 'high',
        action: {
          type: 'play_game',
          data: { mode: 'quick', difficulty: 'easy' },
        },
        icon: '🔥',
        color: 'orange',
        timestamp: new Date(),
        read: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });
    }

    // Streak milestone
    if (currentStreak > 0 && this.isStreakMilestone(currentStreak)) {
      notifications.push({
        id: `streak-milestone-${currentStreak}`,
        type: 'milestone',
        title: 'Streak Milestone!',
        message: `Amazing! You've maintained a ${currentStreak} day streak!`,
        priority: 'medium',
        icon: '🏆',
        color: 'gold',
        timestamp: new Date(),
        read: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
    }

    return notifications;
  }

  // Generate achievement-related notifications
  private generateAchievementNotifications(achievements: any[], userProfile: any): SmartNotification[] {
    const notifications: SmartNotification[] = [];
    const recentAchievements = achievements.filter(a => 
      a.unlocked && a.unlockedAt && 
      new Date(a.unlockedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    recentAchievements.forEach(achievement => {
      notifications.push({
        id: `achievement-${achievement.id}`,
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: `🎉 ${achievement.name}: ${achievement.description}`,
        priority: 'medium',
        action: {
          type: 'view_page',
          data: { page: '/achievements' },
        },
        icon: '🏅',
        color: 'blue',
        timestamp: new Date(),
        read: false,
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      });
    });

    return notifications;
  }

  // Generate learning insight notifications
  private generateLearningNotifications(gameHistory: any[], eloRating: any, userProfile: any): SmartNotification[] {
    const notifications: SmartNotification[] = [];
    const recentGames = gameHistory.slice(0, 5);

    if (recentGames.length >= 3) {
      const avgAccuracy = recentGames.reduce((sum, game) => 
        sum + (game.correctAnswers / game.questionsAnswered), 0) / recentGames.length;

      if (avgAccuracy > 0.8) {
        notifications.push({
          id: `learning-insight-accuracy-${Date.now()}`,
          type: 'learning',
          title: 'Great Performance!',
          message: `Your accuracy is ${Math.round(avgAccuracy * 100)}%! Try a harder difficulty.`,
          priority: 'low',
          action: {
            type: 'play_game',
            data: { difficulty: 'hard' },
          },
          icon: '📈',
          color: 'green',
          timestamp: new Date(),
          read: false,
          expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        });
      } else if (avgAccuracy < 0.6) {
        notifications.push({
          id: `learning-insight-practice-${Date.now()}`,
          type: 'learning',
          title: 'Practice Makes Perfect',
          message: `Your accuracy is ${Math.round(avgAccuracy * 100)}%. Try training mode to improve.`,
          priority: 'low',
          action: {
            type: 'play_game',
            data: { mode: 'training', difficulty: 'easy' },
          },
          icon: '📚',
          color: 'blue',
          timestamp: new Date(),
          read: false,
          expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        });
      }
    }

    return notifications;
  }

  // Generate milestone notifications
  private generateMilestoneNotifications(userProfile: any, gameHistory: any[]): SmartNotification[] {
    const notifications: SmartNotification[] = [];
    const level = userProfile.level || 1;
    const totalGames = gameHistory.length;

    // Level milestones
    if (this.isLevelMilestone(level)) {
      notifications.push({
        id: `level-milestone-${level}`,
        type: 'milestone',
        title: 'Level Milestone!',
        message: `Congratulations! You've reached Level ${level}!`,
        priority: 'medium',
        icon: '⭐',
        color: 'purple',
        timestamp: new Date(),
        read: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
    }

    // Game count milestones
    if (this.isGameCountMilestone(totalGames)) {
      notifications.push({
        id: `games-milestone-${totalGames}`,
        type: 'milestone',
        title: 'Games Milestone!',
        message: `You've played ${totalGames} games! You're becoming a pro!`,
        priority: 'medium',
        icon: '🎮',
        color: 'green',
        timestamp: new Date(),
        read: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
    }

    return notifications;
  }

  // Generate social notifications
  private generateSocialNotifications(userProfile: any, eloRating: any): SmartNotification[] {
    const notifications: SmartNotification[] = [];
    
    // ELO rating milestones
    if (eloRating && this.isEloMilestone(eloRating.rating)) {
      notifications.push({
        id: `elo-milestone-${eloRating.rating}`,
        type: 'social',
        title: 'Rating Milestone!',
        message: `Your ELO rating is now ${eloRating.rating}! Keep climbing the leaderboards.`,
        priority: 'low',
        action: {
          type: 'view_page',
          data: { page: '/leaderboards' },
        },
        icon: '📊',
        color: 'blue',
        timestamp: new Date(),
        read: false,
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      });
    }

    return notifications;
  }

  // Helper methods
  private getLastPlayDate(userProfile: any): Date | null {
    // This would typically come from game history
    // For now, return null to indicate no recent play
    return null;
  }

  private isStreakAtRisk(lastPlayDate: Date | null): boolean {
    if (!lastPlayDate) return true;
    const hoursSinceLastPlay = (Date.now() - lastPlayDate.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastPlay > 20; // Risk if not played in 20+ hours
  }

  private isStreakMilestone(streak: number): boolean {
    return [3, 7, 14, 30, 50, 100].includes(streak);
  }

  private isLevelMilestone(level: number): boolean {
    return [5, 10, 25, 50, 75, 100, 150, 200].includes(level);
  }

  private isGameCountMilestone(games: number): boolean {
    return [10, 25, 50, 100, 250, 500, 1000].includes(games);
  }

  private isEloMilestone(rating: number): boolean {
    return [1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000].includes(rating);
  }

  private cleanupExpiredNotifications(): void {
    const now = new Date();
    this.notifications = this.notifications.filter(n => 
      !n.expiresAt || n.expiresAt > now
    );
  }

  // Public methods
  getNotifications(): SmartNotification[] {
    return this.notifications.sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  getUnreadNotifications(): SmartNotification[] {
    return this.notifications.filter(n => !n.read);
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
  }

  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
  }

  updatePreferences(preferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
    const userProfile = getUserProfile();
    userProfile.notificationPreferences = this.preferences;
    // Save user profile (this would need to be implemented)
  }

  isQuietHours(): boolean {
    if (!this.preferences.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime = this.parseTime(this.preferences.quietHours.start);
    const endTime = this.parseTime(this.preferences.quietHours.end);
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight quiet hours
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }
}

// Export singleton instance
export const smartNotificationManager = SmartNotificationManager.getInstance();
