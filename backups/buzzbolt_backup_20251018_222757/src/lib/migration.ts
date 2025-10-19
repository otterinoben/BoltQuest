import { Migration, STORAGE_VERSION, STORAGE_KEYS } from '@/types/storage';
import { saveDataWithFeedback, loadDataWithFeedback, hasData } from '@/lib/storage';

/**
 * Data Migration System
 * Handles data migration and versioning for storage schema changes
 */

/**
 * Migration registry
 */
const migrations: Migration[] = [
  {
    version: '1.0.0',
    description: 'Initial migration - set up base storage structure',
    migrate: (data: any) => {
      // Initial migration - just ensure data has proper structure
      return {
        ...data,
        version: '1.0.0',
        migratedAt: Date.now(),
      };
    },
  },
  // Future migrations can be added here
  // {
  //   version: '1.1.0',
  //   description: 'Add new field to user profile',
  //   migrate: (data: any) => {
  //     return {
  //       ...data,
  //       newField: 'defaultValue',
  //     };
  //   },
  // },
];

/**
 * Get current storage version
 */
export const getCurrentStorageVersion = (): string => {
  try {
    const version = loadDataWithFeedback<string>(STORAGE_KEYS.STORAGE_VERSION);
    return version || '0.0.0';
  } catch (error) {
    return '0.0.0';
  }
};

/**
 * Set storage version
 */
export const setStorageVersion = (version: string): boolean => {
  return saveDataWithFeedback(STORAGE_KEYS.STORAGE_VERSION, version);
};

/**
 * Check if migration is needed
 */
export const isMigrationNeeded = (): boolean => {
  const currentVersion = getCurrentStorageVersion();
  return currentVersion !== STORAGE_VERSION;
};

/**
 * Get migration path from current version to target version
 */
export const getMigrationPath = (fromVersion: string, toVersion: string): Migration[] => {
  const fromIndex = migrations.findIndex(m => m.version === fromVersion);
  const toIndex = migrations.findIndex(m => m.version === toVersion);
  
  if (fromIndex === -1 || toIndex === -1) {
    throw new Error(`Invalid version: ${fromVersion} or ${toVersion}`);
  }
  
  if (fromIndex >= toIndex) {
    return []; // No migration needed
  }
  
  return migrations.slice(fromIndex + 1, toIndex + 1);
};

/**
 * Migrate data from one version to another
 */
export const migrateData = (data: any, fromVersion: string, toVersion: string): any => {
  const migrationPath = getMigrationPath(fromVersion, toVersion);
  
  let migratedData = data;
  
  for (const migration of migrationPath) {
    try {
      migratedData = migration.migrate(migratedData);
      console.log(`Applied migration ${migration.version}: ${migration.description}`);
    } catch (error) {
      console.error(`Migration ${migration.version} failed:`, error);
      throw new Error(`Migration ${migration.version} failed: ${error}`);
    }
  }
  
  return migratedData;
};

/**
 * Rollback data to previous version
 */
export const rollbackData = (data: any, fromVersion: string, toVersion: string): any => {
  const migrationPath = getMigrationPath(toVersion, fromVersion);
  
  let rolledBackData = data;
  
  for (const migration of migrationPath.reverse()) {
    if (migration.rollback) {
      try {
        rolledBackData = migration.rollback(rolledBackData);
        console.log(`Applied rollback ${migration.version}: ${migration.description}`);
      } catch (error) {
        console.error(`Rollback ${migration.version} failed:`, error);
        throw new Error(`Rollback ${migration.version} failed: ${error}`);
      }
    }
  }
  
  return rolledBackData;
};

/**
 * Perform full storage migration
 */
export const performStorageMigration = (): boolean => {
  try {
    const currentVersion = getCurrentStorageVersion();
    
    if (currentVersion === STORAGE_VERSION) {
      console.log('No migration needed');
      return true;
    }
    
    console.log(`Migrating storage from ${currentVersion} to ${STORAGE_VERSION}`);
    
    // Migrate user profile
    if (hasData(STORAGE_KEYS.USER_PROFILE)) {
      const userProfile = loadDataWithFeedback(STORAGE_KEYS.USER_PROFILE);
      if (userProfile) {
        const migratedProfile = migrateData(userProfile, currentVersion, STORAGE_VERSION);
        saveDataWithFeedback(STORAGE_KEYS.USER_PROFILE, migratedProfile);
      }
    }
    
    // Migrate user preferences
    if (hasData(STORAGE_KEYS.USER_PREFERENCES)) {
      const userPreferences = loadDataWithFeedback(STORAGE_KEYS.USER_PREFERENCES);
      if (userPreferences) {
        const migratedPreferences = migrateData(userPreferences, currentVersion, STORAGE_VERSION);
        saveDataWithFeedback(STORAGE_KEYS.USER_PREFERENCES, migratedPreferences);
      }
    }
    
    // Migrate user statistics
    if (hasData(STORAGE_KEYS.USER_STATISTICS)) {
      const userStatistics = loadDataWithFeedback(STORAGE_KEYS.USER_STATISTICS);
      if (userStatistics) {
        const migratedStatistics = migrateData(userStatistics, currentVersion, STORAGE_VERSION);
        saveDataWithFeedback(STORAGE_KEYS.USER_STATISTICS, migratedStatistics);
      }
    }
    
    // Migrate game history
    if (hasData(STORAGE_KEYS.GAME_HISTORY)) {
      const gameHistory = loadDataWithFeedback(STORAGE_KEYS.GAME_HISTORY);
      if (gameHistory) {
        const migratedHistory = migrateData(gameHistory, currentVersion, STORAGE_VERSION);
        saveDataWithFeedback(STORAGE_KEYS.GAME_HISTORY, migratedHistory);
      }
    }
    
    // Migrate high scores
    if (hasData(STORAGE_KEYS.HIGH_SCORES)) {
      const highScores = loadDataWithFeedback(STORAGE_KEYS.HIGH_SCORES);
      if (highScores) {
        const migratedScores = migrateData(highScores, currentVersion, STORAGE_VERSION);
        saveDataWithFeedback(STORAGE_KEYS.HIGH_SCORES, migratedScores);
      }
    }
    
    // Migrate leaderboards
    if (hasData(STORAGE_KEYS.LEADERBOARDS)) {
      const leaderboards = loadDataWithFeedback(STORAGE_KEYS.LEADERBOARDS);
      if (leaderboards) {
        const migratedLeaderboards = migrateData(leaderboards, currentVersion, STORAGE_VERSION);
        saveDataWithFeedback(STORAGE_KEYS.LEADERBOARDS, migratedLeaderboards);
      }
    }
    
    // Migrate achievements - REMOVED (no longer using achievements)
    
    // Update storage version
    setStorageVersion(STORAGE_VERSION);
    
    console.log('Storage migration completed successfully');
    return true;
  } catch (error) {
    console.error('Storage migration failed:', error);
    return false;
  }
};

