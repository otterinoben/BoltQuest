import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, 
  Target, 
  Trophy, 
  TrendingUp, 
  BookOpen, 
  Calendar, 
  Flame, 
  Sparkles, 
  Play,
  ArrowRight,
  Star,
  Clock,
  Award,
  BarChart3,
  Users,
  Settings
} from "lucide-react";
import { getUserProfile } from "@/lib/userStorage";
import { getGameHistoryByUserId } from "@/lib/gameHistoryStorage";
import { getCurrentDailyTasks, getDailyTaskStats, getTaskCompletionPercentage } from "@/lib/dailyTaskManager";
import TutorialManager from "@/components/tutorial/TutorialManager";
import LevelDisplay from "@/components/LevelDisplay";
import CoinDisplay from "@/components/CoinDisplay";
import { getCoinBalance } from "@/lib/coinSystem";
import { dashboardWidgetManager, DashboardWidget } from "@/lib/dashboardWidgets";
import { DashboardWidgetRenderer } from "@/components/dashboard/DashboardWidgetRenderer";
import { SmartNotificationCenter } from "@/components/notifications/SmartNotificationCenter";
import { HelpTrigger } from '@/components/help/HelpTrigger';
import { EloSystem } from '@/lib/eloSystem';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // State for reactive data
  const [userProfile, setUserProfile] = useState(getUserProfile());
  const [dailyTasks, setDailyTasks] = useState(getCurrentDailyTasks());
  const [dailyStats, setDailyTaskStats] = useState(getDailyTaskStats());
  const [recentGames, setRecentGames] = useState(getGameHistoryByUserId(userProfile.id).slice(0, 5));
  const [smartWidgets, setSmartWidgets] = useState<DashboardWidget[]>([]);
  
  // Function to refresh all data
  const refreshData = () => {
    const profile = getUserProfile();
    const tasks = getCurrentDailyTasks();
    const stats = getDailyTaskStats();
    const games = getGameHistoryByUserId(profile.id).slice(0, 5);
    
    setUserProfile(profile);
    setDailyTasks(tasks);
    setDailyTaskStats(stats);
    setRecentGames(games);
    
    // Refresh smart widgets
    const widgets = dashboardWidgetManager.refreshWidgets();
    setSmartWidgets(widgets);
  };
  
  // Initialize smart widgets
  useEffect(() => {
    const widgets = dashboardWidgetManager.generateWidgets();
    setSmartWidgets(widgets);
  }, []);

  // Auto-refresh data every 2 seconds
  useEffect(() => {
    const interval = setInterval(refreshData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Handle widget actions
  const handleWidgetAction = (action: string, data?: any) => {
    switch (action) {
      case 'quick_play':
        navigate('/play');
        break;
      case 'continue_game':
        navigate(`/game?resume=${data.gameId}`);
        break;
      case 'daily_challenge':
        navigate('/daily-tasks');
        break;
      case 'play_game':
        const params = new URLSearchParams();
        if (data.category && data.category !== 'any') params.set('category', data.category);
        if (data.difficulty && data.difficulty !== 'any') params.set('difficulty', data.difficulty);
        navigate(`/play?${params.toString()}`);
        break;
      case 'view_progress':
        navigate('/analytics');
        break;
      case 'view_daily_tasks':
        navigate('/daily-tasks');
        break;
      case 'view_achievements':
        navigate('/achievements');
        break;
      case 'achievement_hunt':
        navigate('/play');
        break;
      case 'view_leaderboards':
        navigate('/leaderboards');
        break;
      case 'view_community':
        navigate('/community');
        break;
      default:
        console.log('Unknown action:', action, data);
    }
  };
  
  // Calculate real stats
  const totalGames = userProfile.statistics.totalGamesPlayed;
  const totalScore = userProfile.statistics.totalScore;
  const avgScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0;
  const bestScore = userProfile.statistics.bestScore;
  const dailyProgress = dailyTasks ? getTaskCompletionPercentage(dailyTasks) : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Tutorial Manager */}
      <TutorialManager pageId="dashboard" />
      
      {/* Hero Section - Black/White with Color Accents */}
      <div className="relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Welcome Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
                Welcome to BoltQuest
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Master industry buzzwords and jargon through engaging quizzes. 
                Start smart, learn fast, climb the leaderboards.
              </p>
            </motion.div>

            {/* Primary Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 h-auto font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                onClick={() => navigate('/play')}
              >
                <Zap className="mr-3 h-6 w-6" />
                Start Playing
              </Button>
            </motion.div>

            {/* Quick Stats Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex justify-center items-center gap-8 text-gray-400"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{totalGames}</div>
                <div className="text-sm">Games Played</div>
              </div>
              <div className="w-px h-8 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{bestScore}</div>
                <div className="text-sm">Best Score</div>
              </div>
              <div className="w-px h-8 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{avgScore}</div>
                <div className="text-sm">Average</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-white">
        <div className="max-w-7xl mx-auto">
          
          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Level Progress */}
              <Card className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-black">Your Progress</h3>
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  </div>
                  <LevelDisplay variant="compact" showProgress={true} />
                </CardContent>
              </Card>

              {/* Coin Balance */}
              <Card className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-black">Coins Earned</h3>
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  <CoinDisplay variant="compact" showProgress={true} />
                </CardContent>
              </Card>

              {/* Daily Streak */}
              <Card className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-black">Daily Streak</h3>
                    <Flame className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-black mb-2">
                      {dailyStats.currentStreak || 0}
                    </div>
                    <p className="text-sm text-gray-600">Keep it going!</p>
                    <Progress value={dailyProgress} className="mt-3" />
                    <p className="text-xs text-gray-500 mt-2">{dailyProgress}% daily tasks complete</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-black mb-2">Quick Actions</h2>
              <p className="text-gray-600">Choose your next challenge</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <Play className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-black mb-2">Quick Play</h3>
                  <p className="text-sm text-gray-600 mb-4">Start with recommended settings</p>
                  <Button 
                    size="sm" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => navigate('/play')}
                  >
                    Play Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-black mb-2">Custom Game</h3>
                  <p className="text-sm text-gray-600 mb-4">Choose your own settings</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full border-green-600 text-green-600 hover:bg-green-50"
                    onClick={() => navigate('/play')}
                  >
                    Customize
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-black mb-2">Training Mode</h3>
                  <p className="text-sm text-gray-600 mb-4">Practice without pressure</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
                    onClick={() => navigate('/play/training')}
                  >
                    Practice
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-black mb-2">Daily Tasks</h3>
                  <p className="text-sm text-gray-600 mb-4">Complete daily challenges</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full border-orange-600 text-orange-600 hover:bg-orange-50"
                    onClick={() => navigate('/daily-tasks')}
                  >
                    View Tasks
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-black mb-2">Recent Activity</h2>
              <p className="text-gray-600">Your latest game results</p>
            </div>

            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6">
                {recentGames.length > 0 ? (
                  <div className="space-y-4">
                    {recentGames.slice(0, 3).map((game, index) => (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Trophy className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-black">
                              {game.category.charAt(0).toUpperCase() + game.category.slice(1)} Quiz
                            </div>
                            <div className="text-sm text-gray-600">
                              {game.difficulty} • {game.mode} • {new Date(game.completedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-black">{game.score}</div>
                          <div className="text-sm text-gray-600">points</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No games yet</h3>
                    <p className="text-gray-500 mb-4">Start your first game to see your results here!</p>
                    <Button 
                      onClick={() => navigate('/play')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Start Playing
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Explore More */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-black mb-4">Explore More</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => navigate('/leaderboards')}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Leaderboards
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => navigate('/achievements')}
              >
                <Award className="mr-2 h-4 w-4" />
                Achievements
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => navigate('/analytics')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Analytics
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => navigate('/whats-new')}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                What's New
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;