/**
 * Answer Length Bias Prevention System
 * 
 * This module provides comprehensive tools to detect, prevent, and fix
 * answer length bias in quiz questions.
 */

import { Question } from '@/types/game';

export interface LengthBiasAnalysis {
  questionId: string;
  lengths: number[];
  correctLength: number;
  maxLength: number;
  minLength: number;
  correctPosition: number; // 0 = longest, 1 = second longest, etc.
  isLongest: boolean;
  isShortest: boolean;
  biasScore: number; // 0-100, higher = more biased
}

export interface LengthBiasStats {
  totalQuestions: number;
  longestBiasCount: number;
  shortestBiasCount: number;
  longestBiasPercentage: number;
  shortestBiasPercentage: number;
  averageBiasScore: number;
  severeBiasCount: number; // bias score > 70
}

export interface LengthNormalizationConfig {
  targetLength: number;
  tolerance: number; // ±tolerance characters
  paddingStrategy: 'spaces' | 'words' | 'ellipsis';
  truncationStrategy: 'end' | 'middle' | 'smart';
  preserveMeaning: boolean;
}

export const DEFAULT_LENGTH_CONFIG: LengthNormalizationConfig = {
  targetLength: 25,
  tolerance: 3,
  paddingStrategy: 'spaces',
  truncationStrategy: 'smart',
  preserveMeaning: true,
};

/**
 * Analyzes a question for length bias
 */
export function analyzeLengthBias(question: Question): LengthBiasAnalysis {
  if (!question || !question.options || !Array.isArray(question.options)) {
    throw new Error('Invalid question object: options is not an array');
  }
  
  const lengths = question.options.map(opt => opt.length);
  const correctLength = lengths[question.correctAnswer];
  const maxLength = Math.max(...lengths);
  const minLength = Math.min(...lengths);
  
  // Determine position by length (0 = longest, 1 = second longest, etc.)
  const sortedLengths = [...lengths].sort((a, b) => b - a);
  const correctPosition = sortedLengths.indexOf(correctLength);
  
  // Calculate bias score (0-100)
  let biasScore = 0;
  if (correctLength === maxLength) {
    biasScore = 100; // Maximum bias
  } else if (correctLength === minLength) {
    biasScore = 80; // High bias (opposite pattern)
  } else if (correctPosition === 1) {
    biasScore = 60; // Moderate bias
  } else if (correctPosition === 2) {
    biasScore = 40; // Low bias
  } else {
    biasScore = 20; // Minimal bias
  }
  
  return {
    questionId: question.id,
    lengths,
    correctLength,
    maxLength,
    minLength,
    correctPosition,
    isLongest: correctLength === maxLength,
    isShortest: correctLength === minLength,
    biasScore,
  };
}

/**
 * Analyzes multiple questions for length bias patterns
 */
export function analyzeLengthBiasPatterns(questions: Question[]): LengthBiasStats {
  const analyses = questions.map(analyzeLengthBias);
  
  const totalQuestions = questions.length;
  const longestBiasCount = analyses.filter(a => a.isLongest).length;
  const shortestBiasCount = analyses.filter(a => a.isShortest).length;
  const longestBiasPercentage = (longestBiasCount / totalQuestions) * 100;
  const shortestBiasPercentage = (shortestBiasCount / totalQuestions) * 100;
  const averageBiasScore = analyses.reduce((sum, a) => sum + a.biasScore, 0) / totalQuestions;
  const severeBiasCount = analyses.filter(a => a.biasScore > 70).length;
  
  return {
    totalQuestions,
    longestBiasCount,
    shortestBiasCount,
    longestBiasPercentage,
    shortestBiasPercentage,
    averageBiasScore,
    severeBiasCount,
  };
}

/**
 * Normalizes answer lengths to prevent bias
 */
export function normalizeAnswerLengths(
  question: Question, 
  config: LengthNormalizationConfig = DEFAULT_LENGTH_CONFIG
): Question {
  const { targetLength, tolerance, paddingStrategy, truncationStrategy, preserveMeaning } = config;
  
  const normalizedOptions = question.options.map(option => {
    const currentLength = option.length;
    const targetMin = targetLength - tolerance;
    const targetMax = targetLength + tolerance;
    
    // If already within tolerance, return as-is
    if (currentLength >= targetMin && currentLength <= targetMax) {
      return option;
    }
    
    // If too short, pad it
    if (currentLength < targetMin) {
      return padAnswer(option, targetLength, paddingStrategy);
    }
    
    // If too long, truncate it
    if (currentLength > targetMax) {
      return truncateAnswer(option, targetLength, truncationStrategy, preserveMeaning);
    }
    
    return option;
  });
  
  return {
    ...question,
    options: normalizedOptions,
  };
}

