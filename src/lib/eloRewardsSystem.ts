// ELO-Based Rewards System for BoltQuest
// Calculates ELO changes and awards coins based on performance

import { EloSystem } from './eloSystem';
import { addCoins } from './coinSystem';
import { CompetitiveEloSystem, GamePerformanceData, GameOutcome } from './competitiveEloSystem';

export interface EloRewardResult {
  eloChange: number;
  newElo: number;
  previousElo: number;
  totalCoinsEarned: number;
  rewards: EloReward[];
  performance: {
    accuracy: number;
    speed: number;
    questionsAnswered: number;
    difficulty: string;
  };
}

export interface EloReward {
  type: 'elo_gain' | 'elo_loss' | 'performance_bonus' | 'milestone';
  amount: number;
  description: string;
  icon: string;
  color: string;
}

export interface EloPerformanceData {
  accuracy: number;
  questionsAnswered: number;
  timeSpent: number;
  totalTime: number;
  longestCombo: number;
  category: string;
  difficulty: string;
  mode: string;
  score: number;
}

export class EloRewardsSystem {
  private eloSystem: EloSystem;

  constructor() {
    this.eloSystem = new EloSystem();
  }

  // Calculate ELO change and rewards for a completed game
  calculateEloRewards(performanceData: EloPerformanceData): EloRewardResult {
    const { category, mode, accuracy, questionsAnswered, timeSpent, totalTime, longestCombo, difficulty, score } = performanceData;
    
    // Only Classic mode awards ELO
    if (mode !== 'classic') {
      const currentElo = this.eloSystem.getCategoryRating(category);
      return {
        eloChange: 0,
        newElo: currentElo,
        previousElo: currentElo,
        totalCoinsEarned: 0,
        rewards: [{
          type: 'elo_gain',
          amount: 0,
          description: 'ELO only awarded in Classic mode',
          icon: 'ℹ️',
          color: 'text-gray-500'
        }],
        performance: {
          accuracy,
          speed: questionsAnswered > 0 ? timeSpent / questionsAnswered : 0,
          questionsAnswered,
          difficulty
        }
      };
    }
    
    // Get current ELO for the category
    const previousElo = this.eloSystem.getCategoryRating(category);
    
    // Create game performance data for competitive system
    const gamePerformanceData: GamePerformanceData = {
      accuracy,
      questionsAnswered,
      correctAnswers: score,
      difficulty,
      timeSpent,
      totalTime,
      currentElo: previousElo,
      winStreak: 0, // TODO: Get from user data
      lossStreak: 0 // TODO: Get from user data
    };
    
    // Use competitive ELO system to determine outcome and ELO change
    const gameOutcome = CompetitiveEloSystem.determineGameOutcome(gamePerformanceData);
    const eloChange = gameOutcome.eloChange;
    const newElo = previousElo + eloChange;
    
    // Update ELO in the system
    this.eloSystem.setCategoryRating(category, newElo);
    
    // Calculate rewards based on game outcome
    const rewards = this.calculateRewardsFromOutcome(gameOutcome, performanceData);
    
    // Award coins
    const totalCoinsEarned = this.awardCoins(rewards, performanceData);
    
    return {
      eloChange,
      newElo,
      previousElo,
      totalCoinsEarned,
      rewards,
      performance: {
        accuracy,
        speed: questionsAnswered > 0 ? timeSpent / questionsAnswered : 0,
        questionsAnswered,
        difficulty
      }
    };
  }

  // Calculate rewards based on game outcome
  private calculateRewardsFromOutcome(gameOutcome: GameOutcome, performanceData: EloPerformanceData): EloReward[] {
    const { result, eloChange, performanceScore } = gameOutcome;
    const { accuracy, questionsAnswered, difficulty } = performanceData;
    
    const rewards: EloReward[] = [];
    
    // ELO change reward
    if (eloChange > 0) {
      rewards.push({
        type: 'elo_gain',
        amount: eloChange,
        description: `+${eloChange} ELO`,
        icon: '📈',
        color: 'text-green-600'
      });
    } else if (eloChange < 0) {
      rewards.push({
        type: 'elo_loss',
        amount: Math.abs(eloChange),
        description: `${eloChange} ELO`,
        icon: '📉',
        color: 'text-red-600'
      });
    } else {
      rewards.push({
        type: 'elo_draw',
        amount: 0,
        description: 'No ELO change',
        icon: '➖',
        color: 'text-gray-600'
      });
    }
    
    // Performance bonus rewards
    if (performanceScore >= 95) {
      rewards.push({
        type: 'performance_bonus',
        amount: 50,
        description: 'Perfect Performance!',
        icon: '⭐',
        color: 'text-yellow-600'
      });
    } else if (performanceScore >= 85) {
      rewards.push({
        type: 'performance_bonus',
        amount: 25,
        description: 'Excellent Game!',
        icon: '🔥',
        color: 'text-orange-600'
      });
    }
    
    // Volume bonus
    if (questionsAnswered >= 20) {
      rewards.push({
        type: 'volume_bonus',
        amount: 20,
        description: 'High Volume Bonus',
        icon: '📚',
        color: 'text-blue-600'
      });
    } else if (questionsAnswered >= 15) {
      rewards.push({
        type: 'volume_bonus',
        amount: 10,
        description: 'Volume Bonus',
        icon: '📖',
        color: 'text-blue-500'
      });
    }
    
    // Difficulty bonus
    if (difficulty.toLowerCase() === 'hard') {
      rewards.push({
        type: 'difficulty_bonus',
        amount: 15,
        description: 'Hard Mode Bonus',
        icon: '💪',
        color: 'text-purple-600'
      });
    }
    
    return rewards;
  }

