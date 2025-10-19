import { getUserProfile, saveUserProfile } from './userStorage';

export interface LevelData {
  level: number;
  xpRequired: number;
  totalXpRequired: number;
  rewards: {
    coins: number;
    unlocks: string[];
  };
}

export interface UserProgress {
  level: number;
  currentXp: number;
  totalXp: number;
  coins: number;
  points: number;
  streak: number;
  achievements: string[];
}

// Balanced progression formula: Tiered system for optimal player experience
export const calculateLevelData = (level: number): LevelData => {
  let xpRequired: number;
  
  if (level <= 20) {
    xpRequired = 50; // Fast early progression (Levels 1-20)
  } else if (level <= 100) {
    xpRequired = 100; // Steady mid progression (Levels 21-100)
  } else {
    xpRequired = 150; // Slower but consistent high levels (Levels 101-200)
  }
  
  // Calculate total XP required to reach this level (cumulative)
  let totalXpRequired = 0;
  for (let i = 1; i < level; i++) {
    if (i <= 20) {
      totalXpRequired += 50;
    } else if (i <= 100) {
      totalXpRequired += 100;
    } else {
      totalXpRequired += 150;
    }
  }
  
  return {
    level,
    xpRequired,
    totalXpRequired,
    rewards: {
      coins: level * 25, // Reduced coin rewards for balance
      unlocks: level >= 10 ? ['premium_features'] : level >= 25 ? ['advanced_analytics'] : []
    }
  };
};

export const calculateLevelFromXp = (totalXp: number): { level: number; currentXp: number; xpToNext: number } => {
  let level = 1;
  let cumulativeXp = 0;
  
  // Calculate cumulative XP required for each level using new formula
  while (true) {
    let nextLevelXp: number;
    if (level <= 20) {
      nextLevelXp = 50;
    } else if (level <= 100) {
      nextLevelXp = 100;
    } else {
      nextLevelXp = 150;
    }
    
    if (cumulativeXp + nextLevelXp > totalXp) {
      break;
    }
    cumulativeXp += nextLevelXp;
    level++;
  }
  
  // Current XP is the remainder after reaching this level
  const currentXp = totalXp - cumulativeXp;
  // XP needed to reach next level
  let xpToNext: number;
  if (level <= 20) {
    xpToNext = 50 - currentXp;
  } else if (level <= 100) {
    xpToNext = 100 - currentXp;
  } else {
    xpToNext = 150 - currentXp;
  }
  
  return { level, currentXp, xpToNext };
};

export const getUserProgress = (): UserProgress => {
  try {
    const profile = getUserProfile();
    if (!profile) {
      return getDefaultProgress();
    }
    
    const { level, currentXp } = calculateLevelFromXp(profile.totalXp || 0);
    
    return {
      level,
      currentXp,
      totalXp: profile.totalXp || 0,
      coins: profile.coins || 0,
      points: profile.points || 0,
      streak: profile.streak || 0,
      achievements: profile.achievements || []
    };
  } catch (error) {
    console.error('Error getting user progress:', error);
    return getDefaultProgress();
  }
};

export const getDefaultProgress = (): UserProgress => ({
  level: 1,
  currentXp: 0,
  totalXp: 0,
  coins: 0,
  points: 0,
  streak: 0,
  achievements: []
});

export const addXp = (amount: number): { leveledUp: boolean; newLevel: number; rewards: any } => {
  try {
    const profile = getUserProfile();
    if (!profile) {
      throw new Error('No user profile found');
    }
    
    const oldLevel = calculateLevelFromXp(profile.totalXp || 0).level;
    const newTotalXp = (profile.totalXp || 0) + amount;
    const { level: newLevel } = calculateLevelFromXp(newTotalXp);
    
    const leveledUp = newLevel > oldLevel;
    const rewards = leveledUp ? calculateLevelData(newLevel).rewards : null;
    
    // Update profile
    const updatedProfile = {
      ...profile,
      totalXp: newTotalXp,
      level: newLevel,
      coins: (profile.coins || 0) + (rewards?.coins || 0)
    };
    
    saveUserProfile(updatedProfile);
    
    return {
      leveledUp,
      newLevel,
      rewards
    };
  } catch (error) {
    console.error('Error adding XP:', error);
    return { leveledUp: false, newLevel: 1, rewards: null };
  }
};

export const addCoins = (amount: number): boolean => {
  try {
    const profile = getUserProfile();
    if (!profile) {
      throw new Error('No user profile found');
    }
    
    const updatedProfile = {
      ...profile,
      coins: (profile.coins || 0) + amount
    };
    
    saveUserProfile(updatedProfile);
    return true;
  } catch (error) {
    console.error('Error adding coins:', error);
    return false;
  }
};

