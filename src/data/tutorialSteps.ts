/**
 * Tutorial Step Definitions
 * All tutorial steps for BoltQuest with content and validation
 */

import { TutorialStepDefinition, TutorialCategory } from '@/types/tutorial';

// Helper function to create step definitions
const createStep = (
  id: string,
  title: string,
  description: string,
  category: TutorialCategory,
  page: string,
  order: number,
  options: Partial<TutorialStepDefinition> = {}
): TutorialStepDefinition => ({
  id,
  title,
  description,
  category,
  page,
  order,
  skipAllowed: true,
  estimatedTime: 30,
  position: 'center',
  action: 'wait',
  ...options
});

// Tutorial step definitions
export const tutorialSteps: TutorialStepDefinition[] = [
  // Welcome Steps
  createStep(
    'welcome-1',
    'Welcome to BoltQuest!',
    'Learn business buzzwords through fast-paced, gamified quizzes. Let\'s get you started!',
    'welcome',
    'dashboard',
    1,
    {
      position: 'center',
      action: 'wait',
      skipAllowed: false,
      estimatedTime: 10,
      content: {
        text: 'Welcome to BoltQuest! This tutorial will guide you through all the features and help you become a buzzword master.',
        interactive: false
      }
    }
  ),

  createStep(
    'welcome-2',
    'What You\'ll Learn',
    'By the end of this tutorial, you\'ll know how to play games, track your progress, and compete on leaderboards.',
    'welcome',
    'dashboard',
    2,
    {
      position: 'center',
      action: 'wait',
      skipAllowed: false,
      estimatedTime: 15,
      content: {
        text: 'You\'ll learn about game modes, scoring systems, profile management, and much more!',
        interactive: false
      }
    }
  ),

  createStep(
    'welcome-3',
    'Let\'s Begin!',
    'Ready to start your journey? Click the "Start Tutorial" button to begin.',
    'welcome',
    'dashboard',
    3,
    {
      position: 'center',
      action: 'click',
      targetElement: '[data-tutorial="start-tutorial"]',
      skipAllowed: false,
      estimatedTime: 5,
      content: {
        text: 'Click the button below to start your personalized tutorial experience.',
        interactive: true
      }
    }
  ),

  // Onboarding Steps
  createStep(
    'onboarding-username',
    'Choose Your Username',
    'This will be displayed on leaderboards and in your profile. You can change it later.',
    'onboarding',
    'onboarding',
    4,
    {
      position: 'bottom',
      action: 'form',
      targetElement: '[data-tutorial="username-input"]',
      skipAllowed: true,
      estimatedTime: 20,
      content: {
        text: 'Enter a username that represents you. This will be visible to other players on leaderboards.',
        helpText: 'Choose something memorable and professional',
        interactive: true
      },
      validation: () => {
        const input = document.querySelector('[data-tutorial="username-input"]') as HTMLInputElement;
        return input && input.value.length > 0;
      }
    }
  ),

  createStep(
    'onboarding-avatar',
    'Select Your Avatar',
    'Choose a profile picture or upload a custom one. This helps personalize your experience.',
    'onboarding',
    'onboarding',
    5,
    {
      position: 'bottom',
      action: 'click',
      targetElement: '[data-tutorial="avatar-selection"]',
      skipAllowed: true,
      estimatedTime: 25,
      content: {
        text: 'Pick an avatar that represents you. You can choose from colors or upload your own image.',
        helpText: 'Click on any color or use the upload button for a custom image',
        interactive: true
      }
    }
  ),

  createStep(
    'onboarding-interests',
    'Choose Your Interests',
    'Select the topics you\'re most interested in learning about. This helps personalize your experience.',
    'onboarding',
    'onboarding',
    6,
    {
      position: 'bottom',
      action: 'click',
      targetElement: '[data-tutorial="interests-selection"]',
      skipAllowed: true,
      estimatedTime: 30,
      content: {
        text: 'Select at least 3 topics that interest you. This helps us recommend the best content for you.',
        helpText: 'You can select multiple topics by clicking on them',
        interactive: true
      },
      validation: () => {
        const selectedInterests = document.querySelectorAll('[data-tutorial="interest-item"]:checked');
        return selectedInterests.length >= 3;
      }
    }
  ),

  createStep(
    'onboarding-preferences',
    'Set Your Preferences',
    'Configure your learning preferences including timer settings and hints.',
    'onboarding',
    'onboarding',
    7,
    {
      position: 'bottom',
      action: 'form',
      targetElement: '[data-tutorial="preferences-form"]',
      skipAllowed: true,
      estimatedTime: 20,
      content: {
        text: 'Set your preferred timer duration and whether you want hints enabled.',
        helpText: 'You can change these settings later in your profile',
        interactive: true
      }
    }
  ),

  createStep(
    'onboarding-complete',
    'Setup Complete!',
    'Great! You\'re all set up. Now let\'s learn how to play the game.',
    'onboarding',
    'onboarding',
    8,
    {
      position: 'center',
      action: 'wait',
      skipAllowed: false,
      estimatedTime: 10,
      content: {
        text: 'Perfect! Your profile is set up and you\'re ready to start learning.',
        successMessage: 'Profile setup complete!',
        interactive: false
      }
    }
  ),

  // Gameplay Steps
  createStep(
    'gameplay-quick-start',
    'Quick Start Section',
    'This is the fastest way to start playing. It uses smart defaults based on your preferences.',
    'gameplay',
    'play',
    9,
    {
      position: 'bottom',
      action: 'hover',
      targetElement: '[data-tutorial="quick-start-section"]',
      skipAllowed: true,
      estimatedTime: 20,
      content: {
        text: 'The Quick Start section lets you jump right into a game with recommended settings.',
        helpText: 'Hover over the Quick Start card to see the details',
        interactive: true
      }
    }
  ),

  createStep(
    'gameplay-category-selection',
    'Choose Your Category',
    'Select the topic you want to learn about. Each category has different difficulty levels.',
    'gameplay',
    'play',
    10,
    {
      position: 'bottom',
      action: 'click',
      targetElement: '[data-tutorial="category-buttons"]',
      skipAllowed: true,
      estimatedTime: 25,
      content: {
        text: 'Click on any category button to select it. Each category has a different number of questions.',
        helpText: 'Try clicking on different categories to see the question counts',
        interactive: true
      }
    }
  ),

  createStep(
    'gameplay-difficulty-selection',
    'Choose Difficulty Level',
    'Select how challenging you want the questions to be. Start with Easy if you\'re new.',
    'gameplay',
    'play',
    11,
    {
      position: 'bottom',
      action: 'click',
      targetElement: '[data-tutorial="difficulty-buttons"]',
      skipAllowed: true,
      estimatedTime: 20,
      content: {
        text: 'Choose your difficulty level. Easy questions are basic, Medium are intermediate, and Hard are advanced.',
        helpText: 'The time estimates show how long each difficulty typically takes',
        interactive: true
      }
    }
  ),

  createStep(
    'gameplay-mode-selection',
    'Choose Game Mode',
    'Quick Play is timed with penalties, while Training Mode lets you learn at your own pace.',
    'gameplay',
    'play',
    12,
    {
      position: 'bottom',
      action: 'click',
      targetElement: '[data-tutorial="mode-selection"]',
      skipAllowed: true,
      estimatedTime: 30,
      content: {
        text: 'Quick Play is for competitive timed challenges, while Training Mode is for learning without pressure.',
        helpText: 'Read the descriptions to understand the differences',
        interactive: true
      }
    }
  ),

  createStep(
    'gameplay-timer-settings',
    'Set Timer Duration',
    'Choose how long you want each question to be displayed. Longer times give you more thinking time.',
    'gameplay',
    'play',
    13,
    {
      position: 'bottom',
      action: 'click',
      targetElement: '[data-tutorial="timer-settings"]',
      skipAllowed: true,
      estimatedTime: 20,
      content: {
        text: 'Select your preferred timer duration. 30s is quick, 45s is balanced, and 60s gives you more time.',
        helpText: 'You can change this setting anytime',
        interactive: true
      }
    }
  ),

  createStep(
    'gameplay-start-game',
    'Start Playing!',
    'Click the "Start Playing Now" button to begin your first game with the selected settings.',
    'gameplay',
    'play',
    14,
    {
      position: 'bottom',
      action: 'click',
      targetElement: '[data-tutorial="start-game-button"]',
      skipAllowed: true,
      estimatedTime: 10,
      content: {
        text: 'Ready to play? Click the button to start your first game!',
        helpText: 'This will take you to the game screen',
        interactive: true
      }
    }
  ),

  createStep(
    'gameplay-game-interface',
    'Game Interface',
    'This is the game screen. You\'ll see questions, answer options, and your progress.',
    'gameplay',
    'game',
    15,
    {
      position: 'center',
      action: 'wait',
      skipAllowed: true,
      estimatedTime: 20,
      content: {
        text: 'The game interface shows the question, answer options, timer, and your score.',
        helpText: 'Take a moment to familiarize yourself with the layout',
        interactive: false
      }
    }
  ),

  createStep(
    'gameplay-answer-selection',
    'Select Your Answer',
    'Click on the answer you think is correct. You can change your selection before time runs out.',
    'gameplay',
    'game',
    16,
    {
      position: 'bottom',
      action: 'click',
      targetElement: '[data-tutorial="answer-options"]',
      skipAllowed: true,
      estimatedTime: 25,
      content: {
        text: 'Click on any answer option to select it. The selected answer will be highlighted.',
        helpText: 'You can change your selection by clicking a different option',
        interactive: true
      }
    }
  ),

  createStep(
    'gameplay-controls',
    'Game Controls',
    'Use these controls to pause, skip questions, or quit the game. Keyboard shortcuts are also available.',
    'gameplay',
    'game',
    17,
    {
      position: 'top',
      action: 'hover',
      targetElement: '[data-tutorial="game-controls"]',
      skipAllowed: true,
      estimatedTime: 30,
      content: {
        text: 'The control buttons let you pause (Space), skip (S), or quit (Esc) the game.',
        helpText: 'Hover over each button to see what it does',
        interactive: true
      }
    }
  ),

  // Profile Steps
  createStep(
    'profile-overview',
    'Your Profile',
    'This is your personal dashboard where you can view your progress and manage your account.',
    'profile',
    'profile',
    18,
    {
      position: 'bottom',
      action: 'hover',
      targetElement: '[data-tutorial="profile-overview"]',
      skipAllowed: true,
      estimatedTime: 20,
      content: {
        text: 'Your profile shows your statistics, achievements, and personal information.',
        helpText: 'This is where you can track your learning progress',
        interactive: true
      }
    }
  ),

  createStep(
    'profile-statistics',
    'View Your Statistics',
    'See your performance across different categories and difficulty levels.',
    'profile',
    'profile',
    19,
    {
      position: 'bottom',
      action: 'click',
      targetElement: '[data-tutorial="statistics-section"]',
      skipAllowed: true,
      estimatedTime: 25,
      content: {
        text: 'The statistics section shows your accuracy, best scores, and performance trends.',
        helpText: 'Click on different sections to see detailed breakdowns',
        interactive: true
      }
    }
  ),

  createStep(
    'profile-avatar-upload',
    'Upload Custom Avatar',
    'You can upload your own profile picture or choose from the available colors.',
    'profile',
    'profile',
    20,
    {
      position: 'bottom',
      action: 'click',
      targetElement: '[data-tutorial="avatar-upload"]',
      skipAllowed: true,
      estimatedTime: 30,
      content: {
        text: 'Click the upload button to add a custom profile picture, or choose from the color options.',
        helpText: 'Supported formats: JPG, PNG, GIF up to 2MB',
        interactive: true
      }
    }
  ),

  createStep(
    'profile-preferences',
    'Manage Preferences',
    'Update your learning preferences, interests, and account settings.',
    'profile',
    'profile',
    21,
    {
      position: 'bottom',
      action: 'click',
      targetElement: '[data-tutorial="preferences-section"]',
      skipAllowed: true,
      estimatedTime: 25,
      content: {
        text: 'The preferences section lets you customize your learning experience.',
        helpText: 'You can change your interests, timer settings, and more',
        interactive: true
      }
    }
  ),

  // Leaderboards Steps
  createStep(
    'leaderboards-overview',
    'Leaderboards',
    'See how you rank against other players across different time periods and categories.',
    'leaderboards',
    'leaderboards',
    22,
    {
      position: 'bottom',
      action: 'hover',
      targetElement: '[data-tutorial="leaderboards-section"]',
      skipAllowed: true,
      estimatedTime: 20,
      content: {
        text: 'The leaderboards show rankings for Weekly, Monthly, and All-Time periods.',
        helpText: 'Hover over different sections to see the details',
        interactive: true
      }
    }
  ),

  createStep(
    'leaderboards-filters',
    'Filter Leaderboards',
    'Use the category filters to see rankings for specific topics.',
    'leaderboards',
    'leaderboards',
    23,
    {
      position: 'bottom',
      action: 'click',
      targetElement: '[data-tutorial="category-filters"]',
      skipAllowed: true,
      estimatedTime: 20,
      content: {
        text: 'Click on category buttons to filter the leaderboards by specific topics.',
        helpText: 'Try filtering by different categories to see how rankings change',
        interactive: true
      }
    }
  ),

  createStep(
    'leaderboards-personal-rank',
    'Your Ranking',
    'Find your personal ranking and see how you compare to other players.',
    'leaderboards',
    'leaderboards',
    24,
    {
      position: 'bottom',
      action: 'scroll',
      targetElement: '[data-tutorial="personal-ranking"]',
      skipAllowed: true,
      estimatedTime: 15,
      content: {
        text: 'Scroll through the leaderboard to find your ranking and see how you compare.',
        helpText: 'Your ranking is highlighted in the list',
        interactive: true
      }
    }
  ),

  // Analytics Steps
  createStep(
    'analytics-overview',
    'Analytics Dashboard',
    'View detailed analytics about your learning progress and performance trends.',
    'analytics',
    'analytics',
    25,
    {
      position: 'bottom',
      action: 'hover',
      targetElement: '[data-tutorial="analytics-dashboard"]',
      skipAllowed: true,
      estimatedTime: 25,
      content: {
        text: 'The analytics dashboard shows detailed insights about your learning progress.',
        helpText: 'Hover over different charts to see detailed information',
        interactive: true
      }
    }
  ),

  createStep(
    'analytics-performance-trends',
    'Performance Trends',
    'See how your performance has improved over time across different categories.',
    'analytics',
    'analytics',
    26,
    {
      position: 'bottom',
      action: 'click',
      targetElement: '[data-tutorial="performance-charts"]',
      skipAllowed: true,
      estimatedTime: 30,
      content: {
        text: 'The performance charts show your improvement over time and identify your strengths and weaknesses.',
        helpText: 'Click on different chart sections to see detailed breakdowns',
        interactive: true
      }
    }
  ),

  // Help Steps
  createStep(
    'help-overview',
    'Help & Support',
    'Find answers to common questions and learn about all available features.',
    'help',
    'help',
    27,
    {
      position: 'bottom',
      action: 'hover',
      targetElement: '[data-tutorial="help-section"]',
      skipAllowed: true,
      estimatedTime: 20,
      content: {
        text: 'The help section contains guides, FAQs, and support information.',
        helpText: 'Browse through different sections to find what you need',
        interactive: true
      }
    }
  ),

  createStep(
    'help-keyboard-shortcuts',
    'Keyboard Shortcuts',
    'Learn about keyboard shortcuts that can speed up your gameplay.',
    'help',
    'help',
    28,
    {
      position: 'bottom',
      action: 'click',
      targetElement: '[data-tutorial="shortcuts-section"]',
      skipAllowed: true,
      estimatedTime: 25,
      content: {
        text: 'Keyboard shortcuts can make your gameplay faster and more efficient.',
        helpText: 'Try using Space to pause, S to skip, and Esc to quit',
        interactive: true
      }
    }
  ),

  // Completion Steps
  createStep(
    'completion-congratulations',
    'Congratulations!',
    'You\'ve completed the tutorial and learned all the key features of BoltQuest.',
    'completion',
    'dashboard',
    29,
    {
      position: 'center',
      action: 'wait',
      skipAllowed: false,
      estimatedTime: 15,
      content: {
        text: 'Great job! You now know how to use all the main features of BoltQuest.',
        successMessage: 'Tutorial completed successfully!',
        interactive: false
      }
    }
  ),

  createStep(
    'completion-next-steps',
    'What\'s Next?',
    'Start playing games, track your progress, and compete on leaderboards. Have fun learning!',
    'completion',
    'dashboard',
    30,
    {
      position: 'center',
      action: 'wait',
      skipAllowed: false,
      estimatedTime: 10,
      content: {
        text: 'You\'re all set! Start playing games and see how much you can learn.',
        helpText: 'Remember, you can always revisit this tutorial if you need help',
        interactive: false
      }
    }
  )
];

// Helper functions
export const getStepsByCategory = (category: TutorialCategory): TutorialStepDefinition[] => {
  return tutorialSteps.filter(step => step.category === category);
};

export const getStepsByPage = (page: string): TutorialStepDefinition[] => {
  return tutorialSteps.filter(step => step.page === page);
};

export const getStepById = (id: string): TutorialStepDefinition | undefined => {
  return tutorialSteps.find(step => step.id === id);
};

export const getNextStep = (currentStepId: string): TutorialStepDefinition | undefined => {
  const currentStep = getStepById(currentStepId);
  if (!currentStep) return undefined;
  
  return tutorialSteps.find(step => step.order === currentStep.order + 1);
};

export const getPreviousStep = (currentStepId: string): TutorialStepDefinition | undefined => {
  const currentStep = getStepById(currentStepId);
  if (!currentStep) return undefined;
  
  return tutorialSteps.find(step => step.order === currentStep.order - 1);
};

export const getTotalSteps = (): number => {
  return tutorialSteps.length;
};

export const getEstimatedDuration = (): number => {
  return tutorialSteps.reduce((total, step) => total + step.estimatedTime, 0);
};

export default tutorialSteps;
