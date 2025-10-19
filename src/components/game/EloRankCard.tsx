import React from 'react';
import { motion } from 'framer-motion';
import { EloRankSystem, EloRankDisplay } from '@/lib/eloRankSystem';

interface EloRankCardProps {
  eloRankDisplay: EloRankDisplay;
  className?: string;
}

export const EloRankCard: React.FC<EloRankCardProps> = ({ 
  eloRankDisplay, 
  className = "" 
}) => {
  const { currentRank, lpGain, currentLP, nextRank, progressToNext } = eloRankDisplay;
  const lpChangeColor = EloRankSystem.getLpChangeColor(lpGain);
  const lpChangeText = EloRankSystem.getLpChangeText(lpGain);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className={`bg-white border border-gray-200 rounded-lg p-3 ${className}`}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={EloRankSystem.getRankEmblemStyle(currentRank)}
          >
            {currentRank.icon}
          </div>
          <div>
            <div 
              className="text-sm font-bold uppercase"
              style={{ color: currentRank.color }}
            >
              {currentRank.tier} {currentRank.division}
            </div>
            <div className="text-xs text-gray-500">
              {currentRank.description}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div 
            className="text-lg font-black"
            style={{ color: lpChangeColor }}
          >
            {lpChangeText}
          </div>
          <div className="text-xs text-gray-500">
            {currentLP} LP
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {nextRank && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="space-y-1"
        >
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{currentRank.tier} {currentRank.division}</span>
            <span>{nextRank.tier} {nextRank.division}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressToNext}%` }}
              transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ 
                background: `linear-gradient(90deg, ${currentRank.color}, ${nextRank.color})` 
              }}
            />
          </div>
          
          <div className="text-center text-xs text-gray-500">
            {Math.round(progressToNext)}% complete
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
