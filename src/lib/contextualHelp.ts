// src/lib/contextualHelp.ts
import { getUserProfile } from './userStorage';

export interface HelpTooltip {
  id: string;
  element: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  trigger: 'hover' | 'click' | 'focus' | 'auto';
  priority: 'low' | 'medium' | 'high';
  category: 'navigation' | 'gameplay' | 'features' | 'tips' | 'troubleshooting';
  conditions?: {
    userLevel?: number;
    gamesPlayed?: number;
    achievements?: string[];
    page?: string;
    feature?: string;
  };
  seen?: boolean;
  dismissed?: boolean;
}

export interface HelpPreferences {
  enabled: boolean;
  showTooltips: boolean;
  showOnboarding: boolean;
  showTips: boolean;
  showAdvancedTips: boolean;
  autoShowHelp: boolean;
  helpLevel: 'beginner' | 'intermediate' | 'advanced';
}

export class ContextualHelpManager {
  private static instance: ContextualHelpManager;
  private tooltips: HelpTooltip[] = [];
  private preferences: HelpPreferences;
  private activeTooltips: Set<string> = new Set();

  static getInstance(): ContextualHelpManager {
    if (!ContextualHelpManager.instance) {
      ContextualHelpManager.instance = new ContextualHelpManager();
    }
    return ContextualHelpManager.instance;
  }

  constructor() {
    this.preferences = this.loadPreferences();
    this.tooltips = this.loadTooltips();
    this.setupAutoHelp();
  }

  // Load preferences
  private loadPreferences(): HelpPreferences {
    const userProfile = getUserProfile();
    return userProfile.helpPreferences || this.getDefaultPreferences();
  }

  // Get default preferences
  private getDefaultPreferences(): HelpPreferences {
    return {
      enabled: true,
      showTooltips: true,
      showOnboarding: true,
      showTips: true,
      showAdvancedTips: false,
      autoShowHelp: true,
      helpLevel: 'beginner',
    };
  }

  // Load tooltips
  private loadTooltips(): HelpTooltip[] {
    const saved = localStorage.getItem('boltquest_help_tooltips');
    if (saved) {
      return JSON.parse(saved);
    }
    return this.getDefaultTooltips();
  }

  // Save tooltips
  private saveTooltips(): void {
    localStorage.setItem('boltquest_help_tooltips', JSON.stringify(this.tooltips));
  }

  // Get default tooltips
  private getDefaultTooltips(): HelpTooltip[] {
    return [
      {
        id: 'dashboard-quick-play',
        element: '[data-tutorial="start-tutorial"]',
        title: 'Quick Start',
        content: 'Click here to start playing immediately with smart defaults!',
        position: 'bottom',
        trigger: 'hover',
        priority: 'high',
        category: 'navigation',
        conditions: { page: 'dashboard' },
      },
      {
        id: 'play-categories',
        element: '.category-selection',
        title: 'Choose Your Focus',
        content: 'Select up to 3 categories to focus your learning. Each category has different buzzwords and concepts.',
        position: 'top',
        trigger: 'hover',
        priority: 'medium',
        category: 'gameplay',
        conditions: { page: 'play' },
      },
      {
        id: 'game-timer',
        element: '.timer-display',
        title: 'Time Management',
        content: 'Watch the timer! Correct answers add time, wrong answers remove time. Skip questions you don\'t know.',
        position: 'bottom',
        trigger: 'hover',
        priority: 'high',
        category: 'gameplay',
        conditions: { page: 'game' },
      },
      {
        id: 'game-skip',
        element: '.skip-button',
        title: 'Skip Strategy',
        content: 'Use the skip button wisely! Skipping costs time but prevents wrong answers from reducing your score.',
        position: 'top',
        trigger: 'hover',
        priority: 'medium',
        category: 'tips',
        conditions: { page: 'game', gamesPlayed: 3 },
      },
      {
        id: 'achievements-progress',
        element: '.achievement-card',
        title: 'Achievement Progress',
        content: 'Track your progress towards unlocking new achievements. Each achievement has specific requirements.',
        position: 'right',
        trigger: 'hover',
        priority: 'low',
        category: 'features',
        conditions: { page: 'achievements' },
      },
      {
        id: 'daily-tasks-streak',
        element: '.streak-display',
        title: 'Daily Streak',
        content: 'Complete daily tasks to maintain your streak! Longer streaks give better rewards.',
        position: 'bottom',
        trigger: 'hover',
        priority: 'medium',
        category: 'features',
        conditions: { page: 'daily-tasks' },
      },
      {
        id: 'level-progress',
        element: '.level-display',
        title: 'Level System',
        content: 'Gain XP by playing games and completing tasks. Higher levels unlock new features and rewards.',
        position: 'bottom',
        trigger: 'hover',
        priority: 'medium',
        category: 'features',
        conditions: { userLevel: 5 },
      },
      {
        id: 'smart-widgets',
        element: '.smart-widget',
        title: 'Smart Recommendations',
        content: 'These widgets adapt to your playing style and provide personalized suggestions.',
        position: 'top',
        trigger: 'hover',
        priority: 'low',
        category: 'features',
        conditions: { page: 'dashboard', gamesPlayed: 5 },
      },
      {
        id: 'pause-system',
        element: '.pause-manager',
        title: 'Smart Pause',
        content: 'The game automatically pauses when you switch tabs or become inactive. Click to resume anytime.',
        position: 'left',
        trigger: 'hover',
        priority: 'medium',
        category: 'features',
        conditions: { page: 'game' },
      },
      {
        id: 'notifications',
        element: '.notification-center',
        title: 'Smart Notifications',
        content: 'Get notified about achievements, streaks, and personalized recommendations.',
        position: 'bottom',
        trigger: 'hover',
        priority: 'low',
        category: 'features',
        conditions: { page: 'dashboard' },
      },
    ];
  }

