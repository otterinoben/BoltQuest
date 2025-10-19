/**
 * Auto-Save System for BuzzBolt
 * Automatically saves user data, game state, and preferences every 30 minutes
 */

import { getUserProfile, updateUserProfile } from './userStorage';
import { getGameHistory, addGameToHistory } from './gameHistoryStorage';
import { getHighScores, addHighScore } from './highScoreStorage';
import { getCurrentDailyTasks, updateTaskProgress } from './dailyTaskManager';
import { getUnlockedAchievements, refreshAchievements } from './simpleAchievements';

export interface AutoSaveData {
  userProfile: any;
  gameHistory: any[];
  highScores: any[];
  dailyTasks: any;
  achievements: any[];
  lastSaved: number;
  version: string;
}

class AutoSaveManager {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly SAVE_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds
  private readonly STORAGE_KEY = 'buzzbolt_autosave';
  private isEnabled = true;

  constructor() {
    this.initializeAutoSave();
  }

  /**
   * Initialize the auto-save system
   */
  private initializeAutoSave(): void {
    if (typeof window === 'undefined') return;

    // Start auto-save interval
    this.startAutoSave();

    // Save on page unload
    window.addEventListener('beforeunload', () => {
      this.performAutoSave();
    });

    // Save on visibility change (when user switches tabs)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.performAutoSave();
      }
    });

    console.log('🔄 Auto-save system initialized (30-minute intervals)');
  }

  /**
   * Start the auto-save interval
   */
  public startAutoSave(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      this.performAutoSave();
    }, this.SAVE_INTERVAL);

    console.log('✅ Auto-save started');
  }

  /**
   * Stop the auto-save interval
   */
  public stopAutoSave(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('⏹️ Auto-save stopped');
  }

  /**
   * Perform the actual auto-save operation
   */
  public async performAutoSave(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const autoSaveData: AutoSaveData = {
        userProfile: getUserProfile(),
        gameHistory: getGameHistory(),
        highScores: getHighScores(),
        dailyTasks: getCurrentDailyTasks(),
        achievements: getUnlockedAchievements(),
        lastSaved: Date.now(),
        version: '1.1.0'
      };

      // Save to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(autoSaveData));

      // Show subtle notification
      this.showAutoSaveNotification();

      console.log('💾 Auto-save completed:', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
    }
  }

  /**
   * Restore data from auto-save
   */
  public restoreFromAutoSave(): AutoSaveData | null {
    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      if (!savedData) return null;

      const autoSaveData: AutoSaveData = JSON.parse(savedData);
      
      // Validate the data
      if (!autoSaveData.userProfile || !autoSaveData.lastSaved) {
        return null;
      }

      console.log('🔄 Restoring from auto-save:', new Date(autoSaveData.lastSaved).toLocaleString());
      return autoSaveData;
    } catch (error) {
      console.error('❌ Failed to restore from auto-save:', error);
      return null;
    }
  }

  /**
   * Show a subtle auto-save notification
   */
  private showAutoSaveNotification(): void {
    // Create a subtle notification element
    const notification = document.createElement('div');
    notification.innerHTML = '💾 Auto-saved';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Fade in
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 10);

    // Fade out and remove
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2000);
  }

  /**
   * Get auto-save status
   */
  public getStatus(): { enabled: boolean; lastSaved: Date | null; nextSave: Date | null } {
    const savedData = this.restoreFromAutoSave();
    const lastSaved = savedData ? new Date(savedData.lastSaved) : null;
    const nextSave = lastSaved ? new Date(lastSaved.getTime() + this.SAVE_INTERVAL) : null;

    return {
      enabled: this.isEnabled,
      lastSaved,
      nextSave
    };
  }

  /**
   * Enable/disable auto-save
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (enabled) {
      this.startAutoSave();
    } else {
      this.stopAutoSave();
    }
  }

  /**
   * Force an immediate save
   */
  public forceSave(): void {
    this.performAutoSave();
  }

  /**
   * Clear auto-save data
   */
  public clearAutoSave(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ Auto-save data cleared');
  }
}

// Create singleton instance
export const autoSaveManager = new AutoSaveManager();

// Export for use in components
export const useAutoSave = () => {
  return {
    performAutoSave: () => autoSaveManager.performAutoSave(),
    restoreFromAutoSave: () => autoSaveManager.restoreFromAutoSave(),
    getStatus: () => autoSaveManager.getStatus(),
    setEnabled: (enabled: boolean) => autoSaveManager.setEnabled(enabled),
    forceSave: () => autoSaveManager.forceSave(),
    clearAutoSave: () => autoSaveManager.clearAutoSave()
  };
};
