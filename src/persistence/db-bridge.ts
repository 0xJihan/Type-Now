import { invoke } from "@tauri-apps/api/core";
import { TestResultRecord } from "@/types/typing";
import { DEFAULT_PREFERENCES, UserPreferences } from "@/types/preferences";
import { LessonProgressRecord } from "@/types/academy";
import { CharacterErrorRecord, StatsSummaryRecord, WeakKeyRecord } from "@/types/stats";
import { ChallengeCompletionRecord } from "@/types/challenges";
import { UserAchievementRecord } from "@/types/achievements";

function isTauriEnvironment(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

// In-memory fallback stores for non-Tauri / test environments
let fallbackPreferences: UserPreferences = { ...DEFAULT_PREFERENCES };
let fallbackHistory: TestResultRecord[] = [];
let fallbackLessonProgress: Record<string, LessonProgressRecord> = {};
let fallbackCharacterErrors: Record<string, number> = {};
let fallbackChallenges: Record<string, ChallengeCompletionRecord[]> = {};
let fallbackAchievements: Record<string, UserAchievementRecord> = {};
let fallbackRecentContent: Record<string, string[]> = {};

export async function saveTestResult(record: TestResultRecord): Promise<string> {
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

  const id = record.id || `res_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  fallbackHistory.unshift({ ...record, id });
  return id;
}

export async function getTestHistory(limit = 50, offset = 0): Promise<TestResultRecord[]> {
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
        mode: r.mode as any,
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
        defaultMode: rustPrefs.default_mode as any,
        defaultTime: rustPrefs.default_time,
        defaultWords: rustPrefs.default_words,
        vocabulary: rustPrefs.vocabulary as any,
        quickRestart: rustPrefs.quick_restart,
      };
    } catch (e) {
      console.warn("Failed to get preferences from Tauri SQLite:", e);
    }
  }

  return { ...fallbackPreferences };
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
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

// --- Phase 5: Academy Lesson Progress ---
export async function saveLessonProgress(progress: LessonProgressRecord): Promise<void> {
  if (isTauriEnvironment()) {
    try {
      await invoke("db_save_lesson_progress", { progress });
      return;
    } catch (e) {
      console.warn("Failed to save lesson progress to SQLite:", e);
    }
  }

  const existing = fallbackLessonProgress[progress.lesson_id];
  fallbackLessonProgress[progress.lesson_id] = {
    ...progress,
    attempts: (existing?.attempts || 0) + 1,
    best_wpm: Math.max(existing?.best_wpm || 0, progress.best_wpm),
    best_accuracy: Math.max(existing?.best_accuracy || 0, progress.best_accuracy),
    completed: existing?.completed || progress.completed,
    mastered: existing?.mastered || progress.mastered,
  };
}

export async function getLessonProgress(): Promise<LessonProgressRecord[]> {
  if (isTauriEnvironment()) {
    try {
      return await invoke<LessonProgressRecord[]>("db_get_lesson_progress");
    } catch (e) {
      console.warn("Failed to get lesson progress from SQLite:", e);
    }
  }

  return Object.values(fallbackLessonProgress);
}

// --- Phase 6: Character Error Analytics ---
export async function recordCharacterErrors(errors: CharacterErrorRecord[]): Promise<void> {
  if (isTauriEnvironment()) {
    try {
      await invoke("db_record_character_errors", { errors });
      return;
    } catch (e) {
      console.warn("Failed to record character errors in SQLite:", e);
    }
  }

  for (const err of errors) {
    fallbackCharacterErrors[err.character] =
      (fallbackCharacterErrors[err.character] || 0) + err.count;
  }
}

export async function getWeakKeys(limit = 10): Promise<WeakKeyRecord[]> {
  if (isTauriEnvironment()) {
    try {
      return await invoke<WeakKeyRecord[]>("db_get_weak_keys", { limit });
    } catch (e) {
      console.warn("Failed to get weak keys from SQLite:", e);
    }
  }

  return Object.entries(fallbackCharacterErrors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([character, total_errors]) => ({ character, total_errors }));
}

// --- Phase 6: Daily Challenges ---
export async function saveChallengeCompletion(
  completion: ChallengeCompletionRecord
): Promise<void> {
  if (isTauriEnvironment()) {
    try {
      await invoke("db_save_challenge_completion", { completion });
      return;
    } catch (e) {
      console.warn("Failed to save challenge completion to SQLite:", e);
    }
  }

  const list = fallbackChallenges[completion.date] || [];
  const existingIdx = list.findIndex((c) => c.challenge_id === completion.challenge_id);
  if (existingIdx >= 0) {
    list[existingIdx] = {
      ...completion,
      wpm: Math.max(list[existingIdx].wpm, completion.wpm),
      accuracy: Math.max(list[existingIdx].accuracy, completion.accuracy),
    };
  } else {
    list.push(completion);
  }
  fallbackChallenges[completion.date] = list;
}

export async function getChallengeCompletions(
  date: string
): Promise<ChallengeCompletionRecord[]> {
  if (isTauriEnvironment()) {
    try {
      return await invoke<ChallengeCompletionRecord[]>("db_get_challenge_completions", {
        date,
      });
    } catch (e) {
      console.warn("Failed to get challenge completions from SQLite:", e);
    }
  }

  return fallbackChallenges[date] || [];
}

// --- Phase 6: Achievements ---
export async function unlockAchievement(
  id: string,
  timestamp = Date.now()
): Promise<boolean> {
  if (isTauriEnvironment()) {
    try {
      return await invoke<boolean>("db_unlock_achievement", { id, timestamp });
    } catch (e) {
      console.warn("Failed to unlock achievement in SQLite:", e);
    }
  }

  if (fallbackAchievements[id]) return false;
  fallbackAchievements[id] = { id, unlocked_at: timestamp, progress: 1.0 };
  return true;
}

export async function getUnlockedAchievements(): Promise<UserAchievementRecord[]> {
  if (isTauriEnvironment()) {
    try {
      return await invoke<UserAchievementRecord[]>("db_get_unlocked_achievements");
    } catch (e) {
      console.warn("Failed to get unlocked achievements from SQLite:", e);
    }
  }

  return Object.values(fallbackAchievements);
}

// --- Phase 3: Content History ---
export async function recordContentUsage(
  contentId: string,
  contentType: string
): Promise<void> {
  if (isTauriEnvironment()) {
    try {
      await invoke("db_record_content_usage", { contentId, contentType });
      return;
    } catch (e) {
      console.warn("Failed to record content usage in SQLite:", e);
    }
  }

  const list = fallbackRecentContent[contentType] || [];
  fallbackRecentContent[contentType] = [contentId, ...list.filter((id) => id !== contentId)].slice(0, 30);
}

export async function getRecentContent(
  contentType: string,
  limit = 20
): Promise<string[]> {
  if (isTauriEnvironment()) {
    try {
      return await invoke<string[]>("db_get_recent_content", {
        contentType,
        limit,
      });
    } catch (e) {
      console.warn("Failed to get recent content from SQLite:", e);
    }
  }

  return (fallbackRecentContent[contentType] || []).slice(0, limit);
}

// --- Phase 6: Statistics Summary ---
export async function getStatsSummary(period?: string): Promise<StatsSummaryRecord> {
  if (isTauriEnvironment()) {
    try {
      return await invoke<StatsSummaryRecord>("db_get_stats_summary", { period });
    } catch (e) {
      console.warn("Failed to get stats summary from SQLite:", e);
    }
  }

  if (fallbackHistory.length === 0) {
    return {
      total_tests: 0,
      total_time_seconds: 0,
      avg_wpm: 0,
      best_wpm: 0,
      avg_accuracy: 0,
      best_accuracy: 0,
      total_characters: 0,
    };
  }

  const count = fallbackHistory.length;
  const totalSeconds = fallbackHistory.reduce((s, h) => s + h.durationSeconds, 0);
  const totalChars = fallbackHistory.reduce((s, h) => s + h.totalCharacters, 0);
  const avgWpm = fallbackHistory.reduce((s, h) => s + h.netWpm, 0) / count;
  const bestWpm = Math.max(...fallbackHistory.map((h) => h.netWpm));
  const avgAcc = fallbackHistory.reduce((s, h) => s + h.accuracy, 0) / count;
  const bestAcc = Math.max(...fallbackHistory.map((h) => h.accuracy));

  return {
    total_tests: count,
    total_time_seconds: Math.round(totalSeconds * 10) / 10,
    avg_wpm: Math.round(avgWpm * 10) / 10,
    best_wpm: Math.round(bestWpm * 10) / 10,
    avg_accuracy: Math.round(avgAcc * 10) / 10,
    best_accuracy: Math.round(bestAcc * 10) / 10,
    total_characters: totalChars,
  };
}
