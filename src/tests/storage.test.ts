import { describe, it, expect, beforeEach } from "vitest";
import {
  saveTestResult,
  getTestHistory,
  getPreferences,
  savePreferences,
  clearTestHistory,
} from "../persistence/db-bridge";
import { TestResultRecord } from "../types/typing";

describe("Storage & Persistence Bridge", () => {
  beforeEach(async () => {
    await clearTestHistory();
  });

  it("saves and recovers test result records", async () => {
    const record: TestResultRecord = {
      timestamp: Date.now(),
      mode: "time",
      modeValue: 30,
      grossWpm: 75.0,
      netWpm: 72.5,
      accuracy: 96.6,
      correctCharacters: 217,
      incorrectCharacters: 8,
      totalCharacters: 225,
      durationSeconds: 30,
      language: "en",
      seed: "storage-test-seed",
    };

    const id = await saveTestResult(record);
    expect(id).toBeDefined();

    const history = await getTestHistory(10, 0);
    expect(history.length).toBe(1);
    expect(history[0].id).toBe(id);
    expect(history[0].netWpm).toBe(72.5);
    expect(history[0].seed).toBe("storage-test-seed");
  });

  it("updates and retrieves user preferences", async () => {
    const defaultPrefs = await getPreferences();
    expect(defaultPrefs.theme).toBeDefined();

    const updated = {
      ...defaultPrefs,
      theme: "light" as const,
      soundVolume: 0.45,
      defaultMode: "words" as const,
    };

    await savePreferences(updated);
    const reloaded = await getPreferences();

    expect(reloaded.theme).toBe("light");
    expect(reloaded.soundVolume).toBe(0.45);
    expect(reloaded.defaultMode).toBe("words");
  });

  it("clears test history cleanly", async () => {
    await saveTestResult({
      timestamp: Date.now(),
      mode: "words",
      modeValue: 10,
      grossWpm: 50,
      netWpm: 50,
      accuracy: 100,
      correctCharacters: 50,
      incorrectCharacters: 0,
      totalCharacters: 50,
      durationSeconds: 12,
      language: "en",
    });

    let history = await getTestHistory();
    expect(history.length).toBe(1);

    await clearTestHistory();
    history = await getTestHistory();
    expect(history.length).toBe(0);
  });
});
