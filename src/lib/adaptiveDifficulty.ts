// Adaptive Difficulty System for BoltQuest
// Based on Elevate's psychological principles for optimal flow state

export interface AdaptiveDifficulty {
  userSkillLevel: number; // 0.0 to 1.0 scale
  currentChallenge: number; // Current difficulty level
  performanceHistory: number[]; // Last 10 accuracy scores
  optimalFlowZone: { min: number; max: number }; // Target accuracy range
  lastAdjustment: Date;
  adjustmentCount: number;
  confidence: number; // How confident we are in the current level
}

export interface DifficultyAdjustment {
  newDifficulty: number;
  adjustmentReason: 'increase' | 'decrease' | 'maintain';
  confidence: number;
  performanceTrend: 'improving' | 'declining' | 'stable';
}

export interface PerformanceMetrics {
  accuracy: number;
  responseTime: number;
  streak: number;
  questionsAnswered: number;
  timestamp: Date;
}

export interface FlowState {
  isInFlow: boolean;
  flowScore: number; // 0-100
  optimalZone: boolean;
  recommendations: string[];
}

// Adaptive Difficulty Manager Class
export class AdaptiveDifficultyManager {
  private userProfile: AdaptiveDifficulty;
  private readonly PERFORMANCE_WINDOW = 10; // Last 10 questions
  private readonly FLOW_ZONE_MIN = 0.4; // Minimum accuracy for flow
  private readonly FLOW_ZONE_MAX = 0.8; // Maximum accuracy for flow
  private readonly ADJUSTMENT_STEP = 0.1; // How much to adjust difficulty
  private readonly MIN_CONFIDENCE = 0.7; // Minimum confidence for adjustments

  constructor(initialSkillLevel: number = 0.5) {
    this.userProfile = {
      userSkillLevel: initialSkillLevel,
      currentChallenge: initialSkillLevel,
      performanceHistory: [],
      optimalFlowZone: { min: this.FLOW_ZONE_MIN, max: this.FLOW_ZONE_MAX },
      lastAdjustment: new Date(),
      adjustmentCount: 0,
      confidence: 0.5
    };
  }

  // Update performance after each question
  updatePerformance(metrics: PerformanceMetrics): DifficultyAdjustment {
    // Add to performance history
    this.userProfile.performanceHistory.push(metrics.accuracy);
    
    // Keep only last PERFORMANCE_WINDOW results
    if (this.userProfile.performanceHistory.length > this.PERFORMANCE_WINDOW) {
      this.userProfile.performanceHistory.shift();
    }

    // Calculate adjustment
    const adjustment = this.calculateAdjustment(metrics);
    
    // Update user profile
    this.userProfile.currentChallenge = adjustment.newDifficulty;
    this.userProfile.lastAdjustment = new Date();
    this.userProfile.adjustmentCount++;
    this.userProfile.confidence = adjustment.confidence;

    return adjustment;
  }

  // Calculate difficulty adjustment based on performance
  private calculateAdjustment(metrics: PerformanceMetrics): DifficultyAdjustment {
    const recentAccuracy = this.getRecentAccuracy();
    const performanceTrend = this.getPerformanceTrend();
    const confidence = this.calculateConfidence();

    // Determine if we need adjustment
    if (recentAccuracy > this.FLOW_ZONE_MAX && confidence > this.MIN_CONFIDENCE) {
      // Too easy - increase difficulty
      return {
        newDifficulty: Math.min(1.0, this.userProfile.currentChallenge + this.ADJUSTMENT_STEP),
        adjustmentReason: 'increase',
        confidence,
        performanceTrend
      };
    } else if (recentAccuracy < this.FLOW_ZONE_MIN && confidence > this.MIN_CONFIDENCE) {
      // Too hard - decrease difficulty
      return {
        newDifficulty: Math.max(0.0, this.userProfile.currentChallenge - this.ADJUSTMENT_STEP),
        adjustmentReason: 'decrease',
        confidence,
        performanceTrend
      };
    } else {
      // Maintain current difficulty
      return {
        newDifficulty: this.userProfile.currentChallenge,
        adjustmentReason: 'maintain',
        confidence,
        performanceTrend
      };
    }
  }

  // Get recent accuracy average
  private getRecentAccuracy(): number {
    if (this.userProfile.performanceHistory.length === 0) return 0.5;
    
    const sum = this.userProfile.performanceHistory.reduce((acc, val) => acc + val, 0);
    return sum / this.userProfile.performanceHistory.length;
  }

  // Analyze performance trend
  private getPerformanceTrend(): 'improving' | 'declining' | 'stable' {
    if (this.userProfile.performanceHistory.length < 3) return 'stable';
    
    const recent = this.userProfile.performanceHistory.slice(-3);
    const older = this.userProfile.performanceHistory.slice(-6, -3);
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((acc, val) => acc + val, 0) / recent.length;
    const olderAvg = older.reduce((acc, val) => acc + val, 0) / older.length;
    
    const difference = recentAvg - olderAvg;
    
    if (difference > 0.1) return 'improving';
    if (difference < -0.1) return 'declining';
    return 'stable';
  }

  // Calculate confidence in current difficulty level
  private calculateConfidence(): number {
    if (this.userProfile.performanceHistory.length < 3) return 0.3;
    
    const variance = this.calculateVariance(this.userProfile.performanceHistory);
    const consistency = Math.max(0, 1 - variance); // Lower variance = higher consistency
    const sampleSize = Math.min(1, this.userProfile.performanceHistory.length / this.PERFORMANCE_WINDOW);
    
    return (consistency * 0.7) + (sampleSize * 0.3);
  }

