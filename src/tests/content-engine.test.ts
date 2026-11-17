import { describe, it, expect } from "vitest";
import { ContentSelector } from "../domain/content-selector";
import { WordGenerator } from "../domain/word-generator";

describe("Phase 3: Content Engine", () => {
  const selector = new ContentSelector();

  it("selects valid sentences with difficulty filtering", () => {
    const beginnerSent = selector.selectSentence("beginner");
    expect(beginnerSent).toBeDefined();
    expect(beginnerSent.type).toBe("sentence");
    expect(beginnerSent.text.length).toBeGreaterThan(10);
    expect(beginnerSent.license).toBeDefined();

    const advancedSent = selector.selectSentence("advanced");
    expect(advancedSent.difficulty).toBe("advanced");
  });

  it("selects quotes with verified author and public domain / fair use licensing", () => {
    const quote = selector.selectQuote("intermediate");
    expect(quote).toBeDefined();
    expect(quote.type).toBe("quote");
    expect(quote.author).toBeDefined();
    expect(quote.source).toBeDefined();
  });

  it("selects programming code snippets across all 8 supported languages", () => {
    const languages = [
      "html",
      "css",
      "javascript",
      "typescript",
      "python",
      "java",
      "kotlin",
      "rust",
    ] as const;

    for (const lang of languages) {
      const codeItem = selector.selectCode(lang);
      expect(codeItem).toBeDefined();
      expect(codeItem.type).toBe("code");
      expect(codeItem.codeLanguage).toBe(lang);
      expect(codeItem.text.length).toBeGreaterThan(15);
    }
  });

  it("excludes recently used content IDs", () => {
    const first = selector.selectSentence(undefined, [], "seed-1");
    const second = selector.selectSentence(undefined, [first.id], "seed-1");

    expect(second.id).not.toBe(first.id);
  });

  it("validates custom text inputs properly", () => {
    // Valid text
    const validRes = selector.validateCustomText("  Hello world! This is a test.  ");
    expect(validRes.valid).toBe(true);
    expect(validRes.wordCount).toBe(6);
    expect(validRes.text).toBe("Hello world! This is a test.");

    // Empty text
    const emptyRes = selector.validateCustomText("   \n\t  ");
    expect(emptyRes.valid).toBe(false);
    expect(emptyRes.error).toBeDefined();

    // Oversized text
    const hugeText = "a".repeat(60000);
    const oversizedRes = selector.validateCustomText(hugeText);
    expect(oversizedRes.valid).toBe(false);
  });

  it("generates words across 5000 and advanced tiers", () => {
    const gen5000 = new WordGenerator({ tier: "top5000", seed: 42 });
    const words5000 = gen5000.generateWords(25);
    expect(words5000.length).toBe(25);

    const genAdv = new WordGenerator({ tier: "advanced", seed: 42 });
    const wordsAdv = genAdv.generateWords(20);
    expect(wordsAdv.length).toBe(20);
    expect(wordsAdv.some((w) => w.length > 7)).toBe(true);
  });
});
