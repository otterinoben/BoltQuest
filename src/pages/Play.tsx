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
import { Zap, BookOpen, Clock, Target, TrendingUp, Star, Settings, Play as PlayIcon, Timer, Award, Brain, BarChart3, Users, Trophy, Shuffle, Cpu, Building2, Megaphone, DollarSign, Globe, Rocket, GraduationCap, TimerIcon, Calendar, Sparkles, ChevronRight, CheckCircle2, Edit3 } from 'lucide-react';
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

// Define categories with icons and colors
const categories = [
  { 
    value: 'tech' as Category, 
    label: 'Technology', 
    icon: Cpu, 
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700'
  },
  { 
    value: 'business' as Category, 
    label: 'Business', 
    icon: Building2, 
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700'
  },
  { 
    value: 'marketing' as Category, 
    label: 'Marketing', 
    icon: Megaphone, 
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700'
  },
  { 
    value: 'finance' as Category, 
    label: 'Finance', 
    icon: DollarSign, 
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700'
  },
  { 
    value: 'general' as Category, 
    label: 'General', 
    icon: Globe, 
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700'
  }
];

// Define difficulties with modern styling
const difficulties = [
  { 
    value: 'easy' as Difficulty, 
    label: 'Easy', 
    description: 'Perfect for beginners',
    color: 'from-green-400 to-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    icon: '🟢'
  },
  { 
    value: 'medium' as Difficulty, 
    label: 'Medium', 
    description: 'Balanced challenge',
    color: 'from-yellow-400 to-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700',
    icon: '🟡'
  },
  { 
    value: 'hard' as Difficulty, 
    label: 'Hard', 
    description: 'Expert level',
    color: 'from-red-400 to-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    icon: '🔴'
  }
];

// Game modes with enhanced descriptions
const gameModes = [
  {
    value: 'quick' as const,
    label: 'Quick Play',
    description: 'Fast-paced with time pressure',
    icon: Rocket,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700'
  },
  {
    value: 'classic' as const,
    label: 'Classic Mode',
    description: 'Original game mechanics',
    icon: TimerIcon,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700'
  },
  {
    value: 'training' as const,
    label: 'Training Mode',
    description: 'Learn at your own pace',
    icon: GraduationCap,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700'
  }
];

