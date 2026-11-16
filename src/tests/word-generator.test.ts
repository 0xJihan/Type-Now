import { describe, it, expect } from "vitest";
import { WordGenerator } from "../domain/word-generator";
import english200Data from "../data/english-200.json";
import english1000Data from "../data/english-1000.json";

describe("WordGenerator", () => {
  it("verifies English 200 and English 1000 datasets are valid and non-empty", () => {
    expect(english200Data.words.length).toBe(200);
    expect(english1000Data.words.length).toBe(1000);

    // All words should be lowercase ASCII alphabetic
    for (const word of english200Data.words) {
      expect(word).toMatch(/^[a-z]+$/);
    }
    for (const word of english1000Data.words) {
      expect(word).toMatch(/^[a-z]+$/);
    }
  });

  it("generates deterministic word sequences when given a seed", () => {
    const gen1 = new WordGenerator({ seed: "reproducible-seed-1", tier: "top200" });
    const gen2 = new WordGenerator({ seed: "reproducible-seed-1", tier: "top200" });

    const words1 = gen1.generateWords(30);
    const words2 = gen2.generateWords(30);

    expect(words1).toEqual(words2);
    expect(words1.length).toBe(30);
  });

  it("avoids immediate adjacent duplicate words", () => {
    const gen = new WordGenerator({ seed: 9999, tier: "top200" });
    const words = gen.generateWords(200);

    for (let i = 1; i < words.length; i++) {
      expect(words[i]).not.toBe(words[i - 1]);
    }
  });

  it("generates sufficient buffer for time-based tests", () => {
    const gen = new WordGenerator({ tier: "top200" });
    const words30s = gen.generateForTime(30);
    const words60s = gen.generateForTime(60);
    const words120s = gen.generateForTime(120);

    expect(words30s.length).toBeGreaterThanOrEqual(80);
    expect(words60s.length).toBeGreaterThanOrEqual(120);
    expect(words120s.length).toBeGreaterThanOrEqual(200);
  });
});
