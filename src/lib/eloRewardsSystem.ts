// ELO-Based Rewards System for BoltQuest
// Calculates ELO changes and awards coins based on performance

import { EloSystem } from './eloSystem';
import { addCoins } from './coinSystem';

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
}

export class EloRewardsSystem {
  private eloSystem: EloSystem;

  constructor() {
    this.eloSystem = new EloSystem();
  }

  // Calculate ELO change and rewards for a completed game
  calculateEloRewards(performanceData: EloPerformanceData): EloRewardResult {
    const { category, accuracy, questionsAnswered, timeSpent, totalTime, longestCombo, difficulty } = performanceData;
    
    // Get current ELO for the category
    const previousElo = this.eloSystem.getCategoryRating(category);
    
    // Calculate performance score (0-100)
    const performanceScore = this.calculatePerformanceScore(performanceData);
    
    // Calculate ELO change
    const eloCalculation = this.eloSystem.calculateEloChange(
      previousElo,
      performanceScore,
      category
    );
    
    const eloChange = eloCalculation.newRating - previousElo;
    const newElo = eloCalculation.newRating;
    
    // Calculate rewards
    const rewards = this.calculateRewards(eloChange, performanceData);
    
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

  // Calculate overall performance score (0-100)
  private calculatePerformanceScore(data: EloPerformanceData): number {
    const { accuracy, questionsAnswered, timeSpent, totalTime, longestCombo } = data;
    
    // Base score from accuracy (0-80 points)
    const accuracyScore = accuracy;
    
    // Speed bonus (0-10 points)
    const avgTimePerQuestion = questionsAnswered > 0 ? timeSpent / questionsAnswered : 0;
    const speedScore = Math.max(0, 10 - (avgTimePerQuestion / 2)); // Faster = higher score
    
    // Questions answered bonus (0-10 points)
    const questionsScore = Math.min(10, questionsAnswered * 0.5);
    
    // Combo bonus (0-5 points)
    const comboScore = Math.min(5, longestCombo * 0.5);
    
    return Math.min(100, accuracyScore + speedScore + questionsScore + comboScore);
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