/**
 * Validate data integrity after migration
 */
export const validateDataIntegrity = (): boolean => {
  try {
    // Validate user profile
    if (hasData(STORAGE_KEYS.USER_PROFILE)) {
      const userProfile = loadDataWithFeedback(STORAGE_KEYS.USER_PROFILE);
      if (userProfile && !userProfile.id) {
        console.error('User profile validation failed: missing ID');
        return false;
      }
    }
    
    // Validate game history
    if (hasData(STORAGE_KEYS.GAME_HISTORY)) {
      const gameHistory = loadDataWithFeedback(STORAGE_KEYS.GAME_HISTORY);
      if (Array.isArray(gameHistory)) {
        for (const game of gameHistory) {
          if (!game.id || !game.userId || !game.category || !game.difficulty) {
            console.error('Game history validation failed: missing required fields');
            return false;
          }
        }
      }
    }
    
    // Validate high scores
    if (hasData(STORAGE_KEYS.HIGH_SCORES)) {
      const highScores = loadDataWithFeedback(STORAGE_KEYS.HIGH_SCORES);
      if (Array.isArray(highScores)) {
        for (const score of highScores) {
          if (!score.id || !score.userId || typeof score.score !== 'number') {
            console.error('High scores validation failed: missing required fields');
            return false;
          }
        }
      }
    }
    
    console.log('Data integrity validation passed');
    return true;
  } catch (error) {
    console.error('Data integrity validation failed:', error);
    return false;
  }
};

/**
 * Get migration status
 */
export const getMigrationStatus = () => {
  const currentVersion = getCurrentStorageVersion();
  const targetVersion = STORAGE_VERSION;
  const needsMigration = isMigrationNeeded();
  
  return {
    currentVersion,
    targetVersion,
    needsMigration,
    migrationPath: needsMigration ? getMigrationPath(currentVersion, targetVersion) : [],
  };
};

/**
 * Initialize storage system
 */
export const initializeStorage = (): boolean => {
  try {
    console.log('Initializing storage system...');
    
    // Check if migration is needed
    if (isMigrationNeeded()) {
      console.log('Migration needed, performing migration...');
      const migrationSuccess = performStorageMigration();
      
      if (!migrationSuccess) {
        console.error('Migration failed');
        return false;
      }
    }
    
    // Validate data integrity
    const integrityValid = validateDataIntegrity();
    
    if (!integrityValid) {
      console.error('Data integrity validation failed');
      return false;
    }
    
    console.log('Storage system initialized successfully');
    return true;
  } catch (error) {
    console.error('Storage initialization failed:', error);
    return false;
  }
};

/**
 * Reset storage to clean state
 */
export const resetStorage = (): boolean => {
  try {
    console.log('Resetting storage to clean state...');
    
    // Clear all data
    const keys = Object.values(STORAGE_KEYS);
    keys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Failed to remove key ${key}:`, error);
      }
    });
    
    // Set version to current
    setStorageVersion(STORAGE_VERSION);
    
    console.log('Storage reset completed');
    return true;
  } catch (error) {
    console.error('Storage reset failed:', error);
    return false;
  }
};

/**
 * Export storage data for backup
 */
export const exportStorageData = (): string => {
  try {
    const exportData: Record<string, any> = {};
    
    // Export all storage keys
    const keys = Object.values(STORAGE_KEYS);
    keys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          exportData[key] = JSON.parse(data);
        }
      } catch (error) {
        console.warn(`Failed to export key ${key}:`, error);
      }
    });
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Storage export failed:', error);
    return '{}';
  }
};

/**
 * Import storage data from backup
 */
export const importStorageData = (jsonData: string): boolean => {
  try {
    const importData = JSON.parse(jsonData);
    
    // Import all storage keys
    Object.entries(importData).forEach(([key, data]) => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
        console.warn(`Failed to import key ${key}:`, error);
      }
    });
    
    console.log('Storage import completed');
    return true;
  } catch (error) {
    console.error('Storage import failed:', error);
    return false;
  }
};
