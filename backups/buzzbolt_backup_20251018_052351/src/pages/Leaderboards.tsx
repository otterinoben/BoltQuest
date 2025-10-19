import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, Calendar, Clock, Star } from "lucide-react";
import { 
  getHighScores, 
  getTopHighScores, 
  getTopHighScoresByCategory,
  getHighScoresByDateRange,
  getHighScoreStatistics
} from "@/lib/highScoreStorage";
import { getUserProfile } from "@/lib/userStorage";
import { Category, Difficulty } from "@/types/game";

// Get real leaderboard data from storage
const getWeeklyLeaderboard = () => {
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const weeklyScores = getHighScoresByDateRange(oneWeekAgo, Date.now());
  
  if (weeklyScores.length === 0) {
    return []; // Return empty array if no scores
  }
  
  return weeklyScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((score, index) => ({
      id: score.id,
      rank: index + 1,
      username: score.userId.split('_')[0] || 'Player', // Extract readable part of userId
      score: score.score,
      accuracy: score.accuracy,
      category: score.category,
      difficulty: score.difficulty,
      mode: score.mode,
      date: new Date(score.achievedAt)
    }));
};

const getMonthlyLeaderboard = () => {
  const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const monthlyScores = getHighScoresByDateRange(oneMonthAgo, Date.now());
  
  if (monthlyScores.length === 0) {
    return []; // Return empty array if no scores
  }
  
  return monthlyScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((score, index) => ({
      id: score.id,
      rank: index + 1,
      username: score.userId.split('_')[0] || 'Player', // Extract readable part of userId
      score: score.score,
      accuracy: score.accuracy,
      category: score.category,
      difficulty: score.difficulty,
      mode: score.mode,
      date: new Date(score.achievedAt)
    }));
};

const getAllTimeLeaderboard = () => {
  const allTimeScores = getTopHighScores(10);
  
  if (allTimeScores.length === 0) {
    return []; // Return empty array if no scores
  }
  
  return allTimeScores.map((score, index) => ({
    id: score.id,
    rank: index + 1,
    username: score.userId.split('_')[0] || 'Player', // Extract readable part of userId
    score: score.score,
    accuracy: score.accuracy,
    category: score.category,
    difficulty: score.difficulty,
    mode: score.mode,
    date: new Date(score.achievedAt)
  }));
};

