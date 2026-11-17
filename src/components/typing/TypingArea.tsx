import React, { useEffect, useRef, useState } from "react";
import { TypingEngine } from "@/domain/typing-engine";
import { WordState } from "@/types/typing";
import { WordDisplay } from "./WordDisplay";
import { FocusOverlay } from "./FocusOverlay";
import { soundManager } from "@/audio/sound-manager";

export interface TypingAreaProps {
  engine: TypingEngine;
  words: WordState[];
  currentWordIndex: number;
  onRestart: () => void;
  disabled?: boolean;
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  engine,
  words,
  currentWordIndex,
  onRestart,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(true);
  const isComposingRef = useRef(false);

  const focusInput = () => {
    if (disabled) return;
    inputRef.current?.focus();
    setIsFocused(true);
  };

  useEffect(() => {
    focusInput();
  }, [disabled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    // Prevent Tab from shifting focus during typing
    if (e.key === "Tab") {
      e.preventDefault();
      // Handle Tab as spaces or shortcut
      engine.handleInput(" ");
      return;
    }

    // Restart shortcuts: Cmd+R (macOS), Ctrl+R (Windows/Linux), or Escape
    const isRestartShortcut =
      ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "r") ||
      e.key === "Escape";

    if (isRestartShortcut) {
      e.preventDefault();
      e.stopPropagation();
      onRestart();
      return;
    }

    // Play sound immediately on keydown
    soundManager.playKey(e.key);

    // Forward to domain typing engine
    engine.handleInput(e.key, isComposingRef.current);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    // Intentional paste policy: block paste during tests
    e.preventDefault();
  };

  return (
    <div
      ref={containerRef}
      onClick={focusInput}
      className="relative w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto rounded-2xl lg:rounded-3xl p-6 md:p-8 lg:p-10 xl:p-12 bg-white dark:bg-zinc-900/40 border border-zinc-200/90 dark:border-zinc-800/80 shadow-xs dark:shadow-none transition-all cursor-text min-h-[220px] md:min-h-[260px] lg:min-h-[300px] xl:min-h-[360px] flex items-center justify-center"
    >
      {/* Hidden input to capture physical/virtual keystrokes and IME */}
      <input
        ref={inputRef}
        type="text"
        className="absolute opacity-0 pointer-events-none w-0 h-0"
        autoFocus
        tabIndex={0}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onCompositionEnd={() => {
          isComposingRef.current = false;
        }}
      />

      <WordDisplay words={words} currentWordIndex={currentWordIndex} />

      <FocusOverlay isFocused={isFocused} onFocus={focusInput} />
    </div>
  );
};
