// Competitive ELO System for BoltQuest
// Implements performance-based win/loss with ELO gains and losses

export interface GameOutcome {
  result: 'win' | 'loss' | 'draw';
  performanceScore: number; // 0-100
  eloChange: number; // Can be negative
  lpChange: number; // 1:1 with ELO
  breakdown: {
    baseChange: number;
    performanceModifier: number;
    difficultyModifier: number;
    rankModifier: number;
    streakModifier: number;
  };
}

export interface GamePerformanceData {
  accuracy: number;
  questionsAnswered: number;
  correctAnswers: number;
  difficulty: string;
  timeSpent: number;
  totalTime: number;
  currentElo: number;
  winStreak: number;
  lossStreak: number;
}

export class CompetitiveEloSystem {
  
  /**
   * Determines game outcome based on performance
   * Uses a combination of accuracy and questions answered
   */
  static determineGameOutcome(data: GamePerformanceData): GameOutcome {
    const { accuracy, questionsAnswered, correctAnswers, difficulty, timeSpent, totalTime, currentElo, winStreak, lossStreak } = data;
    
    // Calculate performance score (0-100)
    const performanceScore = this.calculatePerformanceScore(accuracy, questionsAnswered, correctAnswers);
    
    // Determine win/loss based on performance score
    let result: 'win' | 'loss' | 'draw';
    if (performanceScore >= 70) {
      result = 'win';
    } else if (performanceScore >= 50) {
      result = 'draw';
    } else {
      result = 'loss';
    }
    
    // Calculate ELO change
    const eloChange = this.calculateEloChange(result, performanceScore, data);
    
    return {
      result,
      performanceScore,
      eloChange,
      lpChange: eloChange, // 1:1 conversion
      breakdown: {
        baseChange: this.getBaseEloChange(result),
        performanceModifier: this.calculatePerformanceModifier(performanceScore),
        difficultyModifier: this.getDifficultyModifier(difficulty, currentElo),
        rankModifier: this.getRankModifier(currentElo),
        streakModifier: this.getStreakModifier(result, winStreak, lossStreak)
      }
    };
  }
  
  /**
   * Calculate performance score (0-100) based on accuracy and volume
   */
  private static calculatePerformanceScore(accuracy: number, questionsAnswered: number, correctAnswers: number): number {
    // Base score from accuracy (0-60 points)
    const accuracyScore = (accuracy / 100) * 60;
    
    // Volume bonus (0-40 points)
    let volumeScore = 0;
    if (questionsAnswered >= 20) volumeScore = 40;
    else if (questionsAnswered >= 15) volumeScore = 30;
    else if (questionsAnswered >= 10) volumeScore = 20;
    else if (questionsAnswered >= 5) volumeScore = 10;
    
    return Math.min(100, accuracyScore + volumeScore);
  }
  
  /**
   * Calculate ELO change based on game result and performance
   */
  private static calculateEloChange(result: string, performanceScore: number, data: GamePerformanceData): number {
    const baseChange = this.getBaseEloChange(result);
    const performanceModifier = this.calculatePerformanceModifier(performanceScore);
    const difficultyModifier = this.getDifficultyModifier(data.difficulty, data.currentElo);
    const rankModifier = this.getRankModifier(data.currentElo);
    const streakModifier = this.getStreakModifier(result, data.winStreak, data.lossStreak);
    
    const finalChange = baseChange * performanceModifier * difficultyModifier * rankModifier * streakModifier;
    
    // Cap ELO changes
    const maxGain = 60;
    const maxLoss = 30;
    
    if (result === 'win' || result === 'draw') {
      return Math.min(maxGain, Math.round(finalChange));
    } else {
      return Math.max(-maxLoss, Math.round(finalChange));
    }
  }
  
  /**
   * Get base ELO change based on game result
   */
  private static getBaseEloChange(result: string): number {
    switch (result) {
      case 'win': return 25;
      case 'draw': return 0;
      case 'loss': return -25;
      default: return 0;
    }
  }
  
