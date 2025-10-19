import { getUserProfile, saveUserProfile } from './userStorage';

export interface CoinTransaction {
  id: string;
  amount: number;
  type: 'earned' | 'spent';
  source: 'game' | 'daily_task' | 'achievement' | 'social' | 'referral' | 'login' | 'purchase' | 'mission';
  description: string;
  timestamp: number;
  metadata?: {
    gameId?: string;
    taskId?: string;
    achievementId?: string;
    socialPlatform?: string;
    referralCode?: string;
    itemId?: string;
    missionId?: string;
  };
}

export interface CoinRewards {
  gamePlayed: number;
  correctAnswer: number;
  streakMilestone: number;
  dailyTask: {
    easy: number;
    medium: number;
    hard: number;
  };
  achievement: {
    easy: number;
    medium: number;
    hard: number;
  };
  socialShare: number;
  referralSignup: number;
  socialFollow: number;
  dailyLogin: number;
  missionComplete: number;
}

export const DEFAULT_COIN_REWARDS: CoinRewards = {
  gamePlayed: 10,
  correctAnswer: 2,
  streakMilestone: 5,
  dailyTask: {
    easy: 25,
    medium: 50,
    hard: 100
  },
  achievement: {
    easy: 50,
    medium: 150,
    hard: 500
  },
  socialShare: 50,
  referralSignup: 200,
  socialFollow: 25,
  dailyLogin: 15,
  missionComplete: 100
};

export const DIFFICULTY_MULTIPLIERS = {
  easy: 1,
  medium: 1.5,
  hard: 2
};

export const addCoins = (amount: number, source: CoinTransaction['source'], description: string, metadata?: CoinTransaction['metadata']): boolean => {
  try {
    const profile = getUserProfile();
    if (!profile) {
      throw new Error('No user profile found');
    }

    const transaction: CoinTransaction = {
      id: `coin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      type: 'earned',
      source,
      description,
      timestamp: Date.now(),
      metadata
    };

    const updatedProfile = {
      ...profile,
      coins: (profile.coins || 0) + amount,
      coinHistory: [...(profile.coinHistory || []), transaction],
      lifetimeCoins: (profile.lifetimeCoins || 0) + amount
    };

    saveUserProfile(updatedProfile);
    return true;
  } catch (error) {
    console.error('Error adding coins:', error);
    return false;
  }
};

export const spendCoins = (amount: number, description: string, metadata?: CoinTransaction['metadata']): boolean => {
  try {
    const profile = getUserProfile();
    if (!profile) {
      throw new Error('No user profile found');
    }

    if ((profile.coins || 0) < amount) {
      return false; // Not enough coins
    }

    const transaction: CoinTransaction = {
      id: `coin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: -amount,
      type: 'spent',
      source: 'purchase',
      description,
      timestamp: Date.now(),
      metadata
    };

    const updatedProfile = {
      ...profile,
      coins: (profile.coins || 0) - amount,
      coinHistory: [...(profile.coinHistory || []), transaction]
    };

    saveUserProfile(updatedProfile);
    return true;
  } catch (error) {
    console.error('Error spending coins:', error);
    return false;
  }
};

export const getCoinBalance = (): number => {
  try {
    const profile = getUserProfile();
    return profile.coins || 0;
  } catch (error) {
    console.error('Error getting coin balance:', error);
    return 0;
  }
};

export const getCoinHistory = (): CoinTransaction[] => {
  try {
    const profile = getUserProfile();
    return profile.coinHistory || [];
  } catch (error) {
    console.error('Error getting coin history:', error);
    return [];
  }
};

export const getLifetimeCoins = (): number => {
  try {
    const profile = getUserProfile();
    return profile.lifetimeCoins || 0;
  } catch (error) {
    console.error('Error getting lifetime coins:', error);
    return 0;
  }
};

// Game-specific coin rewards
export const awardCoinsForGamePlayed = (difficulty: 'easy' | 'medium' | 'hard' = 'medium'): boolean => {
  const baseReward = DEFAULT_COIN_REWARDS.gamePlayed;
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty];
  const totalReward = Math.floor(baseReward * multiplier);
  
  return addCoins(
    totalReward,
    'game',
    `Game completed (${difficulty} difficulty)`,
    { gameId: `game_${Date.now()}` }
  );
};

export const awardCoinsForCorrectAnswer = (difficulty: 'easy' | 'medium' | 'hard' = 'medium'): boolean => {
  const baseReward = DEFAULT_COIN_REWARDS.correctAnswer;
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty];
  const totalReward = Math.floor(baseReward * multiplier);
  
  return addCoins(
    totalReward,
    'game',
    `Correct answer (${difficulty} difficulty)`,
    { gameId: `game_${Date.now()}` }
  );
};

