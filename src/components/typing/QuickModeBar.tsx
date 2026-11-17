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
      <div
        className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 py-2 px-3 md:px-5 rounded-xl lg:rounded-2xl bg-surface border border-border text-xs md:text-sm font-medium text-text-secondary select-none transition-all shadow-2xs ${
          disabled ? "opacity-50 pointer-events-none cursor-not-allowed" : ""
        }`}
      >
        {/* Mode Selector */}
        <div className="flex items-center gap-1">
          <button
            disabled={disabled}
            onClick={() => handleModeChange("time")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-98 ${
              config.mode === "time"
                ? "bg-accent-soft text-accent font-semibold"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary/80"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Time
          </button>

          <button
            disabled={disabled}
            onClick={() => handleModeChange("words")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-98 ${
              config.mode === "words"
                ? "bg-accent-soft text-accent font-semibold"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary/80"
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            Words
          </button>

          <button
            disabled={disabled}
            onClick={() => handleModeChange("sentence")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-98 ${
              config.mode === "sentence"
                ? "bg-accent-soft text-accent font-semibold"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary/80"
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            Sentences
          </button>

          <button
            disabled={disabled}
            onClick={() => handleModeChange("quote")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-98 ${
              config.mode === "quote"
                ? "bg-accent-soft text-accent font-semibold"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary/80"
            }`}
          >
            <Quote className="w-3.5 h-3.5" />
            Quotes
          </button>

          <button
            disabled={disabled}
            onClick={() => handleModeChange("code")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-98 ${
              config.mode === "code"
                ? "bg-accent-soft text-accent font-semibold"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary/80"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Code
          </button>

          <button
            disabled={disabled}
            onClick={() => setIsCustomModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-98 ${
              config.mode === "custom"
                ? "bg-accent-soft text-accent font-semibold"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary/80"
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            Custom
          </button>
        </div>

        <div className="w-px h-4 bg-border-strong my-auto mx-0.5" />

        {/* Sub-selectors depending on active mode */}
        {config.mode === "time" && (
          <div className="flex items-center gap-1">
            {timeOptions.map((val) => (
              <button
                key={val}
                disabled={disabled}
                onClick={() => onChangeConfig({ modeValue: val })}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer active:scale-98 font-mono ${
                  config.modeValue === val
                    ? "bg-text-primary text-surface font-semibold shadow-2xs"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary/80"
                }`}
              >
                {val}s
              </button>
            ))}
          </div>
        )}

        {config.mode === "words" && (
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-1">
              {wordOptions.map((val) => (
                <button
                  key={val}
                  disabled={disabled}
                  onClick={() => onChangeConfig({ modeValue: val })}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer active:scale-98 font-mono ${
                    config.modeValue === val
                      ? "bg-text-primary text-surface font-semibold shadow-2xs"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary/80"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>

            <div className="w-px h-3.5 bg-border-strong" />

            <div className="flex items-center gap-1">
              {(["top200", "top1000", "top5000", "advanced"] as const).map((t) => (
                <button
                  key={t}
                  disabled={disabled}
                  onClick={() => onChangeConfig({ vocabulary: t })}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer active:scale-98 ${
                    config.vocabulary === t
                      ? "bg-text-primary text-surface font-semibold shadow-2xs"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary/80"
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
                className={`px-2.5 py-1 rounded-md capitalize transition-colors cursor-pointer active:scale-98 ${
                  config.difficulty === d
                    ? "bg-text-primary text-surface font-semibold shadow-2xs"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary/80"
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
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer active:scale-98 ${
                  config.codeLanguage === l.id || (!config.codeLanguage && l.id === "typescript")
                    ? "bg-text-primary text-surface font-semibold shadow-2xs"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary/80"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}

        {config.mode === "custom" && (
          <div className="flex items-center gap-2">
            <span className="text-text-secondary">Custom passage</span>
            <button
              onClick={() => setIsCustomModalOpen(true)}
              className="text-accent underline font-medium hover:text-accent-hover cursor-pointer"
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
