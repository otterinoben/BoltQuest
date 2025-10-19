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
    const eloSystem = new EloSystem();
    
    // This would need to be implemented in the ELO system
    // For now, return a placeholder response
    return {
      success: true,
      message: `ELO rating for ${params.category} set to ${params.rating}`,
      data: { category: params.category, rating: params.rating }
    };
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
}

// Export singleton instance
export const commandExecutor = new CommandExecutor();
