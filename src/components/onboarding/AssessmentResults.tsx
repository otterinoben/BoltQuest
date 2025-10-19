// Assessment Results Display Component
// Shows baseline assessment results with ELO assignment

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Award,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { BaselineResults } from '@/lib/baselineAssessment';
import { Category } from '@/types/game';
import { ELO_CATEGORIES } from '@/lib/eloSystem';
import confetti from 'canvas-confetti';

interface AssessmentResultsProps {
  results: BaselineResults;
  onContinue: () => void;
}

export const AssessmentResults: React.FC<AssessmentResultsProps> = ({
  results,
  onContinue,
}) => {
  const [animatedAccuracy, setAnimatedAccuracy] = useState(0);

  // Animate accuracy percentage on mount
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = results.overallAccuracy / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= results.overallAccuracy) {
        setAnimatedAccuracy(results.overallAccuracy);
        clearInterval(timer);
        
        // Trigger confetti on completion
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        setAnimatedAccuracy(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [results.overallAccuracy]);

  // Get average ELO across categories
  const eloValues = Object.values(results.recommendedElo);
  const averageElo = Math.round(
    eloValues.reduce((sum, elo) => sum + elo, 0) / eloValues.length
  );

  // Get tier based on average ELO
  const getTier = (elo: number) => {
    for (const [key, category] of Object.entries(ELO_CATEGORIES)) {
      if (elo >= category.min && elo <= category.max) {
        return { name: category.label, color: category.color };
      }
    }
    return { name: 'Silver', color: 'gray' };
  };

  const tier = getTier(averageElo);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-500';
    if (accuracy >= 60) return 'text-blue-500';
    if (accuracy >= 40) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getAccuracyMessage = (accuracy: number) => {
    if (accuracy >= 80) return 'Outstanding! You really know your stuff!';
    if (accuracy >= 60) return 'Great job! Solid foundation!';
    if (accuracy >= 40) return 'Good start! Room to grow!';
    return 'Everyone starts somewhere! Let\'s improve together!';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-3xl space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Trophy className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Assessment Complete!</h1>
          <p className="text-lg text-muted-foreground">
            {getAccuracyMessage(results.overallAccuracy)}
          </p>
        </div>

        {/* Overall Score Card */}
        <Card className="shadow-xl border-2 border-primary/20">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-6">
              {/* Circular Progress */}
              <div className="relative w-40 h-40">
                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-gray-200"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - animatedAccuracy / 100)}`}
                    className={`transition-all duration-1000 ${getAccuracyColor(results.overallAccuracy)}`}
                    style={{ strokeLinecap: 'round' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`text-4xl font-bold ${getAccuracyColor(results.overallAccuracy)}`}>
                    {Math.round(animatedAccuracy)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
              </div>

              {/* Score Details */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-lg">
                    {results.totalCorrect} of {results.totalQuestions} correct
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ELO Assignment Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Your Starting Rank
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground mb-1">ELO Rating</p>
                <p className="text-3xl font-bold">{averageElo}</p>
              </div>
              <Badge 
                variant="secondary" 
                className="text-lg px-4 py-2 capitalize"
                style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
              >
                {tier.name}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Recommended Difficulty: 
                <Badge variant="outline" className="capitalize ml-1">
                  {results.recommendedDifficulty}
                </Badge>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(results.categoryScores).map(([category, scores]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="capitalize font-medium">{category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {scores.correct}/{scores.total}
                    </span>
                    <Badge 
                      variant="secondary"
                      className={`${
                        scores.accuracy >= 80 ? 'bg-green-100 text-green-700' :
                        scores.accuracy >= 60 ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {Math.round(scores.accuracy)}%
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={scores.accuracy} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  ELO: {results.recommendedElo[category as Category]}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="shadow-lg bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-2">You're all set!</p>
                <p className="text-sm text-muted-foreground">
                  We've personalized your experience based on your results. As you play, 
                  your ELO will adjust to match your skill level in each category.
                </p>
              </div>
            </div>
            <Button 
              size="lg" 
              className="w-full"
              onClick={onContinue}
            >
              Start Your Journey
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

