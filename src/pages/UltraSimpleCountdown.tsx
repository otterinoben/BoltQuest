// Ultra Simple Countdown Test
// Just basic setTimeout logic

import React, { useState, useEffect } from 'react';

const UltraSimpleCountdown = () => {
  const [count, setCount] = useState(3);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (isRunning && count > 0) {
      console.log('Setting timeout for count:', count);
      const timer = setTimeout(() => {
        console.log('Timeout fired, count was:', count);
        setCount(count - 1);
      }, 1000);
      
      return () => {
        console.log('Cleaning up timer for count:', count);
        clearTimeout(timer);
      };
    } else if (count === 0 && isRunning) {
      console.log('Countdown finished!');
      setIsRunning(false);
    }
  }, [count, isRunning]);

  const startCountdown = () => {
    console.log('Starting countdown');
    setCount(3);
    setIsRunning(true);
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-4">Ultra Simple Countdown</h1>
      <div className="text-6xl font-bold text-blue-500 mb-4">{count}</div>
      <button 
        onClick={startCountdown}
        disabled={isRunning}
        className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {isRunning ? 'Running...' : 'Start Countdown'}
      </button>
      <div className="mt-4 text-sm text-gray-600">
        Check console for logs
      </div>
    </div>
  );
};

export default UltraSimpleCountdown;
