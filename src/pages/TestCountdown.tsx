// Test Countdown Component
// Simple test to debug countdown issues

import React, { useState } from 'react';
import { SimpleCountdownTimer } from '@/components/loading/SimpleCountdownTimer';

const TestCountdown = () => {
  const [showTest, setShowTest] = useState(false);

  const handleComplete = () => {
    console.log('Countdown completed!');
    setShowTest(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Countdown Test</h1>
      
      <button 
        onClick={() => setShowTest(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Start Countdown Test
      </button>

      {showTest && (
        <SimpleCountdownTimer
          onComplete={handleComplete}
          duration={3}
          text="Testing Countdown"
          showGo={true}
        />
      )}
    </div>
  );
};

export default TestCountdown;
