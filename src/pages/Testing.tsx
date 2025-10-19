// Testing Page for BoltQuest Phase 1 Features
// Comprehensive testing interface for micro-learning foundation

import React from 'react';
import TestingDashboard from '@/components/TestingDashboard';

const Testing = () => {
  const handleTestStart = (testType: string) => {
    console.log(`Starting ${testType} test`);
    // Additional test logic can be added here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TestingDashboard onStartTest={handleTestStart} />
    </div>
  );
};

export default Testing;
