import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Medal, Star, Crown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getAchievements, 
  getUnlockedAchievements, 
  getLockedAchievements,
  getAchievementStats,
  getAchievementProgress,
  refreshAchievements,
  SimpleAchievement 
} from "@/lib/simpleAchievements";
import { getUserProfile } from "@/lib/userStorage";
import { Progress } from "@/components/ui/progress";

const Achievements = () => {
  const [achievements, setAchievements] = useState<SimpleAchievement[]>([]);
  const [stats, setStats] = useState({ total: 0, unlocked: 0, locked: 0, progressPercentage: 0 });
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const allAchievements = getAchievements();
    const achievementStats = getAchievementStats();
    const profile = getUserProfile();
    
    setAchievements(allAchievements);
    setStats(achievementStats);
    setUserProfile(profile);
  }, []);

  const getDifficultyIcon = (requirement: number) => {
    if (requirement <= 5) return <Medal className="h-4 w-4 text-yellow-600" />; // Bronze
    if (requirement <= 15) return <Award className="h-4 w-4 text-gray-400" />; // Silver
    return <Crown className="h-4 w-4 text-yellow-500" />; // Gold
  };

  const getDifficultyColor = (requirement: number) => {
    if (requirement <= 5) return "bg-yellow-100 text-yellow-700 border-yellow-200"; // Bronze
    if (requirement <= 15) return "bg-gray-100 text-gray-700 border-gray-200"; // Silver
    return "bg-yellow-50 text-yellow-800 border-yellow-300"; // Gold
  };

  const getTrophyIcon = (requirement: number) => {
    if (requirement <= 5) return <Medal className="h-6 w-6" />; // Bronze
    if (requirement <= 15) return <Award className="h-6 w-6" />; // Silver
    return <Crown className="h-6 w-6" />; // Gold
  };

  const handleRefreshAchievements = () => {
    const refreshedAchievements = refreshAchievements();
    const achievementStats = getAchievementStats();
    
    setAchievements(refreshedAchievements);
    setStats(achievementStats);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div>
          <h1 className="text-4xl font-bold text-black">Achievements</h1>
          <p className="text-gray-600 text-lg">
            Track your progress and unlock new goals
          </p>
        </div>
        <Button 
          onClick={handleRefreshAchievements}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Achievements
        </Button>
      </div>

      {/* Stats Overview */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-gray-800" />
            Achievement Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">{stats.unlocked}</div>
              <div className="text-sm text-gray-600">Unlocked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">{stats.locked}</div>
              <div className="text-sm text-gray-600">Locked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">{stats.progressPercentage}%</div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <Card 
            key={achievement.id} 
            className={`border-gray-200 transition-all duration-200 hover:shadow-md ${
              achievement.unlockedAt > 0 
                ? "bg-black text-white" 
                : "bg-white"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  achievement.unlockedAt > 0 ? "bg-green-500" : "bg-gray-100"
                }`}>
                  <div className={`h-6 w-6 ${
                    achievement.unlockedAt > 0 ? "text-white" : "text-gray-600"
                  }`}>
                    {getTrophyIcon(achievement.requirement)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold text-sm ${
                      achievement.unlockedAt > 0 ? "text-white" : "text-gray-900"
                    }`}>
                      {achievement.name}
                    </h3>
                    {achievement.unlockedAt > 0 && (
                      <Badge variant="secondary" className="text-xs bg-green-500 text-white">
                        Unlocked
                      </Badge>
                    )}
                  </div>
                  <p className={`text-xs mb-2 ${
                    achievement.unlockedAt > 0 ? "text-gray-300" : "text-gray-600"
                  }`}>
                    {achievement.description}
                  </p>
                  <div className="flex items-center gap-3">
                    {/* Highlighted Score Display */}
                    {(achievement.type === 'score' || achievement.type === 'category' || achievement.type === 'difficulty') && (
                      <div className={`px-3 py-1 rounded-lg font-bold text-sm ${
                        achievement.unlockedAt > 0 
                          ? "bg-green-500 text-white" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {achievement.requirement} pts
                      </div>
                    )}
                    
                    {/* Other Requirements */}
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getDifficultyColor(achievement.requirement)}`}
                    >
                      {getDifficultyIcon(achievement.requirement)}
                      <span className="ml-1">
                        {achievement.type === 'score' ? `Score Target` :
                         achievement.type === 'consecutive' ? `Games: ${achievement.requirement}` :
                         achievement.type === 'streak' ? `Streak: ${achievement.requirement}` :
                         achievement.type === 'mode' ? `Games: ${achievement.requirement}` :
                         achievement.type === 'category' ? `Score Target` :
                         achievement.type === 'difficulty' ? `Score Target` :
                         achievement.type === 'special' ? `Count: ${achievement.requirement}` :
                         achievement.type === 'stats' ? `Count: ${achievement.requirement}` :
                         `Requirement: ${achievement.requirement}`}
                      </span>
                    </Badge>
                  </div>
                  
                  {/* Progress Bar for Locked Achievements */}
                  {achievement.unlockedAt === 0 && userProfile && (
                    <div className="mt-3">
                      {(() => {
                        const progress = getAchievementProgress(achievement, userProfile.id);
                        return (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Progress</span>
                              <span>{progress.current}/{progress.total}</span>
                            </div>
                            <Progress 
                              value={progress.percentage} 
                              className="h-2"
                            />
                            <div className="text-xs text-muted-foreground text-center">
                              {progress.percentage}% complete
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  
                  {achievement.unlockedAt > 0 && (
                    <div className="mt-2 text-xs text-gray-400">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                  
                  {/* Testing Button - Remove in production */}
                  {achievement.unlockedAt === 0 && (
                    <Button
                      size="sm"
                      className="mt-2 bg-green-500 hover:bg-green-600 text-white text-xs"
                      onClick={() => {
                        const updatedAchievements = achievements.map(a => 
                          a.id === achievement.id 
                            ? { ...a, unlockedAt: Date.now() }
                            : a
                        );
                        setAchievements(updatedAchievements);
                        const achievementStats = getAchievementStats();
                        setStats(achievementStats);
                      }}
                    >
                      Click to Unlock (Test)
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Achievements;
