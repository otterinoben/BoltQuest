/**
 * Testing Commands System
 * Comprehensive command definitions and parsing for the testing chat interface
 */

export interface CommandParameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'enum';
  required: boolean;
  description: string;
  options?: string[];
  min?: number;
  max?: number;
}

export interface ChatCommand {
  command: string;
  description: string;
  parameters: CommandParameter[];
  category: CommandCategory;
  examples: string[];
  requiresConfirmation?: boolean;
  aliases?: string[];
}

export type CommandCategory = 'user' | 'achievement' | 'elo' | 'daily' | 'game' | 'system' | 'help' | 'testing' | 'context' | 'history' | 'notify' | 'scenario';

export interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface ParsedCommand {
  command: string;
  parameters: Record<string, any>;
  originalInput: string;
}

// Command Definitions
export const COMMANDS: ChatCommand[] = [
  // User Manipulation Commands
  {
    command: '/level',
    description: 'Set user level directly',
    parameters: [
      {
        name: 'level',
        type: 'number',
        required: true,
        description: 'Target level (1-200+)',
        min: 1,
        max: 1000
      }
    ],
    category: 'user',
    examples: ['/level 50', '/level 100'],
    aliases: ['/lvl']
  },
  {
    command: '/xp',
    description: 'Add or subtract XP',
    parameters: [
      {
        name: 'amount',
        type: 'number',
        required: true,
        description: 'XP amount (positive or negative)',
        min: -100000,
        max: 100000
      }
    ],
    category: 'user',
    examples: ['/xp 1000', '/xp -500'],
    aliases: ['/experience']
  },
  {
    command: '/coins',
    description: 'Set coin amount',
    parameters: [
      {
        name: 'amount',
        type: 'number',
        required: true,
        description: 'Coin amount',
        min: 0,
        max: 1000000
      }
    ],
    category: 'user',
    examples: ['/coins 5000', '/coins 100000'],
    aliases: ['/money', '/gold']
  },
  {
    command: '/add-coins',
    description: 'Add coins to current amount',
    parameters: [
      {
        name: 'amount',
        type: 'number',
        required: true,
        description: 'Coins to add',
        min: 1,
        max: 100000
      }
    ],
    category: 'user',
    examples: ['/add-coins 1000', '/add-coins 50000']
  },
  {
    command: '/points',
    description: 'Set points amount',
    parameters: [
      {
        name: 'amount',
        type: 'number',
        required: true,
        description: 'Points amount',
        min: 0,
        max: 100000
      }
    ],
    category: 'user',
    examples: ['/points 1000', '/points 50000'],
    aliases: ['/score']
  },
  {
    command: '/streak',
    description: 'Set daily streak',
    parameters: [
      {
        name: 'days',
        type: 'number',
        required: true,
        description: 'Streak days',
        min: 0,
        max: 365
      }
    ],
    category: 'user',
    examples: ['/streak 10', '/streak 100'],
    aliases: ['/daily-streak']
  },
  {
    command: '/level-up',
    description: 'Force level up',
    parameters: [],
    category: 'user',
    examples: ['/level-up'],
    aliases: ['/lvlup']
  },
  {
    command: '/level-down',
    description: 'Force level down',
    parameters: [],
    category: 'user',
    examples: ['/level-down'],
    aliases: ['/lvldown']
  },
  {
    command: '/reset-level',
    description: 'Reset to level 1',
    parameters: [],
    category: 'user',
    examples: ['/reset-level'],
    requiresConfirmation: true,
    aliases: ['/reset-lvl']
  },
  {
    command: '/fix-profile',
    description: 'Fix profile data mismatch (level vs XP)',
    parameters: [],
    category: 'user',
    examples: ['/fix-profile'],
    aliases: ['/fix', '/repair']
  },
  {
    command: '/reset-currency',
    description: 'Reset all currency to 0',
    parameters: [],
    category: 'user',
    examples: ['/reset-currency'],
    requiresConfirmation: true
  },

  // Achievement Commands
  {
    command: '/achievement-unlock',
    description: 'Unlock specific achievement',
    parameters: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Achievement ID'
      }
    ],
    category: 'achievement',
    examples: ['/achievement-unlock first_score', '/achievement-unlock perfect_game'],
    aliases: ['/ach-unlock', '/unlock-ach']
  },
  {
    command: '/achievement-reset',
    description: 'Reset specific achievement',
    parameters: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Achievement ID'
      }
    ],
    category: 'achievement',
    examples: ['/achievement-reset first_score'],
    aliases: ['/ach-reset']
  },
  {
    command: '/achievement-reset-all',
    description: 'Reset all achievements',
    parameters: [],
    category: 'achievement',
    examples: ['/achievement-reset-all'],
    requiresConfirmation: true,
    aliases: ['/ach-reset-all']
  },
  {
    command: '/achievements-list',
    description: 'List all achievements',
    parameters: [],
    category: 'achievement',
    examples: ['/achievements-list'],
    aliases: ['/ach-list', '/list-ach']
  },
  {
    command: '/achievement-bulk-unlock',
    description: 'Unlock random achievements',
    parameters: [
      {
        name: 'count',
        type: 'number',
        required: true,
        description: 'Number of achievements to unlock',
        min: 1,
        max: 50
      }
    ],
    category: 'achievement',
    examples: ['/achievement-bulk-unlock 5', '/achievement-bulk-unlock 10'],
    aliases: ['/ach-bulk']
  },

  // ELO Commands
  {
    command: '/elo',
    description: 'Set ELO rating for category',
    parameters: [
      {
        name: 'category',
        type: 'enum',
        required: true,
        description: 'Category name',
        options: ['tech', 'business', 'science', 'general', 'overall']
      },
      {
        name: 'rating',
        type: 'number',
        required: true,
        description: 'ELO rating',
        min: 0,
        max: 3000
      }
    ],
    category: 'elo',
    examples: ['/elo tech 1200', '/elo overall 1500'],
    aliases: ['/rating']
  },
  {
    command: '/elo-reset',
    description: 'Reset ELO rating for category',
    parameters: [
      {
        name: 'category',
        type: 'enum',
        required: true,
        description: 'Category name',
        options: ['tech', 'business', 'science', 'general', 'overall']
      }
    ],
    category: 'elo',
    examples: ['/elo-reset tech', '/elo-reset overall'],
    aliases: ['/rating-reset']
  },
  {
    command: '/elo-reset-all',
    description: 'Reset all ELO ratings',
    parameters: [],
    category: 'elo',
    examples: ['/elo-reset-all'],
    requiresConfirmation: true,
    aliases: ['/rating-reset-all']
  },
  {
    command: '/elo-simulate',
    description: 'Simulate games for ELO changes',
    parameters: [
      {
        name: 'games',
        type: 'number',
        required: true,
        description: 'Number of games to simulate',
        min: 1,
        max: 100
      }
    ],
    category: 'elo',
    examples: ['/elo-simulate 10', '/elo-simulate 50'],
    aliases: ['/simulate-games']
  },

  // Daily Task Commands
  {
    command: '/daily-complete',
    description: 'Complete specific daily task',
    parameters: [
      {
        name: 'taskId',
        type: 'string',
        required: true,
        description: 'Task ID'
      }
    ],
    category: 'daily',
    examples: ['/daily-complete play_3_games', '/daily-complete score_10_points'],
    aliases: ['/complete-task']
  },
  {
    command: '/daily-complete-all',
    description: 'Complete all daily tasks',
    parameters: [],
    category: 'daily',
    examples: ['/daily-complete-all'],
    aliases: ['/complete-all-tasks']
  },
  {
    command: '/daily-reset',
    description: 'Reset daily tasks',
    parameters: [],
    category: 'daily',
    examples: ['/daily-reset'],
    requiresConfirmation: true,
    aliases: ['/reset-daily']
  },
  {
    command: '/daily-generate',
    description: 'Generate new daily tasks',
    parameters: [],
    category: 'daily',
    examples: ['/daily-generate'],
    aliases: ['/new-daily']
  },

  // Game Simulation Commands
  {
    command: '/game-simulate',
    description: 'Simulate game session',
    parameters: [
      {
        name: 'mode',
        type: 'enum',
        required: true,
        description: 'Game mode',
        options: ['classic', 'quick', 'training']
      },
      {
        name: 'questions',
        type: 'number',
        required: true,
        description: 'Number of questions',
        min: 1,
        max: 50
      }
    ],
    category: 'game',
    examples: ['/game-simulate classic 10', '/game-simulate quick 5'],
    aliases: ['/simulate-game']
  },
  {
    command: '/game-generate-score',
    description: 'Generate game with specific score',
    parameters: [
      {
        name: 'score',
        type: 'number',
        required: true,
        description: 'Target score',
        min: 0,
        max: 50
      }
    ],
    category: 'game',
    examples: ['/game-generate-score 10', '/game-generate-score 25'],
    aliases: ['/generate-score']
  },

  // System Commands
  {
    command: '/reset-all',
    description: 'Reset all user data',
    parameters: [],
    category: 'system',
    examples: ['/reset-all'],
    requiresConfirmation: true,
    aliases: ['/reset-everything']
  },
  {
    command: '/backup-data',
    description: 'Create data backup',
    parameters: [],
    category: 'system',
    examples: ['/backup-data'],
    aliases: ['/backup']
  },
  {
    command: '/system-health',
    description: 'Check system status',
    parameters: [],
    category: 'system',
    examples: ['/system-health'],
    aliases: ['/health', '/status']
  },

  // Help Commands
  {
    command: '/help',
    description: 'Show general help',
    parameters: [
      {
        name: 'command',
        type: 'string',
        required: false,
        description: 'Specific command to get help for'
      }
    ],
    category: 'help',
    examples: ['/help', '/help level', '/help achievement-unlock'],
    aliases: ['/h', '/?']
  },
  {
    command: '/commands',
    description: 'List all available commands',
    parameters: [
      {
        name: 'category',
        type: 'enum',
        required: false,
        description: 'Filter by category',
        options: ['user', 'achievement', 'elo', 'daily', 'game', 'system', 'help', 'testing', 'context', 'history', 'notify', 'scenario']
      }
    ],
    category: 'help',
    examples: ['/commands', '/commands user', '/commands achievement'],
    aliases: ['/list', '/cmd']
  },
  {
    command: '/examples',
    description: 'Show command examples',
    parameters: [],
    category: 'help',
    examples: ['/examples'],
    aliases: ['/ex']
  },

  // ELO Testing Commands
  {
    command: '/elo-test',
    description: 'Test ELO ranking system',
    parameters: [
      {
        name: 'rating',
        type: 'number',
        required: false,
        description: 'ELO rating to test',
        min: 0,
        max: 3000
      }
    ],
    category: 'elo',
    examples: ['/elo-test', '/elo-test 1200', '/elo-test 1500'],
    aliases: ['/elo test']
  },
  {
    command: '/elo-division',
    description: 'Set ELO division for testing',
    parameters: [
      {
        name: 'division',
        type: 'string',
        required: true,
        description: 'Division to set (e.g., "Gold III", "Silver I")'
      }
    ],
    category: 'elo',
    examples: ['/elo-division "Gold III"', '/elo-division "Silver I"'],
    aliases: ['/elo division']
  },

  // Comprehensive Testing Commands
  {
    command: '/test',
    description: 'Run comprehensive tests',
    parameters: [
      {
        name: 'testType',
        type: 'enum',
        required: false,
        description: 'Type of test to run',
        options: ['all', 'dashboard', 'elo', 'daily', 'data']
      }
    ],
    category: 'testing',
    examples: ['/test', '/test all', '/test dashboard', '/test elo'],
    aliases: ['/test-all', '/test-dashboard', '/test-elo', '/test-daily', '/test-data']
  },
  {
    command: '/context',
    description: 'User data context management',
    parameters: [
      {
        name: 'action',
        type: 'enum',
        required: false,
        description: 'Context action to perform',
        options: ['refresh', 'status', 'reset', 'debug']
      }
    ],
    category: 'context',
    examples: ['/context', '/context refresh', '/context status', '/context debug'],
    aliases: ['/context-refresh', '/context-status', '/context-reset', '/context-debug']
  },
  {
    command: '/history',
    description: 'Game history management',
    parameters: [
      {
        name: 'action',
        type: 'enum',
        required: false,
        description: 'History action to perform',
        options: ['add', 'clear', 'stats', 'export']
      }
    ],
    category: 'history',
    examples: ['/history', '/history add', '/history stats', '/history export'],
    aliases: ['/history-add', '/history-clear', '/history-stats', '/history-export']
  },
  {
    command: '/notify',
    description: 'Notification system management',
    parameters: [
      {
        name: 'action',
        type: 'enum',
        required: false,
        description: 'Notification action to perform',
        options: ['test', 'generate', 'clear', 'settings']
      }
    ],
    category: 'notify',
    examples: ['/notify', '/notify test', '/notify generate', '/notify settings'],
    aliases: ['/notify-test', '/notify-generate', '/notify-clear', '/notify-settings']
  },
  {
    command: '/scenario',
    description: 'Set up testing scenarios',
    parameters: [
      {
        name: 'scenario',
        type: 'enum',
        required: false,
        description: 'Scenario to set up',
        options: ['newuser', 'poweruser', 'casual', 'reset']
      }
    ],
    category: 'scenario',
    examples: ['/scenario', '/scenario newuser', '/scenario poweruser', '/scenario reset'],
    aliases: ['/scenario-newuser', '/scenario-poweruser', '/scenario-casual', '/scenario-reset']
  }
];

