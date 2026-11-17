import React from "react";
import { TestMetrics, TestMode, TestStatus } from "@/types/typing";

export interface LiveMetricsBarProps {
  metrics: TestMetrics;
  mode: TestMode;
  modeValue: number;
  timeDisplay: number;
  status: TestStatus;
}

export const LiveMetricsBar: React.FC<LiveMetricsBarProps> = ({
  metrics,
  mode,
  timeDisplay,
  status,
}) => {
  const isRunning = status === "running";

  return (
    <div
      className={`flex items-center gap-8 md:gap-12 lg:gap-16 xl:gap-24 transition-opacity duration-200 select-none ${
        isRunning ? "opacity-100" : "opacity-60 dark:opacity-40"
      }`}
    >
      {/* Timer / Progress */}
      <div className="flex flex-col items-center">
        <span className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-mono font-medium text-amber-600 dark:text-amber-400">
          {mode === "time" ? Math.ceil(timeDisplay) : Math.floor(timeDisplay)}
          <span className="text-base md:text-lg lg:text-xl text-zinc-400 dark:text-zinc-500 font-normal ml-0.5">
            s
          </span>
        </span>
        <span className="text-[11px] md:text-xs lg:text-sm uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold mt-1">
          {mode === "time" ? "remaining" : "elapsed"}
        </span>
      </div>

      {/* Live WPM */}
      <div className="flex flex-col items-center">
        <span className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-mono font-medium text-zinc-900 dark:text-zinc-100">
          {Math.round(metrics.netWpm)}
        </span>
        <span className="text-[11px] md:text-xs lg:text-sm uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold mt-1">
          wpm
        </span>
      </div>

      {/* Live Accuracy */}
      <div className="flex flex-col items-center">
        <span className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-mono font-medium text-zinc-900 dark:text-zinc-100">
          {Math.round(metrics.accuracy)}
          <span className="text-base md:text-lg lg:text-xl text-zinc-400 dark:text-zinc-500 font-normal ml-0.5">
            %
          </span>
        </span>
        <span className="text-[11px] md:text-xs lg:text-sm uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold mt-1">
          accuracy
        </span>
      </div>
    </div>
  );
};
