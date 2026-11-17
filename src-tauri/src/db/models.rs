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
            sound_pack: "mx-brown".to_string(),
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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LessonProgressRecord {
    pub lesson_id: String,
    pub chapter_id: i64,
    pub completed: bool,
    pub mastered: bool,
    pub best_wpm: f64,
    pub best_accuracy: f64,
    pub attempts: i64,
    pub last_attempt_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CharacterErrorRecord {
    pub character: String,
    pub mistyped_as: String,
    pub count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WeakKeyRecord {
    pub character: String,
    pub total_errors: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChallengeCompletionRecord {
    pub date: String,
    pub challenge_id: String,
    pub completed_at: i64,
    pub wpm: f64,
    pub accuracy: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserAchievementRecord {
    pub id: String,
    pub unlocked_at: i64,
    pub progress: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StatsSummaryRecord {
    pub total_tests: i64,
    pub total_time_seconds: f64,
    pub avg_wpm: f64,
    pub best_wpm: f64,
    pub avg_accuracy: f64,
    pub best_accuracy: f64,
    pub total_characters: i64,
}
