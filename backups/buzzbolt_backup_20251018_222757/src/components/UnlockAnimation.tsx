import React, { useEffect, useState } from 'react';
import { ShopItem } from '@/types/shop';
import { 
  Gift, 
  Sparkles, 
  Star, 
  Zap, 
  Crown, 
  Gem,
  Award,
  CheckCircle
} from 'lucide-react';

interface UnlockAnimationProps {
  item: ShopItem;
  isVisible: boolean;
  onComplete: () => void;
}

const UnlockAnimation: React.FC<UnlockAnimationProps> = ({ item, isVisible, onComplete }) => {
  const [animationPhase, setAnimationPhase] = useState<'entering' | 'celebrating' | 'exiting'>('entering');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (!isVisible) return;

    // Generate particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 1000
    }));
    setParticles(newParticles);

    // Animation sequence
    const timer1 = setTimeout(() => setAnimationPhase('celebrating'), 500);
    const timer2 = setTimeout(() => setAnimationPhase('exiting'), 2500);
    const timer3 = setTimeout(() => onComplete(), 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isVisible, onComplete]);

  const getRarityColor = (rarity: ShopItem['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getRarityGlow = (rarity: ShopItem['rarity']) => {
    switch (rarity) {
      case 'common': return 'shadow-gray-200';
      case 'rare': return 'shadow-blue-200';
      case 'epic': return 'shadow-purple-200';
      case 'legendary': return 'shadow-yellow-200';
      default: return 'shadow-gray-200';
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      User: () => <div className="w-8 h-8 bg-gray-200 rounded-full" />,
      Palette: () => <div className="w-8 h-8 bg-blue-200 rounded-full" />,
      Trophy: () => <div className="w-8 h-8 bg-yellow-200 rounded-full" />,
      Settings: () => <div className="w-8 h-8 bg-gray-200 rounded-full" />,
      Zap: () => <div className="w-8 h-8 bg-blue-200 rounded-full" />,
      Coins: () => <div className="w-8 h-8 bg-yellow-200 rounded-full" />,
      Crown: () => <div className="w-8 h-8 bg-purple-200 rounded-full" />,
      Gem: () => <div className="w-8 h-8 bg-yellow-200 rounded-full" />,
    };
    return iconMap[iconName] || iconMap.User;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Particle Effects */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-ping"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}ms`,
            animationDuration: '2s'
          }}
        >
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </div>
      ))}

      {/* Main Animation Container */}
      <div className={`relative transform transition-all duration-500 ${
        animationPhase === 'entering' ? 'scale-75 opacity-0' :
        animationPhase === 'celebrating' ? 'scale-100 opacity-100' :
        'scale-75 opacity-0'
      }`}>
        {/* Outer Glow Ring */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 blur-xl opacity-75 animate-pulse ${getRarityGlow(item.rarity)}`} />
        
        {/* Main Card */}
        <div className="relative bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-8 text-center border-4 border-green-200 shadow-2xl min-w-[400px]">
          {/* Success Icon */}
          <div className="mb-6">
            <div className={`w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl animate-bounce ${getRarityGlow(item.rarity)}`}>
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-green-800 mb-2 animate-pulse">
              Congratulations!
            </h2>
            <p className="text-green-700 text-xl font-medium">
              You've unlocked a new item!
            </p>
          </div>
          
          {/* Item Display */}
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-xl border-2 border-green-200">
            <div className="flex items-center gap-6 mb-4">
              <div className={`w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center shadow-lg ${getRarityGlow(item.rarity)}`}>
                {(() => {
                  const IconComponent = getIconComponent(item.icon);
                  return <IconComponent />;
                })()}
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-black text-2xl mb-1">{item.name}</h3>
                <p className="text-gray-600 text-lg">{item.description}</p>
              </div>
            </div>
            
            {/* Rarity Badge */}
            <div className="flex items-center justify-center gap-2">
              {item.rarity === 'common' && <Star className="w-5 h-5 text-gray-500" />}
              {item.rarity === 'rare' && <Zap className="w-5 h-5 text-blue-500" />}
              {item.rarity === 'epic' && <Crown className="w-5 h-5 text-purple-500" />}
              {item.rarity === 'legendary' && <Gem className="w-5 h-5 text-yellow-500" />}
              <span className={`text-xl font-bold ${getRarityColor(item.rarity)}`}>
                {item.rarity.toUpperCase()} RARITY
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={onComplete}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Awesome!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnlockAnimation;

