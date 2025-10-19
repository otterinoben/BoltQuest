import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Trophy } from 'lucide-react';

interface TrueFalseQuestion {
  id: string;
  statement: string;
  answer: boolean;
  explanation: string;
  category: string;
}

interface TrueFalseResult {
  questionId: string;
  userAnswer: boolean;
  correctAnswer: boolean;
  isCorrect: boolean;
  timeSpent: number;
  pointsEarned: number;
}

interface TrueFalseGameProps {
  onComplete: (results: TrueFalseResult[]) => void;
  onQuit: () => void;
  selectedCategories?: string[];
}

// Personalized questions by category
const QUESTIONS_BY_CATEGORY = {
  tech: [
    {
      id: 'tech-001',
      statement: 'JavaScript is a statically typed programming language.',
      answer: false,
      explanation: 'JavaScript is dynamically typed, not statically typed. TypeScript is statically typed.',
      category: 'Technology'
    },
    {
      id: 'tech-002',
      statement: 'React uses a virtual DOM to improve performance.',
      answer: true,
      explanation: 'React creates a virtual representation of the DOM in memory and uses it to efficiently update the real DOM.',
      category: 'Technology'
    },
    {
      id: 'tech-003',
      statement: 'Python was created by Guido van Rossum.',
      answer: true,
      explanation: 'Guido van Rossum created Python and is known as Python\'s "Benevolent Dictator For Life".',
      category: 'Technology'
    },
    {
      id: 'tech-004',
      statement: 'CSS stands for Cascading Style Sheets.',
      answer: true,
      explanation: 'CSS is indeed Cascading Style Sheets, used for styling web pages.',
      category: 'Technology'
    },
    {
      id: 'tech-005',
      statement: 'GitHub is owned by Microsoft.',
      answer: true,
      explanation: 'Microsoft acquired GitHub in 2018 for $7.5 billion.',
      category: 'Technology'
    },
    {
      id: 'tech-006',
      statement: 'Machine Learning and Artificial Intelligence are the same thing.',
      answer: false,
      explanation: 'Machine Learning is a subset of AI. AI is broader and includes ML, deep learning, and other techniques.',
      category: 'Technology'
    },
    {
      id: 'tech-007',
      statement: 'HTTP stands for HyperText Transfer Protocol.',
      answer: true,
      explanation: 'HTTP is the protocol used for transferring web pages and data on the internet.',
      category: 'Technology'
    },
    {
      id: 'tech-008',
      statement: 'Blockchain technology requires a central authority to function.',
      answer: false,
      explanation: 'Blockchain is decentralized by design and doesn\'t require a central authority.',
      category: 'Technology'
    }
  ],
  business: [
    {
      id: 'biz-001',
      statement: 'A startup is typically defined as a company in its first year of operation.',
      answer: false,
      explanation: 'A startup is defined by its growth potential and scalability, not just age. Many startups operate for years.',
      category: 'Business'
    },
    {
      id: 'biz-002',
      statement: 'SWOT analysis stands for Strengths, Weaknesses, Opportunities, and Threats.',
      answer: true,
      explanation: 'SWOT is a strategic planning tool used to evaluate these four key factors.',
      category: 'Business'
    },
    {
      id: 'biz-003',
      statement: 'The lean startup methodology was created by Eric Ries.',
      answer: true,
      explanation: 'Eric Ries popularized the lean startup methodology in his book "The Lean Startup".',
      category: 'Business'
    },
    {
      id: 'biz-004',
      statement: 'Customer acquisition cost (CAC) should always be lower than customer lifetime value (CLV).',
      answer: true,
      explanation: 'For a sustainable business, CAC should be significantly lower than CLV to ensure profitability.',
      category: 'Business'
    },
    {
      id: 'biz-005',
      statement: 'A unicorn startup is valued at over $1 billion.',
      answer: true,
      explanation: 'Unicorn startups are privately held companies valued at over $1 billion.',
      category: 'Business'
    },
    {
      id: 'biz-006',
      statement: 'The 80/20 rule (Pareto Principle) states that 80% of results come from 20% of efforts.',
      answer: true,
      explanation: 'The Pareto Principle suggests that roughly 80% of effects come from 20% of causes.',
      category: 'Business'
    },
    {
      id: 'biz-007',
      statement: 'A pivot means completely changing your business model.',
      answer: false,
      explanation: 'A pivot is a strategic change in direction, not necessarily a complete business model change.',
      category: 'Business'
    },
    {
      id: 'biz-008',
      statement: 'Product-market fit means your product perfectly matches market demand.',
      answer: true,
      explanation: 'Product-market fit occurs when a product satisfies a strong market demand.',
      category: 'Business'
    }
  ],
  marketing: [
    {
      id: 'mkt-001',
      statement: 'SEO stands for Search Engine Optimization.',
      answer: true,
      explanation: 'SEO is the practice of optimizing websites to rank higher in search engine results.',
      category: 'Marketing'
    },
    {
      id: 'mkt-002',
      statement: 'Email marketing has the highest ROI of all digital marketing channels.',
      answer: true,
      explanation: 'Email marketing consistently shows the highest ROI, often returning $42 for every $1 spent.',
      category: 'Marketing'
    },
    {
      id: 'mkt-003',
      statement: 'A/B testing requires at least 1000 participants to be statistically significant.',
      answer: false,
      explanation: 'Statistical significance depends on effect size and variance, not just sample size. Smaller tests can be significant.',
      category: 'Marketing'
    },
    {
      id: 'mkt-004',
      statement: 'Content marketing is more cost-effective than traditional advertising.',
      answer: true,
      explanation: 'Content marketing costs 62% less than traditional marketing and generates 3x more leads.',
      category: 'Marketing'
    },
    {
      id: 'mkt-005',
      statement: 'Social media marketing is only effective for B2C companies.',
      answer: false,
      explanation: 'Social media marketing is effective for both B2C and B2B companies, with LinkedIn being particularly strong for B2B.',
      category: 'Marketing'
    },
    {
      id: 'mkt-006',
      statement: 'The customer journey has three main stages: Awareness, Consideration, and Decision.',
      answer: true,
      explanation: 'These are the three primary stages of the customer journey funnel.',
      category: 'Marketing'
    },
    {
      id: 'mkt-007',
      statement: 'Influencer marketing is only effective on Instagram.',
      answer: false,
      explanation: 'Influencer marketing works across multiple platforms including YouTube, TikTok, LinkedIn, and Twitter.',
      category: 'Marketing'
    },
    {
      id: 'mkt-008',
      statement: 'Marketing automation can increase sales productivity by up to 14.5%.',
      answer: true,
      explanation: 'Marketing automation tools can significantly boost sales team productivity and lead conversion rates.',
      category: 'Marketing'
    }
  ],
  finance: [
    {
      id: 'fin-001',
      statement: 'Compound interest is interest calculated only on the principal amount.',
      answer: false,
      explanation: 'Compound interest is calculated on both the principal and previously earned interest.',
      category: 'Finance'
    },
    {
      id: 'fin-002',
      statement: 'The S&P 500 is an index of 500 large-cap U.S. stocks.',
      answer: true,
      explanation: 'The S&P 500 tracks 500 of the largest companies listed on U.S. stock exchanges.',
      category: 'Finance'
    },
    {
      id: 'fin-003',
      statement: 'Diversification reduces investment risk.',
      answer: true,
      explanation: 'Diversification spreads risk across different investments, reducing overall portfolio risk.',
      category: 'Finance'
    },
    {
      id: 'fin-004',
      statement: 'A bull market is characterized by falling stock prices.',
      answer: false,
      explanation: 'A bull market is characterized by rising stock prices and investor optimism.',
      category: 'Finance'
    },
    {
      id: 'fin-005',
      statement: 'The Federal Reserve sets the federal funds rate.',
      answer: true,
      explanation: 'The Federal Reserve\'s Federal Open Market Committee sets the target federal funds rate.',
      category: 'Finance'
    },
    {
      id: 'fin-006',
      statement: 'Cryptocurrency is regulated by the SEC in the United States.',
      answer: false,
      explanation: 'Cryptocurrency regulation is still evolving, with multiple agencies having jurisdiction including SEC, CFTC, and Treasury.',
      category: 'Finance'
    },
    {
      id: 'fin-007',
      statement: 'A 401(k) is a type of retirement savings account.',
      answer: true,
      explanation: 'A 401(k) is an employer-sponsored retirement savings plan with tax advantages.',
      category: 'Finance'
    },
    {
      id: 'fin-008',
      statement: 'Inflation reduces the purchasing power of money.',
      answer: true,
      explanation: 'Inflation causes prices to rise, which reduces how much goods and services money can buy.',
      category: 'Finance'
    }
  ],
  general: [
    {
      id: 'gen-001',
      statement: 'The capital of France is Paris.',
      answer: true,
      explanation: 'Paris has been the capital of France since the 6th century.',
      category: 'General'
    },
    {
      id: 'gen-002',
      statement: 'Sharks are mammals.',
      answer: false,
      explanation: 'Sharks are fish, not mammals. They breathe through gills.',
      category: 'General'
    },
    {
      id: 'gen-003',
      statement: 'The Great Wall of China is visible from space with the naked eye.',
      answer: false,
      explanation: 'The Great Wall is NOT visible from space with the naked eye. It\'s only visible from low Earth orbit with magnification.',
      category: 'General'
    },
    {
      id: 'gen-004',
      statement: 'Goldfish have a memory span of only 3 seconds.',
      answer: false,
      explanation: 'Goldfish actually have a memory span of several months and can be trained to perform tricks.',
      category: 'General'
    },
    {
      id: 'gen-005',
      statement: 'The human brain uses 20% of the body\'s energy.',
      answer: true,
      explanation: 'The brain uses approximately 20% of the body\'s total energy, despite being only 2% of body weight.',
      category: 'General'
    },
    {
      id: 'gen-006',
      statement: 'The speed of light is faster in water than in air.',
      answer: false,
      explanation: 'Light travels slower in water than in air due to the higher refractive index of water.',
      category: 'General'
    },
    {
      id: 'gen-007',
      statement: 'Mount Everest is the tallest mountain in the world.',
      answer: true,
      explanation: 'Mount Everest is the highest peak above sea level at 8,848 meters.',
      category: 'General'
    },
    {
      id: 'gen-008',
      statement: 'Bats are blind.',
      answer: false,
      explanation: 'Bats are not blind. They can see, but they rely heavily on echolocation for navigation.',
      category: 'General'
    }
  ]
};

