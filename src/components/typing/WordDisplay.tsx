import React from "react";
import { WordState } from "@/types/typing";

export interface WordDisplayProps {
  words: WordState[];
  currentWordIndex: number;
}

interface WordItemProps {
  word: WordState;
  isCurrent: boolean;
}

const WordItem: React.FC<WordItemProps> = React.memo(({ word, isCurrent }) => {
  const currentPos = word.typed.length;

  return (
    <span
      className={`inline-flex items-center text-2xl md:text-3xl font-mono leading-relaxed tracking-wide select-none ${
        isCurrent ? "relative" : ""
      }`}
    >
      {word.characters.map((ch, idx) => {
        const isCaretHere = isCurrent && idx === currentPos;

        let charColor = "text-zinc-400 dark:text-zinc-600";
        if (ch.status === "correct") {
          charColor = "text-zinc-900 dark:text-zinc-100";
        } else if (ch.status === "incorrect") {
          charColor =
            "text-red-600 dark:text-red-500 underline decoration-red-500/80 decoration-2";
        } else if (ch.status === "extra") {
          charColor =
            "text-red-700 dark:text-red-400 bg-red-500/10 rounded-xs";
        }

        return (
          <span key={idx} className="relative inline-block">
            {isCaretHere && (
              <span className="absolute -left-0.5 top-1 bottom-1 w-0.5 bg-amber-500 dark:bg-amber-400 animate-caret pointer-events-none rounded-full" />
            )}
            <span className={charColor}>{ch.char}</span>
          </span>
        );
      })}

      {/* Caret at the end of word if user typed all characters or extra */}
      {isCurrent && currentPos >= word.characters.length && (
        <span className="relative inline-block w-0">
          <span className="absolute -left-0.5 top-1 bottom-1 w-0.5 bg-amber-500 dark:bg-amber-400 animate-caret pointer-events-none rounded-full" />
        </span>
      )}

      {/* Space separator */}
      <span className="inline-block w-2.5" />
    </span>
  );
});

WordItem.displayName = "WordItem";

export const WordDisplay: React.FC<WordDisplayProps> = ({
  words,
  currentWordIndex,
}) => {
  return (
    <div className="flex flex-wrap items-center content-start gap-y-3 w-full max-h-56 overflow-hidden py-4 px-2">
      {words.map((word, idx) => (
        <WordItem
          key={`${idx}_${word.target}`}
          word={word}
          isCurrent={idx === currentWordIndex}
        />
      ))}
    </div>
  );
};
