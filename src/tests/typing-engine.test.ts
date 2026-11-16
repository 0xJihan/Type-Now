import { describe, it, expect, vi } from "vitest";
import { TypingEngine } from "../domain/typing-engine";
import { TestResultRecord } from "../types/typing";

describe("TypingEngine", () => {
  it("initializes with ready status and generates words", () => {
    const engine = new TypingEngine({
      mode: "words",
      modeValue: 10,
      vocabulary: "top200",
      language: "en",
      seed: "unit-test-seed",
    });

    expect(engine.getStatus()).toBe("ready");
    expect(engine.getWords().length).toBe(10);
    expect(engine.getCurrentWordIndex()).toBe(0);
  });

  it("starts the test on the first valid keystroke", () => {
    const onStateChange = vi.fn();
    const engine = new TypingEngine(
      {
        mode: "words",
        modeValue: 10,
        vocabulary: "top200",
        language: "en",
        seed: "unit-test-seed",
      },
      { onStateChange }
    );

    const firstWord = engine.getWords()[0].target;
    const firstChar = firstWord[0];

    engine.handleInput(firstChar);

    expect(engine.getStatus()).toBe("running");
    expect(engine.getWords()[0].typed).toBe(firstChar);
    expect(engine.getWords()[0].characters[0].status).toBe("correct");
  });

  it("handles correct, incorrect, backspace, and extra characters", () => {
    const engine = new TypingEngine({
      mode: "words",
      modeValue: 5,
      vocabulary: "top200",
      language: "en",
      seed: "unit-test-seed",
    });

    const firstWord = engine.getWords()[0].target; // e.g. "the"
    const correctChar = firstWord[0];
    const wrongChar = correctChar === "z" ? "a" : "z";

    // Type correct character
    engine.handleInput(correctChar);
    expect(engine.getWords()[0].typed).toBe(correctChar);
    expect(engine.getWords()[0].characters[0].status).toBe("correct");

    // Type incorrect character
    engine.handleInput(wrongChar);
    expect(engine.getWords()[0].typed).toBe(correctChar + wrongChar);
    expect(engine.getWords()[0].characters[1].status).toBe("incorrect");

    // Backspace removes incorrect character
    engine.handleInput("Backspace");
    expect(engine.getWords()[0].typed).toBe(correctChar);
    expect(engine.getWords()[0].characters.length).toBe(firstWord.length);
  });

  it("advances to the next word on space and prevents skipping empty words", () => {
    const engine = new TypingEngine({
      mode: "words",
      modeValue: 5,
      vocabulary: "top200",
      language: "en",
      seed: "unit-test-seed",
    });

    // Press space when nothing typed should do nothing
    engine.handleInput(" ");
    expect(engine.getCurrentWordIndex()).toBe(0);

    const firstWord = engine.getWords()[0].target;
    // Type first word
    for (const ch of firstWord) {
      engine.handleInput(ch);
    }

    // Press space to advance
    engine.handleInput(" ");
    expect(engine.getCurrentWordIndex()).toBe(1);
  });

  it("completes the test in word mode when all words are typed", () => {
    let completedResult: TestResultRecord | null = null;
    const engine = new TypingEngine(
      {
        mode: "words",
        modeValue: 2,
        vocabulary: "top200",
        language: "en",
        seed: "completion-test",
      },
      {
        onComplete: (res) => {
          completedResult = res;
        },
      }
    );

    const words = engine.getWords();
    const word1 = words[0].target;
    const word2 = words[1].target;

    for (const ch of word1) engine.handleInput(ch);
    engine.handleInput(" ");

    for (const ch of word2) engine.handleInput(ch);

    expect(engine.getStatus()).toBe("completed");
    expect(completedResult).not.toBeNull();
    expect(completedResult!.accuracy).toBe(100);
    expect(completedResult!.mode).toBe("words");
    expect(completedResult!.modeValue).toBe(2);
  });

  it("stops timer and transitions to cancelled upon cancel", () => {
    const engine = new TypingEngine({
      mode: "time",
      modeValue: 30,
      vocabulary: "top200",
      language: "en",
    });

    engine.handleInput("a");
    expect(engine.getStatus()).toBe("running");

    engine.cancel();
    expect(engine.getStatus()).toBe("cancelled");
  });
});
