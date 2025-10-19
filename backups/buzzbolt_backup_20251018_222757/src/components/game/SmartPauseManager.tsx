// src/components/game/SmartPauseManager.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Pause, Play, Clock, AlertTriangle, Zap } from 'lucide-react';
import { smartPauseSystem, PauseSession, PausePreferences } from '@/lib/smartPauseSystem';

interface SmartPauseManagerProps {
  gameId: string;
  gameState: any;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onShowPauseHistory: () => void;
}

export const SmartPauseManager: React.FC<SmartPauseManagerProps> = ({
  gameId,
  gameState,
  isPaused,
  onPause,
  onResume,
  onShowPauseHistory,
}) => {
  const [pauseSession, setPauseSession] = useState<PauseSession | null>(null);
  const [pauseDuration, setPauseDuration] = useState(0);
  const [preferences, setPreferences] = useState<PausePreferences>(smartPauseSystem.getPreferences());
  const [showPauseInsights, setShowPauseInsights] = useState(false);

  useEffect(() => {
    // Update pause session and duration
    const updatePauseInfo = () => {
      const session = smartPauseSystem.getCurrentPauseSession();
      setPauseSession(session);
      
      if (session) {
        setPauseDuration(smartPauseSystem.getPauseDuration());
      }
    };

    updatePauseInfo();
    const interval = setInterval(updatePauseInfo, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePause = () => {
    const session = smartPauseSystem.pauseGame(gameId, gameState);
    setPauseSession(session);
    onPause();
  };

  const handleResume = () => {
    const session = smartPauseSystem.resumeGame();
    setPauseSession(null);
    setPauseDuration(0);
    onResume();
  };

  const getPauseReasonIcon = (reason: string) => {
    switch (reason) {
      case 'manual': return <Pause className="h-4 w-4" />;
      case 'auto': return <Zap className="h-4 w-4" />;
      case 'tab_switch': return <AlertTriangle className="h-4 w-4" />;
      case 'inactivity': return <Clock className="h-4 w-4" />;
      case 'notification': return <AlertTriangle className="h-4 w-4" />;
      default: return <Pause className="h-4 w-4" />;
    }
  };

  const getPauseReasonColor = (reason: string) => {
    switch (reason) {
      case 'manual': return 'text-blue-600';
      case 'auto': return 'text-green-600';
      case 'tab_switch': return 'text-orange-600';
      case 'inactivity': return 'text-red-600';
      case 'notification': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPauseInsights = () => {
    return smartPauseSystem.getPauseInsights();
  };

  if (!isPaused) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={handlePause}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Pause className="h-4 w-4" />
          Pause
        </Button>
        
        {preferences.enabled && (
          <Badge variant="outline" className="text-xs">
            Smart Pause
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pause Status Card */}
      <Card className="border-orange-300 bg-orange-50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={getPauseReasonColor(pauseSession?.pauseReason || 'manual')}>
                {getPauseReasonIcon(pauseSession?.pauseReason || 'manual')}
              </div>
              <h3 className="font-semibold text-orange-800">Game Paused</h3>
            </div>
            <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
              {pauseSession?.pauseReason || 'manual'}
            </Badge>
          </div>

          <div className="space-y-3">
            {/* Pause Duration */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-orange-700">Pause Duration</span>
              <span className="text-lg font-bold text-orange-800">
                {formatDuration(pauseDuration)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-orange-600">
                <span>Pause Time</span>
                <span>{pauseDuration}s</span>
              </div>
              <Progress 
                value={Math.min((pauseDuration / 300) * 100, 100)} // 5 minutes max for visualization
                className="h-2"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleResume}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Resume Game
              </Button>
              <Button
                onClick={() => setShowPauseInsights(!showPauseInsights)}
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                Insights
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pause Insights */}
      {showPauseInsights && (
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Pause Insights</h4>
            {(() => {
              const insights = getPauseInsights();
              if (!insights) {
                return (
                  <p className="text-sm text-gray-500">No pause data available yet.</p>
                );
              }

              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {insights.averageDuration}s
                      </div>
                      <p className="text-xs text-gray-500">Avg Duration</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {insights.totalPauses}
                      </div>
                      <p className="text-xs text-gray-500">Total Pauses</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Most Common Reason</span>
                      <Badge variant="outline" className="text-xs">
                        {insights.mostCommonReason}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Recent Trend</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          insights.recentTrend === 'increasing' ? 'border-red-300 text-red-700' :
                          insights.recentTrend === 'decreasing' ? 'border-green-300 text-green-700' :
                          'border-gray-300 text-gray-700'
                        }`}
                      >
                        {insights.recentTrend}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    onClick={onShowPauseHistory}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    View Full History
                  </Button>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
