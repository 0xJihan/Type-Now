import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
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
      className={`inline-flex items-center text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-[2.5rem] font-mono leading-relaxed lg:leading-[1.75] xl:leading-[1.85] tracking-normal lg:tracking-wide select-none ${
        isCurrent ? "relative" : ""
      }`}
    >
      {word.characters.map((ch, idx) => {
        const isCaretTarget = isCurrent && idx === currentPos;

        let charColor = "text-zinc-400 dark:text-zinc-600";
        if (ch.status === "correct") {
          charColor = "text-zinc-900 dark:text-zinc-50 font-medium";
        } else if (ch.status === "incorrect") {
          charColor =
            "text-rose-600 dark:text-rose-400 font-medium underline decoration-rose-500/80 decoration-2";
        } else if (ch.status === "extra") {
          charColor = "text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-500/20 rounded-xs";
        }

        return (
          <span
            key={idx}
            data-caret={isCaretTarget ? "true" : undefined}
            className="relative inline-block whitespace-pre"
          >
            <span className={`${charColor} transition-colors duration-75`}>
              {ch.char}
            </span>
          </span>
        );
      })}

      {/* Trailing position for caret when word is typed */}
      {isCurrent && currentPos >= word.characters.length && (
        <span
          data-caret="true"
          className="relative inline-block w-0"
        />
      )}

      {/* Trailing newline indicator or responsive word gap */}
      {word.hasNewline ? (
        <span className="inline-flex items-center ml-1 text-zinc-300 dark:text-zinc-700">
          <CornerDownLeft className="w-3.5 h-3.5 lg:w-4.5 lg:h-4.5" />
        </span>
      ) : (
        <span className="inline-block w-2.5 md:w-3.5 lg:w-4.5 xl:w-5" />
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
  const [caretPos, setCaretPos] = useState<{
    x: number;
    y: number;
    height: number;
    visible: boolean;
  }>({ x: 0, y: 0, height: 28, visible: false });

  const updateCaret = () => {
    if (!containerRef.current) return;
    const target = containerRef.current.querySelector('[data-caret="true"]') as HTMLElement | null;
    if (!target) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const x = targetRect.left - containerRect.left + containerRef.current.scrollLeft;
    const y = targetRect.top - containerRect.top + containerRef.current.scrollTop;
    const height = targetRect.height > 0 ? targetRect.height * 0.8 : 28;

    setCaretPos({
      x: Math.round(x),
      y: Math.round(y + (targetRect.height > 0 ? targetRect.height * 0.1 : 3)),
      height: Math.round(height),
      visible: true,
    });
  };

  useLayoutEffect(() => {
    updateCaret();
  }, [words, currentWordIndex]);

  useEffect(() => {
    const handleResize = () => updateCaret();
    window.addEventListener("resize", handleResize);

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", updateCaret);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (container) {
        container.removeEventListener("scroll", updateCaret);
      }
    };
  }, []);

  useEffect(() => {
    if (activeWordRef.current && containerRef.current) {
      const container = containerRef.current;
      const word = activeWordRef.current;
      const containerRect = container.getBoundingClientRect();
      const wordRect = word.getBoundingClientRect();

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
      className="relative flex flex-wrap items-center content-start gap-y-3 md:gap-y-4 lg:gap-y-5 xl:gap-y-6 w-full max-h-56 md:max-h-64 lg:max-h-80 xl:max-h-[420px] overflow-y-auto py-4 px-2 scroll-smooth"
    >
      {/* Floating smooth hardware-accelerated animated caret */}
      {caretPos.visible && (
        <div
          className="absolute w-[2.5px] lg:w-[3px] rounded-full bg-amber-500 dark:bg-amber-400 pointer-events-none transition-transform duration-75 ease-out animate-caret z-10"
          style={{
            transform: `translate3d(${caretPos.x}px, ${caretPos.y}px, 0)`,
            height: `${caretPos.height}px`,
          }}
        />
      )}

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
