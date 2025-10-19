/**
 * Question Randomization System
 * 
 * This module provides robust question and answer randomization functionality
 * to ensure fair distribution and prevent pattern memorization.
 * 
 * Features:
 * - Fisher-Yates shuffle algorithm for true randomization
 * - Answer position randomization with correct answer tracking
 * - Question selection randomization
 * - Configurable randomization strategies
 * - Analytics tracking for bias detection
 * - Future-proof architecture for advanced features
 */

import { Question } from '@/types/game';
import { analyzeLengthBias, randomizeAnswerLengths } from './lengthBiasPrevention';

/**
 * Configuration for randomization behavior
 */
export interface RandomizationConfig {
  /** Whether to randomize answer positions */
  randomizeAnswers: boolean;
  /** Whether to randomize question order */
  randomizeQuestions: boolean;
  /** Whether to prevent answer length bias */
  preventLengthBias: boolean;
  /** Seed for reproducible randomization (useful for testing) */
  seed?: number;
  /** Strategy for question selection */
  strategy: 'shuffle' | 'weighted' | 'adaptive';
  /** Track analytics for bias detection */
  trackAnalytics: boolean;
}

/**
 * Default randomization configuration
 */
export const DEFAULT_RANDOMIZATION_CONFIG: RandomizationConfig = {
  randomizeAnswers: true,
  randomizeQuestions: true,
  preventLengthBias: false, // Temporarily disabled to fix white screen
  strategy: 'shuffle',
  trackAnalytics: true,
};

/**
 * Analytics data for tracking randomization effectiveness
 */
export interface RandomizationAnalytics {
  totalQuestions: number;
  answerPositionDistribution: {
    position0: number;
    position1: number;
    position2: number;
    position3: number;
  };
  lastUpdated: number;
  biasDetected: boolean;
}

/**
 * Enhanced question with randomization metadata
 */
export interface RandomizedQuestion extends Question {
  /** Original correct answer position before randomization */
  originalCorrectAnswer: number;
  /** Whether this question was randomized */
  wasRandomized: boolean;
  /** Randomization timestamp */
  randomizedAt: number;
}

/**
 * Simple Linear Congruential Generator for seeded randomization
 * This ensures reproducible results when needed for testing
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }
}

/**
 * Fisher-Yates shuffle algorithm implementation
 * Provides true uniform randomization
 */
