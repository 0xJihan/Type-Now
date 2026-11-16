pub mod migrations;
pub mod models;

use models::{TestResultRecord, UserPreferencesRecord};
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
        assert_eq!(default_prefs.default_mode, "time");

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
            timestamp: 1700000000,
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
        assert_eq!(history[0].seed.as_deref(), Some("test-seed-123"));

        // Clear history
        db.clear_history().expect("Failed to clear history");
        let empty_history = db
            .get_test_history(10, 0)
            .expect("Failed to fetch history after clear");
        assert_eq!(empty_history.len(), 0);
    }
}
