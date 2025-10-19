import React from 'react';
import { motion } from 'framer-motion';
import { EloRankSystem, EloRankDisplay } from '@/lib/eloRankSystem';

interface EloRankEmblemProps {
  eloRankDisplay: EloRankDisplay;
  className?: string;
}

export const EloRankEmblem: React.FC<EloRankEmblemProps> = ({ 
  eloRankDisplay, 
  className = "" 
}) => {
  const { currentRank, lpGain, currentLP } = eloRankDisplay;
  const lpChangeColor = EloRankSystem.getLpChangeColor(lpGain);
  const lpChangeText = EloRankSystem.getLpChangeText(lpGain);

  return (
    <div className={`flex items-center justify-between w-full ${className}`}>
      {/* Left: Rank Emblem */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          duration: 0.8, 
          ease: "backOut",
          delay: 0.2 
        }}
        className="relative flex-shrink-0"
      >
        <div
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center relative overflow-hidden"
          style={EloRankSystem.getRankEmblemStyle(currentRank)}
        >
          {/* Emblem Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-gradient-to-br from-white/30 to-transparent"></div>
          </div>
          
          {/* Rank Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="text-lg sm:text-xl font-bold relative z-10"
          >
            {currentRank.icon}
          </motion.div>
          
          {/* Shine Effect */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ delay: 1, duration: 0.6 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </div>
        
        {/* Division Badge */}
        {currentRank.division && (
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.3 }}
            className="absolute -bottom-1 -right-1 bg-black text-white text-xs font-bold px-1 py-0.5 rounded-full border border-white"
          >
            {currentRank.division}
          </motion.div>
        )}
      </motion.div>

      {/* Center: Rank Info */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.4, duration: 0.4 }}
        className="flex-1 text-center px-3"
      >
        <div 
          className="text-sm sm:text-base font-bold uppercase tracking-wide"
          style={{ color: currentRank.color }}
        >
          {currentRank.tier}
        </div>
        <div className="text-xs text-gray-400">
          {currentRank.description}
        </div>
      </motion.div>

      {/* Right: LP Info */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.6, duration: 0.4 }}
        className="flex-shrink-0 text-right"
      >
        <div 
          className="text-lg sm:text-xl font-black tracking-tight"
          style={{ color: lpChangeColor }}
        >
          {lpChangeText}
        </div>
        <div className="text-xs text-gray-300">
          {currentLP} LP
        </div>
      </motion.div>
    </div>
  );
};

interface EloRankProgressProps {
  eloRankDisplay: EloRankDisplay;
  className?: string;
}

export const EloRankProgress: React.FC<EloRankProgressProps> = ({ 
  eloRankDisplay, 
  className = "" 
}) => {
  const { currentRank, nextRank, progressToNext } = eloRankDisplay;

  if (!nextRank) {
    return (
      <div className={`text-center ${className}`}>
        <div className="text-xs text-gray-400">
          {currentRank.tier} {currentRank.division} - Max Rank
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.8, duration: 0.4 }}
      className={`space-y-1 ${className}`}
    >
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{currentRank.tier} {currentRank.division}</span>
        <span>{nextRank.tier} {nextRank.division}</span>
      </div>
      
      <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressToNext}%` }}
          transition={{ delay: 2, duration: 0.8, ease: "easeOut" }}
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
  );
};
