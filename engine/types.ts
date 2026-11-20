export type GameStatus = "playing" | "won" | "lost";

export interface GameState {
  week: number;
  balance: number;
  status: GameStatus;
  score: number;
  answered: string[];
  decisions: string[];
  decisionHistory?: DecisionRecord[];
}

export interface Dilemma {
  id: string;
  week: number;
  title: string;
  prompt: string;
  decisions: Decision[];
}

export interface Decision {
  id: string;
  label: string;
  balanceChange: number;
  scoreChange: number;
  feedback: string;
  outcome?: GameStatus;
}

export interface DecisionRecord {
  dilemmaId: string;
  decisionId: string;
  week: number;
  balanceChange: number;
  scoreChange: number;
}

export interface Question {
  id: string;
  week: number;
  title: string;
  prompt: string;
  answers: Decision[];
}

export type Answer = Decision;