  // Calculate ELO change using new volume-based system
  private calculateEloChange(data: EloPerformanceData): number {
    const { accuracy, questionsAnswered, timeSpent, totalTime, difficulty, category, score } = data;

    // Use actual game score as correct answers (this is already the correct count)
    const correctAnswers = score;
    
    // 1. Calculate base ELO from correct answers
    const POINTS_PER_CORRECT = 4.0; // Increased from 2.5 to make LP gains more rewarding
    const baseElo = correctAnswers * POINTS_PER_CORRECT;
    
    // 2. Apply accuracy multiplier
    const accuracyMultiplier = this.calculateAccuracyMultiplier(accuracy);
    const eloWithAccuracy = baseElo * accuracyMultiplier;
    
    // 3. Apply difficulty multiplier
    const difficultyMultiplier = this.getDifficultyMultiplier(difficulty, category);
    const eloWithDifficulty = eloWithAccuracy * difficultyMultiplier;
    
    // 4. Apply rank-based multiplier (lower ranks get bonus)
    const currentElo = this.eloSystem.getCategoryRating(category);
    const rankMultiplier = this.calculateRankMultiplier(currentElo);
    const eloWithRank = eloWithDifficulty * rankMultiplier;
    
    // 5. Apply time modifier
    const timeModifier = this.calculateTimeModifier(timeSpent, totalTime);
    const eloWithTime = eloWithRank * (1 + timeModifier);
    
    // 6. Apply volume bonus for high question counts
    const volumeBonus = this.calculateVolumeBonus(questionsAnswered);
    const finalElo = eloWithTime * (1 + volumeBonus);
    
    // 7. Special bonus for low-rank players with decent performance
    let finalEloWithBonus = finalElo;
    
    // If player is below Gold (4160 ELO) and has decent performance (5+ correct answers), give bonus
    if (currentElo < 4160 && correctAnswers >= 5) {
      const lowRankBonus = Math.max(0, (5 - correctAnswers) * 2); // Up to 10 bonus ELO
      finalEloWithBonus += lowRankBonus;
    }
    
    // 8. Enforce caps (minimum 1 ELO for any positive performance, max +60)
    const cappedElo = Math.min(60, Math.round(finalEloWithBonus));
    return Math.max(1, cappedElo); // Minimum 1 ELO for any positive performance
  }

  private calculateAccuracyMultiplier(accuracy: number): number {
    if (accuracy >= 100) return 1.5;
    if (accuracy >= 90) return 1.3;
    if (accuracy >= 85) return 1.2;
    if (accuracy >= 75) return 1.0;  // Baseline
    if (accuracy >= 65) return 0.9;
    if (accuracy >= 55) return 0.8;   // More forgiving
    if (accuracy >= 45) return 0.7;   // More forgiving
    if (accuracy >= 35) return 0.6;   // More forgiving
    if (accuracy >= 25) return 0.5;   // More forgiving
    if (accuracy >= 15) return 0.3;   // Still get something
    return 0.1; // Even very low accuracy gets something
  }

  private calculateVolumeBonus(questionsAnswered: number): number {
    if (questionsAnswered >= 20) return 0.10; // +10%
    if (questionsAnswered >= 15) return 0.05; // +5%
    return 0; // No bonus for <15 questions
  }

  private calculateRankMultiplier(currentElo: number): number {
    // Only ranks below Gold (4160 ELO) get bonuses
    // The further below Gold, the bigger the bonus
    
    if (currentElo >= 4160) {
      // Gold and above: No multiplier (1.0x baseline)
      return 1.0;
    }
    
    // Below Gold: Calculate bonus based on distance from Gold
    // Gold starts at 4160 ELO
    const distanceFromGold = 4160 - currentElo;
    
    // Every 200 ELO below Gold = +10% bonus
    // Max bonus at Iron (0 ELO) = ~208% bonus (3.08x multiplier)
    const bonusMultiplier = 1.0 + (distanceFromGold / 200) * 0.10;
    
    // Cap maximum bonus at 3.5x (don't want it too crazy)
    return Math.min(3.5, bonusMultiplier);
  }

