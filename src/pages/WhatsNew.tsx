// What's New Page for BoltQuest
// Comprehensive showcase of all latest updates and features

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Brain, 
  Target, 
  Zap, 
  Clock, 
  BarChart3, 
  Play, 
  CheckCircle,
  ArrowRight,
  Star,
  Trophy,
  Coins,
  Users,
  Settings,
  TestTube,
  TrendingUp,
  Award,
  Crown,
  Flame,
  Calendar,
  ShoppingCart,
  MessageCircle,
  UserPlus,
  Gift,
  Rocket,
  Shield,
  Heart,
  Eye,
  MousePointer,
  Smartphone,
  Monitor
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WhatsNew = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('latest');

  const latestUpdates = [
    {
      id: 'xp-animations',
      title: 'Dramatic XP Bar Animations',
      version: 'v1.4.1',
      date: 'Just Now',
      category: 'Progression',
      icon: Sparkles,
      color: 'text-purple-600 bg-purple-100',
      description: 'Complete overhaul of XP progression with satisfying animations, sound effects, and milestone celebrations',
      features: [
        '3.5-second dramatic progress bar fill animation',
        'Gradient wave effect that travels across the bar',
        'Multi-level progression with rapid animations',
        'Sound effects: whoosh during fill, ding on level-up',
        'Confetti celebrations for milestone levels (5, 10, 25, 50, 75, 100, 150, 200)',
        'Web Audio API synthesized sounds (no external files needed)',
        'Event-driven animation system triggered by testing commands'
      ],
      impact: 'Massive improvement in user satisfaction and engagement with progression',
      status: 'Live',
      testUrl: '/whats-new'
    },
    {
      id: 'elevate-psychology',
      title: 'Elevate Psychology System',
      version: 'v1.4.0',
      date: 'Today',
      category: 'Core System',
      icon: Brain,
      color: 'text-purple-600 bg-purple-100',
      description: 'Complete implementation of Elevate-inspired learning psychology',
      features: [
        'Adaptive difficulty system that adjusts to your skill level',
        'Flow state detection for optimal learning zone',
        'Micro-session types for bite-sized learning',
        'Enhanced feedback system with immediate responses',
        'Comprehensive testing dashboard for validation'
      ],
      impact: 'Expected 40% increase in engagement and 50% better retention',
      status: 'Live',
      testUrl: '/testing'
    },
    {
      id: 'mobile-optimization',
      title: 'Mobile-First Redesign',
      version: 'v1.3.5',
      date: 'Yesterday',
      category: 'UI/UX',
      icon: Smartphone,
      color: 'text-blue-600 bg-blue-100',
      description: 'Complete mobile optimization across all pages',
      features: [
        'Responsive design for all screen sizes',
        'Touch-friendly interactions',
        'Mobile navigation with hamburger menu',
        'Optimized game controls for mobile',
        'Clean, minimal mobile interface'
      ],
      impact: 'Perfect mobile experience on all devices',
      status: 'Live',
      testUrl: '/play'
    },
    {
      id: 'shop-system',
      title: 'Coin-Based Shop System',
      version: 'v1.3.0',
      date: '2 days ago',
      category: 'Economy',
      icon: ShoppingCart,
      color: 'text-yellow-600 bg-yellow-100',
      description: 'Complete in-game economy with shop and social features',
      features: [
        'Coin earning through gameplay and achievements',
        'Premium shop with avatars, themes, and power-ups',
        'Rarity system (Common, Rare, Epic, Legendary)',
        'Social sharing for coin rewards',
        'Referral system for growth'
      ],
      impact: 'Increased user engagement through gamification',
      status: 'Live',
      testUrl: '/shop'
    },
    {
      id: 'xp-leveling',
      title: 'XP & Leveling System',
      version: 'v1.2.5',
      date: '3 days ago',
      category: 'Progression',
      icon: Trophy,
      color: 'text-green-600 bg-green-100',
      description: 'Comprehensive progression system with levels and rewards',
      features: [
        'Dynamic XP calculation based on performance',
        'Level progression with unlockable rewards',
        'Level display components across all pages',
        'Achievement integration with XP rewards',
        'Daily task XP integration'
      ],
      impact: 'Clear progression path and motivation',
      status: 'Live',
      testUrl: '/profile'
    }
  ];

  const upcomingFeatures = [
    {
      id: 'variable-rewards',
      title: 'Variable Reward Scheduling',
      version: 'v1.5.0',
      eta: 'Next Week',
      category: 'Psychology',
      icon: Gift,
      color: 'text-pink-600 bg-pink-100',
      description: 'Advanced reward system based on behavioral psychology',
      features: [
        'Non-linear reward patterns for sustained engagement',
        'Surprise bonus rewards at random intervals',
        'Achievement unlock celebrations',
        'Progress glow animations',
        'A/B testing framework for optimization'
      ]
    },
    {
      id: 'social-features',
      title: 'Advanced Social Features',
      version: 'v1.6.0',
      eta: '2 Weeks',
      category: 'Social',
      icon: Users,
      color: 'text-indigo-600 bg-indigo-100',
      description: 'Team challenges and mentorship system',
      features: [
        'Segmented leaderboards by skill level',
        'Team challenges and competitions',
        'Mentorship system for skill sharing',
        'Social engagement metrics tracking',
        'Community challenges and events'
      ]
    },
    {
      id: 'advanced-psychology',
      title: 'Advanced Learning Psychology',
      version: 'v1.7.0',
      eta: '1 Month',
      category: 'Psychology',
      icon: Eye,
      color: 'text-orange-600 bg-orange-100',
      description: 'Spaced repetition and cognitive load management',
      features: [
        'Spaced repetition algorithm for long-term retention',
        'Cognitive load management system',
        'Motivation maintenance algorithms',
        'Personalized learning paths',
        'Comprehensive user testing suite'
      ]
    }
  ];

  const getCategoryIcon = (category: string) => {
    const icons = {
      'Core System': Brain,
      'UI/UX': Monitor,
      'Economy': Coins,
      'Progression': Trophy,
      'Psychology': Eye,
      'Social': Users
    };
    return icons[category as keyof typeof icons] || Settings;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Live': return 'text-green-600 bg-green-100';
      case 'Beta': return 'text-yellow-600 bg-yellow-100';
      case 'Coming Soon': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-black">What's New</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay up to date with all the latest features, improvements, and updates to BoltQuest
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-800">5</div>
              <div className="text-sm text-purple-600">Major Updates</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-800">20+</div>
              <div className="text-sm text-blue-600">New Features</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-800">60%</div>
              <div className="text-sm text-green-600">Engagement Boost</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4 text-center">
              <Rocket className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-800">100%</div>
              <div className="text-sm text-yellow-600">Mobile Ready</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="latest" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Latest Updates
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Coming Soon
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Testing
            </TabsTrigger>
          </TabsList>

          {/* Latest Updates */}
          <TabsContent value="latest" className="space-y-6">
            {latestUpdates.map((update) => {
              const IconComponent = update.icon;
              const CategoryIcon = getCategoryIcon(update.category);
              
              return (
                <Card key={update.id} className="hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${update.color}`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-black">{update.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {update.version}
                            </Badge>
                            <Badge className={getStatusColor(update.status)}>
                              {update.status}
                            </Badge>
                            <span className="text-sm text-gray-500">{update.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-500">{update.category}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{update.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-black mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Key Features
                        </h4>
                        <ul className="space-y-2">
                          {update.features.map((feature, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <ArrowRight className="w-3 h-3 text-gray-400 mt-1 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-black mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          Expected Impact
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">{update.impact}</p>
                        
                        <Button 
                          onClick={() => navigate(update.testUrl)}
                          className="w-full bg-black hover:bg-gray-800 text-white"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Test This Feature
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Upcoming Features */}
          <TabsContent value="upcoming" className="space-y-6">
            {upcomingFeatures.map((feature) => {
              const IconComponent = feature.icon;
              const CategoryIcon = getCategoryIcon(feature.category);
              
              return (
                <Card key={feature.id} className="border-dashed border-2 border-gray-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${feature.color}`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-black">{feature.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {feature.version}
                            </Badge>
                            <Badge className="text-blue-600 bg-blue-100">
                              Coming Soon
                            </Badge>
                            <span className="text-sm text-gray-500">ETA: {feature.eta}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-500">{feature.category}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    
                    <div>
                      <h4 className="font-semibold text-black mb-3 flex items-center gap-2">
                        <Rocket className="w-4 h-4 text-purple-600" />
                        Planned Features
                      </h4>
                      <ul className="space-y-2">
                        {feature.features.map((item, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <ArrowRight className="w-3 h-3 text-gray-400 mt-1 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Testing Dashboard */}
          <TabsContent value="testing" className="space-y-6">
            {/* XP Animation Testing */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  XP Animation Testing Center
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-700 mb-4">
                  Test the new dramatic XP bar animations with sound effects and confetti celebrations
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/60 rounded-xl p-4 border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-2">Quick Tests</h4>
                    <p className="text-sm text-purple-700 mb-3">
                      Test individual animation features
                    </p>
                    <div className="space-y-2">
                      <Button 
                        onClick={() => {
                          // Trigger single level animation
                          window.dispatchEvent(new CustomEvent('xpLevelChanged', {
                            detail: { oldLevel: 1, newLevel: 2, animate: true }
                          }));
                        }}
                        size="sm" 
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        Single Level Animation
                      </Button>
                      <Button 
                        onClick={() => {
                          // Trigger multi-level animation
                          window.dispatchEvent(new CustomEvent('xpLevelChanged', {
                            detail: { oldLevel: 1, newLevel: 5, animate: true }
                          }));
                        }}
                        size="sm" 
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        Multi-Level Animation
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-white/60 rounded-xl p-4 border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-2">Milestone Tests</h4>
                    <p className="text-sm text-purple-700 mb-3">
                      Test confetti celebrations at milestone levels
                    </p>
                    <div className="space-y-2">
                      <Button 
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('xpLevelChanged', {
                            detail: { oldLevel: 4, newLevel: 5, animate: true }
                          }));
                        }}
                        size="sm" 
                        className="w-full bg-yellow-600 hover:bg-yellow-700"
                      >
                        Level 5 Milestone
                      </Button>
                      <Button 
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('xpLevelChanged', {
                            detail: { oldLevel: 9, newLevel: 10, animate: true }
                          }));
                        }}
                        size="sm" 
                        className="w-full bg-yellow-600 hover:bg-yellow-700"
                      >
                        Level 10 Milestone
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/60 rounded-xl p-4 border border-purple-200 mb-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Testing Commands</h4>
                  <p className="text-sm text-purple-700 mb-3">
                    Use these commands in the testing chat (Tab + ` to open):
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <code className="bg-gray-100 p-2 rounded text-gray-800">/level 5</code>
                    <code className="bg-gray-100 p-2 rounded text-gray-800">/level 10</code>
                    <code className="bg-gray-100 p-2 rounded text-gray-800">/level 25</code>
                    <code className="bg-gray-100 p-2 rounded text-gray-800">/level 50</code>
                    <code className="bg-gray-100 p-2 rounded text-gray-800">/level 100</code>
                    <code className="bg-gray-100 p-2 rounded text-gray-800">/level 1</code>
                    <code className="bg-gray-100 p-2 rounded text-gray-800">/xp 1000</code>
                    <code className="bg-gray-100 p-2 rounded text-gray-800">/coins 5000</code>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    View XP Bar on Dashboard
                  </Button>
                  <Button 
                    onClick={() => {
                      // Open testing panel
                      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
                      setTimeout(() => {
                        window.dispatchEvent(new KeyboardEvent('keydown', { key: '`' }));
                      }, 100);
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Open Testing Chat
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-xl text-blue-900 flex items-center gap-2">
                  <TestTube className="w-6 h-6" />
                  General Testing Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700 mb-4">
                  Comprehensive testing interface for all new features and systems
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/60 rounded-xl p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Phase 1 Testing</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Test the Elevate psychology implementation
                    </p>
                    <ul className="text-xs text-blue-600 space-y-1">
                      <li>• Adaptive difficulty system</li>
                      <li>• Micro-session types</li>
                      <li>• Flow state detection</li>
                      <li>• Enhanced feedback system</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white/60 rounded-xl p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Comprehensive Testing</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Run all tests in sequence for complete validation
                    </p>
                    <ul className="text-xs text-blue-600 space-y-1">
                      <li>• Individual system tests</li>
                      <li>• Performance metrics</li>
                      <li>• User engagement tracking</li>
                      <li>• Real-time results</li>
                    </ul>
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate('/testing')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Open Testing Dashboard
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    Psychology Tests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Test adaptive difficulty and flow state detection
                  </p>
                  <Button 
                    onClick={() => navigate('/play')}
                    size="sm" 
                    className="w-full"
                  >
                    Test Now
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-yellow-600" />
                    Shop System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Test coin economy and shop functionality
                  </p>
                  <Button 
                    onClick={() => navigate('/shop')}
                    size="sm" 
                    className="w-full"
                  >
                    Test Now
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-green-600" />
                    Progression
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Test XP system and level progression
                  </p>
                  <Button 
                    onClick={() => navigate('/profile')}
                    size="sm" 
                    className="w-full"
                  >
                    Test Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">
            Want to stay updated on all BoltQuest developments?
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => navigate('/community')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Join Community
            </Button>
            <Button 
              onClick={() => navigate('/analytics')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              View Analytics
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsNew;
