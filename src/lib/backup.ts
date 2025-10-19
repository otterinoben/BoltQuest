import { Backup, STORAGE_KEYS } from '@/types/storage';
import { 
  saveDataWithFeedback, 
  loadDataWithFeedback, 
  getDataWithFallback,
  hasData,
  removeData,
  getStorageSize,
  getMaxStorageSize
} from '@/lib/storage';
import { UserProfile, UserPreferences, UserStatistics, GameHistory, HighScore, Leaderboard, Achievement } from '@/types/storage';

/**
 * Backup and Recovery System
 * Handles data backup, recovery, and validation
 */

/**
 * Generate a unique backup ID
 */
export const generateBackupId = (): string => {
  return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Calculate checksum for data integrity
 */
export const calculateChecksum = (data: any): string => {
  const jsonString = JSON.stringify(data);
  let hash = 0;
  
  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return hash.toString(16);
};

/**
 * Create a backup of all storage data
 */
export const createBackup = (): Backup | null => {
  try {
    const backupId = generateBackupId();
    const createdAt = Date.now();
    
    // Collect all data
    const backupData: Backup['data'] = {};
    
    // User profile
    if (hasData(STORAGE_KEYS.USER_PROFILE)) {
      backupData.userProfile = loadDataWithFeedback<UserProfile>(STORAGE_KEYS.USER_PROFILE);
    }
    
    // User preferences
    if (hasData(STORAGE_KEYS.USER_PREFERENCES)) {
      backupData.userPreferences = loadDataWithFeedback<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES);
    }
    
    // User statistics
    if (hasData(STORAGE_KEYS.USER_STATISTICS)) {
      backupData.userStatistics = loadDataWithFeedback<UserStatistics>(STORAGE_KEYS.USER_STATISTICS);
    }
    
    // Game history
    if (hasData(STORAGE_KEYS.GAME_HISTORY)) {
      backupData.gameHistory = loadDataWithFeedback<GameHistory[]>(STORAGE_KEYS.GAME_HISTORY);
    }
    
    // High scores
    if (hasData(STORAGE_KEYS.HIGH_SCORES)) {
      backupData.highScores = loadDataWithFeedback<HighScore[]>(STORAGE_KEYS.HIGH_SCORES);
    }
    
    // Leaderboards
    if (hasData(STORAGE_KEYS.LEADERBOARDS)) {
      backupData.leaderboards = loadDataWithFeedback<Leaderboard[]>(STORAGE_KEYS.LEADERBOARDS);
    }
    
    // Achievements - REMOVED (no longer using achievements)
    
    // Calculate backup size
    const backupString = JSON.stringify(backupData);
    const size = new Blob([backupString]).size;
    
    // Calculate checksum
    const checksum = calculateChecksum(backupData);
    
    const backup: Backup = {
      id: backupId,
      createdAt,
      version: '1.0.0',
      data: backupData,
      size,
      checksum,
    };
    
    return backup;
  } catch (error) {
    console.error('Failed to create backup:', error);
    return null;
  }
};

/**
 * Save backup to storage
 */
export const saveBackup = (backup: Backup): boolean => {
  try {
    const backupKey = `backup_${backup.id}`;
    return saveDataWithFeedback(backupKey, backup);
  } catch (error) {
    console.error('Failed to save backup:', error);
    return false;
  }
};

/**
 * Load backup from storage
 */
export const loadBackup = (backupId: string): Backup | null => {
  try {
    const backupKey = `backup_${backupId}`;
    return loadDataWithFeedback<Backup>(backupKey);
  } catch (error) {
    console.error('Failed to load backup:', error);
    return null;
  }
};

/**
 * Get all available backups
 */
export const getAllBackups = (): Backup[] => {
  try {
    const backups: Backup[] = [];
    
    // Get all keys that start with 'backup_'
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('backup_')) {
        try {
          const backup = loadDataWithFeedback<Backup>(key);
          if (backup && backup.id && backup.createdAt) {
            backups.push(backup);
          }
        } catch (error) {
          console.warn(`Failed to load backup ${key}:`, error);
        }
      }
    }
    
    // Sort by creation date (newest first)
    backups.sort((a, b) => b.createdAt - a.createdAt);
    
    return backups;
  } catch (error) {
    console.error('Failed to get all backups:', error);
    return [];
  }
};

/**
 * Restore data from backup
 */
export const restoreFromBackup = (backup: Backup): boolean => {
  try {
    // Validate backup integrity
    const expectedChecksum = calculateChecksum(backup.data);
    if (expectedChecksum !== backup.checksum) {
      throw new Error('Backup checksum validation failed');
    }
    
    // Restore user profile
    if (backup.data.userProfile) {
      saveDataWithFeedback(STORAGE_KEYS.USER_PROFILE, backup.data.userProfile);
    }
    
    // Restore user preferences
    if (backup.data.userPreferences) {
      saveDataWithFeedback(STORAGE_KEYS.USER_PREFERENCES, backup.data.userPreferences);
    }
    
    // Restore user statistics
    if (backup.data.userStatistics) {
      saveDataWithFeedback(STORAGE_KEYS.USER_STATISTICS, backup.data.userStatistics);
    }
    
    // Restore game history
    if (backup.data.gameHistory) {
      saveDataWithFeedback(STORAGE_KEYS.GAME_HISTORY, backup.data.gameHistory);
    }
    
    // Restore high scores
    if (backup.data.highScores) {
      saveDataWithFeedback(STORAGE_KEYS.HIGH_SCORES, backup.data.highScores);
    }
    
    // Restore leaderboards
    if (backup.data.leaderboards) {
      saveDataWithFeedback(STORAGE_KEYS.LEADERBOARDS, backup.data.leaderboards);
    }
    
    // Restore achievements
    if (backup.data.achievements) {
      saveDataWithFeedback(STORAGE_KEYS.ACHIEVEMENTS, backup.data.achievements);
    }
    
    console.log('Data restored from backup successfully');
    return true;
  } catch (error) {
    console.error('Failed to restore from backup:', error);
    return false;
  }
};

