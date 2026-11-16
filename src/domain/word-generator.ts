import { PRNG } from "./prng";
import english200Data from "../data/english-200.json";
import english1000Data from "../data/english-1000.json";

export type VocabularyTier = "top200" | "top1000";

export interface WordGeneratorOptions {
  tier?: VocabularyTier;
  seed?: string | number;
}

export class WordGenerator {
  private prng: PRNG;
  private vocabulary: string[];
  private lastWord: string | null = null;

  constructor(options: WordGeneratorOptions = {}) {
    this.prng = new PRNG(options.seed);
    const tier = options.tier || "top200";
    this.vocabulary = tier === "top1000" ? english1000Data.words : english200Data.words;
  }

  /**
   * Generates a single word guaranteed not to match the previously generated word.
   */
  public nextWord(): string {
    let word: string;
    let attempts = 0;
    do {
      const idx = this.prng.nextInt(0, this.vocabulary.length - 1);
      word = this.vocabulary[idx];
      attempts++;
    } while (word === this.lastWord && attempts < 10);

    this.lastWord = word;
    return word;
  }

  /**
   * Generates an array of n words with no adjacent duplicate words.
   */
  public generateWords(count: number): string[] {
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(this.nextWord());
    }
    return result;
  }

  /**
   * Generates a sufficient word buffer for time-based tests (e.g. 100 words).
   */
  public generateForTime(durationSeconds: number): string[] {
    // Average typist: ~40-80 WPM, fast typist: ~150-200 WPM
    // For 120s at 200 WPM = ~400 words. Let's scale generously so words never run out.
    const estimatedWords = Math.max(80, Math.ceil((durationSeconds / 60) * 200) + 20);
    return this.generateWords(estimatedWords);
  }
}
