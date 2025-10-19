// Flow Feedback Component for BoltQuest
// Shows users when they're in optimal learning zone (based on Elevate's psychology)

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Target, TrendingUp, TrendingDown, Zap, AlertCircle, X } from 'lucide-react';

interface FlowFeedbackProps {
  flowState: {
    isInFlow: boolean;
    flowScore: number;
    optimalZone: boolean;
    recommendations: string[];
  };
  difficultyAdjustment?: {
    adjustmentReason: 'increase' | 'decrease' | 'maintain';
    confidence: number;
    performanceTrend: 'improving' | 'declining' | 'stable';
  };
  isVisible: boolean;
  onClose: () => void;
}

const FlowFeedback: React.FC<FlowFeedbackProps> = ({
  flowState,
  difficultyAdjustment,
  isVisible,
  onClose
}) => {
  if (!isVisible) return null;

  const getFlowIcon = () => {
    if (flowState.isInFlow) return <Brain className="w-5 h-5 text-green-500" />;
    if (flowState.flowScore > 70) return <Target className="w-5 h-5 text-blue-500" />;
    if (flowState.flowScore > 40) return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    return <TrendingDown className="w-5 h-5 text-red-500" />;
  };

  const getFlowColor = () => {
    if (flowState.isInFlow) return 'border-green-200 bg-green-50';
    if (flowState.flowScore > 70) return 'border-blue-200 bg-blue-50';
    if (flowState.flowScore > 40) return 'border-yellow-200 bg-yellow-50';
    return 'border-red-200 bg-red-50';
  };

  const getFlowMessage = () => {
    if (flowState.isInFlow) {
      return {
        title: 'Perfect Learning Zone! 🎯',
        subtitle: 'You\'re in the optimal flow state',
        color: 'text-green-700'
      };
    } else if (flowState.flowScore > 70) {
      return {
        title: 'Almost There! 📈',
        subtitle: 'You\'re close to optimal learning',
        color: 'text-blue-700'
      };
    } else if (flowState.flowScore > 40) {
      return {
        title: 'Adjusting Difficulty 🔄',
        subtitle: 'Finding your optimal level',
        color: 'text-yellow-700'
      };
    } else {
      return {
        title: 'Let\'s Find Your Zone 🎯',
        subtitle: 'We\'re adjusting to your skill level',
        color: 'text-red-700'
      };
    }
  };

  const message = getFlowMessage();

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <Card className={`w-80 border-2 ${getFlowColor()} shadow-lg`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {getFlowIcon()}
              <div>
                <h3 className={`font-semibold ${message.color}`}>
                  {message.title}
                </h3>
                <p className={`text-sm ${message.color} opacity-80`}>
                  {message.subtitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Flow Score Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Flow Score</span>
              <span className="text-sm font-bold text-gray-900">{flowState.flowScore}/100</span>
            </div>
            <Progress 
              value={flowState.flowScore} 
              className="h-2"
              style={{
                backgroundColor: flowState.isInFlow ? '#dcfce7' : '#f3f4f6'
              }}
            />
          </div>

          {/* Difficulty Adjustment Info */}
          {difficultyAdjustment && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                {difficultyAdjustment.adjustmentReason === 'increase' && (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                )}
                {difficultyAdjustment.adjustmentReason === 'decrease' && (
                  <TrendingDown className="w-4 h-4 text-blue-600" />
                )}
                {difficultyAdjustment.adjustmentReason === 'maintain' && (
                  <Target className="w-4 h-4 text-gray-600" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {difficultyAdjustment.adjustmentReason === 'increase' && 'Increasing Difficulty'}
                  {difficultyAdjustment.adjustmentReason === 'decrease' && 'Decreasing Difficulty'}
                  {difficultyAdjustment.adjustmentReason === 'maintain' && 'Maintaining Difficulty'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {difficultyAdjustment.performanceTrend}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {Math.round(difficultyAdjustment.confidence * 100)}% confidence
                </Badge>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {flowState.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations:</h4>
              <ul className="space-y-1">
                {flowState.recommendations.map((rec, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                    <Zap className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FlowFeedback;
