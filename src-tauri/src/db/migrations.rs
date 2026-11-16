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

    Ok(())
}
