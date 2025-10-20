/**
 * Randomization Testing Suite
 * 
 * This module provides comprehensive testing for the question randomization system
 * to ensure it's working correctly and preventing bias.
 */

import { 
  randomizeAnswerPositions, 
  createQuestionPool, 
  getRandomizationAnalytics,
  validateRandomization,
  resetRandomizationAnalytics,
  DEFAULT_RANDOMIZATION_CONFIG
} from '@/lib/questionRandomizer';
import { Question } from '@/types/game';

/**
 * Test data for randomization testing
 */
const testQuestions: Question[] = [
  {
    id: 'test1',
    buzzword: 'API',
    definition: 'Application Programming Interface',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 0,
    category: 'tech',
    difficulty: 'easy',
  },
  {
    id: 'test2',
    buzzword: 'CSS',
    definition: 'Cascading Style Sheets',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 1,
    category: 'tech',
    difficulty: 'easy',
  },
  {
    id: 'test3',
    buzzword: 'HTML',
    definition: 'HyperText Markup Language',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 2,
    category: 'tech',
    difficulty: 'easy',
  },
  {
    id: 'test4',
    buzzword: 'JS',
    definition: 'JavaScript',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 3,
    category: 'tech',
    difficulty: 'easy',
  },
];

/**
 * Test answer position randomization
 */
export function testAnswerPositionRandomization(): boolean {
  console.log('🧪 Testing Answer Position Randomization...');
  
  const results = {
    totalTests: 100,
    positionDistribution: { 0: 0, 1: 0, 2: 0, 3: 0 },
    success: true,
  };

  // Reset analytics for clean test
  resetRandomizationAnalytics();

  for (let i = 0; i < results.totalTests; i++) {
    const testQuestion = testQuestions[i % testQuestions.length];
    const randomized = randomizeAnswerPositions(testQuestion, DEFAULT_RANDOMIZATION_CONFIG);
    
    results.positionDistribution[randomized.correctAnswer as keyof typeof results.positionDistribution]++;
    
    // Verify correct answer is preserved
    const originalCorrectText = testQuestion.options[testQuestion.correctAnswer];
    const newCorrectText = randomized.options[randomized.correctAnswer];
    
    if (originalCorrectText !== newCorrectText) {
      console.error('❌ Correct answer text mismatch!');
      results.success = false;
    }
  }

  // Check distribution (should be roughly equal)
  const expectedPerPosition = results.totalTests / 4;
  const tolerance = expectedPerPosition * 0.3; // 30% tolerance

  Object.entries(results.positionDistribution).forEach(([position, count]) => {
    const deviation = Math.abs(count - expectedPerPosition);
    if (deviation > tolerance) {
      console.warn(`⚠️ Position ${position} has ${count} occurrences (expected ~${expectedPerPosition})`);
    }
  });

  console.log('📊 Position Distribution:', results.positionDistribution);
  console.log(results.success ? '✅ Answer randomization test passed!' : '❌ Answer randomization test failed!');
  
  return results.success;
}

/**
 * Test question pool functionality
 */
export function testQuestionPool(): boolean {
  console.log('🧪 Testing Question Pool...');
  
  const pool = createQuestionPool(testQuestions, DEFAULT_RANDOMIZATION_CONFIG);
  const results = {
    success: true,
    questionsRetrieved: 0,
    uniqueQuestions: new Set<string>(),
  };

  // Test getting questions from pool
  for (let i = 0; i < testQuestions.length * 2; i++) {
    const question = pool.getNextQuestion();
    results.questionsRetrieved++;
    results.uniqueQuestions.add(question.id);
    
    // Verify question structure
    if (!question.id || !question.buzzword || !question.options || question.options.length !== 4) {
      console.error('❌ Invalid question structure!');
      results.success = false;
    }
  }

  // Test pool reset
  pool.reset();
  const statsAfterReset = pool.getStats();
  if (statsAfterReset.usedQuestions !== 0) {
    console.error('❌ Pool reset failed!');
    results.success = false;
  }

  console.log(`📊 Retrieved ${results.questionsRetrieved} questions`);
  console.log(`📊 Unique questions: ${results.uniqueQuestions.size}`);
  console.log(results.success ? '✅ Question pool test passed!' : '❌ Question pool test failed!');
  
  return results.success;
}

/**
 * Test analytics tracking
 */
