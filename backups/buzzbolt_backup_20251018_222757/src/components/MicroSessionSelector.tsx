// Micro-Session Selection Component for BoltQuest
// Based on Elevate's bite-sized learning approach

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Target, 
  Clock, 
  Star, 
  TrendingUp, 
  Calendar,
  Flame,
  Brain,
  Award,
  Play
} from 'lucide-react';
import { MicroSessionManager, SessionType, SessionUtils, MICRO_SESSION_TYPES } from '@/lib/microSessions';
import { getUserProfile } from '@/lib/userStorage';

interface MicroSessionSelectorProps {
  onSessionSelect: (sessionType: SessionType) => void;
  onStartSession: (sessionId: string) => void;
}

const MicroSessionSelector: React.FC<MicroSessionSelectorProps> = ({
  onSessionSelect,
  onStartSession
}) => {
  const [sessionManager] = useState(() => new MicroSessionManager());
  const [availableSessions, setAvailableSessions] = useState<any[]>([]);
  const [recommendedSession, setRecommendedSession] = useState<any>(null);
  const [userStats, setUserStats] = useState({
    level: 1,
    streak: 0,
    totalSessions: 0
  });

  useEffect(() => {
    // Load user stats
    const userProfile = getUserProfile();
    if (userProfile) {
      const stats = {
        level: userProfile.level || 1,
        streak: userProfile.streak || 0,
        totalSessions: sessionManager.getSessionStats().totalSessions
      };
      setUserStats(stats);
      sessionManager.updateUserStats(stats.level, stats.streak);
    }

    // Get available sessions
    const sessions = sessionManager.getAvailableSessions();
    setAvailableSessions(sessions);
    
    // Get recommended session
    const recommended = sessionManager.getRecommendedSession();
    setRecommendedSession(recommended);
  }, []);

  const getSessionIcon = (type: SessionType) => {
    const icons = {
      [SessionType.QUICK_BOOST]: <Zap className="w-5 h-5" />,
      [SessionType.SKILL_BUILDER]: <TrendingUp className="w-5 h-5" />,
      [SessionType.MASTERY_TEST]: <Target className="w-5 h-5" />,
      [SessionType.DAILY_CHALLENGE]: <Calendar className="w-5 h-5" />,
      [SessionType.STREAK_MAINTAINER]: <Flame className="w-5 h-5" />,
      [SessionType.CONFIDENCE_BUILDER]: <Brain className="w-5 h-5" />
    };
    return icons[type];
  };

  const getSessionColor = (type: SessionType) => {
    const colors = {
      [SessionType.QUICK_BOOST]: 'text-yellow-600 bg-yellow-100',
      [SessionType.SKILL_BUILDER]: 'text-blue-600 bg-blue-100',
      [SessionType.MASTERY_TEST]: 'text-purple-600 bg-purple-100',
      [SessionType.DAILY_CHALLENGE]: 'text-green-600 bg-green-100',
      [SessionType.STREAK_MAINTAINER]: 'text-red-600 bg-red-100',
      [SessionType.CONFIDENCE_BUILDER]: 'text-orange-600 bg-orange-100'
    };
    return colors[type];
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      'adaptive': 'text-green-600 bg-green-100',
      'progressive': 'text-yellow-600 bg-yellow-100',
      'challenging': 'text-red-600 bg-red-100',
      'custom': 'text-purple-600 bg-purple-100'
    };
    return colors[difficulty] || 'text-gray-600 bg-gray-100';
  };

  const handleSessionClick = (sessionType: SessionType) => {
    onSessionSelect(sessionType);
    const session = MICRO_SESSION_TYPES[sessionType];
    onStartSession(session.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-black mb-2">Micro-Sessions</h2>
        <p className="text-gray-600">Bite-sized learning sessions designed for optimal engagement</p>
      </div>

      {/* Recommended Session */}
      {recommendedSession && (
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-green-600" />
              <CardTitle className="text-lg text-green-800">Recommended for You</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl ${getSessionColor(recommendedSession.type)}`}>
                {getSessionIcon(recommendedSession.type)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-black">{recommendedSession.description}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {recommendedSession.estimatedTime}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Target className="w-4 h-4" />
                    {recommendedSession.questions} questions
                  </div>
                  <Badge className={getDifficultyColor(recommendedSession.difficulty)}>
                    {recommendedSession.difficulty}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Rewards:</span> {recommendedSession.rewards.baseXP} XP • {recommendedSession.rewards.baseCoins} coins
              </div>
              <Button 
                onClick={() => handleSessionClick(recommendedSession.type)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Available Sessions */}
      <div>
        <h3 className="text-lg font-semibold text-black mb-4">All Sessions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableSessions.map((session) => (
            <Card 
              key={session.id} 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => handleSessionClick(session.type)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getSessionColor(session.type)} group-hover:scale-110 transition-transform`}>
                    {getSessionIcon(session.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-black mb-1">
                      {SessionUtils.getSessionTypeName(session.type)}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {session.description}
                    </p>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {session.estimatedTime}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Target className="w-3 h-3" />
                        {session.questions} Q
                      </div>
                      <Badge variant="outline" className={getDifficultyColor(session.difficulty)}>
                        {session.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {session.rewards.baseXP} XP • {session.rewards.baseCoins} coins
                      </div>
                      <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* User Stats */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-black">{userStats.level}</div>
                <div className="text-xs text-gray-600">Level</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-black">{userStats.streak}</div>
                <div className="text-xs text-gray-600">Streak</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-black">{userStats.totalSessions}</div>
                <div className="text-xs text-gray-600">Sessions</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Keep the momentum!</div>
              <div className="text-xs text-gray-500">Micro-sessions help maintain streaks</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MicroSessionSelector;
