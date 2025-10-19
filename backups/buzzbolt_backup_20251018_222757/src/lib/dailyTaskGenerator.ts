/**
 * Daily Task Generator
 * Creates unique random challenges for daily tasks
 */

import { DailyTask, TaskDifficulty, TaskCategory } from '@/types/dailyTasks';

const STORAGE_KEY = 'buzzbolt_daily_tasks';
const STREAK_STORAGE_KEY = 'buzzbolt_daily_streak';

// Realistic daily task templates - all completable in 1-5 games
const TASK_TEMPLATES = {
  score: {
    easy: [
      { title: "First Steps", description: "Score {value} points in any single game", xp: 50, points: 10 },
      { title: "Point Starter", description: "Get {value}+ points in one game", xp: 50, points: 10 },
      { title: "Score Beginner", description: "Reach {value} points in any mode", xp: 50, points: 10 },
      { title: "Points Quest", description: "Score {value}+ points total today", xp: 50, points: 10 },
      { title: "Scoring Rookie", description: "Hit {value} points in under 3 minutes", xp: 50, points: 10 }
    ],
    medium: [
      { title: "Score Surge", description: "Achieve {value}+ points in a single game", xp: 100, points: 25 },
      { title: "Point Powerhouse", description: "Score {value}+ points in {value} different games", xp: 100, points: 25 },
      { title: "High Scorer", description: "Reach {value} points in under 2 minutes", xp: 100, points: 25 },
      { title: "Score Spree", description: "Get {value}+ points in consecutive games", xp: 100, points: 25 },
      { title: "Point Prodigy", description: "Score {value}+ points without skipping", xp: 100, points: 25 }
    ],
    hard: [
      { title: "Score Legend", description: "Achieve {value}+ points with 90%+ accuracy", xp: 200, points: 50 },
      { title: "Point Perfectionist", description: "Score {value}+ points without pausing", xp: 200, points: 50 },
      { title: "Elite Scorer", description: "Reach {value} points in under 90 seconds", xp: 200, points: 50 },
      { title: "Score Master", description: "Get {value}+ points in {value} consecutive games", xp: 200, points: 50 },
      { title: "Point Virtuoso", description: "Score {value}+ points with perfect accuracy", xp: 200, points: 50 }
    ]
  },
  combo: {
    easy: [
      { title: "Combo Starter", description: "Get a {value}x combo in any game", xp: 50, points: 10 },
      { title: "Streak Builder", description: "Achieve {value}+ combo in one game", xp: 50, points: 10 },
      { title: "Flow Finder", description: "Hit {value}x combo in any mode", xp: 50, points: 10 },
      { title: "Rhythm Runner", description: "Get {value}+ combo without skipping", xp: 50, points: 10 },
      { title: "Momentum Maker", description: "Build {value}x combo in under 2 minutes", xp: 50, points: 10 }
    ],
    medium: [
      { title: "Combo Specialist", description: "Get a {value}x combo in {value} different games", xp: 100, points: 25 },
      { title: "Streak Master", description: "Achieve {value}+ combo in consecutive games", xp: 100, points: 25 },
      { title: "Flow Fighter", description: "Hit {value}x combo without pausing", xp: 100, points: 25 },
      { title: "Rhythm Ruler", description: "Get {value}+ combo in under 3 minutes", xp: 100, points: 25 },
      { title: "Momentum Maestro", description: "Build {value}x combo with 80%+ accuracy", xp: 100, points: 25 }
    ],
    hard: [
      { title: "Combo Legend", description: "Get a {value}x combo with 95%+ accuracy", xp: 200, points: 50 },
      { title: "Streak Sovereign", description: "Achieve {value}+ combo without skips or pauses", xp: 200, points: 50 },
      { title: "Flow Virtuoso", description: "Hit {value}x combo in under 2 minutes", xp: 200, points: 50 },
      { title: "Rhythm Royalty", description: "Get {value}+ combo in {value} consecutive games", xp: 200, points: 50 },
      { title: "Momentum Monarch", description: "Build {value}x combo with perfect accuracy", xp: 200, points: 50 }
    ]
  },
  games: {
    easy: [
      { title: "Game Starter", description: "Play {value} games in any mode", xp: 50, points: 10 },
      { title: "Session Seeker", description: "Complete {value} games today", xp: 50, points: 10 },
      { title: "Mode Mixer", description: "Play {value} games across different modes", xp: 50, points: 10 },
      { title: "Practice Player", description: "Finish {value} games without quitting", xp: 50, points: 10 },
      { title: "Daily Gamer", description: "Play {value} games in under 10 minutes", xp: 50, points: 10 }
    ],
    medium: [
      { title: "Game Specialist", description: "Play {value} games in {mode} mode", xp: 100, points: 25 },
      { title: "Session Master", description: "Complete {value} games with 80%+ accuracy", xp: 100, points: 25 },
      { title: "Mode Maverick", description: "Play {value} games without skipping", xp: 100, points: 25 },
      { title: "Practice Pro", description: "Finish {value} games in under 15 minutes", xp: 100, points: 25 },
      { title: "Daily Dynamo", description: "Play {value} games without pausing", xp: 100, points: 25 }
    ],
    hard: [
      { title: "Game Legend", description: "Play {value} games with 90%+ accuracy", xp: 200, points: 50 },
      { title: "Session Sovereign", description: "Complete {value} games without skips or pauses", xp: 200, points: 50 },
      { title: "Mode Monarch", description: "Play {value} games in under 20 minutes", xp: 200, points: 50 },
      { title: "Practice Perfectionist", description: "Finish {value} games with perfect accuracy", xp: 200, points: 50 },
      { title: "Daily Dominator", description: "Play {value} games with 95%+ accuracy", xp: 200, points: 50 }
    ]
  },
  difficulty: {
    easy: [
      { title: "Easy Explorer", description: "Play {value} games on easy difficulty", xp: 50, points: 10 },
      { title: "Beginner Builder", description: "Complete {value} easy games", xp: 50, points: 10 },
      { title: "Simple Seeker", description: "Play {value} easy games in any mode", xp: 50, points: 10 },
      { title: "Gentle Gamer", description: "Finish {value} easy games without skipping", xp: 50, points: 10 },
      { title: "Calm Competitor", description: "Play {value} easy games in under 5 minutes", xp: 50, points: 10 }
    ],
    medium: [
      { title: "Medium Master", description: "Play {value} games on medium difficulty", xp: 100, points: 25 },
      { title: "Balanced Builder", description: "Complete {value} medium games", xp: 100, points: 25 },
      { title: "Moderate Maverick", description: "Play {value} medium games with 80%+ accuracy", xp: 100, points: 25 },
      { title: "Steady Seeker", description: "Finish {value} medium games without pausing", xp: 100, points: 25 },
      { title: "Centered Competitor", description: "Play {value} medium games in under 10 minutes", xp: 100, points: 25 }
    ],
    hard: [
      { title: "Hard Hero", description: "Play {value} games on hard difficulty", xp: 200, points: 50 },
      { title: "Tough Titan", description: "Complete {value} hard games", xp: 200, points: 50 },
      { title: "Challenging Champion", description: "Play {value} hard games with 85%+ accuracy", xp: 200, points: 50 },
      { title: "Difficult Dynamo", description: "Finish {value} hard games without skipping", xp: 200, points: 50 },
      { title: "Elite Expert", description: "Play {value} hard games in under 15 minutes", xp: 200, points: 50 }
    ]
  },
  time: {
    easy: [
      { title: "Quick Player", description: "Play for {value} minutes total today", xp: 50, points: 10 },
      { title: "Time Tracker", description: "Spend {value} minutes playing games", xp: 50, points: 10 },
      { title: "Session Timer", description: "Play for {value}+ minutes in one session", xp: 50, points: 10 },
      { title: "Duration Dabbler", description: "Play for {value} minutes without pausing", xp: 50, points: 10 },
      { title: "Clock Watcher", description: "Spend {value} minutes in any mode", xp: 50, points: 10 }
    ],
    medium: [
      { title: "Time Master", description: "Play for {value} minutes with 80%+ accuracy", xp: 100, points: 25 },
      { title: "Duration Dynamo", description: "Spend {value} minutes without skipping", xp: 100, points: 25 },
      { title: "Session Specialist", description: "Play for {value}+ minutes in one session", xp: 100, points: 25 },
      { title: "Timer Titan", description: "Spend {value} minutes across different modes", xp: 100, points: 25 },
      { title: "Clock Champion", description: "Play for {value} minutes without pausing", xp: 100, points: 25 }
    ],
    hard: [
      { title: "Time Legend", description: "Play for {value} minutes with 90%+ accuracy", xp: 200, points: 50 },
      { title: "Duration Dominator", description: "Spend {value} minutes without skips or pauses", xp: 200, points: 50 },
      { title: "Session Sovereign", description: "Play for {value}+ minutes in one session", xp: 200, points: 50 },
      { title: "Timer Tyrant", description: "Spend {value} minutes with perfect accuracy", xp: 200, points: 50 },
      { title: "Clock Conqueror", description: "Play for {value} minutes across all difficulties", xp: 200, points: 50 }
    ]
  },
  accuracy: {
    easy: [
      { title: "Accuracy Aspirant", description: "Achieve {value}%+ accuracy in any game", xp: 50, points: 10 },
      { title: "Precision Player", description: "Get {value}%+ accuracy in one game", xp: 50, points: 10 },
      { title: "Focus Finder", description: "Score {value}%+ accuracy without skipping", xp: 50, points: 10 },
      { title: "Hit Rate Hero", description: "Maintain {value}%+ accuracy in a single game", xp: 50, points: 10 },
      { title: "Target Tracker", description: "Achieve {value}%+ accuracy in under 3 minutes", xp: 50, points: 10 }
    ],
    medium: [
      { title: "Accuracy Ace", description: "Achieve {value}%+ accuracy in {value} consecutive games", xp: 100, points: 25 },
      { title: "Precision Pro", description: "Get {value}%+ accuracy in {value} different games", xp: 100, points: 25 },
      { title: "Focus Master", description: "Score {value}%+ accuracy without pausing", xp: 100, points: 25 },
      { title: "Hit Rate Hunter", description: "Maintain {value}%+ accuracy across {value} games", xp: 100, points: 25 },
      { title: "Target Titan", description: "Achieve {value}%+ accuracy in under 2 minutes", xp: 100, points: 25 }
    ],
    hard: [
      { title: "Accuracy Legend", description: "Achieve {value}%+ accuracy in {value} consecutive games", xp: 200, points: 50 },
      { title: "Precision Perfectionist", description: "Get {value}%+ accuracy without skips or pauses", xp: 200, points: 50 },
      { title: "Focus Virtuoso", description: "Score {value}%+ accuracy in under 90 seconds", xp: 200, points: 50 },
      { title: "Hit Rate Hero", description: "Maintain {value}%+ accuracy across {value} games", xp: 200, points: 50 },
      { title: "Target Tyrant", description: "Achieve {value}%+ accuracy with perfect gameplay", xp: 200, points: 50 }
    ]
  },
  category: {
    easy: [
      { title: "Tech Taster", description: "Play {value} games in Technology", xp: 50, points: 10 },
      { title: "Business Basics", description: "Play {value} games in Business", xp: 50, points: 10 },
      { title: "Marketing Mix", description: "Play {value} games in Marketing", xp: 50, points: 10 },
      { title: "Finance First", description: "Play {value} games in Finance", xp: 50, points: 10 },
      { title: "General Genius", description: "Play {value} games in General", xp: 50, points: 10 }
    ],
    medium: [
      { title: "Category Conqueror", description: "Score {value}+ points in {category} category", xp: 100, points: 25 },
      { title: "Subject Specialist", description: "Play {value} games in {category} with 80%+ accuracy", xp: 100, points: 25 },
      { title: "Topic Titan", description: "Complete {value} games in {category} without skipping", xp: 100, points: 25 },
      { title: "Field Expert", description: "Score {value}+ points in {category} in under 5 minutes", xp: 100, points: 25 },
      { title: "Domain Master", description: "Play {value} consecutive games in {category}", xp: 100, points: 25 }
    ],
    hard: [
      { title: "Category Champion", description: "Score {value}+ points in {category} with 90%+ accuracy", xp: 200, points: 50 },
      { title: "Subject Sovereign", description: "Play {value} games in {category} with perfect accuracy", xp: 200, points: 50 },
      { title: "Topic Tyrant", description: "Score {value}+ points in {category} in under 3 minutes", xp: 200, points: 50 },
      { title: "Field Legend", description: "Complete {value} games in {category} without any skips", xp: 200, points: 50 },
      { title: "Domain Dominator", description: "Play {value} games in {category} with 95%+ accuracy", xp: 200, points: 50 }
    ]
  },
  mode: {
    easy: [
      { title: "Quick Starter", description: "Play {value} games in Quick Play mode", xp: 50, points: 10 },
      { title: "Training Time", description: "Play {value} games in Training mode", xp: 50, points: 10 },
      { title: "Mode Mixer", description: "Play {value} games across different modes", xp: 50, points: 10 },
      { title: "Speed Seeker", description: "Complete {value} Quick Play games", xp: 50, points: 10 },
      { title: "Practice Player", description: "Finish {value} Training games", xp: 50, points: 10 }
    ],
    medium: [
      { title: "Speed Demon", description: "Complete {value} Quick Play games with time remaining", xp: 100, points: 25 },
      { title: "Practice Pro", description: "Finish {value} Training games in under 5 minutes each", xp: 100, points: 25 },
      { title: "Mode Master", description: "Play {value} games in {mode} mode with 80%+ accuracy", xp: 100, points: 25 },
      { title: "Time Trialer", description: "Complete {value} Quick Play games without pausing", xp: 100, points: 25 },
      { title: "Session Specialist", description: "Finish {value} Training games without skipping", xp: 100, points: 25 }
    ],
    hard: [
      { title: "Time Master", description: "Complete {value} Quick Play games with 30+ seconds remaining", xp: 200, points: 50 },
      { title: "Training Titan", description: "Finish {value} Training games in under 3 minutes each", xp: 200, points: 50 },
      { title: "Mode Maestro", description: "Play {value} games in {mode} mode with perfect accuracy", xp: 200, points: 50 },
      { title: "Speed Sovereign", description: "Complete {value} Quick Play games with 45+ seconds left", xp: 200, points: 50 },
      { title: "Practice Perfectionist", description: "Finish {value} Training games with 100% accuracy", xp: 200, points: 50 }
    ]
  },
  completion: {
    easy: [
      { title: "Task Finisher", description: "Complete {value} daily tasks today", xp: 50, points: 10 },
      { title: "Goal Getter", description: "Finish {value} easy tasks", xp: 50, points: 10 },
      { title: "Mission Master", description: "Complete {value} tasks without skipping", xp: 50, points: 10 },
      { title: "Objective Ace", description: "Finish {value} tasks in under 10 minutes", xp: 50, points: 10 },
      { title: "Quest Queen", description: "Complete {value} tasks with 80%+ accuracy", xp: 50, points: 10 }
    ],
    medium: [
      { title: "Task Titan", description: "Complete {value} daily tasks with 85%+ accuracy", xp: 100, points: 25 },
      { title: "Goal Guardian", description: "Finish {value} medium tasks", xp: 100, points: 25 },
      { title: "Mission Maverick", description: "Complete {value} tasks without pausing", xp: 100, points: 25 },
      { title: "Objective Overlord", description: "Finish {value} tasks in under 15 minutes", xp: 100, points: 25 },
      { title: "Quest King", description: "Complete {value} tasks across different categories", xp: 100, points: 25 }
    ],
    hard: [
      { title: "Task Tyrant", description: "Complete {value} daily tasks with 90%+ accuracy", xp: 200, points: 50 },
      { title: "Goal God", description: "Finish {value} hard tasks", xp: 200, points: 50 },
      { title: "Mission Monarch", description: "Complete {value} tasks without skips or pauses", xp: 200, points: 50 },
      { title: "Objective Emperor", description: "Finish {value} tasks in under 20 minutes", xp: 200, points: 50 },
      { title: "Quest Conqueror", description: "Complete {value} tasks with perfect accuracy", xp: 200, points: 50 }
    ]
  }
};

