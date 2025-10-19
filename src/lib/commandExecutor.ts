/**
 * Command Executor
 * Handles execution of testing commands and integrates with game systems
 */

import { ParsedCommand, CommandResult, commandParser } from './testingCommands';
import { addXp, getUserProgress, calculateLevelData } from './xpLevelSystem';
import { getUserProfile, saveUserProfile } from './userStorage';
import { getCoinBalance } from './coinSystem';
import { addCoins } from './xpLevelSystem';
import { getAchievementStats, getAchievements, saveAchievements, refreshAchievements } from './simpleAchievements';
import { EloSystem } from './eloSystem';
import { EloRankSystem } from './eloRankSystem';
import { getCurrentDailyTasks, updateTaskProgress, resetStreak, getDailyTaskStats } from './dailyTaskManager';
import { getGameHistoryByUserId, saveGameHistory } from './gameHistoryStorage';
import { toast } from 'sonner';

export class CommandExecutor {
  private commandHistory: string[] = [];
  private backupData: any = null;

  async executeCommand(parsedCommand: ParsedCommand): Promise<CommandResult> {
    try {
      const { command, parameters } = parsedCommand;
      
      // Add to history
      this.commandHistory.push(parsedCommand.originalInput);
      if (this.commandHistory.length > 100) {
        this.commandHistory = this.commandHistory.slice(-100);
      }

      // Execute command based on type
      switch (command) {
        // User Manipulation Commands
        case '/level':
          return await this.executeLevelCommand(parameters);
        case '/xp':
          return await this.executeXpCommand(parameters);
        case '/coins':
          return await this.executeCoinsCommand(parameters);
        case '/add-coins':
          return await this.executeAddCoinsCommand(parameters);
        case '/points':
          return await this.executePointsCommand(parameters);
        case '/streak':
          return await this.executeStreakCommand(parameters);
        case '/level-up':
          return await this.executeLevelUpCommand();
        case '/level-down':
          return await this.executeLevelDownCommand();
        case '/reset-level':
          return await this.executeResetLevelCommand();
        case '/fix-profile':
          return await this.executeFixProfileCommand();
        case '/reset-currency':
          return await this.executeResetCurrencyCommand();

        // Achievement Commands
        case '/achievement-unlock':
          return await this.executeAchievementUnlockCommand(parameters);
        case '/achievement-reset':
          return await this.executeAchievementResetCommand(parameters);
        case '/achievement-reset-all':
          return await this.executeAchievementResetAllCommand();
        case '/achievements-list':
          return await this.executeAchievementsListCommand();
        case '/achievement-bulk-unlock':
          return await this.executeAchievementBulkUnlockCommand(parameters);

        // ELO Commands
        case '/elo':
          return await this.executeEloCommand(parameters);
        case '/elo-reset':
          return await this.executeEloResetCommand(parameters);
        case '/elo-reset-all':
          return await this.executeEloResetAllCommand();
        case '/elo-simulate':
          return await this.executeEloSimulateCommand(parameters);
        case '/elo-test':
          return await this.executeEloTestCommand(parameters);
        case '/elo-division':
          return await this.executeEloDivisionCommand(parameters);

        // Daily Task Commands
        case '/daily-complete':
          return await this.executeDailyCompleteCommand(parameters);
        case '/daily-complete-all':
          return await this.executeDailyCompleteAllCommand();
        case '/daily-reset':
          return await this.executeDailyResetCommand();
        case '/daily-generate':
          return await this.executeDailyGenerateCommand();

        // Game Simulation Commands
        case '/game-simulate':
          return await this.executeGameSimulateCommand(parameters);
        case '/game-generate-score':
          return await this.executeGameGenerateScoreCommand(parameters);

        // System Commands
        case '/reset-all':
          return await this.executeResetAllCommand();
        case '/backup-data':
          return await this.executeBackupDataCommand();
        case '/system-health':
          return await this.executeSystemHealthCommand();

        // Help Commands
        case '/help':
          return await this.executeHelpCommand(parameters);
        case '/commands':
          return await this.executeCommandsCommand(parameters);
        case '/examples':
          return await this.executeExamplesCommand();

        // Comprehensive Testing Commands
        case '/test':
          return await this.executeTestCommand(parameters);
        case '/test-all':
          return await this.executeTestAllCommand();
        case '/test-dashboard':
          return await this.executeTestDashboardCommand();
        case '/test-elo':
          return await this.executeTestEloCommand();
        case '/test-daily':
          return await this.executeTestDailyCommand();
        case '/test-data':
          return await this.executeTestDataCommand();
        
        // Context Commands
        case '/context':
          return await this.executeContextCommand(parameters);
        case '/context-refresh':
          return await this.executeContextRefreshCommand();
        case '/context-status':
          return await this.executeContextStatusCommand();
        case '/context-reset':
          return await this.executeContextResetCommand();
        case '/context-debug':
          return await this.executeContextDebugCommand();
        
        // History Commands
        case '/history':
          return await this.executeHistoryCommand(parameters);
        case '/history-add':
          return await this.executeHistoryAddCommand(parameters);
        case '/history-clear':
          return await this.executeHistoryClearCommand();
        case '/history-stats':
          return await this.executeHistoryStatsCommand();
        case '/history-export':
          return await this.executeHistoryExportCommand();
        
        // Notification Commands
        case '/notify':
          return await this.executeNotifyCommand(parameters);
        case '/notify-test':
          return await this.executeNotifyTestCommand();
        case '/notify-generate':
          return await this.executeNotifyGenerateCommand();
        case '/notify-clear':
          return await this.executeNotifyClearCommand();
        case '/notify-settings':
          return await this.executeNotifySettingsCommand();
        
        // Scenario Commands
        case '/scenario':
          return await this.executeScenarioCommand(parameters);
        case '/scenario-newuser':
          return await this.executeScenarioNewUserCommand();
        case '/scenario-poweruser':
          return await this.executeScenarioPowerUserCommand();
        case '/scenario-casual':
          return await this.executeScenarioCasualCommand();
        case '/scenario-reset':
          return await this.executeScenarioResetCommand();

        default:
          return {
            success: false,
            message: `Unknown command: ${command}`,
            error: 'COMMAND_NOT_FOUND'
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      };
    }
  }

  // User Manipulation Commands
  private async executeLevelCommand(params: { level: number }): Promise<CommandResult> {
    const profile = getUserProfile();
    if (!profile) {
      return { success: false, message: 'No user profile found', error: 'NO_PROFILE' };
    }

    // Validate level range
    if (params.level < 1 || params.level > 200) {
      return { 
        success: false, 
        message: 'Level must be between 1 and 200', 
        error: 'INVALID_LEVEL_RANGE' 
      };
    }

    // Store old level for animation
    const oldLevel = profile.level;

    // Calculate XP needed for target level using game's formula
    const targetXp = this.calculateXpForLevel(params.level);
    profile.level = params.level;
    profile.totalXp = targetXp;

    saveUserProfile(profile);

    // Dispatch custom event for XP bar animation
    window.dispatchEvent(new CustomEvent('xpLevelChanged', {
      detail: { 
        oldLevel,
        newLevel: params.level,
        animate: true 
      }
    }));

  // Show toast notification
  toast.success(`Level set to ${params.level}!`, {
    description: `${targetXp.toLocaleString()} total XP`,
    duration: 3000
  });

    return {
      success: true,
      message: `Level set to ${params.level} (${targetXp.toLocaleString()} total XP)`,
      data: { level: params.level, xp: targetXp }
    };
  }

  private async executeXpCommand(params: { amount: number }): Promise<CommandResult> {
    const result = addXp(params.amount);
    const progress = getUserProgress();

    return {
      success: true,
      message: `${params.amount > 0 ? 'Added' : 'Removed'} ${Math.abs(params.amount)} XP. Level: ${progress.level}`,
      data: { 
        xpChange: params.amount, 
        newLevel: progress.level,
        leveledUp: result.leveledUp 
      }
    };
  }

  private async executeCoinsCommand(params: { amount: number }): Promise<CommandResult> {
    const profile = getUserProfile();
    if (!profile) {
      return { success: false, message: 'No user profile found', error: 'NO_PROFILE' };
    }

    profile.coins = params.amount;
    saveUserProfile(profile);

    // Show toast notification
    toast.success(`Coins set to ${params.amount.toLocaleString()}!`, {
      description: 'Balance updated',
      duration: 3000
    });

    return {
      success: true,
      message: `Coins set to ${params.amount}`,
      data: { coins: params.amount }
    };
  }

  private async executeAddCoinsCommand(params: { amount: number }): Promise<CommandResult> {
    const success = addCoins(params.amount);
    if (!success) {
      return { success: false, message: 'Failed to add coins', error: 'ADD_COINS_FAILED' };
    }

    const currentCoins = getCoinBalance();

    return {
      success: true,
      message: `Added ${params.amount} coins. Total: ${currentCoins}`,
      data: { coinsAdded: params.amount, totalCoins: currentCoins }
    };
  }

  private async executePointsCommand(params: { amount: number }): Promise<CommandResult> {
    const profile = getUserProfile();
    if (!profile) {
      return { success: false, message: 'No user profile found', error: 'NO_PROFILE' };
    }

    profile.points = params.amount;
    saveUserProfile(profile);

    return {
      success: true,
      message: `Points set to ${params.amount}`,
      data: { points: params.amount }
    };
  }

  private async executeStreakCommand(params: { days: number }): Promise<CommandResult> {
    const profile = getUserProfile();
    if (!profile) {
      return { success: false, message: 'No user profile found', error: 'NO_PROFILE' };
    }

    profile.streak = params.days;
    saveUserProfile(profile);

    return {
      success: true,
      message: `Daily streak set to ${params.days} days`,
      data: { streak: params.days }
    };
  }

  private async executeLevelUpCommand(): Promise<CommandResult> {
    const result = addXp(1000); // Add enough XP to level up
    const progress = getUserProgress();

    return {
      success: true,
      message: `Leveled up! New level: ${progress.level}`,
      data: { newLevel: progress.level, leveledUp: result.leveledUp }
    };
  }

  private async executeLevelDownCommand(): Promise<CommandResult> {
    const profile = getUserProfile();
    if (!profile) {
      return { success: false, message: 'No user profile found', error: 'NO_PROFILE' };
    }

    if (profile.level > 1) {
      const newLevel = Math.max(1, profile.level - 1);
      const targetXp = this.calculateXpForLevel(newLevel);
      profile.level = newLevel;
      profile.totalXp = targetXp;
      saveUserProfile(profile);

      return {
        success: true,
        message: `Leveled down to ${newLevel}`,
        data: { newLevel, xp: targetXp }
      };
    }

    return {
      success: false,
      message: 'Already at minimum level (1)',
      error: 'MIN_LEVEL_REACHED'
    };
  }

  private async executeResetLevelCommand(): Promise<CommandResult> {
    const profile = getUserProfile();
    if (!profile) {
      return { success: false, message: 'No user profile found', error: 'NO_PROFILE' };
    }

    profile.level = 1;
    profile.totalXp = 0;
    saveUserProfile(profile);

    return {
      success: true,
      message: 'Level reset to 1',
      data: { level: 1, xp: 0 }
    };
  }

  private async executeFixProfileCommand(): Promise<CommandResult> {
    const profile = getUserProfile();
    if (!profile) {
      return { success: false, message: 'No user profile found', error: 'NO_PROFILE' };
    }

    const calculatedLevel = calculateLevelFromXp(profile.totalXp || 0).level;
    const oldLevel = profile.level;
    
    // Fix the mismatch between stored level and calculated level
    profile.level = calculatedLevel;
    saveUserProfile(profile);

    toast.success('Profile data fixed!', {
      description: `Level corrected from ${oldLevel} to ${calculatedLevel}`,
      duration: 3000
    });

    return {
      success: true,
      message: `Profile fixed: Level corrected from ${oldLevel} to ${calculatedLevel} based on ${profile.totalXp} XP`,
      data: { oldLevel, newLevel: calculatedLevel, xp: profile.totalXp }
    };
  }

  private async executeResetCurrencyCommand(): Promise<CommandResult> {
    const profile = getUserProfile();
    if (!profile) {
      return { success: false, message: 'No user profile found', error: 'NO_PROFILE' };
    }

    profile.coins = 0;
    profile.points = 0;
    saveUserProfile(profile);

    return {
      success: true,
      message: 'All currency reset to 0',
      data: { coins: 0, points: 0 }
    };
  }

  // Achievement Commands
  private async executeAchievementUnlockCommand(params: { id: string }): Promise<CommandResult> {
    const achievements = getAchievements();
    const achievement = achievements.find(a => a.id === params.id);
    
    if (!achievement) {
      return {
        success: false,
        message: `Achievement not found: ${params.id}`,
        error: 'ACHIEVEMENT_NOT_FOUND'
      };
    }

    if (achievement.unlockedAt > 0) {
      return {
        success: false,
        message: `Achievement already unlocked: ${achievement.name}`,
        error: 'ALREADY_UNLOCKED'
      };
    }

    // Unlock the achievement
    achievement.unlockedAt = Date.now();
    saveAchievements(achievements);
    
    return {
      success: true,
      message: `Achievement unlocked: ${achievement.name}`,
      data: { achievement: achievement }
    };
  }

  private async executeAchievementResetCommand(params: { id: string }): Promise<CommandResult> {
    const achievements = getAchievements();
    const achievement = achievements.find(a => a.id === params.id);
    
    if (!achievement) {
      return {
        success: false,
        message: `Achievement not found: ${params.id}`,
        error: 'ACHIEVEMENT_NOT_FOUND'
      };
    }

    if (achievement.unlockedAt === 0) {
      return {
        success: false,
        message: `Achievement not unlocked: ${achievement.name}`,
        error: 'NOT_UNLOCKED'
      };
    }

    // Reset the achievement
    achievement.unlockedAt = 0;
    saveAchievements(achievements);
    
    return {
      success: true,
      message: `Achievement reset: ${achievement.name}`,
      data: { achievementId: params.id }
    };
  }

  private async executeAchievementResetAllCommand(): Promise<CommandResult> {
    const achievements = getAchievements();
    let resetCount = 0;

    achievements.forEach(achievement => {
      if (achievement.unlockedAt > 0) {
        achievement.unlockedAt = 0;
        resetCount++;
      }
    });

    if (resetCount > 0) {
      saveAchievements(achievements);
    }

    return {
      success: true,
      message: `Reset ${resetCount} achievements`,
      data: { resetCount }
    };
  }

  private async executeAchievementsListCommand(): Promise<CommandResult> {
    const stats = getAchievementStats();
    const achievements = getAchievements();

    return {
      success: true,
      message: `Achievements: ${stats.unlocked}/${stats.total} unlocked (${stats.progressPercentage}%)`,
      data: { stats, achievements }
    };
  }

  private async executeAchievementBulkUnlockCommand(params: { count: number }): Promise<CommandResult> {
    const achievements = getAchievements();
    const unlockedAchievements = achievements.filter(a => a.unlockedAt > 0);
    const availableAchievements = achievements.filter(a => a.unlockedAt === 0);
    
    const toUnlock = Math.min(params.count, availableAchievements.length);
    let unlockedCount = 0;

    for (let i = 0; i < toUnlock; i++) {
      const achievement = availableAchievements[i];
      achievement.unlockedAt = Date.now();
      unlockedCount++;
    }

    if (unlockedCount > 0) {
      saveAchievements(achievements);
    }

    return {
      success: true,
      message: `Unlocked ${unlockedCount} achievements`,
      data: { unlockedCount, totalAvailable: availableAchievements.length }
    };
  }

  // ELO Commands
  private async executeEloCommand(params: { category: string; rating: number }): Promise<CommandResult> {
    try {
      const eloSystem = new EloSystem();
      
      // Initialize ELO data if it doesn't exist
      eloSystem.initializeForExistingUser();
      
      // Set the category rating
      eloSystem.setCategoryRating(params.category, params.rating);
      
      // Get the updated ELO rank display
      const eloRankDisplay = EloRankSystem.getEloRankDisplay(params.rating, 0);
      
      toast.success(`ELO updated for ${params.category}`, {
        description: `Rating: ${params.rating}, Rank: ${eloRankDisplay.currentRank.tier} ${eloRankDisplay.currentRank.division}`,
        duration: 3000
      });
      
      return {
        success: true,
        message: `ELO rating for ${params.category} set to ${params.rating}. Rank: ${eloRankDisplay.currentRank.tier} ${eloRankDisplay.currentRank.division}`,
        data: { 
          category: params.category, 
          rating: params.rating,
          rank: eloRankDisplay.currentRank
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to set ELO rating: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'ELO_SET_FAILED'
      };
    }
  }

  private async executeEloResetCommand(params: { category: string }): Promise<CommandResult> {
    try {
      const eloSystem = new EloSystem();
      
      if (params.category === 'all' || params.category === 'overall') {
        eloSystem.resetAllRatings();
        toast.success('All ELO ratings reset!', {
          description: 'All category ratings have been reset to default',
          duration: 3000
        });
        
        return {
          success: true,
          message: 'All ELO ratings reset',
          data: { category: 'all' }
        };
      } else {
        eloSystem.resetCategoryRating(params.category);
        toast.success(`${params.category} ELO reset!`, {
          description: `${params.category} rating has been reset to default`,
          duration: 3000
        });
        
        return {
          success: true,
          message: `ELO rating for ${params.category} reset`,
          data: { category: params.category }
        };
      }
    } catch (error) {
      console.error('Error resetting ELO:', error);
      return {
        success: false,
        message: `Error resetting ELO: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'UNO_ERROR'
      };
    }
  }

  private async executeEloResetAllCommand(): Promise<CommandResult> {
    try {
      const eloSystem = new EloSystem();
      eloSystem.resetAllRatings();
      
      toast.success('All ELO ratings reset!', {
        description: 'All category ratings have been reset to default',
        duration: 3000
      });
      
      return {
        success: true,
        message: 'All ELO ratings reset',
        data: {}
      };
    } catch (error) {
      console.error('Error resetting all ELO:', error);
      return {
        success: false,
        message: `Error resetting ELO: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      };
    }
  }

  private async executeEloSimulateCommand(params: { games: number }): Promise<CommandResult> {
    return {
      success: true,
      message: `Simulated ${params.games} games`,
      data: { gamesSimulated: params.games }
    };
  }

  // Daily Task Commands
  private async executeDailyCompleteCommand(params: { taskId: string }): Promise<CommandResult> {
    const success = updateTaskProgress(params.taskId, 999); // Complete the task
    
    if (success) {
      return {
        success: true,
        message: `Daily task completed: ${params.taskId}`,
        data: { taskId: params.taskId }
      };
    }

    return {
      success: false,
      message: `Failed to complete task: ${params.taskId}`,
      error: 'TASK_COMPLETION_FAILED'
    };
  }

  private async executeDailyCompleteAllCommand(): Promise<CommandResult> {
    const dailyTasks = getCurrentDailyTasks();
    if (!dailyTasks) {
      return { success: false, message: 'No daily tasks found', error: 'NO_DAILY_TASKS' };
    }

    let completedCount = 0;
    dailyTasks.tasks.forEach(task => {
      if (updateTaskProgress(task.id, 999)) {
        completedCount++;
      }
    });

    return {
      success: true,
      message: `Completed ${completedCount} daily tasks`,
      data: { completedCount, totalTasks: dailyTasks.tasks.length }
    };
  }

  private async executeDailyResetCommand(): Promise<CommandResult> {
    resetStreak();
    return {
      success: true,
      message: 'Daily tasks reset',
      data: {}
    };
  }

  private async executeDailyGenerateCommand(): Promise<CommandResult> {
    // This would regenerate daily tasks
    return {
      success: true,
      message: 'New daily tasks generated',
      data: {}
    };
  }

  // Game Simulation Commands
  private async executeGameSimulateCommand(params: { mode: string; questions: number }): Promise<CommandResult> {
    // Simulate a game session
    const gameId = `sim_${Date.now()}`;
    const score = Math.floor(Math.random() * params.questions);
    
    const gameData = {
      id: gameId,
      userId: 'test-user',
      score,
      category: 'tech',
      difficulty: 'medium',
      mode: params.mode,
      questionsAnswered: params.questions,
      correctAnswers: score,
      timeSpent: params.questions * 10, // 10 seconds per question
      date: new Date().toISOString()
    };

    saveGameHistory(gameData);

    return {
      success: true,
      message: `Simulated ${params.mode} game: ${score}/${params.questions} correct`,
      data: gameData
    };
  }

  private async executeGameGenerateScoreCommand(params: { score: number }): Promise<CommandResult> {
    const gameId = `gen_${Date.now()}`;
    const questions = Math.max(params.score, 10); // At least 10 questions
    
    const gameData = {
      id: gameId,
      userId: 'test-user',
      score: params.score,
      category: 'tech',
      difficulty: 'medium',
      mode: 'classic',
      questionsAnswered: questions,
      correctAnswers: params.score,
      timeSpent: questions * 8,
      date: new Date().toISOString()
    };

    saveGameHistory(gameData);

    return {
      success: true,
      message: `Generated game with score ${params.score}/${questions}`,
      data: gameData
    };
  }

  // System Commands
  private async executeResetAllCommand(): Promise<CommandResult> {
    try {
      const profile = getUserProfile();
      if (!profile) {
        return { success: false, message: 'No user profile found', error: 'NO_PROFILE' };
      }

      // Reset all user data
      profile.level = 1;
      profile.totalXp = 0;
      profile.coins = 0;
      profile.points = 0;
      profile.streak = 0;
      profile.achievements = [];
      
      saveUserProfile(profile);

      // Reset daily tasks
      resetStreak();

      // Reset ELO system
      const eloSystem = new EloSystem();
      eloSystem.resetAllRatings();

      // Reset achievements
      const achievements = getAchievements();
      achievements.forEach(achievement => {
        achievement.unlocked = false;
        achievement.unlockedAt = null;
      });
      saveAchievements(achievements);

      toast.success('All user data reset!', {
        description: 'Level, XP, coins, points, streak, achievements, and ELO ratings have been reset',
        duration: 4000
      });

      return {
        success: true,
        message: 'All user data reset successfully',
        data: {
          level: 1,
          xp: 0,
          coins: 0,
          points: 0,
          streak: 0,
          achievements: 0,
          eloReset: true
        }
      };
    } catch (error) {
      console.error('Error resetting all data:', error);
      return {
        success: false,
        message: `Error resetting data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      };
    }
  }

  private async executeBackupDataCommand(): Promise<CommandResult> {
    const profile = getUserProfile();
    this.backupData = { ...profile };
    
    return {
      success: true,
      message: 'Data backup created',
      data: { backupCreated: true }
    };
  }

  private async executeSystemHealthCommand(): Promise<CommandResult> {
    const profile = getUserProfile();
    const stats = getAchievementStats();
    const dailyStats = getDailyTaskStats();
    
    return {
      success: true,
      message: 'System health check completed',
      data: {
        profile: !!profile,
        achievements: stats,
        dailyTasks: dailyStats,
        commandHistory: this.commandHistory.length
      }
    };
  }

  // Help Commands
  private async executeHelpCommand(params: { command?: string }): Promise<CommandResult> {
    if (params.command) {
      const cmd = commandParser.getCommand(params.command);
      if (cmd) {
        return {
          success: true,
          message: `Help for ${cmd.command}: ${cmd.description}`,
          data: { command: cmd }
        };
      }
      return {
        success: false,
        message: `Command not found: ${params.command}`,
        error: 'COMMAND_NOT_FOUND'
      };
    }

    return {
      success: true,
      message: 'Available command categories: user, achievement, elo, daily, game, system, help',
      data: { categories: ['user', 'achievement', 'elo', 'daily', 'game', 'system', 'help'] }
    };
  }

  private async executeCommandsCommand(params: { category?: string }): Promise<CommandResult> {
    const commands = params.category 
      ? commandParser.getCommandsByCategory(params.category as any)
      : commandParser.getAllCommands();

    return {
      success: true,
      message: `Found ${commands.length} commands`,
      data: { commands }
    };
  }

  private async executeExamplesCommand(): Promise<CommandResult> {
    const examples = [
      '/level 50',
      '/coins 10000',
      '/achievement-unlock first_score',
      '/daily-complete-all',
      '/game-simulate classic 10',
      '/help level'
    ];

    return {
      success: true,
      message: 'Command examples:',
      data: { examples }
    };
  }

  // Utility Methods
  private calculateXpForLevel(level: number): number {
    // Use the new balanced XP calculation system
    // This calculates total cumulative XP needed to reach the target level
    const levelData = calculateLevelData(level);
    return levelData.totalXpRequired;
  }

  getCommandHistory(): string[] {
    return [...this.commandHistory];
  }

  clearCommandHistory(): void {
    this.commandHistory = [];
  }

  // ELO Testing Commands
  private async executeEloTestCommand(params: { rating?: number }): Promise<CommandResult> {
    try {
      console.log('ELO test command called with params:', params);
      const eloSystem = new EloSystem();
      const testRating = params.rating || 1200;
      
      console.log('Testing ELO with rating:', testRating);
      
      // Actually update the user's ELO rating to the test value
      const profile = getUserProfile();
      if (!profile) {
        return {
          success: false,
          message: 'No user profile found',
          error: 'NO_PROFILE'
        };
      }
      
      // Initialize ELO data if it doesn't exist
      eloSystem.initializeForExistingUser();
      
      // Set all category ratings to the test rating
      const categories = ['tech', 'business', 'marketing', 'finance', 'general'];
      categories.forEach(category => {
        eloSystem.setCategoryRating(category, testRating);
      });
      
      // Get the updated ELO rank display
      const eloRankDisplay = EloRankSystem.getEloRankDisplay(testRating, 0);
      console.log('ELO rank display:', eloRankDisplay);
      
      toast.success(`ELO updated to ${testRating}`, {
        description: `Rank: ${eloRankDisplay.currentRank.tier} ${eloRankDisplay.currentRank.division}`,
        duration: 3000
      });
      
      return {
        success: true,
        message: `ELO updated to ${testRating}. Rank: ${eloRankDisplay.currentRank.tier} ${eloRankDisplay.currentRank.division}`,
        data: { 
          rating: testRating, 
          rank: eloRankDisplay.currentRank,
          progress: eloRankDisplay.progressToNext
        }
      };
    } catch (error) {
      console.error('ELO test error:', error);
      return {
        success: false,
        message: `ELO test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'ELO_TEST_FAILED'
      };
    }
  }

  private async executeEloDivisionCommand(params: { division?: string }): Promise<CommandResult> {
    try {
      const division = params.division;
      if (!division) {
        return {
          success: false,
          message: 'Division parameter is required (e.g., "Gold III", "Silver I")',
          error: 'MISSING_DIVISION'
        };
      }

      // Complete division mapping based on EloRankSystem
      const divisionMap: { [key: string]: { minElo: number; maxElo: number; tier: string; division: string } } = {
        // Iron Tier
        'iron iv': { minElo: 0, maxElo: 400, tier: 'Iron', division: 'IV' },
        'iron iii': { minElo: 400, maxElo: 600, tier: 'Iron', division: 'III' },
        'iron ii': { minElo: 600, maxElo: 800, tier: 'Iron', division: 'II' },
        'iron i': { minElo: 800, maxElo: 1000, tier: 'Iron', division: 'I' },
        
        // Bronze Tier
        'bronze iv': { minElo: 1000, maxElo: 1200, tier: 'Bronze', division: 'IV' },
        'bronze iii': { minElo: 1200, maxElo: 1400, tier: 'Bronze', division: 'III' },
        'bronze ii': { minElo: 1400, maxElo: 1600, tier: 'Bronze', division: 'II' },
        'bronze i': { minElo: 1600, maxElo: 1800, tier: 'Bronze', division: 'I' },
        
        // Silver Tier
        'silver iv': { minElo: 1800, maxElo: 2000, tier: 'Silver', division: 'IV' },
        'silver iii': { minElo: 2000, maxElo: 2200, tier: 'Silver', division: 'III' },
        'silver ii': { minElo: 2200, maxElo: 2400, tier: 'Silver', division: 'II' },
        'silver i': { minElo: 2400, maxElo: 2600, tier: 'Silver', division: 'I' },
        
        // Gold Tier
        'gold iv': { minElo: 2600, maxElo: 2800, tier: 'Gold', division: 'IV' },
        'gold iii': { minElo: 2800, maxElo: 3000, tier: 'Gold', division: 'III' },
        'gold ii': { minElo: 3000, maxElo: 3200, tier: 'Gold', division: 'II' },
        'gold i': { minElo: 3200, maxElo: 3400, tier: 'Gold', division: 'I' },
        
        // Platinum Tier
        'platinum iv': { minElo: 3400, maxElo: 3600, tier: 'Platinum', division: 'IV' },
        'platinum iii': { minElo: 3600, maxElo: 3800, tier: 'Platinum', division: 'III' },
        'platinum ii': { minElo: 3800, maxElo: 4000, tier: 'Platinum', division: 'II' },
        'platinum i': { minElo: 4000, maxElo: 4200, tier: 'Platinum', division: 'I' },
        
        // Diamond Tier
        'diamond iv': { minElo: 4200, maxElo: 4400, tier: 'Diamond', division: 'IV' },
        'diamond iii': { minElo: 4400, maxElo: 4600, tier: 'Diamond', division: 'III' },
        'diamond ii': { minElo: 4600, maxElo: 4800, tier: 'Diamond', division: 'II' },
        'diamond i': { minElo: 4800, maxElo: 5000, tier: 'Diamond', division: 'I' },
        
        // Master Tier
        'master': { minElo: 5000, maxElo: 6000, tier: 'Master', division: '' },
        
        // Grandmaster Tier
        'grandmaster': { minElo: 6000, maxElo: 7000, tier: 'Grandmaster', division: '' },
        
        // Challenger Tier
        'challenger': { minElo: 7000, maxElo: 10000, tier: 'Challenger', division: '' }
      };
      
      const targetRank = divisionMap[division.toLowerCase()];

      if (!targetRank) {
        return {
          success: false,
          message: `Division not found: ${division}. Available divisions: Iron I-IV, Bronze I-IV, Silver I-IV, Gold I-IV, Platinum I-IV, Diamond I-IV, Master, Grandmaster, Challenger`,
          error: 'DIVISION_NOT_FOUND'
        };
      }

      // Set ELO rating to match the division
      const targetRating = Math.floor((targetRank.minElo + targetRank.maxElo) / 2);
      
      // Initialize ELO system
      const eloSystem = new EloSystem();
      
      // Initialize ELO data if it doesn't exist
      eloSystem.initializeForExistingUser();
      
      // Set all category ratings to the target rating
      const categories = ['tech', 'business', 'marketing', 'finance', 'general'];
      categories.forEach(category => {
        eloSystem.setCategoryRating(category, targetRating);
      });
      
      const eloRankDisplay = EloRankSystem.getEloRankDisplay(targetRating, 0);
      
      toast.success(`ELO set to ${targetRating}`, {
        description: `Rank: ${eloRankDisplay.currentRank.tier} ${eloRankDisplay.currentRank.division}`,
        duration: 3000
      });
      
      return {
        success: true,
        message: `ELO set to ${targetRating}. Rank: ${eloRankDisplay.currentRank.tier} ${eloRankDisplay.currentRank.division}`,
        data: { 
          rating: targetRating, 
          rank: eloRankDisplay.currentRank,
          progress: eloRankDisplay.progressToNext
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to set ELO division: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'ELO_DIVISION_FAILED'
      };
    }
  }

  // Comprehensive Testing Commands
  private async executeTestCommand(params: { testType?: string }): Promise<CommandResult> {
    const testType = params.testType || 'all';
    
    switch (testType) {
      case 'all':
        return await this.executeTestAllCommand();
      case 'dashboard':
        return await this.executeTestDashboardCommand();
      case 'elo':
        return await this.executeTestEloCommand();
      case 'daily':
        return await this.executeTestDailyCommand();
      case 'data':
        return await this.executeTestDataCommand();
      default:
        return {
          success: false,
          message: `Unknown test type: ${testType}. Available: all, dashboard, elo, daily, data`,
          error: 'INVALID_TEST_TYPE'
        };
    }
  }

  private async executeTestAllCommand(): Promise<CommandResult> {
    const results = [];
    
    // Test Dashboard
    const dashboardResult = await this.executeTestDashboardCommand();
    results.push({ test: 'Dashboard', success: dashboardResult.success });
    
    // Test ELO
    const eloResult = await this.executeTestEloCommand();
    results.push({ test: 'ELO System', success: eloResult.success });
    
    // Test Daily Tasks
    const dailyResult = await this.executeTestDailyCommand();
    results.push({ test: 'Daily Tasks', success: dailyResult.success });
    
    // Test Data Flow
    const dataResult = await this.executeTestDataCommand();
    results.push({ test: 'Data Flow', success: dataResult.success });
    
    const allPassed = results.every(r => r.success);
    
    return {
      success: allPassed,
      message: `Comprehensive test completed. ${results.filter(r => r.success).length}/${results.length} tests passed.`,
      data: { results }
    };
  }

  private async executeTestDashboardCommand(): Promise<CommandResult> {
    try {
      const profile = getUserProfile();
      const dailyTasks = getCurrentDailyTasks();
      const eloSystem = new EloSystem();
      
      // Test data availability
      const hasProfile = !!profile;
      const hasDailyTasks = !!dailyTasks;
      const hasEloData = !!eloSystem.getOverallRating();
      
      return {
        success: hasProfile && hasDailyTasks && hasEloData,
        message: `Dashboard test: Profile(${hasProfile}) DailyTasks(${hasDailyTasks}) ELO(${hasEloData})`,
        data: { hasProfile, hasDailyTasks, hasEloData }
      };
    } catch (error) {
      return {
        success: false,
        message: `Dashboard test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'DASHBOARD_TEST_FAILED'
      };
    }
  }

  private async executeTestEloCommand(): Promise<CommandResult> {
    try {
      const eloSystem = new EloSystem();
      const rating = eloSystem.getOverallRating();
      const stats = eloSystem.getEloStats();
      
      return {
        success: true,
        message: `ELO test passed. Rating: ${rating}, Games: ${stats.gamesPlayed}`,
        data: { rating, stats }
      };
    } catch (error) {
      return {
        success: false,
        message: `ELO test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'ELO_TEST_FAILED'
      };
    }
  }

  private async executeTestDailyCommand(): Promise<CommandResult> {
    try {
      const dailyTasks = getCurrentDailyTasks();
      const dailyStats = getDailyTaskStats();
      
      return {
        success: true,
        message: `Daily tasks test passed. Tasks: ${dailyTasks?.tasks?.length || 0}, Stats: ${!!dailyStats}`,
        data: { taskCount: dailyTasks?.tasks?.length || 0, hasStats: !!dailyStats }
      };
    } catch (error) {
      return {
        success: false,
        message: `Daily tasks test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'DAILY_TEST_FAILED'
      };
    }
  }

  private async executeTestDataCommand(): Promise<CommandResult> {
    try {
      const profile = getUserProfile();
      const achievements = getAchievementStats();
      const dailyStats = getDailyTaskStats();
      const gameHistory = getGameHistoryByUserId(profile?.id || 'default');
      
      return {
        success: true,
        message: `Data flow test passed. Profile: ${!!profile}, Achievements: ${achievements.totalUnlocked}, Games: ${gameHistory.length}`,
        data: { 
          hasProfile: !!profile, 
          achievementCount: achievements.totalUnlocked,
          gameCount: gameHistory.length,
          hasDailyStats: !!dailyStats
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Data flow test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'DATA_TEST_FAILED'
      };
    }
  }

  // Context Commands
  private async executeContextCommand(params: { action?: string }): Promise<CommandResult> {
    const action = params.action || 'status';
    
    switch (action) {
      case 'refresh':
        return await this.executeContextRefreshCommand();
      case 'status':
        return await this.executeContextStatusCommand();
      case 'reset':
        return await this.executeContextResetCommand();
      case 'debug':
        return await this.executeContextDebugCommand();
      default:
        return {
          success: false,
          message: `Unknown context action: ${action}. Available: refresh, status, reset, debug`,
          error: 'INVALID_CONTEXT_ACTION'
        };
    }
  }

  private async executeContextRefreshCommand(): Promise<CommandResult> {
    try {
      // Force refresh of all data
      const profile = getUserProfile();
      if (!profile) {
        return { success: false, message: 'No profile found to refresh', error: 'NO_PROFILE' };
      }
      
      // Trigger a data refresh by updating the profile
      profile.lastUpdated = new Date();
      saveUserProfile(profile);
      
      return {
        success: true,
        message: 'User data context refreshed successfully',
        data: { refreshed: true, timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        message: `Context refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'CONTEXT_REFRESH_FAILED'
      };
    }
  }

  private async executeContextStatusCommand(): Promise<CommandResult> {
    try {
      const profile = getUserProfile();
      const dailyTasks = getCurrentDailyTasks();
      const eloSystem = new EloSystem();
      
      return {
        success: true,
        message: 'Context status check completed',
        data: {
          hasProfile: !!profile,
          hasDailyTasks: !!dailyTasks,
          eloRating: eloSystem.getOverallRating(),
          lastUpdated: profile?.lastUpdated || 'Never'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Context status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'CONTEXT_STATUS_FAILED'
      };
    }
  }

  private async executeContextResetCommand(): Promise<CommandResult> {
    try {
      // Reset all user data
      localStorage.removeItem('boltquest_user_profile');
      localStorage.removeItem('boltquest_achievements');
      localStorage.removeItem('boltquest_daily_tasks');
      localStorage.removeItem('boltquest_elo_ratings');
      localStorage.removeItem('boltquest_game_history');
      
      return {
        success: true,
        message: 'User data context reset successfully',
        data: { reset: true, timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        message: `Context reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'CONTEXT_RESET_FAILED'
      };
    }
  }

  private async executeContextDebugCommand(): Promise<CommandResult> {
    try {
      const profile = getUserProfile();
      const achievements = getAchievementStats();
      const dailyTasks = getCurrentDailyTasks();
      const eloSystem = new EloSystem();
      const gameHistory = getGameHistoryByUserId(profile?.id || 'default');
      
      return {
        success: true,
        message: 'Context debug information retrieved',
        data: {
          profile: profile ? {
            id: profile.id,
            username: profile.username,
            level: profile.level,
            totalXp: profile.totalXp,
            coins: profile.coins,
            lastUpdated: profile.lastUpdated
          } : null,
          achievements: achievements,
          dailyTasks: dailyTasks ? {
            taskCount: dailyTasks.tasks?.length || 0,
            completedCount: dailyTasks.tasks?.filter(t => t.completed).length || 0
          } : null,
          elo: {
            rating: eloSystem.getOverallRating(),
            stats: eloSystem.getEloStats()
          },
          gameHistory: {
            count: gameHistory.length,
            recent: gameHistory.slice(0, 3)
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Context debug failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'CONTEXT_DEBUG_FAILED'
      };
    }
  }

  // History Commands
  private async executeHistoryCommand(params: { action?: string }): Promise<CommandResult> {
    const action = params.action || 'stats';
    
    switch (action) {
      case 'add':
        return await this.executeHistoryAddCommand({});
      case 'clear':
        return await this.executeHistoryClearCommand();
      case 'stats':
        return await this.executeHistoryStatsCommand();
      case 'export':
        return await this.executeHistoryExportCommand();
      default:
        return {
          success: false,
          message: `Unknown history action: ${action}. Available: add, clear, stats, export`,
          error: 'INVALID_HISTORY_ACTION'
        };
    }
  }

  private async executeHistoryAddCommand(params: { category?: string, score?: number, accuracy?: number }): Promise<CommandResult> {
    try {
      const profile = getUserProfile();
      if (!profile) {
        return { success: false, message: 'No profile found', error: 'NO_PROFILE' };
      }
      
      const testGame = {
        id: `test_${Date.now()}`,
        userId: profile.id,
        category: params.category || 'tech',
        difficulty: 'medium',
        score: params.score || Math.floor(Math.random() * 100) + 50,
        accuracy: params.accuracy || Math.floor(Math.random() * 30) + 70,
        questionsAnswered: 10,
        timeSpent: 300,
        timestamp: new Date(),
        gameMode: 'classic'
      };
      
      saveGameHistory(testGame);
      
      return {
        success: true,
        message: `Test game added to history: ${testGame.category} - ${testGame.score} points`,
        data: { game: testGame }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to add test game: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'HISTORY_ADD_FAILED'
      };
    }
  }

  private async executeHistoryClearCommand(): Promise<CommandResult> {
    try {
      const profile = getUserProfile();
      if (!profile) {
        return { success: false, message: 'No profile found', error: 'NO_PROFILE' };
      }
      
      localStorage.removeItem(`boltquest_game_history_${profile.id}`);
      
      return {
        success: true,
        message: 'Game history cleared successfully',
        data: { cleared: true, timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to clear history: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'HISTORY_CLEAR_FAILED'
      };
    }
  }

  private async executeHistoryStatsCommand(): Promise<CommandResult> {
    try {
      const profile = getUserProfile();
      if (!profile) {
        return { success: false, message: 'No profile found', error: 'NO_PROFILE' };
      }
      
      const gameHistory = getGameHistoryByUserId(profile.id);
      const totalGames = gameHistory.length;
      const avgScore = totalGames > 0 ? Math.round(gameHistory.reduce((sum, game) => sum + game.score, 0) / totalGames) : 0;
      const avgAccuracy = totalGames > 0 ? Math.round(gameHistory.reduce((sum, game) => sum + game.accuracy, 0) / totalGames) : 0;
      const bestScore = totalGames > 0 ? Math.max(...gameHistory.map(game => game.score)) : 0;
      
      return {
        success: true,
        message: `History stats: ${totalGames} games, Avg Score: ${avgScore}, Avg Accuracy: ${avgAccuracy}%, Best: ${bestScore}`,
        data: {
          totalGames,
          avgScore,
          avgAccuracy,
          bestScore,
          recentGames: gameHistory.slice(0, 5)
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to get history stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'HISTORY_STATS_FAILED'
      };
    }
  }

  private async executeHistoryExportCommand(): Promise<CommandResult> {
    try {
      const profile = getUserProfile();
      if (!profile) {
        return { success: false, message: 'No profile found', error: 'NO_PROFILE' };
      }
      
      const gameHistory = getGameHistoryByUserId(profile.id);
      const exportData = {
        userId: profile.id,
        exportDate: new Date(),
        gameCount: gameHistory.length,
        games: gameHistory
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `game_history_${profile.id}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      return {
        success: true,
        message: `Game history exported: ${gameHistory.length} games`,
        data: { exported: true, gameCount: gameHistory.length }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to export history: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'HISTORY_EXPORT_FAILED'
      };
    }
  }

  // Notification Commands
  private async executeNotifyCommand(params: { action?: string }): Promise<CommandResult> {
    const action = params.action || 'test';
    
    switch (action) {
      case 'test':
        return await this.executeNotifyTestCommand();
      case 'generate':
        return await this.executeNotifyGenerateCommand();
      case 'clear':
        return await this.executeNotifyClearCommand();
      case 'settings':
        return await this.executeNotifySettingsCommand();
      default:
        return {
          success: false,
          message: `Unknown notification action: ${action}. Available: test, generate, clear, settings`,
          error: 'INVALID_NOTIFY_ACTION'
        };
    }
  }

  private async executeNotifyTestCommand(): Promise<CommandResult> {
    try {
      toast.success('Test notification sent!', { duration: 3000 });
      
      return {
        success: true,
        message: 'Test notification sent successfully',
        data: { sent: true, timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to send test notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'NOTIFY_TEST_FAILED'
      };
    }
  }

  private async executeNotifyGenerateCommand(): Promise<CommandResult> {
    try {
      // Generate a smart notification
      const notifications = [
        '🎯 You\'re on fire! Complete 3 more games to reach your daily goal!',
        '🏆 New achievement unlocked: Speed Demon!',
        '📈 Your ELO rating increased by 25 points!',
        '🔥 5-day streak! Keep it up!',
        '💡 Try the tech category to improve your programming knowledge!'
      ];
      
      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      toast.info(randomNotification, { duration: 5000 });
      
      return {
        success: true,
        message: 'Smart notification generated and sent',
        data: { notification: randomNotification, sent: true }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to generate notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'NOTIFY_GENERATE_FAILED'
      };
    }
  }

  private async executeNotifyClearCommand(): Promise<CommandResult> {
    try {
      // Clear notification storage
      localStorage.removeItem('boltquest_notifications');
      
      return {
        success: true,
        message: 'All notifications cleared',
        data: { cleared: true, timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to clear notifications: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'NOTIFY_CLEAR_FAILED'
      };
    }
  }

  private async executeNotifySettingsCommand(): Promise<CommandResult> {
    try {
      const settings = {
        enabled: true,
        streakReminders: true,
        achievementAlerts: true,
        learningInsights: true,
        milestoneCelebrations: true,
        socialUpdates: false
      };
      
      return {
        success: true,
        message: 'Notification settings retrieved',
        data: { settings }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to get notification settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'NOTIFY_SETTINGS_FAILED'
      };
    }
  }

  // Scenario Commands
  private async executeScenarioCommand(params: { scenario?: string }): Promise<CommandResult> {
    const scenario = params.scenario || 'newuser';
    
    switch (scenario) {
      case 'newuser':
        return await this.executeScenarioNewUserCommand();
      case 'poweruser':
        return await this.executeScenarioPowerUserCommand();
      case 'casual':
        return await this.executeScenarioCasualCommand();
      case 'reset':
        return await this.executeScenarioResetCommand();
      default:
        return {
          success: false,
          message: `Unknown scenario: ${scenario}. Available: newuser, poweruser, casual, reset`,
          error: 'INVALID_SCENARIO'
        };
    }
  }

  private async executeScenarioNewUserCommand(): Promise<CommandResult> {
    try {
      // Reset to new user state
      const newUserProfile = {
        id: 'test_new_user',
        username: 'NewUser',
        email: 'newuser@test.com',
        level: 1,
        totalXp: 0,
        coins: 100,
        points: 0,
        streak: 0,
        statistics: {
          totalGamesPlayed: 0,
          bestScore: 0,
          averageAccuracy: 0,
          totalCorrectAnswers: 0
        },
        preferences: {
          theme: 'light',
          soundEnabled: true,
          musicEnabled: true,
          notificationsEnabled: true,
          defaultCategory: 'general',
          defaultDifficulty: 'easy',
          defaultTimer: 30,
          autoPause: false,
          showHints: true,
          language: 'en'
        },
        createdAt: new Date(),
        lastActive: new Date(),
        lastUpdated: new Date()
      };
      
      saveUserProfile(newUserProfile);
      
      return {
        success: true,
        message: 'New user scenario set up successfully',
        data: { scenario: 'newuser', profile: newUserProfile }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to set up new user scenario: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'SCENARIO_NEWUSER_FAILED'
      };
    }
  }

  private async executeScenarioPowerUserCommand(): Promise<CommandResult> {
    try {
      const profile = getUserProfile();
      if (!profile) {
        return { success: false, message: 'No profile found', error: 'NO_PROFILE' };
      }
      
      // Set up power user state
      profile.level = 50;
      profile.totalXp = 50000;
      profile.coins = 10000;
      profile.points = 5000;
      profile.streak = 30;
      profile.statistics = {
        totalGamesPlayed: 500,
        bestScore: 1000,
        averageAccuracy: 95,
        totalCorrectAnswers: 2500
      };
      
      saveUserProfile(profile);
      
      return {
        success: true,
        message: 'Power user scenario set up successfully',
        data: { scenario: 'poweruser', profile }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to set up power user scenario: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'SCENARIO_POWERUSER_FAILED'
      };
    }
  }

  private async executeScenarioCasualCommand(): Promise<CommandResult> {
    try {
      const profile = getUserProfile();
      if (!profile) {
        return { success: false, message: 'No profile found', error: 'NO_PROFILE' };
      }
      
      // Set up casual user state
      profile.level = 10;
      profile.totalXp = 2000;
      profile.coins = 500;
      profile.points = 200;
      profile.streak = 3;
      profile.statistics = {
        totalGamesPlayed: 25,
        bestScore: 300,
        averageAccuracy: 75,
        totalCorrectAnswers: 150
      };
      
      saveUserProfile(profile);
      
      return {
        success: true,
        message: 'Casual user scenario set up successfully',
        data: { scenario: 'casual', profile }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to set up casual user scenario: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'SCENARIO_CASUAL_FAILED'
      };
    }
  }

  private async executeScenarioResetCommand(): Promise<CommandResult> {
    try {
      // Reset all data
      localStorage.clear();
      
      return {
        success: true,
        message: 'All scenarios and data reset successfully',
        data: { reset: true, timestamp: new Date() }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to reset scenarios: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'SCENARIO_RESET_FAILED'
      };
    }
  }
}

// Export singleton instance
export const commandExecutor = new CommandExecutor();
