import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Zap, 
  BookOpen, 
  Clock, 
  Target, 
  TrendingUp, 
  Star, 
  Settings, 
  Play as PlayIcon, 
  Timer, 
  Award, 
  Brain, 
  BarChart3, 
  Users, 
  Trophy, 
  Shuffle, 
  Cpu, 
  Building2, 
  Megaphone, 
  DollarSign, 
  Globe, 
  Rocket, 
  GraduationCap, 
  TimerIcon, 
  Calendar,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Category, Difficulty } from '@/types/game';
import { mockQuestions } from '@/data/mockData';
import { getUserProfile } from '@/lib/userStorage';
import { getGameHistory } from '@/lib/gameHistoryStorage';
import TestingDashboard from '@/components/TestingDashboard';
import { AdaptiveDifficultyManager, DifficultyUtils } from '@/lib/adaptiveDifficulty';
import { MicroSessionManager, SessionType, SessionUtils } from '@/lib/microSessions';
import { EloSystem } from '@/lib/eloSystem';
import { userPreferencesManager, SmartRecommendation } from '@/lib/userPreferences';
import { QuickStartCard } from '@/components/play/QuickStartCard';
import { ProgressiveDisclosure } from '@/components/play/ProgressiveDisclosure';
import { TrueFalseGame } from '@/components/game/TrueFalseGame';
import { HelpTrigger } from '@/components/help/HelpTrigger';

// Define categories with icons
const categories = [
  { value: 'tech' as Category, label: 'Technology', icon: Cpu, color: 'blue' },
  { value: 'business' as Category, label: 'Business', icon: Building2, color: 'green' },
  { value: 'marketing' as Category, label: 'Marketing', icon: Megaphone, color: 'purple' },
  { value: 'finance' as Category, label: 'Finance', icon: DollarSign, color: 'orange' },
  { value: 'general' as Category, label: 'General', icon: Globe, color: 'gray' }
];

// Define difficulties with clean styling
const difficulties = [
  { value: 'easy' as Difficulty, label: 'Easy', description: 'Perfect for beginners', color: 'green' },
  { value: 'medium' as Difficulty, label: 'Medium', description: 'Balanced challenge', color: 'blue' },
  { value: 'hard' as Difficulty, label: 'Hard', description: 'Expert level', color: 'red' },
  { value: 'custom' as Difficulty, label: 'Custom', description: 'Set your own rules', color: 'purple', isCustom: true }
];

