import React, { useEffect, useState } from "react";
import { RotateCcw, ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";
import { TestResultRecord, TestTimelinePoint } from "@/types/typing";
import { Button } from "../ui/Button";

export interface ResultsViewProps {
  result: TestResultRecord;
  onRetry: () => void;
  onNewTest: () => void;
}

interface TimelineChartProps {
  timeline: TestTimelinePoint[];
  durationSeconds: number;
  netWpm: number;
  grossWpm: number;
}

const TimelineChart: React.FC<TimelineChartProps> = ({
  timeline,
  durationSeconds,
  netWpm,
  grossWpm,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Normalize points ensuring at least start and end
  const points: TestTimelinePoint[] =
    timeline && timeline.length >= 2
      ? timeline
      : [
          { second: 0, wpm: 0, rawWpm: 0, errors: 0 },
          {
            second: Math.max(1, Math.round(durationSeconds)),
            wpm: netWpm,
            rawWpm: grossWpm,
            errors: 0,
          },
        ];

  const maxTime = Math.max(points[points.length - 1].second, 1);
  const highestVal = Math.max(...points.map((p) => Math.max(p.wpm, p.rawWpm)), 30);
  const maxWpm = Math.ceil((highestVal + 10) / 20) * 20;

  const width = 640;
  const height = 200;
  const padLeft = 42;
  const padRight = 20;
  const padTop = 15;
  const padBottom = 30;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const getX = (second: number) => padLeft + (second / maxTime) * plotW;
  const getY = (wpm: number) => padTop + plotH - (Math.max(0, wpm) / maxWpm) * plotH;

  // Build SVG paths for Net WPM and Raw WPM
  const netPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(p.second).toFixed(1)} ${getY(p.wpm).toFixed(1)}`)
    .join(" ");

  const netAreaPath =
    points.length > 0
      ? `${netPath} L ${getX(points[points.length - 1].second).toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${getX(points[0].second).toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`
      : "";

  const rawPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(p.second).toFixed(1)} ${getY(p.rawWpm).toFixed(1)}`)
    .join(" ");

  // Y-axis grid ticks
  const yTicks = [0, Math.round(maxWpm * 0.33), Math.round(maxWpm * 0.66), maxWpm];

  // X-axis time ticks
  const timeStep = Math.max(1, Math.ceil(maxTime / 5));
  const xTicks: number[] = [];
  for (let t = 0; t <= maxTime; t += timeStep) {
    xTicks.push(t);
  }
  if (xTicks[xTicks.length - 1] !== maxTime) {
    xTicks.push(maxTime);
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relX = (mouseX / rect.width) * width - padLeft;
    const clampedRelX = Math.max(0, Math.min(plotW, relX));
    const ratio = clampedRelX / plotW;

    const approxSecond = ratio * maxTime;
    let closestIdx = 0;
    let minDiff = Infinity;
    points.forEach((p, idx) => {
      const diff = Math.abs(p.second - approxSecond);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    setHoveredIndex(closestIdx);
  };

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="w-full flex flex-col p-5 rounded-2xl bg-surface border border-border shadow-2xs mb-8">
      {/* Chart Header & Legend */}
      <div className="flex items-center justify-between mb-3 select-none">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" />
          <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">
            Performance Timeline
          </span>
        </div>

        {/* Live Hover Stats or Legend */}
        {activePoint ? (
          <div className="flex items-center gap-3 text-xs font-mono font-medium">
            <span className="text-text-secondary">{activePoint.second}s</span>
            <span className="text-accent font-bold">
              {Math.round(activePoint.wpm)} Net
            </span>
            <span className="text-text-secondary">
              {Math.round(activePoint.rawWpm)} Raw
            </span>
            {activePoint.errors > 0 && (
              <span className="text-error font-bold">
                {activePoint.errors} Err
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4 text-[11px] font-medium text-text-secondary">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-accent rounded-full" />
              <span>Net WPM</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-b-2 border-dashed border-border-strong" />
              <span>Raw WPM</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-error" />
              <span>Errors</span>
            </div>
          </div>
        )}
      </div>

      {/* SVG Line Graph */}
      <div className="w-full relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="netWpmGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines */}
          {yTicks.map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  className="text-border"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-text-muted"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Time X-axis labels */}
          {xTicks.map((t) => {
            const x = getX(t);
            return (
              <text
                key={t}
                x={x}
                y={padTop + plotH + 16}
                textAnchor="middle"
                className="text-[10px] font-mono fill-text-muted"
              >
                {t}s
              </text>
            );
          })}

          {/* Net WPM Area Fill */}
          {netAreaPath && <path d={netAreaPath} fill="url(#netWpmGrad)" />}

          {/* Raw WPM Line (Dashed) */}
          <path
            d={rawPath}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeDasharray="4 4"
            className="text-text-muted"
          />

          {/* Net WPM Line (Solid Accent) */}
          <path
            d={netPath}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Error Dots */}
          {points.map((p, i) => {
            if (p.errors <= 0) return null;
            const prevErrors = i > 0 ? points[i - 1].errors : 0;
            if (p.errors > prevErrors) {
              return (
                <circle
                  key={`err_${i}`}
                  cx={getX(p.second)}
                  cy={getY(p.wpm)}
                  r="3.5"
                  className="fill-error stroke-surface"
                  strokeWidth="1.5"
                />
              );
            }
            return null;
          })}

          {/* Hover Crosshair & Indicators */}
          {activePoint && (
            <g>
              <line
                x1={getX(activePoint.second)}
                y1={padTop}
                x2={getX(activePoint.second)}
                y2={padTop + plotH}
                stroke="currentColor"
                strokeDasharray="3 3"
                className="text-border-strong"
              />
              <circle
                cx={getX(activePoint.second)}
                cy={getY(activePoint.rawWpm)}
                r="3.5"
                className="fill-text-muted stroke-surface"
                strokeWidth="1.5"
              />
              <circle
                cx={getX(activePoint.second)}
                cy={getY(activePoint.wpm)}
                r="4.5"
                className="fill-accent stroke-surface"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

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
    <div className="w-full max-w-3xl lg:max-w-4xl mx-auto flex flex-col items-center select-none py-6 animate-in fade-in duration-300">
      {/* Top Completion Indicator */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success-soft text-success text-xs font-semibold mb-6">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Test Completed
      </div>

      {/* Primary Highlights */}
      <div className="grid grid-cols-2 gap-6 md:gap-8 w-full max-w-md text-center mb-6">
        <div className="flex flex-col items-center p-6 rounded-2xl bg-surface border border-border shadow-2xs">
          <span className="text-5xl md:text-6xl font-mono font-bold text-accent tabular-nums">
            {Math.round(result.netWpm)}
          </span>
          <span className="text-xs uppercase tracking-wider text-text-secondary font-medium mt-1">
            Net WPM
          </span>
        </div>

        <div className="flex flex-col items-center p-6 rounded-2xl bg-surface border border-border shadow-2xs">
          <span className="text-5xl md:text-6xl font-mono font-bold text-metric-value tabular-nums">
            {Math.round(result.accuracy)}
            <span className="text-2xl text-text-muted font-normal ml-0.5">%</span>
          </span>
          <span className="text-xs uppercase tracking-wider text-text-secondary font-medium mt-1">
            Accuracy
          </span>
        </div>
      </div>

      {/* Phase 6 / User Request: Performance Line Graph Chart */}
      <TimelineChart
        timeline={result.timeline || []}
        durationSeconds={result.durationSeconds}
        netWpm={result.netWpm}
        grossWpm={result.grossWpm}
      />

      {/* Secondary Metrics Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mb-8 text-center">
        <div className="p-3.5 rounded-xl bg-surface border border-border shadow-2xs">
          <span className="text-xs text-text-secondary font-medium block">
            Gross WPM
          </span>
          <span className="text-lg font-mono font-semibold text-text-primary tabular-nums">
            {result.grossWpm}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface border border-border shadow-2xs">
          <span className="text-xs text-text-secondary font-medium block">
            Characters
          </span>
          <span className="text-lg font-mono font-semibold text-text-primary tabular-nums">
            <span className="text-success">
              {result.correctCharacters}
            </span>
            <span className="text-border-strong mx-1">/</span>
            <span className="text-error">{result.incorrectCharacters}</span>
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface border border-border shadow-2xs">
          <span className="text-xs text-text-secondary font-medium block">
            Test Mode
          </span>
          <span className="text-lg font-mono font-semibold text-text-primary capitalize">
            {result.mode} {result.modeValue}
            {result.mode === "time" ? "s" : ""}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface border border-border shadow-2xs">
          <span className="text-xs text-text-secondary font-medium block">
            Time
          </span>
          <span className="text-lg font-mono font-semibold text-text-primary tabular-nums">
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
          <span className="text-[11px] opacity-80 font-normal ml-1">
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
          <span className="text-[11px] text-text-muted font-normal ml-1">(Esc)</span>
        </Button>
      </div>
    </div>
  );
};
