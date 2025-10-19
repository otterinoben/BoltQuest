import { useUserData } from '@/contexts/UserDataContext';

// Custom hooks for specific user data
export const useUserStats = () => {
  const { userData, isLoading, error } = useUserData();
  
  return {
    // Core stats
    level: userData.level,
    totalXp: userData.totalXp,
    coins: userData.coins,
    points: userData.points,
    streak: userData.streak,
    
    // Calculated stats
    currentXp: userData.currentXp,
    xpToNext: userData.xpToNext,
    levelProgress: userData.levelProgress,
    
    // Game stats
    totalGamesPlayed: userData.totalGamesPlayed,
    bestScore: userData.bestScore,
    averageAccuracy: userData.averageAccuracy,
    
    // ELO stats
    eloRating: userData.eloRating,
    eloCategory: userData.eloCategory,
    
    // Loading states
    isLoading,
    error
  };
};

export const useDailyTasks = () => {
  const { userData, isLoading, error } = useUserData();
  
  return {
    tasks: userData.dailyTasks,
    stats: userData.dailyStats,
    isLoading,
    error
  };
};

export const useRecentActivity = () => {
  const { userData, isLoading, error } = useUserData();
  
  return {
    recentGames: userData.recentGames,
    achievements: userData.achievements,
    isLoading,
    error
  };
};

export const useUserProfile = () => {
  const { userData, isLoading, error } = useUserData();
  
  return {
    id: userData.id,
    username: userData.username,
    email: userData.email,
    avatar: userData.avatar,
    createdAt: userData.createdAt,
    lastActive: userData.lastActive,
    isLoading,
    error
  };
};
