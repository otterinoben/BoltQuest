/**
 * Question Data Rebalancing Script
 * 
 * This script rebalances the answer position distribution in mockData.ts
 * to ensure equal distribution across all four positions.
 */

import { Question } from '@/types/game';

/**
 * Rebalances answer positions to ensure equal distribution
 */
export function rebalanceAnswerPositions(questions: Question[]): Question[] {
  const rebalancedQuestions = [...questions];
  
  // Calculate target distribution (25% each position)
  const totalQuestions = rebalancedQuestions.length;
  const targetPerPosition = Math.floor(totalQuestions / 4);
  const remainder = totalQuestions % 4;
  
  // Track current distribution
  const positionCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };
  
  // First pass: count current distribution
  rebalancedQuestions.forEach(q => {
    positionCounts[q.correctAnswer as keyof typeof positionCounts]++;
  });
  
  console.log('Current distribution:', positionCounts);
  
  // Second pass: rebalance by changing correctAnswer indices
  let positionIndex = 0;
  const targetDistribution = [
    targetPerPosition + (remainder > 0 ? 1 : 0),
    targetPerPosition + (remainder > 1 ? 1 : 0),
    targetPerPosition + (remainder > 2 ? 1 : 0),
    targetPerPosition
  ];
  
  const newPositionCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };
  
  rebalancedQuestions.forEach((question, index) => {
    // Find the position that needs more questions
    let targetPosition = 0;
    for (let i = 0; i < 4; i++) {
      if (newPositionCounts[i as keyof typeof newPositionCounts] < targetDistribution[i]) {
        targetPosition = i;
        break;
      }
    }
    
    // Update the question's correctAnswer
    question.correctAnswer = targetPosition;
    newPositionCounts[targetPosition as keyof typeof newPositionCounts]++;
  });
  
  console.log('New distribution:', newPositionCounts);
  
  return rebalancedQuestions;
}

/**
 * Validates that answer positions are properly distributed
 */
export function validateAnswerDistribution(questions: Question[]): boolean {
  const positionCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };
  
  questions.forEach(q => {
    positionCounts[q.correctAnswer as keyof typeof positionCounts]++;
  });
  
  const total = questions.length;
  const percentages = Object.values(positionCounts).map(count => (count / total) * 100);
  
  // Check if any position has more than 35% (should be ~25% each)
  const maxPercentage = Math.max(...percentages);
  const isValid = maxPercentage <= 35;
  
  console.log('Distribution validation:');
  console.log('Position 0:', positionCounts[0], `(${percentages[0].toFixed(1)}%)`);
  console.log('Position 1:', positionCounts[1], `(${percentages[1].toFixed(1)}%)`);
  console.log('Position 2:', positionCounts[2], `(${percentages[2].toFixed(1)}%)`);
  console.log('Position 3:', positionCounts[3], `(${percentages[3].toFixed(1)}%)`);
  console.log('Max percentage:', maxPercentage.toFixed(1) + '%');
  console.log('Valid:', isValid ? '✅' : '❌');
  
  return isValid;
}

/**
 * Generates a balanced question set for testing
 */
export function generateBalancedTestQuestions(): Question[] {
  const questions: Question[] = [];
  const categories = ['tech', 'business', 'marketing', 'finance', 'general'] as const;
  const difficulties = ['easy', 'medium', 'hard'] as const;
  
  let questionId = 1;
  
  // Generate 20 questions per category/difficulty combination
  categories.forEach(category => {
    difficulties.forEach(difficulty => {
      for (let i = 0; i < 20; i++) {
        const position = (questionId - 1) % 4; // Cycle through positions 0-3
        
        questions.push({
          id: `${category.charAt(0)}${difficulty.charAt(0)}${questionId}`,
          buzzword: `${category} ${difficulty} term ${questionId}`,
          definition: `Definition for ${category} ${difficulty} term ${questionId}`,
          options: [
            'Option A',
            'Option B', 
            'Option C',
            'Option D'
          ],
          correctAnswer: position,
          category,
          difficulty,
        });
        
        questionId++;
      }
    });
  });
  
  return questions;
}



