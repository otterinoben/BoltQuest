import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Brain, 
  BarChart3, 
  Activity, 
  Users, 
  Zap, 
  Target,
  Clock,
  TrendingUp,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Trash2
} from 'lucide-react';
import { getUserProfile } from '@/lib/userStorage';
import { getCoinBalance } from '@/lib/coinSystem';
import { AdaptiveDifficultyManager } from '@/lib/adaptiveDifficulty';
import { MicroSessionManager } from '@/lib/microSessions';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'warning' | 'error' | 'success';
  category: string;
  message: string;
  data?: any;
}

interface SystemMetrics {
  userLevel: number;
  userStreak: number;
  coinBalance: number;
  flowScore: number;
  isInFlow: boolean;
  currentDifficulty: string;
  sessionRecommendation: any;
  performanceHistory: any[];
}

const AdminDebugPanel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [adaptiveManager] = useState(() => new AdaptiveDifficultyManager());
  const [sessionManager] = useState(() => new MicroSessionManager());

  // Add log entry
  const addLog = (type: LogEntry['type'], category: string, message: string, data?: any) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      category,
      message,
      data
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep last 100 logs
  };

  // Update metrics
  const updateMetrics = () => {
    try {
      const userProfile = getUserProfile();
      const coinBalance = getCoinBalance();
      const flowState = adaptiveManager.getFlowState();
      const currentDifficulty = adaptiveManager.getCurrentDifficulty();
      const sessionRecommendation = sessionManager.getRecommendedSession();
      const performanceHistory = adaptiveManager.getUserProfile();

      setMetrics({
        userLevel: userProfile.level || 1,
        userStreak: userProfile.streak || 0,
        coinBalance,
        flowScore: flowState.flowScore,
        isInFlow: flowState.isInFlow,
        currentDifficulty,
        sessionRecommendation,
        performanceHistory
      });

      addLog('info', 'SYSTEM', 'Metrics updated successfully');
    } catch (error) {
      addLog('error', 'SYSTEM', 'Failed to update metrics', error);
    }
  };

  // Simulate performance data
  const simulatePerformance = () => {
    try {
      const mockPerformance = {
        accuracy: Math.random() * 0.4 + 0.3, // 30-70% accuracy
        responseTime: Math.random() * 2000 + 1000, // 1-3 seconds
        streak: Math.floor(Math.random() * 5),
        questionsAnswered: Math.floor(Math.random() * 10) + 1,
        timestamp: new Date()
      };

      adaptiveManager.updatePerformance(mockPerformance);
      addLog('success', 'PSYCHOLOGY', 'Performance data simulated', mockPerformance);
      updateMetrics();
    } catch (error) {
      addLog('error', 'PSYCHOLOGY', 'Failed to simulate performance', error);
    }
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
    addLog('info', 'SYSTEM', 'Logs cleared');
  };

  // Export logs
  const exportLogs = () => {
    const logData = {
      timestamp: new Date().toISOString(),
      logs: logs,
      metrics: metrics
    };
    
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boltquest-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    addLog('success', 'SYSTEM', 'Logs exported successfully');
  };

  // Initialize
  useEffect(() => {
    updateMetrics();
    addLog('info', 'SYSTEM', 'Admin Debug Panel initialized');
    
    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut to toggle panel
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!isVisible) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          className="bg-gray-800 hover:bg-gray-700 text-white shadow-lg"
        >
          <Settings className="w-4 h-4 mr-2" />
          Admin Debug
        </Button>
      </div>
    );
  }

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <CardTitle className="text-lg font-semibold">Admin Debug Panel</CardTitle>
            <Badge variant="outline" className="text-xs">
              Ctrl+Shift+D
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => simulatePerformance()}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Simulate
            </Button>
            <Button
              onClick={exportLogs}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
            <Button
              onClick={clearLogs}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
            <Button
              onClick={() => setIsVisible(false)}
              size="sm"
              variant="outline"
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="metrics" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="metrics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Metrics
              </TabsTrigger>
              <TabsTrigger value="psychology" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Psychology
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                System
              </TabsTrigger>
            </TabsList>

            <TabsContent value="metrics" className="space-y-4">
              {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold">User Profile</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Level:</span>
                          <span className="font-mono">{metrics.userLevel}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Streak:</span>
                          <span className="font-mono">{metrics.userStreak}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Coins:</span>
                          <span className="font-mono">{metrics.coinBalance}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="font-semibold">Flow State</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Flow Score:</span>
                          <span className="font-mono">{metrics.flowScore}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span>In Flow:</span>
                          <Badge variant={metrics.isInFlow ? "default" : "secondary"}>
                            {metrics.isInFlow ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Difficulty:</span>
                          <span className="font-mono">{metrics.currentDifficulty}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="font-semibold">Session</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="font-mono">{metrics.sessionRecommendation?.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span className="font-mono">{metrics.sessionRecommendation?.duration}s</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Questions:</span>
                          <span className="font-mono">{metrics.sessionRecommendation?.questions}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="psychology" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Adaptive Difficulty
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Current Difficulty:</span>
                        <span className="font-mono">{metrics?.currentDifficulty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span className="font-mono">
                          {metrics?.performanceHistory ? 
                            Math.round(metrics.performanceHistory.confidence * 100) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Performance Trend:</span>
                        <span className="font-mono">
                          {metrics?.performanceHistory?.performanceTrend || 'stable'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Micro Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Recommended:</span>
                        <span className="font-mono">{metrics?.sessionRecommendation?.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Difficulty:</span>
                        <span className="font-mono">{metrics?.sessionRecommendation?.difficulty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rewards:</span>
                        <span className="font-mono">
                          {metrics?.sessionRecommendation?.rewards?.baseXP || 0} XP
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <ScrollArea className="h-96 w-full">
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-3 rounded-lg border text-sm ${getLogColor(log.type)}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{getLogIcon(log.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {log.category}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {log.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="font-medium">{log.message}</p>
                          {log.data && (
                            <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No logs yet. Interact with the system to see activity.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">System Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Elevate Psychology:</span>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Adaptive Difficulty:</span>
                        <Badge variant="default">Enabled</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Micro Sessions:</span>
                        <Badge variant="default">Ready</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Flow Detection:</span>
                        <Badge variant="default">Monitoring</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button
                        onClick={simulatePerformance}
                        size="sm"
                        className="w-full"
                        variant="outline"
                      >
                        <RefreshCw className="w-3 h-3 mr-2" />
                        Simulate Performance
                      </Button>
                      <Button
                        onClick={updateMetrics}
                        size="sm"
                        className="w-full"
                        variant="outline"
                      >
                        <TrendingUp className="w-3 h-3 mr-2" />
                        Refresh Metrics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDebugPanel;
