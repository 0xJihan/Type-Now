import { AchievementDefinition } from "@/types/achievements";
import { TestResultRecord } from "@/types/typing";
import { LessonProgressRecord } from "@/types/academy";
import { unlockAchievement } from "@/persistence/db-bridge";

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // Getting Started
  {
    id: "first_test",
    category: "getting-started",
    title: "First Steps",
    description: "Complete your first typing test.",
    icon: "Keyboard",
  },
  {
    id: "first_lesson",
    category: "getting-started",
    title: "Student of Touch",
    description: "Complete your first Academy lesson.",
    icon: "GraduationCap",
  },
  {
    id: "first_chapter",
    category: "getting-started",
    title: "Home Row Certified",
    description: "Complete Chapter 1 in the Academy.",
    icon: "Award",
  },

  // Speed
  {
    id: "speed_20",
    category: "speed",
    title: "Cruising Speed",
    description: "Reach 20 Net WPM in any test.",
    icon: "Zap",
  },
  {
    id: "speed_40",
    category: "speed",
    title: "Flow State",
    description: "Reach 40 Net WPM in any test.",
    icon: "Zap",
  },
  {
    id: "speed_60",
    category: "speed",
    title: "Brisk Typist",
    description: "Reach 60 Net WPM in any test.",
    icon: "Flame",
  },
  {
    id: "speed_80",
    category: "speed",
    title: "High Velocity",
    description: "Reach 80 Net WPM in any test.",
    icon: "Flame",
  },
  {
    id: "speed_100",
    category: "speed",
    title: "Century Club",
    description: "Reach 100 Net WPM in any test.",
    icon: "Trophy",
  },
  {
    id: "speed_120",
    category: "speed",
    title: "Master of Keyboards",
    description: "Reach 120 Net WPM in any test.",
    icon: "Crown",
  },

  // Accuracy
  {
    id: "acc_90",
    category: "accuracy",
    title: "Steady Hands",
    description: "Complete a test with at least 90% accuracy.",
    icon: "Target",
  },
  {
    id: "acc_95",
    category: "accuracy",
    title: "Sharpshooter",
    description: "Complete a test with at least 95% accuracy.",
    icon: "Target",
  },
  {
    id: "acc_98",
    category: "accuracy",
    title: "Precision Instrument",
    description: "Complete a test with at least 98% accuracy.",
    icon: "Crosshair",
  },
  {
    id: "acc_100",
    category: "accuracy",
    title: "Flawless Keystrokes",
    description: "Achieve 100% perfect accuracy in a test.",
    icon: "Sparkles",
  },

  // Consistency
  {
    id: "tests_5",
    category: "consistency",
    title: "Building the Habit",
    description: "Complete 5 typing tests.",
    icon: "CalendarCheck",
  },
  {
    id: "tests_25",
    category: "consistency",
    title: "Dedicated Typist",
    description: "Complete 25 typing tests.",
    icon: "Layers",
  },
  {
    id: "tests_100",
    category: "consistency",
    title: "Centurion",
    description: "Complete 100 typing tests.",
    icon: "ShieldCheck",
  },
  {
    id: "practice_1hr",
    category: "consistency",
    title: "Hour of Power",
    description: "Accumulate 1 hour of total typing practice.",
    icon: "Clock",
  },

  // Learning
  {
    id: "lessons_5",
    category: "learning",
    title: "Dedicated Learner",
    description: "Complete 5 Academy lessons.",
    icon: "BookOpen",
  },
  {
    id: "lessons_full",
    category: "learning",
    title: "Grandmaster",
    description: "Complete the entire 10-chapter Academy curriculum.",
    icon: "GraduationCap",
  },

  // Challenges
  {
    id: "first_challenge",
    category: "challenges",
    title: "Contender",
    description: "Complete your first Daily Challenge.",
    icon: "Flag",
  },
  {
    id: "challenges_7",
    category: "challenges",
    title: "Weekly Challenger",
    description: "Complete 7 Daily Challenges.",
    icon: "Medal",
  },
];

export class AchievementEngine {
  public static async evaluate(
    history: TestResultRecord[],
    lessons: LessonProgressRecord[],
    challengeCount: number
  ): Promise<string[]> {
    const newlyUnlocked: string[] = [];

    const totalTests = history.length;
    const maxWpm = history.reduce((max, h) => Math.max(max, h.netWpm), 0);
    const maxAcc = history.reduce((max, h) => Math.max(max, h.accuracy), 0);
    const totalPracticeSeconds = history.reduce((sum, h) => sum + h.durationSeconds, 0);

    const completedLessons = lessons.filter((l) => l.completed).length;
    const ch1Completed =
      lessons.filter((l) => l.chapter_id === 1 && l.completed).length >= 3;

    // Checks
    const check = async (id: string, condition: boolean) => {
      if (condition) {
        const unlocked = await unlockAchievement(id);
        if (unlocked) newlyUnlocked.push(id);
      }
    };

    // Getting Started
    await check("first_test", totalTests >= 1);
    await check("first_lesson", completedLessons >= 1);
    await check("first_chapter", ch1Completed);

    // Speed
    await check("speed_20", maxWpm >= 20);
    await check("speed_40", maxWpm >= 40);
    await check("speed_60", maxWpm >= 60);
    await check("speed_80", maxWpm >= 80);
    await check("speed_100", maxWpm >= 100);
    await check("speed_120", maxWpm >= 120);

    // Accuracy
    await check("acc_90", maxAcc >= 90);
    await check("acc_95", maxAcc >= 95);
    await check("acc_98", maxAcc >= 98);
    await check("acc_100", maxAcc >= 100);

    // Consistency
    await check("tests_5", totalTests >= 5);
    await check("tests_25", totalTests >= 25);
    await check("tests_100", totalTests >= 100);
    await check("practice_1hr", totalPracticeSeconds >= 3600);

    // Learning
    await check("lessons_5", completedLessons >= 5);
    await check("lessons_full", completedLessons >= 15);

    // Challenges
    await check("first_challenge", challengeCount >= 1);
    await check("challenges_7", challengeCount >= 7);

    return newlyUnlocked;
  }
}