export const TrueFalseGame: React.FC<TrueFalseGameProps> = ({ onComplete, onQuit, selectedCategories = ['general'] }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [showFeedback, setShowFeedback] = useState(false);
  const [results, setResults] = useState<TrueFalseResult[]>([]);
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  // Generate personalized questions based on selected categories
  const generatePersonalizedQuestions = (): TrueFalseQuestion[] => {
    const allQuestions: TrueFalseQuestion[] = [];
    
    // Add questions from each selected category
    selectedCategories.forEach(category => {
      const categoryQuestions = QUESTIONS_BY_CATEGORY[category as keyof typeof QUESTIONS_BY_CATEGORY] || [];
      allQuestions.push(...categoryQuestions);
    });
    
    // If no categories selected or no questions found, use general questions
    if (allQuestions.length === 0) {
      return QUESTIONS_BY_CATEGORY.general;
    }
    
    // Shuffle and take up to 20 questions
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 20);
  };

  const questions = generatePersonalizedQuestions();
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Timer effect
  useEffect(() => {
    if (showFeedback) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAnswer(null); // Time's up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showFeedback]);

  const handleAnswer = (answer: boolean | null) => {
    const timeSpent = 15 - timeRemaining;
    const isCorrect = answer === currentQuestion.answer;
    const pointsEarned = isCorrect ? 50 + Math.max(0, (15 - timeSpent) * 2) : 0;

    const result: TrueFalseResult = {
      questionId: currentQuestion.id,
      userAnswer: answer || false,
      correctAnswer: currentQuestion.answer,
      isCorrect,
      timeSpent,
      pointsEarned
    };

    setResults(prev => [...prev, result]);
    setSelectedAnswer(answer);
    setShowFeedback(true);

    // Auto-advance after 2 seconds
    setTimeout(() => {
      if (isLastQuestion) {
        onComplete([...results, result]);
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setTimeRemaining(15);
        setQuestionStartTime(Date.now());
      }
    }, 2000);
  };

  const totalPoints = results.reduce((sum, r) => sum + r.pointsEarned, 0);
  const correctAnswers = results.filter(r => r.isCorrect).length;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm">
              📊 FACT CHECK
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {currentQuestion.category}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Trophy className="h-4 w-4" />
              {totalPoints} pts
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4" />
              {correctAnswers}/{currentQuestionIndex}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              {timeRemaining}s
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
          >
            <Card className="border-2 border-gray-200">
              <CardContent className="p-8">
                {!showFeedback ? (
                  <>
                    {/* Question */}
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </h2>
                      <p className="text-xl text-gray-700 leading-relaxed">
                        "{currentQuestion.statement}"
                      </p>
                    </div>

                    {/* Answer Buttons */}
                    <div className="flex gap-4 justify-center">
                      <Button
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold"
                        onClick={() => handleAnswer(true)}
                      >
                        ✅ TRUE
                      </Button>
                      <Button
                        size="lg"
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold"
                        onClick={() => handleAnswer(false)}
                      >
                        ❌ FALSE
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Feedback */}
                    <div className="text-center">
                      <div className="mb-6">
                        {selectedAnswer === currentQuestion.answer ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-green-600 mb-2">
                              Correct! ✅
                            </h3>
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-red-600 mb-2">
                              Incorrect ❌
                            </h3>
                          </motion.div>
                        )}
                      </div>

                      <div className="mb-6">
                        <p className="text-lg text-gray-700 mb-4">
                          <strong>Answer:</strong> {currentQuestion.answer ? 'TRUE' : 'FALSE'}
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                          💡 {currentQuestion.explanation}
                        </p>
                      </div>

                      <div className="text-sm text-gray-500">
                        {isLastQuestion ? 'Final results loading...' : 'Next question in 2 seconds...'}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Quit Button */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200">
        <Button variant="outline" onClick={onQuit} className="w-full">
          Quit Game
        </Button>
      </div>
    </div>
  );
};