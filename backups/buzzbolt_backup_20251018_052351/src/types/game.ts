export type Difficulty = "easy" | "medium" | "hard";

export type GameMode = "quick" | "training" | "classic";

export type Category = 
  | "tech" 
  | "business" 
  | "marketing" 
  | "finance" 
  | "general";

export interface Score {
  id: string;
  score: number;
  category: Category;
  difficulty: Difficulty;
  date: Date;
  timeSpent: number;
  correctAnswers: number;
  totalQuestions: number;
}

export interface Question {
  id: string;
  buzzword: string;
  definition: string;
  options: string[];
  correctAnswer: number;
  category: Category;
  difficulty: Difficulty;
}

export interface GameState {
  currentQuestion: number;
  score: number;
  combo: number;
  timeRemaining: number;
  answers: number[];
  startTime: Date;
  questionsAnswered: number;
  isPaused: boolean;
  pauseStartTime?: Date;
  totalPauseTime: number;
  questionsSkipped: number;
  skipPenalty: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  category: Category;
  difficulty: Difficulty;
  date: Date;
}