export const awardCoinsForStreakMilestone = (streak: number): boolean => {
  const reward = DEFAULT_COIN_REWARDS.streakMilestone;
  
  return addCoins(
    reward,
    'game',
    `Streak milestone: ${streak}`,
    { gameId: `game_${Date.now()}` }
  );
};

export const awardCoinsForPersonalBest = (): boolean => {
  const reward = 25; // Bonus for personal best
  
  return addCoins(
    reward,
    'game',
    'Personal best achieved!',
    { gameId: `game_${Date.now()}` }
  );
};

// Daily task coin rewards
export const awardCoinsForDailyTask = (taskId: string, difficulty: 'easy' | 'medium' | 'hard'): boolean => {
  const reward = DEFAULT_COIN_REWARDS.dailyTask[difficulty];
  
  return addCoins(
    reward,
    'daily_task',
    `Daily task completed (${difficulty})`,
    { taskId }
  );
};

export const awardCoinsForAllTasksComplete = (): boolean => {
  const reward = 200; // Bonus for completing all daily tasks
  
  return addCoins(
    reward,
    'daily_task',
    'All daily tasks completed!',
    { taskId: 'all_tasks_bonus' }
  );
};

// Achievement coin rewards
export const awardCoinsForAchievement = (achievementId: string, difficulty: 'easy' | 'medium' | 'hard'): boolean => {
  const reward = DEFAULT_COIN_REWARDS.achievement[difficulty];
  
  return addCoins(
    reward,
    'achievement',
    `Achievement unlocked: ${achievementId}`,
    { achievementId }
  );
};

// Social coin rewards
export const awardCoinsForSocialShare = (platform: string): boolean => {
  const reward = DEFAULT_COIN_REWARDS.socialShare;
  
  return addCoins(
    reward,
    'social',
    `Shared to ${platform}`,
    { socialPlatform: platform }
  );
};

export const awardCoinsForReferralSignup = (referralCode: string): boolean => {
  const reward = DEFAULT_COIN_REWARDS.referralSignup;
  
  return addCoins(
    reward,
    'referral',
    'Referral signup bonus',
    { referralCode }
  );
};

export const awardCoinsForSocialFollow = (platform: string): boolean => {
  const reward = DEFAULT_COIN_REWARDS.socialFollow;
  
  return addCoins(
    reward,
    'social',
    `Followed ${platform}`,
    { socialPlatform: platform }
  );
};

// Daily login bonus
export const awardCoinsForDailyLogin = (streak: number = 1): boolean => {
  const baseReward = DEFAULT_COIN_REWARDS.dailyLogin;
  const streakBonus = Math.min(streak * 5, 50); // Max 50 bonus coins
  const totalReward = baseReward + streakBonus;
  
  return addCoins(
    totalReward,
    'login',
    `Daily login bonus (${streak} day streak)`,
    { missionId: 'daily_login' }
  );
};

// Mission coin rewards
export const awardCoinsForMission = (missionId: string, description: string): boolean => {
  const reward = DEFAULT_COIN_REWARDS.missionComplete;
  
  return addCoins(
    reward,
    'mission',
    description,
    { missionId }
  );
};

// Coin earning tips
export const getCoinEarningTips = (): string[] => {
  return [
    `Play games: ${DEFAULT_COIN_REWARDS.gamePlayed} coins per game`,
    `Correct answers: ${DEFAULT_COIN_REWARDS.correctAnswer} coins each`,
    `Streak milestones: ${DEFAULT_COIN_REWARDS.streakMilestone} coins each`,
    `Daily tasks: ${DEFAULT_COIN_REWARDS.dailyTask.easy}-${DEFAULT_COIN_REWARDS.dailyTask.hard} coins`,
    `Achievements: ${DEFAULT_COIN_REWARDS.achievement.easy}-${DEFAULT_COIN_REWARDS.achievement.hard} coins`,
    `Share scores: ${DEFAULT_COIN_REWARDS.socialShare} coins per share`,
    `Refer friends: ${DEFAULT_COIN_REWARDS.referralSignup} coins per signup`,
    `Follow socials: ${DEFAULT_COIN_REWARDS.socialFollow} coins per platform`,
    `Daily login: ${DEFAULT_COIN_REWARDS.dailyLogin} coins + streak bonus`
  ];
};

// Calculate potential daily earnings
export const calculateDailyEarningPotential = (): number => {
  const tips = getCoinEarningTips();
  // Rough estimate based on typical user behavior
  return (
    DEFAULT_COIN_REWARDS.gamePlayed * 5 + // 5 games
    DEFAULT_COIN_REWARDS.correctAnswer * 20 + // 20 correct answers
    DEFAULT_COIN_REWARDS.streakMilestone * 3 + // 3 streak milestones
    DEFAULT_COIN_REWARDS.dailyTask.medium * 3 + // 3 medium tasks
    DEFAULT_COIN_REWARDS.socialShare * 2 + // 2 shares
    DEFAULT_COIN_REWARDS.dailyLogin // Daily login
  );
};

