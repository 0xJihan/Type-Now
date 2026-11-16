import { useEffect, useRef, useState, useTransition } from "react";
import { AppHeader } from "./components/shell/AppHeader";
import { QuickModeBar } from "./components/typing/QuickModeBar";
import { LiveMetricsBar } from "./components/typing/LiveMetricsBar";
import { TypingArea } from "./components/typing/TypingArea";
import { ResultsView } from "./components/results/ResultsView";
import { SettingsModal } from "./components/settings/SettingsModal";
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
  getPreferences,
  savePreferences,
  saveTestResult,
} from "./persistence/db-bridge";
import { BookOpen, BarChart3, Trophy, RotateCcw } from "lucide-react";
import { Button } from "./components/ui/Button";

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
    const engine = new TypingEngine(config, {
      onTick: (newMetrics, remainingOrElapsed) => {
        setMetrics(newMetrics);
        setTimeDisplay(remainingOrElapsed);
        setWords([...engine.getWords()]);
        setCurrentWordIndex(engine.getCurrentWordIndex());
      },
      onStateChange: (newStatus) => {
        setStatus(newStatus);
        setWords([...engine.getWords()]);
        setCurrentWordIndex(engine.getCurrentWordIndex());
      },
      onComplete: (result) => {
        setLatestResult(result);
        saveTestResult(result).catch(() => {});
      },
    });

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

  return (
    <div className="min-h-screen bg-(--bg-primary) text-(--text-primary) flex flex-col antialiased selection:bg-amber-500/20">
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-5xl w-full mx-auto">
        {activeTab === "home" && (
          <div className="w-full flex flex-col items-center gap-8">
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

                {/* Quick Restart Tooltip */}
                <div className="flex items-center gap-3 text-xs text-zinc-400 select-none">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRestart(false)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    Restart
                  </Button>
                  <span>•</span>
                  <span>
                    Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 font-mono text-[11px]">Esc</kbd> to restart
                  </span>
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

        {/* Informational Placeholders for Future Phases */}
        {activeTab === "learn" && (
          <div className="max-w-md text-center space-y-4 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
            <BookOpen className="w-10 h-10 text-amber-500 mx-auto" />
            <h2 className="text-lg font-semibold">Structured Lessons</h2>
            <p className="text-sm text-zinc-500">
              The typing tutor with finger placement diagrams, muscle memory exercises, and mastery levels is scheduled for Phase 3.
            </p>
          </div>
        )}

        {activeTab === "statistics" && (
          <div className="max-w-md text-center space-y-4 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
            <BarChart3 className="w-10 h-10 text-amber-500 mx-auto" />
            <h2 className="text-lg font-semibold">Analytics & Heatmaps</h2>
            <p className="text-sm text-zinc-500">
              In-depth performance analytics, speed curves, key-accuracy heatmaps, and historical charts are scheduled for Phase 4.
            </p>
          </div>
        )}

        {activeTab === "challenges" && (
          <div className="max-w-md text-center space-y-4 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
            <Trophy className="w-10 h-10 text-amber-500 mx-auto" />
            <h2 className="text-lg font-semibold">Challenges & Badges</h2>
            <p className="text-sm text-zinc-500">
              Custom sprint challenges, daily streaks, accuracy trials, and achievements are scheduled for Phase 5.
            </p>
          </div>
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
