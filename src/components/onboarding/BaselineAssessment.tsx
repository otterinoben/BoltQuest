// Baseline Assessment Component
// Quick knowledge test after onboarding to establish ELO ratings

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Brain, 
  CheckCircle2, 
  XCircle, 
  Target,
  TrendingUp,
  Award,
  SkipForward,
  Zap
} from 'lucide-react';
import { Category } from '@/types/game';
import { 
  generateBaselineTest, 
  calculateBaselineResults,
  BaselineResults,
  BaselineQuestion
} from '@/lib/baselineAssessment';
import { AssessmentResults } from './AssessmentResults';

interface BaselineAssessmentProps {
  selectedInterests: Category[];
  userId: string;
  onComplete: (results: BaselineResults) => void;
  onSkip: () => void;
}

export const BaselineAssessment: React.FC<BaselineAssessmentProps> = ({
  selectedInterests,
  userId,
  onComplete,
  onSkip,
}) => {
  const [questions, setQuestions] = useState<BaselineQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<BaselineResults | null>(null);

  // Generate questions on mount
  useEffect(() => {
    const testQuestions = generateBaselineTest(selectedInterests, 5);
    setQuestions(testQuestions);
  }, [selectedInterests]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return; // Prevent changing answer during feedback
    
    setSelectedAnswer(answerIndex);
    setIsCorrect(answerIndex === currentQuestion.correctAnswer);
    setShowFeedback(true);

    // Auto-advance after showing feedback
    setTimeout(() => {
      handleNextQuestion(answerIndex);
    }, 1500);
  };

  const handleNextQuestion = (answerIndex: number) => {
    const newAnswers = [...userAnswers, answerIndex];
    setUserAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      // Test complete - calculate results
      const finalResults = calculateBaselineResults(questions, newAnswers);
      setResults(finalResults);
      setShowResults(true);
    }
  };

  const handleResultsContinue = () => {
    if (results) {
      onComplete(results);
    }
  };

  const handleSkipClick = () => {
    setShowSkipDialog(true);
  };

  const handleConfirmSkip = () => {
    setShowSkipDialog(false);
    onSkip();
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
            <p className="text-lg">Preparing your personalized assessment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults && results) {
    return (
      <AssessmentResults 
        results={results} 
        onContinue={handleResultsContinue}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-3xl space-y-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="h-6 w-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">Knowledge Assessment</h1>
          </div>
          <p className="text-muted-foreground">
            Let's establish your baseline to personalize your experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="shadow-xl animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="capitalize">
                {currentQuestion.category}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSkipClick}
                className="text-muted-foreground hover:text-foreground"
              >
                <SkipForward className="h-4 w-4 mr-1" />
                Skip Test
              </Button>
            </div>
            <CardTitle className="text-xl sm:text-2xl">
              {currentQuestion.buzzword}
            </CardTitle>
            <CardDescription className="text-base">
              What does this buzzword mean?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === currentQuestion.correctAnswer;
              const showCorrect = showFeedback && isCorrectAnswer;
              const showWrong = showFeedback && isSelected && !isCorrectAnswer;

              return (
                <Button
                  key={index}
                  variant="outline"
                  size="lg"
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback}
                  className={`w-full min-h-[60px] text-left justify-start transition-all duration-300 ${
                    showCorrect
                      ? 'bg-green-500 border-green-500 text-white hover:bg-green-500'
                      : showWrong
                      ? 'bg-red-500 border-red-500 text-white hover:bg-red-500'
                      : isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:bg-accent hover:border-accent-foreground'
                  }`}
                >
                  <span className="flex-1">{option}</span>
                  {showCorrect && (
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 ml-2" />
                  )}
                  {showWrong && (
                    <XCircle className="h-5 w-5 flex-shrink-0 ml-2" />
                  )}
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Benefits Reminder */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Why this matters</p>
                <p className="text-sm text-muted-foreground">
                  This 10-question test helps us match you with the perfect difficulty level and track your real progress.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skip Confirmation Dialog */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Skip Knowledge Assessment?
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
              <p>This quick 5-minute test helps us personalize your experience:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Accurate difficulty matching for optimal learning</span>
                </li>
                <li className="flex items-start gap-2">
                  <Brain className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>Better question recommendations based on your knowledge</span>
                </li>
                <li className="flex items-start gap-2">
                  <Award className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span>Track your real progress from your baseline</span>
                </li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="default" 
              onClick={() => setShowSkipDialog(false)}
              className="w-full sm:w-auto"
            >
              Take Quick Test (5 min)
            </Button>
            <Button 
              variant="outline" 
              onClick={handleConfirmSkip}
              className="w-full sm:w-auto"
            >
              Skip for Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

