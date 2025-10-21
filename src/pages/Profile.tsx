import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Trophy, 
  Target, 
  Flame, 
  Coins, 
  TrendingUp, 
  Calendar,
  Award,
  Star,
  Users,
  Share2,
  Settings,
  Edit3,
  Zap,
  Brain,
  Activity,
  BarChart3,
  Crown,
  Medal,
  ChevronRight,
  Play,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Save,
  X,
  User,
  Mail,
  Globe,
  Camera,
  Trash2,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { getUserProfile, saveUserProfile, updateUserAvatar } from "@/lib/userStorage";
import { getGameHistoryByUserId } from "@/lib/gameHistoryStorage";
import { EloSystem } from "@/lib/eloSystem";
import { EloRankSystem } from "@/lib/eloRankSystem";
import { TitleManager } from "@/lib/titleSystem";
import { getUnlockedAchievements } from "@/lib/simpleAchievements";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import AvatarUpload from "@/components/AvatarUpload";

const Profile = () => {
  const [userProfile, setUserProfile] = useState(() => getUserProfile());
  const [gameHistory, setGameHistory] = useState(() => getGameHistoryByUserId(userProfile.id));
  const [eloData, setEloData] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  
  // Edit profile state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    username: userProfile?.username || '',
    email: userProfile?.email || '',
    bio: userProfile?.bio || '',
    location: userProfile?.location || '',
    website: userProfile?.website || '',
    avatar: userProfile?.avatar || '',
    selectedTitle: userProfile?.selectedTitle || ''
  });

  // Delete profile state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  useEffect(() => {
    const refreshData = () => {
        const freshProfile = getUserProfile();
        const freshHistory = getGameHistoryByUserId(freshProfile.id);
        setUserProfile(freshProfile);
        setGameHistory(freshHistory);
      
      // Get ELO data
      const eloSystem = new EloSystem();
      const eloRating = eloSystem.getOverallRating();
      const eloRankDisplay = EloRankSystem.getEloRankDisplay(eloRating, 0);
      setEloData({ rating: eloRating, rankDisplay: eloRankDisplay });
      
      // Get achievements
      setAchievements(getUnlockedAchievements());
    };

    refreshData();
    const interval = setInterval(refreshData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Calculate stats
  const totalGames = userProfile?.statistics?.totalGamesPlayed || 0;
  const totalScore = userProfile?.statistics?.bestScore || 0;
  const avgAccuracy = userProfile?.statistics?.averageAccuracy || 0;
  const bestScore = userProfile?.statistics?.bestScore || 0;
  const currentStreak = userProfile?.streak || 0;
  const totalCoins = userProfile?.coins || 0;
  const currentLevel = userProfile?.level || 1;
  const totalXp = userProfile?.totalXp || 0;

  // Calculate XP for next level (assuming 100 XP per level)
  const xpForNextLevel = currentLevel * 100;
  const xpProgress = ((totalXp % 100) / 100) * 100;

  // Get recent games for activity
  const recentGames = gameHistory.slice(0, 5);
  
  // Calculate win rate
  const wins = userProfile?.eloRating?.wins || 0;
  const losses = userProfile?.eloRating?.losses || 0;
  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  // Edit profile functions
  const handleEditProfile = () => {
    setEditForm({
      username: userProfile?.username || '',
      email: userProfile?.email || '',
      bio: userProfile?.bio || '',
      location: userProfile?.location || '',
      website: userProfile?.website || '',
      avatar: userProfile?.avatar || '',
      selectedTitle: userProfile?.selectedTitle || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = () => {
    try {
      const updatedProfile = {
        ...userProfile,
        username: editForm.username.trim(),
        email: editForm.email.trim(),
        bio: editForm.bio.trim(),
        location: editForm.location.trim(),
        website: editForm.website.trim(),
        avatar: editForm.avatar.trim(),
        selectedTitle: editForm.selectedTitle.trim()
      };
      
      // Save avatar to storage if it has changed
      if (editForm.avatar !== userProfile?.avatar) {
        updateUserAvatar(editForm.avatar);
      }
      
      saveUserProfile(updatedProfile);
      setUserProfile(updatedProfile);
      setIsEditModalOpen(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error("Failed to save profile. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditForm({
      username: userProfile?.username || '',
      email: userProfile?.email || '',
      bio: userProfile?.bio || '',
      location: userProfile?.location || '',
      website: userProfile?.website || '',
      avatar: userProfile?.avatar || '',
      selectedTitle: userProfile?.selectedTitle || ''
    });
    // Reset avatar preview to original if it was changed
    if (editForm.avatar !== userProfile?.avatar) {
      // Avatar will be reset when form is reset above
    }
  };

  // Delete profile functions
  const handleDeleteProfile = () => {
    setIsDeleteModalOpen(true);
    setDeleteConfirmation('');
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error("Please type 'DELETE' to confirm");
      return;
    }

    setIsDeleting(true);
    
    try {
      // Show success animation
      setShowDeleteSuccess(true);
      
      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear all user data
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to onboarding
      window.location.href = '/onboarding';
      
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error("Failed to delete profile. Please try again.");
      setIsDeleting(false);
      setShowDeleteSuccess(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeleteConfirmation('');
    setIsDeleting(false);
    setShowDeleteSuccess(false);
  };

  // Get best performing category
  const categoryStats = userProfile?.statistics?.categoryStats || {};
  const categories = Object.keys(categoryStats);
  const bestCategory = categories.reduce((best, category) => {
    const current = categoryStats[category];
    const bestData = categoryStats[best];
    return current && bestData ? 
      (current.averageAccuracy > bestData.averageAccuracy ? category : best) : 
      (current ? category : best);
  }, categories[0] || 'general');

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 md:p-8">
      <motion.div 
        className="max-w-7xl mx-auto space-y-6"
        initial="initial"
        animate="animate"
        variants={staggerChildren}
      >
        {/* Profile Header */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Avatar and Level */}
                <div className="relative">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-white/20">
                    <AvatarImage src={userProfile?.avatar} />
                    <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                      {userProfile?.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full px-3 py-1 text-xs font-bold text-white shadow-lg">
                    Lv.{currentLevel}
                  </div>
                </div>
                
                {/* User Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                    {userProfile?.username || 'Player'}
                  </h1>
                  
                  {/* Title Display */}
                  {(() => {
                    const titleManager = TitleManager.getInstance();
                    titleManager.initialize(userProfile);
                    const selectedTitle = userProfile?.selectedTitle 
                      ? titleManager.getTitleById(userProfile.selectedTitle)
                      : titleManager.getBestTitle();
                    
                    if (selectedTitle) {
                      return (
                        <div className="mb-3">
                          <Badge 
                            className={`px-3 py-1 text-sm font-semibold ${
                              selectedTitle.rarity === 'common' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                              selectedTitle.rarity === 'uncommon' ? 'bg-green-100 text-green-700 border-green-300' :
                              selectedTitle.rarity === 'rare' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                              selectedTitle.rarity === 'epic' ? 'bg-purple-100 text-purple-700 border-purple-300' :
                              'bg-yellow-100 text-yellow-700 border-yellow-300'
                            }`}
                          >
                            {selectedTitle.name}
                          </Badge>
                          <p className="text-sm text-white/80 mt-1">
                            {selectedTitle.description}
                  </p>
                </div>
                      );
                    }
                    return null;
                  })()}
                  
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                    <span className="text-lg">{eloData?.rankDisplay?.currentRank?.icon}</span>
                    <span className="text-lg font-semibold">
                      {eloData?.rankDisplay?.currentRank?.tier} {eloData?.rankDisplay?.currentRank?.division}
                    </span>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {eloData?.rating || 1000} ELO
                    </Badge>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{totalGames}</div>
                      <div className="text-sm opacity-80">Games</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{avgAccuracy}%</div>
                      <div className="text-sm opacity-80">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{winRate}%</div>
                      <div className="text-sm opacity-80">Win Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{bestScore}</div>
                      <div className="text-sm opacity-80">Best Score</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    onClick={handleEditProfile}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    onClick={() => {
                      const shareText = `Check out my BuzzBolt profile! Level ${currentLevel}, ${eloData?.rankDisplay?.currentRank?.tier} ${eloData?.rankDisplay?.currentRank?.division} with ${eloData?.rating || 1000} ELO! 🎯`;
                      navigator.clipboard.writeText(shareText);
                      toast.success("Profile link copied to clipboard!");
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Gamification */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Level Progress */}
            <motion.div variants={fadeInUp}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Level Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{currentLevel}</div>
                      <div className="text-sm opacity-80">Current Level</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{totalXp % 100} XP</span>
                        <span>{xpForNextLevel} XP</span>
                      </div>
                      <Progress value={xpProgress} className="h-3 bg-white/20" />
                    </div>
                    <div className="text-center text-sm opacity-80">
                      {100 - (totalXp % 100)} XP to next level
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Streak Counter */}
            <motion.div variants={fadeInUp}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Flame className="h-5 w-5" />
                    Daily Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-3">
                    <div className="text-4xl font-bold">{currentStreak}</div>
                    <div className="text-sm opacity-80">Days in a row</div>
                    <Link to="/play">
                      <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                        <Play className="h-4 w-4 mr-2" />
                        Play Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Coins & Rewards */}
            <motion.div variants={fadeInUp}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-amber-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    Coins & Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{totalCoins.toLocaleString()}</div>
                      <div className="text-sm opacity-80">Total Coins</div>
                </div>
                    <Link to="/shop">
                      <Button variant="secondary" size="sm" className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30">
                        <Eye className="h-4 w-4 mr-2" />
                        View Shop
                    </Button>
                  </Link>
                </div>
            </CardContent>
          </Card>
            </motion.div>

            {/* Recent Achievements */}
            <motion.div variants={fadeInUp}>
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Recent Achievements
                  </CardTitle>
            </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {achievements.slice(0, 3).map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Medal className="h-4 w-4 text-yellow-600" />
              </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{achievement.name}</div>
                          <div className="text-xs text-gray-500">{achievement.description}</div>
                </div>
              </div>
                    ))}
                    {achievements.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <div className="text-sm">No achievements yet</div>
                        <div className="text-xs">Start playing to earn achievements!</div>
                      </div>
                    )}
                    <Link to="/achievements">
                      <Button variant="outline" size="sm" className="w-full">
                        <Award className="h-4 w-4 mr-2" />
                        View All Achievements
              </Button>
                    </Link>
                  </div>
            </CardContent>
          </Card>
            </motion.div>
        </div>

          {/* Right Column - Analytics & Performance */}
          <div className="lg:col-span-2 space-y-6">
          
            {/* Performance Overview */}
            <motion.div variants={fadeInUp}>
              <Card className="border-0 shadow-lg">
            <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    Performance Overview
                  </CardTitle>
            </CardHeader>
            <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ELO Rating */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">ELO Rating</span>
                        <span className="text-2xl font-bold text-blue-600">{eloData?.rating || 1000}</span>
                  </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Peak:</span>
                        <span className="font-medium">{userProfile?.eloRating?.peakRating || 1000}</span>
                </div>
                      <Progress value={((eloData?.rating || 1000) / 2000) * 100} className="h-2" />
                </div>

                    {/* Best Category */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Best Category</span>
                        <span className="text-lg font-bold text-green-600 capitalize">{bestCategory}</span>
                  </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Accuracy:</span>
                        <span className="font-medium">
                          {categoryStats[bestCategory]?.averageAccuracy ? 
                            `${Math.round(categoryStats[bestCategory].averageAccuracy)}%` : 
                            'N/A'
                          }
                        </span>
                      </div>
                      <Progress 
                        value={categoryStats[bestCategory]?.averageAccuracy || 0} 
                        className="h-2" 
                      />
                </div>
              </div>
            </CardContent>
          </Card>
            </motion.div>

          {/* Category Performance */}
            <motion.div variants={fadeInUp}>
              <Card className="border-0 shadow-lg">
            <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    Category Performance
                  </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                  {categories.map((category) => {
                    const stats = categoryStats[category];
                    const accuracy = stats?.averageAccuracy || 0;
                    const gamesPlayed = stats?.gamesPlayed || 0;
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize">{category}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">{gamesPlayed} games</span>
                              <span className="font-bold text-lg">{Math.round(accuracy)}%</span>
                            </div>
                          </div>
                          <Progress value={accuracy} className="h-3" />
                        </div>
                      );
                    })}
                    {categories.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <div className="text-lg font-medium mb-2">No category data yet</div>
                        <div className="text-sm mb-4">Start playing to see your performance!</div>
                        <Link to="/play">
                          <Button>
                            <Play className="h-4 w-4 mr-2" />
                            Start Playing
                          </Button>
                        </Link>
                      </div>
                    )}
                </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={fadeInUp}>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentGames.map((game, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          {game.accuracy >= 70 ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{game.category} • {game.difficulty}</div>
                          <div className="text-sm text-gray-500">
                            {game.score} points • {game.accuracy}% accuracy
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {new Date(game.startTime).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(game.startTime).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {recentGames.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <div className="text-lg font-medium mb-2">No recent activity</div>
                        <div className="text-sm mb-4">Start playing to see your activity!</div>
                  <Link to="/play">
                          <Button>
                            <Play className="h-4 w-4 mr-2" />
                            Start Playing
                          </Button>
                  </Link>
                </div>
              )}
                  </div>
            </CardContent>
          </Card>
            </motion.div>

          {/* Quick Actions */}
            <motion.div variants={fadeInUp}>
              <Card className="border-0 shadow-lg">
            <CardHeader>
                  <CardTitle className="text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link to="/play">
                      <Button className="h-16 flex flex-col gap-2 w-full" size="lg">
                        <Play className="h-6 w-6" />
                        <span>Play Now</span>
                  </Button>
                </Link>
                <Link to="/analytics">
                      <Button variant="outline" className="h-16 flex flex-col gap-2 w-full" size="lg">
                        <BarChart3 className="h-6 w-6" />
                        <span>Analytics</span>
                  </Button>
                </Link>
                    <Link to="/preferences">
                      <Button variant="outline" className="h-16 flex flex-col gap-2 w-full" size="lg">
                        <Settings className="h-6 w-6" />
                        <span>Settings</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Edit3 className="h-6 w-6" />
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Profile Picture</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={editForm.avatar} />
                  <AvatarFallback className="text-lg">
                    {editForm.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <AvatarUpload
                    onAvatarChange={(newAvatar) => setEditForm(prev => ({ ...prev, avatar: newAvatar }))}
                    currentAvatar={editForm.avatar}
                    username={editForm.username || 'User'}
                  />
                  <p className="text-sm text-gray-500">
                    Upload a new profile picture or use the default avatar
                  </p>
                </div>
        </div>
      </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input 
                  id="username"
                  value={editForm.username}
                  onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter your username"
                  maxLength={20}
                />
                <p className="text-xs text-gray-500">This will be displayed on your profile</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                />
                <p className="text-xs text-gray-500">Optional - for notifications</p>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                maxLength={200}
                rows={3}
              />
              <p className="text-xs text-gray-500">
                {editForm.bio.length}/200 characters
              </p>
            </div>

            {/* Location and Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editForm.location}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, Country"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={editForm.website}
                  onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            {/* Title Selection */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Select 
                value={editForm.selectedTitle} 
                onValueChange={(value) => setEditForm(prev => ({ ...prev, selectedTitle: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a title" />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    const titleManager = TitleManager.getInstance();
                    titleManager.initialize(userProfile);
                    const availableTitles = titleManager.getAvailableTitles();
                    
                    return availableTitles.map((title) => (
                      <SelectItem key={title.id} value={title.id}>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${titleManager.getRarityColor(title.rarity)}`}>
                            {title.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({title.category})
                          </span>
                        </div>
                      </SelectItem>
                    ));
                  })()}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Titles unlock based on your level, rank, and achievements
              </p>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 border-t border-red-200">
              <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-800">Delete Profile</h4>
                    <p className="text-sm text-red-700">
                      This will permanently delete your profile, all game data, achievements, 
                      ELO rating, coins, and any other personal information. You will be 
                      redirected to the onboarding process.
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={handleDeleteProfile}
                className="w-full h-12 flex items-center gap-2"
              >
                <Trash2 className="h-5 w-5" />
                Delete Profile
                </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleCancelEdit}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                  Cancel
                </Button>
              <Button 
                onClick={handleSaveProfile}
                disabled={!editForm.username.trim()}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Profile Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              Delete Profile
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Warning Message */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-800">This action cannot be undone</h4>
                  <p className="text-sm text-red-700">
                    This will permanently delete your profile, all game data, achievements, 
                    ELO rating, coins, and any other personal information. You will be 
                    redirected to the onboarding process.
                  </p>
                </div>
              </div>
            </div>

            {/* Confirmation Input */}
            <div className="space-y-2">
              <Label htmlFor="deleteConfirmation" className="text-sm font-medium">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm:
              </Label>
              <Input
                id="deleteConfirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                className="border-red-200 focus:border-red-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                className="flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Profile
                  </>
                )}
              </Button>
            </div>
        </div>
        </DialogContent>
      </Dialog>

      {/* Delete Success Animation */}
      {showDeleteSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl p-8 text-center max-w-md mx-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="h-8 w-8 text-green-600" />
            </motion.div>
            <motion.h3
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-bold text-gray-900 mb-2"
            >
              Profile Deleted
            </motion.h3>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600"
            >
              Your profile has been successfully deleted. Redirecting to onboarding...
            </motion.p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.5, duration: 1.5 }}
              className="mt-4 h-2 bg-green-200 rounded-full overflow-hidden"
            >
              <div className="h-full bg-green-500 rounded-full" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Profile;