// Command Parser
export class CommandParser {
  private commands: Map<string, ChatCommand> = new Map();
  private aliases: Map<string, string> = new Map();

  constructor() {
    this.initializeCommands();
  }

  private initializeCommands() {
    COMMANDS.forEach(cmd => {
      this.commands.set(cmd.command, cmd);
      
      // Add aliases
      if (cmd.aliases) {
        cmd.aliases.forEach(alias => {
          this.aliases.set(alias, cmd.command);
        });
      }
    });
  }

  parse(input: string): ParsedCommand | null {
    const trimmed = input.trim();
    if (!trimmed.startsWith('/')) {
      return null;
    }

    const parts = trimmed.split(/\s+/);
    const commandName = parts[0];
    
    // Check for aliases
    const actualCommand = this.aliases.get(commandName) || commandName;
    const command = this.commands.get(actualCommand);
    
    if (!command) {
      return null;
    }

    const parameters: Record<string, any> = {};
    const paramParts = parts.slice(1);

    // Parse parameters
    for (let i = 0; i < command.parameters.length; i++) {
      const param = command.parameters[i];
      let value: string;

      // For string parameters, join remaining parts to handle multi-word values
      if (param.type === 'string' && paramParts.length > i + 1) {
        // Check if this is a multi-word string parameter
        const remainingParts = paramParts.slice(i);
        value = remainingParts.join(' ');
      } else {
        value = paramParts[i];
      }

      if (!value && param.required) {
        throw new Error(`Missing required parameter: ${param.name}`);
      }

      if (value) {
        parameters[param.name] = this.parseParameter(value, param);
      }
    }

    return {
      command: actualCommand,
      parameters,
      originalInput: trimmed
    };
  }

