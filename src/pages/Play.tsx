import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Zap, BookOpen, Clock, Target, TrendingUp, Star, Settings, Play as PlayIcon, Timer, Award, Brain, BarChart3, Users, Trophy, Shuffle, Cpu, Building2, Megaphone, DollarSign, Globe, Rocket, GraduationCap, TimerIcon, Calendar } from 'lucide-react';
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
import { HelpTrigger } from '@/components/help/HelpTrigger';

// Define categories with icons
const categories = [
  { value: 'tech' as Category, label: 'Technology', icon: Cpu },
  { value: 'business' as Category, label: 'Business', icon: Building2 },
  { value: 'marketing' as Category, label: 'Marketing', icon: Megaphone },
  { value: 'finance' as Category, label: 'Finance', icon: DollarSign },
  { value: 'general' as Category, label: 'General', icon: Globe }
];

// Define difficulties with clean styling
const difficulties = [
  { value: 'easy' as Difficulty, label: 'Easy', color: 'bg-gray-100', textColor: 'text-gray-700', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
  { value: 'medium' as Difficulty, label: 'Medium', color: 'bg-gray-200', textColor: 'text-gray-800', bgColor: 'bg-gray-100', borderColor: 'border-gray-300' },
  { value: 'hard' as Difficulty, label: 'Hard', color: 'bg-gray-300', textColor: 'text-gray-900', bgColor: 'bg-gray-200', borderColor: 'border-gray-400' },
  { value: 'custom' as Difficulty, label: 'Custom', color: 'bg-black', textColor: 'text-white', bgColor: 'bg-gray-800', borderColor: 'border-gray-600', isCustom: true }
];

const Play = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'custom'>('medium');
  const [mode, setMode] = useState<'quick' | 'training' | 'classic'>('classic');
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
    
    // Check if user has completed tutorial
    
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
      if (userProfile?.preferences && recommendation) {
        const categories = recommendation.category ? [recommendation.category as Category] : ['tech' as Category];
        setSelectedCategories(categories);
        setSelectedDifficulty(recommendation.difficulty as Difficulty || 'medium');
        setMode(recommendation.mode || 'classic');
        setTimerPreset(recommendation.timer || 45);
      } else if (userProfile?.preferences) {
        setSelectedCategories([userProfile.preferences.defaultCategory as Category]);
        setSelectedDifficulty(userProfile.preferences.defaultDifficulty || 'medium');
        setTimerPreset(45); // Always default to 45 seconds
      } else {
        // Fallback defaults
        setSelectedCategories(['tech' as Category]);
        setSelectedDifficulty('medium');
        setMode('classic');
        setTimerPreset(45);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  }, []);

  // Handle URL parameters for task-based game setup
  useEffect(() => {
    const category = searchParams.get('category') as Category;
    const difficulty = searchParams.get('difficulty') as Difficulty;
    const gameMode = searchParams.get('mode') as 'quick' | 'training' | 'classic';
    const taskId = searchParams.get('taskId');
    const taskTitle = searchParams.get('taskTitle');
    
    const timer = searchParams.get('timer');
    
    if (category && ['tech', 'business', 'marketing', 'finance', 'general'].includes(category)) {
      setSelectedCategories([category]);
    }
    
    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
      setSelectedDifficulty(difficulty);
    }
    
    if (gameMode && ['quick', 'training', 'classic'].includes(gameMode)) {
      setMode(gameMode);
    }
    
    if (timer && ['30', '45', '60'].includes(timer)) {
      setTimerPreset(parseInt(timer));
    }
    
    if (taskId && taskTitle) {
      setTaskContext({ id: taskId, title: taskTitle });
    }
  }, [searchParams]);

  // Save favorites to localStorage
  const saveFavorites = (newFavorites: typeof favorites) => {
    setFavorites(newFavorites);
    localStorage.setItem('boltquest_favorites', JSON.stringify(newFavorites));
  };

  const startGame = () => {
    // Use first selected category for now (can be enhanced later to mix questions)
    const primaryCategory = selectedCategories[0];
      const params = new URLSearchParams({
      category: primaryCategory,
      difficulty: selectedDifficulty,
      mode: mode,
      timer: timerPreset.toString()
      });
      navigate(`/game?${params.toString()}`);
  };

  // Quick start handler
  const handleQuickStart = (settings: any) => {
    // Ensure we have valid categories
    const categories = Array.isArray(settings.categories) ? settings.categories : ['tech'];
    const category = categories[0] || 'tech';
    
    setSelectedCategories(categories);
    setSelectedDifficulty(settings.difficulty || 'medium');
    setMode(settings.mode || 'classic');
    setTimerPreset(settings.timer || 45);
    
    // Update last used settings
    userPreferencesManager.updateLastUsedSettings({
      categories,
      difficulty: settings.difficulty || 'medium',
      mode: settings.mode || 'classic',
      timer: settings.timer || 45
    });
    
    // Start game immediately
    const params = new URLSearchParams({
      category: category,
      difficulty: settings.difficulty || 'medium',
      mode: settings.mode || 'classic',
      timer: (settings.timer || 45).toString()
    });
    navigate(`/game?${params.toString()}`);
  };

  const handleQuickStartWrapper = () => {
    // Use smart recommendation or defaults
    const settings = smartRecommendation || {
      categories: ['tech'],
      difficulty: 'medium',
      mode: 'classic',
      timer: 45
    };
    handleQuickStart(settings);
  };

  // Progressive disclosure handlers
  const handleCustomize = () => {
    setShowProgressiveDisclosure(false);
  };

  const handleCustomizeWrapper = () => {
    handleCustomize();
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
        // Remove category if already selected
        return prev.filter(cat => cat !== category);
      } else if (prev.length < 3) {
        // Add category if less than 3 selected
        return [...prev, category];
      }
      // Don't add if already at max (3)
      return prev;
    });
  };
  const startRandomGame = () => {
    // Random category from all available categories
    const randomCategory = categories[Math.floor(Math.random() * categories.length)].value;
    
    // Random difficulty (excluding custom)
    const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
    const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    
    // Random timer
    const timers = [30, 45, 60];
    const randomTimer = timers[Math.floor(Math.random() * timers.length)];
    
    // Set the random selections - only select ONE category
    setSelectedCategories([randomCategory]);
    setSelectedDifficulty(randomDifficulty);
    setTimerPreset(randomTimer);
    setMode('quick');
  };

  const addToFavorites = () => {
    const newFavorite = {
      id: Date.now().toString(),
      name: `${selectedCategories.map(cat => categories.find(c => c.value === cat)?.label).join(', ')} - ${selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}`,
      category: selectedCategories[0], // Use first selected category for compatibility
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
    setSelectedCategories([favorite.category]); // Convert single category to array
    setSelectedDifficulty(favorite.difficulty);
    setMode(favorite.mode);
    setTimerPreset(favorite.timer);
    navigate(`/game?category=${favorite.category}&difficulty=${favorite.difficulty}&mode=${favorite.mode}&timer=${favorite.timer}`);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-white">

        {/* Task Context Banner */}
          {taskContext && (
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-gray-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Daily Task Active</h3>
                    <p className="text-sm text-gray-600">{taskContext.title}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/daily-tasks')}
                  className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  View Tasks
                </Button>
              </div>
            </div>
        </div>
        )}

        {/* Hero Section - Clean White */}
        <div className="relative overflow-hidden">
          {/* Minimal background */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
          
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                  {/* Header */}
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight">
                        BoltQuest
                </h1>
                      <HelpTrigger helpKey="play-welcome" position="bottom" />
                    </div>
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                      Choose your challenge
                    </p>
        </div>

                  {/* Progressive Disclosure */}
                  {showProgressiveDisclosure && smartRecommendation ? (
                    <div className="mb-8">
                      <ProgressiveDisclosure
                        userType={userType}
                        onQuickStart={handleQuickStartWrapper}
                        onCustomize={handleCustomizeWrapper}
                        onAdvanced={handleAdvanced}
                        quickStartSettings={{
                          category: smartRecommendation.category,
                          difficulty: smartRecommendation.difficulty,
                          mode: smartRecommendation.mode,
                          timer: smartRecommendation.timer,
                        }}
                      />
                    </div>
                  ) : (
                    <div className="mb-8">
                      {/* Quick Start Card */}
                      {smartRecommendation && (
                        <QuickStartCard
                          recommendation={smartRecommendation}
                          onQuickStart={handleQuickStartWrapper}
                          onCustomize={handleCustomizeWrapper}
                        />
                      )}
                </div>
                  )}
                
                  {/* Category Selection - Multi-Select */}
              <div className="mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-bold text-black mb-3 text-center">
                      Choose Your Focus {(selectedCategories?.length || 0) > 0 && `(${selectedCategories?.length || 0}/3)`}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {categories.map((cat) => {
                  const Icon = cat.icon;
                  const totalQuestions = Object.values(mockQuestions[cat.value]).reduce((sum, questions) => sum + questions.length, 0);
                        const isSelected = (selectedCategories || []).includes(cat.value);
                        const canSelect = (selectedCategories?.length || 0) < 3 || isSelected;
                  
                  return (
                      <button
                      key={cat.value}
                        onClick={() => toggleCategory(cat.value)}
                        disabled={!canSelect}
                        className={`group relative p-3 rounded-xl border-2 transition-apple btn-apple ${
                          isSelected 
                            ? "glass-dark border-white/30 text-white shadow-lg"
                            : canSelect 
                            ? "glass border-white/20 hover:border-white/40 hover:shadow-lg"
                            : "bg-gray-100/50 border-gray-200/50 opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <div className={`p-3 rounded-xl transition-colors ${
                            isSelected 
                              ? "bg-green-500"
                              : "bg-gray-100"
                          }`}>
                            <Icon className={`h-6 w-6 ${
                              isSelected 
                                ? "text-white"
                                : "text-gray-600"
                            }`} />
                          </div>
                          <span className={`text-sm font-medium ${
                            isSelected
                              ? "text-white"
                              : "text-gray-800"
                          }`}>
                            {cat.label}
                          </span>
                          <span className={`text-xs ${
                            isSelected
                              ? "text-gray-300"
                              : "text-gray-500"
                          }`}>
                            {totalQuestions} questions
                          </span>
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                              <span className="text-black text-xs font-bold">✓</span>
                            </div>
                          )}
                        </div>
                      </button>
                  );
                })}
              </div>
                    <div className="h-6 flex items-center justify-center">
                      {(selectedCategories?.length || 0) === 0 && (
                        <p className="text-center text-sm text-red-400">
                          Please select at least one category
                        </p>
                      )}
                </div>
              </div>

              {/* Game Mode Selection */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-bold text-black mb-3 text-center">Game Mode</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Quick Play */}
                <button
                  onClick={() => setMode('quick')}
                  className={`group relative p-3 rounded-xl border-2 transition-apple btn-apple ${
                    mode === 'quick'
                      ? "glass-dark border-white/30 text-white shadow-lg"
                      : "glass border-white/20 hover:border-white/40 hover:shadow-lg"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`p-2 rounded-lg transition-colors ${
                      mode === 'quick'
                        ? "bg-green-500"
                        : "bg-gray-100"
                    }`}>
                      <Rocket className={`h-5 w-5 ${
                        mode === 'quick'
                          ? "text-white"
                          : "text-gray-600"
                      }`} />
                          </div>
                    <span className={`text-sm font-medium ${
                      mode === 'quick'
                        ? "text-white"
                        : "text-gray-800"
                    }`}>
                      Quick Play
                    </span>
                    <span className={`text-xs ${
                      mode === 'quick'
                        ? "text-gray-300"
                        : "text-gray-500"
                    }`}>
                      Time pressure
                    </span>
                    </div>
                </button>

                {/* Classic Mode */}
                <button
                  onClick={() => setMode('classic')}
                  className={`group relative p-3 rounded-xl border-2 transition-apple btn-apple ${
                    mode === 'classic'
                      ? "glass-dark border-white/30 text-white shadow-lg"
                      : "glass border-white/20 hover:border-white/40 hover:shadow-lg"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`p-2 rounded-lg transition-colors ${
                      mode === 'classic'
                        ? "bg-green-500"
                        : "bg-gray-100"
                    }`}>
                      <TimerIcon className={`h-5 w-5 ${
                        mode === 'classic'
                          ? "text-white"
                          : "text-gray-600"
                      }`} />
                        </div>
                    <span className={`text-sm font-medium ${
                          mode === 'classic'
                        ? "text-white"
                        : "text-gray-800"
                    }`}>
                      Classic Mode
                    </span>
                    <span className={`text-xs ${
                      mode === 'classic'
                        ? "text-gray-300"
                        : "text-gray-500"
                    }`}>
                      Time rewards
                    </span>
                        </div>
                </button>

                {/* Training Mode */}
                <button
                  onClick={() => setMode('training')}
                  className={`group relative p-3 rounded-xl border-2 transition-apple btn-apple ${
                          mode === 'training'
                      ? "glass-dark border-white/30 text-white shadow-lg"
                      : "glass border-white/20 hover:border-white/40 hover:shadow-lg"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`p-2 rounded-lg transition-colors ${
                      mode === 'training'
                        ? "bg-green-500"
                        : "bg-gray-100"
                    }`}>
                      <GraduationCap className={`h-5 w-5 ${
                        mode === 'training'
                          ? "text-white"
                          : "text-gray-600"
                      }`} />
                        </div>
                    <span className={`text-sm font-medium ${
                      mode === 'training'
                        ? "text-white"
                        : "text-gray-800"
                    }`}>
                      Training Mode
                    </span>
                    <span className={`text-xs ${
                      mode === 'training'
                        ? "text-gray-300"
                        : "text-gray-500"
                    }`}>
                      No time limit
                    </span>
                        </div>
                </button>
                    </div>
              </div>

                {/* Difficulty Selection - Clean Style */}
              <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-bold text-black mb-3 text-center">Select Difficulty</h3>
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                  {difficulties.map((diff) => {
                    return (
                      <button
                        key={diff.value}
                        onClick={() => setSelectedDifficulty(diff.value)}
                        className={`group relative px-4 py-3 rounded-xl border-2 transition-apple btn-apple ${
                          selectedDifficulty === diff.value
                            ? "glass-dark border-white/30 text-white shadow-lg"
                            : "glass border-white/20 hover:border-white/40 hover:shadow-lg"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                            selectedDifficulty === diff.value
                              ? "bg-green-500"
                              : "bg-gray-100"
                          }`}>
                            <span className={`font-bold text-2xl transition-colors ${
                              selectedDifficulty === diff.value
                                ? "text-white"
                                : "text-gray-600"
                            }`}>
                              {diff.label[0]}
                            </span>
                      </div>
                      <div className="text-center">
                              <div className={`text-sm font-medium transition-colors ${
                                selectedDifficulty === diff.value
                                  ? "text-white"
                                  : "text-gray-800"
                              }`}>
                                {diff.label}
                        </div>
                      </div>
                    </div>
                      </button>
                    );
                  })}
              </div>
              </div>

                {/* Custom Settings Section - Future Feature */}
                {selectedDifficulty === 'custom' && (
                  <div className="mb-8 animate-fade-in-up">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50" />
                      <div className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 p-6">
                        <div className="text-center mb-6">
                          <div className="flex items-center justify-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center">
                              <Settings className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Custom Settings</h3>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300">
                            Fine-tune your game experience
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Timer Settings */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Timer Duration
                            </h4>
                            <div className="space-y-3">
                              {[15, 30, 45, 60, 90, 120].map((seconds) => (
                                <button
                                  key={seconds}
                                  className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 hover:border-purple-300 dark:hover:border-purple-400 transition-colors text-left"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-700 dark:text-slate-200">{seconds} seconds</span>
                                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-500" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Question Count */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Question Count
                            </h4>
                            <div className="space-y-3">
                              {[10, 15, 20, 25, 30].map((count) => (
                                <button
                                  key={count}
                                  className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 hover:border-purple-300 dark:hover:border-purple-400 transition-colors text-left"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-700 dark:text-slate-200">{count} questions</span>
                                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-500" />
                                  </div>
                                </button>
                              ))}
                            </div>
                </div>
              </div>

                        <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-200 dark:border-green-700">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
                              <span className="text-white font-bold text-sm">!</span>
                </div>
                            <div>
                              <h5 className="font-medium text-green-800 dark:text-green-200">Coming Soon</h5>
                              <p className="text-sm text-green-600 dark:text-green-300">
                                Custom difficulty settings will be available in a future update
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                      </div>
            </div>
          </div>

        {/* Favorites Section - Apple Style */}
        {favorites.length > 0 && (
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="relative">
              <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-xl" />
              <div className="relative bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-slate-700/50 p-8">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Star className="h-6 w-6 text-yellow-500" />
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Your Favorites</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                Quick access to your preferred game settings
                  </p>
                </div>
                
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((favorite) => (
                    <div
                      key={favorite.id}
                      className="group relative p-4 rounded-2xl bg-white/60 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-400 transition-all duration-300 hover:scale-105 cursor-pointer"
                      onClick={() => loadFavorite(favorite)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{favorite.name}</h3>
                      <Button 
                          variant="ghost"
                        size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFavorite(favorite.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-500"
                        >
                          ×
                      </Button>
                      </div>
                      <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex justify-between">
                          <span>Mode:</span>
                          <span className="capitalize">{favorite.mode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Timer:</span>
                          <span>{favorite.timer}s</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full mt-3 bg-green-500 hover:bg-green-600 text-white rounded-xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          loadFavorite(favorite);
                        }}
                      >
                        <PlayIcon className="h-4 w-4 mr-2" />
                        Play
                      </Button>
                    </div>
                ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customization Wizard */}
        {showWizard && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Customize Your Game
              </CardTitle>
              <CardDescription>
                Fine-tune your experience with detailed settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  <TabsTrigger value="favorites">Favorites</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label htmlFor="category">Category</Label>
                        <Select value={selectedCategories[0] || 'general'} onValueChange={(value: Category) => setSelectedCategories([value])}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              <div className="flex items-center gap-2">
                                <cat.icon className="h-4 w-4" />
                                {cat.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select value={selectedDifficulty} onValueChange={(value: Difficulty) => setSelectedDifficulty(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {difficulties.map((diff) => (
                            <SelectItem key={diff.value} value={diff.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${diff.color}`} />
                                {diff.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {mode === 'quick' && (
                    <div className="space-y-4">
                      <Label>Timer Duration</Label>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { time: 30, color: 'text-red-600', description: 'High pressure' },
                          { time: 45, color: 'text-orange-600', description: 'Balanced' },
                          { time: 60, color: 'text-green-600', description: 'Relaxed' }
                        ].map((option) => (
                          <Card 
                            key={option.time}
                            className={`cursor-pointer transition-all ${
                              timerPreset === option.time 
                                ? 'border-primary bg-primary/10 shadow-glow' 
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => setTimerPreset(option.time)}
                          >
                            <CardContent className="pt-4">
                              <div className="text-center">
                                <div className={`text-4xl font-bold ${option.color} mb-2`}>{option.time}s</div>
                                <p className="text-sm text-muted-foreground">{option.description}</p>
                              </div>
                    </CardContent>
                  </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {mode === 'classic' && (
                    <div className="space-y-4">
                      <Label>Classic Mode</Label>
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                          <div>
                            <h3 className="font-semibold text-green-800 dark:text-green-200">Original Game Style</h3>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Start with 45 seconds • Correct answers +3s • Wrong answers -5s • Skip -5s
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="advanced" className="space-y-6">
                  <div className="text-center py-8">
                    <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Advanced Settings</h3>
                    <p className="text-muted-foreground">
                      More customization options coming soon!
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="favorites" className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Save Current Settings</h3>
                      <Button onClick={addToFavorites} variant="outline" size="sm">
                        <Star className="h-4 w-4 mr-2" />
                        Add to Favorites
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Save your current configuration for quick access later
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setShowWizard(false)}>
                  Cancel
                </Button>
                <Button onClick={startGame} className="px-8 btn-apple glass-dark border-white/30 text-white shadow-lg hover:shadow-xl">
                  <PlayIcon className="mr-2 h-4 w-4" />
                  Start Game
                </Button>
              </div>
                    </CardContent>
                  </Card>
        )}

        {/* Stats Section - Clean Style */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="relative">
            <div className="absolute inset-0 bg-white rounded-3xl shadow-sm" />
            <div className="relative bg-white rounded-3xl border border-gray-200 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-black mb-3">Your Progress</h2>
                <p className="text-gray-600">
                  Track your learning journey
                </p>
                </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-2xl bg-gray-50 border border-gray-200">
                  <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-6 w-6 text-white" />
              </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Games Played</h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {getUserProfile().statistics.totalGamesPlayed}
                  </p>
          </div>
                
                <div className="text-center p-6 rounded-2xl bg-gray-50 border border-gray-200">
                  <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Best Score</h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {getUserProfile().statistics.bestScore}
                  </p>
        </div>

                <div className="text-center p-6 rounded-2xl bg-gray-50 border border-gray-200">
                  <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Accuracy</h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round(getUserProfile().statistics.averageAccuracy)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Future Features Preview - Clean Style */}
        <div className="max-w-6xl mx-auto px-6 pb-16">
          <div className="bg-white border-2 border-gray-200 rounded-3xl shadow-sm p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-black">Coming Soon</h2>
              </div>
              <p className="text-gray-600">
                Exciting features in development
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Marathon Mode */}
              <div className="group p-6 rounded-2xl bg-white border-2 border-gray-200 hover:border-gray-400 hover:scale-105 transition-all duration-300">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
                <h3 className="text-lg font-bold text-black mb-2">Marathon Mode</h3>
                <p className="text-sm text-gray-600">
                  Extended gameplay sessions with progressive difficulty
                </p>
              </div>

              {/* Daily Challenges */}
              <div className="group p-6 rounded-2xl bg-white border-2 border-gray-200 hover:border-gray-400 hover:scale-105 transition-all duration-300">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <h3 className="text-lg font-bold text-black mb-2">Daily Challenges</h3>
                <p className="text-sm text-gray-600">
                  Fresh challenges every day with special rewards
                </p>
              </div>

              {/* Tournament Mode */}
              <div className="group p-6 rounded-2xl bg-white border-2 border-gray-200 hover:border-gray-400 hover:scale-105 transition-all duration-300">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Trophy className="h-5 w-5 text-gray-600" />
                </div>
                <h3 className="text-lg font-bold text-black mb-2">Tournament Mode</h3>
                <p className="text-sm text-gray-600">
                  Compete with others in structured competitions
                </p>
              </div>

              {/* Custom Categories */}
              <div className="group p-6 rounded-2xl bg-white border-2 border-gray-200 hover:border-gray-400 hover:scale-105 transition-all duration-300">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Target className="h-5 w-5 text-gray-600" />
                </div>
                <h3 className="text-lg font-bold text-black mb-2">Custom Categories</h3>
                <p className="text-sm text-gray-600">
                  Create your own question categories and sets
                </p>
              </div>

              {/* Social Features */}
              <div className="group p-6 rounded-2xl bg-white border-2 border-gray-200 hover:border-gray-400 hover:scale-105 transition-all duration-300">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5 text-gray-600" />
                </div>
                <h3 className="text-lg font-bold text-black mb-2">Social Features</h3>
                <p className="text-sm text-gray-600">
                  Challenge friends and share achievements
                </p>
              </div>

              {/* AI Learning */}
              <div className="group p-6 rounded-2xl bg-white border-2 border-gray-200 hover:border-gray-400 hover:scale-105 transition-all duration-300">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="h-5 w-5 text-gray-600" />
                </div>
                <h3 className="text-lg font-bold text-black mb-2">AI Learning</h3>
                <p className="text-sm text-gray-600">
                  Personalized questions based on your progress
                </p>
              </div>
            </div>
          </div>
        </div>

      {/* Floating Customize Button - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          size="lg"
            className="px-6 py-3 text-base font-medium bg-black text-white border-2 border-black hover:border-gray-800 hover:bg-gray-800 transition-all duration-200 min-h-[48px]"
          onClick={startWizard}
        >
          <Settings className="mr-2 h-5 w-5 text-white" />
          Customize
        </Button>
      </div>
    </TooltipProvider>
  );
};

export default Play;