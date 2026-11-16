import {
  CharacterState,
  TestConfig,
  TestMetrics,
  TestResultRecord,
  TestStatus,
  WordState,
} from "@/types/typing";
import { computeMetrics } from "./metrics";
import { WordGenerator } from "./word-generator";

export interface EngineCallbacks {
  onTick?: (metrics: TestMetrics, remainingOrElapsed: number) => void;
  onComplete?: (result: TestResultRecord) => void;
  onStateChange?: (status: TestStatus) => void;
}

export class TypingEngine {
  private config: TestConfig;
  private status: TestStatus = "idle";
  private words: WordState[] = [];
  private currentWordIndex = 0;
  private startTime: number | null = null;
  private endTime: number | null = null;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private callbacks: EngineCallbacks;

  // Running metrics counters
  private correctCharacters = 0;
  private incorrectCharacters = 0;
  private totalCharacters = 0;

  constructor(config: TestConfig, callbacks: EngineCallbacks = {}) {
    this.config = config;
    this.callbacks = callbacks;
    this.initializeTest();
  }

  public getConfig(): TestConfig {
    return { ...this.config };
  }

  public getStatus(): TestStatus {
    return this.status;
  }

  public getWords(): WordState[] {
    return this.words;
  }

  public getCurrentWordIndex(): number {
    return this.currentWordIndex;
  }

  public initializeTest(newConfig?: Partial<TestConfig>): void {
    this.stopTimer();

    if (newConfig) {
      this.config = { ...this.config, ...newConfig };
    }

    const generator = new WordGenerator({
      tier: this.config.vocabulary,
      seed: this.config.seed,
    });

    const rawWords =
      this.config.mode === "time"
        ? generator.generateForTime(this.config.modeValue)
        : generator.generateWords(this.config.modeValue);

    this.words = rawWords.map((w) => this.buildWordState(w, ""));
    this.currentWordIndex = 0;
    this.correctCharacters = 0;
    this.incorrectCharacters = 0;
    this.totalCharacters = 0;
    this.startTime = null;
    this.endTime = null;

    this.setStatus("ready");
  }

  private setStatus(status: TestStatus): void {
    this.status = status;
    this.callbacks.onStateChange?.(status);
  }

  private buildWordState(target: string, typed: string): WordState {
    const characters: CharacterState[] = [];
    const maxLen = Math.max(target.length, typed.length);

    for (let i = 0; i < maxLen; i++) {
      if (i < target.length && i < typed.length) {
        characters.push({
          char: target[i],
          status: typed[i] === target[i] ? "correct" : "incorrect",
        });
      } else if (i < target.length) {
        characters.push({
          char: target[i],
          status: "pending",
        });
      } else {
        // Extra characters typed beyond target length
        characters.push({
          char: typed[i],
          status: "extra",
        });
      }
    }

    return {
      target,
      typed,
      characters,
      isCompleted: false,
    };
  }

  private startTimer(): void {
    this.startTime = performance.now();
    this.setStatus("running");

    this.timerId = setInterval(() => {
      this.tick();
    }, 100);
  }

  private stopTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private tick(): void {
    if (this.status !== "running" || !this.startTime) return;

    const now = performance.now();
    const elapsedSeconds = (now - this.startTime) / 1000;

    if (this.config.mode === "time") {
      const remaining = Math.max(0, this.config.modeValue - elapsedSeconds);
      const metrics = computeMetrics(
        this.correctCharacters,
        this.incorrectCharacters,
        this.totalCharacters,
        elapsedSeconds
      );
      this.callbacks.onTick?.(metrics, remaining);

      if (remaining <= 0) {
        this.completeTest();
      }
    } else {
      const metrics = computeMetrics(
        this.correctCharacters,
        this.incorrectCharacters,
        this.totalCharacters,
        elapsedSeconds
      );
      this.callbacks.onTick?.(metrics, elapsedSeconds);
    }
  }