  private parseParameter(value: string, param: CommandParameter): any {
    switch (param.type) {
      case 'number':
        const num = parseFloat(value);
        if (isNaN(num)) {
          throw new Error(`Invalid number: ${value}`);
        }
        if (param.min !== undefined && num < param.min) {
          throw new Error(`Value ${num} is below minimum ${param.min}`);
        }
        if (param.max !== undefined && num > param.max) {
          throw new Error(`Value ${num} is above maximum ${param.max}`);
        }
        return num;

      case 'boolean':
        return value.toLowerCase() === 'true' || value.toLowerCase() === 'yes';

      case 'enum':
        if (param.options && !param.options.includes(value)) {
          throw new Error(`Invalid option: ${value}. Valid options: ${param.options.join(', ')}`);
        }
        return value;

      case 'string':
      default:
        return value;
    }
  }

  getCommand(commandName: string): ChatCommand | undefined {
    const actualCommand = this.aliases.get(commandName) || commandName;
    return this.commands.get(actualCommand);
  }

  getAllCommands(): ChatCommand[] {
    return COMMANDS;
  }

  getCommandsByCategory(category: CommandCategory): ChatCommand[] {
    return COMMANDS.filter(cmd => cmd.category === category);
  }

  searchCommands(query: string): ChatCommand[] {
    const lowerQuery = query.toLowerCase();
    return COMMANDS.filter(cmd => 
      cmd.command.toLowerCase().includes(lowerQuery) ||
      cmd.description.toLowerCase().includes(lowerQuery) ||
      (cmd.aliases && cmd.aliases.some(alias => alias.toLowerCase().includes(lowerQuery)))
    );
  }

  getAutoCompleteSuggestions(input: string): string[] {
    const trimmed = input.trim();
    if (!trimmed.startsWith('/')) {
      return [];
    }

    const suggestions: string[] = [];
    const lowerInput = trimmed.toLowerCase();

    COMMANDS.forEach(cmd => {
      if (cmd.command.toLowerCase().startsWith(lowerInput)) {
        suggestions.push(cmd.command);
      }
      
      if (cmd.aliases) {
        cmd.aliases.forEach(alias => {
          if (alias.toLowerCase().startsWith(lowerInput)) {
            suggestions.push(alias);
          }
        });
      }
    });

    return suggestions.sort();
  }
}

// Export singleton instance
export const commandParser = new CommandParser();
