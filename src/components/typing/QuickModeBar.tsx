import React from "react";
import { Clock, Type, BookOpen } from "lucide-react";
import { TestConfig, TestMode } from "@/types/typing";

export interface QuickModeBarProps {
  config: TestConfig;
  onChangeConfig: (newConfig: Partial<TestConfig>) => void;
  disabled?: boolean;
}

export const QuickModeBar: React.FC<QuickModeBarProps> = ({
  config,
  onChangeConfig,
  disabled = false,
}) => {
  const timeOptions = [15, 30, 60, 120];
  const wordOptions = [10, 25, 50, 100];

  const handleModeChange = (mode: TestMode) => {
    if (disabled) return;
    const modeValue = mode === "time" ? 30 : 25;
    onChangeConfig({ mode, modeValue });
  };

  const handleValueChange = (modeValue: number) => {
    if (disabled) return;
    onChangeConfig({ modeValue });
  };

  const handleVocabularyChange = (vocabulary: "top200" | "top1000") => {
    if (disabled) return;
    onChangeConfig({ vocabulary });
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-2 px-4 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 text-xs font-medium text-zinc-500 dark:text-zinc-400 select-none">
      {/* Mode Switcher */}
      <div className="flex items-center gap-1">
        <button
          disabled={disabled}
          onClick={() => handleModeChange("time")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
            config.mode === "time"
              ? "bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 font-semibold shadow-2xs"
              : "hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Time
        </button>
        <button
          disabled={disabled}
          onClick={() => handleModeChange("words")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
            config.mode === "words"
              ? "bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 font-semibold shadow-2xs"
              : "hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          Words
        </button>
      </div>

      <div className="w-px h-3.5 bg-zinc-300 dark:bg-zinc-700" />

      {/* Value Options */}
      <div className="flex items-center gap-1">
        {(config.mode === "time" ? timeOptions : wordOptions).map((val) => {
          const isSelected = config.modeValue === val;
          return (
            <button
              key={val}
              disabled={disabled}
              onClick={() => handleValueChange(val)}
              className={`px-2 py-1 rounded-md transition-colors ${
                isSelected
                  ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 font-semibold shadow-2xs"
                  : "hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              {val}
              {config.mode === "time" ? "s" : ""}
            </button>
          );
        })}
      </div>

      <div className="w-px h-3.5 bg-zinc-300 dark:bg-zinc-700" />

      {/* Vocabulary Tier */}
      <div className="flex items-center gap-1">
        <BookOpen className="w-3.5 h-3.5 opacity-60" />
        <button
          disabled={disabled}
          onClick={() => handleVocabularyChange("top200")}
          className={`px-2 py-1 rounded-md transition-colors ${
            config.vocabulary === "top200"
              ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 font-semibold shadow-2xs"
              : "hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          English 200
        </button>
        <button
          disabled={disabled}
          onClick={() => handleVocabularyChange("top1000")}
          className={`px-2 py-1 rounded-md transition-colors ${
            config.vocabulary === "top1000"
              ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 font-semibold shadow-2xs"
              : "hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          English 1000
        </button>
      </div>
    </div>
  );
};
