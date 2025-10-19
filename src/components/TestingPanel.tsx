import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useTesting } from '@/contexts/TestingContext';
import { 
  addXp, 
  addCoins, 
  addPoints, 
  addStreak, 
  setLevel, 
  getUserProgress 
} from '@/lib/xpLevelSystem';
import { getCoinBalance, addCoins as addCoinsToSystem, spendCoins } from '@/lib/coinSystem';
import { purchaseItem, getUserInventory, clearAllOwnedItems } from '@/lib/shopSystem';
import { commandParser, ParsedCommand } from '@/lib/testingCommands';
import { commandExecutor, CommandResult } from '@/lib/commandExecutor';
import { 
  Settings, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Minus, 
  Zap, 
  Target, 
  Clock, 
  Coins, 
  Trophy,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Trash2,
  Save,
  Download,
  Upload,
  Move,
  Maximize2,
  Minimize2,
  RotateCcw as ResetIcon,
  Star,
  TrendingUp,
  Award,
  Crown,
  Terminal,
  Brain,
  Send,
  MessageSquare
} from 'lucide-react';

interface TestingPanelProps {
  onAddTime?: (seconds: number) => void;
  onAddScore?: (points: number) => void;
  onAddCoins?: (coins: number) => void;
  onTriggerPopup?: (type: 'penalty' | 'streak', value?: number) => void;
  onResetData?: () => void;
  onPauseToggle?: () => void;
  gameState?: any;
}

