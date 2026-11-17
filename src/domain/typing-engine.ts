import {
  CharacterState,
  TestConfig,
  TestMetrics,
  TestResultRecord,
  TestStatus,
  TestTimelinePoint,
  WordState,
} from "@/types/typing";
import { CharacterErrorRecord } from "@/types/stats";
import { computeMetrics } from "./metrics";
import { WordGenerator } from "./word-generator";
import { contentSelector } from "./content-selector";

export interface EngineCallbacks {
  onTick?: (metrics: TestMetrics, remainingOrElapsed: number) => void;
  onComplete?: (result: TestResultRecord, characterErrors: CharacterErrorRecord[]) => void;
  onStateChange?: (status: TestStatus, engine: TypingEngine) => void;
  onKeystroke?: (words: WordState[], currentWordIndex: number) => void;
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
  private characterErrors: CharacterErrorRecord[] = [];
  private timeline: TestTimelinePoint[] = [];
  private lastRecordedSecond = -1;

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

  public getCharacterErrors(): CharacterErrorRecord[] {
    return [...this.characterErrors];
  }

  public getTimeline(): TestTimelinePoint[] {
    return [...this.timeline];
  }

  public static parseTextIntoWords(text: string): WordState[] {
    const lines = text.split("\n");
    const result: WordState[] = [];

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      const tokens = line.split(" ");
      const isLastLine = lineIdx === lines.length - 1;

      for (let tokenIdx = 0; tokenIdx < tokens.length; tokenIdx++) {
        const token = tokens[tokenIdx];
        const isLastTokenInLine = tokenIdx === tokens.length - 1;
        const hasNewline = isLastTokenInLine && !isLastLine;

        result.push({
          target: token,
          typed: "",
          characters: token.split("").map((c) => ({ char: c, status: "pending" })),
          isCompleted: false,
          hasNewline,
          errorIndices: [],
        });
      }
    }

