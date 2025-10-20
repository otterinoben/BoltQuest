import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Target, Trophy, TrendingUp, BookOpen, Calendar, Flame, Sparkles, Play, Award, Clock, Gamepad2, Users, Search, Circle, CheckCircle2, ArrowRight as ArrowRightIcon, Star, Crown, Shield } from "lucide-react";
import { Coins } from "lucide-react";
import { getUserProfile } from "@/lib/userStorage";
import { getCurrentDailyTasks } from "@/lib/dailyTaskManager";
import { getGameHistoryByUserId } from "@/lib/gameHistoryStorage";
import { EloSystem } from "@/lib/eloSystem";
import { EloRankSystem } from "@/lib/eloRankSystem";
import { useUserData } from '@/contexts/UserDataContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { userData, isLoading, error } = useUserData();
  const [dailyTasks, setDailyTasks] = useState<any[]>([]);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [eloData, setEloData] = useState<any>(null);

  // Load daily tasks and recent games
  useEffect(() => {
    const loadAdditionalData = () => {
      try {
        // Load daily tasks
        const tasks = getCurrentDailyTasks();
        if (tasks && tasks.tasks) {
          setDailyTasks(tasks.tasks);
        }

        // Load recent games
        const games = getGameHistoryByUserId(userData?.id || 'default');
        setRecentGames(games.slice(0, 3));
      } catch (error) {
        console.error('Error loading additional dashboard data:', error);
      }
    };

    if (userData && !isLoading) {
      loadAdditionalData();
    }
  }, [userData, isLoading]);

  // Update ELO data in real-time
  useEffect(() => {
    const updateEloData = () => {
      try {
        const eloSystem = new EloSystem();
        
        // Initialize ELO data for existing users who don't have it
        eloSystem.initializeForExistingUser();
        
        const eloRating = eloSystem.getOverallRating();
        const eloRankDisplay = EloRankSystem.getEloRankDisplay(eloRating, 0);
        
        setEloData({
          rating: eloRating,
          rankDisplay: eloRankDisplay
        });
        
        // Debug logging
        console.log('🔄 ELO Update:', {
          rating: eloRating,
          rank: eloRankDisplay.currentRank.tier + ' ' + eloRankDisplay.currentRank.division
        });
      } catch (error) {
        console.error('Error updating ELO data:', error);
      }
    };

    // Update immediately
    updateEloData();

    // Update every 2 seconds for real-time feel
    const interval = setInterval(updateEloData, 2000);

    return () => clearInterval(interval);
  }, []);

  // Refresh data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && userData) {
        // Refresh daily tasks and recent games
        const tasks = getCurrentDailyTasks();
        if (tasks && tasks.tasks) {
          setDailyTasks(tasks.tasks);
        }

        const games = getGameHistoryByUserId(userData.id);
        setRecentGames(games.slice(0, 3));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [userData]);

  // ELO data with fallbacks
  const eloRating = eloData?.rating || 1000;
  const eloRankDisplay = eloData?.rankDisplay || EloRankSystem.getEloRankDisplay(1000, 0);

  // Calculate stats with fallbacks
  const level = userData?.level || 1;
  const totalXp = userData?.totalXp || 0;
  const coins = userData?.coins || 0;
  const streak = userData?.streak || 0;
  const totalGames = userData?.totalGamesPlayed || 0;
  const bestScore = userData?.bestScore || 0;
  const avgAccuracy = userData?.averageAccuracy || 0;

  // Calculate daily progress
  const completedTasks = dailyTasks.filter(task => task.completed).length;
  const dailyProgress = dailyTasks.length > 0 ? Math.round((completedTasks / dailyTasks.length) * 100) : 0;

  // ELO Rank Colors - Get color from EloRankSystem
  const getEloRankColor = (rankDisplay: any) => {
    if (!rankDisplay?.currentRank?.color) return 'text-gray-600';
    
    // Convert hex color to Tailwind text color class
    const color = rankDisplay.currentRank.color;
    
    // Map hex colors to Tailwind classes
    switch (color) {
      case '#8B4513': return 'text-gray-700'; // Iron - more grey/brown
      case '#CD7F32': return 'text-amber-700'; // Bronze - more brown than orange
      case '#C0C0C0': return 'text-gray-500'; // Silver
      case '#FFD700': return 'text-yellow-600'; // Gold
      case '#00CED1': return 'text-teal-600'; // Platinum - more blue/green mix
      case '#B9F2FF': return 'text-blue-500'; // Diamond
      case '#8A2BE2': return 'text-purple-600'; // Master
      case '#FF4500': return 'text-red-600'; // Grandmaster
      case '#FF8C00': return 'text-orange-500'; // Challenger (different from Gold)
      default: return 'text-gray-600';
    }
  };

  // Legacy ELO color function (keeping for compatibility)
  const getEloColor = (rating: number) => {
    if (rating >= 2000) return 'text-red-600';
    if (rating >= 1800) return 'text-purple-600';
    if (rating >= 1600) return 'text-cyan-600';
    if (rating >= 1400) return 'text-blue-600';
    if (rating >= 1200) return 'text-yellow-600';
    if (rating >= 1000) return 'text-gray-600';
    if (rating >= 800) return 'text-orange-600';
    return 'text-gray-500';
  };

  // ELO Rank Icons
  const getEloIcon = (rating: number) => {
    if (rating >= 2000) return <Crown className="h-5 w-5" />;
    if (rating >= 1800) return <Star className="h-5 w-5" />;
    if (rating >= 1600) return <Shield className="h-5 w-5" />;
    if (rating >= 1400) return <Trophy className="h-5 w-5" />;
    if (rating >= 1200) return <Award className="h-5 w-5" />;
    if (rating >= 1000) return <Target className="h-5 w-5" />;
    if (rating >= 800) return <Flame className="h-5 w-5" />;
    return <Circle className="h-5 w-5" />;
  };

  // Show loading state
  if (isLoading || !userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading dashboard: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-6">
        {/* Hero Section */}
        <div className="text-center py-8 sm:py-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Welcome back! 🎯
              </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Ready to level up your knowledge? Let's dive into some challenging questions!
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{level}</div>
              <div className="text-sm text-gray-500">Level</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <Coins className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{coins}</div>
              <div className="text-sm text-gray-500">Coins</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{streak}</div>
              <div className="text-sm text-gray-500">Streak</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl">{eloRankDisplay.currentRank.icon}</span>
              </div>
              <div className={`text-2xl font-bold ${getEloRankColor(eloRankDisplay)}`}>{eloRating}</div>
              <div className="text-sm text-gray-500">{eloRankDisplay.currentRank.tier} {eloRankDisplay.currentRank.division}</div>
            </div>
          </div>
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Match History */}
          <Card className="glass border-white/20 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Recent Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentGames.length > 0 ? (
                <div className="space-y-3">
                  {recentGames.slice(0, 3).map((game, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <Target className="h-3 w-3 text-blue-600" />
                  </div>
                        <div>
                          <p className="text-xs font-medium text-gray-900">{game.category || 'General'}</p>
                          <p className="text-xs text-gray-500">
                            {game.accuracy || 0}% • {game.score || 0} pts
                          </p>
                  </div>
                  </div>
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {new Date(game.timestamp || Date.now()).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-100">
                  <Button 
                    size="sm" 
                      variant="ghost" 
                      className="w-full text-xs h-6 p-0 hover:bg-gray-50"
                      onClick={() => navigate('/profile')}
                  >
                      View All Games
                      <ArrowRightIcon className="h-3 w-3 ml-1" />
                  </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Target className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 mb-2">No games yet</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-xs"
                    onClick={() => navigate('/play')}
                  >
                    Start First Game
                  </Button>
                </div>
              )}
                </CardContent>
              </Card>

          {/* Daily Tasks Preview */}
          <Card className="glass border-white/20 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Today's Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dailyTasks.length > 0 ? (
                <div className="space-y-2">
                  {dailyTasks.slice(0, 3).map((task, index) => (
                    <div key={task.id} className="flex items-center gap-2 text-xs">
                      <div className="flex-shrink-0">
                        {task.completed ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <Circle className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          <span className={`truncate ${task.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                            {task.title}
                          </span>
                        </div>
                        {!task.completed && (
                          <div className="mt-1">
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-green-600 h-1 rounded-full" 
                                style={{width: `${Math.min((task.currentProgress / task.requirement) * 100, 100)}%`}}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {task.currentProgress}/{task.requirement}
                            </div>
                          </div>
                        )}
                      </div>
                  </div>
                  ))}
                  <div className="pt-2 border-t border-gray-100">
                  <Button 
                    size="sm" 
                      variant="ghost" 
                      className="w-full text-xs h-6 p-0 hover:bg-gray-50"
                      onClick={() => navigate('/daily-tasks')}
                    >
                      View More
                      <ArrowRightIcon className="h-3 w-3 ml-1" />
                  </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-500 mb-2">No tasks available</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-xs"
                    onClick={() => navigate('/daily-tasks')}
                  >
                    View All Tasks
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass border-white/20 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  className="w-full justify-start btn-apple glass border-white/20 hover:border-white/40 hover:shadow-lg" 
                  variant="outline"
                  onClick={() => navigate('/play')}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Game
                </Button>
                <Button 
                  className="w-full justify-start btn-apple glass border-white/20 hover:border-white/40 hover:shadow-lg" 
                  variant="outline"
                  onClick={() => navigate('/daily-tasks')}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Daily Tasks
                </Button>
                <Button 
                  className="w-full justify-start btn-apple glass border-white/20 hover:border-white/40 hover:shadow-lg" 
                  variant="outline"
                  onClick={() => navigate('/achievements')}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Achievements
                </Button>
              </div>
                </CardContent>
              </Card>
            </div>

        {/* ELO Rank Display */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Your ELO Ranking</h2>
          <Card className="glass border-white/20 shadow-lg">
              <CardContent className="p-6">
              <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-gray-100">
                    <span className="text-3xl">{eloRankDisplay.currentRank.icon}</span>
                          </div>
                          <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {eloRankDisplay.currentRank.tier} {eloRankDisplay.currentRank.division}
                    </h3>
                    <p className={`text-sm ${getEloRankColor(eloRankDisplay)}`}>ELO Rating: {eloRating}</p>
                    <p className="text-xs text-gray-500">
                      {eloRankDisplay.currentRank.description}
                    </p>
                    {eloRankDisplay.nextRank && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress to {eloRankDisplay.nextRank.tier} {eloRankDisplay.nextRank.division}</span>
                          <span>{Math.round(eloRankDisplay.progressToNext)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{width: `${eloRankDisplay.progressToNext}%`}}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{totalGames}</div>
                  <div className="text-sm text-gray-500">Games Played</div>
                </div>
                  </div>
              </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;