// src/lib/microInteractions.ts
export interface MicroInteraction {
  id: string;
  type: 'hover' | 'click' | 'focus' | 'success' | 'error' | 'loading' | 'pulse' | 'shake' | 'bounce' | 'glow';
  element: string;
  duration: number;
  intensity: 'subtle' | 'moderate' | 'strong';
  sound?: string;
  haptic?: boolean;
}

export interface InteractionPreferences {
  enabled: boolean;
  animations: boolean;
  sounds: boolean;
  haptics: boolean;
  intensity: 'subtle' | 'moderate' | 'strong';
  reducedMotion: boolean;
}

export class MicroInteractionManager {
  private static instance: MicroInteractionManager;
  private preferences: InteractionPreferences;
  private activeInteractions: Set<string> = new Set();

  static getInstance(): MicroInteractionManager {
    if (!MicroInteractionManager.instance) {
      MicroInteractionManager.instance = new MicroInteractionManager();
    }
    return MicroInteractionManager.instance;
  }

  constructor() {
    this.preferences = this.loadPreferences();
    this.setupReducedMotionDetection();
  }

  // Load preferences
  private loadPreferences(): InteractionPreferences {
    const saved = localStorage.getItem('boltquest_interaction_preferences');
    if (saved) {
      return JSON.parse(saved);
    }
    return this.getDefaultPreferences();
  }

  // Get default preferences
  private getDefaultPreferences(): InteractionPreferences {
    return {
      enabled: true,
      animations: true,
      sounds: true,
      haptics: false,
      intensity: 'moderate',
      reducedMotion: false,
    };
  }

  // Save preferences
  private savePreferences(): void {
    localStorage.setItem('boltquest_interaction_preferences', JSON.stringify(this.preferences));
  }

  // Setup reduced motion detection
  private setupReducedMotionDetection(): void {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.preferences.reducedMotion = mediaQuery.matches;
      
      mediaQuery.addEventListener('change', (e) => {
        this.preferences.reducedMotion = e.matches;
        this.savePreferences();
      });
    }
  }

  // Trigger micro-interaction
  triggerInteraction(interaction: MicroInteraction): void {
    if (!this.preferences.enabled || this.preferences.reducedMotion) return;

    const element = document.querySelector(interaction.element);
    if (!element) return;

    // Prevent duplicate interactions
    if (this.activeInteractions.has(interaction.id)) return;
    this.activeInteractions.add(interaction.id);

    // Apply animation class
    this.applyAnimationClass(element, interaction);

    // Play sound if enabled
    if (this.preferences.sounds && interaction.sound) {
      this.playSound(interaction.sound);
    }

    // Trigger haptic feedback if enabled
    if (this.preferences.haptics && interaction.haptic) {
      this.triggerHaptic(interaction.intensity);
    }

    // Clean up after animation
    setTimeout(() => {
      this.activeInteractions.delete(interaction.id);
      this.removeAnimationClass(element, interaction);
    }, interaction.duration);
  }

  // Apply animation class
  private applyAnimationClass(element: Element, interaction: MicroInteraction): void {
    const className = this.getAnimationClassName(interaction);
    element.classList.add(className);
  }

  // Remove animation class
  private removeAnimationClass(element: Element, interaction: MicroInteraction): void {
    const className = this.getAnimationClassName(interaction);
    element.classList.remove(className);
  }

  // Get animation class name
  private getAnimationClassName(interaction: MicroInteraction): string {
    const intensity = this.preferences.intensity;
    return `micro-interaction-${interaction.type}-${intensity}`;
  }

  // Play sound
  private playSound(sound: string): void {
    // This would integrate with the audio system
    console.log(`Playing sound: ${sound}`);
  }

  // Trigger haptic feedback
  private triggerHaptic(intensity: string): void {
    if ('vibrate' in navigator) {
      const patterns = {
        subtle: [10],
        moderate: [20],
        strong: [30],
      };
      navigator.vibrate(patterns[intensity as keyof typeof patterns] || [20]);
    }
  }

  // Update preferences
  updatePreferences(preferences: Partial<InteractionPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
    this.savePreferences();
  }

  // Get preferences
  getPreferences(): InteractionPreferences {
    return this.preferences;
  }

  // Predefined interactions
  static readonly INTERACTIONS = {
    BUTTON_HOVER: {
      id: 'button-hover',
      type: 'hover' as const,
      element: '[data-micro-interaction="button-hover"]',
      duration: 200,
      intensity: 'subtle' as const,
    },
    BUTTON_CLICK: {
      id: 'button-click',
      type: 'click' as const,
      element: '[data-micro-interaction="button-click"]',
      duration: 150,
      intensity: 'moderate' as const,
      sound: 'click',
      haptic: true,
    },
    SUCCESS_FEEDBACK: {
      id: 'success-feedback',
      type: 'success' as const,
      element: '[data-micro-interaction="success"]',
      duration: 600,
      intensity: 'moderate' as const,
      sound: 'success',
    },
    ERROR_FEEDBACK: {
      id: 'error-feedback',
      type: 'error' as const,
      element: '[data-micro-interaction="error"]',
      duration: 400,
      intensity: 'strong' as const,
      sound: 'error',
      haptic: true,
    },
    LOADING_SPINNER: {
      id: 'loading-spinner',
      type: 'loading' as const,
      element: '[data-micro-interaction="loading"]',
      duration: 1000,
      intensity: 'subtle' as const,
    },
    PULSE_ATTENTION: {
      id: 'pulse-attention',
      type: 'pulse' as const,
      element: '[data-micro-interaction="pulse"]',
      duration: 800,
      intensity: 'moderate' as const,
    },
    SHAKE_ERROR: {
      id: 'shake-error',
      type: 'shake' as const,
      element: '[data-micro-interaction="shake"]',
      duration: 500,
      intensity: 'strong' as const,
      sound: 'error',
      haptic: true,
    },
    BOUNCE_SUCCESS: {
      id: 'bounce-success',
      type: 'bounce' as const,
      element: '[data-micro-interaction="bounce"]',
      duration: 600,
      intensity: 'moderate' as const,
      sound: 'success',
    },
    GLOW_HIGHLIGHT: {
      id: 'glow-highlight',
      type: 'glow' as const,
      element: '[data-micro-interaction="glow"]',
      duration: 1000,
      intensity: 'subtle' as const,
    },
  };
}

// Export singleton instance
export const microInteractionManager = MicroInteractionManager.getInstance();
