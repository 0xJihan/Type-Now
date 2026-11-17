import { useEffect, useRef, useState, useTransition } from "react";
import { AppHeader } from "./components/shell/AppHeader";
import { QuickModeBar } from "./components/typing/QuickModeBar";
import { LiveMetricsBar } from "./components/typing/LiveMetricsBar";
import { TypingArea } from "./components/typing/TypingArea";
import { ResultsView } from "./components/results/ResultsView";
import { SettingsModal } from "./components/settings/SettingsModal";
import { AcademyView } from "./components/academy/AcademyView";
import { StatsDashboard } from "./components/stats/StatsDashboard";
import { ChallengesView } from "./components/challenges/ChallengesView";
import { TypingEngine } from "./domain/typing-engine";
import { soundManager } from "./audio/sound-manager";
import {
  TestConfig,
  TestMetrics,
  TestResultRecord,
  TestStatus,
  WordState,
} from "./types/typing";
import { DEFAULT_PREFERENCES, UserPreferences } from "./types/preferences";
import {
  clearTestHistory,
  getLessonProgress,
  getPreferences,
  getTestHistory,
  recordCharacterErrors,
  recordContentUsage,
  saveChallengeCompletion,
  savePreferences,
  saveTestResult,
} from "./persistence/db-bridge";
import { ChallengeEngine, getTodayDateString } from "./domain/challenge-engine";
import { AchievementEngine, ACHIEVEMENTS } from "./domain/achievement-engine";
import { DailyChallenge } from "./types/challenges";
import { RotateCcw, Trophy, X } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [, startTransition] = useTransition();

  // Test configuration
  const [config, setConfig] = useState<TestConfig>({
    mode: "time",
    modeValue: 30,
    vocabulary: "top200",
    language: "en",
  });

  // Typing engine & state
  const engineRef = useRef<TypingEngine | null>(null);
  const [words, setWords] = useState<WordState[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [status, setStatus] = useState<TestStatus>("idle");
  const [timeDisplay, setTimeDisplay] = useState(30);
  const [metrics, setMetrics] = useState<TestMetrics>({
    grossWpm: 0,
    netWpm: 0,
    accuracy: 100,
    correctCharacters: 0,
    incorrectCharacters: 0,
    totalCharacters: 0,
    elapsedSeconds: 0,
  });
  const [latestResult, setLatestResult] = useState<TestResultRecord | null>(
    null
  );

  // Achievement unlock notifications
  const [unlockedNotification, setUnlockedNotification] = useState<string | null>(null);

  const isMac =
    typeof navigator !== "undefined" &&
    (/Mac|iPod|iPhone|iPad/.test(navigator.platform) ||
      /Mac/.test(navigator.userAgent));

  // Global platform restart shortcut (Cmd+R on macOS, Ctrl+R on Windows/Linux)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "r") {
        e.preventDefault();
        handleRestart(false);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Apply theme class to document
  const applyTheme = (theme: "dark" | "light" | "system") => {
    const root = document.documentElement;
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  // Load preferences from SQLite on startup
  useEffect(() => {
    getPreferences().then((loadedPrefs) => {
      setPreferences(loadedPrefs);
      applyTheme(loadedPrefs.theme);
      soundManager.updateSettings({
        enabled: loadedPrefs.soundEnabled,
        volume: loadedPrefs.soundVolume,
        packId: loadedPrefs.soundPack,
        playKeyRelease: loadedPrefs.playKeyRelease ?? true,
      });
      setConfig((prev) => ({
        ...prev,
        mode: loadedPrefs.defaultMode,
        modeValue:
          loadedPrefs.defaultMode === "time"
            ? loadedPrefs.defaultTime
            : loadedPrefs.defaultWords,
        vocabulary: loadedPrefs.vocabulary,
      }));
    });
  }, []);

  // Initialize typing engine
  useEffect(() => {
    let currentEngine: TypingEngine | null = null;

    const engine = new TypingEngine(config, {
      onTick: (newMetrics, remainingOrElapsed) => {
        setMetrics(newMetrics);
        setTimeDisplay(remainingOrElapsed);
        const eng = currentEngine || engineRef.current;
        if (eng) {
          setWords([...eng.getWords()]);
          setCurrentWordIndex(eng.getCurrentWordIndex());
        }
      },
      onStateChange: (newStatus, eng) => {
        setStatus(newStatus);
        const target = eng || currentEngine || engineRef.current;
        if (target) {
          setWords([...target.getWords()]);
          setCurrentWordIndex(target.getCurrentWordIndex());
        }
      },
      onKeystroke: (updatedWords, idx) => {
        setWords([...updatedWords]);
        setCurrentWordIndex(idx);
      },
      onComplete: async (result, characterErrors) => {
        setLatestResult(result);

        // 1. Persist result
        await saveTestResult(result).catch(() => {});

        // 2. Persist content usage
        if (config.contentId) {
          await recordContentUsage(config.contentId, config.mode).catch(() => {});
        }

        // 3. Record character errors for analytics
        if (characterErrors && characterErrors.length > 0) {
          await recordCharacterErrors(characterErrors).catch(() => {});
        }

        // 4. Validate daily challenges
        const todayStr = getTodayDateString();
        const dailyChallenges = ChallengeEngine.getDailyChallenges(todayStr);
        let completedAnyChallenge = false;
        for (const ch of dailyChallenges) {
          if (ChallengeEngine.isQualified(ch, result)) {
            await saveChallengeCompletion({
              date: todayStr,
              challenge_id: ch.id,
              completed_at: Date.now(),
              wpm: result.netWpm,
              accuracy: result.accuracy,
            }).catch(() => {});
            completedAnyChallenge = true;
          }
        }

        // 5. Evaluate achievements
        const history = await getTestHistory(100, 0);
        const lessons = await getLessonProgress();
        const newlyUnlocked = await AchievementEngine.evaluate(
          history,
          lessons,
          completedAnyChallenge ? 1 : 0
        );

        if (newlyUnlocked.length > 0) {
          const ach = ACHIEVEMENTS.find((a) => a.id === newlyUnlocked[0]);
          if (ach) {
            setUnlockedNotification(ach.title);
            setTimeout(() => setUnlockedNotification(null), 5000);
          }
        }
      },
    });

    currentEngine = engine;
    engineRef.current = engine;
    setWords(engine.getWords());
    setCurrentWordIndex(0);
    setStatus(engine.getStatus());
    setTimeDisplay(config.mode === "time" ? config.modeValue : 0);

    return () => {
      engine.cancel();
    };
  }, [config]);

  // Restart / Reset
  const handleRestart = (newSeed = false) => {
    if (!engineRef.current) return;
    setLatestResult(null);
    const newConfig: Partial<TestConfig> = newSeed
      ? { seed: undefined }
      : { seed: config.seed };
    engineRef.current.initializeTest(newConfig);
    setWords([...engineRef.current.getWords()]);
    setCurrentWordIndex(0);
    setStatus(engineRef.current.getStatus());
    setTimeDisplay(config.mode === "time" ? config.modeValue : 0);
    setMetrics({
      grossWpm: 0,
      netWpm: 0,
      accuracy: 100,
      correctCharacters: 0,
      incorrectCharacters: 0,
      totalCharacters: 0,
      elapsedSeconds: 0,
    });
  };

  const handleUpdatePreferences = (newPrefs: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    if (newPrefs.theme) {
      applyTheme(newPrefs.theme);
    }
    savePreferences(updated).catch(() => {});
  };

  const handleToggleTheme = () => {
    const nextTheme = preferences.theme === "dark" ? "light" : "dark";
    handleUpdatePreferences({ theme: nextTheme });
  };

  const handleToggleSound = () => {
    const nextEnabled = !preferences.soundEnabled;
    handleUpdatePreferences({ soundEnabled: nextEnabled });
    soundManager.updateSettings({ enabled: nextEnabled });
  };

  const handleStartChallenge = (challenge: DailyChallenge) => {
    setActiveTab("home");
    setLatestResult(null);
    startTransition(() => {
      setConfig({
        mode: challenge.mode,
        modeValue: challenge.modeValue,
        vocabulary: "top200",
        language: "en",
        difficulty: "intermediate",
      });
    });
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col antialiased selection:bg-accent-soft selection:text-text-primary">
      {/* Shell Header */}
      <AppHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        theme={preferences.theme}
        onToggleTheme={handleToggleTheme}
        soundEnabled={preferences.soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Achievement Banner Notification */}
      {unlockedNotification && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-3 p-3.5 rounded-xl bg-accent text-accent-foreground shadow-lg border border-accent-hover font-medium text-xs select-none animate-in slide-in-from-top-2 duration-300">
          <Trophy className="w-4 h-4 shrink-0" />
          <span>
            Achievement Unlocked: <strong>{unlockedNotification}</strong>
          </span>
          <button
            onClick={() => setUnlockedNotification(null)}
            className="p-1 hover:opacity-75 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 lg:px-12 py-6 lg:py-10 max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-8xl w-full mx-auto">
        {activeTab === "home" && (
          <div className="w-full flex flex-col items-center gap-6 md:gap-8 lg:gap-10 xl:gap-12">
            {status !== "completed" ? (
              <>
                {/* Mode Selector */}
                <QuickModeBar
                  config={config}
                  disabled={status === "running"}
                  onChangeConfig={(newCfg) => {
                    startTransition(() => {
                      setConfig((prev) => ({ ...prev, ...newCfg }));
                    });
                  }}
                />

                {/* Live Metrics */}
                <LiveMetricsBar
                  metrics={metrics}
                  mode={config.mode}
                  modeValue={config.modeValue}
                  timeDisplay={timeDisplay}
                  status={status}
                />

                {/* Main Typing Area */}
                {engineRef.current && (
                  <TypingArea
                    engine={engineRef.current}
                    words={words}
                    currentWordIndex={currentWordIndex}
                    onRestart={() => handleRestart(false)}
                  />
                )}

                {/* Quick Restart Bar with Platform-Aware Shortcut */}
                <div className="flex items-center justify-between w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl px-2 text-xs text-text-secondary select-none">
                  <button
                    onClick={() => handleRestart(false)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface hover:bg-surface-secondary text-text-primary border border-border font-medium transition-all shadow-2xs cursor-pointer active:scale-98"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-accent" />
                    <span>Restart Test</span>
                    <span className="flex items-center gap-0.5 ml-1 px-1.5 py-0.5 rounded bg-surface-secondary border border-border-strong font-mono text-[10px] text-text-secondary font-semibold">
                      {isMac ? "⌘R" : "Ctrl+R"}
                    </span>
                  </button>

                  <div className="flex items-center gap-2 text-text-secondary text-xs">
                    <span>or press</span>
                    <kbd className="px-2 py-0.5 rounded-md bg-surface border border-border font-mono text-[11px] text-text-secondary shadow-2xs">
                      Esc
                    </kbd>
                  </div>
                </div>
              </>
            ) : (
              latestResult && (
                <ResultsView
                  result={latestResult}
                  onRetry={() => handleRestart(false)}
                  onNewTest={() => handleRestart(true)}
                />
              )
            )}
          </div>
        )}

        {/* Phase 5: Typing Academy */}
        {activeTab === "learn" && <AcademyView />}

        {/* Phase 6: Statistics Dashboard */}
        {activeTab === "statistics" && <StatsDashboard />}

        {/* Phase 6: Challenges & Achievements */}
        {activeTab === "challenges" && (
          <ChallengesView onStartChallenge={handleStartChallenge} />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        onClearHistory={clearTestHistory}
      />
    </div>
  );
}
