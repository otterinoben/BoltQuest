import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Clock, 
  Flame, 
  Star, 
  CheckCircle2, 
  Circle, 
  Zap,
  Target,
  BookOpen,
  Gamepad2,
  Award,
  Users,
  Search,
  Timer,
  Play,
  X,
  Coins,
  Brain,
  BarChart3,
  TrendingUp,
  DollarSign,
  Globe,
  RefreshCw
} from 'lucide-react';
import { 
  getCurrentDailyTasks, 
  getDailyTaskStats, 
  getStreakMultiplier,
  getTimeUntilReset,
  getTaskCompletionPercentage,
  calculateTotalXpReward,
  rerollDailyTask
} from '@/lib/dailyTaskManager';
import { DailyTaskSet, DailyTaskStats } from '@/types/dailyTasks';
import { getUserLevelProgress, getLevelData } from '@/lib/xpLevelSystem';
import LevelDisplay from '@/components/LevelDisplay';

const DailyTasks = () => {
  const navigate = useNavigate();
  const [taskSet, setTaskSet] = useState<DailyTaskSet | null>(null);
  const [stats, setStats] = useState<DailyTaskStats | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [levelProgress, setLevelProgress] = useState<any>(null);
  const [rerollingTasks, setRerollingTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadDailyTasks();
    loadStats();
    loadLevelProgress();
    
    // Update time until reset every second
    const interval = setInterval(() => {
      setTimeUntilReset(getTimeUntilReset());
    }, 1000);
    
    // Refresh stats when page becomes visible (user returns from game)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadStats();
        loadLevelProgress();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadDailyTasks = () => {
    const tasks = getCurrentDailyTasks();
    setTaskSet(tasks);
  };

  const loadStats = () => {
    const dailyStats = getDailyTaskStats();
    console.log('Loading daily stats:', dailyStats);
    setStats(dailyStats);
  };

  const loadLevelProgress = () => {
    const progress = getUserLevelProgress();
    setLevelProgress(progress);
  };

  const handleStartGame = () => {
    navigate('/play');
  };

  const handleStartTaskGame = (task: any) => {
    // Build URL parameters based on task requirements
    const params = new URLSearchParams();
    
    // Set category if task requires specific category
    if (task.requirements.category) {
      params.set('category', task.requirements.category);
    }
    
    // Set difficulty if task requires specific difficulty
    if (task.requirements.difficulty) {
      params.set('difficulty', task.requirements.difficulty);
    }
    
    // Set mode if task requires specific mode
    if (task.requirements.mode) {
      params.set('mode', task.requirements.mode);
    }
    
    // Add task context for better UX
    params.set('taskId', task.id);
    params.set('taskTitle', task.title);
    
    // Navigate to play page with pre-configured settings
    navigate(`/play?${params.toString()}`);
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <Circle className="h-4 w-4 text-gray-500" />;
      case 'medium': return <Star className="h-4 w-4 text-gray-600" />;
      case 'hard': return <Trophy className="h-4 w-4 text-gray-700" />;
      default: return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return "bg-gray-100 text-gray-700 border-gray-200";
      case 'medium': return "bg-gray-200 text-gray-800 border-gray-300";
      case 'hard': return "bg-gray-300 text-gray-900 border-gray-400";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      score: <Target className="h-4 w-4" />,
      category: <BookOpen className="h-4 w-4" />,
      mode: <Gamepad2 className="h-4 w-4" />,
      accuracy: <Target className="h-4 w-4" />,
      streak: <Flame className="h-4 w-4" />,
      achievement: <Award className="h-4 w-4" />,
      time: <Timer className="h-4 w-4" />,
      social: <Users className="h-4 w-4" />,
      exploration: <Search className="h-4 w-4" />
    };
    return icons[category as keyof typeof icons] || <Circle className="h-4 w-4" />;
  };

  const handleRerollTask = async (taskId: string) => {
    console.log('Starting reroll for task:', taskId);
    setRerollingTasks(prev => new Set(prev).add(taskId));
    
    try {
      const success = rerollDailyTask(taskId);
      console.log('Reroll result:', success);
      
      if (success) {
        // Force reload tasks to show new one
        const newTasks = getCurrentDailyTasks();
        console.log('New tasks loaded:', newTasks);
        setTaskSet(newTasks);
      }
    } catch (error) {
      console.error('Error rerolling task:', error);
    } finally {
      setRerollingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const getTaskSpecificIcon = (task: any) => {
    // Return specific icons based on task content
    if (task.title.includes('Tech') || task.description.includes('Technology')) {
      return <Brain className="h-5 w-5 text-gray-600" />;
    }
    if (task.title.includes('Business') || task.description.includes('Business')) {
      return <BarChart3 className="h-5 w-5 text-gray-600" />;
    }
    if (task.title.includes('Marketing') || task.description.includes('Marketing')) {
      return <Target className="h-5 w-5 text-gray-600" />;
    }
    if (task.title.includes('Finance') || task.description.includes('Finance')) {
      return <DollarSign className="h-5 w-5 text-gray-600" />;
    }
    if (task.title.includes('General') || task.description.includes('General')) {
      return <Globe className="h-5 w-5 text-gray-600" />;
    }
    if (task.title.includes('Quick') || task.description.includes('Quick Play')) {
      return <Zap className="h-5 w-5 text-gray-600" />;
    }
    if (task.title.includes('Training') || task.description.includes('Training')) {
      return <BookOpen className="h-5 w-5 text-gray-600" />;
    }
    if (task.title.includes('Accuracy') || task.description.includes('accuracy')) {
      return <Target className="h-5 w-5 text-gray-600" />;
    }
    if (task.title.includes('Streak') || task.description.includes('consecutive')) {
      return <Flame className="h-5 w-5 text-gray-600" />;
    }
    if (task.title.includes('Achievement') || task.description.includes('achievement')) {
      return <Trophy className="h-5 w-5 text-gray-600" />;
    }
    if (task.title.includes('Early') || task.title.includes('Night') || task.title.includes('Morning')) {
      return <Clock className="h-5 w-5 text-gray-600" />;
    }
    if (task.title.includes('Share') || task.title.includes('Social')) {
      return <Users className="h-5 w-5 text-gray-600" />;
    }
    if (task.title.includes('Explore') || task.title.includes('Try')) {
      return <Search className="h-5 w-5 text-gray-600" />;
    }
    
    // Default icon based on category
    return getCategoryIcon(task.category);
  };

  if (!taskSet || !stats) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading daily tasks...</p>
        </div>
      </div>
    );
  }

  const completionPercentage = getTaskCompletionPercentage(taskSet);
  const streakMultiplier = getStreakMultiplier();
  const totalXpReward = calculateTotalXpReward(taskSet);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header with Points Display */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">Daily Tasks</h1>
            <p className="text-gray-600 text-lg">
              Complete challenges to earn XP and maintain your streak
            </p>
          </div>
          <div className="flex items-center gap-4">
            {levelProgress && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                <Trophy className="h-5 w-5 text-green-500" />
                <span className="text-gray-900 font-semibold">
                  Level {levelProgress.currentLevel}: {getLevelData(levelProgress.currentLevel)?.name}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
              <Coins className="h-5 w-5 text-green-500" />
              <span className="text-gray-900 font-semibold">Points: {stats.totalPointsEarned}</span>
            </div>
            <Button 
              onClick={handleStartGame}
              size="lg"
              className="bg-black hover:bg-gray-800 text-white px-6 py-3 text-lg font-semibold border-2 border-black"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Playing
            </Button>
          </div>
        </div>
        
        {/* Reset Timer */}
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">Next reset in:</span>
              <span className="font-mono font-bold text-green-600">
                {timeUntilReset.hours.toString().padStart(2, '0')}:
                {timeUntilReset.minutes.toString().padStart(2, '0')}:
                {timeUntilReset.seconds.toString().padStart(2, '0')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">{stats.currentStreak}</div>
                <div className="text-sm text-gray-600">Current Streak</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">{stats.longestStreak}</div>
                <div className="text-sm text-gray-600">Longest Streak</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">{completionPercentage}%</div>
                <div className="text-sm text-gray-600">Today's Progress</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">{totalXpReward}</div>
                <div className="text-sm text-gray-600">XP Reward</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <LevelDisplay variant="card" showProgress={true} showRewards={true} />

        {/* Streak Multiplier */}
        {streakMultiplier > 1 && (
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2">
                <Flame className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-600">Streak Multiplier:</span>
                <Badge variant="default" className="bg-green-500 text-white">
                  {streakMultiplier}x XP
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily Tasks */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-black">Today's Tasks</h2>
          
          <div className="space-y-4">
            {taskSet.tasks.map((task) => (
              <Card 
                key={task.id} 
                className={`border-gray-200 transition-all duration-200 hover:shadow-md ${
                  task.completed 
                    ? "bg-black text-white border-gray-300" 
                    : "bg-white"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Task Icon */}
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-lg ${
                        task.completed ? "bg-green-500" : "bg-gray-100"
                      }`}>
                        <div className={`h-5 w-5 ${
                          task.completed ? "text-white" : "text-gray-600"
                        }`}>
                          {getTaskSpecificIcon(task)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className={`font-semibold text-lg ${
                            task.completed ? "text-white" : "text-gray-900"
                          }`}>
                            {task.title}
                          </h3>
                          {task.completed && (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        
                        {/* Dismiss Button */}
                        {!task.completed && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <p className={`text-sm mb-4 ${
                        task.completed ? "text-gray-300" : "text-gray-600"
                      }`}>
                        {task.description}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className={task.completed ? "text-gray-300" : "text-gray-600"}>
                            Progress
                          </span>
                          <span className={task.completed ? "text-gray-300" : "text-gray-600"}>
                            {task.currentProgress}/{task.requirement}
                          </span>
                        </div>
                        <Progress 
                          value={(task.currentProgress / task.requirement) * 100} 
                          className="h-3"
                        />
                      </div>
                      
                      {/* Rewards and Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getDifficultyColor(task.difficulty)}`}
                          >
                            {getDifficultyIcon(task.difficulty)}
                            <span className="ml-1 capitalize">{task.difficulty}</span>
                          </Badge>
                          <div className="flex items-center gap-1 text-green-600">
                            <Coins className="h-3 w-3" />
                            <span className="text-sm font-semibold">{task.pointsReward} POINTS</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {task.completed ? (
                            <Button 
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Claimed
                            </Button>
                          ) : (
                            <>
                              <Button 
                                onClick={() => handleStartTaskGame(task)}
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white"
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Start
                              </Button>
                              <Button 
                                onClick={() => handleRerollTask(task.id)}
                                size="sm"
                                variant="outline"
                                disabled={rerollingTasks.has(task.id)}
                                className="border-gray-300 text-gray-600 hover:bg-gray-50"
                              >
                                <RefreshCw className={`h-4 w-4 mr-1 ${rerollingTasks.has(task.id) ? 'animate-spin' : ''}`} />
                                Reroll
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Completion Task */}
        {taskSet.completionTask && (
          <Card className={`border-gray-200 ${
            taskSet.completionTask.completed 
              ? "bg-black text-white border-gray-300" 
              : "bg-white"
          }`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${
                taskSet.completionTask.completed ? "text-white" : "text-gray-900"
              }`}>
                <div className={`p-2 rounded-lg ${
                  taskSet.completionTask.completed ? "bg-green-500" : "bg-gray-100"
                }`}>
                  <Trophy className={`h-6 w-6 ${
                    taskSet.completionTask.completed ? "text-white" : "text-gray-600"
                  }`} />
                </div>
                {taskSet.completionTask.title}
                {taskSet.completionTask.completed && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-sm mb-4 ${
                taskSet.completionTask.completed ? "text-gray-300" : "text-gray-600"
              }`}>
                {taskSet.completionTask.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 border-gray-300">
                    <Trophy className="h-3 w-3 mr-1" />
                    Completion Bonus
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <Coins className="h-4 w-4" />
                  <span className="text-lg font-semibold">{taskSet.completionTask.pointsReward} POINTS</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grace Period */}
        {stats.gracePeriodAvailable && !stats.gracePeriodUsed && (
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-semibold text-gray-700">Grace Period Available</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  If you miss a day, you can use your grace period to maintain your streak
                </p>
                <Button variant="outline" size="sm" className="text-gray-700 border-gray-500 hover:bg-gray-100">
                  Use Grace Period
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DailyTasks;
