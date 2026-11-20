export type GameStatus = "playing" | "won" | "lost";

export interface GameState {
  week: number;
  balance: number;
  status: GameStatus;
  score: number;
  answered: string[];
  decisions: string[];
}

export interface Question {
  id: string;
  week: number;
  title: string;
  prompt: string;
  answers: Answer[];
}

export interface Answer {
  id: string;
  label: string;
  balanceChange: number;
  scoreChange: number;
  feedback: string;
}