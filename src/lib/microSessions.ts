// Micro-Session Types for BoltQuest
// Based on Elevate's bite-sized learning approach

export interface MicroSession {
  id: string;
  type: SessionType;
  duration: number; // in seconds
  questions: number;
  difficulty: 'adaptive' | 'progressive' | 'challenging' | 'custom';
  category?: string;
  description: string;
  estimatedTime: string;
  rewards: SessionRewards;
  requirements?: SessionRequirements;
}

export interface SessionRewards {
  baseXP: number;
  baseCoins: number;
  bonusMultiplier: number;
  specialRewards?: string[];
}

export interface SessionRequirements {
  minLevel?: number;
  unlockedCategories?: string[];
  previousSession?: string;
}

export enum SessionType {
  QUICK_BOOST = 'quickBoost',
  SKILL_BUILDER = 'skillBuilder',
  MASTERY_TEST = 'masteryTest',
  DAILY_CHALLENGE = 'dailyChallenge',
  STREAK_MAINTAINER = 'streakMaintainer',
  CONFIDENCE_BUILDER = 'confidenceBuilder'
}

// Predefined micro-session configurations
export const MICRO_SESSION_TYPES: Record<SessionType, MicroSession> = {
  [SessionType.QUICK_BOOST]: {
    id: 'quick-boost',
    type: SessionType.QUICK_BOOST,
    duration: 120, // 2 minutes
    questions: 5,
    difficulty: 'adaptive',
    description: 'Quick 2-minute brain boost to get your day started',
    estimatedTime: '2 min',
    rewards: {
      baseXP: 50,
      baseCoins: 10,
      bonusMultiplier: 1.0,
      specialRewards: ['morning-boost-badge']
    },
    requirements: {
      minLevel: 1
    }
  },

  [SessionType.SKILL_BUILDER]: {
    id: 'skill-builder',
    type: SessionType.SKILL_BUILDER,
    duration: 300, // 5 minutes
    questions: 10,
    difficulty: 'progressive',
    description: 'Build your skills with progressively challenging questions',
    estimatedTime: '5 min',
    rewards: {
      baseXP: 100,
      baseCoins: 20,
      bonusMultiplier: 1.2,
      specialRewards: ['skill-progress-badge']
    },
    requirements: {
      minLevel: 3
    }
  },

  [SessionType.MASTERY_TEST]: {
    id: 'mastery-test',
    type: SessionType.MASTERY_TEST,
    duration: 600, // 10 minutes
    questions: 20,
    difficulty: 'challenging',
    description: 'Test your mastery with challenging questions',
    estimatedTime: '10 min',
    rewards: {
      baseXP: 200,
      baseCoins: 40,
      bonusMultiplier: 1.5,
      specialRewards: ['mastery-test-badge', 'exclusive-avatar']
    },
    requirements: {
      minLevel: 5
    }
  },

  [SessionType.DAILY_CHALLENGE]: {
    id: 'daily-challenge',
    type: SessionType.DAILY_CHALLENGE,
    duration: 180, // 3 minutes
    questions: 7,
    difficulty: 'adaptive',
    description: 'Daily challenge with special rewards',
    estimatedTime: '3 min',
    rewards: {
      baseXP: 75,
      baseCoins: 25,
      bonusMultiplier: 1.3,
      specialRewards: ['daily-challenge-badge', 'streak-bonus']
    },
    requirements: {
      minLevel: 2
    }
  },

  [SessionType.STREAK_MAINTAINER]: {
    id: 'streak-maintainer',
    type: SessionType.STREAK_MAINTAINER,
    duration: 90, // 1.5 minutes
    questions: 3,
    difficulty: 'adaptive',
    description: 'Quick session to maintain your streak',
    estimatedTime: '1.5 min',
    rewards: {
      baseXP: 30,
      baseCoins: 5,
      bonusMultiplier: 1.0,
      specialRewards: ['streak-maintained-badge']
    },
    requirements: {
      minLevel: 1
    }
  },

  [SessionType.CONFIDENCE_BUILDER]: {
    id: 'confidence-builder',
    type: SessionType.CONFIDENCE_BUILDER,
    duration: 150, // 2.5 minutes
    questions: 6,
    difficulty: 'adaptive',
    description: 'Build confidence with easier questions',
    estimatedTime: '2.5 min',
    rewards: {
      baseXP: 40,
      baseCoins: 8,
      bonusMultiplier: 0.8,
      specialRewards: ['confidence-boost-badge']
    },
    requirements: {
      minLevel: 1
    }
  }
};

// Micro-Session Manager Class
export class MicroSessionManager {
  private userLevel: number;
  private userStreak: number;
  private lastSessionType?: SessionType;
  private sessionHistory: SessionHistory[] = [];

