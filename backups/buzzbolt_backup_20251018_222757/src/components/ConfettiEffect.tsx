import React, { useEffect, useState } from 'react';

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  size: number;
  velocityX: number;
  velocityY: number;
  rotationSpeed: number;
}

interface ConfettiEffectProps {
  trigger: boolean;
  duration?: number;
  particleCount?: number;
}

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ 
  trigger, 
  duration = 3000,
  particleCount = 50
}) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (trigger) {
      // Generate confetti particles
      const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
      
      const newParticles: ConfettiParticle[] = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 100, // Start above screen
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        size: Math.random() * 8 + 4, // 4-12px
        velocityX: (Math.random() - 0.5) * 6,
        velocityY: Math.random() * 2 + 3,
        rotationSpeed: (Math.random() - 0.5) * 10
      }));
      
      setParticles(newParticles);
      
      // Clear particles after duration
      const timer = setTimeout(() => {
        setParticles([]);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [trigger, duration, particleCount]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-sm"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            animation: `confettiFall ${duration}ms ease-in forwards`,
            animationDelay: `${Math.random() * 200}ms`,
            '--velocity-x': `${particle.velocityX}px`,
            '--velocity-y': `${particle.velocityY}px`,
            '--rotation-speed': `${particle.rotationSpeed}deg`
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default ConfettiEffect;

