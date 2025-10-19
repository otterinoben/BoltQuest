/**
 * Daily Task System Types
 */

export type TaskDifficulty = 'easy' | 'medium' | 'hard';
export type TaskCategory = 'score' | 'category' | 'mode' | 'accuracy' | 'streak' | 'achievement' | 'time' | 'social' | 'exploration';

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  difficulty: TaskDifficulty;
  category: TaskCategory;
  requirement: number;
  currentProgress: number;
  completed: boolean;
  completedAt?: number;
  xpReward: number;
  pointsReward: number;
  icon: string;
  requirements: {
    type: 'score' | 'games' | 'accuracy' | 'streak' | 'time' | 'category' | 'mode' | 'achievement';
    value: number;
    category?: string;
    difficulty?: string;
    mode?: string;
  };
}

export interface DailyTaskSet {
  id: string;
  date: string; // YYYY-MM-DD format
  tasks: DailyTask[];
  completionTask?: DailyTask; // "Finish all daily tasks"
  completed: boolean;
  completedAt?: number;
  streakCount: number;
  totalXpEarned: number;
  totalPointsEarned: number;
}

export interface DailyTaskStats {
  currentStreak: number;
  longestStreak: number;
  totalTasksCompleted: number;
  totalXpEarned: number;
  totalPointsEarned: number;
  lastCompletedDate?: string;
  gracePeriodUsed: boolean;
  gracePeriodAvailable: boolean;
}

export interface DailyTaskRewards {
  baseXp: number;
  streakMultiplier: number;
  completionBonus: number;
  gracePeriodCost: number;
}



