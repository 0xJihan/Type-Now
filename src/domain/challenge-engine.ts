import { DailyChallenge } from "@/types/challenges";
import { TestResultRecord } from "@/types/typing";
import { PRNG } from "./prng";

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export class ChallengeEngine {
  public static getDailyChallenges(dateStr = getTodayDateString()): DailyChallenge[] {
    const prng = new PRNG(`daily-challenge-${dateStr}`);

    // Speed Sprint targets vary between 40 and 65 WPM deterministically
    const speedTarget = 40 + prng.nextInt(0, 5) * 5;
    // Precision trial word counts: 25 or 50
    const wordCount = prng.next() < 0.5 ? 25 : 50;

    return [
      {
        id: "speed_sprint",
        title: "Speed Sprint",
        description: `Achieve at least ${speedTarget} WPM in a 60-second time trial.`,
        mode: "time",
        modeValue: 60,
        targetWpm: speedTarget,
        targetAccuracy: 90,
        rewardTitle: "Sprinter Badge",
      },
      {
        id: "precision_trial",
        title: "Precision Trial",
        description: `Complete a ${wordCount}-word test with 98% accuracy or higher.`,
        mode: "words",
        modeValue: wordCount,
        targetAccuracy: 98,
        rewardTitle: "Marksman Badge",
      },
      {
        id: "sentence_mastery",
        title: "Sentence Flow Challenge",
        description: "Complete a natural sentence test with at least 95% accuracy and 35 WPM.",
        mode: "sentence",
        modeValue: 1,
        targetWpm: 35,
        targetAccuracy: 95,
        rewardTitle: "Artisan Badge",
      },
    ];
  }

  public static isQualified(
    challenge: DailyChallenge,
    result: TestResultRecord
  ): boolean {
    if (result.mode !== challenge.mode) return false;

    if (challenge.mode === "time" && result.modeValue !== challenge.modeValue) {
      return false;
    }
    if (challenge.mode === "words" && result.modeValue !== challenge.modeValue) {
      return false;
    }

    if (challenge.targetWpm && result.netWpm < challenge.targetWpm) {
      return false;
    }

    if (challenge.targetAccuracy && result.accuracy < challenge.targetAccuracy) {
      return false;
    }

    return true;
  }
}
