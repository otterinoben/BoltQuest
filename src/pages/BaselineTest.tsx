// Standalone Baseline Assessment Test Page
// Accessible via /baseline-test for testing purposes

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BaselineAssessment } from '@/components/onboarding/BaselineAssessment';
import { AssessmentResults } from '@/components/onboarding/AssessmentResults';
import { BaselineResults, saveBaselineResults, initializeDefaultElo } from '@/lib/baselineAssessment';
import { getUserProfile } from '@/lib/userStorage';
import { Category } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Brain, Target } from 'lucide-react';

const BaselineTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [showAssessment, setShowAssessment] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<BaselineResults | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const profile = getUserProfile();
    setUserProfile(profile);
    
    if (!profile) {
      // If no profile exists, redirect to setup
      navigate('/');
      return;
    }
    
    // Auto-start the assessment
    setShowAssessment(true);
  }, [navigate]);

  const handleAssessmentComplete = (assessmentResults: BaselineResults) => {
    setResults(assessmentResults);
    setShowAssessment(false);
    setShowResults(true);
    
    // Save results (this will update the user's ELO)
    saveBaselineResults(userProfile.id, assessmentResults);
  };

  const handleAssessmentSkip = () => {
    // Initialize default ELO for skipped assessment
    const interests = userProfile?.preferences?.interests || ['tech'];
    initializeDefaultElo(userProfile.id, interests);
    
    setShowAssessment(false);
    navigate('/dashboard');
  };

  const handleResultsContinue = () => {
    navigate('/dashboard');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
            <p className="text-lg">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showAssessment) {
    return (
      <BaselineAssessment
        selectedInterests={userProfile.preferences?.interests || ['tech']}
        userId={userProfile.id}
        onComplete={handleAssessmentComplete}
        onSkip={handleAssessmentSkip}
      />
    );
  }

  if (showResults && results) {
    return (
      <AssessmentResults 
        results={results} 
        onContinue={handleResultsContinue}
      />
    );
  }

  // Fallback - should not reach here normally
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Target className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle>Baseline Assessment Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            This is a testing page for the baseline assessment system.
          </p>
          <Button 
            onClick={() => setShowAssessment(true)}
            className="w-full"
          >
            Start Assessment
          </Button>
          <Button 
            variant="outline" 
            onClick={handleBackToDashboard}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BaselineTestPage;
