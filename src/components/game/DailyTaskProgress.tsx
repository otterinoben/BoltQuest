import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Target, Flame } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface DailyTaskProgressProps {
  completedTasks: number;
  totalTasks: number;
  currentStreak: number;
  nextTask?: {
    title: string;
    description: string;
    reward: string;
  };
  className?: string;
}

export const DailyTaskProgress: React.FC<DailyTaskProgressProps> = ({
  completedTasks,
  totalTasks,
  currentStreak,
  nextTask,
  className = ""
}) => {
  const progressPercentage = (completedTasks / totalTasks) * 100;
  const isComplete = completedTasks >= totalTasks;
  const isNearComplete = completedTasks >= totalTasks - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.4, duration: 0.5 }}
      className={`bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4 border border-blue-200 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-blue-900">
            Daily Progress
          </h3>
        </div>
        
        {/* Streak Badge */}
        <div className="flex items-center gap-1">
          <Flame className="h-4 w-4 text-orange-500" />
          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
            {currentStreak} day streak
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">
            {completedTasks}/{totalTasks} tasks complete
          </span>
          <span className={`font-semibold ${
            isComplete ? 'text-green-600' : 
            isNearComplete ? 'text-orange-600' : 
            'text-gray-600'
          }`}>
            {Math.round(progressPercentage)}%
          </span>
        </div>
        
        <Progress 
          value={progressPercentage} 
          className="h-2"
          indicatorColor={isComplete ? "from-green-500 to-green-400" : "from-blue-500 to-blue-400"}
        />
      </div>

      {/* Status Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.8, duration: 0.4 }}
        className="text-center"
      >
        {isComplete ? (
          <div className="flex items-center justify-center gap-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">All daily tasks complete! 🎉</span>
          </div>
        ) : isNearComplete ? (
          <div className="flex items-center justify-center gap-2 text-orange-700">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Almost there! 1 more task to go!</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-blue-700">
            <Target className="h-4 w-4" />
            <span className="text-sm font-medium">
              Keep going! {totalTasks - completedTasks} more tasks today
            </span>
          </div>
        )}
      </motion.div>

      {/* Next Task Preview */}
      {nextTask && !isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.2, duration: 0.4 }}
          className="mt-3 p-2 bg-white/50 rounded border border-blue-200"
        >
          <div className="text-xs text-gray-600 mb-1">Next task:</div>
          <div className="text-sm font-medium text-gray-800">{nextTask.title}</div>
          <div className="text-xs text-gray-500">{nextTask.reward}</div>
        </motion.div>
      )}

      {/* Completion Celebration */}
      {isComplete && (
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 3.0, duration: 0.5, ease: "backOut" }}
          className="mt-3 text-center"
        >
          <div className="text-lg">🏆</div>
          <div className="text-xs text-green-600 font-medium">
            Daily challenge complete!
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
