import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface TestingContextType {
  // Game state manipulation
  addTime: (seconds: number) => void;
  addScore: (points: number) => void;
  addCoins: (coins: number) => void;
  addXp?: (xp: number) => void;
  addStreak?: (streak: number) => void;
  addLevel?: (level: number) => void;
  
  // Popup testing
  triggerPenaltyPopup: (value: number) => void;
  triggerStreakPopup: (type: 'milestone' | 'pb') => void;
  
  // Data management
  resetAllData: () => void;
  exportData: () => void;
  importData: () => void;
  
  // Game controls
  pauseToggle: () => void;
  
  // Testing state
  isTestingMode: boolean;
  setTestingMode: (enabled: boolean) => void;
}

const TestingContext = createContext<TestingContextType | undefined>(undefined);

export function TestingProvider({ children }: { children: React.ReactNode }) {
  const [isTestingMode, setTestingMode] = useState(false);

  // Game state manipulation functions
  const addTime = useCallback((seconds: number) => {
    // This will be connected to the actual game state in Game.tsx
    console.log(`Testing: Adding ${seconds} seconds`);
    toast.info(`Testing: Added ${seconds} seconds`, { duration: 1000 });
  }, []);

  const addScore = useCallback((points: number) => {
    console.log(`Testing: Adding ${points} points`);
    toast.info(`Testing: Added ${points} points`, { duration: 1000 });
  }, []);

  const addCoins = useCallback((coins: number) => {
    console.log(`Testing: Adding ${coins} coins`);
    toast.info(`Testing: Added ${coins} coins`, { duration: 1000 });
  }, []);

  const addXp = useCallback((xp: number) => {
    console.log(`Testing: Adding ${xp} XP`);
    toast.info(`Testing: Added ${xp} XP`, { duration: 1000 });
  }, []);

  const addStreak = useCallback((streak: number) => {
    console.log(`Testing: Adding ${streak} streak`);
    toast.info(`Testing: Added ${streak} streak`, { duration: 1000 });
  }, []);

  const addLevel = useCallback((level: number) => {
    console.log(`Testing: Adding ${level} level`);
    toast.info(`Testing: Added ${level} level`, { duration: 1000 });
  }, []);

  // Popup testing functions
  const triggerPenaltyPopup = useCallback((value: number) => {
    console.log(`Testing: Triggering penalty popup with value ${value}`);
    toast.info(`Testing: Penalty popup ${value > 0 ? '+' : ''}${value}`, { duration: 1000 });
  }, []);

  const triggerStreakPopup = useCallback((type: 'milestone' | 'pb') => {
    console.log(`Testing: Triggering ${type} streak popup`);
    toast.info(`Testing: ${type} streak popup`, { duration: 1000 });
  }, []);

  // Data management functions
  const resetAllData = useCallback(() => {
    try {
      // Clear all localStorage data
      const keys = [
        'boltquest-game-history',
        'boltquest-user-profile', 
        'boltquest-high-scores',
        'boltquest-daily-tasks',
        'boltquest-achievements',
        'boltquest-tutorial-progress',
        'boltquest-sound-enabled',
        'boltquest-music-enabled'
      ];
      
      keys.forEach(key => localStorage.removeItem(key));
      
      toast.success('All game data reset!', { duration: 2000 });
      console.log('Testing: All data reset');
    } catch (error) {
      toast.error('Failed to reset data', { duration: 2000 });
      console.error('Testing: Failed to reset data', error);
    }
  }, []);

  const exportData = useCallback(() => {
    try {
      const gameData = {
        gameHistory: localStorage.getItem('boltquest-game-history'),
        userProfile: localStorage.getItem('boltquest-user-profile'),
        highScores: localStorage.getItem('boltquest-high-scores'),
        dailyTasks: localStorage.getItem('boltquest-daily-tasks'),
        achievements: localStorage.getItem('boltquest-achievements'),
        tutorialProgress: localStorage.getItem('boltquest-tutorial-progress'),
        soundEnabled: localStorage.getItem('boltquest-sound-enabled'),
        musicEnabled: localStorage.getItem('boltquest-music-enabled'),
        timestamp: new Date().toISOString(),
        version: '1.2.0'
      };
      
      const dataStr = JSON.stringify(gameData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `buzzbolt-test-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully!', { duration: 2000 });
      console.log('Testing: Data exported');
    } catch (error) {
      toast.error('Failed to export data', { duration: 2000 });
      console.error('Testing: Failed to export data', error);
    }
  }, []);

  const importData = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            
            // Import all available data
            if (data.gameHistory) localStorage.setItem('boltquest-game-history', data.gameHistory);
            if (data.userProfile) localStorage.setItem('boltquest-user-profile', data.userProfile);
            if (data.highScores) localStorage.setItem('boltquest-high-scores', data.highScores);
            if (data.dailyTasks) localStorage.setItem('boltquest-daily-tasks', data.dailyTasks);
            if (data.achievements) localStorage.setItem('boltquest-achievements', data.achievements);
            if (data.tutorialProgress) localStorage.setItem('boltquest-tutorial-progress', data.tutorialProgress);
            if (data.soundEnabled) localStorage.setItem('boltquest-sound-enabled', data.soundEnabled);
            if (data.musicEnabled) localStorage.setItem('boltquest-music-enabled', data.musicEnabled);
            
            toast.success('Data imported successfully!', { duration: 2000 });
            console.log('Testing: Data imported');
            
            // Refresh page to apply changes
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } catch (error) {
            toast.error('Invalid data file', { duration: 2000 });
            console.error('Testing: Invalid data file', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  // Game control functions
  const pauseToggle = useCallback(() => {
    console.log('Testing: Pause toggle triggered');
    toast.info('Testing: Pause toggle', { duration: 1000 });
  }, []);

  const value: TestingContextType = {
    addTime,
    addScore,
    addCoins,
    addXp,
    addStreak,
    addLevel,
    triggerPenaltyPopup,
    triggerStreakPopup,
    resetAllData,
    exportData,
    importData,
    pauseToggle,
    isTestingMode,
    setTestingMode
  };

  return (
    <TestingContext.Provider value={value}>
      {children}
    </TestingContext.Provider>
  );
}

export function useTesting() {
  const context = useContext(TestingContext);
  if (context === undefined) {
    throw new Error('useTesting must be used within a TestingProvider');
  }
  return context;
}
