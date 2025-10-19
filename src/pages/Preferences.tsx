import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  Bell, 
  BellOff, 
  Palette, 
  Globe, 
  Clock, 
  Target, 
  Brain, 
  Eye, 
  EyeOff,
  Save,
  RotateCcw,
  Zap,
  Timer,
  HelpCircle
} from "lucide-react";
import { toast } from "sonner";
import { AutoSaveStatus } from '@/components/AutoSaveStatus';
import { getUserProfile, updateUserProfile, saveUserProfile } from "@/lib/userStorage";
import { Category, Difficulty } from "@/types/game";
import { useTheme } from "@/contexts/ThemeContext";
import { useAudio } from "@/contexts/AudioContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

const Preferences = () => {
  const { theme, setTheme } = useTheme();
  const { soundEnabled, musicEnabled, setSoundEnabled, setMusicEnabled } = useAudio();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  
  const [userProfile, setUserProfile] = useState(() => {
    try {
      return getUserProfile();
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  });

  const [preferences, setPreferences] = useState({
    // Game Settings
    defaultCategory: 'general' as Category,
    defaultDifficulty: 'medium' as Difficulty,
    timerDuration: 20,
    hintsEnabled: false,
    autoPause: false,
    
    // UI Settings - Use context values
    theme: theme,
    soundEnabled: soundEnabled,
    musicEnabled: musicEnabled,
    
    // Notification Settings
    notificationsEnabled: true,
    
    // Language - Use context value
    language: language,
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Load preferences from user profile
  useEffect(() => {
    if (userProfile?.preferences) {
      setPreferences({
        defaultCategory: userProfile.preferences.defaultCategory || 'general',
        defaultDifficulty: userProfile.preferences.defaultDifficulty || 'medium',
        timerDuration: userProfile.preferences.timerDuration || 20,
        hintsEnabled: userProfile.preferences.hintsEnabled || false,
        autoPause: userProfile.preferences.autoPause || false,
        theme: userProfile.preferences.theme || 'system',
        soundEnabled: userProfile.preferences.soundEnabled !== false,
        musicEnabled: userProfile.preferences.musicEnabled !== false,
        notificationsEnabled: userProfile.preferences.notificationsEnabled !== false,
        language: userProfile.preferences.language || 'en',
      });
    }
  }, [userProfile]);

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    
    // Handle context changes immediately
    if (key === 'theme') {
      setTheme(value);
    } else if (key === 'soundEnabled') {
      setSoundEnabled(value);
    } else if (key === 'musicEnabled') {
      setMusicEnabled(value);
    } else if (key === 'language') {
      setLanguage(value);
    }
    
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!userProfile) {
      toast.error("No user profile found");
      return;
    }

    try {
      const updatedProfile = {
        ...userProfile,
        preferences: {
          ...userProfile.preferences,
          ...preferences,
        }
      };

      const success = saveUserProfile(updatedProfile);
      if (success) {
        setUserProfile(updatedProfile);
        setHasChanges(false);
        toast.success("Preferences saved successfully!");
      } else {
        toast.error("Failed to save preferences");
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error("Failed to save preferences");
    }
  };

  const handleReset = () => {
    if (userProfile?.preferences) {
      setPreferences({
        defaultCategory: userProfile.preferences.defaultCategory || 'general',
        defaultDifficulty: userProfile.preferences.defaultDifficulty || 'medium',
        timerDuration: userProfile.preferences.timerDuration || 20,
        hintsEnabled: userProfile.preferences.hintsEnabled || false,
        autoPause: userProfile.preferences.autoPause || false,
        theme: userProfile.preferences.theme || 'system',
        soundEnabled: userProfile.preferences.soundEnabled !== false,
        musicEnabled: userProfile.preferences.musicEnabled !== false,
        notificationsEnabled: userProfile.preferences.notificationsEnabled !== false,
        language: userProfile.preferences.language || 'en',
      });
      setHasChanges(false);
      toast.info("Preferences reset to saved values");
    }
  };

  const categories = [
    { value: 'tech', label: 'Technology' },
    { value: 'business', label: 'Business' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'finance', label: 'Finance' },
    { value: 'general', label: 'General' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-orange-600' },
    { value: 'hard', label: 'Hard', color: 'text-red-600' }
  ];

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' }
  ];

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Preferences</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Customize your BoltQuest experience
        </p>
      </div>

      {/* Save/Reset Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              Unsaved Changes
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Preferences Sections */}
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Game Settings */}
        <Card className="border-border shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Game Settings
            </CardTitle>
            <CardDescription>
              Configure your default game preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Default Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Default Category</Label>
                <Select 
                  value={preferences.defaultCategory} 
                  onValueChange={(value) => handlePreferenceChange('defaultCategory', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Default Difficulty */}
              <div className="space-y-2">
                <Label htmlFor="difficulty">Default Difficulty</Label>
                <Select 
                  value={preferences.defaultDifficulty} 
                  onValueChange={(value) => handlePreferenceChange('defaultDifficulty', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((difficulty) => (
                      <SelectItem key={difficulty.value} value={difficulty.value}>
                        <span className={difficulty.color}>{difficulty.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Timer Duration */}
            <div className="space-y-3">
              <Label htmlFor="timer">Timer Duration: {preferences.timerDuration} seconds</Label>
              <Slider
                value={[preferences.timerDuration]}
                onValueChange={([value]) => handlePreferenceChange('timerDuration', value)}
                min={10}
                max={120}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10s</span>
                <span>120s</span>
              </div>
            </div>

            <Separator />

            {/* Game Features */}
            <div className="space-y-4">
              <h4 className="font-medium">Game Features</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="hints">Show Hints</Label>
                    <p className="text-sm text-muted-foreground">
                      Display helpful hints during gameplay
                    </p>
                  </div>
                  <Switch
                    id="hints"
                    checked={preferences.hintsEnabled}
                    onCheckedChange={(checked) => handlePreferenceChange('hintsEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoPause">Auto Pause</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically pause when switching tabs
                    </p>
                  </div>
                  <Switch
                    id="autoPause"
                    checked={preferences.autoPause}
                    onCheckedChange={(checked) => handlePreferenceChange('autoPause', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* UI Settings */}
        <Card className="border-border shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Interface Settings
            </CardTitle>
            <CardDescription>
              Customize the look and feel of the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Theme */}
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select 
                  value={preferences.theme} 
                  onValueChange={(value) => handlePreferenceChange('theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((theme) => (
                      <SelectItem key={theme.value} value={theme.value}>
                        {theme.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select 
                  value={preferences.language} 
                  onValueChange={(value) => handlePreferenceChange('language', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language.value} value={language.value}>
                        {language.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Audio Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">Audio Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sound" className="flex items-center gap-2">
                      {preferences.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      Sound Effects
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Play sound effects during gameplay
                    </p>
                  </div>
                  <Switch
                    id="sound"
                    checked={preferences.soundEnabled}
                    onCheckedChange={(checked) => handlePreferenceChange('soundEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="music" className="flex items-center gap-2">
                      {preferences.musicEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      Background Music
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Play background music during gameplay
                    </p>
                  </div>
                  <Switch
                    id="music"
                    checked={preferences.musicEnabled}
                    onCheckedChange={(checked) => handlePreferenceChange('musicEnabled', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-border shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {preferences.notificationsEnabled ? <Bell className="h-5 w-5 text-primary" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
              Notifications
            </CardTitle>
            <CardDescription>
              Manage how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications for achievements, daily tasks, and updates
                </p>
              </div>
              <Switch
                id="notifications"
                checked={preferences.notificationsEnabled}
                onCheckedChange={(checked) => handlePreferenceChange('notificationsEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Auto-Save Status */}
        <AutoSaveStatus />

        {/* Quick Actions */}
        <Card className="border-border shadow-elegant">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => navigate('/profile')}
              >
                <Brain className="h-4 w-4" />
                Update Interests
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => {
                  localStorage.removeItem('boltquest_tutorial_completed');
                  toast.success("Tutorial reset! It will show on your next visit to Play page.");
                }}
              >
                <HelpCircle className="h-4 w-4" />
                Reset Tutorial
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => navigate('/play')}
              >
                <Target className="h-4 w-4" />
                Start Playing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Preferences;