  private getDifficultyMultiplier(difficulty: string, category: string): number {
    // Get current ELO for this specific category to determine if player needs protection
    const currentElo = this.eloSystem.getCategoryRating(category);
    
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

  private calculateTimeModifier(timeSpent: number, totalTime: number): number {
    const timeRatio = timeSpent / totalTime;
    
    if (timeRatio < 0.6) {
      return 0.05; // Fast: +5% bonus
    } else if (timeRatio > 0.8) {
      return -0.05; // Slow: -5% penalty
    } else {
      return 0; // Average: no modifier
    }
  }

  // Calculate rewards based on ELO change and performance
  private calculateRewards(eloChange: number, data: EloPerformanceData): EloReward[] {
    const rewards: EloReward[] = [];
    
    // ELO-based rewards
    if (eloChange >= 50) {
      rewards.push({
        type: 'elo_gain',
        amount: 100,
        description: 'ELO Master!',
        icon: '🏆',
        color: 'text-yellow-600'
      });
    } else if (eloChange >= 25) {
      rewards.push({
        type: 'elo_gain',
        amount: 50,
        description: 'ELO Rising!',
        icon: '⭐',
        color: 'text-blue-600'
      });
    } else if (eloChange >= 10) {
      rewards.push({
        type: 'elo_gain',
        amount: 25,
        description: 'ELO Gaining!',
        icon: '📈',
        color: 'text-green-600'
      });
    } else if (eloChange > 0) {
      rewards.push({
        type: 'elo_gain',
        amount: 10,
        description: 'ELO Positive!',
        icon: '✅',
        color: 'text-green-500'
      });
    } else if (eloChange === 0) {
      rewards.push({
        type: 'elo_gain',
        amount: 5,
        description: 'ELO Stable',
        icon: '➖',
        color: 'text-gray-500'
      });
    } else {
      rewards.push({
        type: 'elo_loss',
        amount: 2,
        description: 'ELO Learning',
        icon: '📉',
        color: 'text-orange-500'
      });
    }
    
    // Performance bonuses
    if (data.accuracy === 100) {
      rewards.push({
        type: 'performance_bonus',
        amount: 50,
        description: 'Perfect Game!',
        icon: '🎯',
        color: 'text-purple-600'
      });
    }
    
    const avgTimePerQuestion = data.questionsAnswered > 0 ? data.timeSpent / data.questionsAnswered : 0;
    if (avgTimePerQuestion <= 2) {
      rewards.push({
        type: 'performance_bonus',
        amount: 25,
        description: 'Speed Demon!',
        icon: '⚡',
        color: 'text-yellow-500'
      });
    }
    
    if (data.longestCombo >= 10) {
      rewards.push({
        type: 'performance_bonus',
        amount: 25,
        description: 'Combo Master!',
        icon: '🔥',
        color: 'text-red-500'
      });
    }
    
    if (data.questionsAnswered >= 15) {
      rewards.push({
        type: 'performance_bonus',
        amount: 15,
        description: 'Question Master!',
        icon: '🧠',
        color: 'text-indigo-600'
      });
    }
    
    return rewards;
  }

  // Award coins for all rewards
  private awardCoins(rewards: EloReward[], data: EloPerformanceData): number {
    let totalCoins = 0;
    
    rewards.forEach(reward => {
      const success = addCoins(
        reward.amount,
        'game',
        reward.description,
        {
          gameId: `elo_reward_${Date.now()}`,
          eloChange: reward.type.includes('elo') ? 'elo_based' : 'performance_bonus'
        }
      );
      
      if (success) {
        totalCoins += reward.amount;
      }
    });
    
    return totalCoins;
  }

  // Get ELO change display text
  getEloChangeText(eloChange: number): string {
    if (eloChange > 0) {
      return `+${eloChange}`;
    } else if (eloChange < 0) {
      return `${eloChange}`;
    } else {
      return '0';
    }
  }

  // Get ELO change color
  getEloChangeColor(eloChange: number): string {
    if (eloChange > 0) {
      return 'text-green-600';
    } else if (eloChange < 0) {
      return 'text-red-600';
    } else {
      return 'text-gray-600';
    }
  }

  // Get ELO change icon
  getEloChangeIcon(eloChange: number): string {
    if (eloChange >= 25) {
      return '🚀';
    } else if (eloChange >= 10) {
      return '📈';
    } else if (eloChange > 0) {
      return '⬆️';
    } else if (eloChange < 0) {
      return '⬇️';
    } else {
      return '➖';
    }
  }
}

// Export singleton instance
export const eloRewardsSystem = new EloRewardsSystem();
