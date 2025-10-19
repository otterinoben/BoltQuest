import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  Book, 
  MessageCircle, 
  Mail, 
  Zap, 
  Clock, 
  Target, 
  Trophy, 
  User, 
  Settings, 
  BarChart3, 
  Play, 
  Pause, 
  SkipForward,
  Keyboard,
  MousePointer,
  Star,
  TrendingUp,
  Brain,
  DollarSign,
  Megaphone,
  Monitor
} from "lucide-react";

const Help = () => {
  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground mb-2">Help & Support</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Everything you need to know about BoltQuest - from basic gameplay to advanced features
        </p>
      </div>

      {/* Quick Start Guide */}
        <Card className="border-accent/50 bg-gradient-accent shadow-glow">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-accent-foreground">
            <Zap className="h-6 w-6" />
            Quick Start Guide
          </CardTitle>
          <CardDescription className="text-accent-foreground/80">
            Get playing in under 2 minutes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-accent-foreground/10">
              <div className="w-8 h-8 rounded-full bg-accent-foreground text-accent flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <h4 className="font-semibold text-accent-foreground">Choose Your Game</h4>
                <p className="text-sm text-accent-foreground/80">Pick Quick Play or Training Mode</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-accent-foreground/10">
              <div className="w-8 h-8 rounded-full bg-accent-foreground text-accent flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <h4 className="font-semibold text-accent-foreground">Select Category</h4>
                <p className="text-sm text-accent-foreground/80">Tech, Business, Marketing, Finance, or General</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-accent-foreground/10">
              <div className="w-8 h-8 rounded-full bg-accent-foreground text-accent flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <h4 className="font-semibold text-accent-foreground">Start Playing</h4>
                <p className="text-sm text-accent-foreground/80">Answer questions and build your score!</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Modes */}
      <Card className="border-border shadow-elegant">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Play className="h-6 w-6" />
            Game Modes
          </CardTitle>
          <CardDescription>
            Choose the mode that fits your learning style
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Quick Play</h3>
                <Badge variant="default" className="bg-primary text-primary-foreground">Timed</Badge>
              </div>
              <p className="text-muted-foreground mb-4">
                Race against the clock! Answer as many questions as possible before time runs out.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Choose timer: 30s, 45s, or 60s
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Correct answers add +3 seconds
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Skip penalty: -10 seconds
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Pause anytime with Space key
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-lg border border-secondary/20 bg-secondary/5">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-6 w-6 text-secondary-foreground" />
                <h3 className="text-xl font-semibold">Training Mode</h3>
                <Badge variant="secondary">Untimed</Badge>
              </div>
              <p className="text-muted-foreground mb-4">
                Learn at your own pace! Perfect for studying and understanding new concepts.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary-foreground"></div>
                  No time pressure
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary-foreground"></div>
                  Focus on learning
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary-foreground"></div>
                  Skip questions freely
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary-foreground"></div>
                  Track accuracy and progress
                </li>
              </ul>
            </div>
          </div>
          </CardContent>
        </Card>

      {/* Categories & Difficulty */}
      <Card className="border-border shadow-elegant">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Categories & Difficulty
          </CardTitle>
          <CardDescription>
            Choose your learning focus and challenge level
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-lg border border-border text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h4 className="font-semibold mb-1">Technology</h4>
              <p className="text-xs text-muted-foreground">Software, AI, Web Dev</p>
            </div>
            <div className="p-4 rounded-lg border border-border text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h4 className="font-semibold mb-1">Business</h4>
              <p className="text-xs text-muted-foreground">Strategy, Management</p>
            </div>
            <div className="p-4 rounded-lg border border-border text-center">
              <Megaphone className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <h4 className="font-semibold mb-1">Marketing</h4>
              <p className="text-xs text-muted-foreground">Digital Marketing, Growth</p>
            </div>
            <div className="p-4 rounded-lg border border-border text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <h4 className="font-semibold mb-1">Finance</h4>
              <p className="text-xs text-muted-foreground">Investment, Banking</p>
            </div>
            <div className="p-4 rounded-lg border border-border text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-gray-500" />
              <h4 className="font-semibold mb-1">General</h4>
              <p className="text-xs text-muted-foreground">Mixed Topics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <h4 className="font-semibold text-green-700 dark:text-green-300">Easy</h4>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                Basic terms and common buzzwords. Perfect for beginners.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <h4 className="font-semibold text-yellow-700 dark:text-yellow-300">Medium</h4>
              </div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Intermediate concepts and industry-specific terminology.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <h4 className="font-semibold text-red-700 dark:text-red-300">Hard</h4>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400">
                Advanced concepts and specialized terminology for experts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls & Shortcuts */}
      <Card className="border-border shadow-elegant">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Keyboard className="h-6 w-6" />
            Controls & Shortcuts
          </CardTitle>
          <CardDescription>
            Master the keyboard shortcuts for faster gameplay
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                Keyboard Shortcuts
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <Pause className="h-4 w-4 text-muted-foreground" />
                    <span>Pause/Resume Game</span>
                  </div>
                  <Badge variant="outline" className="font-mono">Space</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <SkipForward className="h-4 w-4 text-muted-foreground" />
                    <span>Skip Question</span>
                  </div>
                  <Badge variant="outline" className="font-mono">S</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MousePointer className="h-5 w-5" />
                Mouse Controls
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">A</span>
                  </div>
                  <span>Click answer buttons to select</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="w-8 h-8 rounded bg-secondary/10 flex items-center justify-center">
                    <Pause className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <span>Click pause button or use Space</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center">
                    <SkipForward className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <span>Click skip button or press S</span>
                </div>
              </div>
            </div>
          </div>
          </CardContent>
        </Card>

      {/* Scoring System */}
      <Card className="border-border shadow-elegant">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Scoring System
          </CardTitle>
          <CardDescription>
            How to maximize your score and climb the leaderboards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Scoring</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Correct Answer
                  </span>
                  <Badge variant="default" className="bg-green-500 text-white">+1 Point</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    Wrong Answer
                  </span>
                  <Badge variant="destructive">+0 Points</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    Skipped Question
                  </span>
                  <Badge variant="secondary">+0 Points</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Combo System</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">Combo Streak</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get consecutive correct answers to build your combo multiplier
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Score Boost</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Higher combos = higher scores on the leaderboard
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h4 className="font-semibold text-primary mb-2">Quick Play Time Bonuses</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Correct Answer: +3 seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Skip Question: -10 seconds</span>
              </div>
            </div>
          </div>
          </CardContent>
        </Card>

      {/* Profile & Settings */}
      <Card className="border-border shadow-elegant">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6" />
            Profile & Settings
          </CardTitle>
          <CardDescription>
            Customize your BoltQuest experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Profile Features</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Custom Username</h4>
                    <p className="text-sm text-muted-foreground">Set your display name</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <div>
                    <h4 className="font-semibold">Avatar Selection</h4>
                    <p className="text-sm text-muted-foreground">Choose colors or upload custom image</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <Brain className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Interest Categories</h4>
                    <p className="text-sm text-muted-foreground">Set your favorite topics</p>
                  </div>
                </div>
              </div>
      </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Analytics & Progress</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Performance Stats</h4>
                    <p className="text-sm text-muted-foreground">Track accuracy and improvement</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <Trophy className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">High Scores</h4>
                    <p className="text-sm text-muted-foreground">Personal bests by category</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Game History</h4>
                    <p className="text-sm text-muted-foreground">Recent games and trends</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="border-border shadow-elegant">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <HelpCircle className="h-6 w-6" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Quick answers to common questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                How do I get started with BoltQuest?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Simply visit the Play page, choose your game mode (Quick Play or Training), select a category and difficulty, then start playing! New users will see an onboarding flow to set up their profile.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                What's the difference between Quick Play and Training Mode?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Quick Play is timed and competitive - you race against the clock with penalties for skipping. Training Mode is untimed and perfect for learning - you can skip freely and focus on understanding the concepts.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                How does the scoring system work?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                It's simple: 1 point per correct answer! Build combo streaks by getting consecutive answers right. In Quick Play, correct answers add +3 seconds to your timer, while skipping costs -10 seconds.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                Can I pause the game?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! Press the Space key or click the pause button to pause/resume the game. This works in both Quick Play and Training modes. The timer stops when paused.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                How do I improve my leaderboard ranking?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Play consistently, maintain combo streaks, and challenge yourself with harder difficulties. The leaderboard tracks your highest scores across all category and difficulty combinations.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left">
                Can I customize my profile and preferences?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Absolutely! Visit your Profile page to set your username, choose an avatar, select favorite categories, and view your performance analytics. You can also update preferences via the Profile page.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left">
                What categories and difficulties are available?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We have 5 categories: Technology, Business, Marketing, Finance, and General. Each has 3 difficulty levels: Easy (basic terms), Medium (intermediate concepts), and Hard (advanced terminology).
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger className="text-left">
                Is my progress saved automatically?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! All your game data, high scores, statistics, and profile settings are automatically saved locally in your browser. Your progress persists between sessions.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact & Support */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border shadow-elegant hover:shadow-glow transition-all">
          <CardContent className="pt-6 text-center">
            <Book className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Game Guide</h3>
            <p className="text-muted-foreground mb-4">
              Detailed gameplay mechanics and strategies
            </p>
            <Button variant="outline" className="w-full">
              View Complete Guide
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border shadow-elegant hover:shadow-glow transition-all">
          <CardContent className="pt-6 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Community</h3>
            <p className="text-muted-foreground mb-4">
              Connect with other BoltQuest players
            </p>
            <Button variant="outline" className="w-full">
              Join Community
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border shadow-elegant hover:shadow-glow transition-all">
          <CardContent className="pt-6 text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Contact Support</h3>
            <p className="text-muted-foreground mb-4">
              Need help? We're here to assist you
            </p>
            <Button variant="outline" className="w-full">
              Get Support
            </Button>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Help;
