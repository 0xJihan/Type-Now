import { describe, it, expect } from "vitest";
import {
  calculateGrossWpm,
  calculateNetWpm,
  calculateAccuracy,
  computeMetrics,
} from "../domain/metrics";

describe("Typing Metrics", () => {
  it("calculates Gross WPM accurately", () => {
    // 300 characters in 60 seconds = 60 WPM
    expect(calculateGrossWpm(300, 60)).toBe(60);

    // 150 characters in 30 seconds = 60 WPM
    expect(calculateGrossWpm(150, 30)).toBe(60);

    // 250 characters in 30 seconds = (50 words) / 0.5 minutes = 100 WPM
    expect(calculateGrossWpm(250, 30)).toBe(100);
  });

  it("calculates Net WPM accurately and clamps negative to 0", () => {
    // 240 correct characters in 60 seconds = 48 WPM
    expect(calculateNetWpm(240, 60)).toBe(48);

    // Zero correct characters
    expect(calculateNetWpm(0, 60)).toBe(0);
  });

  it("handles zero elapsed time without division by zero errors", () => {
    expect(calculateGrossWpm(100, 0)).toBe(0);
    expect(calculateNetWpm(100, 0)).toBe(0);
    expect(calculateGrossWpm(0, 0)).toBe(0);
    expect(calculateNetWpm(0, 0)).toBe(0);
  });

  it("calculates Accuracy percentage correctly", () => {
    // 95 correct out of 100 total = 95%
    expect(calculateAccuracy(95, 100)).toBe(95);

    // 100% when no characters typed yet
    expect(calculateAccuracy(0, 0)).toBe(100);

    // 0% when 0 correct out of 50
    expect(calculateAccuracy(0, 50)).toBe(0);

    // Floating precision rounding: 98 out of 99 = 98.989... -> 99.0%
    expect(calculateAccuracy(98, 99)).toBe(99);
  });

  it("computes complete metrics snapshot", () => {
    const snapshot = computeMetrics(190, 10, 200, 30);
    expect(snapshot.grossWpm).toBe(80); // (200 / 5) / 0.5 = 80
    expect(snapshot.netWpm).toBe(76); // (190 / 5) / 0.5 = 76
    expect(snapshot.accuracy).toBe(95);
    expect(snapshot.correctCharacters).toBe(190);
    expect(snapshot.incorrectCharacters).toBe(10);
    expect(snapshot.totalCharacters).toBe(200);
    expect(snapshot.elapsedSeconds).toBe(30);
  });
});
