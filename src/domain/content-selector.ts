import { CodeLanguage, ContentDifficulty, ContentItem } from "@/types/content";
import { PRNG } from "./prng";
import sentencesData from "../data/sentences.json";
import quotesData from "../data/quotes.json";
import codeSnippetsData from "../data/code-snippets.json";

export class ContentSelector {
  private sentences: ContentItem[];
  private quotes: ContentItem[];
  private codeSnippets: ContentItem[];

  constructor() {
    this.sentences = sentencesData as ContentItem[];
    this.quotes = quotesData as ContentItem[];
    this.codeSnippets = codeSnippetsData as ContentItem[];
  }

  public selectSentence(
    difficulty?: ContentDifficulty,
    recentIds: string[] = [],
    seed?: string | number
  ): ContentItem {
    return this.pickItem(this.sentences, difficulty, undefined, recentIds, seed);
  }

  public selectQuote(
    difficulty?: ContentDifficulty,
    recentIds: string[] = [],
    seed?: string | number
  ): ContentItem {
    return this.pickItem(this.quotes, difficulty, undefined, recentIds, seed);
  }

  public selectCode(
    codeLanguage?: CodeLanguage,
    difficulty?: ContentDifficulty,
    recentIds: string[] = [],
    seed?: string | number
  ): ContentItem {
    return this.pickItem(this.codeSnippets, difficulty, codeLanguage, recentIds, seed);
  }

  private pickItem(
    items: ContentItem[],
    difficulty?: ContentDifficulty,
    codeLanguage?: CodeLanguage,
    recentIds: string[] = [],
    seed?: string | number
  ): ContentItem {
    let pool = items;

    if (codeLanguage) {
      pool = pool.filter((item) => item.codeLanguage === codeLanguage);
    }

    if (difficulty) {
      const difficultyFiltered = pool.filter((item) => item.difficulty === difficulty);
      if (difficultyFiltered.length > 0) {
        pool = difficultyFiltered;
      }
    }

    // Exclude recently used IDs
    const unrecent = pool.filter((item) => !recentIds.includes(item.id));
    const finalPool = unrecent.length > 0 ? unrecent : pool;

    const prng = new PRNG(seed);
    const index = prng.nextInt(0, finalPool.length - 1);
    return finalPool[index];
  }

  public validateCustomText(rawText: string): {
    valid: boolean;
    error?: string;
    text: string;
    wordCount: number;
    charCount: number;
  } {
    const text = rawText.replace(/\r\n/g, "\n").trim();
    if (!text) {
      return {
        valid: false,
        error: "Custom text cannot be empty.",
        text: "",
        wordCount: 0,
        charCount: 0,
      };
    }

    if (text.length > 50000) {
      return {
        valid: false,
        error: "Custom text exceeds maximum allowed size (50,000 characters).",
        text: "",
        wordCount: 0,
        charCount: 0,
      };
    }

    const words = text.split(/\s+/).filter(Boolean);
    return {
      valid: true,
      text,
      wordCount: words.length,
      charCount: text.length,
    };
  }
}

export const contentSelector = new ContentSelector();
