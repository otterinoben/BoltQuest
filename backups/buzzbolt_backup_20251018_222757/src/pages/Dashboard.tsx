import EloDisplay from '@/components/EloDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Target, Trophy, TrendingUp, BookOpen, Calendar, Flame, Sparkles } from "lucide-react";
import { getUserProfile } from "@/lib/userStorage";
import { getGameHistoryByUserId } from "@/lib/gameHistoryStorage";
import { getCurrentDailyTasks, getDailyTaskStats, getTaskCompletionPercentage } from "@/lib/dailyTaskManager";
import TutorialManager from "@/components/tutorial/TutorialManager";
import LevelDisplay from "@/components/LevelDisplay";
import CoinDisplay from "@/components/CoinDisplay";
import { getCoinBalance } from "@/lib/coinSystem";
import { Coins } from "lucide-react";
import { useState, useEffect } from "react";
import { dashboardWidgetManager, DashboardWidget } from "@/lib/dashboardWidgets";
import { DashboardWidgetRenderer } from "@/components/dashboard/DashboardWidgetRenderer";
import { SmartNotificationCenter } from "@/components/notifications/SmartNotificationCenter";
import { HelpTrigger } from '@/components/help/HelpTrigger';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // State for reactive data
  const [userProfile, setUserProfile] = useState(getUserProfile());
  const [dailyTasks, setDailyTasks] = useState(getCurrentDailyTasks());
  const [dailyStats, setDailyStats] = useState(getDailyTaskStats());
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
    setDailyStats(stats);
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
    <div className="min-h-screen p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 animate-fade-in">
      {/* Tutorial Manager */}
      <TutorialManager pageId="dashboard" />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-4 sm:p-6 md:p-8 lg:p-12 shadow-elegant">
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground">
                Welcome to BoltQuest
              </h1>
              <div className="flex items-center gap-2">
                <HelpTrigger helpKey="dashboard-welcome" position="bottom">
                  <div className="text-sm text-gray-300 hover:text-white cursor-help">
                    What's this?
                  </div>
                </HelpTrigger>
                <SmartNotificationCenter onAction={handleWidgetAction} />
              </div>
            </div>
          <p className="text-sm sm:text-base md:text-lg text-primary-foreground/90 mb-6 sm:mb-8 max-w-2xl">
            Test your knowledge of buzzwords and industry jargon. Challenge yourself with time trials
            or practice in training mode.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4" data-tutorial="start-tutorial">
            <Button 
              size="lg" 
              variant="hero" 
              className="group"
              onClick={() => {
                // Smart Start - Use psychology and ELO to determine optimal settings
                const userProfile = getUserProfile();
                
                // Get ELO-based difficulty for tech category (default)
                const categoryRating = 1200; // Default ELO for new users
                const eloDifficulty = categoryRating < 1000 ? 'easy' : 
                                    categoryRating < 1400 ? 'medium' : 'hard';
                
                // Navigate with smart settings
                const params = new URLSearchParams({
                  mode: 'classic',
                  difficulty: eloDifficulty,
                  category: 'tech',
                  timer: '45'
                });
                
                navigate(`/game?${params.toString()}`);
              }}
            >
              <Zap className="mr-2 h-5 w-5 group-hover:animate-pulse-glow" />
              Smart Start
            </Button>
            <Link to="/play">
              <Button size="lg" variant="outline" className="bg-card/50 backdrop-blur-sm border-primary-foreground/30 text-primary-foreground hover:bg-card/70">
                <Target className="mr-2 h-5 w-5" />
                Customize Game
              </Button>
            </Link>
            <Link to="/play/training">
              <Button size="lg" variant="outline" className="bg-card/50 backdrop-blur-sm border-primary-foreground/30 text-primary-foreground hover:bg-card/70">
                <BookOpen className="mr-2 h-5 w-5" />
                Training Mode
              </Button>
            </Link>
            <Link to="/whats-new">
              <Button size="lg" variant="outline" className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-purple-400/50 text-primary-foreground hover:bg-purple-500/30">
                <Sparkles className="mr-2 h-5 w-5" />
                What's New
              </Button>
            </Link>
          </div>
        </div>
      </div>

        {/* Smart Dashboard Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {smartWidgets.slice(0, 4).map((widget) => (
            <DashboardWidgetRenderer
              key={widget.id}
              widget={widget}
              onAction={handleWidgetAction}
            />
          ))}
        </div>

        {/* Level Progress */}
        <div className="relative">
          <LevelDisplay variant="card" showProgress={true} showRewards={true} />
          <div className="absolute top-4 right-4">
            <HelpTrigger helpKey="dashboard-level" position="left" />
          </div>
        </div>

        {/* Coin Balance */}
        <div className="relative">
          <CoinDisplay variant="card" showProgress={true} showRewards={true} />
          <div className="absolute top-4 right-4">
            <HelpTrigger helpKey="dashboard-coins" position="left" />
          </div>
        </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="border-border shadow-elegant hover:shadow-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalGames}</div>
            <p className="text-xs text-muted-foreground mt-1">Games completed</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-elegant hover:shadow-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{avgScore}</div>
            <p className="text-xs text-muted-foreground mt-1">Keep improving!</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-elegant hover:shadow-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{bestScore}</div>
            <p className="text-xs text-muted-foreground mt-1">Personal record</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Scores */}
      <Card className="border-border shadow-elegant">
        <CardHeader>
          <CardTitle className="text-2xl">Recent Games</CardTitle>
          <CardDescription>Your last 5 game results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentGames.length > 0 ? (
              recentGames.slice(0, 5).map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-primary">{game.score}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {game.category}
                        </Badge>
                        <Badge
                          variant={
                            game.difficulty === "hard"
                              ? "destructive"
                              : game.difficulty === "medium"
                              ? "default"
                              : "secondary"
                          }
                          className="capitalize"
                        >
                          {game.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {game.correctAnswers}/{game.questionsAnswered} correct
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(game.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Math.floor(game.timeSpent / 60)}m {game.timeSpent % 60}s
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>No games played yet. Start your first game!</p>
                <Link to="/play">
                  <Button className="mt-4">
                    <Zap className="mr-2 h-4 w-4" />
                    Play Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Daily Tasks Widget */}
      {dailyTasks && (
        <Card className="border-primary/50 bg-gradient-primary shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary-foreground">
              <Calendar className="h-6 w-6" />
              Daily Tasks
              {dailyStats.currentStreak > 0 && (
                <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
                  <Flame className="h-3 w-3 mr-1" />
                  {dailyStats.currentStreak} day streak
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Complete daily challenges to earn XP and maintain your streak
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-foreground/80">Today's Progress</span>
                <span className="text-sm font-semibold text-primary-foreground">{dailyProgress}%</span>
              </div>
              <Progress value={dailyProgress} className="h-2" />
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-primary-foreground/80">
                  {dailyTasks.tasks.filter(t => t.completed).length} of {dailyTasks.tasks.length} tasks completed
                </span>
                <Link to="/daily-tasks">
                  <Button variant="outline" size="sm" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                    View All Tasks
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ELO Rating Display */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <EloDisplay variant="detailed" category="overall" />
      </div>

      {/* Quick Actions */}
      <Card className="border-accent/50 bg-gradient-accent shadow-glow">
        <CardHeader>
          <CardTitle className="text-2xl text-accent-foreground">Ready for More?</CardTitle>
          <CardDescription className="text-accent-foreground/80">
            Jump into a new challenge or review your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link to="/leaderboards">
              <Button variant="outline" className="bg-card/80 backdrop-blur-sm border-accent-foreground/30">
                <Trophy className="mr-2 h-4 w-4" />
                View Leaderboards
              </Button>
            </Link>
            <Link to="/analytics">
              <Button variant="outline" className="bg-card/80 backdrop-blur-sm border-accent-foreground/30">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