const Play = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'custom'>('medium');
  const [mode, setMode] = useState<'quick' | 'training' | 'classic' | 'truefalse'>('classic');
  const [timerPreset, setTimerPreset] = useState<number>(45);
  const [showWizard, setShowWizard] = useState(false);
  const [favorites, setFavorites] = useState<Array<{id: string, name: string, category: Category, difficulty: Difficulty | 'custom', mode: 'quick' | 'training' | 'classic', timer: number}>>([]);
  const [taskContext, setTaskContext] = useState<{id: string, title: string} | null>(null);
  const [smartRecommendation, setSmartRecommendation] = useState<SmartRecommendation | null>(null);
  const [userType, setUserType] = useState<'new' | 'returning' | 'power'>('new');
  const [showProgressiveDisclosure, setShowProgressiveDisclosure] = useState(true);

  // Elevate Psychology System (Hidden - works behind the scenes)
  const [adaptiveManager] = useState(() => new AdaptiveDifficultyManager());
  const [sessionManager] = useState(() => new MicroSessionManager());
  const [eloSystem] = useState(() => new EloSystem());

  // Initialize Elevate Psychology System (Hidden)
  useEffect(() => {
    const userProfile = getUserProfile();
    if (userProfile) {
      sessionManager.updateUserStats(userProfile.level || 1, userProfile.streak || 0);
    }
  }, []);

  // Load favorites from localStorage, check for tutorial, and load user preferences
  useEffect(() => {
    const savedFavorites = localStorage.getItem('boltquest_favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    
    // Load user preferences for default settings
    try {
      const userProfile = getUserProfile();
      const gameHistory = getGameHistory();
      
      // Determine user type based on profile and history
      if (gameHistory.length === 0) {
        setUserType('new');
      } else if (gameHistory.length < 10) {
        setUserType('returning');
      } else {
        setUserType('power');
      }
      
      // Get smart recommendation
      const recommendation = userPreferencesManager.getSmartRecommendation();
      setSmartRecommendation(recommendation);
      
      // Apply smart defaults if enabled
      if (userProfile?.preferences?.smartDefaults?.enabled && recommendation) {
        const categories = recommendation.category ? [recommendation.category as Category] : ['tech'];
        setSelectedCategories(categories);
        setSelectedDifficulty(recommendation.difficulty as Difficulty || 'medium');
        setMode(recommendation.mode || 'classic');
        setTimerPreset(recommendation.timer || 45);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  }, []);

  const saveFavorites = (newFavorites: typeof favorites) => {
    setFavorites(newFavorites);
    localStorage.setItem('boltquest_favorites', JSON.stringify(newFavorites));
  };

  const handleQuickStart = () => {
    if (smartRecommendation) {
      const params = new URLSearchParams({
        category: smartRecommendation.category || 'tech',
        difficulty: smartRecommendation.difficulty || 'medium',
        mode: smartRecommendation.mode || 'classic',
        timer: (smartRecommendation.timer || 45).toString()
      });
      navigate(`/game?${params.toString()}`);
    }
  };

  const handleCustomize = () => {
    setShowProgressiveDisclosure(false);
  };

  const handleAdvanced = () => {
    setShowProgressiveDisclosure(false);
  };

  const startWizard = () => {
    setShowWizard(true);
  };

  const toggleCategory = (category: Category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(cat => cat !== category);
      } else if (prev.length < 3) {
        return [...prev, category];
      }
      return prev;
    });
  };

  const startRandomGame = () => {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)].value;
    const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
    const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const timers = [30, 45, 60];
    const randomTimer = timers[Math.floor(Math.random() * timers.length)];
    
    setSelectedCategories([randomCategory]);
    setSelectedDifficulty(randomDifficulty);
    setTimerPreset(randomTimer);
    setMode('quick');
  };

  const addToFavorites = () => {
    const newFavorite = {
      id: Date.now().toString(),
      name: `${selectedCategories.map(cat => categories.find(c => c.value === cat)?.label).join(', ')} - ${selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}`,
      category: selectedCategories[0],
      difficulty: selectedDifficulty,
      mode: mode,
      timer: timerPreset
    };
    const newFavorites = [...favorites, newFavorite];
    saveFavorites(newFavorites);
  };

  const removeFavorite = (id: string) => {
    const newFavorites = favorites.filter(fav => fav.id !== id);
    saveFavorites(newFavorites);
  };

  const loadFavorite = (favorite: typeof favorites[0]) => {
    setSelectedCategories([favorite.category]);
    setSelectedDifficulty(favorite.difficulty);
    setMode(favorite.mode);
    setTimerPreset(favorite.timer);
    navigate(`/game?category=${favorite.category}&difficulty=${favorite.difficulty}&mode=${favorite.mode}&timer=${favorite.timer}`);
  };

  const startGame = () => {
    if (mode === 'truefalse') {
      // True/False mode - require at least one category
      if (selectedCategories.length === 0) {
        return;
      }
      
      // True/False mode - pass selected categories
      const categoriesParam = `categories=${selectedCategories.join(',')}`;
      navigate(`/game?mode=truefalse&${categoriesParam}`);
      return;
    }

    if (selectedCategories.length === 0) {
      return;
    }

    const params = new URLSearchParams();
    params.set('category', selectedCategories[0]);
    params.set('difficulty', selectedDifficulty);
    params.set('mode', mode);
    params.set('timer', timerPreset.toString());
    
    navigate(`/game?${params.toString()}`);
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      green: 'bg-green-100 text-green-600 border-green-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200',
      orange: 'bg-orange-100 text-orange-600 border-orange-200',
      gray: 'bg-gray-100 text-gray-600 border-gray-200',
      red: 'bg-red-100 text-red-600 border-red-200'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Task Context Banner - Fixed Height */}
        <div className="flex-shrink-0">
          {taskContext && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 border-b border-gray-200"
            >
            <div className="max-w-6xl mx-auto px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="h-4 w-4 text-gray-600" />
                  <div>
                    <h3 className="font-semibold text-black text-sm">Daily Task Active</h3>
                    <p className="text-xs text-gray-600">{taskContext.title}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/daily-tasks')}
                  className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 text-xs px-3 py-1"
                >
                  View Tasks
                </Button>
              </div>
            </div>
            </motion.div>
          )}
        </div>

        {/* Hero Section - Compact */}
        <div className="relative bg-black flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-4"
              >
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                  Set Up Your Game
                </h1>
                <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
                  Choose your categories, difficulty, and game mode.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Content - Flexible */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-4 bg-white overflow-hidden">
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            
            {/* Category Selection - Compact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6 flex-shrink-0"
            >
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-black mb-1">Choose Your Focus</h2>
                <p className="text-sm text-gray-600">Select up to 3 categories</p>
                <div className="h-8 flex items-center justify-center mt-1 overflow-hidden">
                  <AnimatePresence mode="wait">
                    {selectedCategories.length === 0 ? (
                      <motion.p
                        key="validation"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="text-xs text-red-500 font-medium text-center leading-tight whitespace-nowrap"
                      >
                        {mode === 'truefalse' ? 'Select topics for Fact Check questions' : 'Please select at least one category'}
                      </motion.p>
                    ) : (
                      <motion.div
                        key="badge"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                      >
                        <Badge variant="secondary" className="text-xs">
                          {selectedCategories.length}/3 selected
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {categories.map((cat, index) => {
                  const Icon = cat.icon;
                  const totalQuestions = Object.values(mockQuestions[cat.value]).reduce((sum, questions) => sum + questions.length, 0);
                  const isSelected = selectedCategories.includes(cat.value);
                  const canSelect = selectedCategories.length < 3 || isSelected;
                  
                  return (
                    <motion.div
                      key={cat.value}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                          isSelected 
                            ? 'border-black bg-black text-white shadow-lg' 
                            : canSelect 
                            ? 'border-gray-200 bg-white hover:border-gray-300' 
                            : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        }`}
                        onClick={() => canSelect && toggleCategory(cat.value)}
                      >
                        <CardContent className="p-3 text-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                            isSelected 
                              ? 'bg-white' 
                              : getColorClasses(cat.color).split(' ')[0]
                          }`}>
                            <Icon className={`h-4 w-4 ${
                              isSelected 
                                ? 'text-black' 
                                : getColorClasses(cat.color).split(' ')[1]
                            }`} />
                          </div>
                          <h3 className={`font-semibold text-xs mb-1 ${
                            isSelected ? 'text-white' : 'text-black'
                          }`}>
                            {cat.label}
                          </h3>
                          <p className={`text-xs ${
                            isSelected ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {totalQuestions}
                          </p>
                          {isSelected && (
                            <div className="mt-1">
                              <CheckCircle2 className="h-3 w-3 text-white mx-auto" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Game Settings - Compact Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-6 flex-shrink-0"
            >
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-black mb-1">Game Settings</h2>
                <p className="text-sm text-gray-600">Customize your challenge</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Difficulty */}
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-1 text-black text-sm">
                      <Target className="h-4 w-4" />
                      Difficulty
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-1">
                      {difficulties.map((diff) => (
                        <Button
                          key={diff.value}
                          variant={selectedDifficulty === diff.value ? "default" : "outline"}
                          className={`h-auto p-2 text-xs ${
                            selectedDifficulty === diff.value
                              ? 'bg-black text-white hover:bg-gray-800'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedDifficulty(diff.value)}
                        >
                          <div className="text-center">
                            <div className="font-semibold">{diff.label}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Game Mode */}
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-1 text-black text-sm">
                      <PlayIcon className="h-4 w-4" />
                      Mode
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1">
                      <Button
                        variant={mode === 'quick' ? "default" : "outline"}
                        className={`w-full justify-start h-auto p-2 text-xs ${
                          mode === 'quick'
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setMode('quick')}
                      >
                        <div className="flex items-center gap-2">
                          <Zap className="h-3 w-3" />
                          <span>Quick</span>
                        </div>
                      </Button>
                      <Button
                        variant={mode === 'classic' ? "default" : "outline"}
                        className={`w-full justify-start h-auto p-2 text-xs ${
                          mode === 'classic'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setMode('classic')}
                      >
                        <div className="flex items-center gap-2">
                          <Trophy className="h-3 w-3" />
                          <span>Classic</span>
                        </div>
                      </Button>
                      <Button
                        variant={mode === 'training' ? "default" : "outline"}
                        className={`w-full justify-start h-auto p-2 text-xs ${
                          mode === 'training'
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setMode('training')}
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-3 w-3" />
                          <span>Training</span>
                        </div>
                      </Button>
                      <Button
                        variant={mode === 'truefalse' ? "default" : "outline"}
                        className={`w-full justify-start h-auto p-2 text-xs ${
                          mode === 'truefalse'
                            ? 'bg-orange-600 text-white hover:bg-orange-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setMode('truefalse')}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Fact Check</span>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Timer */}
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-1 text-black text-sm">
                      <Timer className="h-4 w-4" />
                      Timer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-1">
                        {[30, 45, 60].map((time) => (
                          <Button
                            key={time}
                            variant={timerPreset === time ? "default" : "outline"}
                            className={`text-xs p-1 ${
                              timerPreset === time
                                ? 'bg-orange-600 text-white hover:bg-orange-700'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                            onClick={() => setTimerPreset(time)}
                          >
                            {time}s
                          </Button>
                        ))}
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-600">
                          {timerPreset}s per question
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Action Buttons - Compact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex-1 flex flex-col justify-center"
            >
              <div className="text-center">
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-4">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-base px-6 py-3 h-auto font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    onClick={startGame}
                    disabled={selectedCategories.length === 0}
                  >
                    <PlayIcon className="mr-2 h-5 w-5" />
                    Start Game
                  </Button>
                  
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 text-base px-6 py-3 h-auto font-semibold"
                    onClick={startRandomGame}
                  >
                    <Shuffle className="mr-2 h-5 w-5" />
                    Random Game
                  </Button>
                </div>
              </div>

              {/* Quick Actions - Compact */}
              <div className="mt-6">
                <div className="text-center mb-4">
                  <h3 className="text-base font-bold text-black mb-1">Quick Actions</h3>
                  <p className="text-sm text-gray-600">Jump into popular modes</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Card className="border border-gray-200 shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-black text-sm mb-1">Quick</h4>
                      <p className="text-xs text-gray-600 mb-2">Tech • Medium</p>
                      <Button 
                        size="sm" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1"
                        onClick={() => {
                          setSelectedCategories(['tech']);
                          setSelectedDifficulty('medium');
                          setMode('quick');
                          setTimerPreset(45);
                          startGame();
                        }}
                      >
                        Start
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200 shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Trophy className="h-4 w-4 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-black text-sm mb-1">Classic</h4>
                      <p className="text-xs text-gray-600 mb-2">All • Medium</p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full border-green-600 text-green-600 hover:bg-green-50 text-xs py-1"
                        onClick={() => {
                          setSelectedCategories(['tech', 'business', 'marketing']);
                          setSelectedDifficulty('medium');
                          setMode('classic');
                          setTimerPreset(60);
                          startGame();
                        }}
                      >
                        Start
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200 shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <BookOpen className="h-4 w-4 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-black text-sm mb-1">Practice</h4>
                      <p className="text-xs text-gray-600 mb-2">No Timer</p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 text-xs py-1"
                        onClick={() => {
                          setSelectedCategories(['tech']);
                          setSelectedDifficulty('easy');
                          setMode('training');
                          setTimerPreset(60);
                          startGame();
                        }}
                      >
                        Start
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Testing Dashboard */}
        <TestingDashboard />
      </div>
    </TooltipProvider>
  );
};

export default Play;