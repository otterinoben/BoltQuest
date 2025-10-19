// src/components/play/ProgressiveDisclosure.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Zap, BookOpen, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { Category, Difficulty } from '@/types/game';

interface ProgressiveDisclosureProps {
  userType: 'new' | 'returning' | 'power';
  onQuickStart: () => void;
  onCustomize: () => void;
  onAdvanced: () => void;
  quickStartSettings: any;
}

export const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  userType,
  onQuickStart,
  onCustomize,
  onAdvanced,
  quickStartSettings,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const getQuickStartDescription = () => {
    switch (userType) {
      case 'new':
        return 'Start with our recommended settings to get familiar with the game';
      case 'returning':
        return 'Continue with your preferred settings from last time';
      case 'power':
        return 'Jump right in with your optimized configuration';
      default:
        return 'Start playing with smart recommendations';
    }
  };

  const getQuickStartButtonText = () => {
    switch (userType) {
      case 'new':
        return 'Start Learning';
      case 'returning':
        return 'Continue Playing';
      case 'power':
        return 'Quick Start';
      default:
        return 'Start Playing';
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Start Section */}
      <Card className="border-primary/50 bg-gradient-primary shadow-elegant">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-primary-foreground">
            <Zap className="h-5 w-5" />
            Quick Start
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-primary-foreground/80">
            {getQuickStartDescription()}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
              {quickStartSettings.category}
            </Badge>
            <Badge variant="outline" className="text-xs bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
              {quickStartSettings.difficulty}
            </Badge>
            <Badge variant="outline" className="text-xs bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
              {quickStartSettings.mode}
            </Badge>
            <Badge variant="outline" className="text-xs bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
              {quickStartSettings.timer}s
            </Badge>
          </div>

          <Button 
            onClick={onQuickStart}
            size="lg"
            className="w-full bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-primary-foreground/30"
          >
            <Zap className="mr-2 h-5 w-5" />
            {getQuickStartButtonText()}
          </Button>
        </CardContent>
      </Card>

      {/* Customize Section */}
      <Card className="border-border shadow-elegant hover:shadow-glow transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Customize Your Game
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {userType === 'new' 
              ? 'Choose your own categories, difficulty, and game mode'
              : 'Adjust settings to match your preferences'
            }
          </p>

          <Button 
            onClick={onCustomize}
            variant="outline"
            className="w-full"
          >
            <Settings className="mr-2 h-4 w-4" />
            Customize Settings
          </Button>
        </CardContent>
      </Card>

      {/* Advanced Section (for power users) */}
      {userType === 'power' && (
        <Card className="border-accent/50 bg-gradient-accent shadow-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-accent-foreground">
              <Target className="h-5 w-5" />
              Advanced Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-accent-foreground/80">
              Access all customization options, favorites, and advanced features
            </p>

            <Button 
              onClick={onAdvanced}
              variant="outline"
              className="w-full bg-accent-foreground/10 hover:bg-accent-foreground/20 text-accent-foreground border-accent-foreground/30"
            >
              <Target className="mr-2 h-4 w-4" />
              Advanced Settings
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Show Advanced Toggle (for returning users) */}
      {userType === 'returning' && (
        <Card className="border-border shadow-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                More Options
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          {showAdvanced && (
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Access advanced features and full customization
              </p>
              <Button 
                onClick={onAdvanced}
                variant="outline"
                className="w-full"
              >
                <Target className="mr-2 h-4 w-4" />
                Advanced Settings
              </Button>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};
