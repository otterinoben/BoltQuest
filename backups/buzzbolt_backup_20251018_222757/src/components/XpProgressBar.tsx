import React, { useState, useEffect, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Star, Zap, Sparkles } from 'lucide-react';
import { getUserProgress, getLevelProgress } from '@/lib/xpLevelSystem';
import { SoundEffects } from '@/lib/soundEffects';
import ConfettiEffect from './ConfettiEffect';

interface XpProgressBarProps {
  variant?: 'compact' | 'detailed' | 'card' | 'mobile';
  showLevel?: boolean;
  showRewards?: boolean;
  animate?: boolean;
  className?: string;
}

export const XpProgressBar: React.FC<XpProgressBarProps> = ({
  variant = 'detailed',
  showLevel = true,
  showRewards = false,
  animate = true,
  className = ''
}) => {
  const [progress, setProgress] = useState(getUserProgress());
  const [levelProgress, setLevelProgress] = useState(getLevelProgress());
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [targetProgress, setTargetProgress] = useState(0);
  const [isAnimatingFill, setIsAnimatingFill] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [previousLevel, setPreviousLevel] = useState(progress.level);
  const [levelsGained, setLevelsGained] = useState(0);
  const [currentAnimationLevel, setCurrentAnimationLevel] = useState(0);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize sound effects
  useEffect(() => {
    SoundEffects.init();
  }, []);

  // Milestone levels for confetti
  const checkMilestone = (level: number) => {
    const milestones = [5, 10, 25, 50, 75, 100, 150, 200];
    return milestones.includes(level);
  };

  // Smooth animation for progress bar fill (3.5 second duration)
  useEffect(() => {
    if (isAnimatingFill && targetProgress !== animatedProgress) {
      const duration = 3500; // 3.5 seconds for dramatic effect
      const steps = 70; // Smooth 70-step animation
      const stepDuration = duration / steps;
      const increment = (targetProgress - animatedProgress) / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        setAnimatedProgress(prev => {
          const next = prev + increment;
          if (currentStep >= steps) {
            clearInterval(timer);
            return targetProgress;
          }
          return Math.min(100, Math.max(0, next));
        });
      }, stepDuration);
      
      return () => clearInterval(timer);
    }
  }, [targetProgress, animatedProgress, isAnimatingFill]);

  // Multi-level animation handler
  const animateMultipleLevels = (levelDiff: number, startLevel: number) => {
    setLevelsGained(levelDiff);
    setCurrentAnimationLevel(0);
    
    let currentLevel = 0;
    
    const animateNextLevel = () => {
      if (currentLevel < levelDiff) {
        // Start fill animation
        setIsAnimatingFill(true);
        setTargetProgress(100);
        SoundEffects.playWhoosh();
        
        // After bar fills, show level up
        setTimeout(() => {
          SoundEffects.playDing();
          setShowLevelUp(true);
          setCurrentAnimationLevel(currentLevel + 1);
          
          // Check if this level is a milestone
          const reachedLevel = startLevel + currentLevel + 1;
          if (checkMilestone(reachedLevel)) {
            SoundEffects.playCelebration();
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
          }
          
          // Hide level up popup
          setTimeout(() => {
            setShowLevelUp(false);
            setIsAnimatingFill(false);
            
            // Reset progress for next level
            setAnimatedProgress(0);
            setTargetProgress(0);
            
            currentLevel++;
            
            // Continue to next level or finish
            if (currentLevel < levelDiff) {
              setTimeout(animateNextLevel, 200);
            } else {
              // Animation complete
              setLevelsGained(0);
              setIsAnimatingFill(false);
            }
          }, 800);
        }, 3500); // Wait for fill animation to complete
      }
    };
    
    animateNextLevel();
  };

  // Single level-up animation
  const triggerLevelUpAnimation = (level: number) => {
    setIsAnimatingFill(true);
    
    // Calculate current progress percentage
    const currentProgress = levelProgress.xpToNext > 0 
      ? Math.round((levelProgress.currentXp / levelProgress.xpToNext) * 100)
      : 100;
    
    setAnimatedProgress(0);
    setTargetProgress(currentProgress);
    SoundEffects.playWhoosh();
    
    // Show level up after a delay
    setTimeout(() => {
      SoundEffects.playDing();
      setShowLevelUp(true);
      
      // Check for milestone
      if (checkMilestone(level)) {
        SoundEffects.playCelebration();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      
      setTimeout(() => {
        setShowLevelUp(false);
        setIsAnimatingFill(false);
      }, 2000);
    }, 1000);
  };

  // Listen for custom level change events from command executor
  useEffect(() => {
    const handleLevelChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.animate) {
        const { oldLevel, newLevel } = customEvent.detail;
        const levelDiff = newLevel - oldLevel;
        
        if (levelDiff > 1) {
          animateMultipleLevels(levelDiff, oldLevel);
        } else if (levelDiff === 1) {
          triggerLevelUpAnimation(newLevel);
        }
      }
    };
    
    window.addEventListener('xpLevelChanged', handleLevelChange);
    return () => window.removeEventListener('xpLevelChanged', handleLevelChange);
  }, []);

  // Refresh data every 2 seconds to stay current
  useEffect(() => {
    const interval = setInterval(() => {
      const newProgress = getUserProgress();
      const newLevelProgress = getLevelProgress();
      
      // Check if level changed (for natural gameplay)
      if (newProgress.level > previousLevel && !isAnimatingFill) {
        const levelDiff = newProgress.level - previousLevel;
        
        if (levelDiff > 1) {
          animateMultipleLevels(levelDiff, previousLevel);
        } else {
          triggerLevelUpAnimation(newProgress.level);
        }
        
        setPreviousLevel(newProgress.level);
      }
      
      setProgress(newProgress);
      setLevelProgress(newLevelProgress);
      
      // Update animated progress if not animating
      if (!isAnimatingFill) {
        const currentProgress = newLevelProgress.xpToNext > 0 
          ? Math.round((newLevelProgress.currentXp / newLevelProgress.xpToNext) * 100)
          : 100;
        setAnimatedProgress(currentProgress);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [previousLevel, isAnimatingFill]);

  // Calculate progress percentage for display
  const progressPercentage = isAnimatingFill 
    ? Math.round(animatedProgress) 
    : (levelProgress.xpToNext > 0 
        ? Math.round((levelProgress.currentXp / levelProgress.xpToNext) * 100)
        : 100);

  // Get variant-specific styling
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          container: 'flex items-center space-x-2',
          progress: 'flex-1 h-2',
          text: 'text-xs text-gray-600 min-w-[60px]'
        };
      case 'card':
        return {
          container: 'space-y-2',
          progress: 'h-3',
          text: 'text-sm text-gray-700'
        };
      case 'mobile':
        return {
          container: 'space-y-1',
          progress: 'h-2',
          text: 'text-xs text-gray-600'
        };
      default: // detailed
        return {
          container: 'space-y-3',
          progress: 'h-4',
          text: 'text-sm text-gray-700'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Confetti Effect for Milestones */}
      <ConfettiEffect trigger={showConfetti} duration={3000} particleCount={50} />

      {/* Level Up Animation Overlay */}
      {showLevelUp && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-8 py-4 rounded-full shadow-2xl animate-bounce">
            <div className="flex items-center space-x-2">
              <Star className="w-6 h-6 animate-spin" />
              <span className="text-xl font-bold">LEVEL UP!</span>
              <Star className="w-6 h-6 animate-spin" />
            </div>
            <div className="text-center text-sm mt-1">
              {levelsGained > 1 
                ? `Level ${previousLevel + currentAnimationLevel}!` 
                : `You reached level ${progress.level}!`}
            </div>
          </div>
        </div>
      )}

      {/* Level Display */}
      {showLevel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              Level {progress.level}
            </Badge>
            {showRewards && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Zap className="w-3 h-3" />
                <span>+{progress.level * 50} coins</span>
              </div>
            )}
          </div>
          
          {variant === 'detailed' && (
            <div className="text-xs text-gray-500">
              {progress.currentXp.toLocaleString()} / {levelProgress.xpToNext.toLocaleString()} XP
            </div>
          )}
        </div>
      )}

      {/* Progress Bar with Gradient Wave */}
      <div className="relative overflow-hidden">
        <Progress 
          value={progressPercentage} 
          className={`${styles.progress} transition-all duration-300`}
        />
        
        {/* Gradient Wave Effect */}
        {isAnimatingFill && (
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none animate-wave"
            style={{
              animation: 'wave 2s linear infinite'
            }}
          />
        )}
        
        {/* Animated sparkles on progress bar */}
        {isAnimatingFill && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 animate-ping">
              <Sparkles className="w-3 h-3 text-yellow-400" />
            </div>
            <div className="absolute top-0 left-1/2 animate-ping" style={{ animationDelay: '150ms' }}>
              <Sparkles className="w-3 h-3 text-orange-400" />
            </div>
            <div className="absolute top-0 left-3/4 animate-ping" style={{ animationDelay: '300ms' }}>
              <Sparkles className="w-3 h-3 text-red-400" />
            </div>
          </div>
        )}
      </div>

      {/* Progress Text */}
      <div className={`${styles.text} text-center`}>
        {variant === 'compact' ? (
          `${progressPercentage}%`
        ) : (
          `${progress.currentXp.toLocaleString()} / ${levelProgress.xpToNext.toLocaleString()} XP (${progressPercentage}%)`
        )}
      </div>

      {/* Next Level Preview */}
      {variant === 'detailed' && levelProgress.xpToNext > 0 && (
        <div className="text-xs text-gray-500 text-center">
          {levelProgress.xpToNext - progress.currentXp} XP to Level {progress.level + 1}
        </div>
      )}
    </div>
  );
};

export default XpProgressBar;
