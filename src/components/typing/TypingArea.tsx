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

    // Restart shortcut: Escape
    if (e.key === "Escape") {
      e.preventDefault();
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
      className="relative w-full max-w-4xl mx-auto rounded-2xl p-6 bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/60 transition-all cursor-text min-h-[220px] flex items-center justify-center"
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
