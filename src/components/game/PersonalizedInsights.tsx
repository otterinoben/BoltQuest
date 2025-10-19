import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Brain, Target, Lightbulb, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PersonalizedInsightsProps {
  insights: {
    strongestCategory: string;
    improvementArea: string;
    recommendedDifficulty: string;
    learningVelocity: number;
    accuracyTrend: 'up' | 'down' | 'stable';
    nextMilestone: string;
  };
  onRecommendationClick?: (recommendation: string) => void;
  className?: string;
}

export const PersonalizedInsights: React.FC<PersonalizedInsightsProps> = ({
  insights,
  onRecommendationClick,
  className = ""
}) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <TrendingUp className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.4, duration: 0.5 }}
      className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-900">
          Your Learning Insights
        </h3>
      </div>

      {/* Insights Grid */}
      <div className="space-y-3">
        {/* Strongest Category */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2.6, duration: 0.4 }}
          className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100"
        >
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-600">Strongest area:</span>
          </div>
          <span className="text-xs font-medium text-gray-900">
            {insights.strongestCategory}
          </span>
        </motion.div>

        {/* Improvement Area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2.8, duration: 0.4 }}
          className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-600">Focus on:</span>
          </div>
          <span className="text-xs font-medium text-gray-900">
            {insights.improvementArea}
          </span>
        </motion.div>

        {/* Accuracy Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 3.0, duration: 0.4 }}
          className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100"
        >
          <div className="flex items-center gap-2">
            {getTrendIcon(insights.accuracyTrend)}
            <span className="text-xs text-gray-600">Accuracy trend:</span>
          </div>
          <span className={`text-xs font-medium ${getTrendColor(insights.accuracyTrend)}`}>
            {insights.accuracyTrend === 'up' ? 'Improving' : 
             insights.accuracyTrend === 'down' ? 'Needs attention' : 'Stable'}
          </span>
        </motion.div>

        {/* Learning Velocity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 3.2, duration: 0.4 }}
          className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-600">Learning speed:</span>
          </div>
          <span className="text-xs font-medium text-gray-900">
            {insights.learningVelocity}% faster than average
          </span>
        </motion.div>
      </div>

      {/* Smart Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.4, duration: 0.4 }}
        className="mt-4 p-3 bg-gray-50 rounded border border-gray-100"
      >
        <div className="text-xs font-medium text-gray-800 mb-2">
          💡 Smart Recommendation
        </div>
        <div className="text-sm text-gray-700 mb-3">
          Try <strong>{insights.recommendedDifficulty}</strong> difficulty in <strong>{insights.improvementArea}</strong> to optimize your learning curve.
        </div>
        
        {onRecommendationClick && (
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => onRecommendationClick(`${insights.recommendedDifficulty} ${insights.improvementArea}`)}
          >
            <Target className="h-3 w-3 mr-1" />
            Start Recommended Game
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </motion.div>

      {/* Next Milestone */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.6, duration: 0.4 }}
        className="mt-3 text-center"
      >
        <div className="text-xs text-gray-500">
          Next milestone: <span className="font-medium text-gray-700">{insights.nextMilestone}</span>
        </div>
      </motion.div>
    </motion.div>
  );
};
