// ELO Rating System for BoltQuest
// Based on chess ELO system, adapted for learning and engagement

import { getUserProfile, saveUserProfile } from './userStorage';

export interface EloRating {
  currentRating: number;
  peakRating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winStreak: number;
  bestWinStreak: number;
  lastUpdated: Date;
  ratingHistory: EloHistoryEntry[];
  categoryRatings: Record<string, number>; // Per-category ELO
}

export interface EloHistoryEntry {
  rating: number;
  change: number;
  gameResult: 'win' | 'loss' | 'draw';
  category: string;
  difficulty: string;
  timestamp: Date;
  performance: number; // 0-100 score
}

export interface EloCalculation {
  newRating: number;
  ratingChange: number;
  expectedScore: number;
  actualScore: number;
  kFactor: number;
}

// ELO Constants
const STARTING_RATING = 1200;
const MIN_RATING = 400;
const MAX_RATING = 2400;
const DEFAULT_K_FACTOR = 32;
const HIGH_K_FACTOR = 40; // For new players (< 30 games)
const LOW_K_FACTOR = 16; // For experienced players (> 100 games)

// Rating Categories
export const ELO_CATEGORIES = {
  NOVICE: { min: 400, max: 800, label: 'Novice', color: 'gray' },
  BRONZE: { min: 800, max: 1000, label: 'Bronze', color: 'orange' },
  SILVER: { min: 1000, max: 1200, label: 'Silver', color: 'gray' },
  GOLD: { min: 1200, max: 1400, label: 'Gold', color: 'yellow' },
  PLATINUM: { min: 1400, max: 1600, label: 'Platinum', color: 'blue' },
  DIAMOND: { min: 1600, max: 1800, label: 'Diamond', color: 'cyan' },
  MASTER: { min: 1800, max: 2000, label: 'Master', color: 'purple' },
  GRANDMASTER: { min: 2000, max: 2400, label: 'Grandmaster', color: 'red' }
};

export class EloSystem {
  private userProfile: EloRating;

  constructor() {
    this.userProfile = this.loadUserProfile();
  }

