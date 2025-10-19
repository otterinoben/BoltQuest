import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { User, Settings, TrendingUp, Edit3, Award, Target, Activity, Brain, CheckCircle, Circle, ArrowRight, Zap, TrendingUp as TrendingUpIcon, Megaphone, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { getUserProfile, resetUserStatistics } from "@/lib/userStorage";
import { getGameHistoryByUserId, clearGameHistory } from "@/lib/gameHistoryStorage";
import { ResetConfirmationModal } from "@/components/ResetConfirmationModal";
import AvatarUpload from "@/components/AvatarUpload";
import LevelDisplay from "@/components/LevelDisplay";
import { useState, useEffect } from "react";

const Profile = () => {
  // State for user data - always get fresh data
  const [userProfile, setUserProfile] = useState(() => {
    try {
      return getUserProfile();
    } catch (error) {
      console.error('Error getting user profile:', error);
      return {
        username: 'Guest User',
        email: '',
        avatar: '',
        createdAt: new Date().toISOString(),
        statistics: {
          totalGamesPlayed: 0,
          totalCorrectAnswers: 0,
          bestScore: 0,
          averageAccuracy: 0,
          categoryStats: {}
        },
        preferences: {
          interests: [],
          customInterests: []
        }
      };
    }
  });
  
  const [currentAvatar, setCurrentAvatar] = useState(userProfile.avatar || '');
  const [isEditing, setIsEditing] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [gameHistory, setGameHistory] = useState(() => {
    try {
      return getGameHistoryByUserId(userProfile.id);
    } catch (error) {
      console.error('Error getting game history:', error);
      return [];
    }
  });

  // Always get fresh data when component mounts or updates
  useEffect(() => {
    const refreshData = () => {
      try {
        const freshProfile = getUserProfile();
        const freshHistory = getGameHistoryByUserId(freshProfile.id);
        setUserProfile(freshProfile);
        setCurrentAvatar(freshProfile.avatar || '');
        setGameHistory(freshHistory);
      } catch (error) {
        console.error('Error refreshing data:', error);
      }
    };

    // Refresh on mount
    refreshData();

    // Refresh when window gains focus (user returns from another page)
    const handleFocus = () => refreshData();
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Calculate stats from real data with safe fallbacks
  const totalGames = userProfile?.statistics?.totalGamesPlayed || 0;
  const totalScore = userProfile?.statistics?.totalScore || 0;
  const avgScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0;
  const bestScore = userProfile?.statistics?.bestScore || 0;
  const avgAccuracy = userProfile?.statistics?.averageAccuracy || 0;

  // Calculate category performance with safe fallbacks
  const categoryStats = userProfile?.statistics?.categoryStats || {};
  const categories = Object.keys(categoryStats);
  
  // Get best performing category
  const bestCategory = categories.reduce((best, category) => {
    const current = categoryStats[category];
    const bestData = categoryStats[best];
    return current && bestData ? 
      (current.averageAccuracy > bestData.averageAccuracy ? category : best) : 
      (current ? category : best);
  }, categories[0] || 'general');

  // Get recent performance (last 5 games)
  const recentGames = getGameHistoryByUserId(userProfile.id).slice(0, 5);
  const recentAvgAccuracy = recentGames.length > 0 ? 
    Math.round(recentGames.reduce((sum, game) => sum + (game.accuracy || 0), 0) / recentGames.length) : 0;

  const handleSave = () => {
    toast.success("Profile updated successfully");
    setIsEditing(false);
  };

  const handleResetStats = () => {
    setShowResetModal(true);
  };

  const handleResetComplete = () => {
    // Refresh the profile data after reset
    const freshProfile = getUserProfile();
    const freshHistory = getGameHistoryByUserId(freshProfile.id);
    setUserProfile(freshProfile);
    setGameHistory(freshHistory);
    // Reload the page to ensure all components refresh
    window.location.reload();
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const profile = userProfile;
    let completedFields = 0;
    const totalFields = 5; // username, avatar, interests (min 3), custom interests, preferences

    // Check username (not default "Guest User")
    if (profile?.username && profile.username !== 'Guest User') {
      completedFields++;
    }

    // Check avatar (has custom avatar)
    if (profile?.avatar && profile.avatar !== '') {
      completedFields++;
    }

    // Check interests (minimum 3)
    const interests = profile?.preferences?.interests || [];
    if (interests.length >= 3) {
      completedFields++;
    }

    // Check custom interests
    const customInterests = profile?.preferences?.customInterests || [];
    if (customInterests.length > 0) {
      completedFields++;
    }

    // Check if preferences are customized (not default)
    const hasCustomPreferences = profile?.preferences && (
      profile.preferences.defaultTimer !== 20 ||
      profile.preferences.showHints !== false ||
      profile.preferences.defaultDifficulty !== 'easy' ||
      profile.preferences.defaultCategory !== 'general'
    );
    if (hasCustomPreferences) {
      completedFields++;
    }

    return Math.round((completedFields / totalFields) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  // Get completion suggestions
  const getCompletionSuggestions = () => {
    const suggestions = [];
    const profile = userProfile;

    if (!profile?.username || profile.username === 'Guest User') {
      suggestions.push({
        icon: User,
        title: 'Add Username',
        description: 'Set a custom display name',
        link: '/profile',
        completed: false
      });
    } else {
      suggestions.push({
        icon: User,
        title: 'Username',
        description: profile.username,
        link: '/profile',
        completed: true
      });
    }

    if (!profile?.avatar || profile.avatar === '') {
      suggestions.push({
        icon: Circle,
        title: 'Add Avatar',
        description: 'Choose a profile picture',
        link: '/profile',
        completed: false
      });
    } else {
      suggestions.push({
        icon: CheckCircle,
        title: 'Avatar',
        description: 'Profile picture set',
        link: '/profile',
        completed: true
      });
    }

    const interests = profile?.preferences?.interests || [];
    if (interests.length < 3) {
      suggestions.push({
        icon: Brain,
        title: 'Add Interests',
        description: `Add ${3 - interests.length} more interests (minimum 3)`,
        link: '/profile',
        completed: false
      });
    } else {
      suggestions.push({
        icon: CheckCircle,
        title: 'Interests',
        description: `${interests.length} interests selected`,
        link: '/profile',
        completed: true
      });
    }

    return suggestions;
  };

  const completionSuggestions = getCompletionSuggestions();

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Your Profile</h1>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Manage your account and track your progress
        </p>
      </div>

      {/* Subtle Profile Suggestions */}
      {profileCompletion < 100 && (
        <Card className="border-border/50 bg-muted/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Personalize your experience</p>
                  <p className="text-xs text-muted-foreground">
                    Add interests and customize your profile
                  </p>
                </div>
              </div>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                  <Edit3 className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two Column Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Column - Profile Overview & Personal Info */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          
          {/* Profile Overview */}
          <Card className="border-border shadow-elegant">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <AvatarUpload
                    currentAvatar={currentAvatar}
                    username={userProfile?.username || 'Guest User'}
                    onAvatarChange={(newAvatar) => {
                      setCurrentAvatar(newAvatar);
                      try {
                        const freshProfile = getUserProfile();
                        setUserProfile(freshProfile);
                      } catch (error) {
                        console.error('Error updating profile:', error);
                      }
                    }}
                  />
                </div>
                
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">{userProfile?.username || 'Guest User'}</h2>
                  <p className="text-muted-foreground">
                    Player since {userProfile?.createdAt ? new Date(userProfile.createdAt).getFullYear() : new Date().getFullYear()}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="text-center p-3 rounded-lg bg-secondary/30">
                    <div className="text-2xl font-bold text-primary">{totalGames}</div>
                    <div className="text-xs text-muted-foreground">Games</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary/30">
                    <div className="text-2xl font-bold text-primary">{Math.round(avgAccuracy)}%</div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                </div>

                {/* Reset All Data Button - Testing Only */}
                <div className="w-full">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleResetStats}
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Reset All Data (Testing)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Favorite Categories */}
          <Card className="border-border shadow-elegant">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Favorite Categories
              </CardTitle>
              <CardDescription>
                Your preferred learning topics and interests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userProfile?.preferences?.interests && userProfile.preferences.interests.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {userProfile.preferences.interests.map((cat) => (
                      <Badge key={cat} variant="default" className="capitalize text-sm px-3 py-1">
                        {cat}
                      </Badge>
                    ))}
                    {userProfile.preferences.customInterests?.map((interest) => (
                      <Badge key={`custom-${interest}`} variant="outline" className="capitalize text-sm px-3 py-1">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                  <div className="pt-2">
                    <Link to="/profile">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Edit3 className="h-4 w-4" />
                        Update Interests
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                    <Brain className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No interests selected yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose your favorite categories to get personalized recommendations
                  </p>
                  <Link to="/profile">
                    <Button className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Choose Your Interests
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Level Progress */}
          <LevelDisplay variant="detailed" showProgress={true} showRewards={true} />

          {/* Personal Information */}
          <Card className="border-border shadow-elegant">
            <CardHeader>
              <CardTitle className="text-foreground">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="text-sm font-medium">{userProfile?.username || 'Guest User'}</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="text-sm font-medium">{userProfile?.email || "Not provided"}</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="joinDate">Member Since</Label>
                <div className="text-sm font-medium">
                  {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2" 
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 className="h-4 w-4" />
                {isEditing ? 'Cancel Editing' : 'Edit Profile'}
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Analytics & Insights */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          
          {/* Key Insights */}
          <Card className="border-border shadow-elegant">
            <CardHeader>
              <CardTitle className="text-foreground">Key Insights</CardTitle>
              <CardDescription>Your performance highlights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Best Category</h3>
                  </div>
                  <p className="text-2xl font-bold text-primary capitalize">{bestCategory}</p>
                  <p className="text-sm text-muted-foreground">
                    {categoryStats[bestCategory]?.averageAccuracy ? 
                      `${Math.round(categoryStats[bestCategory].averageAccuracy)}% accuracy` : 
                      'No data yet'
                    }
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Recent Performance</h3>
                  </div>
                  <p className="text-2xl font-bold text-primary">{recentAvgAccuracy}%</p>
                  <p className="text-sm text-muted-foreground">
                    Last {recentGames.length} games
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Learning Focus</h3>
                  </div>
                  <p className="text-lg font-bold text-primary">
                    {userProfile?.preferences?.interests?.length || 0} topics
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {userProfile?.preferences?.interests?.length ? 
                      userProfile.preferences.interests.slice(0, 2).join(', ') + 
                      (userProfile.preferences.interests.length > 2 ? '...' : '') :
                      'No focus areas'
                    }
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Recent Activity</h3>
                  </div>
                  <p className="text-lg font-bold text-primary">
                    {recentGames.length} games
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {recentGames.length > 0 ? 
                      `Last played ${new Date(recentGames[0].timestamp).toLocaleDateString()}` :
                      'No recent games'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Performance */}
          <Card className="border-border shadow-elegant">
            <CardHeader>
              <CardTitle className="text-foreground">Category Performance</CardTitle>
              <CardDescription>Your accuracy across different topics</CardDescription>
            </CardHeader>
            <CardContent>
              {categories.length > 0 ? (
                <div className="space-y-4">
                  {categories.map((category) => {
                    const stats = categoryStats[category];
                    const accuracy = stats?.averageAccuracy || 0;
                    const gamesPlayed = stats?.gamesPlayed || 0;
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize">{category}</span>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(accuracy)}% ({gamesPlayed} games)
                          </span>
                        </div>
                        <Progress value={accuracy} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No category data yet. Start playing to see your performance!
                  </p>
                  <Link to="/play">
                    <Button className="mt-4">Start Playing</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border shadow-elegant">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Link to="/play">
                  <Button className="w-full flex items-center gap-2" size="lg">
                    <User className="h-4 w-4" />
                    Play Now
                  </Button>
                </Link>
                <Link to="/analytics">
                  <Button variant="outline" className="w-full flex items-center gap-2" size="lg">
                    <TrendingUp className="h-4 w-4" />
                    View Analytics
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline" className="w-full flex items-center gap-2" size="lg">
                    <Settings className="h-4 w-4" />
                    Customize
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile Editing Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input 
                  id="edit-username" 
                  placeholder="Enter username" 
                  defaultValue={userProfile?.username || 'Guest User'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="Enter email"
                  defaultValue={userProfile?.email || ""}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      <ResetConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onComplete={handleResetComplete}
      />
    </div>
  );
};

export default Profile;