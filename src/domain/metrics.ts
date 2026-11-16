import { TestMetrics } from "@/types/typing";

/**
 * Calculates Gross Words Per Minute.
 * Convention: 1 word = 5 keystrokes.
 */
export function calculateGrossWpm(
  totalCharacters: number,
  elapsedSeconds: number
): number {
  if (elapsedSeconds <= 0 || totalCharacters <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  const wpm = totalCharacters / 5 / minutes;
  return Math.round(wpm * 10) / 10;
}

/**
 * Calculates Net Words Per Minute based on correctly typed characters.
 * Convention: 1 word = 5 keystrokes.
 */
export function calculateNetWpm(
  correctCharacters: number,
  elapsedSeconds: number
): number {
  if (elapsedSeconds <= 0 || correctCharacters <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  const wpm = correctCharacters / 5 / minutes;
  return Math.max(0, Math.round(wpm * 10) / 10);
}

/**
 * Calculates typing accuracy as a percentage.
 */
export function calculateAccuracy(
  correctCharacters: number,
  totalCharacters: number
): number {
  if (totalCharacters <= 0) return 100;
  const acc = (correctCharacters / totalCharacters) * 100;
  return Math.max(0, Math.min(100, Math.round(acc * 10) / 10));
}

/**
 * Calculates the complete snapshot of test metrics.
 */
export function computeMetrics(
  correctCharacters: number,
  incorrectCharacters: number,
  totalCharacters: number,
  elapsedSeconds: number
): TestMetrics {
  return {
    grossWpm: calculateGrossWpm(totalCharacters, elapsedSeconds),
    netWpm: calculateNetWpm(correctCharacters, elapsedSeconds),
    accuracy: calculateAccuracy(correctCharacters, totalCharacters),
    correctCharacters,
    incorrectCharacters,
    totalCharacters,
    elapsedSeconds: Math.round(elapsedSeconds * 10) / 10,
  };
}
