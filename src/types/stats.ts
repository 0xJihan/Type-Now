export interface CharacterErrorRecord {
  character: string;
  mistyped_as: string;
  count: number;
}

export interface WeakKeyRecord {
  character: string;
  total_errors: number;
}

export interface StatsSummaryRecord {
  total_tests: number;
  total_time_seconds: number;
  avg_wpm: number;
  best_wpm: number;
  avg_accuracy: number;
  best_accuracy: number;
  total_characters: number;
}
