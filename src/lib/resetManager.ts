/**
 * Comprehensive Reset Manager
 * Handles complete data reset functionality with UX considerations
 */

import { STORAGE_KEYS } from '@/types/storage';
import { resetUserStatistics } from '@/lib/userStorage';
import { clearGameHistory } from '@/lib/gameHistoryStorage';
import { clearAllHighScores } from '@/lib/highScoreStorage';
import { clearAllData } from '@/lib/storage';
import { resetStorage } from '@/lib/migration';

export interface ResetOptions {
  completeReset?: boolean;
  keepProfile?: boolean;
  keepPreferences?: boolean;
  resetStatistics?: boolean;
  resetGameHistory?: boolean;
  resetAchievements?: boolean;
  resetDailyTasks?: boolean;
  resetTutorials?: boolean;
}

export interface ResetResult {
  success: boolean;
  resetItems: string[];
  errors: string[];
}

/**
 * Reset all user data with comprehensive cleanup
 */
export const performCompleteReset = async (options: ResetOptions = {}): Promise<ResetResult> => {
  const result: ResetResult = {
    success: true,
    resetItems: [],
    errors: []
  };

  try {
    console.log('Starting comprehensive data reset...');

    // Reset user statistics
    if (options.resetStatistics !== false) {
      try {
        resetUserStatistics();
        result.resetItems.push('User Statistics');
      } catch (error) {
        result.errors.push('Failed to reset user statistics');
        console.error('Statistics reset error:', error);
      }
    }

    // Clear game history
    if (options.resetGameHistory !== false) {
      try {
        clearGameHistory();
        result.resetItems.push('Game History');
      } catch (error) {
        result.errors.push('Failed to clear game history');
        console.error('Game history clear error:', error);
      }
    }

    // Clear high scores
    try {
      clearAllHighScores();
      result.resetItems.push('High Scores');
    } catch (error) {
      result.errors.push('Failed to clear high scores');
      console.error('High scores clear error:', error);
    }

    // Clear tutorial data
    if (options.resetTutorials !== false) {
      try {
        const tutorialKeys = [
          'tutorialState',
          'tutorialProgress', 
          'tutorialPreferences',
          'tutorialAnalytics',
          'tutorialVersion'
        ];
        tutorialKeys.forEach(key => {
          localStorage.removeItem(key);
        });
        result.resetItems.push('Tutorial Data');
      } catch (error) {
        result.errors.push('Failed to clear tutorial data');
        console.error('Tutorial clear error:', error);
      }
    }

    // Clear daily tasks
    if (options.resetDailyTasks !== false) {
      try {
        const dailyTaskKeys = [
          'dailyTasks',
          'dailyTaskProgress',
          'dailyTaskHistory',
          'dailyTaskLevels'
        ];
        dailyTaskKeys.forEach(key => {
          localStorage.removeItem(key);
        });
        result.resetItems.push('Daily Tasks');
      } catch (error) {
        result.errors.push('Failed to clear daily tasks');
        console.error('Daily tasks clear error:', error);
      }
    }

    // Clear achievements
    try {
      localStorage.removeItem('achievements');
      localStorage.removeItem('achievementProgress');
      result.resetItems.push('Achievements');
    } catch (error) {
      result.errors.push('Failed to clear achievements');
      console.error('Achievements clear error:', error);
    }

    // Complete reset - clear everything
    if (options.completeReset) {
      try {
        // Clear all BuzzBolt-specific data
        const allKeys = Object.values(STORAGE_KEYS);
        allKeys.forEach(key => {
          localStorage.removeItem(key);
        });

        // Clear any additional keys that might exist
        const additionalKeys = [
          'buzzbolt_',
          'tutorial',
          'dailyTask',
          'achievement'
        ];

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && additionalKeys.some(prefix => key.startsWith(prefix))) {
            localStorage.removeItem(key);
          }
        }

        result.resetItems.push('Complete Data Reset');
      } catch (error) {
        result.errors.push('Failed to perform complete reset');
        console.error('Complete reset error:', error);
      }
    }

    // Reset storage version
    try {
      localStorage.setItem(STORAGE_KEYS.STORAGE_VERSION, '1.0.0');
      result.resetItems.push('Storage Version');
    } catch (error) {
      result.errors.push('Failed to reset storage version');
      console.error('Storage version reset error:', error);
    }

    console.log('Reset completed:', result);
    return result;

  } catch (error) {
    console.error('Reset operation failed:', error);
    result.success = false;
    result.errors.push('Reset operation failed');
    return result;
  }
};

/**
 * Get reset preview - shows what will be reset without actually resetting
 */
export const getResetPreview = (): string[] => {
  const items: string[] = [];
  
  // Check what data exists
  const keys = Object.values(STORAGE_KEYS);
  keys.forEach(key => {
    if (localStorage.getItem(key)) {
      switch (key) {
        case STORAGE_KEYS.USER_PROFILE:
          items.push('User Profile');
          break;
        case STORAGE_KEYS.USER_PREFERENCES:
          items.push('User Preferences');
          break;
        case STORAGE_KEYS.USER_STATISTICS:
          items.push('User Statistics');
          break;
        case STORAGE_KEYS.GAME_HISTORY:
          items.push('Game History');
          break;
        case STORAGE_KEYS.HIGH_SCORES:
          items.push('High Scores');
          break;
        case STORAGE_KEYS.LEADERBOARDS:
          items.push('Leaderboard Data');
          break;
        case STORAGE_KEYS.SAVED_GAME:
          items.push('Saved Games');
          break;
      }
    }
  });

  // Check for additional data
  const additionalChecks = [
    { key: 'tutorialState', name: 'Tutorial Progress' },
    { key: 'dailyTasks', name: 'Daily Tasks' },
    { key: 'achievements', name: 'Achievements' }
  ];

  additionalChecks.forEach(({ key, name }) => {
    if (localStorage.getItem(key)) {
      items.push(name);
    }
  });

  return items;
};

/**
 * Create backup before reset
 */
export const createBackupBeforeReset = (): string => {
  const backup: Record<string, any> = {};
  
  // Backup all BuzzBolt data
  const keys = Object.values(STORAGE_KEYS);
  keys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      backup[key] = data;
    }
  });

  // Backup additional data
  const additionalKeys = ['tutorialState', 'dailyTasks', 'achievements'];
  additionalKeys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      backup[key] = data;
    }
  });

  return JSON.stringify(backup, null, 2);
};



