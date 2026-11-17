import React, { useEffect, useRef } from "react";
import { WordState } from "@/types/typing";
import { CornerDownLeft } from "lucide-react";

export interface WordDisplayProps {
  words: WordState[];
  currentWordIndex: number;
}

interface WordItemProps {
  word: WordState;
  isCurrent: boolean;
  domRef?: React.RefObject<HTMLSpanElement | null>;
}

const WordItem: React.FC<WordItemProps> = React.memo(({ word, isCurrent, domRef }) => {
  const currentPos = word.typed.length;

  return (
    <span
      ref={domRef as any}
      className={`inline-flex items-center text-xl md:text-2xl font-mono leading-relaxed tracking-wide select-none ${
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
          charColor = "text-red-700 dark:text-red-400 bg-red-500/10 rounded-xs";
        }

        return (
          <span key={idx} className="relative inline-block whitespace-pre">
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

      {/* Trailing newline indicator or space */}
      {word.hasNewline ? (
        <span className="inline-flex items-center ml-1 text-zinc-300 dark:text-zinc-700">
          <CornerDownLeft className="w-3.5 h-3.5" />
        </span>
      ) : (
        <span className="inline-block w-2.5" />
      )}
    </span>
  );
});

WordItem.displayName = "WordItem";

export const WordDisplay: React.FC<WordDisplayProps> = ({
  words,
  currentWordIndex,
}) => {
  const activeWordRef = useRef<HTMLSpanElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeWordRef.current && containerRef.current) {
      const container = containerRef.current;
      const word = activeWordRef.current;
      const containerRect = container.getBoundingClientRect();
      const wordRect = word.getBoundingClientRect();

      // If active word falls below visible 60% of container, scroll down smoothly
      if (wordRect.bottom > containerRect.bottom - 40) {
        container.scrollTop += wordRect.bottom - containerRect.bottom + 50;
      } else if (wordRect.top < containerRect.top + 20) {
        container.scrollTop = Math.max(0, container.scrollTop - 60);
      }
    }
  }, [currentWordIndex]);

  return (
    <div
      ref={containerRef}
      className="flex flex-wrap items-center content-start gap-y-3 w-full max-h-56 overflow-y-auto py-4 px-2 scroll-smooth"
    >
      {words.map((word, idx) => {
        const isCurrent = idx === currentWordIndex;
        return (
          <React.Fragment key={`${idx}_${word.target}`}>
            <WordItem
              word={word}
              isCurrent={isCurrent}
              domRef={isCurrent ? activeWordRef : undefined}
            />
            {word.hasNewline && <div className="basis-full h-0" />}
          </React.Fragment>
        );
      })}
    </div>
  );
};
