/**
 * Tutorial Storage System
 * Handles persistence of tutorial progress, preferences, and analytics
 */

import { 
  TutorialState, 
  TutorialProgress, 
  TutorialPreferences, 
  TutorialAnalytics,
  TutorialStorage as ITutorialStorage
} from '@/types/tutorial';

const STORAGE_KEYS = {
  TUTORIAL_STATE: 'tutorialState',
  TUTORIAL_PROGRESS: 'tutorialProgress',
  TUTORIAL_PREFERENCES: 'tutorialPreferences',
  TUTORIAL_ANALYTICS: 'tutorialAnalytics',
  TUTORIAL_VERSION: 'tutorialVersion'
} as const;

const CURRENT_VERSION = '1.0.0';

class TutorialStorage implements ITutorialStorage {
  private isAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && 'localStorage' in window;
    } catch {
      return false;
    }
  }

  private getStorageKey(key: string, tutorialId?: string, userId?: string): string {
    const baseKey = `boltquest_${key}`;
    if (tutorialId && userId) {
      return `${baseKey}_${tutorialId}_${userId}`;
    }
    return baseKey;
  }

  private safeGetItem(key: string): string | null {
    if (!this.isAvailable()) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  private safeSetItem(key: string, value: string): boolean {
    if (!this.isAvailable()) return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  }

  private safeRemoveItem(key: string): boolean {
    if (!this.isAvailable()) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }

  async saveProgress(progress: TutorialProgress): Promise<void> {
    const key = this.getStorageKey(STORAGE_KEYS.TUTORIAL_PROGRESS, progress.tutorialId, progress.userId);
    const success = this.safeSetItem(key, JSON.stringify({
      ...progress,
      lastSaved: new Date().toISOString()
    }));
    
    if (!success) {
      throw new Error('Failed to save tutorial progress');
    }
  }

  async loadProgress(tutorialId: string, userId: string): Promise<TutorialProgress | null> {
    const key = this.getStorageKey(STORAGE_KEYS.TUTORIAL_PROGRESS, tutorialId, userId);
    const data = this.safeGetItem(key);
    
    if (!data) return null;
    
    try {
      const progress = JSON.parse(data);
      // Convert date strings back to Date objects
      progress.startTime = new Date(progress.startTime);
      progress.lastActive = new Date(progress.lastActive);
      return progress;
    } catch (error) {
      console.error('Error parsing tutorial progress:', error);
      return null;
    }
  }

  async savePreferences(preferences: TutorialPreferences): Promise<void> {
    const key = this.getStorageKey(STORAGE_KEYS.TUTORIAL_PREFERENCES);
    const success = this.safeSetItem(key, JSON.stringify({
      ...preferences,
      lastUpdated: new Date().toISOString()
    }));
    
    if (!success) {
      throw new Error('Failed to save tutorial preferences');
    }
  }

  async loadPreferences(): Promise<TutorialPreferences | null> {
    const key = this.getStorageKey(STORAGE_KEYS.TUTORIAL_PREFERENCES);
    const data = this.safeGetItem(key);
    
    if (!data) return null;
    
    try {
      const preferences = JSON.parse(data);
      return preferences;
    } catch (error) {
      console.error('Error parsing tutorial preferences:', error);
      return null;
    }
  }

  async saveAnalytics(analytics: TutorialAnalytics): Promise<void> {
    const key = this.getStorageKey(STORAGE_KEYS.TUTORIAL_ANALYTICS, analytics.tutorialId, analytics.userId);
    const success = this.safeSetItem(key, JSON.stringify({
      ...analytics,
      lastSaved: new Date().toISOString()
    }));
    
    if (!success) {
      throw new Error('Failed to save tutorial analytics');
    }
  }

  async loadAnalytics(tutorialId: string, userId: string): Promise<TutorialAnalytics | null> {
    const key = this.getStorageKey(STORAGE_KEYS.TUTORIAL_ANALYTICS, tutorialId, userId);
    const data = this.safeGetItem(key);
    
    if (!data) return null;
    
    try {
      const analytics = JSON.parse(data);
      // Convert date strings back to Date objects
      analytics.startTime = new Date(analytics.startTime);
      if (analytics.endTime) {
        analytics.endTime = new Date(analytics.endTime);
      }
      return analytics;
    } catch (error) {
      console.error('Error parsing tutorial analytics:', error);
      return null;
    }
  }

  async clearData(): Promise<void> {
    if (!this.isAvailable()) return;
    
    try {
      // Get all keys that start with our prefix
      const keys = Object.keys(localStorage).filter(key => key.startsWith('boltquest_'));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing tutorial data:', error);
      throw new Error('Failed to clear tutorial data');
    }
  }

  async exportData(): Promise<string> {
    if (!this.isAvailable()) return '{}';
    
    try {
      const data: Record<string, any> = {};
      const keys = Object.keys(localStorage).filter(key => key.startsWith('boltquest_'));
      
      keys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          data[key] = JSON.parse(value);
        }
      });
      
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting tutorial data:', error);
      throw new Error('Failed to export tutorial data');
    }
  }

  async importData(data: string): Promise<void> {
    if (!this.isAvailable()) return;
    
    try {
      const parsedData = JSON.parse(data);
      
      Object.entries(parsedData).forEach(([key, value]) => {
        if (key.startsWith('boltquest_')) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      });
    } catch (error) {
      console.error('Error importing tutorial data:', error);
      throw new Error('Failed to import tutorial data');
    }
  }

  // Helper methods for tutorial state management
  async saveTutorialState(state: TutorialState): Promise<void> {
    const key = this.getStorageKey(STORAGE_KEYS.TUTORIAL_STATE, state.tutorialId);
    const success = this.safeSetItem(key, JSON.stringify({
      ...state,
      lastSaved: new Date().toISOString()
    }));
    
    if (!success) {
      throw new Error('Failed to save tutorial state');
    }
  }

  async loadTutorialState(tutorialId: string): Promise<TutorialState | null> {
    const key = this.getStorageKey(STORAGE_KEYS.TUTORIAL_STATE, tutorialId);
    const data = this.safeGetItem(key);
    
    if (!data) return null;
    
    try {
      const state = JSON.parse(data);
      // Convert date strings back to Date objects
      state.startTime = new Date(state.startTime);
      if (state.completionTime) {
        state.completionTime = new Date(state.completionTime);
      }
      return state;
    } catch (error) {
      console.error('Error parsing tutorial state:', error);
      return null;
    }
  }

  async clearTutorialState(tutorialId: string): Promise<void> {
    const key = this.getStorageKey(STORAGE_KEYS.TUTORIAL_STATE, tutorialId);
    this.safeRemoveItem(key);
  }

  // Migration and version management
  async migrateData(): Promise<void> {
    const versionKey = this.getStorageKey(STORAGE_KEYS.TUTORIAL_VERSION);
    const currentVersion = this.safeGetItem(versionKey);
    
    if (currentVersion !== CURRENT_VERSION) {
      // Perform any necessary data migrations here
      console.log(`Migrating tutorial data from ${currentVersion} to ${CURRENT_VERSION}`);
      
      // Update version
      this.safeSetItem(versionKey, CURRENT_VERSION);
    }
  }

  // Utility methods
  async getTutorialList(): Promise<string[]> {
    if (!this.isAvailable()) return [];
    
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('boltquest_tutorialProgress_')
      );
      
      return keys.map(key => {
        const parts = key.split('_');
        return parts[2]; // tutorialId
      });
    } catch (error) {
      console.error('Error getting tutorial list:', error);
      return [];
    }
  }

  async getTutorialStats(tutorialId: string): Promise<{
    totalUsers: number;
    completionRate: number;
    averageTime: number;
    lastUpdated: Date;
  } | null> {
    if (!this.isAvailable()) return null;
    
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.includes(`_${tutorialId}_`)
      );
      
      let totalUsers = 0;
      let completedUsers = 0;
      let totalTime = 0;
      let lastUpdated = new Date(0);
      
      keys.forEach(key => {
        const data = this.safeGetItem(key);
        if (data) {
          const progress = JSON.parse(data);
          totalUsers++;
          
          if (progress.completionPercentage === 100) {
            completedUsers++;
          }
          
          if (progress.totalTime) {
            totalTime += progress.totalTime;
          }
          
          const updated = new Date(progress.lastSaved || progress.lastActive);
          if (updated > lastUpdated) {
            lastUpdated = updated;
          }
        }
      });
      
      return {
        totalUsers,
        completionRate: totalUsers > 0 ? (completedUsers / totalUsers) * 100 : 0,
        averageTime: totalUsers > 0 ? totalTime / totalUsers : 0,
        lastUpdated
      };
    } catch (error) {
      console.error('Error getting tutorial stats:', error);
      return null;
    }
  }
}

// Export singleton instance
export const tutorialStorage = new TutorialStorage();

// Export individual functions for convenience
export const saveTutorialProgress = (progress: TutorialProgress) => tutorialStorage.saveProgress(progress);
export const loadTutorialProgress = (tutorialId: string, userId: string) => tutorialStorage.loadProgress(tutorialId, userId);
export const saveTutorialPreferences = (preferences: TutorialPreferences) => tutorialStorage.savePreferences(preferences);
export const loadTutorialPreferences = () => tutorialStorage.loadPreferences();
export const saveTutorialAnalytics = (analytics: TutorialAnalytics) => tutorialStorage.saveAnalytics(analytics);
export const loadTutorialAnalytics = (tutorialId: string, userId: string) => tutorialStorage.loadAnalytics(tutorialId, userId);
export const clearTutorialData = () => tutorialStorage.clearData();
export const exportTutorialData = () => tutorialStorage.exportData();
export const importTutorialData = (data: string) => tutorialStorage.importData(data);

export default tutorialStorage;




