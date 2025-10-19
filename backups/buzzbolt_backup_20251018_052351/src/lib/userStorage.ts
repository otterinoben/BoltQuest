import { 
  UserProfile, 
  UserPreferences, 
  UserStatistics, 
  UserAuth,
  UserRegistrationData,
  UserLoginData,
  AuthState,
  DEFAULT_USER_PREFERENCES, 
  DEFAULT_USER_STATISTICS,
  DEFAULT_USER_AUTH,
  DEFAULT_AUTH_STATE,
  STORAGE_KEYS,
  validateUserProfile
} from '@/types/storage';
import { 
  saveDataWithFeedback, 
  loadDataWithFeedback, 
  getDataWithFallback,
  hasData,
  removeData
} from '@/lib/storage';
import { Category, Difficulty } from '@/types/game';

/**
 * User Profile Storage Functions
 * Handles all user profile data persistence operations
 */

/**
 * Generate a unique user ID
 */
export const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create a new user profile
 */
export const createUserProfile = (username: string): UserProfile => {
  const now = Date.now();
  const userId = generateUserId();
  
  return {
    id: userId,
    username,
    email: undefined,
    avatar: undefined,
    createdAt: now,
    lastActive: now,
    preferences: { ...DEFAULT_USER_PREFERENCES },
    statistics: { ...DEFAULT_USER_STATISTICS },
  };
};

/**
 * Save user profile to storage
 */
export const saveUserProfile = (profile: UserProfile): boolean => {
  try {
    // Validate profile before saving
    if (!validateUserProfile(profile)) {
      throw new Error('Invalid user profile data');
    }
    
    // Update last active timestamp
    const updatedProfile = {
      ...profile,
      lastActive: Date.now(),
    };
    
    return saveDataWithFeedback(STORAGE_KEYS.USER_PROFILE, updatedProfile);
  } catch (error) {
    console.error('Failed to save user profile:', error);
    return false;
  }
};

/**
 * Load user profile from storage
 */