  // Setup auto help
  private setupAutoHelp(): void {
    if (!this.preferences.autoShowHelp) return;

    // Show contextual help based on user behavior
    this.checkForContextualHelp();
  }

  // Check for contextual help
  private checkForContextualHelp(): void {
    const userProfile = getUserProfile();
    const currentPage = window.location.pathname;

    // Find relevant tooltips for current context
    const relevantTooltips = this.tooltips.filter(tooltip => {
      if (!this.preferences.enabled || tooltip.dismissed) return false;
      
      // Check conditions
      if (tooltip.conditions) {
        if (tooltip.conditions.page && !currentPage.includes(tooltip.conditions.page)) return false;
        if (tooltip.conditions.userLevel && (userProfile.level || 1) < tooltip.conditions.userLevel) return false;
        if (tooltip.conditions.gamesPlayed && (userProfile.statistics?.totalGamesPlayed || 0) < tooltip.conditions.gamesPlayed) return false;
      }

      // Check help level
      if (tooltip.category === 'tips' && !this.preferences.showTips) return false;
      if (tooltip.category === 'features' && !this.preferences.showAdvancedTips) return false;

      return true;
    });

    // Show highest priority tooltip
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const sortedTooltips = relevantTooltips.sort((a, b) => 
      priorityOrder[b.priority] - priorityOrder[a.priority]
    );

    if (sortedTooltips.length > 0) {
      this.showTooltip(sortedTooltips[0]);
    }
  }

  // Show tooltip
  showTooltip(tooltip: HelpTooltip): void {
    if (!this.preferences.showTooltips) return;

    const element = document.querySelector(tooltip.element);
    if (!element) return;

    // Create tooltip element
    const tooltipElement = this.createTooltipElement(tooltip);
    
    // Position tooltip
    this.positionTooltip(tooltipElement, element, tooltip.position);
    
    // Add to DOM
    document.body.appendChild(tooltipElement);
    
    // Mark as seen
    this.markTooltipAsSeen(tooltip.id);
    
    // Auto-hide after delay
    setTimeout(() => {
      this.hideTooltip(tooltipElement);
    }, 5000);
  }

  // Create tooltip element
  private createTooltipElement(tooltip: HelpTooltip): HTMLElement {
    const tooltipElement = document.createElement('div');
    tooltipElement.className = 'contextual-help-tooltip';
    tooltipElement.innerHTML = `
      <div class="tooltip-header">
        <h4 class="tooltip-title">${tooltip.title}</h4>
        <button class="tooltip-close" data-tooltip-id="${tooltip.id}">×</button>
      </div>
      <div class="tooltip-content">
        <p>${tooltip.content}</p>
      </div>
      <div class="tooltip-footer">
        <button class="tooltip-dismiss" data-tooltip-id="${tooltip.id}">Don't show again</button>
      </div>
    `;

    // Add event listeners
    tooltipElement.querySelector('.tooltip-close')?.addEventListener('click', () => {
      this.hideTooltip(tooltipElement);
    });

    tooltipElement.querySelector('.tooltip-dismiss')?.addEventListener('click', () => {
      this.dismissTooltip(tooltip.id);
      this.hideTooltip(tooltipElement);
    });

    return tooltipElement;
  }

