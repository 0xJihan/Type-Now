import { invoke } from "@tauri-apps/api/core";
import { TestResultRecord } from "@/types/typing";
import { DEFAULT_PREFERENCES, UserPreferences } from "@/types/preferences";

function isTauriEnvironment(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

// In-memory fallback stores for non-Tauri environments (e.g. tests)
let fallbackPreferences: UserPreferences = { ...DEFAULT_PREFERENCES };
let fallbackHistory: TestResultRecord[] = [];

export async function saveTestResult(
  record: TestResultRecord
): Promise<string> {
  if (isTauriEnvironment()) {
    try {
      const rustRecord = {
        id: record.id || null,
        timestamp: record.timestamp,
        mode: record.mode,
        mode_value: record.modeValue,
        gross_wpm: record.grossWpm,
        net_wpm: record.netWpm,
        accuracy: record.accuracy,
        correct_characters: record.correctCharacters,
        incorrect_characters: record.incorrectCharacters,
        total_characters: record.totalCharacters,
        duration_seconds: record.durationSeconds,
        language: record.language,
        seed: record.seed || null,
      };
      return await invoke<string>("db_save_test_result", {
        record: rustRecord,
      });
    } catch (e) {
      console.warn("Failed to save result to Tauri SQLite:", e);
    }
  }

  // Fallback
  const id = record.id || `res_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  fallbackHistory.unshift({ ...record, id });
  return id;
}

export async function getTestHistory(
  limit = 50,
  offset = 0
): Promise<TestResultRecord[]> {
  if (isTauriEnvironment()) {
    try {
      const rows = await invoke<
        Array<{
          id?: string;
          timestamp: number;
          mode: string;
          mode_value: number;
          gross_wpm: number;
          net_wpm: number;
          accuracy: number;
          correct_characters: number;
          incorrect_characters: number;
          total_characters: number;
          duration_seconds: number;
          language: string;
          seed?: string;
        }>
      >("db_get_test_history", { limit, offset });

      return rows.map((r) => ({
        id: r.id,
        timestamp: r.timestamp,
        mode: r.mode as "time" | "words",
        modeValue: r.mode_value,
        grossWpm: r.gross_wpm,
        netWpm: r.net_wpm,
        accuracy: r.accuracy,
        correctCharacters: r.correct_characters,
        incorrectCharacters: r.incorrect_characters,
        totalCharacters: r.total_characters,
        durationSeconds: r.duration_seconds,
        language: r.language,
        seed: r.seed,
      }));
    } catch (e) {
      console.warn("Failed to get history from Tauri SQLite:", e);
    }
  }

  return fallbackHistory.slice(offset, offset + limit);
}

export async function getPreferences(): Promise<UserPreferences> {
  if (isTauriEnvironment()) {
    try {
      const rustPrefs = await invoke<{
        theme: string;
        sound_pack: string;
        sound_volume: number;
        sound_enabled: boolean;
        default_mode: string;
        default_time: number;
        default_words: number;
        vocabulary: string;
        quick_restart: boolean;
      }>("db_get_preferences");

      return {
        theme: rustPrefs.theme as "dark" | "light" | "system",
        soundPack: rustPrefs.sound_pack,
        soundVolume: rustPrefs.sound_volume,
        soundEnabled: rustPrefs.sound_enabled,
        defaultMode: rustPrefs.default_mode as "time" | "words",
        defaultTime: rustPrefs.default_time,
        defaultWords: rustPrefs.default_words,
        vocabulary: rustPrefs.vocabulary as "top200" | "top1000",
        quickRestart: rustPrefs.quick_restart,
      };
    } catch (e) {
      console.warn("Failed to get preferences from Tauri SQLite:", e);
    }
  }

  return { ...fallbackPreferences };
}

export async function savePreferences(
  prefs: UserPreferences
): Promise<void> {
  fallbackPreferences = { ...prefs };

  if (isTauriEnvironment()) {
    try {
      await invoke("db_save_preferences", {
        prefs: {
          theme: prefs.theme,
          sound_pack: prefs.soundPack,
          sound_volume: prefs.soundVolume,
          sound_enabled: prefs.soundEnabled,
          default_mode: prefs.defaultMode,
          default_time: prefs.defaultTime,
          default_words: prefs.defaultWords,
          vocabulary: prefs.vocabulary,
          quick_restart: prefs.quickRestart,
        },
      });
    } catch (e) {
      console.warn("Failed to save preferences to Tauri SQLite:", e);
    }
  }
}

export async function clearTestHistory(): Promise<void> {
  fallbackHistory = [];
  if (isTauriEnvironment()) {
    try {
      await invoke("db_clear_history");
    } catch (e) {
      console.warn("Failed to clear history in Tauri SQLite:", e);
    }
  }
}
