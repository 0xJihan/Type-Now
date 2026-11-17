pub mod migrations;
pub mod models;

use models::{
    ChallengeCompletionRecord, CharacterErrorRecord, LessonProgressRecord, StatsSummaryRecord,
    TestResultRecord, UserAchievementRecord, UserPreferencesRecord, WeakKeyRecord,
};
use rusqlite::{params, Connection};
use std::path::PathBuf;
use std::sync::Mutex;
use uuid::Uuid;

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    pub fn new(path: Option<PathBuf>) -> Result<Self, String> {
        let mut conn = match path {
            Some(p) => {
                if let Some(parent) = p.parent() {
                    std::fs::create_dir_all(parent)
                        .map_err(|e| format!("Failed to create database directory: {}", e))?;
                }
                Connection::open(p)
                    .map_err(|e| format!("Failed to open SQLite database: {}", e))?
            }
            None => Connection::open_in_memory()
                .map_err(|e| format!("Failed to open in-memory SQLite database: {}", e))?,
        };

        // Enable WAL mode and foreign keys for high reliability and performance
        conn.execute_batch(
            "
            PRAGMA journal_mode = WAL;
            PRAGMA synchronous = NORMAL;
            PRAGMA foreign_keys = ON;
            ",
        )
        .map_err(|e| format!("Failed to set database pragmas: {}", e))?;

        migrations::run_migrations(&mut conn)
            .map_err(|e| format!("Failed to run database migrations: {}", e))?;

        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    pub fn save_test_result(&self, mut record: TestResultRecord) -> Result<String, String> {
        let id = record.id.unwrap_or_else(|| Uuid::new_v4().to_string());
        record.id = Some(id.clone());

        let conn = self
            .conn
            .lock()
            .map_err(|e| format!("Failed to acquire database lock: {}", e))?;

        conn.execute(
            "
            INSERT INTO test_results (
                id, timestamp, mode, mode_value, gross_wpm, net_wpm, accuracy,
                correct_characters, incorrect_characters, total_characters,
                duration_seconds, language, seed
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13);
            ",
            params![
                record.id,
                record.timestamp,
                record.mode,
                record.mode_value,
                record.gross_wpm,
                record.net_wpm,
                record.accuracy,
                record.correct_characters,
                record.incorrect_characters,
                record.total_characters,
                record.duration_seconds,
                record.language,
                record.seed,
            ],
        )
        .map_err(|e| format!("Failed to insert test result: {}", e))?;

        Ok(id)
    }

    pub fn get_test_history(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<TestResultRecord>, String> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| format!("Failed to acquire database lock: {}", e))?;

        let mut stmt = conn
            .prepare(
                "
                SELECT id, timestamp, mode, mode_value, gross_wpm, net_wpm, accuracy,
                       correct_characters, incorrect_characters, total_characters,
                       duration_seconds, language, seed
                FROM test_results
                ORDER BY timestamp DESC
                LIMIT ?1 OFFSET ?2;
                ",
            )
            .map_err(|e| format!("Failed to prepare query: {}", e))?;

        let rows = stmt
            .query_map(params![limit, offset], |row| {
                Ok(TestResultRecord {
                    id: Some(row.get(0)?),
                    timestamp: row.get(1)?,
                    mode: row.get(2)?,
                    mode_value: row.get(3)?,
                    gross_wpm: row.get(4)?,
                    net_wpm: row.get(5)?,
                    accuracy: row.get(6)?,
                    correct_characters: row.get(7)?,
                    incorrect_characters: row.get(8)?,
                    total_characters: row.get(9)?,
                    duration_seconds: row.get(10)?,
                    language: row.get(11)?,
                    seed: row.get(12)?,
                })
            })
            .map_err(|e| format!("Failed to execute query: {}", e))?;

        let mut results = Vec::new();
        for row in rows {
            results.push(row.map_err(|e| format!("Error parsing row: {}", e))?);
        }

        Ok(results)
    }

    pub fn get_preferences(&self) -> Result<UserPreferencesRecord, String> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| format!("Failed to acquire database lock: {}", e))?;

        let mut stmt = conn
            .prepare("SELECT value FROM user_preferences WHERE key = 'app_preferences';")
            .map_err(|e| format!("Failed to prepare query: {}", e))?;

        let mut rows = stmt
            .query([])
            .map_err(|e| format!("Failed to query preferences: {}", e))?;

        if let Some(row) = rows.next().map_err(|e| format!("Row error: {}", e))? {
            let json_str: String = row.get(0).map_err(|e| format!("Get error: {}", e))?;
            let prefs: UserPreferencesRecord = serde_json::from_str(&json_str)
                .map_err(|e| format!("Failed to deserialize preferences: {}", e))?;
            Ok(prefs)
        } else {
            Ok(UserPreferencesRecord::default())
        }
    }

    pub fn save_preferences(&self, prefs: &UserPreferencesRecord) -> Result<(), String> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| format!("Failed to acquire database lock: {}", e))?;

        let json_str = serde_json::to_string(prefs)
            .map_err(|e| format!("Failed to serialize preferences: {}", e))?;

        conn.execute(
            "
            INSERT INTO user_preferences (key, value)
            VALUES ('app_preferences', ?1)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value;
            ",
            params![json_str],
        )
        .map_err(|e| format!("Failed to save preferences: {}", e))?;

        Ok(())
    }

    pub fn clear_history(&self) -> Result<(), String> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| format!("Failed to acquire database lock: {}", e))?;

        conn.execute("DELETE FROM test_results;", [])
            .map_err(|e| format!("Failed to clear test history: {}", e))?;

        Ok(())
    }

    // --- Phase 5: Academy Progress ---
    pub fn save_lesson_progress(&self, progress: LessonProgressRecord) -> Result<(), String> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| format!("Failed to acquire database lock: {}", e))?;

        conn.execute(
            "
            INSERT INTO lesson_progress (
                lesson_id, chapter_id, completed, mastered, best_wpm, best_accuracy, attempts, last_attempt_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
            ON CONFLICT(lesson_id) DO UPDATE SET
                completed = MAX(completed, excluded.completed),
                mastered = MAX(mastered, excluded.mastered),
                best_wpm = MAX(best_wpm, excluded.best_wpm),
                best_accuracy = MAX(best_accuracy, excluded.best_accuracy),
                attempts = attempts + 1,
                last_attempt_at = excluded.last_attempt_at;
            ",
            params![
                progress.lesson_id,
                progress.chapter_id,
                if progress.completed { 1 } else { 0 },
                if progress.mastered { 1 } else { 0 },
                progress.best_wpm,
                progress.best_accuracy,
                progress.attempts.max(1),
                progress.last_attempt_at,
            ],
        )
        .map_err(|e| format!("Failed to save lesson progress: {}", e))?;

        Ok(())
    }

    pub fn get_lesson_progress(&self) -> Result<Vec<LessonProgressRecord>, String> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| format!("Failed to acquire database lock: {}", e))?;

        let mut stmt = conn
            .prepare(
                "
                SELECT lesson_id, chapter_id, completed, mastered, best_wpm, best_accuracy, attempts, last_attempt_at
                FROM lesson_progress;
                ",
            )
            .map_err(|e| format!("Failed to prepare query: {}", e))?;

        let rows = stmt
            .query_map([], |row| {
                Ok(LessonProgressRecord {
                    lesson_id: row.get(0)?,
                    chapter_id: row.get(1)?,
                    completed: row.get::<_, i64>(2)? == 1,
                    mastered: row.get::<_, i64>(3)? == 1,
                    best_wpm: row.get(4)?,
                    best_accuracy: row.get(5)?,
                    attempts: row.get(6)?,
                    last_attempt_at: row.get(7)?,
                })
            })
            .map_err(|e| format!("Failed to query lesson progress: {}", e))?;

        let mut results = Vec::new();
        for r in rows {
            results.push(r.map_err(|e| format!("Error reading row: {}", e))?);
        }
        Ok(results)
    }

    // --- Phase 6: Character Error Analytics ---
    pub fn record_character_errors(
        &self,
        errors: Vec<CharacterErrorRecord>,
    ) -> Result<(), String> {
        let mut conn = self
            .conn
            .lock()
            .map_err(|e| format!("Failed to acquire database lock: {}", e))?;

        let tx = conn
            .transaction()
            .map_err(|e| format!("Failed to create transaction: {}", e))?;

        for err in errors {
            tx.execute(
                "
                INSERT INTO character_errors (character, mistyped_as, count)
                VALUES (?1, ?2, ?3)
                ON CONFLICT(character, mistyped_as) DO UPDATE SET count = count + excluded.count;
                ",
                params![err.character, err.mistyped_as, err.count],
            )
            .map_err(|e| format!("Failed to insert character error: {}", e))?;
        }

        tx.commit()
            .map_err(|e| format!("Failed to commit character errors: {}", e))?;
        Ok(())
    }

    pub fn get_weak_keys(&self, limit: u32) -> Result<Vec<WeakKeyRecord>, String> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| format!("Failed to acquire database lock: {}", e))?;

        let mut stmt = conn
            .prepare(
                "
                SELECT character, SUM(count) as total_errors
                FROM character_errors
                GROUP BY character
                ORDER BY total_errors DESC
                LIMIT ?1;
                ",
            )
            .map_err(|e| format!("Failed to prepare weak keys query: {}", e))?;

        let rows = stmt
            .query_map(params![limit], |row| {
                Ok(WeakKeyRecord {
                    character: row.get(0)?,
                    total_errors: row.get(1)?,
                })
            })
            .map_err(|e| format!("Failed to query weak keys: {}", e))?;

        let mut list = Vec::new();
        for r in rows {
            list.push(r.map_err(|e| format!("Error reading row: {}", e))?);
        }
        Ok(list)
    }

    // --- Phase 6: Daily Challenge Completions ---
    pub fn save_challenge_completion(
        &self,
        completion: ChallengeCompletionRecord,
    ) -> Result<(), String> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| format!("Failed to acquire database lock: {}", e))?;

        conn.execute(
            "
            INSERT INTO daily_challenge_completions (date, challenge_id, completed_at, wpm, accuracy)
            VALUES (?1, ?2, ?3, ?4, ?5)
            ON CONFLICT(date, challenge_id) DO UPDATE SET
                completed_at = excluded.completed_at,
                wpm = MAX(wpm, excluded.wpm),
                accuracy = MAX(accuracy, excluded.accuracy);
            ",
            params![
                completion.date,
                completion.challenge_id,
                completion.completed_at,
                completion.wpm,
                completion.accuracy,
            ],
        )
        .map_err(|e| format!("Failed to save daily challenge completion: {}", e))?;

        Ok(())
    }

    pub fn get_challenge_completions(
        &self,
        date: String,
    ) -> Result<Vec<ChallengeCompletionRecord>, String> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| format!("Failed to acquire database lock: {}", e))?;

        let mut stmt = conn
            .prepare(
                "
                SELECT date, challenge_id, completed_at, wpm, accuracy
                FROM daily_challenge_completions
                WHERE date = ?1;
                ",
            )
            .map_err(|e| format!("Failed to prepare query: {}", e))?;

        let rows = stmt
            .query_map(params![date], |row| {
                Ok(ChallengeCompletionRecord {
                    date: row.get(0)?,
                    challenge_id: row.get(1)?,
                    completed_at: row.get(2)?,
                    wpm: row.get(3)?,
                    accuracy: row.get(4)?,
                })
            })
            .map_err(|e| format!("Failed to query daily challenges: {}", e))?;

        let mut list = Vec::new();
        for r in rows {
            list.push(r.map_err(|e| format!("Error reading row: {}", e))?);
        }
        Ok(list)
    }

    // --- Phase 6: Achievements ---
    pub fn unlock_achievement(&self, id: String, timestamp: i64) -> Result<bool, String> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| format!("Failed to acquire database lock: {}", e))?;

        let rows_affected = conn
            .execute(
                "
                INSERT INTO user_achievements (id, unlocked_at, progress)
                VALUES (?1, ?2, 1.0)
                ON CONFLICT(id) DO NOTHING;
                ",
                params![id, timestamp],
            )
            .map_err(|e| format!("Failed to unlock achievement: {}", e))?;

        Ok(rows_affected > 0)
    }

    pub fn get_unlocked_achievements(&self) -> Result<Vec<UserAchievementRecord>, String> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| format!("Failed to acquire database lock: {}", e))?;

        let mut stmt = conn
            .prepare("SELECT id, unlocked_at, progress FROM user_achievements;")
            .map_err(|e| format!("Failed to prepare query: {}", e))?;

        let rows = stmt
            .query_map([], |row| {
                Ok(UserAchievementRecord {
                    id: row.get(0)?,
                    unlocked_at: row.get(1)?,
                    progress: row.get(2)?,
                })
            })
            .map_err(|e| format!("Failed to query achievements: {}", e))?;

        let mut list = Vec::new();
        for r in rows {
            list.push(r.map_err(|e| format!("Error reading row: {}", e))?);
        }
        Ok(list)
    }

    // --- Phase 3: Recent Content History ---
    pub fn record_content_usage(
        &self,
        content_id: String,
        content_type: String,
    ) -> Result<(), String> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| format!("Failed to acquire database lock: {}", e))?;

        conn.execute(
            "
            INSERT INTO recent_content_history (content_id, content_type, used_at)
            VALUES (?1, ?2, CAST(strftime('%s', 'now') AS INTEGER))
            ON CONFLICT(content_id) DO UPDATE SET used_at = CAST(strftime('%s', 'now') AS INTEGER);
            ",
            params![content_id, content_type],
        )
        .map_err(|e| format!("Failed to record content usage: {}", e))?;

        Ok(())
    }

    pub fn get_recent_content(
        &self,
        content_type: String,
        limit: u32,
    ) -> Result<Vec<String>, String> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| format!("Failed to acquire database lock: {}", e))?;

        let mut stmt = conn
            .prepare(
                "
                SELECT content_id FROM recent_content_history
                WHERE content_type = ?1
                ORDER BY used_at DESC
                LIMIT ?2;
                ",
            )
            .map_err(|e| format!("Failed to prepare query: {}", e))?;

        let rows = stmt
            .query_map(params![content_type, limit], |row| row.get(0))
            .map_err(|e| format!("Failed to query recent content: {}", e))?;

        let mut list = Vec::new();
        for r in rows {
            list.push(r.map_err(|e| format!("Error reading content ID: {}", e))?);
        }
        Ok(list)
    }

    // --- Phase 6: Aggregate Statistics ---
    pub fn get_stats_summary(
        &self,
        period: Option<String>,
    ) -> Result<StatsSummaryRecord, String> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| format!("Failed to acquire database lock: {}", e))?;

        let now_sec = chrono_now_seconds();
        let time_filter = match period.as_deref() {
            Some("today") => now_sec - 86400,
            Some("7days") => now_sec - (7 * 86400),
            Some("30days") => now_sec - (30 * 86400),
            _ => 0, // All time
        };

        // Notice timestamp in test_results is in milliseconds (Date.now())
        let time_filter_ms = time_filter * 1000;

        let mut stmt = conn
            .prepare(
                "
                SELECT
                    COUNT(*),
                    COALESCE(SUM(duration_seconds), 0.0),
                    COALESCE(AVG(net_wpm), 0.0),
                    COALESCE(MAX(net_wpm), 0.0),
                    COALESCE(AVG(accuracy), 0.0),
                    COALESCE(MAX(accuracy), 0.0),
                    COALESCE(SUM(total_characters), 0)
                FROM test_results
                WHERE timestamp >= ?1;
                ",
            )
            .map_err(|e| format!("Failed to prepare query: {}", e))?;

        let summary = stmt
            .query_row(params![time_filter_ms], |row| {
                Ok(StatsSummaryRecord {
                    total_tests: row.get(0)?,
                    total_time_seconds: row.get(1)?,
                    avg_wpm: (row.get::<_, f64>(2)? * 10.0).round() / 10.0,
                    best_wpm: (row.get::<_, f64>(3)? * 10.0).round() / 10.0,
                    avg_accuracy: (row.get::<_, f64>(4)? * 10.0).round() / 10.0,
                    best_accuracy: (row.get::<_, f64>(5)? * 10.0).round() / 10.0,
                    total_characters: row.get(6)?,
                })
            })
            .map_err(|e| format!("Failed to calculate stats summary: {}", e))?;

        Ok(summary)
    }
}

