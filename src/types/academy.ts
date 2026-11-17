import { ContentDifficulty } from "./content";

export type Finger =
  | "left-pinky"
  | "left-ring"
  | "left-middle"
  | "left-index"
  | "thumb"
  | "right-index"
  | "right-middle"
  | "right-ring"
  | "right-pinky";

export interface Lesson {
  id: string;
  chapterId: number;
  title: string;
  description: string;
  objectives: string[];
  difficulty: ContentDifficulty;
  requiredKeys: string[];
  minAccuracy: number;
  minWpm: number;
  exercises: string[];
  prerequisites: string[];
}

export interface Chapter {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface LessonProgressRecord {
  lesson_id: string;
  chapter_id: number;
  completed: boolean;
  mastered: boolean;
  best_wpm: number;
  best_accuracy: number;
  attempts: number;
  last_attempt_at: number;
}
