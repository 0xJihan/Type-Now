export type ContentMode = "words" | "sentence" | "quote" | "code" | "custom";

export type ContentDifficulty = "beginner" | "intermediate" | "advanced";

export type CodeLanguage =
  | "html"
  | "css"
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "kotlin"
  | "rust";

export interface ContentItem {
  id: string;
  language: string; // "en"
  type: ContentMode;
  difficulty: ContentDifficulty;
  text: string;
  source: string;
  author?: string;
  license: string;
  tags?: string[];
  codeLanguage?: CodeLanguage;
  lineCount?: number;
}

export interface ContentQuery {
  mode: ContentMode;
  difficulty?: ContentDifficulty;
  codeLanguage?: CodeLanguage;
  vocabulary?: "top200" | "top1000" | "top5000" | "advanced";
  length?: number;
  seed?: string | number;
  recentIds?: string[];
}
