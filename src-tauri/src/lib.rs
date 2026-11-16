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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
