import { toast } from "sonner";

/**
 * Local Storage Utility Functions
 * Provides type-safe, error-handled local storage operations
 */

export interface StorageError {
  code: string;
  message: string;
  originalError?: Error;
}

export class StorageError extends Error {
  constructor(message: string, code: string, originalError?: Error) {
    super(message);
    this.name = 'StorageError';
    this.code = code;
    this.originalError = originalError;
  }
}

/**
 * Check if localStorage is available
 */
export const isStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Get the current storage size in bytes
 */
export const getStorageSize = (): number => {
  if (!isStorageAvailable()) return 0;
  
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
};

/**
 * Get the maximum storage size in bytes
 */
export const getMaxStorageSize = (): number => {
  // Most browsers have 5-10MB limit
  return 5 * 1024 * 1024; // 5MB
};

/**
 * Check if storage is approaching limit
 */
export const isStorageNearLimit = (): boolean => {
  const currentSize = getStorageSize();
  const maxSize = getMaxStorageSize();
  return currentSize > maxSize * 0.8; // 80% of limit
};

/**
 * Save data to localStorage with error handling
 */
export const saveData = <T>(key: string, data: T): void => {
  if (!isStorageAvailable()) {
    throw new StorageError('LocalStorage is not available', 'STORAGE_UNAVAILABLE');
  }

  try {
    const serializedData = JSON.stringify({
      data,
      timestamp: Date.now(),
      version: '1.0.0'
    });
    
    localStorage.setItem(key, serializedData);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        throw new StorageError('Storage quota exceeded', 'QUOTA_EXCEEDED', error);
      }
      throw new StorageError(`Failed to save data: ${error.message}`, 'SAVE_ERROR', error);
    }
    throw new StorageError('Unknown error occurred while saving data', 'UNKNOWN_ERROR');
  }
};

/**
 * Load data from localStorage with error handling
 */
export const loadData = <T>(key: string): T | null => {
  if (!isStorageAvailable()) {
    throw new StorageError('LocalStorage is not available', 'STORAGE_UNAVAILABLE');
  }

  try {
    const serializedData = localStorage.getItem(key);
    if (!serializedData) {
      return null;
    }

    const parsedData = JSON.parse(serializedData);
    
    // Validate data structure
    if (!parsedData.data) {
      throw new StorageError('Invalid data structure', 'INVALID_DATA');
    }

    return parsedData.data as T;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new StorageError(`Failed to load data: ${error.message}`, 'LOAD_ERROR', error);
    }
    throw new StorageError('Unknown error occurred while loading data', 'UNKNOWN_ERROR');
  }
};

/**
 * Remove data from localStorage
 */
export const removeData = (key: string): void => {
  if (!isStorageAvailable()) {
    throw new StorageError('LocalStorage is not available', 'STORAGE_UNAVAILABLE');
  }

  try {
    localStorage.removeItem(key);
  } catch (error) {
    if (error instanceof Error) {
      throw new StorageError(`Failed to remove data: ${error.message}`, 'REMOVE_ERROR', error);
    }
    throw new StorageError('Unknown error occurred while removing data', 'UNKNOWN_ERROR');
  }
};

/**
 * Clear all data from localStorage
 */
export const clearAllData = (): void => {
  if (!isStorageAvailable()) {
    throw new StorageError('LocalStorage is not available', 'STORAGE_UNAVAILABLE');
  }

  try {
    localStorage.clear();
  } catch (error) {
    if (error instanceof Error) {
      throw new StorageError(`Failed to clear data: ${error.message}`, 'CLEAR_ERROR', error);
    }
    throw new StorageError('Unknown error occurred while clearing data', 'UNKNOWN_ERROR');
  }
};

/**
 * Get all keys from localStorage
 */
export const getAllKeys = (): string[] => {
  if (!isStorageAvailable()) {
    throw new StorageError('LocalStorage is not available', 'STORAGE_UNAVAILABLE');
  }

  try {
    return Object.keys(localStorage);
  } catch (error) {
    if (error instanceof Error) {
      throw new StorageError(`Failed to get keys: ${error.message}`, 'KEYS_ERROR', error);
    }
    throw new StorageError('Unknown error occurred while getting keys', 'UNKNOWN_ERROR');
  }
};

/**
 * Check if a key exists in localStorage
 */
export const hasData = (key: string): boolean => {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Get data with fallback value
 */
export const getDataWithFallback = <T>(key: string, fallback: T): T => {
  try {
    const data = loadData<T>(key);
    return data !== null ? data : fallback;
  } catch (error) {
    return fallback;
  }
};

/**
 * Save data with error handling and user feedback
 */
export const saveDataWithFeedback = <T>(key: string, data: T): boolean => {
  try {
    saveData(key, data);
    return true;
  } catch (error) {
    if (error instanceof StorageError) {
      switch (error.code) {
        case 'QUOTA_EXCEEDED':
          toast.error('Storage Full', {
            description: 'Please clear some data or use a different browser.',
          });
          break;
        case 'STORAGE_UNAVAILABLE':
          toast.error('Storage Unavailable', {
            description: 'Your browser does not support local storage.',
          });
          break;
        default:
          toast.error('Save Failed', {
            description: 'Failed to save your data. Please try again.',
          });
      }
    } else {
      toast.error('Save Failed', {
        description: 'An unexpected error occurred while saving your data.',
      });
    }
    return false;
  }
};

/**
 * Load data with error handling and user feedback
 */
export const loadDataWithFeedback = <T>(key: string): T | null => {
  try {
    return loadData<T>(key);
  } catch (error) {
    if (error instanceof StorageError) {
      switch (error.code) {
        case 'STORAGE_UNAVAILABLE':
          toast.error('Storage Unavailable', {
            description: 'Your browser does not support local storage.',
          });
          break;
        case 'INVALID_DATA':
          toast.error('Data Corrupted', {
            description: 'Your saved data appears to be corrupted. Starting fresh.',
          });
          break;
        default:
          toast.error('Load Failed', {
            description: 'Failed to load your data. Starting fresh.',
          });
      }
    } else {
      toast.error('Load Failed', {
        description: 'An unexpected error occurred while loading your data.',
      });
    }
    return null;
  }
};

/**
 * Storage health check
 */
export const getStorageHealth = () => {
  const isAvailable = isStorageAvailable();
  const currentSize = getStorageSize();
  const maxSize = getMaxStorageSize();
  const usagePercentage = (currentSize / maxSize) * 100;
  const isNearLimit = isStorageNearLimit();
  const keyCount = isAvailable ? getAllKeys().length : 0;

  return {
    isAvailable,
    currentSize,
    maxSize,
    usagePercentage: Math.round(usagePercentage * 100) / 100,
    isNearLimit,
    keyCount,
    healthStatus: isAvailable 
      ? (isNearLimit ? 'warning' : 'healthy')
      : 'unavailable'
  };
};

/**
 * Storage cleanup utility
 */
export const cleanupStorage = (): void => {
  try {
    const keys = getAllKeys();
    const buzzboltKeys = keys.filter(key => key.startsWith('buzzbolt_'));
    
    // Remove old or corrupted data
    buzzboltKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          JSON.parse(data);
        }
      } catch (error) {
        // Remove corrupted data
        localStorage.removeItem(key);
      }
    });
    
    toast.success('Storage Cleaned', {
      description: 'Removed corrupted or old data.',
    });
  } catch (error) {
    toast.error('Cleanup Failed', {
      description: 'Failed to clean up storage.',
    });
  }
};



