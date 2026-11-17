import React, { useEffect } from "react";
import { RotateCcw, ArrowRight, CheckCircle2 } from "lucide-react";
import { TestResultRecord } from "@/types/typing";
import { Button } from "../ui/Button";

export interface ResultsViewProps {
  result: TestResultRecord;
  onRetry: () => void;
  onNewTest: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  result,
  onRetry,
  onNewTest,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "r") {
        e.preventDefault();
        onRetry();
      } else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        onNewTest();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onRetry();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onRetry, onNewTest]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center select-none py-6 animate-in fade-in duration-300">
      {/* Top Completion Indicator */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-6">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Test Completed
      </div>

      {/* Primary Highlights */}
      <div className="grid grid-cols-2 gap-8 w-full max-w-md text-center mb-8">
        <div className="flex flex-col items-center p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200/90 dark:border-zinc-800/80 shadow-xs dark:shadow-none">
          <span className="text-5xl md:text-6xl font-mono font-bold text-amber-600 dark:text-amber-400">
            {Math.round(result.netWpm)}
          </span>
          <span className="text-xs uppercase tracking-wider text-zinc-500 font-medium mt-1">
            Net WPM
          </span>
        </div>

        <div className="flex flex-col items-center p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200/90 dark:border-zinc-800/80 shadow-xs dark:shadow-none">
          <span className="text-5xl md:text-6xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
            {Math.round(result.accuracy)}
            <span className="text-2xl text-zinc-400 font-normal ml-0.5">%</span>
          </span>
          <span className="text-xs uppercase tracking-wider text-zinc-500 font-medium mt-1">
            Accuracy
          </span>
        </div>
      </div>

      {/* Secondary Metrics Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mb-10 text-center">
        <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200/90 dark:border-zinc-800/80 shadow-xs dark:shadow-none">
          <span className="text-xs text-zinc-500 font-medium block">
            Gross WPM
          </span>
          <span className="text-lg font-mono font-semibold text-zinc-800 dark:text-zinc-200">
            {result.grossWpm}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200/90 dark:border-zinc-800/80 shadow-xs dark:shadow-none">
          <span className="text-xs text-zinc-500 font-medium block">
            Characters
          </span>
          <span className="text-lg font-mono font-semibold text-zinc-800 dark:text-zinc-200">
            <span className="text-emerald-600 dark:text-emerald-400">
              {result.correctCharacters}
            </span>
            <span className="text-zinc-400 mx-1">/</span>
            <span className="text-red-500">{result.incorrectCharacters}</span>
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200/90 dark:border-zinc-800/80 shadow-xs dark:shadow-none">
          <span className="text-xs text-zinc-500 font-medium block">
            Test Mode
          </span>
          <span className="text-lg font-mono font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
            {result.mode} {result.modeValue}
            {result.mode === "time" ? "s" : ""}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200/90 dark:border-zinc-800/80 shadow-xs dark:shadow-none">
          <span className="text-xs text-zinc-500 font-medium block">
            Time
          </span>
          <span className="text-lg font-mono font-semibold text-zinc-800 dark:text-zinc-200">
            {result.durationSeconds}s
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="primary"
          size="md"
          onClick={onNewTest}
          className="px-6"
        >
          <ArrowRight className="w-4 h-4" />
          <span>New Test</span>
          <span className="text-[11px] opacity-75 font-normal ml-1">
            (Tab / Enter)
          </span>
        </Button>

        <Button
          variant="outline"
          size="md"
          onClick={onRetry}
          className="px-5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry Same</span>
          <span className="text-[11px] opacity-60 font-normal ml-1">(Esc)</span>
        </Button>
      </div>
    </div>
  );
};
