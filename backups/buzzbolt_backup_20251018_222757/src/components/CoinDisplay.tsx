import React, { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import { getCoinBalance } from '@/lib/coinSystem';

interface CoinDisplayProps {
  variant?: 'compact' | 'card' | 'detailed' | 'mobile';
  showAnimation?: boolean;
  className?: string;
}

const CoinDisplay: React.FC<CoinDisplayProps> = ({ 
  variant = 'card', 
  showAnimation = true,
  className = '' 
}) => {
  const [coinBalance, setCoinBalance] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousBalance, setPreviousBalance] = useState(0);

  useEffect(() => {
    const updateBalance = () => {
      const newBalance = getCoinBalance();
      if (newBalance !== coinBalance) {
        setPreviousBalance(coinBalance);
        setCoinBalance(newBalance);
        
        if (showAnimation && newBalance > coinBalance) {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 1000);
        }
      }
    };

    updateBalance();
    const interval = setInterval(updateBalance, 1000);

    return () => clearInterval(interval);
  }, [coinBalance, showAnimation]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Coins className={`w-4 h-4 text-yellow-500 ${isAnimating ? 'animate-bounce' : ''}`} />
        <span className="text-sm font-semibold text-gray-700">{formatNumber(coinBalance)}</span>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200 ${className}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center shadow-lg ${isAnimating ? 'animate-pulse' : ''}`}>
            <Coins className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-700">{formatNumber(coinBalance)}</div>
            <div className="text-sm text-yellow-600 font-medium">Total Coins</div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className={`bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200 ${className}`}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center shadow-lg ${isAnimating ? 'animate-pulse' : ''}`}>
            <Coins className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-700">{formatNumber(coinBalance)}</div>
            <div className="text-xs text-yellow-600 font-medium">Coins</div>
          </div>
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <div className={`bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg ${isAnimating ? 'animate-bounce' : ''}`}>
          <Coins className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="text-2xl font-bold text-yellow-700">{formatNumber(coinBalance)}</div>
          <div className="text-sm text-yellow-600 font-medium">Coins</div>
        </div>
      </div>
    </div>
  );
};

export default CoinDisplay;