/**
 * Pads an answer to target length
 */
function padAnswer(
  answer: string, 
  targetLength: number, 
  strategy: LengthNormalizationConfig['paddingStrategy']
): string {
  const currentLength = answer.length;
  const paddingNeeded = targetLength - currentLength;
  
  if (paddingNeeded <= 0) return answer;
  
  switch (strategy) {
    case 'spaces':
      return answer + ' '.repeat(paddingNeeded);
    
    case 'words':
      // Add filler words to reach target length
      const fillerWords = ['and', 'or', 'with', 'for', 'in', 'on', 'at', 'by'];
      let padded = answer;
      let wordIndex = 0;
      
      while (padded.length < targetLength && wordIndex < fillerWords.length) {
        const word = fillerWords[wordIndex];
        if (padded.length + word.length + 1 <= targetLength) {
          padded += ' ' + word;
        }
        wordIndex++;
      }
      
      // If still short, pad with spaces
      if (padded.length < targetLength) {
        padded += ' '.repeat(targetLength - padded.length);
      }
      
      return padded;
    
    case 'ellipsis':
      return answer + '.'.repeat(Math.min(paddingNeeded, 3));
    
    default:
      return answer + ' '.repeat(paddingNeeded);
  }
}

/**
 * Truncates an answer to target length
 */
function truncateAnswer(
  answer: string, 
  targetLength: number, 
  strategy: LengthNormalizationConfig['truncationStrategy'],
  preserveMeaning: boolean
): string {
  if (answer.length <= targetLength) return answer;
  
  switch (strategy) {
    case 'end':
      return answer.substring(0, targetLength - 3) + '...';
    
    case 'middle':
      const start = Math.floor(targetLength / 2) - 2;
      const end = Math.floor(targetLength / 2) + 2;
      return answer.substring(0, start) + '...' + answer.substring(answer.length - end);
    
    case 'smart':
      if (preserveMeaning) {
        // Try to break at word boundaries
        const words = answer.split(' ');
        let result = '';
        
        for (const word of words) {
          if (result.length + word.length + 1 <= targetLength - 3) {
            result += (result ? ' ' : '') + word;
          } else {
            break;
          }
        }
        
        return result + '...';
      } else {
        return answer.substring(0, targetLength - 3) + '...';
      }
    
    default:
      return answer.substring(0, targetLength - 3) + '...';
  }
}

/**
 * Randomizes answer lengths to eliminate patterns
 */
export function randomizeAnswerLengths(options: string[]): string[] {
  if (!options || !Array.isArray(options)) {
    throw new Error('Invalid options: must be an array of strings');
  }
  
  const lengths = options.map(opt => opt.length);
  
  // Create length variations (±2 characters)
  const lengthVariations = lengths.map(length => {
    const variation = Math.floor(Math.random() * 5) - 2; // -2 to +2
    return Math.max(5, length + variation); // Minimum 5 characters
  });
  
  // Apply length variations
  const randomizedOptions = options.map((option, index) => {
    const targetLength = lengthVariations[index];
    const currentLength = option.length;
    
    if (currentLength < targetLength) {
      // Pad with spaces
      return option + ' '.repeat(targetLength - currentLength);
    } else if (currentLength > targetLength) {
      // Truncate smartly
      return option.substring(0, targetLength - 3) + '...';
    }
    
    return option;
  });
  
  return randomizedOptions;
}

/**
 * Detects if a question has severe length bias
 */
export function hasSevereLengthBias(question: Question): boolean {
  const analysis = analyzeLengthBias(question);
  return analysis.biasScore > 70;
}

/**
 * Gets length bias recommendations for a question
 */
export function getLengthBiasRecommendations(question: Question): string[] {
  const analysis = analyzeLengthBias(question);
  const recommendations: string[] = [];
  
  if (analysis.isLongest) {
    recommendations.push('Correct answer is longest - consider shortening or lengthening other options');
  }
  
  if (analysis.isShortest) {
    recommendations.push('Correct answer is shortest - consider lengthening or shortening other options');
  }
  
  if (analysis.biasScore > 80) {
    recommendations.push('SEVERE bias detected - immediate normalization required');
  } else if (analysis.biasScore > 60) {
    recommendations.push('Moderate bias detected - consider normalization');
  }
  
  const lengthRange = analysis.maxLength - analysis.minLength;
  if (lengthRange > 20) {
    recommendations.push('Large length variation detected - consider standardizing lengths');
  }
  
  return recommendations;
}

/**
 * Validates that length bias has been eliminated
 */
export function validateLengthBiasFix(question: Question): boolean {
  const analysis = analyzeLengthBias(question);
  return analysis.biasScore < 50; // Acceptable bias threshold
}
