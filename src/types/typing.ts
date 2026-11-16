export type TestStatus = "idle" | "ready" | "running" | "completed" | "cancelled";

export type TestMode = "time" | "words";

export type CharacterStatus = "pending" | "correct" | "incorrect" | "extra";

export interface CharacterState {
  char: string;
  status: CharacterStatus;
}

export interface WordState {
  target: string;
  typed: string;
  characters: CharacterState[];
  isCompleted: boolean;
}

export interface TestMetrics {
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  correctCharacters: number;
  incorrectCharacters: number;
  totalCharacters: number;
  elapsedSeconds: number;
}

export interface TestConfig {
  mode: TestMode;
  modeValue: number; // e.g. 15, 30, 60, 120 or 10, 25, 50, 100
  vocabulary: "top200" | "top1000";
  language: string;
  seed?: string;
}

export interface TestResultRecord {
  id?: string;
  timestamp: number;
  mode: TestMode;
  modeValue: number;
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  correctCharacters: number;
  incorrectCharacters: number;
  totalCharacters: number;
  durationSeconds: number;
  language: string;
  seed?: string;
}