const Leaderboards = () => {
  const [filter, setFilter] = useState<"all" | "tech" | "business" | "marketing" | "finance" | "general">("all");

  // Get real high scores data
  const userProfile = getUserProfile();
  const userHighScores = getHighScores();
  
  // Get real leaderboards for each time period
  const weeklyLeaderboard = useMemo(() => getWeeklyLeaderboard(), []);
  const monthlyLeaderboard = useMemo(() => getMonthlyLeaderboard(), []);
  const allTimeLeaderboard = useMemo(() => getAllTimeLeaderboard(), []);

  // Filter function for each leaderboard
  const filterLeaderboard = (leaderboard: any[]) => {
    if (filter === "all") return leaderboard;
    return leaderboard.filter(entry => entry.category === filter);
  };

  const filteredWeekly = filterLeaderboard(weeklyLeaderboard);
  const filteredMonthly = filterLeaderboard(monthlyLeaderboard);
  const filteredAllTime = filterLeaderboard(allTimeLeaderboard);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-xl font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  // Helper function to get category colors (black/white scheme)
  const getCategoryColor = (category: string, isTop3: boolean) => {
    return isTop3 
      ? "bg-white/20 text-white border-white/30" 
      : "bg-gray-800 text-white";
  };

  // Helper function to get difficulty colors (black/white scheme)
  const getDifficultyColor = (difficulty: string, isTop3: boolean) => {
    return isTop3 
      ? "bg-white/20 text-white border-white/30" 
      : "bg-gray-800 text-white";
  };

  const LeaderboardColumn = ({ 
    title, 
    icon, 
    description, 
    entries, 
    maxHeight = "h-[600px]",
    bgGradient = "bg-gradient-to-br from-primary/5 to-primary/10"
  }: {
    title: string;
    icon: React.ReactNode;
    description: string;
    entries: any[];
    maxHeight?: string;
    bgGradient?: string;
  }) => (
    <div className="flex flex-col h-full">
      <Card className={`border-border shadow-elegant ${bgGradient} flex-1 flex flex-col`}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            {icon}
            <CardTitle className="text-xl text-foreground">{title}</CardTitle>
      </div>
          <CardDescription className="text-sm">{description}</CardDescription>
            </CardHeader>
        <CardContent className={`flex-1 overflow-y-auto ${maxHeight}`}>
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Scores Yet</h3>
              <p className="text-sm text-muted-foreground">
                Play some games to see your scores here!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                  <div
                key={entry.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                      entry.rank <= 3
                        ? "bg-gradient-primary shadow-elegant"
                        : "bg-secondary/50 hover:bg-secondary"
                    }`}
                  >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 flex items-center justify-center flex-shrink-0">
                        {getRankIcon(entry.rank)}
                      </div>
                  <div className="flex-1 min-w-0">
                        <h3
                      className={`font-semibold text-sm truncate ${
                            entry.rank <= 3 ? "text-primary-foreground" : "text-foreground"
                          }`}
                        >
                      {entry.username || 'Anonymous'}
                        </h3>
                    <div className="flex gap-1 mt-1">
                          <Badge
                        variant="default"
                        className={`text-xs capitalize ${getCategoryColor(entry.category, entry.rank <= 3)}`}
                          >
                            {entry.category}
                          </Badge>
                          <Badge
                        variant="default"
                        className={`text-xs capitalize ${getDifficultyColor(entry.difficulty, entry.rank <= 3)}`}
                          >
                            {entry.difficulty}
                          </Badge>
                        </div>
                      </div>
                  <div className="text-right flex-shrink-0">
                    <div
                      className={`text-lg font-bold ${
                        entry.rank === 1 
                          ? "text-yellow-400"
                          : entry.rank === 2 
                          ? "text-gray-300"
                          : entry.rank === 3 
                          ? "text-amber-600"
                          : "text-primary"
                          }`}
                        >
                          {entry.score}
                        </div>
                        <p
                          className={`text-xs ${
                            entry.rank <= 3
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                      {Math.round(entry.accuracy)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
          </Card>
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2">Leaderboards</h1>
        <p className="text-lg text-muted-foreground">
          Compete across different time periods
                </p>
              </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className={filter === "all" ? "bg-primary text-primary-foreground" : ""}
        >
          All Categories
        </Button>
        {["tech", "business", "marketing", "finance", "general"].map((cat) => (
          <Button
            key={cat}
            variant={filter === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(cat as any)}
            className={filter === cat ? "bg-primary text-primary-foreground" : ""}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Weekly Leaderboard */}
        <LeaderboardColumn
          title="Weekly"
          icon={<Clock className="h-5 w-5 text-primary" />}
          description="This week's top performers"
          entries={filteredWeekly}
          maxHeight="h-[350px]"
          bgGradient="bg-gradient-to-br from-blue-50/30 to-blue-100/20"
        />

        {/* Monthly Leaderboard */}
        <LeaderboardColumn
          title="Monthly"
          icon={<Calendar className="h-5 w-5 text-primary" />}
          description="This month's champions"
          entries={filteredMonthly}
          maxHeight="h-[450px]"
          bgGradient="bg-gradient-to-br from-emerald-50/30 to-emerald-100/20"
        />

        {/* All-Time Leaderboard */}
        <LeaderboardColumn
          title="All-Time"
          icon={<Star className="h-5 w-5 text-primary" />}
          description="Legendary players"
          entries={filteredAllTime}
          maxHeight="h-[550px]"
          bgGradient="bg-gradient-to-br from-purple-50/30 to-purple-100/20"
        />
      </div>

      {/* Friends Section (Future Feature) */}
      <Card className="border-border shadow-elegant bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="pt-6">
          <div className="text-center py-8">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Friends Leaderboard</h3>
            <p className="text-muted-foreground mb-4">
              Connect with friends to compete together
            </p>
            <Button variant="outline" size="sm">
              Coming Soon
            </Button>
              </div>
            </CardContent>
          </Card>
    </div>
  );
};

export default Leaderboards;