export const TestingPanel: React.FC<TestingPanelProps> = ({
  onAddTime,
  onAddScore,
  onAddCoins,
  onTriggerPopup,
  onResetData,
  onPauseToggle,
  gameState
}) => {
  const testing = useTesting();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(() => {
    try {
      return localStorage.getItem('testing-panel-visible') === 'true';
    } catch {
      return false;
    }
  });
  
  // Draggable state
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem('testing-panel-position');
      return saved ? JSON.parse(saved) : { x: window.innerWidth - 340, y: window.innerHeight - 400 };
    } catch {
      return { x: window.innerWidth - 340, y: window.innerHeight - 400 };
    }
  });
  
  // Resizable state
  const [size, setSize] = useState(() => {
    try {
      const saved = localStorage.getItem('testing-panel-size');
      return saved ? JSON.parse(saved) : { width: 320, height: 400 };
    } catch {
      return { width: 320, height: 400 };
    }
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  
  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Quick action values
  const [timeValue, setTimeValue] = useState(10);
  const [scoreValue, setScoreValue] = useState(5);
  const [coinValue, setCoinValue] = useState(100);
  const [xpValue, setXpValue] = useState(50);
  const [streakValue, setStreakValue] = useState(5);
  const [levelValue, setLevelValue] = useState(1);
  const [pointsValue, setPointsValue] = useState(10);
  
  // Section visibility state
  const [sectionsExpanded, setSectionsExpanded] = useState({
    quickActions: true,
    testingChat: false,
    statsManagement: false,
    shopTesting: false,
    dailyTasks: false,
    popupTesting: false,
    gameControls: false,
    dataManagement: false,
    eloRanking: false,
    userDataContext: false,
    matchHistory: false,
    smartNotifications: false,
    dashboardWidgets: false,
    comprehensiveTesting: false
  });

  // Chat system state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    type: 'user' | 'system' | 'error' | 'success';
    content: string;
    timestamp: Date;
  }>>([]);
  const [chatSuggestions, setChatSuggestions] = useState<string[]>([]);
  const [showChatSuggestions, setShowChatSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [isExecutingCommand, setIsExecutingCommand] = useState(false);
  
  // Command help examples
  const getCommandHelp = (command: string): string => {
    const helpMap: Record<string, string> = {
      '/elo': '💡 Try [/elo tech 1200] to set your tech ELO rating!',
      '/elo-test': '💡 Try [/elo-test 1200] to test ELO ranking!',
      '/elo-division': '💡 Try [/elo-division "Gold III"] to set ELO division!',
      '/elo-reset': '💡 Try [/elo-reset tech] to reset tech ELO!',
      '/elo-reset-all': '💡 Try [/elo-reset-all] to reset all ELO ratings!',
      '/level': '💡 Try [/level 50] to set your level!',
      '/xp': '💡 Try [/xp 1000] to add XP!',
      '/coins': '💡 Try [/coins 5000] to set coins!',
      '/add-coins': '💡 Try [/add-coins 1000] to add coins!',
      '/points': '💡 Try [/points 1000] to set points!',
      '/streak': '💡 Try [/streak 10] to set daily streak!',
      '/level-up': '💡 Try [/level-up] to force level up!',
      '/level-down': '💡 Try [/level-down] to force level down!',
      '/reset-level': '💡 Try [/reset-level] to reset to level 1!',
      '/fix-profile': '💡 Try [/fix-profile] to fix profile data!',
      '/reset-currency': '💡 Try [/reset-currency] to reset all currency!',
      '/achievement-unlock': '💡 Try [/achievement-unlock first_score] to unlock achievement!',
      '/achievement-reset': '💡 Try [/achievement-reset first_score] to reset achievement!',
      '/achievement-reset-all': '💡 Try [/achievement-reset-all] to reset all achievements!',
      '/achievements-list': '💡 Try [/achievements-list] to see all achievements!',
      '/achievement-bulk-unlock': '💡 Try [/achievement-bulk-unlock 5] to unlock random achievements!',
      '/daily-complete': '💡 Try [/daily-complete task_1] to complete daily task!',
      '/daily-complete-all': '💡 Try [/daily-complete-all] to complete all daily tasks!',
      '/daily-reset': '💡 Try [/daily-reset] to reset daily tasks!',
      '/daily-generate': '💡 Try [/daily-generate] to generate new daily tasks!',
      '/game-simulate': '💡 Try [/game-simulate 85] to simulate game with 85% accuracy!',
      '/game-generate-score': '💡 Try [/game-generate-score 90] to generate game score!',
      '/reset-all': '💡 Try [/reset-all] to reset all user data!',
      '/backup-data': '💡 Try [/backup-data] to backup user data!',
      '/restore-data': '💡 Try [/restore-data] to restore user data!',
      '/test': '💡 Try [/test all] to run comprehensive tests!',
      '/test-all': '💡 Try [/test-all] to run all test modules!',
      '/test-dashboard': '💡 Try [/test-dashboard] to test dashboard!',
      '/test-elo': '💡 Try [/test-elo] to test ELO system!',
      '/test-daily': '💡 Try [/test-daily] to test daily tasks!',
      '/test-data': '💡 Try [/test-data] to test data persistence!',
      '/context': '💡 Try [/context refresh] to refresh user data context!',
      '/context-refresh': '💡 Try [/context-refresh] to refresh user data!',
      '/context-status': '💡 Try [/context-status] to check context status!',
      '/context-reset': '💡 Try [/context-reset] to reset context!',
      '/context-debug': '💡 Try [/context-debug] to debug context!',
      '/history': '💡 Try [/history add] to add test game to history!',
      '/history-add': '💡 Try [/history-add] to add test game!',
      '/history-clear': '💡 Try [/history-clear] to clear game history!',
      '/history-stats': '💡 Try [/history-stats] to view game statistics!',
      '/history-export': '💡 Try [/history-export] to export game history!',
      '/notify': '💡 Try [/notify test] to test notifications!',
      '/notify-test': '💡 Try [/notify-test] to test notification system!',
      '/notify-generate': '💡 Try [/notify-generate] to generate smart notifications!',
      '/notify-clear': '💡 Try [/notify-clear] to clear all notifications!',
      '/notify-settings': '💡 Try [/notify-settings] to view notification settings!',
      '/scenario': '💡 Try [/scenario newuser] to test new user scenario!',
      '/scenario-newuser': '💡 Try [/scenario-newuser] to test new user!',
      '/scenario-poweruser': '💡 Try [/scenario-poweruser] to test power user!',
      '/scenario-casual': '💡 Try [/scenario-casual] to test casual user!',
      '/scenario-reset': '💡 Try [/scenario-reset] to reset to default!',
      '/help': '💡 Try [/help] to see all available commands!',
      '/commands': '💡 Try [/commands] to see all commands by category!'
    };
    
    return helpMap[command] || `💡 Try [${command}] to use this command!`;
  };
  
  // Tab + ` sequence tracking
  const [tabPressed, setTabPressed] = useState(false);
  const tabPressedRef = useRef(false);
  
  // Preset values
  const presets = {
    beginner: { time: 5, score: 10, coins: 50, xp: 25, streak: 3, level: 1, points: 5 },
    intermediate: { time: 15, score: 50, coins: 200, xp: 100, streak: 8, level: 5, points: 25 },
    advanced: { time: 30, score: 150, coins: 500, xp: 300, streak: 15, level: 10, points: 75 },
    extreme: { time: 60, score: 500, coins: 1000, xp: 1000, streak: 25, level: 20, points: 200 }
  };
  
  const [currentPreset, setCurrentPreset] = useState<keyof typeof presets>('intermediate');

  // Save preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('testing-panel-visible', isVisible.toString());
    } catch (error) {
      console.error('Failed to save testing panel visibility:', error);
    }
  }, [isVisible]);

  useEffect(() => {
    try {
      localStorage.setItem('testing-panel-position', JSON.stringify(position));
    } catch (error) {
      console.error('Failed to save testing panel position:', error);
    }
  }, [position]);

  useEffect(() => {
    try {
      localStorage.setItem('testing-panel-size', JSON.stringify(size));
    } catch (error) {
      console.error('Failed to save testing panel size:', error);
    }
  }, [size]);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === headerRef.current || headerRef.current?.contains(e.target as Node)) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  }, [position]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  }, [size]);

  // Global mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        // Keep panel within viewport bounds
        const maxX = window.innerWidth - size.width;
        const maxY = window.innerHeight - size.height;
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      }
      
      if (isResizing) {
        const newWidth = resizeStart.width + (e.clientX - resizeStart.x);
        const newHeight = resizeStart.height + (e.clientY - resizeStart.y);
        
        // Minimum and maximum size constraints
        const minWidth = 280;
        const maxWidth = window.innerWidth - position.x;
        const minHeight = 200;
        const maxHeight = window.innerHeight - position.y;
        
        setSize({
          width: Math.max(minWidth, Math.min(newWidth, maxWidth)),
          height: Math.max(minHeight, Math.min(newHeight, maxHeight))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = isDragging ? 'grabbing' : 'nw-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, isResizing, dragStart, resizeStart, position, size]);

  // Reset position function
  const resetPosition = useCallback(() => {
    setPosition({ x: window.innerWidth - 340, y: window.innerHeight - 400 });
    setSize({ width: 320, height: 400 });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || 
                         target.tagName === 'TEXTAREA' || 
                         target.contentEditable === 'true' ||
                         target.closest('[contenteditable="true"]');
      
      // Tab + ` (backtick) sequence to open testing panel with chat focused
      if (e.key === 'Tab' && !e.ctrlKey && !e.shiftKey && !e.altKey && !isInputField) {
        e.preventDefault();
        tabPressedRef.current = true;
        setTabPressed(true);
        // Reset tabPressed after 1 second if no backtick follows
        setTimeout(() => {
          tabPressedRef.current = false;
          setTabPressed(false);
        }, 1000);
      }
      
      if (e.key === '`' && !e.shiftKey && !e.ctrlKey && !e.altKey && !isInputField && tabPressedRef.current) {
        e.preventDefault();
        tabPressedRef.current = false;
        setTabPressed(false);
        setIsVisible(true);
        setIsExpanded(true);
        setSectionsExpanded(prev => ({
          ...prev,
          testingChat: true
        }));
        // Focus the chat input after a short delay to ensure it's rendered
        setTimeout(() => {
          const chatInput = document.querySelector('input[placeholder*="command"]') as HTMLInputElement;
          if (chatInput) {
            chatInput.focus();
          }
        }, 100);
      }
      
      // Ctrl + Shift + T to toggle testing panel
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
      
      // Ctrl + Shift + E to expand/collapse
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        setIsExpanded(prev => !prev);
      }
      
      // Ctrl + Shift + R to reset position
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        resetPosition();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleQuickAction = (action: string, value: number) => {
    switch (action) {
      case 'addTime':
        testing.addTime(value);
        break;
      case 'addScore':
        testing.addScore(value);
        break;
      case 'addCoins':
        const coinsSuccess = addCoinsToSystem(value, 'mission', `Testing: Added ${value} coins`);
        if (coinsSuccess) {
          toast.success(`Added ${value} coins!`, { duration: 1000 });
        } else {
          toast.error('Failed to add coins', { duration: 1000 });
        }
        break;
      case 'spendCoins':
        const spendSuccess = spendCoins(value, `Testing: Spent ${value} coins`);
        if (spendSuccess) {
          toast.success(`Spent ${value} coins!`, { duration: 1000 });
        } else {
          toast.error('Not enough coins!', { duration: 1000 });
        }
        break;
      case 'purchaseItem':
        const purchaseResult = purchaseItem('badge_early_supporter');
        if (purchaseResult.success) {
          toast.success('Item purchased!', { duration: 1000 });
        } else {
          toast.error(purchaseResult.message, { duration: 1000 });
        }
        break;
      case 'clearAllItems':
        clearAllOwnedItems();
        toast.success('All owned items cleared!', { duration: 1000 });
        break;
      case 'addXp':
        const xpResult = addXp(value);
        if (xpResult.leveledUp) {
          toast.success(`Level Up! Now level ${xpResult.newLevel}`, { duration: 2000 });
        } else {
          toast.success(`Added ${value} XP!`, { duration: 1000 });
        }
        break;
      case 'addStreak':
        const streakSuccess = addStreak(value);
        if (streakSuccess) {
          toast.success(`Added ${value} streak!`, { duration: 1000 });
        } else {
          toast.error('Failed to add streak', { duration: 1000 });
        }
        break;
      case 'addLevel':
        const levelSuccess = setLevel(value);
        if (levelSuccess) {
          toast.success(`Set level to ${value}!`, { duration: 1000 });
        } else {
          toast.error('Failed to set level', { duration: 1000 });
        }
        break;
      case 'addPoints':
        const pointsSuccess = addPoints(value);
        if (pointsSuccess) {
          toast.success(`Added ${value} points!`, { duration: 1000 });
        } else {
          toast.error('Failed to add points', { duration: 1000 });
        }
        break;
      case 'testBaseline':
        // Trigger baseline assessment test
        window.location.href = '/baseline-test';
        break;
    }
  };

  const handleResetData = () => {
    testing.resetAllData();
  };

  const handleExportData = () => {
    testing.exportData();
  };

  const handleImportData = () => {
    testing.importData();
  };

  // Preset functions
  const applyPreset = (presetName: keyof typeof presets) => {
    const preset = presets[presetName];
    setTimeValue(preset.time);
    setScoreValue(preset.score);
    setCoinValue(preset.coins);
    setXpValue(preset.xp);
    setStreakValue(preset.streak);
    setLevelValue(preset.level);
    setPointsValue(preset.points);
    setCurrentPreset(presetName);
    toast.success(`Applied ${presetName} preset`, { duration: 1000 });
  };

  const toggleSection = (section: keyof typeof sectionsExpanded) => {
    setSectionsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Chat system functions
  const handleChatInputChange = (value: string) => {
    setChatInput(value);
    
    if (value.trim().startsWith('/')) {
      const suggestions = commandParser.getAutoCompleteSuggestions(value);
      setChatSuggestions(suggestions);
      setShowChatSuggestions(suggestions.length > 0);
      setSelectedSuggestion(0);
    } else {
      setShowChatSuggestions(false);
      setChatSuggestions([]);
    }
  };

  const executeChatCommand = async (commandInput: string) => {
    if (!commandInput.trim()) return;

    console.log('Executing command:', commandInput); // Debug log
    setIsExecutingCommand(true);

    // Add user message
    const userMessage = {
      id: `user_${Date.now()}`,
      type: 'user' as const,
      content: commandInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);

    // Extract command name for help message
    const commandName = commandInput.split(' ')[0];
    const helpMessage = getCommandHelp(commandName);
    
    // Add helpful blue message
    const helpMsg = {
      id: `help_${Date.now()}`,
      type: 'system' as const,
      content: helpMessage,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, helpMsg]);

    try {
      // Parse command
      const parsedCommand = commandParser.parse(commandInput);
      console.log('Parsed command:', parsedCommand); // Debug log
      
      if (!parsedCommand) {
        const errorMessage = {
          id: `error_${Date.now()}`,
          type: 'error' as const,
          content: `❌ Invalid command: ${commandInput}. Type /help for available commands.`,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, errorMessage]);
        return;
      }

      // Execute command
      const result = await commandExecutor.executeCommand(parsedCommand);
      console.log('Command result:', result); // Debug log
      
      const resultMessage = {
        id: `result_${Date.now()}`,
        type: result.success ? 'success' as const : 'error' as const,
        content: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, resultMessage]);

    } catch (error) {
      console.error('Command execution error:', error); // Debug log
      const errorMessage = {
        id: `error_${Date.now()}`,
        type: 'error' as const,
        content: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsExecutingCommand(false);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim() && !isExecutingCommand) {
      executeChatCommand(chatInput.trim());
      setChatInput('');
      setShowChatSuggestions(false);
    }
  };

  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    if (showChatSuggestions && chatSuggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestion(prev => 
            prev < chatSuggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestion(prev => 
            prev > 0 ? prev - 1 : chatSuggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (chatSuggestions[selectedSuggestion]) {
            setChatInput(chatSuggestions[selectedSuggestion] + ' ');
            setShowChatSuggestions(false);
          }
          break;
        case 'Escape':
          setShowChatSuggestions(false);
          break;
      }
    }
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999]">
        <Button
          onClick={() => setIsVisible(true)}
          className="h-12 w-12 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          title="Open Testing Panel (Tab+` or Ctrl+Shift+T)"
        >
          <Settings className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div 
      ref={panelRef}
      className={`fixed z-[9999] overflow-hidden select-none ${
        isMobile ? 'w-full h-full top-0 left-0 rounded-none' : ''
      }`}
      style={isMobile ? {} : {
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      <Card className="bg-black border-purple-500 shadow-2xl h-full flex flex-col">
        <CardHeader 
          ref={headerRef}
          className={`pb-2 flex-shrink-0 ${isMobile ? '' : 'cursor-grab active:cursor-grabbing'}`}
          onMouseDown={isMobile ? undefined : handleMouseDown}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Testing Panel
              <Move className="h-4 w-4 text-gray-400" />
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetPosition}
                className="h-8 w-8 p-0 text-white hover:bg-gray-800"
                title="Reset Position (Ctrl+Shift+R)"
              >
                <ResetIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0 text-white hover:bg-gray-800"
                title="Expand/Collapse (Ctrl+Shift+E)"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-8 w-8 p-0 text-white hover:bg-gray-800"
                title="Hide Panel"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick Stats */}
          {gameState && (
            <div className="flex gap-2 text-xs">
              <Badge variant="outline" className="text-green-400 border-green-400">
                Score: {gameState.score || 0}
              </Badge>
              <Badge variant="outline" className="text-blue-400 border-blue-400">
                Time: {gameState.timeRemaining || 0}s
              </Badge>
              <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                Combo: {gameState.combo || 0}
              </Badge>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4 flex-1 overflow-y-auto">
          {/* Quick Actions - Always Visible */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Quick Actions
            </h3>
            
            {/* Time Controls */}
            <div className="space-y-2">
              <Label className="text-white text-xs">Time Control</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={timeValue}
                  onChange={(e) => setTimeValue(Number(e.target.value))}
                  className="h-8 text-xs bg-gray-800 border-gray-600 text-white"
                  placeholder="Seconds"
                />
                <Button
                  size="sm"
                  onClick={() => handleQuickAction('addTime', timeValue)}
                  className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleQuickAction('addTime', -timeValue)}
                  className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white text-xs"
                >
                  <Minus className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
            </div>

            {/* Score Controls */}
            <div className="space-y-2">
              <Label className="text-white text-xs">Score Control</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={scoreValue}
                  onChange={(e) => setScoreValue(Number(e.target.value))}
                  className="h-8 text-xs bg-gray-800 border-gray-600 text-white"
                  placeholder="Points"
                />
                <Button
                  size="sm"
                  onClick={() => handleQuickAction('addScore', scoreValue)}
                  className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleQuickAction('addScore', -scoreValue)}
                  className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white text-xs"
                >
                  <Minus className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
            </div>

            {/* Baseline Assessment Test */}
            <div className="space-y-2">
              <Label className="text-white text-xs">Baseline Assessment</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleQuickAction('testBaseline')}
                  className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs flex-1"
                >
                  <Target className="h-3 w-3 mr-1" />
                  Test Assessment
                </Button>
              </div>
            </div>
          </div>

          {/* Testing Chat - Collapsible */}
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('testingChat')}
            >
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Testing Chat
              </h3>
              {sectionsExpanded.testingChat ? 
                <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                <ChevronDown className="h-4 w-4 text-gray-400" />
              }
            </div>
            
            {sectionsExpanded.testingChat && (
              <div className="pl-4 border-l-2 border-purple-500 space-y-3">
                {/* Chat Messages */}
                <div className="bg-gray-800 rounded p-2 h-32 overflow-y-auto">
                  {chatMessages.length === 0 ? (
                    <div className="text-gray-400 text-xs text-center py-4">
                      Type /help for available commands
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {chatMessages.slice(-10).map((message) => (
                        <div key={message.id} className="text-xs">
                          <span className={`${
                            message.type === 'user' ? 'text-blue-400' :
                            message.type === 'success' ? 'text-green-400' :
                            message.type === 'error' ? 'text-red-400' :
                            'text-gray-400'
                          }`}>
                            {message.content}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="relative">
                  <form onSubmit={handleChatSubmit} className="flex gap-1">
                    <div className="flex-1 relative">
                      <Input
                        value={chatInput}
                        onChange={(e) => handleChatInputChange(e.target.value)}
                        onKeyDown={handleChatKeyDown}
                        placeholder="Type command (e.g., /level 50)..."
                        className="h-8 text-xs bg-gray-800 border-gray-600 text-white font-mono"
                        disabled={isExecutingCommand}
                      />
                      {isExecutingCommand && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin h-3 w-3 border-2 border-purple-500 border-t-transparent rounded-full" />
                        </div>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      size="sm"
                      disabled={!chatInput.trim() || isExecutingCommand}
                      className="h-8 px-2 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </form>

                  {/* Auto-complete Suggestions */}
                  {showChatSuggestions && chatSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg z-10 max-h-24 overflow-y-auto">
                      {chatSuggestions.map((suggestion, index) => (
                        <div
                          key={suggestion}
                          className={`p-1 cursor-pointer text-xs ${
                            index === selectedSuggestion ? 'bg-purple-600' : 'hover:bg-gray-700'
                          }`}
                          onClick={() => {
                            setChatInput(suggestion + ' ');
                            setShowChatSuggestions(false);
                          }}
                        >
                          <span className="text-white font-mono">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Command Buttons */}
                <div className="grid grid-cols-2 gap-1">
                  <Button
                    size="sm"
                    onClick={() => executeChatCommand('/help')}
                    className="h-6 px-2 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  >
                    /help
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => executeChatCommand('/level 50')}
                    className="h-6 px-2 bg-green-600 hover:bg-green-700 text-white text-xs"
                  >
                    /level 50
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => executeChatCommand('/coins 10000')}
                    className="h-6 px-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
                  >
                    /coins 10k
                  </Button>
                  <Button
                    size="sm"
                    onClick={clearChat}
                    className="h-6 px-2 bg-red-600 hover:bg-red-700 text-white text-xs"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Stats Management - Collapsible */}
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('statsManagement')}
            >
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Stats Management
              </h3>
              {sectionsExpanded.statsManagement ? 
                <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                <ChevronDown className="h-4 w-4 text-gray-400" />
              }
            </div>
            
            {sectionsExpanded.statsManagement && (
              <div className="space-y-3 pl-4 border-l-2 border-purple-500">
                {/* Preset Buttons */}
                <div className="space-y-2">
                  <Label className="text-white text-xs">Presets</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={() => applyPreset('beginner')}
                      className={`h-8 text-xs ${currentPreset === 'beginner' ? 'bg-green-600' : 'bg-gray-600'} hover:bg-green-700 text-white`}
                    >
                      Beginner
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => applyPreset('intermediate')}
                      className={`h-8 text-xs ${currentPreset === 'intermediate' ? 'bg-green-600' : 'bg-gray-600'} hover:bg-green-700 text-white`}
                    >
                      Intermediate
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => applyPreset('advanced')}
                      className={`h-8 text-xs ${currentPreset === 'advanced' ? 'bg-green-600' : 'bg-gray-600'} hover:bg-green-700 text-white`}
                    >
                      Advanced
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => applyPreset('extreme')}
                      className={`h-8 text-xs ${currentPreset === 'extreme' ? 'bg-green-600' : 'bg-gray-600'} hover:bg-green-700 text-white`}
                    >
                      Extreme
                    </Button>
                  </div>
                </div>

                {/* Stats Control */}
                <div className="space-y-2">
                  <Label className="text-white text-xs">Stats Control</Label>
                  
                  {/* Coins */}
                  <div className="space-y-1">
                    <Label className="text-gray-300 text-xs flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      Coins
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={coinValue}
                        onChange={(e) => setCoinValue(Number(e.target.value))}
                        className="h-8 text-xs bg-gray-800 border-gray-600 text-white"
                        placeholder="Coins"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleQuickAction('addCoins', coinValue)}
                        className="h-8 px-3 bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="space-y-1">
                    <Label className="text-gray-300 text-xs flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      XP
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={xpValue}
                        onChange={(e) => setXpValue(Number(e.target.value))}
                        className="h-8 text-xs bg-gray-800 border-gray-600 text-white"
                        placeholder="XP"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleQuickAction('addXp', xpValue)}
                        className="h-8 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="space-y-1">
                    <Label className="text-gray-300 text-xs flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Streak
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={streakValue}
                        onChange={(e) => setStreakValue(Number(e.target.value))}
                        className="h-8 text-xs bg-gray-800 border-gray-600 text-white"
                        placeholder="Streak"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleQuickAction('addStreak', streakValue)}
                        className="h-8 px-3 bg-orange-600 hover:bg-orange-700 text-white text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Level */}
                  <div className="space-y-1">
                    <Label className="text-gray-300 text-xs flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      Level
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={levelValue}
                        onChange={(e) => setLevelValue(Number(e.target.value))}
                        className="h-8 text-xs bg-gray-800 border-gray-600 text-white"
                        placeholder="Level"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleQuickAction('addLevel', levelValue)}
                        className="h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="space-y-1">
                    <Label className="text-gray-300 text-xs flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      Points
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={pointsValue}
                        onChange={(e) => setPointsValue(Number(e.target.value))}
                        className="h-8 text-xs bg-gray-800 border-gray-600 text-white"
                        placeholder="Points"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleQuickAction('addPoints', pointsValue)}
                        className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Shop Testing - Collapsible */}
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('shopTesting')}
            >
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Shop Testing
              </h3>
              {sectionsExpanded.shopTesting ? 
                <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                <ChevronDown className="h-4 w-4 text-gray-400" />
              }
            </div>
            
            {sectionsExpanded.shopTesting && (
              <div className="space-y-3 pl-4 border-l-2 border-yellow-500">
                {/* Coin Balance Display */}
                <div className="space-y-1">
                  <Label className="text-white text-xs">Current Balance</Label>
                  <div className="bg-gray-800 p-2 rounded text-white text-sm">
                    <Coins className="h-4 w-4 inline mr-1" />
                    {getCoinBalance()} coins
                  </div>
                </div>

                {/* Add/Remove Coins */}
                <div className="space-y-2">
                  <Label className="text-white text-xs">Coin Management</Label>
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      value={coinValue}
                      onChange={(e) => setCoinValue(Number(e.target.value))}
                      className="h-8 text-xs bg-gray-800 border-gray-600 text-white"
                      placeholder="Coins"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleQuickAction('addCoins', coinValue)}
                      className="h-8 px-3 bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleQuickAction('spendCoins', coinValue)}
                      className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white text-xs"
                    >
                      <Minus className="h-3 w-3 mr-1" />
                      Spend
                    </Button>
                  </div>
                </div>

                {/* Quick Purchase Test */}
                <div className="space-y-2">
                  <Label className="text-white text-xs">Quick Purchase</Label>
                  <Button
                    size="sm"
                    onClick={() => handleQuickAction('purchaseItem', 0)}
                    className="w-full h-8 bg-green-600 hover:bg-green-700 text-white text-xs"
                  >
                    Buy Early Supporter Badge (100 coins)
                  </Button>
                </div>

                {/* Clear All Items */}
                <div className="space-y-2">
                  <Label className="text-white text-xs">Reset Inventory</Label>
                  <Button
                    size="sm"
                    onClick={() => handleQuickAction('clearAllItems', 0)}
                    className="w-full h-8 bg-red-600 hover:bg-red-700 text-white text-xs"
                  >
                    Clear All Owned Items
                  </Button>
                </div>

                {/* Inventory Display */}
                <div className="space-y-1">
                  <Label className="text-white text-xs">Inventory</Label>
                  <div className="bg-gray-800 p-2 rounded text-white text-xs max-h-20 overflow-y-auto">
                    {Object.keys(getUserInventory().items).length > 0 ? (
                      Object.keys(getUserInventory().items).map(itemId => (
                        <div key={itemId} className="text-green-400">• {itemId}</div>
                      ))
                    ) : (
                      <div className="text-gray-400">No items owned</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Popup Testing - Collapsible */}
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('popupTesting')}
            >
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                Popup Testing
              </h3>
              {sectionsExpanded.popupTesting ? 
                <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                <ChevronDown className="h-4 w-4 text-gray-400" />
              }
            </div>
            
            {sectionsExpanded.popupTesting && (
              <div className="pl-4 border-l-2 border-purple-500">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    onClick={() => testing.triggerPenaltyPopup(5)}
                    className="h-8 bg-green-600 hover:bg-green-700 text-white text-xs"
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    +5s
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => testing.triggerPenaltyPopup(-3)}
                    className="h-8 bg-red-600 hover:bg-red-700 text-white text-xs"
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    -3s
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => testing.triggerStreakPopup('milestone')}
                    className="h-8 bg-orange-600 hover:bg-orange-700 text-white text-xs"
                  >
                    <Trophy className="h-3 w-3 mr-1" />
                    Streak
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => testing.triggerStreakPopup('pb')}
                    className="h-8 bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
                  >
                    <Trophy className="h-3 w-3 mr-1" />
                    PB
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Game Controls - Collapsible */}
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('gameControls')}
            >
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Play className="h-4 w-4" />
                Game Controls
              </h3>
              {sectionsExpanded.gameControls ? 
                <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                <ChevronDown className="h-4 w-4 text-gray-400" />
              }
            </div>
            
            {sectionsExpanded.gameControls && (
              <div className="pl-4 border-l-2 border-purple-500">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={testing.pauseToggle}
                    className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs flex-1"
                  >
                    <Pause className="h-3 w-3 mr-1" />
                    Pause Toggle
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Data Management - Collapsible */}
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('dataManagement')}
            >
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Save className="h-4 w-4" />
                Data Management
              </h3>
              {sectionsExpanded.dataManagement ? 
                <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                <ChevronDown className="h-4 w-4 text-gray-400" />
              }
            </div>
            
            {sectionsExpanded.dataManagement && (
              <div className="pl-4 border-l-2 border-purple-500 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    onClick={handleExportData}
                    className="h-8 bg-purple-600 hover:bg-purple-700 text-white text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleImportData}
                    className="h-8 bg-purple-600 hover:bg-purple-700 text-white text-xs"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Import
                  </Button>
                </div>
                
                <Button
                  size="sm"
                  onClick={handleResetData}
                  className="h-8 w-full bg-red-600 hover:bg-red-700 text-white text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Reset All Data
                </Button>
              </div>
            )}
          </div>

          {/* ELO Ranking System Testing - Collapsible */}
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('eloRanking')}
            >
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Crown className="h-4 w-4" />
                ELO Ranking System
              </h3>
              {sectionsExpanded.eloRanking ? 
                <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                <ChevronDown className="h-4 w-4 text-gray-400" />
              }
            </div>
            
            {sectionsExpanded.eloRanking && (
              <div className="pl-4 border-l-2 border-yellow-500 space-y-3">
                <div className="space-y-2">
                  <Label className="text-white text-xs">All Ranks</Label>
                  <div className="grid grid-cols-4 gap-1">
                    {/* Iron Tier */}
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Iron IV')}
                      className="h-6 bg-gray-800 hover:bg-gray-700 text-white text-xs"
                    >
                      Iron IV
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Iron III')}
                      className="h-6 bg-gray-800 hover:bg-gray-700 text-white text-xs"
                    >
                      Iron III
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Iron II')}
                      className="h-6 bg-gray-800 hover:bg-gray-700 text-white text-xs"
                    >
                      Iron II
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Iron I')}
                      className="h-6 bg-gray-800 hover:bg-gray-700 text-white text-xs"
                    >
                      Iron I
                    </Button>
                    
                    {/* Bronze Tier */}
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Bronze IV')}
                      className="h-6 bg-amber-600 hover:bg-amber-700 text-white text-xs"
                    >
                      Bronze IV
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Bronze III')}
                      className="h-6 bg-amber-600 hover:bg-amber-700 text-white text-xs"
                    >
                      Bronze III
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Bronze II')}
                      className="h-6 bg-amber-600 hover:bg-amber-700 text-white text-xs"
                    >
                      Bronze II
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Bronze I')}
                      className="h-6 bg-amber-600 hover:bg-amber-700 text-white text-xs"
                    >
                      Bronze I
                    </Button>
                    
                    {/* Silver Tier */}
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Silver IV')}
                      className="h-6 bg-gray-500 hover:bg-gray-600 text-white text-xs"
                    >
                      Silver IV
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Silver III')}
                      className="h-6 bg-gray-500 hover:bg-gray-600 text-white text-xs"
                    >
                      Silver III
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Silver II')}
                      className="h-6 bg-gray-500 hover:bg-gray-600 text-white text-xs"
                    >
                      Silver II
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Silver I')}
                      className="h-6 bg-gray-500 hover:bg-gray-600 text-white text-xs"
                    >
                      Silver I
                    </Button>
                    
                    {/* Gold Tier */}
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Gold IV')}
                      className="h-6 bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
                    >
                      Gold IV
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Gold III')}
                      className="h-6 bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
                    >
                      Gold III
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Gold II')}
                      className="h-6 bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
                    >
                      Gold II
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Gold I')}
                      className="h-6 bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
                    >
                      Gold I
                    </Button>
                    
                    {/* Platinum Tier */}
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Platinum IV')}
                      className="h-6 bg-teal-600 hover:bg-teal-700 text-white text-xs"
                    >
                      Plat IV
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Platinum III')}
                      className="h-6 bg-teal-600 hover:bg-teal-700 text-white text-xs"
                    >
                      Plat III
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Platinum II')}
                      className="h-6 bg-teal-600 hover:bg-teal-700 text-white text-xs"
                    >
                      Plat II
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Platinum I')}
                      className="h-6 bg-teal-600 hover:bg-teal-700 text-white text-xs"
                    >
                      Plat I
                    </Button>
                    
                    {/* Diamond Tier */}
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Diamond IV')}
                      className="h-6 bg-blue-500 hover:bg-blue-600 text-white text-xs"
                    >
                      Dia IV
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Diamond III')}
                      className="h-6 bg-blue-500 hover:bg-blue-600 text-white text-xs"
                    >
                      Dia III
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Diamond II')}
                      className="h-6 bg-blue-500 hover:bg-blue-600 text-white text-xs"
                    >
                      Dia II
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Diamond I')}
                      className="h-6 bg-blue-500 hover:bg-blue-600 text-white text-xs"
                    >
                      Dia I
                    </Button>
                    
                    {/* Master Tier */}
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Master')}
                      className="h-6 bg-purple-600 hover:bg-purple-700 text-white text-xs"
                    >
                      Master
                    </Button>
                    
                    {/* Grandmaster Tier */}
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Grandmaster')}
                      className="h-6 bg-red-600 hover:bg-red-700 text-white text-xs"
                    >
                      GM
                    </Button>
                    
                    {/* Challenger Tier */}
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-division Challenger')}
                      className="h-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-xs"
                    >
                      Challenger
                    </Button>
                    
                    {/* Reset Button */}
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/elo-reset-all')}
                      className="h-6 bg-gray-700 hover:bg-gray-800 text-white text-xs"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Data Context Testing - Collapsible */}
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('userDataContext')}
            >
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Brain className="h-4 w-4" />
                User Data Context
              </h3>
              {sectionsExpanded.userDataContext ? 
                <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                <ChevronDown className="h-4 w-4 text-gray-400" />
              }
            </div>
            
            {sectionsExpanded.userDataContext && (
              <div className="pl-4 border-l-2 border-blue-500 space-y-3">
                <div className="space-y-2">
                  <Label className="text-white text-xs">Context Testing</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/context refresh')}
                      className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    >
                      Refresh Context
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/context status')}
                      className="h-8 bg-green-600 hover:bg-green-700 text-white text-xs"
                    >
                      Check Status
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/context reset')}
                      className="h-8 bg-red-600 hover:bg-red-700 text-white text-xs"
                    >
                      Reset Context
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/context debug')}
                      className="h-8 bg-purple-600 hover:bg-purple-700 text-white text-xs"
                    >
                      Debug Info
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Match History Testing - Collapsible */}
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('matchHistory')}
            >
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Match History
              </h3>
              {sectionsExpanded.matchHistory ? 
                <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                <ChevronDown className="h-4 w-4 text-gray-400" />
              }
            </div>
            
            {sectionsExpanded.matchHistory && (
              <div className="pl-4 border-l-2 border-green-500 space-y-3">
                <div className="space-y-2">
                  <Label className="text-white text-xs">History Testing</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/history add test')}
                      className="h-8 bg-green-600 hover:bg-green-700 text-white text-xs"
                    >
                      Add Test Game
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/history clear')}
                      className="h-8 bg-red-600 hover:bg-red-700 text-white text-xs"
                    >
                      Clear History
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/history stats')}
                      className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    >
                      View Stats
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/history export')}
                      className="h-8 bg-purple-600 hover:bg-purple-700 text-white text-xs"
                    >
                      Export Data
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Smart Notifications Testing - Collapsible */}
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('smartNotifications')}
            >
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Smart Notifications
              </h3>
              {sectionsExpanded.smartNotifications ? 
                <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                <ChevronDown className="h-4 w-4 text-gray-400" />
              }
            </div>
            
            {sectionsExpanded.smartNotifications && (
              <div className="pl-4 border-l-2 border-pink-500 space-y-3">
                <div className="space-y-2">
                  <Label className="text-white text-xs">Notification Testing</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/notify test')}
                      className="h-8 bg-pink-600 hover:bg-pink-700 text-white text-xs"
                    >
                      Test Notification
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/notify generate')}
                      className="h-8 bg-purple-600 hover:bg-purple-700 text-white text-xs"
                    >
                      Generate Smart
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/notify clear')}
                      className="h-8 bg-red-600 hover:bg-red-700 text-white text-xs"
                    >
                      Clear All
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/notify settings')}
                      className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    >
                      Settings
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Comprehensive Testing Suite - Collapsible */}
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('comprehensiveTesting')}
            >
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Award className="h-4 w-4" />
                Comprehensive Testing
              </h3>
              {sectionsExpanded.comprehensiveTesting ? 
                <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                <ChevronDown className="h-4 w-4 text-gray-400" />
              }
            </div>
            
            {sectionsExpanded.comprehensiveTesting && (
              <div className="pl-4 border-l-2 border-cyan-500 space-y-3">
                <div className="space-y-2">
                  <Label className="text-white text-xs">Test Suites</Label>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/test all')}
                      className="h-8 bg-cyan-600 hover:bg-cyan-700 text-white text-xs"
                    >
                      Run All Tests
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/test dashboard')}
                      className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    >
                      Test Dashboard
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/test elo')}
                      className="h-8 bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
                    >
                      Test ELO System
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/test daily')}
                      className="h-8 bg-green-600 hover:bg-green-700 text-white text-xs"
                    >
                      Test Daily Tasks
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/test data')}
                      className="h-8 bg-purple-600 hover:bg-purple-700 text-white text-xs"
                    >
                      Test Data Flow
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white text-xs">Quick Scenarios</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/scenario newuser')}
                      className="h-8 bg-green-600 hover:bg-green-700 text-white text-xs"
                    >
                      New User
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/scenario poweruser')}
                      className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    >
                      Power User
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/scenario casual')}
                      className="h-8 bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
                    >
                      Casual User
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeChatCommand('/scenario reset')}
                      className="h-8 bg-red-600 hover:bg-red-700 text-white text-xs"
                    >
                      Reset All
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        {/* Resize Handle */}
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize bg-purple-500 hover:bg-purple-400 transition-colors"
          onMouseDown={handleResizeMouseDown}
          title="Resize panel"
        >
          <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-white opacity-50"></div>
        </div>
      </Card>
    </div>
  );
};