/**
 * Delete backup
 */
export const deleteBackup = (backupId: string): boolean => {
  try {
    const backupKey = `backup_${backupId}`;
    removeData(backupKey);
    return true;
  } catch (error) {
    console.error('Failed to delete backup:', error);
    return false;
  }
};

/**
 * Clean up old backups
 */
export const cleanupOldBackups = (maxBackups: number = 5): boolean => {
  try {
    const backups = getAllBackups();
    
    if (backups.length <= maxBackups) {
      return true; // No cleanup needed
    }
    
    // Keep only the most recent backups
    const backupsToKeep = backups.slice(0, maxBackups);
    const backupsToDelete = backups.slice(maxBackups);
    
    // Delete old backups
    backupsToDelete.forEach(backup => {
      deleteBackup(backup.id);
    });
    
    console.log(`Cleaned up ${backupsToDelete.length} old backups`);
    return true;
  } catch (error) {
    console.error('Failed to cleanup old backups:', error);
    return false;
  }
};

/**
 * Export backup to JSON string
 */
export const exportBackup = (backup: Backup): string => {
  return JSON.stringify(backup, null, 2);
};

/**
 * Import backup from JSON string
 */
export const importBackup = (jsonData: string): Backup | null => {
  try {
    const backup = JSON.parse(jsonData);
    
    // Validate backup structure
    if (!backup.id || !backup.createdAt || !backup.data) {
      throw new Error('Invalid backup structure');
    }
    
    // Validate checksum
    const expectedChecksum = calculateChecksum(backup.data);
    if (expectedChecksum !== backup.checksum) {
      throw new Error('Backup checksum validation failed');
    }
    
    return backup;
  } catch (error) {
    console.error('Failed to import backup:', error);
    return null;
  }
};

/**
 * Get backup statistics
 */
export const getBackupStatistics = () => {
  const backups = getAllBackups();
  
  if (backups.length === 0) {
    return {
      totalBackups: 0,
      totalSize: 0,
      averageSize: 0,
      oldestBackup: null,
      newestBackup: null,
      storageUsage: 0,
    };
  }
  
  const totalBackups = backups.length;
  const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
  const averageSize = totalSize / totalBackups;
  const oldestBackup = backups[backups.length - 1];
  const newestBackup = backups[0];
  
  const currentStorageSize = getStorageSize();
  const maxStorageSize = getMaxStorageSize();
  const storageUsage = (currentStorageSize / maxStorageSize) * 100;
  
  return {
    totalBackups,
    totalSize,
    averageSize: Math.round(averageSize),
    oldestBackup: oldestBackup.createdAt,
    newestBackup: newestBackup.createdAt,
    storageUsage: Math.round(storageUsage * 100) / 100,
  };
};

/**
 * Validate backup integrity
 */
export const validateBackupIntegrity = (backup: Backup): boolean => {
  try {
    // Check required fields
    if (!backup.id || !backup.createdAt || !backup.data || !backup.checksum) {
      return false;
    }
    
    // Validate checksum
    const expectedChecksum = calculateChecksum(backup.data);
    if (expectedChecksum !== backup.checksum) {
      return false;
    }
    
    // Validate data structure
    if (backup.data.userProfile && !backup.data.userProfile.id) {
      return false;
    }
    
    if (backup.data.gameHistory && !Array.isArray(backup.data.gameHistory)) {
      return false;
    }
    
    if (backup.data.highScores && !Array.isArray(backup.data.highScores)) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Backup integrity validation failed:', error);
    return false;
  }
};

/**
 * Create automatic backup
 */
export const createAutomaticBackup = (): boolean => {
  try {
    const backup = createBackup();
    
    if (!backup) {
      return false;
    }
    
    const saved = saveBackup(backup);
    
    if (saved) {
      // Clean up old backups
      cleanupOldBackups(5);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to create automatic backup:', error);
    return false;
  }
};

/**
 * Get backup recommendations
 */
export const getBackupRecommendations = () => {
  const stats = getBackupStatistics();
  const recommendations: string[] = [];
  
  if (stats.totalBackups === 0) {
    recommendations.push('Create your first backup to protect your data');
  } else if (stats.totalBackups < 3) {
    recommendations.push('Consider creating more backups for better data protection');
  }
  
  if (stats.storageUsage > 80) {
    recommendations.push('Storage usage is high - consider cleaning up old backups');
  }
  
  if (stats.totalBackups > 10) {
    recommendations.push('You have many backups - consider cleaning up old ones');
  }
  
  return recommendations;
};

/**
 * Initialize backup system
 */
export const initializeBackupSystem = (): boolean => {
  try {
    console.log('Initializing backup system...');
    
    // Create initial backup if none exists
    const backups = getAllBackups();
    if (backups.length === 0) {
      console.log('No backups found, creating initial backup...');
      createAutomaticBackup();
    }
    
    console.log('Backup system initialized successfully');
    return true;
  } catch (error) {
    console.error('Backup system initialization failed:', error);
    return false;
  }
};