export const addPoints = (amount: number): boolean => {
  try {
    const profile = getUserProfile();
    if (!profile) {
      throw new Error('No user profile found');
    }
    
    const updatedProfile = {
      ...profile,
      points: (profile.points || 0) + amount
    };
    
    saveUserProfile(updatedProfile);
    return true;
  } catch (error) {
    console.error('Error adding points:', error);
    return false;
  }
};

export const addStreak = (amount: number): boolean => {
  try {
    const profile = getUserProfile();
    if (!profile) {
      throw new Error('No user profile found');
    }
    
    const updatedProfile = {
      ...profile,
      streak: (profile.streak || 0) + amount
    };
    
    saveUserProfile(updatedProfile);
    return true;
  } catch (error) {
    console.error('Error adding streak:', error);
    return false;
  }
};

export const setLevel = (level: number): boolean => {
  try {
    const profile = getUserProfile();
    if (!profile) {
      throw new Error('No user profile found');
    }
    
    // Calculate XP required for this level
    const levelData = calculateLevelData(level);
    const totalXpRequired = levelData.totalXpRequired;
    
    const updatedProfile = {
      ...profile,
      level,
      totalXp: totalXpRequired
    };
    
    saveUserProfile(updatedProfile);
    return true;
  } catch (error) {
    console.error('Error setting level:', error);
    return false;
  }
};

export const getLevelProgress = (): { level: number; currentXp: number; xpToNext: number; progress: number } => {
  const progress = getUserProgress();
  const { level, currentXp, xpToNext } = calculateLevelFromXp(progress.totalXp);
  
  // Calculate progress percentage correctly
  const totalXpForCurrentLevel = currentXp + xpToNext;
  const progressPercent = totalXpForCurrentLevel > 0 ? (currentXp / totalXpForCurrentLevel) * 100 : 0;
  
  return {
    level,
    currentXp,
    xpToNext,
    progress: Math.min(progressPercent, 100)
  };
};

export const calculateXpReward = (baseXp: number, streak: number = 0, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): number => {
  const difficultyMultiplier = {
    easy: 0.5,
    medium: 1,
    hard: 1.5
  };
  
  const streakMultiplier = 1 + (streak * 0.1);
  const difficultyBonus = difficultyMultiplier[difficulty];
  
  return Math.floor(baseXp * difficultyBonus * streakMultiplier);
};

export const getDailyTaskXpReward = (taskType: string, difficulty: 'easy' | 'medium' | 'hard'): number => {
  const baseRewards = {
    score: 25,
    streak: 50,
    time: 30,
    category: 75,
    custom: 20
  };
  
  const difficultyMultiplier = {
    easy: 1,
    medium: 1.5,
    hard: 2
  };
  
  const baseXp = baseRewards[taskType as keyof typeof baseRewards] || 20;
  return Math.floor(baseXp * difficultyMultiplier[difficulty]);
};

// New function for game completion XP rewards
export const calculateGameXpReward = (score: number, difficulty: 'easy' | 'medium' | 'hard'): number => {
  const baseRewards = {
    easy: 50,
    medium: 100,
    hard: 150
  };
  
  const baseXp = baseRewards[difficulty];
  const scoreBonus = Math.floor(score / 100) * 5; // 5 XP per 100 points
  const perfectBonus = score >= 1000 ? 25 : 0;
  
  return baseXp + scoreBonus + perfectBonus;
};

export const getLevelData = (level: number): LevelData => {
  return calculateLevelData(level);
};

export const getUserLevelProgress = (): { level: number; currentXp: number; xpToNext: number; progress: number } => {
  return getLevelProgress();
};

export const completeDailyTask = (taskId: string, xpReward: number): { leveledUp: boolean; newLevel: number; rewards: any } => {
  const result = addXp(xpReward);
  
  // Add bonus coins for completing daily tasks
  if (result.leveledUp) {
    addCoins(result.rewards?.coins || 0);
  }
  
  return result;
};

// Milestone system for special celebrations
export const MILESTONE_LEVELS = [10, 20, 50, 100, 150, 200];

export const checkMilestone = (level: number): boolean => {
  return MILESTONE_LEVELS.includes(level);
};

export const getMilestoneReward = (level: number): { coins: number; title: string } => {
  const rewards = {
    10: { coins: 500, title: "Getting Started" },
    20: { coins: 1000, title: "Rising Star" },
    50: { coins: 2500, title: "Expert Player" },
    100: { coins: 5000, title: "Master Gamer" },
    150: { coins: 7500, title: "Elite Champion" },
    200: { coins: 10000, title: "Legendary Hero" }
  };
  
  return rewards[level as keyof typeof rewards] || { coins: 0, title: "" };
};
