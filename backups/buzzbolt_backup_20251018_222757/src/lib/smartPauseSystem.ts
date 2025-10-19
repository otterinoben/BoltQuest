// src/lib/smartPauseSystem.ts
import { getUserProfile, saveUserProfile } from './userStorage';

export interface PauseSession {
  id: string;
  gameId: string;
  pausedAt: Date;
  resumedAt?: Date;
  pauseReason: 'manual' | 'auto' | 'tab_switch' | 'inactivity' | 'notification';
  duration: number; // in seconds
  gameState: any;
}

export interface PausePreferences {
  enabled: boolean;
  autoPauseOnTabSwitch: boolean;
  autoPauseOnInactivity: boolean;
  inactivityTimeout: number; // in seconds
  showResumeReminders: boolean;
  reminderInterval: number; // in seconds
  maxPauseDuration: number; // in seconds (0 = unlimited)
}

export interface PauseHistory {
  sessions: PauseSession[];
  totalPauseTime: number;
  averagePauseDuration: number;
  pauseFrequency: number; // pauses per game
}

export class SmartPauseSystem {
  private static instance: SmartPauseSystem;
  private currentSession: PauseSession | null = null;
  private pauseHistory: PauseHistory;
  private preferences: PausePreferences;
  private inactivityTimer: NodeJS.Timeout | null = null;
  private reminderTimer: NodeJS.Timeout | null = null;
  private lastActivityTime: Date = new Date();

  static getInstance(): SmartPauseSystem {
    if (!SmartPauseSystem.instance) {
      SmartPauseSystem.instance = new SmartPauseSystem();
    }
    return SmartPauseSystem.instance;
  }

  constructor() {
    this.preferences = this.loadPreferences();
    this.pauseHistory = this.loadPauseHistory();
    this.setupActivityTracking();
  }

  // Load pause preferences
  private loadPreferences(): PausePreferences {
    const userProfile = getUserProfile();
    return userProfile.pausePreferences || this.getDefaultPreferences();
  }

  // Get default preferences
  private getDefaultPreferences(): PausePreferences {
    return {
      enabled: true,
      autoPauseOnTabSwitch: true,
      autoPauseOnInactivity: false,
      inactivityTimeout: 300, // 5 minutes
      showResumeReminders: true,
      reminderInterval: 60, // 1 minute
      maxPauseDuration: 0, // unlimited
    };
  }

  // Load pause history
  private loadPauseHistory(): PauseHistory {
    const saved = localStorage.getItem('boltquest_pause_history');
    if (saved) {
      const data = JSON.parse(saved);
      return {
        ...data,
        sessions: data.sessions.map((s: any) => ({
          ...s,
          pausedAt: new Date(s.pausedAt),
          resumedAt: s.resumedAt ? new Date(s.resumedAt) : undefined,
        })),
      };
    }
    return {
      sessions: [],
      totalPauseTime: 0,
      averagePauseDuration: 0,
      pauseFrequency: 0,
    };
  }

  // Save pause history
  private savePauseHistory(): void {
    localStorage.setItem('boltquest_pause_history', JSON.stringify(this.pauseHistory));
  }

