import { describe, it, expect } from "vitest";
import { ChallengeEngine } from "../domain/challenge-engine";
import { AchievementEngine, ACHIEVEMENTS } from "../domain/achievement-engine";
import { TestResultRecord } from "../types/typing";

describe("Phase 6: Challenges & Achievements", () => {
  it("generates deterministic challenges for a given date", () => {
    const challenges1 = ChallengeEngine.getDailyChallenges("2026-11-17");
    const challenges2 = ChallengeEngine.getDailyChallenges("2026-11-17");

    expect(challenges1).toEqual(challenges2);
    expect(challenges1.length).toBe(3);
  });

  it("evaluates challenge qualification rules accurately", () => {
    const speedChallenge = ChallengeEngine.getDailyChallenges("2026-11-17")[0]; // speed sprint

    const qualifyingResult: TestResultRecord = {
      timestamp: Date.now(),
      mode: "time",
      modeValue: 60,
      grossWpm: 75,
      netWpm: 70,
      accuracy: 96,
      correctCharacters: 350,
      incorrectCharacters: 10,
      totalCharacters: 360,
      durationSeconds: 60,
      language: "en",
    };

    const slowResult: TestResultRecord = {
      ...qualifyingResult,
      netWpm: 20, // too slow
    };

    expect(ChallengeEngine.isQualified(speedChallenge, qualifyingResult)).toBe(true);
    expect(ChallengeEngine.isQualified(speedChallenge, slowResult)).toBe(false);
  });

  it("contains all structured achievement definitions", () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(20);
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(ids).toContain("first_test");
    expect(ids).toContain("speed_40");
    expect(ids).toContain("speed_100");
    expect(ids).toContain("acc_100");
    expect(ids).toContain("first_challenge");
  });

  it("evaluates and unlocks achievements based on actual session history", async () => {
    const mockHistory: TestResultRecord[] = [
      {
        timestamp: Date.now(),
        mode: "time",
        modeValue: 30,
        grossWpm: 65,
        netWpm: 62,
        accuracy: 98,
        correctCharacters: 186,
        incorrectCharacters: 4,
        totalCharacters: 190,
        durationSeconds: 30,
        language: "en",
      },
    ];

    const newlyUnlocked = await AchievementEngine.evaluate(mockHistory, [], 0);
    expect(newlyUnlocked).toContain("first_test");
    expect(newlyUnlocked).toContain("speed_20");
    expect(newlyUnlocked).toContain("speed_40");
    expect(newlyUnlocked).toContain("speed_60");
    expect(newlyUnlocked).toContain("acc_90");
    expect(newlyUnlocked).toContain("acc_95");
    expect(newlyUnlocked).toContain("acc_98");
    expect(newlyUnlocked).not.toContain("speed_100"); // 62 < 100
  });
});