fn chrono_now_seconds() -> i64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_in_memory_db_migrations_and_operations() {
        let db = Database::new(None).expect("Failed to create in-memory database");

        // Preferences default
        let default_prefs = db.get_preferences().expect("Failed to get default prefs");
        assert_eq!(default_prefs.theme, "dark");
        assert_eq!(default_prefs.sound_pack, "mx-brown");

        // Save new preferences
        let mut updated_prefs = default_prefs.clone();
        updated_prefs.theme = "light".to_string();
        updated_prefs.sound_volume = 0.5;
        db.save_preferences(&updated_prefs)
            .expect("Failed to save updated prefs");

        let loaded_prefs = db.get_preferences().expect("Failed to reload prefs");
        assert_eq!(loaded_prefs.theme, "light");
        assert_eq!(loaded_prefs.sound_volume, 0.5);

        // Save test result
        let record = TestResultRecord {
            id: None,
            timestamp: 1700000000000,
            mode: "time".to_string(),
            mode_value: 30,
            gross_wpm: 85.5,
            net_wpm: 82.0,
            accuracy: 96.5,
            correct_characters: 246,
            incorrect_characters: 9,
            total_characters: 255,
            duration_seconds: 30.0,
            language: "en".to_string(),
            seed: Some("test-seed-123".to_string()),
        };

        let id = db.save_test_result(record).expect("Failed to save record");
        assert!(!id.is_empty());

        let history = db
            .get_test_history(10, 0)
            .expect("Failed to fetch history");
        assert_eq!(history.len(), 1);
        assert_eq!(history[0].id.as_deref(), Some(id.as_str()));
        assert_eq!(history[0].net_wpm, 82.0);

        // Test Stats Summary
        let stats = db
            .get_stats_summary(None)
            .expect("Failed to get summary");
        assert_eq!(stats.total_tests, 1);
        assert_eq!(stats.best_wpm, 82.0);
        assert_eq!(stats.total_characters, 255);

        // Test Academy Lesson Progress
        let lesson = LessonProgressRecord {
            lesson_id: "ch1_les1".to_string(),
            chapter_id: 1,
            completed: true,
            mastered: false,
            best_wpm: 35.0,
            best_accuracy: 98.0,
            attempts: 1,
            last_attempt_at: 1700000001,
        };
        db.save_lesson_progress(lesson).expect("Failed to save lesson");
        let lessons = db.get_lesson_progress().expect("Failed to get lessons");
        assert_eq!(lessons.len(), 1);
        assert_eq!(lessons[0].lesson_id, "ch1_les1");
        assert!(lessons[0].completed);

        // Test Character Error Tracking & Weak Keys
        db.record_character_errors(vec![
            CharacterErrorRecord {
                character: "e".to_string(),
                mistyped_as: "w".to_string(),
                count: 3,
            },
            CharacterErrorRecord {
                character: "t".to_string(),
                mistyped_as: "r".to_string(),
                count: 1,
            },
        ])
        .expect("Failed to record errors");

        let weak_keys = db.get_weak_keys(5).expect("Failed to get weak keys");
        assert_eq!(weak_keys[0].character, "e");
        assert_eq!(weak_keys[0].total_errors, 3);

        // Test Daily Challenge Completion
        let challenge = ChallengeCompletionRecord {
            date: "2026-11-17".to_string(),
            challenge_id: "speed_sprint".to_string(),
            completed_at: 1700000010,
            wpm: 65.0,
            accuracy: 97.0,
        };
        db.save_challenge_completion(challenge).expect("Failed to save challenge");
        let challenges = db.get_challenge_completions("2026-11-17".to_string()).expect("Failed to query challenge");
        assert_eq!(challenges.len(), 1);
        assert_eq!(challenges[0].challenge_id, "speed_sprint");

        // Test Achievements
        let newly_unlocked = db.unlock_achievement("first_test".to_string(), 1700000015).expect("Unlock failed");
        assert!(newly_unlocked);
        let repeat_unlocked = db.unlock_achievement("first_test".to_string(), 1700000015).expect("Unlock failed");
        assert!(!repeat_unlocked); // idempotent: false on repeat

        let achievements = db.get_unlocked_achievements().expect("Get achievements failed");
        assert_eq!(achievements.len(), 1);
        assert_eq!(achievements[0].id, "first_test");

        // Clear history
        db.clear_history().expect("Failed to clear history");
        let empty_history = db
            .get_test_history(10, 0)
            .expect("Failed to fetch history after clear");
        assert_eq!(empty_history.len(), 0);
    }
}
