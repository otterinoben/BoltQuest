/**
 * Daily Task Leveling System
 * Manages user levels, XP, and level-up rewards for daily tasks
 */

export interface DailyTaskLevel {
  level: number;
  name: string;
  xpRequired: number;
  rewards: {
    points: number;
    streakProtection?: boolean;
    bonusMultiplier?: number;
    specialTitle?: string;
  };
  color: string;
  icon: string;
}

export interface UserLevelProgress {
  currentLevel: number;
  currentXp: number;
  totalXpEarned: number;
  nextLevelXp: number;
  progressToNextLevel: number;
  levelUpRewards: {
    points: number;
    streakProtection: boolean;
    bonusMultiplier: number;
    specialTitle?: string;
  };
}

const STORAGE_KEY = 'boltquest_daily_leveling';

// Level definitions
export const DAILY_TASK_LEVELS: DailyTaskLevel[] = [
  {
    level: 1,
    name: "Novice",
    xpRequired: 0,
    rewards: { points: 0 },
    color: "text-gray-500",
    icon: "🌱"
  },
  {
    level: 2,
    name: "Apprentice",
    xpRequired: 100,
    rewards: { points: 50, streakProtection: false, bonusMultiplier: 1.0 },
    color: "text-green-500",
    icon: "🌿"
  },
  {
    level: 3,
    name: "Learner",
    xpRequired: 250,
    rewards: { points: 100, streakProtection: false, bonusMultiplier: 1.1 },
    color: "text-blue-500",
    icon: "📚"
  },
  {
    level: 4,
    name: "Student",
    xpRequired: 500,
    rewards: { points: 200, streakProtection: false, bonusMultiplier: 1.2 },
    color: "text-indigo-500",
    icon: "🎓"
  },
  {
    level: 5,
    name: "Scholar",
    xpRequired: 800,
    rewards: { points: 300, streakProtection: true, bonusMultiplier: 1.3 },
    color: "text-purple-500",
    icon: "🧙‍♂️"
  },
  {
    level: 6,
    name: "Expert",
    xpRequired: 1200,
    rewards: { points: 500, streakProtection: true, bonusMultiplier: 1.4 },
    color: "text-orange-500",
    icon: "⭐"
  },
  {
    level: 7,
    name: "Master",
    xpRequired: 1700,
    rewards: { points: 750, streakProtection: true, bonusMultiplier: 1.5 },
    color: "text-red-500",
    icon: "👑"
  },
  {
    level: 8,
    name: "Grandmaster",
    xpRequired: 2300,
    rewards: { points: 1000, streakProtection: true, bonusMultiplier: 1.6, specialTitle: "Grandmaster" },
    color: "text-yellow-500",
    icon: "🏆"
  },
  {
    level: 9,
    name: "Legend",
    xpRequired: 3000,
    rewards: { points: 1500, streakProtection: true, bonusMultiplier: 1.7, specialTitle: "Legend" },
    color: "text-pink-500",
    icon: "🌟"
  },
  {
    level: 10,
    name: "Mythic",
    xpRequired: 4000,
    rewards: { points: 2000, streakProtection: true, bonusMultiplier: 2.0, specialTitle: "Mythic" },
    color: "text-cyan-500",
    icon: "✨"
  }
];

/**
 * Get user's current level progress
 */
export const getUserLevelProgress = (): UserLevelProgress => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return calculateLevelProgress(data.totalXpEarned);
    }
  } catch (error) {
    console.error('Error loading user level progress:', error);
  }
  
  return calculateLevelProgress(0);
};

/**
 * Calculate level progress based on total XP
 */
const calculateLevelProgress = (totalXp: number): UserLevelProgress => {
  let currentLevel = 1;
  let nextLevelXp = DAILY_TASK_LEVELS[1].xpRequired;
  
  // Find current level
  for (let i = DAILY_TASK_LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= DAILY_TASK_LEVELS[i].xpRequired) {
      currentLevel = DAILY_TASK_LEVELS[i].level;
      nextLevelXp = i < DAILY_TASK_LEVELS.length - 1 ? DAILY_TASK_LEVELS[i + 1].xpRequired : DAILY_TASK_LEVELS[i].xpRequired;
      break;
    }
  }
  
  const currentLevelData = DAILY_TASK_LEVELS.find(l => l.level === currentLevel)!;
  const currentXp = totalXp - currentLevelData.xpRequired;
  const progressToNextLevel = currentLevel < DAILY_TASK_LEVELS.length ? 
    ((currentXp) / (nextLevelXp - currentLevelData.xpRequired)) * 100 : 100;
  
  return {
    currentLevel,
    currentXp,
    totalXpEarned: totalXp,
    nextLevelXp,
    progressToNextLevel: Math.min(progressToNextLevel, 100),
    levelUpRewards: currentLevelData.rewards
  };
};

/**
 * Add XP to user's total
 */
export const addXp = (xpAmount: number): { leveledUp: boolean; newLevel?: number; rewards?: any } => {
  try {
    const currentProgress = getUserLevelProgress();
    const newTotalXp = currentProgress.totalXpEarned + xpAmount;
    const newProgress = calculateLevelProgress(newTotalXp);
    
    // Save new total XP
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      totalXpEarned: newTotalXp,
      lastUpdated: Date.now()
    }));
    
    // Check if leveled up
    if (newProgress.currentLevel > currentProgress.currentLevel) {
      const newLevelData = DAILY_TASK_LEVELS.find(l => l.level === newProgress.currentLevel)!;
      return {
        leveledUp: true,
        newLevel: newProgress.currentLevel,
        rewards: newLevelData.rewards
      };
    }
    
    return { leveledUp: false };
  } catch (error) {
    console.error('Error adding XP:', error);
    return { leveledUp: false };
  }
};

/**
 * Get level data by level number
 */
export const getLevelData = (level: number): DailyTaskLevel | undefined => {
  return DAILY_TASK_LEVELS.find(l => l.level === level);
};

/**
 * Get all level data
 */
export const getAllLevels = (): DailyTaskLevel[] => {
  return DAILY_TASK_LEVELS;
};

/**
 * Calculate XP reward for completing daily tasks
 */
export const calculateXpReward = (completedTasks: number, streakMultiplier: number = 1): number => {
  const baseXp = completedTasks * 25; // 25 XP per completed task
  const bonusXp = completedTasks >= 5 ? 50 : 0; // Bonus for completing all tasks
  return Math.floor((baseXp + bonusXp) * streakMultiplier);
};

/**
 * Get level-up notification data
 */
export const getLevelUpNotification = (level: number): { title: string; message: string; rewards: string[] } => {
  const levelData = getLevelData(level);
  if (!levelData) {
    return { title: "Level Up!", message: "Congratulations!", rewards: [] };
  }
  
  const rewards: string[] = [];
  if (levelData.rewards.points > 0) {
    rewards.push(`${levelData.rewards.points} bonus points`);
  }
  if (levelData.rewards.streakProtection) {
    rewards.push("Streak protection enabled");
  }
  if (levelData.rewards.bonusMultiplier && levelData.rewards.bonusMultiplier > 1) {
    rewards.push(`${Math.round((levelData.rewards.bonusMultiplier - 1) * 100)}% XP bonus`);
  }
  if (levelData.rewards.specialTitle) {
    rewards.push(`Special title: ${levelData.rewards.specialTitle}`);
  }
  
  return {
    title: `Level ${level}: ${levelData.name}`,
    message: `You've reached level ${level}!`,
    rewards
  };
};




