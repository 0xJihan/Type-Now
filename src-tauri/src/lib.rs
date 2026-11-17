pub mod db;

use tauri::Manager;

#[tauri::command]
fn db_save_test_result(
    state: tauri::State<'_, db::Database>,
    record: db::models::TestResultRecord,
) -> Result<String, String> {
    state.save_test_result(record)
}

#[tauri::command]
fn db_get_test_history(
    state: tauri::State<'_, db::Database>,
    limit: Option<u32>,
    offset: Option<u32>,
) -> Result<Vec<db::models::TestResultRecord>, String> {
    state.get_test_history(limit.unwrap_or(50), offset.unwrap_or(0))
}

#[tauri::command]
fn db_get_preferences(
    state: tauri::State<'_, db::Database>,
) -> Result<db::models::UserPreferencesRecord, String> {
    state.get_preferences()
}

#[tauri::command]
fn db_save_preferences(
    state: tauri::State<'_, db::Database>,
    prefs: db::models::UserPreferencesRecord,
) -> Result<(), String> {
    state.save_preferences(&prefs)
}

#[tauri::command]
fn db_clear_history(state: tauri::State<'_, db::Database>) -> Result<(), String> {
    state.clear_history()
}

// Phase 5: Academy Progress
#[tauri::command]
fn db_save_lesson_progress(
    state: tauri::State<'_, db::Database>,
    progress: db::models::LessonProgressRecord,
) -> Result<(), String> {
    state.save_lesson_progress(progress)
}

#[tauri::command]
fn db_get_lesson_progress(
    state: tauri::State<'_, db::Database>,
) -> Result<Vec<db::models::LessonProgressRecord>, String> {
    state.get_lesson_progress()
}

// Phase 6: Character Error Analytics
#[tauri::command]
fn db_record_character_errors(
    state: tauri::State<'_, db::Database>,
    errors: Vec<db::models::CharacterErrorRecord>,
) -> Result<(), String> {
    state.record_character_errors(errors)
}

#[tauri::command]
fn db_get_weak_keys(
    state: tauri::State<'_, db::Database>,
    limit: Option<u32>,
) -> Result<Vec<db::models::WeakKeyRecord>, String> {
    state.get_weak_keys(limit.unwrap_or(10))
}

// Phase 6: Daily Challenges
#[tauri::command]
fn db_save_challenge_completion(
    state: tauri::State<'_, db::Database>,
    completion: db::models::ChallengeCompletionRecord,
) -> Result<(), String> {
    state.save_challenge_completion(completion)
}

#[tauri::command]
fn db_get_challenge_completions(
    state: tauri::State<'_, db::Database>,
    date: String,
) -> Result<Vec<db::models::ChallengeCompletionRecord>, String> {
    state.get_challenge_completions(date)
}

// Phase 6: Achievements
#[tauri::command]
fn db_unlock_achievement(
    state: tauri::State<'_, db::Database>,
    id: String,
    timestamp: i64,
) -> Result<bool, String> {
    state.unlock_achievement(id, timestamp)
}

#[tauri::command]
fn db_get_unlocked_achievements(
    state: tauri::State<'_, db::Database>,
) -> Result<Vec<db::models::UserAchievementRecord>, String> {
    state.get_unlocked_achievements()
}

// Phase 3: Recent Content History
#[tauri::command]
fn db_record_content_usage(
    state: tauri::State<'_, db::Database>,
    content_id: String,
    content_type: String,
) -> Result<(), String> {
    state.record_content_usage(content_id, content_type)
}

#[tauri::command]
fn db_get_recent_content(
    state: tauri::State<'_, db::Database>,
    content_type: String,
    limit: Option<u32>,
) -> Result<Vec<String>, String> {
    state.get_recent_content(content_type, limit.unwrap_or(20))
}

// Phase 6: Aggregated Statistics Summary
#[tauri::command]
fn db_get_stats_summary(
    state: tauri::State<'_, db::Database>,
    period: Option<String>,
) -> Result<db::models::StatsSummaryRecord, String> {
    state.get_stats_summary(period)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data directory");
            let db_path = app_data_dir.join("typenow.db");
            let database = db::Database::new(Some(db_path))
                .expect("Failed to initialize SQLite database");
            app.manage(database);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            db_save_test_result,
            db_get_test_history,
            db_get_preferences,
            db_save_preferences,
            db_clear_history,
            db_save_lesson_progress,
            db_get_lesson_progress,
            db_record_character_errors,
            db_get_weak_keys,
            db_save_challenge_completion,
            db_get_challenge_completions,
            db_unlock_achievement,
            db_get_unlocked_achievements,
            db_record_content_usage,
            db_get_recent_content,
            db_get_stats_summary,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