  // Calculate variance in performance
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    
    return variance;
  }

  // Check if user is in optimal flow state
  getFlowState(): FlowState {
    const recentAccuracy = this.getRecentAccuracy();
    const isInFlow = recentAccuracy >= this.FLOW_ZONE_MIN && recentAccuracy <= this.FLOW_ZONE_MAX;
    const flowScore = this.calculateFlowScore(recentAccuracy);
    const optimalZone = isInFlow;

    let recommendations: string[] = [];
    if (!isInFlow) {
      if (recentAccuracy < this.FLOW_ZONE_MIN) {
        recommendations.push('Consider easier questions to build confidence');
        recommendations.push('Take breaks between sessions');
      } else if (recentAccuracy > this.FLOW_ZONE_MAX) {
        recommendations.push('Try more challenging questions');
        recommendations.push('Explore advanced topics');
      }
    } else {
      recommendations.push('Great! You\'re in the optimal learning zone');
      recommendations.push('Keep up the momentum');
    }

    return {
      isInFlow,
      flowScore,
      optimalZone,
      recommendations
    };
  }

  // Calculate flow score (0-100)
  private calculateFlowScore(accuracy: number): number {
    const distanceFromOptimal = Math.abs(accuracy - 0.6); // 0.6 is optimal
    const maxDistance = 0.4; // Maximum possible distance
    const normalizedDistance = Math.min(distanceFromOptimal / maxDistance, 1);
    
    return Math.round((1 - normalizedDistance) * 100);
  }

  // Get current difficulty level
  getCurrentDifficulty(): number {
    return this.userProfile.currentChallenge;
  }

  // Get user profile for analytics
  getUserProfile(): AdaptiveDifficulty {
    return { ...this.userProfile };
  }

  // Reset adaptive system (for new users or major changes)
  reset(newSkillLevel?: number): void {
    this.userProfile = {
      userSkillLevel: newSkillLevel ?? 0.5,
      currentChallenge: newSkillLevel ?? 0.5,
      performanceHistory: [],
      optimalFlowZone: { min: this.FLOW_ZONE_MIN, max: this.FLOW_ZONE_MAX },
      lastAdjustment: new Date(),
      adjustmentCount: 0,
      confidence: 0.5
    };
  }

  // Get difficulty recommendations for UI
  getDifficultyRecommendations(): {
    currentLevel: string;
    nextLevel: string;
    progress: number;
    message: string;
  } {
    const difficulty = this.userProfile.currentChallenge;
    const flowState = this.getFlowState();
    
    let currentLevel: string;
    let nextLevel: string;
    let progress: number;
    let message: string;

    if (difficulty < 0.3) {
      currentLevel = 'Beginner';
      nextLevel = 'Easy';
      progress = (difficulty / 0.3) * 100;
    } else if (difficulty < 0.6) {
      currentLevel = 'Easy';
      nextLevel = 'Medium';
      progress = ((difficulty - 0.3) / 0.3) * 100;
    } else if (difficulty < 0.8) {
      currentLevel = 'Medium';
      nextLevel = 'Hard';
      progress = ((difficulty - 0.6) / 0.2) * 100;
    } else {
      currentLevel = 'Hard';
      nextLevel = 'Expert';
      progress = ((difficulty - 0.8) / 0.2) * 100;
    }

    if (flowState.isInFlow) {
      message = 'Perfect difficulty! You\'re learning optimally.';
    } else if (this.userProfile.performanceHistory.length > 0) {
      const recentAccuracy = this.getRecentAccuracy();
      if (recentAccuracy < this.FLOW_ZONE_MIN) {
        message = 'Questions might be too challenging. Consider easier content.';
      } else {
        message = 'You\'re doing great! Ready for more challenging questions?';
      }
    } else {
      message = 'Let\'s find your optimal learning level!';
    }

    return {
      currentLevel,
      nextLevel,
      progress: Math.round(progress),
      message
    };
  }
}

// Utility functions for difficulty management
export const DifficultyUtils = {
  // Convert difficulty number to human-readable level
  getDifficultyLevel(difficulty: number): string {
    if (difficulty < 0.25) return 'Beginner';
    if (difficulty < 0.5) return 'Easy';
    if (difficulty < 0.75) return 'Medium';
    if (difficulty < 0.9) return 'Hard';
    return 'Expert';
  },

  // Get difficulty color for UI
  getDifficultyColor(difficulty: number): string {
    if (difficulty < 0.25) return '#22c55e'; // Green
    if (difficulty < 0.5) return '#84cc16'; // Light green
    if (difficulty < 0.75) return '#eab308'; // Yellow
    if (difficulty < 0.9) return '#f97316'; // Orange
    return '#ef4444'; // Red
  },

  // Calculate XP multiplier based on difficulty
  getXPMultiplier(difficulty: number): number {
    return 1 + (difficulty * 0.5); // 1.0x to 1.5x multiplier
  },

  // Calculate coin multiplier based on difficulty
  getCoinMultiplier(difficulty: number): number {
    return 1 + (difficulty * 0.3); // 1.0x to 1.3x multiplier
  }
};

export default AdaptiveDifficultyManager;

