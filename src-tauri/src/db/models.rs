use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestResultRecord {
    pub id: Option<String>,
    pub timestamp: i64,
    pub mode: String,
    pub mode_value: i64,
    pub gross_wpm: f64,
    pub net_wpm: f64,
    pub accuracy: f64,
    pub correct_characters: i64,
    pub incorrect_characters: i64,
    pub total_characters: i64,
    pub duration_seconds: f64,
    pub language: String,
    pub seed: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserPreferencesRecord {
    pub theme: String,
    pub sound_pack: String,
    pub sound_volume: f64,
    pub sound_enabled: bool,
    pub default_mode: String,
    pub default_time: i64,
    pub default_words: i64,
    pub vocabulary: String,
    pub quick_restart: bool,
}

impl Default for UserPreferencesRecord {
    fn default() -> Self {
        Self {
            theme: "dark".to_string(),
            sound_pack: "gateron-red".to_string(),
            sound_volume: 0.7,
            sound_enabled: true,
            default_mode: "time".to_string(),
            default_time: 30,
            default_words: 25,
            vocabulary: "top200".to_string(),
            quick_restart: true,
        }
    }
}