  public handleInput(key: string, isComposing = false): void {
    if (isComposing) return;

    // Filter out modifier / navigation keys
    if (
      [
        "Shift",
        "Control",
        "Alt",
        "Meta",
        "CapsLock",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "PageUp",
        "PageDown",
        "Escape",
        "Tab",
      ].includes(key)
    ) {
      return;
    }

    // Auto-start on first printable key if ready
    if (this.status === "ready") {
      this.startTimer();
    }

    if (this.status !== "running") return;

    const currentWord = this.words[this.currentWordIndex];
    if (!currentWord) return;

    if (key === "Backspace") {
      if (currentWord.typed.length > 0) {
        const lastIndex = currentWord.typed.length - 1;
        const lastChar = currentWord.typed[lastIndex];
        const targetChar = currentWord.target[lastIndex];

        if (lastIndex < currentWord.target.length) {
          if (lastChar === targetChar) {
            this.correctCharacters = Math.max(0, this.correctCharacters - 1);
          } else {
            this.incorrectCharacters = Math.max(0, this.incorrectCharacters - 1);
          }
        } else {
          // Reverting extra character
          this.incorrectCharacters = Math.max(0, this.incorrectCharacters - 1);
        }
        this.totalCharacters = Math.max(0, this.totalCharacters - 1);

        const newTyped = currentWord.typed.slice(0, -1);
        this.words[this.currentWordIndex] = this.buildWordState(
          currentWord.target,
          newTyped
        );
      }
      return;
    }

    if (key === " ") {
      // Prevent skipping if nothing typed
      if (currentWord.typed.length === 0) return;

      // Count space keystroke
      this.totalCharacters++;
      if (currentWord.typed === currentWord.target) {
        this.correctCharacters++;
      } else {
        this.incorrectCharacters++;
      }

      currentWord.isCompleted = true;
      this.currentWordIndex++;

      // In word mode, check for completion
      if (
        this.config.mode === "words" &&
        this.currentWordIndex >= this.words.length
      ) {
        this.completeTest();
      }
      return;
    }

    if (key.length === 1) {
      const pos = currentWord.typed.length;
      const targetChar = currentWord.target[pos];

      this.totalCharacters++;
      if (pos < currentWord.target.length) {
        if (key === targetChar) {
          this.correctCharacters++;
        } else {
          this.incorrectCharacters++;
        }
      } else {
        // Extra character typed
        this.incorrectCharacters++;
      }

      const newTyped = currentWord.typed + key;
      this.words[this.currentWordIndex] = this.buildWordState(
        currentWord.target,
        newTyped
      );

      // Auto-complete in word mode if last word is fully typed and correct
      if (
        this.config.mode === "words" &&
        this.currentWordIndex === this.words.length - 1 &&
        newTyped === currentWord.target
      ) {
        this.currentWordIndex++;
        this.completeTest();
      }
    }
  }

  public completeTest(): void {
    if (this.status === "completed") return;

    this.stopTimer();
    this.endTime = performance.now();
    this.setStatus("completed");

    const elapsedSeconds = this.startTime
      ? (this.endTime - this.startTime) / 1000
      : this.config.modeValue;

    const duration =
      this.config.mode === "time" ? this.config.modeValue : elapsedSeconds;

    const metrics = computeMetrics(
      this.correctCharacters,
      this.incorrectCharacters,
      this.totalCharacters,
      duration
    );

    const result: TestResultRecord = {
      timestamp: Date.now(),
      mode: this.config.mode,
      modeValue: this.config.modeValue,
      grossWpm: metrics.grossWpm,
      netWpm: metrics.netWpm,
      accuracy: metrics.accuracy,
      correctCharacters: this.correctCharacters,
      incorrectCharacters: this.incorrectCharacters,
      totalCharacters: this.totalCharacters,
      durationSeconds: Math.round(duration * 10) / 10,
      language: this.config.language,
      seed: this.config.seed,
    };

    this.callbacks.onComplete?.(result);
  }

  public cancel(): void {
    this.stopTimer();
    this.setStatus("cancelled");
  }

  public getMetrics(): TestMetrics {
    const elapsedSeconds = this.startTime
      ? ((this.endTime || performance.now()) - this.startTime) / 1000
      : 0;

    return computeMetrics(
      this.correctCharacters,
      this.incorrectCharacters,
      this.totalCharacters,
      elapsedSeconds
    );
  }
}