    return result.length > 0
      ? result
      : [{ target: "", typed: "", characters: [], isCompleted: false, errorIndices: [] }];
  }

  public initializeTest(newConfig?: Partial<TestConfig>): void {
    this.stopTimer();

    if (newConfig) {
      this.config = { ...this.config, ...newConfig };
    }

    if (this.config.mode === "time" || this.config.mode === "words") {
      const generator = new WordGenerator({
        tier: this.config.vocabulary,
        seed: this.config.seed,
      });

      const rawWords =
        this.config.mode === "time"
          ? generator.generateForTime(this.config.modeValue)
          : generator.generateWords(this.config.modeValue);

      this.words = rawWords.map((w) => this.buildWordState(w, "", false));
    } else if (this.config.mode === "sentence") {
      const item = contentSelector.selectSentence(
        this.config.difficulty,
        this.config.contentId ? [this.config.contentId] : [],
        this.config.seed
      );
      this.config.contentId = item.id;
      this.config.author = item.author;
      this.config.source = item.source;
      this.words = TypingEngine.parseTextIntoWords(item.text);
    } else if (this.config.mode === "quote") {
      const item = contentSelector.selectQuote(
        this.config.difficulty,
        this.config.contentId ? [this.config.contentId] : [],
        this.config.seed
      );
      this.config.contentId = item.id;
      this.config.author = item.author;
      this.config.source = item.source;
      this.words = TypingEngine.parseTextIntoWords(item.text);
    } else if (this.config.mode === "code") {
      const item = contentSelector.selectCode(
        this.config.codeLanguage as any,
        this.config.difficulty,
        this.config.contentId ? [this.config.contentId] : [],
        this.config.seed
      );
      this.config.contentId = item.id;
      this.config.source = item.source;
      this.words = TypingEngine.parseTextIntoWords(item.text);
    } else if (this.config.mode === "custom") {
      const custom = this.config.customText || "The quick brown fox jumps over the lazy dog.";
      this.words = TypingEngine.parseTextIntoWords(custom);
    }

    this.currentWordIndex = 0;
    this.correctCharacters = 0;
    this.incorrectCharacters = 0;
    this.totalCharacters = 0;
    this.characterErrors = [];
    this.timeline = [];
    this.lastRecordedSecond = -1;
    this.startTime = null;
    this.endTime = null;

    this.setStatus("ready");
  }

  private setStatus(status: TestStatus): void {
    this.status = status;
    this.callbacks.onStateChange?.(status, this);
  }

  private buildWordState(
    target: string,
    typed: string,
    hasNewline = false,
    errorIndices: number[] = []
  ): WordState {
    const characters: CharacterState[] = [];
    const maxLen = Math.max(target.length, typed.length);

    for (let i = 0; i < maxLen; i++) {
      if (i < target.length && i < typed.length) {
        if (typed[i] === target[i]) {
          const isCorrected = errorIndices.includes(i);
          characters.push({
            char: target[i],
            status: isCorrected ? "corrected" : "correct",
          });
        } else {
          characters.push({
            char: target[i],
            status: "incorrect",
          });
        }
      } else if (i < target.length) {
        characters.push({
          char: target[i],
          status: "pending",
        });
      } else {
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
      hasNewline,
      errorIndices,
    };
  }

  private startTimer(): void {
    this.startTime = performance.now();
    this.setStatus("running");
    this.timeline = [
      {
        second: 0,
        wpm: 0,
        rawWpm: 0,
        errors: 0,
      },
    ];
    this.lastRecordedSecond = 0;

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
    const currentSecond = Math.floor(elapsedSeconds);

    const metrics = computeMetrics(
      this.correctCharacters,
      this.incorrectCharacters,
      this.totalCharacters,
      elapsedSeconds
    );

    if (currentSecond > this.lastRecordedSecond && currentSecond > 0) {
      this.timeline.push({
        second: currentSecond,
        wpm: metrics.netWpm,
        rawWpm: metrics.grossWpm,
        errors: this.incorrectCharacters,
      });
      this.lastRecordedSecond = currentSecond;
    }

    if (this.config.mode === "time") {
      const remaining = Math.max(0, this.config.modeValue - elapsedSeconds);
      this.callbacks.onTick?.(metrics, remaining);

      if (remaining <= 0) {
        this.completeTest();
      }
    } else {
      this.callbacks.onTick?.(metrics, elapsedSeconds);
    }
  }

  public handleInput(key: string, isComposing = false): void {
    if (isComposing) return;

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
            if (this.characterErrors.length > 0) {
              const lastErr = this.characterErrors[this.characterErrors.length - 1];
              if (lastErr.character === targetChar && lastErr.mistyped_as === lastChar) {
                this.characterErrors.pop();
              }
            }
          }
        } else {
          this.incorrectCharacters = Math.max(0, this.incorrectCharacters - 1);
        }
        this.totalCharacters = Math.max(0, this.totalCharacters - 1);

        const newTyped = currentWord.typed.slice(0, -1);
        this.words[this.currentWordIndex] = this.buildWordState(
          currentWord.target,
          newTyped,
          currentWord.hasNewline,
          currentWord.errorIndices || []
        );
      } else if (this.currentWordIndex > 0) {
        const prevIndex = this.currentWordIndex - 1;
        const prevWord = this.words[prevIndex];
        if (prevWord) {
          this.totalCharacters = Math.max(0, this.totalCharacters - 1);
          if (prevWord.typed === prevWord.target) {
            this.correctCharacters = Math.max(0, this.correctCharacters - 1);
          } else {
            this.incorrectCharacters = Math.max(0, this.incorrectCharacters - 1);
          }

          prevWord.isCompleted = false;
          this.currentWordIndex = prevIndex;
        }
      }
      this.callbacks.onKeystroke?.(this.words, this.currentWordIndex);
      return;
    }

    // Advance word on Space or Enter (when word has newline)
    if (key === " " || (key === "Enter" && currentWord.hasNewline)) {
      if (currentWord.typed.length === 0 && currentWord.target.length > 0) return;

      this.totalCharacters++;
      if (currentWord.typed === currentWord.target) {
        this.correctCharacters++;
      } else {
        this.incorrectCharacters++;
      }

      currentWord.isCompleted = true;
      this.currentWordIndex++;

      this.callbacks.onKeystroke?.(this.words, this.currentWordIndex);

      // Non-time modes complete when all words are typed
      if (
        this.config.mode !== "time" &&
        this.currentWordIndex >= this.words.length
      ) {
        this.completeTest();
      }
      return;
    }

    if (key.length === 1) {
      const pos = currentWord.typed.length;
      const targetChar = currentWord.target[pos];
      const currentErrors = currentWord.errorIndices ? [...currentWord.errorIndices] : [];

      this.totalCharacters++;
      if (pos < currentWord.target.length) {
        if (key === targetChar) {
          this.correctCharacters++;
        } else {
          this.incorrectCharacters++;
          if (!currentErrors.includes(pos)) {
            currentErrors.push(pos);
          }
          // Record character error for weak keys analytics
          this.characterErrors.push({
            character: targetChar,
            mistyped_as: key,
            count: 1,
          });
        }
      } else {
        this.incorrectCharacters++;
      }

      const newTyped = currentWord.typed + key;
      this.words[this.currentWordIndex] = this.buildWordState(
        currentWord.target,
        newTyped,
        currentWord.hasNewline,
        currentErrors
      );

      this.callbacks.onKeystroke?.(this.words, this.currentWordIndex);

      // Auto-complete in non-time modes if last word is typed and matches
      if (
        this.config.mode !== "time" &&
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

    const roundedDuration = Math.round(duration * 10) / 10;
    const finalSecond = Math.max(1, Math.round(duration));

    if (
      this.timeline.length === 0 ||
      this.timeline[this.timeline.length - 1].second < finalSecond
    ) {
      this.timeline.push({
        second: finalSecond,
        wpm: metrics.netWpm,
        rawWpm: metrics.grossWpm,
        errors: this.incorrectCharacters,
      });
    }

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
      durationSeconds: roundedDuration,
      language: this.config.language,
      seed: this.config.seed,
      timeline: [...this.timeline],
    };

    this.callbacks.onComplete?.(result, this.characterErrors);
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