  // Setup activity tracking
  private setupActivityTracking(): void {
    if (!this.preferences.enabled) return;

    // Track mouse and keyboard activity
    const updateActivity = () => {
      this.lastActivityTime = new Date();
      this.resetInactivityTimer();
    };

    document.addEventListener('mousemove', updateActivity);
    document.addEventListener('keydown', updateActivity);
    document.addEventListener('click', updateActivity);
    document.addEventListener('scroll', updateActivity);

    // Track tab visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.preferences.autoPauseOnTabSwitch) {
        this.autoPause('tab_switch');
      } else if (!document.hidden && this.currentSession) {
        this.showResumeReminder();
      }
    });
  }

  // Reset inactivity timer
  private resetInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    if (this.preferences.autoPauseOnInactivity) {
      this.inactivityTimer = setTimeout(() => {
        this.autoPause('inactivity');
      }, this.preferences.inactivityTimeout * 1000);
    }
  }

  // Manual pause
  pauseGame(gameId: string, gameState: any): PauseSession {
    if (this.currentSession) {
      // Resume current session if it exists
      this.resumeGame();
    }

    const session: PauseSession = {
      id: `pause_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gameId,
      pausedAt: new Date(),
      pauseReason: 'manual',
      duration: 0,
      gameState,
    };

    this.currentSession = session;
    this.pauseHistory.sessions.push(session);
    this.savePauseHistory();

    // Start reminder timer if enabled
    if (this.preferences.showResumeReminders) {
      this.startReminderTimer();
    }

    return session;
  }

  // Auto pause
  autoPause(reason: 'tab_switch' | 'inactivity' | 'notification'): PauseSession | null {
    if (!this.preferences.enabled || this.currentSession) return null;

    // Get current game state (this would need to be passed from the game component)
    const gameState = this.getCurrentGameState();
    if (!gameState) return null;

    const session: PauseSession = {
      id: `pause_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gameId: gameState.gameId || 'unknown',
      pausedAt: new Date(),
      pauseReason: reason,
      duration: 0,
      gameState,
    };

    this.currentSession = session;
    this.pauseHistory.sessions.push(session);
    this.savePauseHistory();

    // Start reminder timer if enabled
    if (this.preferences.showResumeReminders) {
      this.startReminderTimer();
    }

    return session;
  }

  // Resume game
  resumeGame(): PauseSession | null {
    if (!this.currentSession) return null;

    const session = this.currentSession;
    session.resumedAt = new Date();
    session.duration = Math.floor((session.resumedAt.getTime() - session.pausedAt.getTime()) / 1000);

    // Update pause history
    this.pauseHistory.totalPauseTime += session.duration;
    this.pauseHistory.averagePauseDuration = 
      this.pauseHistory.sessions.reduce((sum, s) => sum + s.duration, 0) / this.pauseHistory.sessions.length;
    this.pauseHistory.pauseFrequency = this.pauseHistory.sessions.length;

    this.currentSession = null;
    this.clearReminderTimer();
    this.savePauseHistory();

    return session;
  }

  // Start reminder timer
  private startReminderTimer(): void {
    if (this.reminderTimer) {
      clearInterval(this.reminderTimer);
    }

    this.reminderTimer = setInterval(() => {
      if (this.currentSession) {
        this.showResumeReminder();
      }
    }, this.preferences.reminderInterval * 1000);
  }

  // Clear reminder timer
  private clearReminderTimer(): void {
    if (this.reminderTimer) {
      clearInterval(this.reminderTimer);
      this.reminderTimer = null;
    }
  }

  // Show resume reminder
  private showResumeReminder(): void {
    if (!this.currentSession) return;

    const pauseDuration = Math.floor((Date.now() - this.currentSession.pausedAt.getTime()) / 1000);
    
    // Check if max pause duration exceeded
    if (this.preferences.maxPauseDuration > 0 && pauseDuration > this.preferences.maxPauseDuration) {
      this.autoResume();
      return;
    }

    // Show notification (this would integrate with the notification system)
    this.showPauseNotification(pauseDuration);
  }

  // Show pause notification
  private showPauseNotification(pauseDuration: number): void {
    const minutes = Math.floor(pauseDuration / 60);
    const seconds = pauseDuration % 60;
    
    // This would integrate with the smart notification system
    console.log(`Game paused for ${minutes}m ${seconds}s. Click to resume.`);
  }

  // Auto resume (when max duration exceeded)
  private autoResume(): void {
    if (this.currentSession) {
      this.resumeGame();
      console.log('Game auto-resumed due to maximum pause duration exceeded.');
    }
  }

  // Get current game state (placeholder - would need to be implemented)
  private getCurrentGameState(): any {
    // This would need to be passed from the game component
    // For now, return a placeholder
    return {
      gameId: 'current_game',
      score: 0,
      timeRemaining: 0,
      questionsAnswered: 0,
    };
  }

  // Get pause statistics
  getPauseStatistics(): PauseHistory {
    return this.pauseHistory;
  }

  // Get current pause session
  getCurrentPauseSession(): PauseSession | null {
    return this.currentSession;
  }

  // Check if game is paused
  isPaused(): boolean {
    return this.currentSession !== null;
  }

  // Get pause duration
  getPauseDuration(): number {
    if (!this.currentSession) return 0;
    return Math.floor((Date.now() - this.currentSession.pausedAt.getTime()) / 1000);
  }

  // Update preferences
  updatePreferences(preferences: Partial<PausePreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
    
    // Save to user profile
    const userProfile = getUserProfile();
    userProfile.pausePreferences = this.preferences;
    saveUserProfile(userProfile);

    // Update activity tracking
    this.setupActivityTracking();
  }

  // Get preferences
  getPreferences(): PausePreferences {
    return this.preferences;
  }

  // Clear pause history
  clearPauseHistory(): void {
    this.pauseHistory = {
      sessions: [],
      totalPauseTime: 0,
      averagePauseDuration: 0,
      pauseFrequency: 0,
    };
    this.savePauseHistory();
  }

  // Get pause insights
  getPauseInsights(): any {
    const sessions = this.pauseHistory.sessions;
    if (sessions.length === 0) return null;

    const recentSessions = sessions.slice(-10); // Last 10 sessions
    const avgDuration = recentSessions.reduce((sum, s) => sum + s.duration, 0) / recentSessions.length;
    
    const reasonCounts = recentSessions.reduce((counts, s) => {
      counts[s.pauseReason] = (counts[s.pauseReason] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return {
      averageDuration: Math.round(avgDuration),
      mostCommonReason: Object.keys(reasonCounts).reduce((a, b) => 
        reasonCounts[a] > reasonCounts[b] ? a : b
      ),
      totalPauses: sessions.length,
      recentTrend: this.calculateTrend(recentSessions),
    };
  }

  // Calculate trend
  private calculateTrend(sessions: PauseSession[]): 'increasing' | 'decreasing' | 'stable' {
    if (sessions.length < 3) return 'stable';
    
    const firstHalf = sessions.slice(0, Math.floor(sessions.length / 2));
    const secondHalf = sessions.slice(Math.floor(sessions.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, s) => sum + s.duration, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + s.duration, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (difference > 30) return 'increasing';
    if (difference < -30) return 'decreasing';
    return 'stable';
  }
}

// Export singleton instance
export const smartPauseSystem = SmartPauseSystem.getInstance();