  constructor(userLevel: number = 1, userStreak: number = 0) {
    this.userLevel = userLevel;
    this.userStreak = userStreak;
  }

  // Get available sessions for user
  getAvailableSessions(): MicroSession[] {
    const availableSessions: MicroSession[] = [];

    Object.values(MICRO_SESSION_TYPES).forEach(session => {
      if (this.isSessionAvailable(session)) {
        availableSessions.push(session);
      }
    });

    // Sort by recommendation score
    return availableSessions.sort((a, b) => 
      this.getRecommendationScore(b) - this.getRecommendationScore(a)
    );
  }

  // Check if session is available for user
  private isSessionAvailable(session: MicroSession): boolean {
    if (session.requirements?.minLevel && this.userLevel < session.requirements.minLevel) {
      return false;
    }

    // Check if user has unlocked required categories
    if (session.requirements?.unlockedCategories) {
      // This would check against user's unlocked categories
      // For now, assume all categories are unlocked
    }

    return true;
  }

  // Get recommendation score for session
  private getRecommendationScore(session: MicroSession): number {
    let score = 0;

    // Base score from session type
    switch (session.type) {
      case SessionType.QUICK_BOOST:
        score += 10;
        break;
      case SessionType.SKILL_BUILDER:
        score += 15;
        break;
      case SessionType.MASTERY_TEST:
        score += 20;
        break;
      case SessionType.DAILY_CHALLENGE:
        score += 25; // Highest priority
        break;
      case SessionType.STREAK_MAINTAINER:
        score += this.userStreak > 0 ? 20 : 5;
        break;
      case SessionType.CONFIDENCE_BUILDER:
        score += 8;
        break;
    }

    // Bonus for variety (avoid repeating same session type)
    if (this.lastSessionType && this.lastSessionType === session.type) {
      score -= 5;
    }

    // Bonus for user level appropriateness
    if (session.requirements?.minLevel) {
      const levelDiff = this.userLevel - session.requirements.minLevel;
      if (levelDiff >= 0 && levelDiff <= 2) {
        score += 5;
      }
    }

    return score;
  }

  // Get recommended session for current context
  getRecommendedSession(): MicroSession {
    const availableSessions = this.getAvailableSessions();
    
    if (availableSessions.length === 0) {
      // Fallback to quick boost if no sessions available
      return MICRO_SESSION_TYPES[SessionType.QUICK_BOOST];
    }

    // Return highest scoring session
    return availableSessions[0];
  }

  // Start a micro-session
  startSession(sessionType: SessionType): MicroSession {
    const session = MICRO_SESSION_TYPES[sessionType];
    
    // Record session start
    this.sessionHistory.push({
      sessionId: session.id,
      sessionType: session.type,
      startTime: new Date(),
      endTime: null,
      completed: false,
      score: 0,
      accuracy: 0,
      rewards: { xp: 0, coins: 0, badges: [] }
    });

    this.lastSessionType = sessionType;
    return session;
  }

  // Complete a micro-session
  completeSession(sessionId: string, score: number, accuracy: number): SessionCompletion {
    const sessionIndex = this.sessionHistory.findIndex(s => s.sessionId === sessionId);
    
    if (sessionIndex === -1) {
      throw new Error('Session not found');
    }

    const session = this.sessionHistory[sessionIndex];
    const sessionConfig = Object.values(MICRO_SESSION_TYPES).find(s => s.id === sessionId);
    
    if (!sessionConfig) {
      throw new Error('Session configuration not found');
    }

    // Calculate rewards
    const rewards = this.calculateRewards(sessionConfig, score, accuracy);
    
    // Update session history
    session.endTime = new Date();
    session.completed = true;
    session.score = score;
    session.accuracy = accuracy;
    session.rewards = rewards;

    return {
      session: sessionConfig,
      score,
      accuracy,
      rewards,
      duration: session.endTime.getTime() - session.startTime.getTime(),
      achievements: this.checkAchievements(sessionConfig, score, accuracy)
    };
  }

  // Calculate rewards for completed session
  private calculateRewards(session: MicroSession, score: number, accuracy: number): SessionRewards {
    const baseXP = session.rewards.baseXP;
    const baseCoins = session.rewards.baseCoins;
    const multiplier = session.rewards.bonusMultiplier;

    // Apply accuracy bonus
    const accuracyBonus = accuracy > 0.8 ? 1.2 : accuracy > 0.6 ? 1.1 : 1.0;
    
    // Apply streak bonus
    const streakBonus = this.userStreak > 0 ? 1 + (this.userStreak * 0.1) : 1.0;

    const finalXP = Math.round(baseXP * multiplier * accuracyBonus * streakBonus);
    const finalCoins = Math.round(baseCoins * multiplier * accuracyBonus * streakBonus);

    return {
      baseXP: finalXP,
      baseCoins: finalCoins,
      bonusMultiplier: multiplier * accuracyBonus * streakBonus,
      specialRewards: session.rewards.specialRewards
    };
  }

