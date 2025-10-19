import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Clock, Award } from "lucide-react";
import { getUserProfile } from "@/lib/userStorage";
import { getGameHistoryByUserId } from "@/lib/gameHistoryStorage";

const Analytics = () => {
  // Get real user data from storage
  const userProfile = getUserProfile();
  const gameHistory = getGameHistoryByUserId(userProfile.id);
  
  // Use real statistics with correct property names
  const totalGames = userProfile.statistics.totalGamesPlayed;
  const totalScore = userProfile.statistics.totalScore; // Use actual total score
  const avgScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0;
  const avgAccuracy = userProfile.statistics.averageAccuracy;
  const totalTime = userProfile.statistics.totalTimeSpent;
  const avgTimeSeconds = totalGames > 0 ? Math.round(totalTime / totalGames / 1000) : 0;

  // Use real category and difficulty statistics
  const categoryStats = userProfile.statistics.categoryStats;
  const difficultyStats = userProfile.statistics.difficultyStats;

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Analytics & Progress</h1>
        <p className="text-lg text-muted-foreground">
          Track your performance and identify areas for improvement
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalGames}</div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{avgScore}</div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {Math.floor(avgTimeSeconds / 60)}:{(avgTimeSeconds % 60).toString().padStart(2, "0")}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {userProfile.statistics.bestScore}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {Math.round(avgAccuracy)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      <Card className="border-border shadow-elegant">
        <CardHeader>
          <CardTitle className="text-2xl">Performance by Category</CardTitle>
          <CardDescription>
            Your average scores across different topic areas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(categoryStats).map(([category, stats]) => {
            if (stats.gamesPlayed === 0) return null; // Don't show categories with no games
            
            const avgScore = stats.gamesPlayed > 0 ? Math.round(stats.correctAnswers / stats.gamesPlayed) : 0;
            const maxScore = 20; // Reasonable max score for progress bar
            const percentage = Math.min((avgScore / maxScore) * 100, 100);
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="capitalize">
                      {category}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {stats.gamesPlayed} game{stats.gamesPlayed !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <span className="text-xl font-bold text-primary">
                    {avgScore} avg
                  </span>
                </div>
                <Progress value={percentage} className="h-3" />
                <div className="text-xs text-muted-foreground">
                  {Math.round(stats.averageAccuracy)}% accuracy • Best: {stats.bestScore}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Difficulty Breakdown */}
      <Card className="border-border shadow-elegant">
        <CardHeader>
          <CardTitle className="text-2xl">Performance by Difficulty</CardTitle>
          <CardDescription>
            How you perform at different challenge levels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(difficultyStats).map(([difficulty, stats]) => {
            if (stats.gamesPlayed === 0) return null; // Don't show difficulties with no games
            
            const avgScore = stats.gamesPlayed > 0 ? Math.round(stats.correctAnswers / stats.gamesPlayed) : 0;
            const maxScore = 20; // Reasonable max score for progress bar
            const percentage = Math.min((avgScore / maxScore) * 100, 100);
            return (
              <div key={difficulty} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        difficulty === "hard"
                          ? "destructive"
                          : difficulty === "medium"
                          ? "default"
                          : "secondary"
                      }
                      className="capitalize"
                    >
                      {difficulty}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {stats.gamesPlayed} game{stats.gamesPlayed !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <span className="text-xl font-bold text-primary">
                    {avgScore} avg
                  </span>
                </div>
                <Progress value={percentage} className="h-3" />
                <div className="text-xs text-muted-foreground">
                  {Math.round(stats.averageAccuracy)}% accuracy • Best: {stats.bestScore}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Improvement Suggestions */}
      <Card className="border-accent/50 bg-gradient-accent shadow-glow">
        <CardHeader>
          <CardTitle className="text-2xl text-accent-foreground">
            Suggested Focus Areas
          </CardTitle>
          <CardDescription className="text-accent-foreground/80">
            Based on your performance data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(categoryStats)
              .filter(([_, stats]) => stats.gamesPlayed > 0) // Only show categories with games
              .sort((a, b) => {
                const avgA = a[1].gamesPlayed > 0 ? a[1].correctAnswers / a[1].gamesPlayed : 0;
                const avgB = b[1].gamesPlayed > 0 ? b[1].correctAnswers / b[1].gamesPlayed : 0;
                return avgA - avgB; // Sort by lowest average score first
              })
              .slice(0, 2)
              .map(([category]) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-4 rounded-lg bg-card/80 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    <span className="font-medium capitalize">{category}</span>
                  </div>
                  <Badge variant="secondary">Practice Recommended</Badge>
                </div>
              ))}
            {Object.entries(categoryStats).filter(([_, stats]) => stats.gamesPlayed > 0).length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <p>Play some games to see improvement suggestions!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