const Play = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [mode, setMode] = useState<'quick' | 'training' | 'classic'>('classic');
  const [timerPreset, setTimerPreset] = useState<number>(45);
  const [showWizard, setShowWizard] = useState(false);
  const [favorites, setFavorites] = useState<Array<{id: string, name: string, category: Category, difficulty: Difficulty, mode: 'quick' | 'training' | 'classic', timer: number}>>([]);
  const [taskContext, setTaskContext] = useState<{id: string, title: string} | null>(null);
  const [smartRecommendation, setSmartRecommendation] = useState<SmartRecommendation | null>(null);
  const [userType, setUserType] = useState<'new' | 'returning' | 'power'>('new');
  const [showProgressiveDisclosure, setShowProgressiveDisclosure] = useState(true);
  const [currentStep, setCurrentStep] = useState<'categories' | 'difficulty' | 'mode'>('categories');
  const [showQuickStartSettings, setShowQuickStartSettings] = useState(false);

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
      let recommendation = userPreferencesManager.getSmartRecommendation();
      // Force Classic Mode as default and add smart categories
      if (recommendation) {
        recommendation.mode = 'classic';
        recommendation.categories = userPreferencesManager.getSmartCategoryRecommendations();
      } else {
        // Create a fallback recommendation with smart categories
        const smartCategories = userPreferencesManager.getSmartCategoryRecommendations();
        const smartDifficulty = userPreferencesManager.getSmartDifficultyRecommendation();
        recommendation = {
          type: 'default',
          category: smartCategories[0] || 'tech',
          categories: smartCategories,
          difficulty: smartDifficulty,
          mode: 'classic',
          timer: 45,
          reason: 'Based on your preferences',
          confidence: 0.5
        };
      }
      setSmartRecommendation(recommendation);
      
      // Apply smart defaults if enabled
      if (userProfile?.preferences && recommendation) {
        // Auto-select categories based on smart recommendations
        const smartCategories = userPreferencesManager.getSmartCategoryRecommendations();
        setSelectedCategories(smartCategories as Category[]);
        setSelectedDifficulty(userPreferencesManager.getSmartDifficultyRecommendation() as Difficulty);
        setMode(recommendation.mode || 'classic');
        setTimerPreset(recommendation.timer || 45);
      } else if (userProfile?.preferences) {
        // Use smart recommendations even without full recommendation
        const smartCategories = userPreferencesManager.getSmartCategoryRecommendations();
        setSelectedCategories(smartCategories as Category[]);
        setSelectedDifficulty(userPreferencesManager.getSmartDifficultyRecommendation() as Difficulty);
        setTimerPreset(45); // Always default to 45 seconds
      } else {
        // Fallback defaults - use smart recommendations if available
        const smartCategories = userPreferencesManager.getSmartCategoryRecommendations();
        setSelectedCategories(smartCategories as Category[]);
        setSelectedDifficulty(userPreferencesManager.getSmartDifficultyRecommendation() as Difficulty);
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
    } else {
      // If no category in URL, start with none selected
      setSelectedCategories([]);
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
    // Don't start if no smart recommendation
    if (!smartRecommendation || (smartRecommendation.categories || []).length === 0) {
      return;
    }
    
    // Use smart recommendation categories
    const updatedSettings = {
      ...smartRecommendation,
      categories: smartRecommendation.categories || [smartRecommendation.category],
      mode: 'classic' // Always use Classic Mode
    };
    
    handleQuickStart(updatedSettings);
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
    setMode('classic');
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

  const nextStep = () => {
    if (currentStep === 'categories' && selectedCategories.length > 0) {
      setCurrentStep('difficulty');
    } else if (currentStep === 'difficulty') {
      setCurrentStep('mode');
    }
  };

  const prevStep = () => {
    if (currentStep === 'mode') {
      setCurrentStep('difficulty');
    } else if (currentStep === 'difficulty') {
      setCurrentStep('categories');
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        
        {/* Task Context Banner */}
          {taskContext && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Daily Task Active</h3>
                    <p className="text-sm text-gray-600">{taskContext.title}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/daily-tasks')}
                  className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  View Tasks
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-green-100/20 to-blue-100/20 rounded-full blur-3xl" />
          
          <div className="relative max-w-7xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
                  BoltQuest
                </h1>
              </div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Choose your challenge and start learning
              </p>
        </div>

            {/* Quick Start Section */}
            {smartRecommendation && (
              <div className="mb-12">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20" />
                  <div className="relative bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm rounded-3xl border border-white/30 p-8">
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                          <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setShowQuickStartSettings(true)}
                                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                              >
                                <Edit3 className="h-4 w-4 text-gray-600" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit quick start settings</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-gray-600">
                        Based on your learning history and preferences
                      </p>
            </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <div className="flex flex-wrap gap-2">
                        {/* Show smart recommended categories */}
                        {(smartRecommendation.categories || [smartRecommendation.category]).map((catValue, index) => {
                          const cat = categories.find(c => c.value === catValue);
                          return cat ? (
                            <Badge key={index} variant="secondary" className={`${cat.bgColor} ${cat.textColor} ${cat.borderColor}`}>
                              {cat.label}
                            </Badge>
                          ) : null;
                        })}
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                          {smartRecommendation.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                          {smartRecommendation.mode}
                        </Badge>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                          {smartRecommendation.timer}s
                        </Badge>
          </div>
                      <Button 
                        onClick={handleQuickStartWrapper}
                        disabled={!smartRecommendation || (smartRecommendation.categories || []).length === 0}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PlayIcon className="mr-2 h-5 w-5" />
                        Quick Start
                      </Button>
        </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Start Settings Modal */}
            {showQuickStartSettings && (
              <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                <div className="relative w-full max-w-md">
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30" />
                  <div className="relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <Settings className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Quick Start Settings</h3>
                      </div>
                      <Button 
                        variant="ghost"
                        onClick={() => setShowQuickStartSettings(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {/* Category Selection */}
                      <div>
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Categories (Select up to 3)
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          {categories.map((cat) => {
                            const Icon = cat.icon;
                            const isSelected = smartRecommendation?.categories?.includes(cat.value) || 
                                              (smartRecommendation?.category === cat.value && !smartRecommendation?.categories);
                            const canSelect = (smartRecommendation?.categories?.length || 0) < 3 || isSelected;
                            
                            return (
                              <button
                                key={cat.value}
                                onClick={() => {
                                  if (smartRecommendation) {
                                    const currentCategories = smartRecommendation.categories || [smartRecommendation.category];
                                    let newCategories;
                                    
                                    if (isSelected) {
                                      // Remove category if already selected
                                      newCategories = currentCategories.filter(c => c !== cat.value);
                                    } else if (currentCategories.length < 3) {
                                      // Add category if less than 3 selected
                                      newCategories = [...currentCategories, cat.value];
                                    } else {
                                      // Don't add if already at max (3)
                                      newCategories = currentCategories;
                                    }
                                    
                                    setSmartRecommendation({
                                      ...smartRecommendation,
                                      categories: newCategories,
                                      category: newCategories[0] // Keep first category for compatibility
                                    });
                                  }
                                }}
                                disabled={!canSelect}
                                className={`group relative p-3 rounded-xl border-2 transition-all duration-200 ${
                                  isSelected 
                                    ? `bg-gradient-to-br ${cat.color} text-white border-transparent shadow-md`
                                    : canSelect 
                                    ? `bg-white hover:shadow-md border-gray-200 hover:border-gray-300`
                                    : "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed"
                                }`}
                              >
                                <div className="flex flex-col items-center space-y-2">
                                  <div className={`p-2 rounded-lg transition-colors ${
                                    isSelected 
                                      ? "bg-white/20"
                                      : cat.bgColor
                                  }`}>
                                    <Icon className={`h-5 w-5 ${
                                      isSelected 
                                        ? "text-white"
                                        : cat.textColor
                                    }`} />
                                  </div>
                                  <span className={`text-xs font-medium ${
                                    isSelected
                                      ? "text-white"
                                      : "text-gray-800"
                                  }`}>
                                    {cat.label}
                                  </span>
                                  {isSelected && (
                                    <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {(smartRecommendation?.categories?.length || 0) === 0 && (
                          <p className="text-red-500 text-xs mt-2">
                            Please select at least one category
                          </p>
                        )}
                      </div>

                      {/* Difficulty Selection */}
                      <div>
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">Difficulty</Label>
                        <Select 
                          value={smartRecommendation?.difficulty || 'medium'} 
                          onValueChange={(value: Difficulty) => {
                            if (smartRecommendation) {
                              setSmartRecommendation({
                                ...smartRecommendation,
                                difficulty: value
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="rounded-xl border-gray-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {difficulties.map((diff) => (
                              <SelectItem key={diff.value} value={diff.value}>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{diff.icon}</span>
                                  {diff.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Mode Selection */}
                      <div>
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">Game Mode</Label>
                        <Select 
                          value={smartRecommendation?.mode || 'classic'} 
                          onValueChange={(value: 'quick' | 'training' | 'classic') => {
                            if (smartRecommendation) {
                              setSmartRecommendation({
                                ...smartRecommendation,
                                mode: value
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="rounded-xl border-gray-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {gameModes.map((mode) => (
                              <SelectItem key={mode.value} value={mode.value}>
                                <div className="flex items-center gap-2">
                                  <mode.icon className="h-4 w-4" />
                                  {mode.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Timer Selection */}
                      <div>
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">Timer Duration</Label>
                        <Select 
                          value={smartRecommendation?.timer?.toString() || '45'} 
                          onValueChange={(value: string) => {
                            if (smartRecommendation) {
                              setSmartRecommendation({
                                ...smartRecommendation,
                                timer: parseInt(value)
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="rounded-xl border-gray-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 seconds - High pressure</SelectItem>
                            <SelectItem value="45">45 seconds - Balanced</SelectItem>
                            <SelectItem value="60">60 seconds - Relaxed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowQuickStartSettings(false)}
                        className="flex-1 px-4 py-2 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => {
                          setShowQuickStartSettings(false);
                          // Ensure we have categories array and force Classic Mode
                          const categoriesArray = smartRecommendation?.categories || ('category' in smartRecommendation && smartRecommendation.category ? [smartRecommendation.category] : ['tech']);
                          const updatedSettings = {
                            ...smartRecommendation,
                            categories: categoriesArray,
                            mode: 'classic' // Always use Classic Mode
                          };
                          handleQuickStart(updatedSettings);
                        }}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <PlayIcon className="mr-2 h-4 w-4" />
                        Start Game
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Game Setup */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20" />
              <div className="relative bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm rounded-3xl border border-white/30 p-8">
                
                {/* Progress Indicator */}
                <div className="flex items-center justify-center mb-8">
                  <div className="flex items-center space-x-4">
                    {['categories', 'difficulty', 'mode'].map((step, index) => (
                      <div key={step} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                          currentStep === step 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                            : index < ['categories', 'difficulty', 'mode'].indexOf(currentStep)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {index < ['categories', 'difficulty', 'mode'].indexOf(currentStep) ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        {index < 2 && (
                          <ChevronRight className="h-5 w-5 text-gray-400 mx-2" />
                        )}
                      </div>
                    ))}
                </div>
              </div>

                {/* Step Content */}
                {currentStep === 'categories' && (
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Choose Your Focus</h3>
                    <p className="text-gray-600 mb-8">Select up to 3 categories to focus on</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                      {categories.map((cat) => {
                  const Icon = cat.icon;
                  const totalQuestions = Object.values(mockQuestions[cat.value]).reduce((sum, questions) => sum + questions.length, 0);
                  const isSelected = selectedCategories.includes(cat.value);
                  const canSelect = selectedCategories.length < 3 || isSelected;
                  
                  return (
                          <button
                      key={cat.value}
                            onClick={() => toggleCategory(cat.value)}
                            disabled={!canSelect}
                            className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                          isSelected 
                                ? `bg-gradient-to-br ${cat.color} text-white border-transparent shadow-lg`
                            : canSelect 
                                ? `bg-white hover:shadow-lg border-gray-200 hover:border-gray-300`
                                : "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed"
                        }`}
                      >
                            <div className="flex flex-col items-center space-y-3">
                              <div className={`p-4 rounded-xl transition-colors ${
                            isSelected 
                                  ? "bg-white/20"
                                  : cat.bgColor
                          }`}>
                                <Icon className={`h-8 w-8 ${
                              isSelected 
                                    ? "text-white"
                                    : cat.textColor
                            }`} />
                          </div>
                              <div className="text-center">
                                <span className={`text-sm font-semibold ${
                                  isSelected
                                    ? "text-white"
                                    : "text-gray-800"
                          }`}>
                            {cat.label}
                                </span>
                                <p className={`text-xs mt-1 ${
                                  isSelected
                                    ? "text-white/80"
                                    : "text-gray-500"
                                }`}>
                                  {totalQuestions} questions
                                </p>
                              </div>
                          {isSelected && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </div>
                          )}
                            </div>
                          </button>
                  );
                })}
              </div>
                    
                    {selectedCategories.length === 0 && (
                      <p className="text-red-500 text-sm mb-4">
                        Please select at least one category
                      </p>
                    )}
                    
                    <Button 
                      onClick={nextStep}
                      disabled={selectedCategories.length === 0}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
              </div>
                )}

                {currentStep === 'difficulty' && (
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Select Difficulty</h3>
                    <p className="text-gray-600 mb-8">Choose the challenge level that suits you</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      {difficulties.map((diff) => (
                        <button
                          key={diff.value}
                          onClick={() => setSelectedDifficulty(diff.value)}
                          className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                            selectedDifficulty === diff.value
                              ? `bg-gradient-to-br ${diff.color} text-white border-transparent shadow-lg`
                              : "bg-white hover:shadow-lg border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-4">
                            <div className={`text-4xl transition-transform group-hover:scale-110`}>
                              {diff.icon}
                            </div>
                          <div className="text-center">
                              <h4 className={`text-xl font-bold ${
                                selectedDifficulty === diff.value
                                  ? "text-white"
                                  : "text-gray-800"
                              }`}>
                                {diff.label}
                              </h4>
                              <p className={`text-sm mt-2 ${
                                selectedDifficulty === diff.value
                                  ? "text-white/80"
                                  : "text-gray-600"
                              }`}>
                                {diff.description}
                              </p>
                          </div>
                            {selectedDifficulty === diff.value && (
                              <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={prevStep}
                        variant="outline"
                        className="px-6 py-3 rounded-2xl border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={nextStep}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Continue
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Button>
                        </div>
                        </div>
                )}

                {currentStep === 'mode' && (
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Choose Game Mode</h3>
                    <p className="text-gray-600 mb-8">Select how you want to play</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      {gameModes.map((gameMode) => {
                        const Icon = gameMode.icon;
                        return (
                          <button
                            key={gameMode.value}
                            onClick={() => setMode(gameMode.value)}
                            className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                              mode === gameMode.value
                                ? `bg-gradient-to-br ${gameMode.color} text-white border-transparent shadow-lg`
                                : "bg-white hover:shadow-lg border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex flex-col items-center space-y-4">
                              <div className={`p-4 rounded-xl transition-colors ${
                                mode === gameMode.value
                                  ? "bg-white/20"
                                  : gameMode.bgColor
                              }`}>
                                <Icon className={`h-8 w-8 ${
                                  mode === gameMode.value
                                    ? "text-white"
                                    : gameMode.textColor
                                }`} />
                      </div>
                      <div className="text-center">
                                <h4 className={`text-xl font-bold ${
                                  mode === gameMode.value
                                    ? "text-white"
                                    : "text-gray-800"
                                }`}>
                                  {gameMode.label}
                                </h4>
                                <p className={`text-sm mt-2 ${
                                  mode === gameMode.value
                                    ? "text-white/80"
                                    : "text-gray-600"
                                }`}>
                                  {gameMode.description}
                                </p>
                        </div>
                              {mode === gameMode.value && (
                                <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                              )}
                    </div>
                          </button>
                        );
                      })}
              </div>
                    
                    <div className="flex gap-4 justify-center">
                          <Button
                        onClick={prevStep}
                        variant="outline"
                        className="px-6 py-3 rounded-2xl border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Back
                          </Button>
                  <Button
                    onClick={startGame}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <PlayIcon className="mr-2 h-5 w-5" />
                    Start Game
                  </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="relative">
              <div className="absolute inset-0 bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20" />
              <div className="relative bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm rounded-3xl border border-white/30 p-8">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Your Favorites</h2>
                  </div>
                  <p className="text-gray-600">
                    Quick access to your preferred game settings
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((favorite) => (
                    <div
                      key={favorite.id}
                      className="group relative p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                      onClick={() => loadFavorite(favorite)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800">{favorite.name}</h3>
                  <Button
                          variant="ghost"
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFavorite(favorite.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-500"
                        >
                          ×
                  </Button>
                </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Mode:</span>
                          <span className="capitalize font-medium">{favorite.mode}</span>
              </div>
                        <div className="flex justify-between">
                          <span>Timer:</span>
                          <span className="font-medium">{favorite.timer}s</span>
                </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl"
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="relative w-full max-w-4xl">
              <div className="absolute inset-0 bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20" />
              <div className="relative bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm rounded-3xl border border-white/30 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <Settings className="h-6 w-6 text-white" />
                      </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Customize Your Game</h2>
                      <p className="text-gray-600">Fine-tune your experience with detailed settings</p>
                    </div>
                  </div>
                      <Button 
                    variant="ghost"
                    onClick={() => setShowWizard(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                      </Button>
                </div>

                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-xl p-1">
                    <TabsTrigger value="basic" className="rounded-lg">Basic Settings</TabsTrigger>
                    <TabsTrigger value="advanced" className="rounded-lg">Advanced</TabsTrigger>
                    <TabsTrigger value="favorites" className="rounded-lg">Favorites</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label htmlFor="category" className="text-sm font-semibold text-gray-700">Category</Label>
                        <Select value={selectedCategories[0] || 'general'} onValueChange={(value: Category) => setSelectedCategories([value])}>
                          <SelectTrigger className="rounded-xl border-gray-200">
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
                        <Label htmlFor="difficulty" className="text-sm font-semibold text-gray-700">Difficulty</Label>
                        <Select value={selectedDifficulty} onValueChange={(value: Difficulty) => setSelectedDifficulty(value)}>
                          <SelectTrigger className="rounded-xl border-gray-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {difficulties.map((diff) => (
                              <SelectItem key={diff.value} value={diff.value}>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{diff.icon}</span>
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
                        <Label className="text-sm font-semibold text-gray-700">Timer Duration</Label>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { time: 30, color: 'text-red-600', description: 'High pressure' },
                            { time: 45, color: 'text-orange-600', description: 'Balanced' },
                            { time: 60, color: 'text-green-600', description: 'Relaxed' }
                          ].map((option) => (
                            <Card 
                              key={option.time}
                              className={`cursor-pointer transition-all rounded-xl ${
                                timerPreset === option.time 
                                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                                  : 'border-gray-200 hover:border-blue-300'
                              }`}
                              onClick={() => setTimerPreset(option.time)}
                            >
                              <CardContent className="pt-4">
                                <div className="text-center">
                                  <div className={`text-3xl font-bold ${option.color} mb-2`}>{option.time}s</div>
                                  <p className="text-sm text-gray-600">{option.description}</p>
                                </div>
                    </CardContent>
                  </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-6 mt-6">
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Settings className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Settings</h3>
                      <p className="text-gray-600">
                        More customization options coming soon!
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="favorites" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Save Current Settings</h3>
                        <Button onClick={addToFavorites} variant="outline" size="sm" className="rounded-xl">
                          <Star className="h-4 w-4 mr-2" />
                          Add to Favorites
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">
                        Save your current configuration for quick access later
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-between mt-8">
                      <Button 
                        variant="outline"
                    onClick={() => setShowWizard(false)}
                    className="px-6 py-3 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                      </Button>
                  <Button 
                    onClick={startGame} 
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <PlayIcon className="mr-2 h-4 w-4" />
                    Start Game
                  </Button>
                </div>
              </div>
          </div>
        </div>
        )}

        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
          <Button 
            size="lg"
            onClick={() => setCurrentStep('categories')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Shuffle className="mr-2 h-5 w-5" />
            Random Game
          </Button>
          <Button 
            size="lg"
            onClick={startWizard}
            className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Settings className="mr-2 h-5 w-5" />
            Customize
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Play;