export const loadUserProfile = (): UserProfile | null => {
  try {
    const profile = loadDataWithFeedback<UserProfile>(STORAGE_KEYS.USER_PROFILE);
    
    if (profile && validateUserProfile(profile)) {
      return profile;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to load user profile:', error);
    return null;
  }
};

/**
 * Get user profile with fallback
 */
export const getUserProfile = (): UserProfile => {
  const profile = loadUserProfile();
  
  if (profile) {
    return profile;
  }
  
  // Return a default profile if none exists
  return createUserProfile('Guest User');
};

/**
 * Check if user profile exists
 */
export const hasUserProfile = (): boolean => {
  return hasData(STORAGE_KEYS.USER_PROFILE);
};

/**
 * Update user profile
 */
export const updateUserProfile = (updates: Partial<UserProfile>): boolean => {
  try {
    const currentProfile = loadUserProfile();
    
    if (!currentProfile) {
      throw new Error('No user profile found');
    }
    
    const updatedProfile = {
      ...currentProfile,
      ...updates,
      lastActive: Date.now(),
    };
    
    return saveUserProfile(updatedProfile);
  } catch (error) {
    console.error('Failed to update user profile:', error);
    return false;
  }
};

/**
 * Update user username
 */
export const updateUsername = (username: string): boolean => {
  return updateUserProfile({ username });
};

/**
 * Update user email
 */
export const updateUserEmail = (email: string): boolean => {
  return updateUserProfile({ email });
};

/**
 * Update user avatar
 */
export const updateUserAvatar = (avatar: string): boolean => {
  return updateUserProfile({ avatar });
};

/**
 * Update user last active timestamp
 */
export const updateLastActive = (): boolean => {
  return updateUserProfile({ lastActive: Date.now() });
};

/**
 * Delete user profile
 */
export const deleteUserProfile = (): boolean => {
  try {
    removeData(STORAGE_KEYS.USER_PROFILE);
    return true;
  } catch (error) {
    console.error('Failed to delete user profile:', error);
    return false;
  }
};

/**
 * User Preferences Storage Functions
 */

/**
 * Save user preferences
 */
export const saveUserPreferences = (preferences: UserPreferences): boolean => {
  try {
    return saveDataWithFeedback(STORAGE_KEYS.USER_PREFERENCES, preferences);
  } catch (error) {
    console.error('Failed to save user preferences:', error);
    return false;
  }
};

/**
 * Load user preferences
 */
export const loadUserPreferences = (): UserPreferences => {
  return getDataWithFallback<UserPreferences>(
    STORAGE_KEYS.USER_PREFERENCES, 
    DEFAULT_USER_PREFERENCES
  );
};

/**
 * Update user preferences
 */
export const updateUserPreferences = (updates: Partial<UserPreferences>): boolean => {
  try {
    const currentPreferences = loadUserPreferences();
    const updatedPreferences = { ...currentPreferences, ...updates };
    
    return saveUserPreferences(updatedPreferences);
  } catch (error) {
    console.error('Failed to update user preferences:', error);
    return false;
  }
};

/**
 * Update theme preference
 */
export const updateTheme = (theme: 'light' | 'dark' | 'system'): boolean => {
  return updateUserPreferences({ theme });
};

/**
 * Update sound preference
 */
export const updateSoundEnabled = (enabled: boolean): boolean => {
  return updateUserPreferences({ soundEnabled: enabled });
};

/**
 * Update music preference
 */
export const updateMusicEnabled = (enabled: boolean): boolean => {
  return updateUserPreferences({ musicEnabled: enabled });
};

/**
 * Update notifications preference
 */
export const updateNotificationsEnabled = (enabled: boolean): boolean => {
  return updateUserPreferences({ notificationsEnabled: enabled });
};

/**
 * Update default category
 */
export const updateDefaultCategory = (category: Category): boolean => {
  return updateUserPreferences({ defaultCategory: category });
};

/**
 * Update default difficulty
 */
export const updateDefaultDifficulty = (difficulty: Difficulty): boolean => {
  return updateUserPreferences({ defaultDifficulty: difficulty });
};

/**
 * Update default timer
 */
export const updateDefaultTimer = (timer: number): boolean => {
  return updateUserPreferences({ defaultTimer: timer });
};

/**
 * Update auto pause preference
 */
export const updateAutoPause = (enabled: boolean): boolean => {
  return updateUserPreferences({ autoPause: enabled });
};

/**
 * Update show hints preference
 */
export const updateShowHints = (enabled: boolean): boolean => {
  return updateUserPreferences({ showHints: enabled });
};

/**
 * Update language preference
 */
export const updateLanguage = (language: string): boolean => {
  return updateUserPreferences({ language });
};

/**
 * User Statistics Storage Functions
 */

/**
 * Save user statistics
 */
export const saveUserStatistics = (statistics: UserStatistics): boolean => {
  try {
    return saveDataWithFeedback(STORAGE_KEYS.USER_STATISTICS, statistics);
  } catch (error) {
    console.error('Failed to save user statistics:', error);
    return false;
  }
};

/**
 * Load user statistics
 */
export const loadUserStatistics = (): UserStatistics => {
  return getDataWithFallback<UserStatistics>(
    STORAGE_KEYS.USER_STATISTICS, 
    DEFAULT_USER_STATISTICS
  );
};

/**
 * Update user statistics
 */
export const updateUserStatistics = (updates: Partial<UserStatistics>): boolean => {
  try {
    const currentStatistics = loadUserStatistics();
    const updatedStatistics = { ...currentStatistics, ...updates };
    
    return saveUserStatistics(updatedStatistics);
  } catch (error) {
    console.error('Failed to update user statistics:', error);
    return false;
  }
};

/**
 * Update game statistics after a game
 */
export const updateGameStatistics = (gameData: {
  category: Category;
  difficulty: Difficulty;
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  timeSpent: number;
  bestCombo: number;
  questionsSkipped: number;
  totalPauseTime: number;
}): boolean => {
  try {
    const currentProfile = getUserProfile();
    const stats = currentProfile.statistics;
    
    // Calculate new totals
    const newTotalGamesPlayed = stats.totalGamesPlayed + 1;
    const newTotalQuestionsAnswered = stats.totalQuestionsAnswered + gameData.questionsAnswered;
    const newTotalCorrectAnswers = stats.totalCorrectAnswers + gameData.correctAnswers;
    const newTotalScore = stats.totalScore + gameData.score;
    const newTotalTimeSpent = stats.totalTimeSpent + gameData.timeSpent;
    const newTotalSkips = stats.totalQuestionsSkipped + gameData.questionsSkipped;
    const newTotalPauseTime = stats.totalPauseTime + gameData.totalPauseTime;
    
    // Calculate new averages
    const newAverageScore = newTotalGamesPlayed > 0 ? newTotalScore / newTotalGamesPlayed : 0;
    const newAverageAccuracy = newTotalQuestionsAnswered > 0 
      ? (newTotalCorrectAnswers / newTotalQuestionsAnswered) * 100 
      : 0;
    
    // Update best score
    const newBestScore = Math.max(stats.bestScore, gameData.score);
    
    // Update longest combo
    const newLongestCombo = Math.max(stats.longestCombo, gameData.bestCombo);
    
    console.log('📈 New calculated stats:', {
      totalGames: newTotalGamesPlayed,
      totalScore: newTotalScore,
      averageScore: newAverageScore,
      bestScore: newBestScore,
      averageAccuracy: newAverageAccuracy
    });
    
    // Update category statistics
    const updatedCategoryStats = { ...stats.categoryStats };
    const categoryStat = updatedCategoryStats[gameData.category];
    updatedCategoryStats[gameData.category] = {
      gamesPlayed: categoryStat.gamesPlayed + 1,
      questionsAnswered: categoryStat.questionsAnswered + gameData.questionsAnswered,
      correctAnswers: categoryStat.correctAnswers + gameData.correctAnswers,
      bestScore: Math.max(categoryStat.bestScore, gameData.score),
      averageAccuracy: categoryStat.questionsAnswered + gameData.questionsAnswered > 0 
        ? ((categoryStat.correctAnswers + gameData.correctAnswers) / (categoryStat.questionsAnswered + gameData.questionsAnswered)) * 100 
        : 0,
      timeSpent: categoryStat.timeSpent + gameData.timeSpent,
    };
    
    // Update difficulty statistics
    const updatedDifficultyStats = { ...stats.difficultyStats };
    const difficultyStat = updatedDifficultyStats[gameData.difficulty];
    updatedDifficultyStats[gameData.difficulty] = {
      gamesPlayed: difficultyStat.gamesPlayed + 1,
      questionsAnswered: difficultyStat.questionsAnswered + gameData.questionsAnswered,
      correctAnswers: difficultyStat.correctAnswers + gameData.correctAnswers,
      bestScore: Math.max(difficultyStat.bestScore, gameData.score),
      averageAccuracy: difficultyStat.questionsAnswered + gameData.questionsAnswered > 0 
        ? ((difficultyStat.correctAnswers + gameData.correctAnswers) / (difficultyStat.questionsAnswered + gameData.questionsAnswered)) * 100 
        : 0,
      timeSpent: difficultyStat.timeSpent + gameData.timeSpent,
    };
    
    const updatedStatistics: UserStatistics = {
      ...stats,
      totalGamesPlayed: newTotalGamesPlayed,
      totalQuestionsAnswered: newTotalQuestionsAnswered,
      totalCorrectAnswers: newTotalCorrectAnswers,
      totalScore: newTotalScore,
      averageScore: newAverageScore,
      averageAccuracy: newAverageAccuracy,
      bestScore: newBestScore,
      longestCombo: newLongestCombo,
      totalQuestionsSkipped: newTotalSkips,
      totalPauseTime: newTotalPauseTime,
      categoryStats: updatedCategoryStats,
      difficultyStats: updatedDifficultyStats,
    };
    
    // Update the profile with new statistics
    const updatedProfile: UserProfile = {
      ...currentProfile,
      statistics: updatedStatistics,
      lastActive: Date.now(),
    };
    
    return saveUserProfile(updatedProfile);
  } catch (error) {
    console.error('Failed to update game statistics:', error);
    return false;
  }
};

/**
 * Reset user statistics
 */
export const resetUserStatistics = (): boolean => {
  return saveUserStatistics(DEFAULT_USER_STATISTICS);
};

/**
 * User Authentication Functions
 * Handles user login, logout, and registration
 */

/**
 * Load authentication state
 */
export const loadUserAuth = (): UserAuth => {
  return getDataWithFallback<UserAuth>(
    STORAGE_KEYS.USER_AUTH, 
    DEFAULT_USER_AUTH
  );
};

/**
 * Save authentication state
 */
export const saveUserAuth = (authData: UserAuth): boolean => {
  return saveDataWithFeedback(STORAGE_KEYS.USER_AUTH, authData);
};

/**
 * Register a new user
 */
export const registerUser = (userData: UserRegistrationData): UserProfile | null => {
  try {
    // Check if username already exists
    const existingProfile = getUserProfile();
    if (existingProfile.username !== 'Guest User') {
      throw new Error('Username already exists');
    }

    // Create new user profile
    const newProfile = createUserProfile(userData.username);
    newProfile.email = userData.email;
    newProfile.avatar = userData.avatar;

    // Save profile
    const saved = saveUserProfile(newProfile);
    if (!saved) {
      throw new Error('Failed to save user profile');
    }

    // Set authentication state
    const authData: UserAuth = {
      isAuthenticated: true,
      userId: newProfile.id,
      username: newProfile.username,
      loginTime: Date.now(),
      sessionExpiry: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
    };

    saveUserAuth(authData);
    return newProfile;
  } catch (error) {
    console.error('Failed to register user:', error);
    return null;
  }
};

/**
 * Login user
 */
export const loginUser = (loginData: UserLoginData): UserProfile | null => {
  try {
    // For now, we'll use a simple username-based system
    // In a real app, you'd validate against a server
    const profile = getUserProfile();
    
    if (profile.username === loginData.username || profile.username === 'Guest User') {
      // Update profile with new username if it was Guest User
      if (profile.username === 'Guest User') {
        profile.username = loginData.username;
        saveUserProfile(profile);
      }

      // Set authentication state
      const authData: UserAuth = {
        isAuthenticated: true,
        userId: profile.id,
        username: profile.username,
        loginTime: Date.now(),
        sessionExpiry: loginData.rememberMe 
          ? Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
          : Date.now() + (24 * 60 * 60 * 1000), // 1 day
      };

      saveUserAuth(authData);
      return profile;
    }

    throw new Error('Invalid username');
  } catch (error) {
    console.error('Failed to login user:', error);
    return null;
  }
};

/**
 * Logout user
 */
export const logoutUser = (): boolean => {
  try {
    const authData: UserAuth = DEFAULT_USER_AUTH;
    return saveUserAuth(authData);
  } catch (error) {
    console.error('Failed to logout user:', error);
    return false;
  }
};

/**
 * Check if user is authenticated
 */
export const isUserAuthenticated = (): boolean => {
  const authData = loadUserAuth();
  
  if (!authData.isAuthenticated) {
    return false;
  }

  // Check if session has expired
  if (authData.sessionExpiry && Date.now() > authData.sessionExpiry) {
    logoutUser(); // Auto-logout expired session
    return false;
  }

  return true;
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): UserProfile | null => {
  if (!isUserAuthenticated()) {
    return null;
  }

  const authData = loadUserAuth();
  if (!authData.userId) {
    return null;
  }

  return getUserProfile();
};

/**
 * Update user session
 */
export const updateUserSession = (): boolean => {
  try {
    const authData = loadUserAuth();
    if (!authData.isAuthenticated) {
      return false;
    }

    authData.loginTime = Date.now();
    return saveUserAuth(authData);
  } catch (error) {
    console.error('Failed to update user session:', error);
    return false;
  }
};
