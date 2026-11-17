export type TestStatus = "idle" | "ready" | "running" | "completed" | "cancelled";

export type TestMode = "time" | "words" | "sentence" | "quote" | "code" | "custom";

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
  hasNewline?: boolean;
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
  modeValue: number;
  vocabulary: "top200" | "top1000" | "top5000" | "advanced";
  language: string;
  seed?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  codeLanguage?: string;
  customText?: string;
  contentId?: string;
  author?: string;
  source?: string;
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