function fisherYatesShuffle<T>(array: T[], random: () => number): T[] {
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Randomizes answer positions while tracking the correct answer
 */
export function randomizeAnswerPositions(
  question: Question,
  config: RandomizationConfig = DEFAULT_RANDOMIZATION_CONFIG
): RandomizedQuestion {
  if (!config.randomizeAnswers) {
    return {
      ...question,
      originalCorrectAnswer: question.correctAnswer,
      wasRandomized: false,
      randomizedAt: Date.now(),
    };
  }

  const random = config.seed ? new SeededRandom(config.seed) : { next: Math.random };
  const shuffledOptions = fisherYatesShuffle(question.options, random.next.bind(random));
  
  // Find the new position of the correct answer
  const correctAnswerText = question.options[question.correctAnswer];
  const newCorrectAnswer = shuffledOptions.findIndex(option => option === correctAnswerText);

  const randomizedQuestion: RandomizedQuestion = {
    ...question,
    options: shuffledOptions,
    correctAnswer: newCorrectAnswer,
    originalCorrectAnswer: question.correctAnswer,
    wasRandomized: true,
    randomizedAt: Date.now(),
  };

  // Apply length bias prevention if enabled
  let finalQuestion = randomizedQuestion;
  if (config.preventLengthBias && randomizedQuestion.options && Array.isArray(randomizedQuestion.options)) {
    const lengthBiasAnalysis = analyzeLengthBias(randomizedQuestion);
    if (lengthBiasAnalysis.biasScore > 50) {
      // Apply length randomization to eliminate bias
      finalQuestion = {
        ...randomizedQuestion,
        options: randomizeAnswerLengths(randomizedQuestion.options),
      };
    }
  }

  // Track analytics if enabled
  if (config.trackAnalytics) {
    trackAnswerPositionAnalytics(newCorrectAnswer);
  }

  return finalQuestion;
}

/**
 * Randomizes question order within a category/difficulty
 */
export function randomizeQuestionOrder(
  questions: Question[],
  config: RandomizationConfig = DEFAULT_RANDOMIZATION_CONFIG
): Question[] {
  if (!config.randomizeQuestions) {
    return questions;
  }

  const random = config.seed ? new SeededRandom(config.seed) : { next: Math.random };
  return fisherYatesShuffle(questions, random.next.bind(random));
}

/**
 * Gets a random question from a pool with optional weighting
 */
export function getRandomQuestion(
  questions: Question[],
  config: RandomizationConfig = DEFAULT_RANDOMIZATION_CONFIG
): RandomizedQuestion {
  if (questions.length === 0) {
    throw new Error('Cannot get random question from empty array');
  }

  let selectedQuestion: Question;

  switch (config.strategy) {
    case 'shuffle':
      const shuffledQuestions = randomizeQuestionOrder(questions, config);
      selectedQuestion = shuffledQuestions[0];
      break;
    
    case 'weighted':
      // Future: Implement weighted selection based on difficulty or user performance
      selectedQuestion = questions[Math.floor(Math.random() * questions.length)];
      break;
    
    case 'adaptive':
      // Future: Implement adaptive selection based on user learning patterns
      selectedQuestion = questions[Math.floor(Math.random() * questions.length)];
      break;
    
    default:
      selectedQuestion = questions[Math.floor(Math.random() * questions.length)];
  }

  return randomizeAnswerPositions(selectedQuestion, config);
}

/**
 * Creates a question pool with rotation to prevent memorization
 */
export class QuestionPool {
  private questions: Question[];
  private usedQuestions: Set<string> = new Set();
  private config: RandomizationConfig;

  constructor(questions: Question[], config: RandomizationConfig = DEFAULT_RANDOMIZATION_CONFIG) {
    this.questions = questions;
    this.config = config;
  }

  /**
   * Gets the next question from the pool
   * Automatically resets when all questions have been used
   */
  getNextQuestion(): RandomizedQuestion {
    // Reset pool if all questions have been used
    if (this.usedQuestions.size >= this.questions.length) {
      this.usedQuestions.clear();
    }

    // Find unused questions
    const unusedQuestions = this.questions.filter(q => !this.usedQuestions.has(q.id));
    
    if (unusedQuestions.length === 0) {
      // Fallback to any question if something goes wrong
      const randomQuestion = this.questions[Math.floor(Math.random() * this.questions.length)];
      return randomizeAnswerPositions(randomQuestion, this.config);
    }

    // Get random question from unused pool
    const randomIndex = Math.floor(Math.random() * unusedQuestions.length);
    const selectedQuestion = unusedQuestions[randomIndex];
    
    // Mark as used
    this.usedQuestions.add(selectedQuestion.id);
    
    return randomizeAnswerPositions(selectedQuestion, this.config);
  }

  /**
   * Resets the question pool
   */
  reset(): void {
    this.usedQuestions.clear();
  }

  /**
   * Gets pool statistics
   */
  getStats() {
    return {
      totalQuestions: this.questions.length,
      usedQuestions: this.usedQuestions.size,
      remainingQuestions: this.questions.length - this.usedQuestions.size,
      usagePercentage: (this.usedQuestions.size / this.questions.length) * 100,
    };
  }
}

/**
 * Analytics tracking for bias detection
 */
const analyticsStorageKey = 'boltquest_randomization_analytics';

function trackAnswerPositionAnalytics(position: number): void {
  try {
    const stored = localStorage.getItem(analyticsStorageKey);
    const analytics: RandomizationAnalytics = stored 
      ? JSON.parse(stored)
      : {
          totalQuestions: 0,
          answerPositionDistribution: { position0: 0, position1: 0, position2: 0, position3: 0 },
          lastUpdated: Date.now(),
          biasDetected: false,
        };

    analytics.totalQuestions++;
    analytics.lastUpdated = Date.now();

    // Update position distribution
    switch (position) {
      case 0: analytics.answerPositionDistribution.position0++; break;
      case 1: analytics.answerPositionDistribution.position1++; break;
      case 2: analytics.answerPositionDistribution.position2++; break;
      case 3: analytics.answerPositionDistribution.position3++; break;
    }

    // Check for bias (more than 40% in any single position)
    const distribution = analytics.answerPositionDistribution;
    const total = analytics.totalQuestions;
    const maxPercentage = Math.max(
      (distribution.position0 / total) * 100,
      (distribution.position1 / total) * 100,
      (distribution.position2 / total) * 100,
      (distribution.position3 / total) * 100
    );

    analytics.biasDetected = maxPercentage > 40;

    localStorage.setItem(analyticsStorageKey, JSON.stringify(analytics));
  } catch (error) {
    console.error('Error tracking randomization analytics:', error);
  }
}

/**
 * Gets current randomization analytics
 */
export function getRandomizationAnalytics(): RandomizationAnalytics | null {
  try {
    const stored = localStorage.getItem(analyticsStorageKey);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error getting randomization analytics:', error);
    return null;
  }
}

/**
 * Resets randomization analytics
 */
export function resetRandomizationAnalytics(): void {
  try {
    localStorage.removeItem(analyticsStorageKey);
  } catch (error) {
    console.error('Error resetting randomization analytics:', error);
  }
}

/**
 * Validates that randomization is working correctly
 * Returns true if distribution is within acceptable bounds
 */
export function validateRandomization(): boolean {
  const analytics = getRandomizationAnalytics();
  if (!analytics || analytics.totalQuestions < 20) {
    return false; // Not enough data
  }

  const distribution = analytics.answerPositionDistribution;
  const total = analytics.totalQuestions;
  
  // Check if any position has more than 40% of answers
  const percentages = [
    (distribution.position0 / total) * 100,
    (distribution.position1 / total) * 100,
    (distribution.position2 / total) * 100,
    (distribution.position3 / total) * 100,
  ];

  return percentages.every(p => p <= 40);
}

/**
 * Utility function to create a question pool for a specific category/difficulty
 */
export function createQuestionPool(
  questions: Question[],
  config: RandomizationConfig = DEFAULT_RANDOMIZATION_CONFIG
): QuestionPool {
  return new QuestionPool(questions, config);
}

/**
 * Batch randomize multiple questions (useful for game initialization)
 */
export function batchRandomizeQuestions(
  questions: Question[],
  config: RandomizationConfig = DEFAULT_RANDOMIZATION_CONFIG
): RandomizedQuestion[] {
  const randomizedQuestions = randomizeQuestionOrder(questions, config);
  return randomizedQuestions.map(q => randomizeAnswerPositions(q, config));
}
