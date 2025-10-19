// Baseline Assessment Logic for BoltQuest
// Generates personalized knowledge tests and calculates initial ELO ratings

import { Category, Difficulty, Question } from '@/types/game';
import { mockQuestions } from '@/data/mockData';
import { EloSystem } from './eloSystem';
import { getUserProfile, saveUserProfile } from './userStorage';

export interface BaselineResults {
  categoryScores: Record<Category, { correct: number; total: number; accuracy: number }>;
  overallAccuracy: number;
  recommendedElo: Record<Category, number>;
  recommendedDifficulty: Difficulty;
  totalQuestions: number;
  totalCorrect: number;
}

export interface BaselineQuestion extends Question {
  category: Category;
}

/**
 * Generate a baseline assessment test based on user's selected interests
 * @param interests - Array of categories the user selected during onboarding
 * @param questionsPerCategory - Number of questions per category (default: 5)
 * @returns Array of questions for the baseline test
 */
export function generateBaselineTest(
  interests: Category[], 
  questionsPerCategory: number = 5
): BaselineQuestion[] {
  const testQuestions: BaselineQuestion[] = [];
  
  // For each selected interest, pick questions
  interests.forEach(category => {
    const categoryQuestions = mockQuestions[category];
    if (!categoryQuestions) return;
    
    // Get medium difficulty questions first
    const mediumQuestions = categoryQuestions.medium || [];
    
    // Randomly select questions from medium difficulty
    const shuffled = [...mediumQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, questionsPerCategory);
    
    // Add category info to each question
    selected.forEach(q => {
      testQuestions.push({
        ...q,
        category: category
      });
    });
  });
  
  // Shuffle all questions so categories are mixed
  return testQuestions.sort(() => Math.random() - 0.5);
}

/**
 * Calculate baseline ELO rating based on assessment performance
 * Formula: Base 1200 ELO, +/- 100 per 10% deviation from 50% accuracy
 * @param categoryScores - Performance per category
 * @returns ELO rating for each category
 */
export function calculateBaselineElo(
  categoryScores: Record<Category, { correct: number; total: number }>
): Record<Category, number> {
  const baseElo = 1200;
  const eloPerTenPercent = 100;
  const categoryElos: Record<Category, number> = {} as Record<Category, number>;
  
  Object.entries(categoryScores).forEach(([category, scores]) => {
    if (scores.total === 0) {
      categoryElos[category as Category] = baseElo;
      return;
    }
    
    const accuracy = (scores.correct / scores.total) * 100;
    
    // Calculate ELO adjustment based on deviation from 50%
    const deviationFromFifty = accuracy - 50;
    const eloAdjustment = (deviationFromFifty / 10) * eloPerTenPercent;
    
    // Calculate final ELO, clamped between 800 and 1600
    const calculatedElo = Math.round(baseElo + eloAdjustment);
    const clampedElo = Math.max(800, Math.min(1600, calculatedElo));
    
    categoryElos[category as Category] = clampedElo;
  });
  
  return categoryElos;
}

/**
 * Determine recommended difficulty based on overall performance
 * @param overallAccuracy - Overall accuracy percentage (0-100)
 * @returns Recommended difficulty level
 */
export function getRecommendedDifficulty(overallAccuracy: number): Difficulty {
  if (overallAccuracy >= 80) {
    return 'hard';
  } else if (overallAccuracy >= 60) {
    return 'medium';
  } else {
    return 'easy';
  }
}

/**
 * Save baseline assessment results to user profile
 * @param userId - User's ID
 * @param results - Baseline assessment results
 */
export function saveBaselineResults(userId: string, results: BaselineResults): void {
  const userProfile = getUserProfile();
  
  if (userProfile.id !== userId) {
    console.error('User ID mismatch when saving baseline results');
    return;
  }
  
  // Initialize ELO system with baseline ratings
  const eloSystem = new EloSystem();
  eloSystem.initializeFromBaseline(results.recommendedElo);
  
  // Save baseline completion flag
  userProfile.baselineCompleted = true;
  userProfile.baselineResults = {
    completedAt: new Date(),
    overallAccuracy: results.overallAccuracy,
    recommendedDifficulty: results.recommendedDifficulty,
    categoryScores: results.categoryScores
  };
  
  saveUserProfile(userProfile);
  
  console.log('✅ Baseline assessment results saved:', {
    userId,
    accuracy: results.overallAccuracy,
    elo: results.recommendedElo,
    difficulty: results.recommendedDifficulty
  });
}

/**
 * Calculate baseline results from user's answers
 * @param questions - Array of questions asked
 * @param userAnswers - Array of user's answer indices
 * @returns Baseline results with scores and recommendations
 */
export function calculateBaselineResults(
  questions: BaselineQuestion[],
  userAnswers: number[]
): BaselineResults {
  const categoryScores: Record<Category, { correct: number; total: number; accuracy: number }> = 
    {} as Record<Category, { correct: number; total: number; accuracy: number }>;
  
  let totalCorrect = 0;
  
  // Calculate scores per category
  questions.forEach((question, index) => {
    const category = question.category;
    const isCorrect = userAnswers[index] === question.correctAnswer;
    
    if (!categoryScores[category]) {
      categoryScores[category] = { correct: 0, total: 0, accuracy: 0 };
    }
    
    categoryScores[category].total++;
    if (isCorrect) {
      categoryScores[category].correct++;
      totalCorrect++;
    }
  });
  
  // Calculate accuracy percentages
  Object.keys(categoryScores).forEach(category => {
    const scores = categoryScores[category as Category];
    scores.accuracy = (scores.correct / scores.total) * 100;
  });
  
  const overallAccuracy = (totalCorrect / questions.length) * 100;
  const recommendedElo = calculateBaselineElo(categoryScores);
  const recommendedDifficulty = getRecommendedDifficulty(overallAccuracy);
  
  return {
    categoryScores,
    overallAccuracy,
    recommendedElo,
    recommendedDifficulty,
    totalQuestions: questions.length,
    totalCorrect
  };
}

/**
 * Initialize default ELO for users who skip the assessment
 * @param userId - User's ID
 * @param interests - User's selected interests
 */
export function initializeDefaultElo(userId: string, interests: Category[]): void {
  const userProfile = getUserProfile();
  
  if (userProfile.id !== userId) {
    console.error('User ID mismatch when initializing default ELO');
    return;
  }
  
  // Assign default 1200 ELO to all selected interests
  const defaultElo: Record<Category, number> = {} as Record<Category, number>;
  interests.forEach(interest => {
    defaultElo[interest] = 1200;
  });
  
  // Initialize ELO system
  const eloSystem = new EloSystem();
  eloSystem.initializeFromBaseline(defaultElo);
  
  // Mark baseline as skipped
  userProfile.baselineCompleted = false;
  userProfile.baselineSkipped = true;
  
  saveUserProfile(userProfile);
  
  console.log('✅ Default ELO initialized (assessment skipped):', {
    userId,
    interests,
    defaultElo: 1200
  });
}

