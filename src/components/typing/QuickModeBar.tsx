import React, { useState } from "react";
import { Clock, Type, AlignLeft, Quote, Code2, FileEdit } from "lucide-react";
import { TestConfig, TestMode } from "@/types/typing";
import { CodeLanguage, ContentDifficulty } from "@/types/content";
import { CustomTextModal } from "./CustomTextModal";

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
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const timeOptions = [15, 30, 60, 120];
  const wordOptions = [10, 25, 50, 100];
  const codeLanguages: { id: CodeLanguage; label: string }[] = [
    { id: "html", label: "HTML" },
    { id: "css", label: "CSS" },
    { id: "javascript", label: "JS" },
    { id: "typescript", label: "TS" },
    { id: "python", label: "Python" },
    { id: "java", label: "Java" },
    { id: "kotlin", label: "Kotlin" },
    { id: "rust", label: "Rust" },
  ];

  const handleModeChange = (mode: TestMode) => {
    if (disabled) return;
    if (mode === "custom") {
      setIsCustomModalOpen(true);
      return;
    }
    const modeValue = mode === "time" ? 30 : 25;
    onChangeConfig({ mode, modeValue });
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-4 py-2 px-4 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 text-xs font-medium text-zinc-500 dark:text-zinc-400 select-none">
        {/* Mode Selector */}
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

          <button
            disabled={disabled}
            onClick={() => handleModeChange("sentence")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              config.mode === "sentence"
                ? "bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 font-semibold shadow-2xs"
                : "hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            Sentences
          </button>

          <button
            disabled={disabled}
            onClick={() => handleModeChange("quote")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              config.mode === "quote"
                ? "bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 font-semibold shadow-2xs"
                : "hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Quote className="w-3.5 h-3.5" />
            Quotes
          </button>

          <button
            disabled={disabled}
            onClick={() => handleModeChange("code")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              config.mode === "code"
                ? "bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 font-semibold shadow-2xs"
                : "hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Code
          </button>

          <button
            disabled={disabled}
            onClick={() => setIsCustomModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              config.mode === "custom"
                ? "bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 font-semibold shadow-2xs"
                : "hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            Custom
          </button>
        </div>

        <div className="w-px h-3.5 bg-zinc-300 dark:bg-zinc-700" />

        {/* Sub-selectors depending on active mode */}
        {config.mode === "time" && (
          <div className="flex items-center gap-1">
            {timeOptions.map((val) => (
              <button
                key={val}
                disabled={disabled}
                onClick={() => onChangeConfig({ modeValue: val })}
                className={`px-2 py-1 rounded-md transition-colors ${
                  config.modeValue === val
                    ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 font-semibold shadow-2xs"
                    : "hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                {val}s
              </button>
            ))}
          </div>
        )}

        {config.mode === "words" && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {wordOptions.map((val) => (
                <button
                  key={val}
                  disabled={disabled}
                  onClick={() => onChangeConfig({ modeValue: val })}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    config.modeValue === val
                      ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 font-semibold shadow-2xs"
                      : "hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>

            <div className="w-px h-3 bg-zinc-300 dark:bg-zinc-700" />

            <div className="flex items-center gap-1">
              {(["top200", "top1000", "top5000", "advanced"] as const).map((t) => (
                <button
                  key={t}
                  disabled={disabled}
                  onClick={() => onChangeConfig({ vocabulary: t })}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    config.vocabulary === t
                      ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 font-semibold shadow-2xs"
                      : "hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  {t === "top200"
                    ? "200"
                    : t === "top1000"
                    ? "1000"
                    : t === "top5000"
                    ? "5000"
                    : "Advanced"}
                </button>
              ))}
            </div>
          </div>
        )}

        {(config.mode === "sentence" || config.mode === "quote") && (
          <div className="flex items-center gap-1">
            {(["beginner", "intermediate", "advanced"] as ContentDifficulty[]).map((d) => (
              <button
                key={d}
                disabled={disabled}
                onClick={() => onChangeConfig({ difficulty: d })}
                className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                  config.difficulty === d
                    ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 font-semibold shadow-2xs"
                    : "hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {config.mode === "code" && (
          <div className="flex items-center gap-1 max-w-md overflow-x-auto">
            {codeLanguages.map((l) => (
              <button
                key={l.id}
                disabled={disabled}
                onClick={() => onChangeConfig({ codeLanguage: l.id })}
                className={`px-2 py-1 rounded-md transition-colors ${
                  config.codeLanguage === l.id || (!config.codeLanguage && l.id === "typescript")
                    ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 font-semibold shadow-2xs"
                    : "hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}

        {config.mode === "custom" && (
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Custom passage</span>
            <button
              onClick={() => setIsCustomModalOpen(true)}
              className="text-amber-600 dark:text-amber-400 underline font-medium hover:opacity-80"
            >
              Edit Text
            </button>
          </div>
        )}
      </div>

      <CustomTextModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        initialText={config.customText}
        onApplyCustomText={(text) => {
          onChangeConfig({
            mode: "custom",
            customText: text,
            modeValue: text.split(/\s+/).length,
          });
        }}
      />
    </>
  );
};