const CATEGORIES = ['tech', 'business', 'marketing', 'finance', 'general'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const MODES = ['quick', 'training'];

// Available task categories (removed achievement-based tasks)
const TASK_CATEGORIES: TaskCategory[] = [
  'score', 'combo', 'games', 'difficulty', 'time', 'accuracy', 'category', 'mode', 'completion'
];

/**
 * Generate a random daily task
 */
export const generateDailyTask = (difficulty: TaskDifficulty, category: TaskCategory): DailyTask => {
  const templates = TASK_TEMPLATES[category][difficulty];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Generate realistic values based on difficulty and category
  let requirement = 1;
  let xpReward = template.xp;
  let pointsReward = template.points;

  // Realistic requirements based on category and difficulty
  switch (category) {
    case 'score':
      switch (difficulty) {
        case 'easy': requirement = Math.floor(Math.random() * 3) + 2; break; // 2-4 points
        case 'medium': requirement = Math.floor(Math.random() * 4) + 5; break; // 5-8 points
        case 'hard': requirement = Math.floor(Math.random() * 5) + 8; break; // 8-12 points
      }
      break;
    
    case 'combo':
      switch (difficulty) {
        case 'easy': requirement = Math.floor(Math.random() * 2) + 2; break; // 2-3 combo
        case 'medium': requirement = Math.floor(Math.random() * 3) + 4; break; // 4-6 combo
        case 'hard': requirement = Math.floor(Math.random() * 4) + 7; break; // 7-10 combo
      }
      break;
    
    case 'games':
      switch (difficulty) {
        case 'easy': requirement = Math.floor(Math.random() * 2) + 1; break; // 1-2 games
        case 'medium': requirement = Math.floor(Math.random() * 2) + 2; break; // 2-3 games
        case 'hard': requirement = Math.floor(Math.random() * 2) + 3; break; // 3-4 games
      }
      break;
    
    case 'difficulty':
      switch (difficulty) {
        case 'easy': requirement = Math.floor(Math.random() * 2) + 1; break; // 1-2 games
        case 'medium': requirement = Math.floor(Math.random() * 2) + 2; break; // 2-3 games
        case 'hard': requirement = Math.floor(Math.random() * 2) + 3; break; // 3-4 games
      }
      break;
    
    case 'time':
      switch (difficulty) {
        case 'easy': requirement = Math.floor(Math.random() * 3) + 3; break; // 3-5 minutes
        case 'medium': requirement = Math.floor(Math.random() * 5) + 5; break; // 5-9 minutes
        case 'hard': requirement = Math.floor(Math.random() * 5) + 10; break; // 10-14 minutes
      }
      break;
    
    case 'accuracy':
      switch (difficulty) {
        case 'easy': requirement = Math.floor(Math.random() * 10) + 70; break; // 70-79%
        case 'medium': requirement = Math.floor(Math.random() * 10) + 80; break; // 80-89%
        case 'hard': requirement = Math.floor(Math.random() * 5) + 90; break; // 90-94%
      }
      break;
    
    case 'category':
      switch (difficulty) {
        case 'easy': requirement = Math.floor(Math.random() * 2) + 1; break; // 1-2 games
        case 'medium': requirement = Math.floor(Math.random() * 2) + 2; break; // 2-3 games
        case 'hard': requirement = Math.floor(Math.random() * 2) + 3; break; // 3-4 games
      }
      break;
    
    case 'mode':
      switch (difficulty) {
        case 'easy': requirement = Math.floor(Math.random() * 2) + 1; break; // 1-2 games
        case 'medium': requirement = Math.floor(Math.random() * 2) + 2; break; // 2-3 games
        case 'hard': requirement = Math.floor(Math.random() * 2) + 3; break; // 3-4 games
      }
      break;
    
    case 'completion':
      switch (difficulty) {
        case 'easy': requirement = Math.floor(Math.random() * 2) + 2; break; // 2-3 tasks
        case 'medium': requirement = Math.floor(Math.random() * 2) + 3; break; // 3-4 tasks
        case 'hard': requirement = Math.floor(Math.random() * 2) + 4; break; // 4-5 tasks
      }
      break;
  }

  // Special requirements for specific categories
  let categoryValue = '';
  let difficultyValue = '';
  let modeValue = '';
  
  if (category === 'category') {
    categoryValue = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  } else if (category === 'mode') {
    modeValue = MODES[Math.floor(Math.random() * MODES.length)];
  }

  const taskId = `${category}_${difficulty}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id: taskId,
    title: template.title,
    description: template.description
      .replace('{value}', requirement.toString())
      .replace('{category}', categoryValue)
      .replace('{difficulty}', difficultyValue)
      .replace('{mode}', modeValue),
    difficulty,
    category,
    requirement,
    currentProgress: 0,
    completed: false,
    xpReward,
    pointsReward,
    icon: getCategoryIcon(category),
    requirements: {
      type: getRequirementType(category),
      value: requirement,
      category: categoryValue || undefined,
      difficulty: difficultyValue || undefined,
      mode: modeValue || undefined
    }
  };
};

/**
 * Generate a complete daily task set
 */
export const generateDailyTaskSet = (date: string): DailyTask[] => {
  const tasks: DailyTask[] = [];
  
  // Generate 2 easy tasks
  for (let i = 0; i < 2; i++) {
    const category = TASK_CATEGORIES[Math.floor(Math.random() * TASK_CATEGORIES.length)];
    tasks.push(generateDailyTask('easy', category));
  }
  
  // Generate 2 medium tasks
  for (let i = 0; i < 2; i++) {
    const category = TASK_CATEGORIES[Math.floor(Math.random() * TASK_CATEGORIES.length)];
    tasks.push(generateDailyTask('medium', category));
  }
  
  // Generate 1 hard task
  const hardCategory = TASK_CATEGORIES[Math.floor(Math.random() * TASK_CATEGORIES.length)];
  tasks.push(generateDailyTask('hard', hardCategory));
  
  return tasks;
};

/**
 * Reroll a specific task with a new random task of the same difficulty
 */
export const rerollTask = (taskId: string, currentDifficulty: TaskDifficulty): DailyTask | null => {
  try {
    console.log('Rerolling task with difficulty:', currentDifficulty);
    
    // Get a random category for the same difficulty
    const randomCategory = TASK_CATEGORIES[Math.floor(Math.random() * TASK_CATEGORIES.length)];
    console.log('Selected category:', randomCategory);
    
    // Generate new task
    const newTask = generateDailyTask(currentDifficulty, randomCategory);
    console.log('Generated new task:', newTask.title, 'Description:', newTask.description);
    
    // Keep the same ID to maintain task tracking
    newTask.id = taskId;
    
    return newTask;
  } catch (error) {
    console.error('Error rerolling task:', error);
    return null;
  }
};

/**
 * Generate completion task
 */
export const generateCompletionTask = (): DailyTask => {
  return {
    id: 'completion_task',
    title: 'Daily Master',
    description: 'Complete all daily tasks',
    difficulty: 'hard',
    category: 'streak',
    requirement: 1,
    currentProgress: 0,
    completed: false,
    xpReward: 300,
    pointsReward: 100,
    icon: '🏆',
    requirements: {
      type: 'games',
      value: 1
    }
  };
};

/**
 * Get category icon
 */
const getCategoryIcon = (category: TaskCategory): string => {
  const icons = {
    score: '🎯',
    category: '📚',
    mode: '🎮',
    accuracy: '🎯',
    streak: '🔥',
    achievement: '🏆',
    time: '⏰',
    social: '👥',
    exploration: '🔍'
  };
  return icons[category] || '📋';
};

/**
 * Get requirement type based on category
 */
const getRequirementType = (category: TaskCategory): 'score' | 'games' | 'accuracy' | 'streak' | 'time' | 'category' | 'mode' | 'achievement' => {
  const typeMap = {
    score: 'score',
    category: 'category',
    mode: 'mode',
    accuracy: 'accuracy',
    streak: 'streak',
    achievement: 'achievement',
    time: 'time',
    social: 'games',
    exploration: 'games'
  };
  return typeMap[category] || 'games';
};

/**
 * Get current date in YYYY-MM-DD format
 */
export const getCurrentDate = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

/**
 * Check if it's a new day (for reset)
 */
export const isNewDay = (lastDate: string): boolean => {
  return lastDate !== getCurrentDate();
};