export function testAnalyticsTracking(): boolean {
  console.log('🧪 Testing Analytics Tracking...');
  
  // Reset analytics
  resetRandomizationAnalytics();
  
  // Generate some test data
  for (let i = 0; i < 50; i++) {
    const testQuestion = testQuestions[i % testQuestions.length];
    randomizeAnswerPositions(testQuestion, DEFAULT_RANDOMIZATION_CONFIG);
  }

  const analytics = getRandomizationAnalytics();
  
  if (!analytics) {
    console.error('❌ No analytics data found!');
    return false;
  }

  if (analytics.totalQuestions !== 50) {
    console.error(`❌ Expected 50 questions, got ${analytics.totalQuestions}`);
    return false;
  }

  const totalTracked = Object.values(analytics.answerPositionDistribution).reduce((a, b) => a + b, 0);
  if (totalTracked !== 50) {
    console.error(`❌ Expected 50 total tracked answers, got ${totalTracked}`);
    return false;
  }

  console.log('📊 Analytics Data:', analytics);
  console.log('✅ Analytics tracking test passed!');
  
  return true;
}

/**
 * Test bias detection
 */
export function testBiasDetection(): boolean {
  console.log('🧪 Testing Bias Detection...');
  
  // Reset analytics
  resetRandomizationAnalytics();
  
  // Create biased data (all answers in position 0)
  const biasedQuestion: Question = {
    id: 'biased',
    buzzword: 'Test',
    definition: 'Test definition',
    options: ['Correct', 'Wrong1', 'Wrong2', 'Wrong3'],
    correctAnswer: 0,
    category: 'tech',
    difficulty: 'easy',
  };

  // Generate 100 questions with same correct answer position
  for (let i = 0; i < 100; i++) {
    randomizeAnswerPositions(biasedQuestion, { ...DEFAULT_RANDOMIZATION_CONFIG, randomizeAnswers: false });
  }

  const analytics = getRandomizationAnalytics();
  
  if (!analytics?.biasDetected) {
    console.error('❌ Bias detection failed - should have detected bias!');
    return false;
  }

  console.log('📊 Bias Detection Result:', analytics.biasDetected);
  console.log('✅ Bias detection test passed!');
  
  return true;
}

/**
 * Run all randomization tests
 */
export function runAllRandomizationTests(): boolean {
  console.log('🚀 Running Complete Randomization Test Suite...\n');
  
  const tests = [
    { name: 'Answer Position Randomization', fn: testAnswerPositionRandomization },
    { name: 'Question Pool', fn: testQuestionPool },
    { name: 'Analytics Tracking', fn: testAnalyticsTracking },
    { name: 'Bias Detection', fn: testBiasDetection },
  ];

  let allPassed = true;

  tests.forEach((test, index) => {
    console.log(`\n${index + 1}. ${test.name}`);
    console.log('='.repeat(50));
    
    try {
      const passed = test.fn();
      if (!passed) allPassed = false;
    } catch (error) {
      console.error(`❌ Test failed with error:`, error);
      allPassed = false;
    }
  });

  console.log('\n' + '='.repeat(50));
  console.log(allPassed ? '🎉 ALL TESTS PASSED!' : '💥 SOME TESTS FAILED!');
  console.log('='.repeat(50));

  return allPassed;
}

/**
 * Performance test for randomization
 */
export function testRandomizationPerformance(): void {
  console.log('🧪 Testing Randomization Performance...');
  
  const iterations = 1000;
  const startTime = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    const testQuestion = testQuestions[i % testQuestions.length];
    randomizeAnswerPositions(testQuestion, DEFAULT_RANDOMIZATION_CONFIG);
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  const avgTime = duration / iterations;
  
  console.log(`📊 Performance Results:`);
  console.log(`   Total time: ${duration.toFixed(2)}ms`);
  console.log(`   Average per question: ${avgTime.toFixed(4)}ms`);
  console.log(`   Questions per second: ${Math.round(1000 / avgTime)}`);
  
  if (avgTime > 1) {
    console.warn('⚠️ Performance warning: Average randomization time > 1ms');
  } else {
    console.log('✅ Performance test passed!');
  }
}

// Export test functions for use in development
if (process.env.NODE_ENV === 'development') {
  (window as any).randomizationTests = {
    runAll: runAllRandomizationTests,
    testAnswerPositions: testAnswerPositionRandomization,
    testPool: testQuestionPool,
    testAnalytics: testAnalyticsTracking,
    testBias: testBiasDetection,
    testPerformance: testRandomizationPerformance,
  };
}