  // Check for achievements unlocked during session
  private checkAchievements(session: MicroSession, score: number, accuracy: number): string[] {
    const achievements: string[] = [];

    // Session-specific achievements
    if (accuracy === 1.0) {
      achievements.push('perfect-session');
    }

    if (score > session.rewards.baseXP * 1.5) {
      achievements.push('high-score-session');
    }

    // Streak achievements
    if (this.userStreak >= 7) {
      achievements.push('week-streak');
    }

    if (this.userStreak >= 30) {
      achievements.push('month-streak');
    }

    return achievements;
  }

  // Get session statistics
  getSessionStats(): SessionStats {
    const completedSessions = this.sessionHistory.filter(s => s.completed);
    
    if (completedSessions.length === 0) {
      return {
        totalSessions: 0,
        averageScore: 0,
        averageAccuracy: 0,
        totalXP: 0,
        totalCoins: 0,
        favoriteSessionType: null,
        streak: this.userStreak
      };
    }

    const totalXP = completedSessions.reduce((sum, s) => sum + s.rewards.xp, 0);
    const totalCoins = completedSessions.reduce((sum, s) => sum + s.rewards.coins, 0);
    const averageScore = completedSessions.reduce((sum, s) => sum + s.score, 0) / completedSessions.length;
    const averageAccuracy = completedSessions.reduce((sum, s) => sum + s.accuracy, 0) / completedSessions.length;

    // Find favorite session type
    const sessionTypeCounts: Record<string, number> = {};
    completedSessions.forEach(s => {
      sessionTypeCounts[s.sessionType] = (sessionTypeCounts[s.sessionType] || 0) + 1;
    });

    const favoriteSessionType = Object.entries(sessionTypeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null;

    return {
      totalSessions: completedSessions.length,
      averageScore: Math.round(averageScore),
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      totalXP,
      totalCoins,
      favoriteSessionType: favoriteSessionType as SessionType | null,
      streak: this.userStreak
    };
  }

  // Update user level and streak
  updateUserStats(level: number, streak: number): void {
    this.userLevel = level;
    this.userStreak = streak;
  }
}

// Supporting interfaces
export interface SessionHistory {
  sessionId: string;
  sessionType: SessionType;
  startTime: Date;
  endTime: Date | null;
  completed: boolean;
  score: number;
  accuracy: number;
  rewards: {
    xp: number;
    coins: number;
    badges: string[];
  };
}

export interface SessionCompletion {
  session: MicroSession;
  score: number;
  accuracy: number;
  rewards: SessionRewards;
  duration: number;
  achievements: string[];
}

export interface SessionStats {
  totalSessions: number;
  averageScore: number;
  averageAccuracy: number;
  totalXP: number;
  totalCoins: number;
  favoriteSessionType: SessionType | null;
  streak: number;
}

// Utility functions
export const SessionUtils = {
  // Get session type display name
  getSessionTypeName(type: SessionType): string {
    const names: Record<SessionType, string> = {
      [SessionType.QUICK_BOOST]: 'Quick Boost',
      [SessionType.SKILL_BUILDER]: 'Skill Builder',
      [SessionType.MASTERY_TEST]: 'Mastery Test',
      [SessionType.DAILY_CHALLENGE]: 'Daily Challenge',
      [SessionType.STREAK_MAINTAINER]: 'Streak Maintainer',
      [SessionType.CONFIDENCE_BUILDER]: 'Confidence Builder'
    };
    return names[type];
  },

  // Get session type icon
  getSessionTypeIcon(type: SessionType): string {
    const icons: Record<SessionType, string> = {
      [SessionType.QUICK_BOOST]: '⚡',
      [SessionType.SKILL_BUILDER]: '📈',
      [SessionType.MASTERY_TEST]: '🎯',
      [SessionType.DAILY_CHALLENGE]: '📅',
      [SessionType.STREAK_MAINTAINER]: '🔥',
      [SessionType.CONFIDENCE_BUILDER]: '💪'
    };
    return icons[type];
  },

  // Format duration for display
  formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  },

  // Get session difficulty color
  getDifficultyColor(difficulty: string): string {
    const colors: Record<string, string> = {
      'adaptive': '#22c55e',
      'progressive': '#eab308',
      'challenging': '#ef4444',
      'custom': '#6366f1'
    };
    return colors[difficulty] || '#6b7280';
  }
};

export default MicroSessionManager;

