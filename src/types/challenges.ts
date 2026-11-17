import { TestMode } from "./typing";

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  mode: TestMode;
  targetWpm?: number;
  targetAccuracy?: number;
  modeValue: number;
  rewardTitle: string;
}

export interface ChallengeCompletionRecord {
  date: string;
  challenge_id: string;
  completed_at: number;
  wpm: number;
  accuracy: number;
}