  // Position tooltip
  private positionTooltip(tooltipElement: HTMLElement, targetElement: Element, position: string): void {
    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();
    
    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = targetRect.top - tooltipRect.height - 10;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + 10;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.left - tooltipRect.width - 10;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.right + 10;
        break;
    }

    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 0) left = 10;
    if (left + tooltipRect.width > viewportWidth) left = viewportWidth - tooltipRect.width - 10;
    if (top < 0) top = 10;
    if (top + tooltipRect.height > viewportHeight) top = viewportHeight - tooltipRect.height - 10;

    tooltipElement.style.position = 'fixed';
    tooltipElement.style.top = `${top}px`;
    tooltipElement.style.left = `${left}px`;
    tooltipElement.style.zIndex = '9999';
  }

  // Hide tooltip
  private hideTooltip(tooltipElement: HTMLElement): void {
    tooltipElement.style.opacity = '0';
    tooltipElement.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      if (tooltipElement.parentNode) {
        tooltipElement.parentNode.removeChild(tooltipElement);
      }
    }, 200);
  }

  // Mark tooltip as seen
  private markTooltipAsSeen(tooltipId: string): void {
    const tooltip = this.tooltips.find(t => t.id === tooltipId);
    if (tooltip) {
      tooltip.seen = true;
      this.saveTooltips();
    }
  }

  // Dismiss tooltip
  private dismissTooltip(tooltipId: string): void {
    const tooltip = this.tooltips.find(t => t.id === tooltipId);
    if (tooltip) {
      tooltip.dismissed = true;
      this.saveTooltips();
    }
  }

  // Get tooltips for current context
  getContextualTooltips(): HelpTooltip[] {
    const currentPage = window.location.pathname;
    return this.tooltips.filter(tooltip => {
      if (!this.preferences.enabled || tooltip.dismissed) return false;
      
      if (tooltip.conditions?.page && !currentPage.includes(tooltip.conditions.page)) return false;
      
      return true;
    });
  }

  // Update preferences
  updatePreferences(preferences: Partial<HelpPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
    
    // Save to user profile
    const userProfile = getUserProfile();
    userProfile.helpPreferences = this.preferences;
    // Save user profile (this would need to be implemented)
  }

  // Get preferences
  getPreferences(): HelpPreferences {
    return this.preferences;
  }

  // Reset all tooltips
  resetTooltips(): void {
    this.tooltips.forEach(tooltip => {
      tooltip.seen = false;
      tooltip.dismissed = false;
    });
    this.saveTooltips();
  }

  // Add custom tooltip
  addTooltip(tooltip: HelpTooltip): void {
    this.tooltips.push(tooltip);
    this.saveTooltips();
  }

  // Remove tooltip
  removeTooltip(tooltipId: string): void {
    this.tooltips = this.tooltips.filter(t => t.id !== tooltipId);
    this.saveTooltips();
  }

  // Get help content by key
  getHelpContent(helpKey: string): { title: string; content: string } | null {
    const tooltip = this.tooltips.find(t => t.id === helpKey);
    if (tooltip) {
      return {
        title: tooltip.title,
        content: tooltip.content
      };
    }
    
    // Return default help content for common keys
    const defaultHelp: Record<string, { title: string; content: string }> = {
      'dashboard-welcome': {
        title: 'Welcome to BoltQuest',
        content: 'This is your dashboard where you can see your progress, start games, and access all features.'
      },
      'dashboard-progress': {
        title: 'Your Progress',
        content: 'Track your level, XP, achievements, and daily streak here.'
      },
      'dashboard-level': {
        title: 'Level System',
        content: 'Gain XP by playing games and completing daily tasks. Higher levels unlock new features!'
      },
      'dashboard-coins': {
        title: 'Coins',
        content: 'Earn coins by playing games and completing challenges. Use them in the shop!'
      },
      'play-welcome': {
        title: 'Game Setup',
        content: 'Choose your categories, difficulty, and game mode. Start with Quick Play for a fast game!'
      },
      'game-progress': {
        title: 'Game Progress',
        content: 'Track your score, combo, time remaining, and accuracy during the game.'
      }
    };
    
    return defaultHelp[helpKey] || null;
  }

  // Dismiss help permanently
  dismissHelp(helpKey: string): void {
    const tooltip = this.tooltips.find(t => t.id === helpKey);
    if (tooltip) {
      tooltip.dismissed = true;
      this.saveTooltips();
    }
  }
}

// Export singleton instance
export const contextualHelpManager = ContextualHelpManager.getInstance();
