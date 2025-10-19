import React, { useState } from 'react';
import { GameOverScreen } from '@/components/game/GameOverScreen';

const AutoReplayTest = () => {
  const [gameOverPhase, setGameOverPhase] = useState<'game-over' | 'complete'>('complete');
  
  const mockGameState = {
    score: 150,
    questionsAnswered: 12,
    timeRemaining: 0,
    answers: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    questionsSkipped: 2,
  };

  const mockConsecutiveStats = {
    currentStreak: 5,
  };

  const handleAutoReplay = () => {
    console.log('Auto-replay triggered!');
    alert('Auto-replay would start a new game!');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Auto-Replay Feature Test</h1>
        <p className="mb-4">This page demonstrates the auto-replay feature in the game over screen.</p>
        
        <div className="mb-4">
          <button 
            onClick={() => setGameOverPhase('game-over')}
            className="px-4 py-2 bg-red-500 text-white rounded mr-2"
          >
            Show GAME OVER Phase
          </button>
          <button 
            onClick={() => setGameOverPhase('complete')}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Show Complete Phase
          </button>
        </div>

        <GameOverScreen
          gameOverPhase={gameOverPhase}
          gameState={mockGameState}
          mode="quick"
          category="Technology"
          difficulty="medium"
          accuracy={85}
          longestCombo={7}
          consecutiveStats={mockConsecutiveStats}
          totalTime={60}
          onAutoReplay={handleAutoReplay}
        />
      </div>
    </div>
  );
};

export default AutoReplayTest;
