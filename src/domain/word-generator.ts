import { PRNG } from "./prng";
import english200Data from "../data/english-200.json";
import english1000Data from "../data/english-1000.json";
import english5000Data from "../data/english-5000.json";
import englishAdvData from "../data/english-advanced.json";

export type VocabularyTier = "top200" | "top1000" | "top5000" | "advanced";

export interface WordGeneratorOptions {
  tier?: VocabularyTier;
  seed?: string | number;
  includePunctuation?: boolean;
  includeNumbers?: boolean;
}

export class WordGenerator {
  private prng: PRNG;
  private vocabulary: string[];
  private lastWord: string | null = null;
  private includePunctuation: boolean;
  private includeNumbers: boolean;

  constructor(options: WordGeneratorOptions = {}) {
    this.prng = new PRNG(options.seed);
    this.includePunctuation = !!options.includePunctuation;
    this.includeNumbers = !!options.includeNumbers;

    const tier = options.tier || "top200";
    if (tier === "top1000") {
      this.vocabulary = english1000Data.words;
    } else if (tier === "top5000") {
      this.vocabulary = english5000Data.words;
    } else if (tier === "advanced") {
      this.vocabulary = englishAdvData.words;
    } else {
      this.vocabulary = english200Data.words;
    }
  }

  public nextWord(): string {
    // 10% chance of a number if enabled
    if (this.includeNumbers && this.prng.next() < 0.1) {
      return this.prng.nextInt(1, 9999).toString();
    }

    let word: string;
    let attempts = 0;
    do {
      const idx = this.prng.nextInt(0, this.vocabulary.length - 1);
      word = this.vocabulary[idx];
      attempts++;
    } while (word === this.lastWord && attempts < 10);

    this.lastWord = word;

    // Optional punctuation
    if (this.includePunctuation && this.prng.next() < 0.15) {
      const puncts = [".", ",", ";", "!", "?"];
      const p = puncts[this.prng.nextInt(0, puncts.length - 1)];
      word = word + p;
    }

    return word;
  }

  public generateWords(count: number): string[] {
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(this.nextWord());
    }
    return result;
  }

  public generateForTime(durationSeconds: number): string[] {
    const estimatedWords = Math.max(80, Math.ceil((durationSeconds / 60) * 200) + 20);
    return this.generateWords(estimatedWords);
  }
}
