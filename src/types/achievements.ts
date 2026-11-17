export type AchievementCategory =
  | "getting-started"
  | "speed"
  | "accuracy"
  | "consistency"
  | "learning"
  | "challenges";

export interface AchievementDefinition {
  id: string;
  category: AchievementCategory;
  title: string;
  description: string;
  icon: string;
}

export interface UserAchievementRecord {
  id: string;
  unlocked_at: number;
  progress: number;
}