  /**
   * Calculate performance modifier (0.5x to 2.0x)
   */
  private static calculatePerformanceModifier(performanceScore: number): number {
    if (performanceScore >= 95) return 2.0; // Perfect game
    if (performanceScore >= 85) return 1.5; // Excellent game
    if (performanceScore >= 75) return 1.2; // Great game
    if (performanceScore >= 65) return 1.0; // Good game
    if (performanceScore >= 55) return 0.8; // Average game
    if (performanceScore >= 45) return 0.6; // Poor game
    if (performanceScore >= 35) return 0.4; // Bad game
    if (performanceScore >= 25) return 0.2; // Terrible game
    return 0.1; // Minimal performance
  }
  
  /**
   * Get difficulty modifier
   */
  private static getDifficultyModifier(difficulty: string, currentElo: number): number {
    // Iron/Bronze players (below 2000 ELO) get difficulty-based protection
    const isLowRank = currentElo < 2000;
    
    switch (difficulty.toLowerCase()) {
      case 'easy': 
        return isLowRank ? 1.0 : 0.85;  // No penalty for low ranks, -15% for higher ranks
      case 'medium': 
        return isLowRank ? 0.9 : 1.0;    // -10% for low ranks, no change for higher ranks
      case 'hard': 
        return isLowRank ? 0.8 : 1.3;    // -20% for low ranks, +30% for higher ranks
      default: 
        return 1.0;
    }
  }
  
  /**
   * Get rank-based modifier (lower ranks get bonuses)
   */
  private static getRankModifier(currentElo: number): number {
    // Only ranks below Gold (4160 ELO) get bonuses
    if (currentElo >= 4160) {
      return 1.0; // Gold and above: No multiplier
    }
    
    // Below Gold: Calculate bonus based on distance from Gold
    const distanceFromGold = 4160 - currentElo;
    const bonusMultiplier = 1.0 + (distanceFromGold / 200) * 0.10;
    
    // Cap maximum bonus at 3.5x
    return Math.min(3.5, bonusMultiplier);
  }
  
  /**
   * Get streak modifier
   */
  private static getStreakModifier(result: string, winStreak: number, lossStreak: number): number {
    if (result === 'win') {
      // Win streak bonuses
      if (winStreak >= 10) return 1.5; // +50% ELO
      if (winStreak >= 7) return 1.3;  // +30% ELO
      if (winStreak >= 5) return 1.2;  // +20% ELO
      if (winStreak >= 3) return 1.1;  // +10% ELO
      return 1.0;
    } else if (result === 'loss') {
      // Loss streak protection
      if (lossStreak >= 5) return 0.7; // -30% ELO loss
      if (lossStreak >= 3) return 0.8;  // -20% ELO loss
      return 1.0;
    } else {
      // Draw - no streak modifier
      return 1.0;
    }
  }
  
  /**
   * Get performance description based on score
   */
  static getPerformanceDescription(performanceScore: number): string {
    if (performanceScore >= 95) return "Perfect Performance!";
    if (performanceScore >= 85) return "Excellent Game!";
    if (performanceScore >= 75) return "Great Performance!";
    if (performanceScore >= 65) return "Good Game!";
    if (performanceScore >= 55) return "Decent Performance";
    if (performanceScore >= 45) return "Room for Improvement";
    if (performanceScore >= 35) return "Keep Practicing";
    if (performanceScore >= 25) return "Tough Game";
    return "Better Luck Next Time";
  }
  
  /**
   * Get result emoji and color
   */
  static getResultDisplay(result: string): { emoji: string; color: string; text: string } {
    switch (result) {
      case 'win':
        return { emoji: '🎉', color: 'text-green-600', text: 'Victory!' };
      case 'draw':
        return { emoji: '🤝', color: 'text-yellow-600', text: 'Draw' };
      case 'loss':
        return { emoji: '💪', color: 'text-red-600', text: 'Defeat' };
      default:
        return { emoji: '❓', color: 'text-gray-600', text: 'Unknown' };
    }
  }
}
