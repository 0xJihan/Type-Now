use rusqlite::{Connection, Result};

pub fn run_migrations(conn: &mut Connection) -> Result<()> {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version INTEGER PRIMARY KEY,
            applied_at INTEGER NOT NULL
        );
        ",
    )?;

    let mut current_version: i64 = 0;
    {
        let mut stmt = conn.prepare("SELECT COALESCE(MAX(version), 0) FROM schema_migrations")?;
        let mut rows = stmt.query([])?;
        if let Some(row) = rows.next()? {
            current_version = row.get(0)?;
        }
    }

    if current_version < 1 {
        conn.execute_batch(
            "
            BEGIN TRANSACTION;

            CREATE TABLE IF NOT EXISTS test_results (
                id TEXT PRIMARY KEY,
                timestamp INTEGER NOT NULL,
                mode TEXT NOT NULL,
                mode_value INTEGER NOT NULL,
                gross_wpm REAL NOT NULL,
                net_wpm REAL NOT NULL,
                accuracy REAL NOT NULL,
                correct_characters INTEGER NOT NULL,
                incorrect_characters INTEGER NOT NULL,
                total_characters INTEGER NOT NULL,
                duration_seconds REAL NOT NULL,
                language TEXT NOT NULL,
                seed TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_test_results_timestamp ON test_results (timestamp DESC);

            CREATE TABLE IF NOT EXISTS user_preferences (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            INSERT INTO schema_migrations (version, applied_at)
            VALUES (1, CAST(strftime('%s', 'now') AS INTEGER));

            COMMIT;
            ",
        )?;
    }

    if current_version < 2 {
        conn.execute_batch(
            "
            BEGIN TRANSACTION;

            CREATE TABLE IF NOT EXISTS lesson_progress (
                lesson_id TEXT PRIMARY KEY,
                chapter_id INTEGER NOT NULL,
                completed INTEGER NOT NULL DEFAULT 0,
                mastered INTEGER NOT NULL DEFAULT 0,
                best_wpm REAL NOT NULL DEFAULT 0.0,
                best_accuracy REAL NOT NULL DEFAULT 0.0,
                attempts INTEGER NOT NULL DEFAULT 0,
                last_attempt_at INTEGER NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_lesson_progress_chapter ON lesson_progress(chapter_id);

            CREATE TABLE IF NOT EXISTS character_errors (
                character TEXT NOT NULL,
                mistyped_as TEXT NOT NULL,
                count INTEGER NOT NULL DEFAULT 1,
                PRIMARY KEY (character, mistyped_as)
            );

            CREATE INDEX IF NOT EXISTS idx_character_errors_char ON character_errors(character);

            CREATE TABLE IF NOT EXISTS daily_challenge_completions (
                date TEXT NOT NULL,
                challenge_id TEXT NOT NULL,
                completed_at INTEGER NOT NULL,
                wpm REAL NOT NULL,
                accuracy REAL NOT NULL,
                PRIMARY KEY (date, challenge_id)
            );

            CREATE TABLE IF NOT EXISTS user_achievements (
                id TEXT PRIMARY KEY,
                unlocked_at INTEGER NOT NULL,
                progress REAL NOT NULL DEFAULT 1.0
            );

            CREATE TABLE IF NOT EXISTS recent_content_history (
                content_id TEXT PRIMARY KEY,
                content_type TEXT NOT NULL,
                used_at INTEGER NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_recent_content_used ON recent_content_history(used_at DESC);

            INSERT INTO schema_migrations (version, applied_at)
            VALUES (2, CAST(strftime('%s', 'now') AS INTEGER));

            COMMIT;
            ",
        )?;
    }

    Ok(())
}
