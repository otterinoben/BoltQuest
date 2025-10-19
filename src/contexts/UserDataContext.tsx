import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserProfile, saveUserProfile } from '@/lib/userStorage';
import { getCurrentDailyTasks, getDailyTaskStats } from '@/lib/dailyTaskManager';
import { getGameHistoryByUserId } from '@/lib/gameHistoryStorage';
import { getUnlockedAchievements } from '@/lib/simpleAchievements';
import { EloSystem } from '@/lib/eloSystem';

// Simplified user data interface
export interface UserData {
  id: string;
  username: string;
  level: number;
  totalXp: number;
  coins: number;
  points: number;
  streak: number;
  achievements: any[];
  currentXp: number;
  xpToNext: number;
  levelProgress: number;
  totalGamesPlayed: number;
  bestScore: number;
  averageAccuracy: number;
  totalCorrectAnswers: number;
  eloRating: number;
  eloCategory: string;
  dailyTasks: any[];
  dailyStats: any;
  recentGames: any[];
  isLoading: boolean;
  lastUpdated: number;
}

interface UserDataContextType {
  userData: UserData;
  refreshUserData: () => void;
  updateUserData: (updates: Partial<UserData>) => void;
  isLoading: boolean;
  error: string | null;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

// Simplified hook export
export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};

interface UserDataProviderProps {
  children: ReactNode;
}

export const UserDataProvider: React.FC<UserDataProviderProps> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>({
    id: '',
    username: 'Guest User',
    level: 1,
    totalXp: 0,
    coins: 0,
    points: 0,
    streak: 0,
    achievements: [],
    currentXp: 0,
    xpToNext: 50,
    levelProgress: 0,
    totalGamesPlayed: 0,
    bestScore: 0,
    averageAccuracy: 0,
    totalCorrectAnswers: 0,
    eloRating: 1000,
    eloCategory: 'Novice',
    dailyTasks: [],
    dailyStats: {},
    recentGames: [],
    isLoading: true,
    lastUpdated: 0
  });
  
  const [error, setError] = useState<string | null>(null);

  // Calculate level from XP
  const calculateLevelFromXp = (totalXp: number) => {
    const baseXp = 50;
    const level = Math.floor(totalXp / baseXp) + 1;
    const currentXp = totalXp % baseXp;
    const xpToNext = baseXp - currentXp;
    const levelProgress = (currentXp / baseXp) * 100;
    
    return { level, currentXp, xpToNext, levelProgress };
  };

  // Simplified refresh function
  const refreshUserData = () => {
    try {
      setUserData(prev => ({ ...prev, isLoading: true }));
      setError(null);
      
      // Get fresh profile data
      const profile = getUserProfile();
      if (!profile) {
        throw new Error('No user profile found');
      }
      
      // Calculate level data
      const { level, currentXp, xpToNext, levelProgress } = calculateLevelFromXp(profile.totalXp || 0);
      
      // Get ELO data
      const eloSystem = new EloSystem();
      const eloRating = eloSystem.getOverallRating();
      const eloCategory = eloSystem.getEloCategory(eloRating).label;
      
      // Get daily tasks and stats
      const dailyTasksData = getCurrentDailyTasks();
      const dailyTasks = dailyTasksData?.tasks || [];
      const dailyStats = getDailyTaskStats();
      
      // Get recent games
      const recentGames = getGameHistoryByUserId(profile.id).slice(0, 5);
      
      // Get achievements
      const achievements = getUnlockedAchievements();
      
      // Calculate game statistics
      const totalGamesPlayed = profile.statistics?.totalGamesPlayed || 0;
      const bestScore = profile.statistics?.bestScore || 0;
      const averageAccuracy = profile.statistics?.averageAccuracy || 0;
      const totalCorrectAnswers = profile.statistics?.totalCorrectAnswers || 0;
      
      // Update user data
      const updatedUserData: UserData = {
        id: profile.id,
        username: profile.username,
        level,
        totalXp: profile.totalXp || 0,
        coins: profile.coins || 0,
        points: profile.points || 0,
        streak: profile.streak || 0,
        achievements,
        currentXp,
        xpToNext,
        levelProgress,
        totalGamesPlayed,
        bestScore,
        averageAccuracy,
        totalCorrectAnswers,
        eloRating,
        eloCategory,
        dailyTasks,
        dailyStats,
        recentGames,
        isLoading: false,
        lastUpdated: Date.now()
      };
      
      setUserData(updatedUserData);
      
    } catch (err) {
      console.error('Error refreshing user data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user data');
      setUserData(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Update specific user data and persist
  const updateUserData = async (updates: Partial<UserData>) => {
    try {
      // Get current profile
      const profile = getUserProfile();
      if (!profile) {
        throw new Error('No user profile found');
      }
      
      // Update profile with new data
      const updatedProfile = {
        ...profile,
        level: updates.level ?? profile.level,
        totalXp: updates.totalXp ?? profile.totalXp,
        coins: updates.coins ?? profile.coins,
        points: updates.points ?? profile.points,
        streak: updates.streak ?? profile.streak,
        achievements: updates.achievements ?? profile.achievements,
        statistics: {
          ...profile.statistics,
          totalGamesPlayed: updates.totalGamesPlayed ?? profile.statistics?.totalGamesPlayed,
          bestScore: updates.bestScore ?? profile.statistics?.bestScore,
          averageAccuracy: updates.averageAccuracy ?? profile.statistics?.averageAccuracy,
          totalCorrectAnswers: updates.totalCorrectAnswers ?? profile.statistics?.totalCorrectAnswers,
        }
      };
      
      // Save to storage
      const saved = saveUserProfile(updatedProfile);
      if (!saved) {
        throw new Error('Failed to save user profile');
      }
      
      // Refresh all data to ensure consistency
      refreshUserData();
      
    } catch (err) {
      console.error('Error updating user data:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user data');
    }
  };

  // Initialize data on mount
  useEffect(() => {
    refreshUserData();
  }, []);

  // Auto-refresh every 30 seconds to keep data fresh
  useEffect(() => {
    const interval = setInterval(refreshUserData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh when window gains focus
  useEffect(() => {
    const handleFocus = () => refreshUserData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const value: UserDataContextType = {
    userData,
    refreshUserData,
    updateUserData,
    isLoading: userData.isLoading,
    error
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};