  private loadUserProfile(): EloRating {
    const profile = getUserProfile();
    if (profile?.eloRating) {
      return {
        ...profile.eloRating,
        lastUpdated: new Date(profile.eloRating.lastUpdated),
        ratingHistory: profile.eloRating.ratingHistory.map(entry => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }))
      };
    }
    return this.createDefaultEloRating();
  }

  private createDefaultEloRating(): EloRating {
    return {
      currentRating: STARTING_RATING,
      peakRating: STARTING_RATING,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      winStreak: 0,
      bestWinStreak: 0,
      lastUpdated: new Date(),
      ratingHistory: [],
      categoryRatings: {
        tech: STARTING_RATING,
        business: STARTING_RATING,
        marketing: STARTING_RATING,
        finance: STARTING_RATING,
        general: STARTING_RATING
      }
    };
  }

  private saveUserProfile(): void {
    const profile = getUserProfile();
    if (profile) {
      saveUserProfile({
        ...profile,
        eloRating: this.userProfile
      });
    }
  }

  // Calculate ELO change based on game result (simplified for new system)
  calculateEloChange(
    currentRating: number,
    performance: number, // 0-100 score
    category: string,
    opponentRating?: number
  ): EloCalculation {
    // The actual ELO calculation is now handled in eloRewardsSystem.ts
    // This method is kept for compatibility but simplified
    const actualScore = performance / 100; // Convert to 0-1 scale
    
    // For now, return a simple calculation that will be overridden by eloRewardsSystem
    const ratingChange = Math.round((performance - 50) * 0.5); // Simple linear change
    const newRating = Math.max(MIN_RATING, Math.min(MAX_RATING, currentRating + ratingChange));

    return {
      newRating,
      ratingChange,
      expectedScore: 0.5, // Not used in new system
      actualScore,
      kFactor: 0 // Not used in new system
    };
  }

  // Update ELO after a game
  updateElo(
    performance: number,
    category: string,
    gameMode: string,
    questionsAnswered: number,
    timeSpent: number
  ): EloCalculation {
    const currentRating = this.userProfile.categoryRatings[category] || STARTING_RATING;
    const calculation = this.calculateEloChange(currentRating, performance, category);
    
    // Update overall rating (weighted average of category ratings)
    const categoryRatings = Object.values(this.userProfile.categoryRatings);
    const overallRating = Math.round(
      categoryRatings.reduce((sum, rating) => sum + rating, 0) / categoryRatings.length
    );
    
    // Update category rating
    this.userProfile.categoryRatings[category] = calculation.newRating;
    
    // Update overall stats
    this.userProfile.gamesPlayed++;
    this.userProfile.lastUpdated = new Date();
    
    // Determine game result
    const gameResult = performance >= 70 ? 'win' : performance >= 50 ? 'draw' : 'loss';
    
    if (gameResult === 'win') {
      this.userProfile.wins++;
      this.userProfile.winStreak++;
      this.userProfile.bestWinStreak = Math.max(this.userProfile.bestWinStreak, this.userProfile.winStreak);
    } else if (gameResult === 'loss') {
      this.userProfile.losses++;
      this.userProfile.winStreak = 0;
    }
    
    // Update peak rating
    this.userProfile.peakRating = Math.max(this.userProfile.peakRating, calculation.newRating);
    
    // Add to history
    this.userProfile.ratingHistory.push({
      rating: calculation.newRating,
      change: calculation.ratingChange,
      gameResult,
      category,
      difficulty: this.getDifficultyFromElo(calculation.newRating),
      timestamp: new Date(),
      performance
    });
    
    // Keep only last 100 history entries
    if (this.userProfile.ratingHistory.length > 100) {
      this.userProfile.ratingHistory = this.userProfile.ratingHistory.slice(-100);
    }
    
    this.saveUserProfile();
    return calculation;
  }

  // Get system rating for performance-based matching
  private getSystemRatingForPerformance(performance: number): number {
    // Map performance to system rating
    if (performance >= 90) return 1800; // Master level
    if (performance >= 80) return 1600; // Diamond level
    if (performance >= 70) return 1400; // Platinum level
    if (performance >= 60) return 1200; // Gold level
    if (performance >= 50) return 1000; // Silver level
    if (performance >= 40) return 800;  // Bronze level
    return 600; // Novice level
  }

  // Calculate expected score between two ratings
  private calculateExpectedScore(ratingA: number, ratingB: number): number {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  }

  // Get K-factor based on experience
  private getKFactor(gamesPlayed: number): number {
    if (gamesPlayed < 30) return HIGH_K_FACTOR;
    if (gamesPlayed > 100) return LOW_K_FACTOR;
    return DEFAULT_K_FACTOR;
  }

  // Convert ELO rating to difficulty level
  getDifficultyFromElo(rating: number): string {
    if (rating >= 1800) return 'very_hard';
    if (rating >= 1600) return 'hard';
    if (rating >= 1400) return 'medium_hard';
    if (rating >= 1200) return 'medium';
    if (rating >= 1000) return 'medium_easy';
    if (rating >= 800) return 'easy';
    return 'very_easy';
  }

  // Get ELO category info
  getEloCategory(rating: number): { label: string; color: string; min: number; max: number } {
    for (const [key, category] of Object.entries(ELO_CATEGORIES)) {
      if (rating >= category.min && rating < category.max) {
        return { ...category, min: category.min, max: category.max };
      }
    }
    return ELO_CATEGORIES.NOVICE;
  }

  // Get progress to next category
  getProgressToNextCategory(rating: number): { progress: number; nextCategory: string; pointsNeeded: number } {
    const currentCategory = this.getEloCategory(rating);
    const categories = Object.values(ELO_CATEGORIES);
    const currentIndex = categories.findIndex(cat => cat.label === currentCategory.label);
    
    if (currentIndex === categories.length - 1) {
      // Already at highest category
      return { progress: 100, nextCategory: 'Max', pointsNeeded: 0 };
    }
    
    const nextCategory = categories[currentIndex + 1];
    const progress = ((rating - currentCategory.min) / (nextCategory.min - currentCategory.min)) * 100;
    const pointsNeeded = nextCategory.min - rating;
    
    return {
      progress: Math.min(100, Math.max(0, progress)),
      nextCategory: nextCategory.label,
      pointsNeeded: Math.max(0, pointsNeeded)
    };
  }

  // Set ELO rating for a specific category (for testing)
  setCategoryRating(category: string, rating: number): void {
    if (!this.userProfile.categoryRatings) {
      this.userProfile.categoryRatings = {};
    }
    
    this.userProfile.categoryRatings[category] = rating;
    
    // Update overall rating
    const categoryRatings = Object.values(this.userProfile.categoryRatings);
    if (categoryRatings.length > 0) {
      this.userProfile.overallRating = Math.round(
        categoryRatings.reduce((sum, r) => sum + r, 0) / categoryRatings.length
      );
      this.userProfile.currentRating = this.userProfile.overallRating;
    }
    
    this.saveUserProfile();
  }

  // Get overall ELO rating
  getOverallRating(): number {
    // Check if we have category ratings
    if (!this.userProfile.categoryRatings || Object.keys(this.userProfile.categoryRatings).length === 0) {
      return STARTING_RATING; // Default rating
    }
    
    const categoryRatings = Object.values(this.userProfile.categoryRatings);
    if (categoryRatings.length === 0) {
      return STARTING_RATING;
    }
    
    return Math.round(
      categoryRatings.reduce((sum, rating) => sum + rating, 0) / categoryRatings.length
    );
  }

  // Get ELO rating for a specific category
  getCategoryRating(category: string): number {
    if (!this.userProfile.categoryRatings || !this.userProfile.categoryRatings[category]) {
      return STARTING_RATING; // Default rating for new categories
    }
    
    return this.userProfile.categoryRatings[category];
  }

  // Get ELO statistics
  getEloStats(): EloRating {
    return { ...this.userProfile };
  }

  // Get recent performance trend
  getPerformanceTrend(days: number = 7): { trend: 'up' | 'down' | 'stable'; change: number } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentGames = this.userProfile.ratingHistory.filter(
      entry => entry.timestamp >= cutoffDate
    );
    
    if (recentGames.length < 2) {
      return { trend: 'stable', change: 0 };
    }
    
    const firstRating = recentGames[0].rating;
    const lastRating = recentGames[recentGames.length - 1].rating;
    const change = lastRating - firstRating;
    
    if (change > 20) return { trend: 'up', change };
    if (change < -20) return { trend: 'down', change };
    return { trend: 'stable', change };
  }

  // Reset ELO (for testing)
  resetElo(): void {
    this.userProfile = this.createDefaultEloRating();
    this.saveUserProfile();
  }

  // Reset specific category rating
  resetCategoryRating(category: string): void {
    if (category === 'overall') {
      this.userProfile.overallRating = 1200;
    } else if (this.userProfile.categoryRatings[category]) {
      this.userProfile.categoryRatings[category] = 1200;
    }
    this.saveUserProfile();
  }

  // Reset all ratings
  resetAllRatings(): void {
    this.userProfile = this.createDefaultEloRating();
    this.saveUserProfile();
  }

  // Initialize ELO for existing users who don't have ELO data
  initializeForExistingUser(): void {
    const profile = getUserProfile();
    if (profile && !profile.eloRating) {
      console.log('🔄 Initializing ELO data for existing user');
      this.userProfile = this.createDefaultEloRating();
      this.saveUserProfile();
    }
  }

  // Initialize ELO from baseline assessment
  initializeFromBaseline(categoryRatings: Record<string, number>): void {
    // Set category ratings
    this.userProfile.categoryRatings = categoryRatings;
    
    // Calculate overall rating as average of category ratings
    const ratings = Object.values(categoryRatings);
    if (ratings.length > 0) {
      this.userProfile.overallRating = Math.round(
        ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      );
      
      // Also set current and peak rating
      this.userProfile.currentRating = this.userProfile.overallRating;
      this.userProfile.peakRating = this.userProfile.overallRating;
    }
    
    this.saveUserProfile();
    
    console.log('✅ ELO initialized from baseline:', {
      categoryRatings,
      overallRating: this.userProfile.overallRating
    });
  }
}

// Utility functions
export const EloUtils = {
  formatRating: (rating: number | null): string => {
    if (rating === null || rating === undefined) {
      return '0';
    }
    return rating.toFixed(0);
  },
  
  getRatingColor: (rating: number | null): string => {
    if (rating === null || rating === undefined) {
      return '#6b7280'; // gray color for no rating
    }
    const category = new EloSystem().getEloCategory(rating);
    return category.color;
  },
  
  getRatingBadge: (rating: number | null): { label: string; color: string } => {
    if (rating === null || rating === undefined) {
      return { label: 'Unrated', color: '#6b7280' };
    }
    const category = new EloSystem().getEloCategory(rating);
    return { label: category.label, color: category.color };
  },
  
  calculateWinRate: (wins: number, losses: number): number => {
    const total = wins + losses;
    return total > 0 ? Math.round((wins / total) * 100) : 0;
  }
};

export default EloSystem;
